---
title: Palworld Dedicated Server Deployment
description: Palworld dedicated server and co-op saves convertion. 
pubDatetime: 2026-07-19
modDatetime: 2026-07-19
tags:
  - Game
---

Palworld document:
<https://docs.palworldgame.com/getting-started/deploy-dedicated-server/>

Need a server so that my friends can play the game even when I am not running the game and hosting.
Tailscale was the first choice. However, it's difficult to help non-engineer friends in China set up Tailscale and additional VPN. So I gave up Tailscale.

This blog post details how I installed and configured a Palworld server that can back up and restore save files and starts up automatically at boot.

## Saves Converter

<https://hub.tcno.co/games/palworld/converter/>

It can convert between dedicated server and co-op saves.

If you find that the fog of war isn't working properly after the conversion, you can copy the `LocalData.sav` file from your current save to the new world save.
The file is located at: `%AppData%\Local\Pal\Saved\SaveGames\<user ID>\<world ID>\`.

## GCP Spot VM

Chose GCP spot VM. Because we don't require it to be 100% reliable and it's much cheaper than on-demand.
Even if GCP terminates the instance, the data on the disk is preserved. All saved data remains intact and can be used again later.
I used AWS spot EC2 several years ago and AWS didn't preserve the disks if I recall correctly.

Two players. 2 cores + 8GB memory VM is sufficient. The memory can be trimmed down to 6GB to save more money.

## Installation

### Steam

<https://developer.valvesoftware.com/wiki/SteamCMD#Linux>

Manually installation.

```sh
sudo apt-get install lib32gcc-s1
```

Run steam as a non-root user:

```sh
sudo useradd -m steam
sudo passwd steam

sudo -u steam -s
cd /home/steam
```

```sh
mkdir ~/Steam && cd ~/Steam
curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz" | tar zxvf -
```

Or

Debian Trixie — no `apt-add-repository` (Ubuntu-only). Enable `non-free` manually.
It didn't work for me didn't know why.

```bash
sudo dpkg --add-architecture i386
echo "deb http://deb.debian.org/debian trixie main contrib non-free non-free-firmware" \
  | sudo tee /etc/apt/sources.list.d/non-free.list
sudo apt update
sudo apt install steamcmd
```

### Palworld Server Installation

I installed the steamcmd binary so using `steamcmd.sh`.
Install and upatde:

```sh
./steamcmd.sh +@sSteamCmdForcePlatformType linux \
  +force_install_dir /home/steam/palworld \
  +login anonymous \
  +app_update 2394010 validate \
  +quit
```

## Run

Follow the Palworld documentation. Palworld server config:

```sh
# copy default ini here
vi Pal/Saved/Config/LinuxServer/PalWorldSettings.ini
```

Start:

```sh
nohup ./palworld/PalServer.sh -port=8211 -players=4 -logformat=text > ~/palserver.log 2>&1 &
```

Stop:

```sh
pkill -f PalServer
```

## SSH

```sh
gcloud config set project $PROJ
gcloud config set compute/zone asia-northeast1-c
```

Start my VM named `pal`:

```sh
gcloud compute instances start pal
gcloud compute ssh pal 
```

```sh
su - steam
bash
```

## Backup and Restore

Create a bucket. Mine is `pal-saves-backup`.

`gcloud storage buckets create gs://pal-saves-backup --project=$PROJ --location=$ZONE`

Install the required `zip` and `unzip`.

### Backup

Set up a cron job to run every 10 minutes to back up the saves folder:

```sh
#!/bin/bash
set -e

ZIP=/tmp/saves_$(date +%Y%m%d_%H%M%S).zip
BUCKET=gs://pal-saves-backup/saves/

cd /home/steam/palworld/Pal/Saved
zip -rq "$ZIP" SaveGames

gcloud storage cp "$ZIP" "$BUCKET"
rm -f "$ZIP"
```

crontab -e

`*/10 * * * * /home/steam/backup.sh`

### Restore

I never had to use the restore script because the disk was preserved.

`~/restore-saves.sh` — restores latest backup (or pass a timestamp to pick one).

```sh
#!/bin/bash
set -e

SAVED_DIR=/home/steam/palworld/Pal/Saved
SAVES=$SAVED_DIR/SaveGames
BUCKET=gs://pal-saves-backup/saves/

if [ -n "$1" ]; then
  FILE=$(gcloud storage ls "$BUCKET" | grep "$1" | tail -1)
else
  FILE=$(gcloud storage ls "$BUCKET" | tail -1)
fi

[ -z "$FILE" ] && { echo "No backup found"; exit 1; }

echo "Restoring: $FILE"

pkill -f PalServer || true

TMP=$(mktemp -d)
gcloud storage cp "$FILE" "$TMP/backup.zip"

rm -rf "$SAVES"
unzip -oq "$TMP/backup.zip" -d "$SAVED_DIR"

rm -rf "$TMP"

echo "Done"
```

Usage:

```sh
bash ~/restore-saves.sh              # latest
bash ~/restore-saves.sh 20260713_09  # specific time
```

## Systemctl

Add palserver.service to Systemctl to have the server atuo started on server startup.

`/etc/systemd/system/palserver.service`

```txt
[Service]
User=steam
WorkingDirectory=/home/steam

ExecStart=/bin/bash -c '/home/steam/palworld/PalServer.sh -port=8211 -players=4 -logformat=text'

Restart=always
RestartSec=10

KillSignal=SIGTERM
TimeoutStopSec=30
```

```sh
sudo systemctl daemon-reload
sudo systemctl enable palserver
sudo systemctl start palserver
```

After finishing all the step, I can start and stop the server for my friends on my phone.
Sometimes the IP of the spot VM changes but not a big problem. I can make the IP static if I want.
