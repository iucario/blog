---
title: Minecraft Quick Setup Manual
description: Minecraft with my favorite mods on AWS spot instances. Quick setup manual.
pubDatetime: 2025-06-22
modDatetime: 2025-06-22
tags:
  - gaming
  - minecraft
---

Occasionally I play minecraft with friends. To save money I run the server on AWS spot instance with backups from S3 or local.

The blog documents the setup process for my own reference.

## Common Steps

Change time zone to Tokyo

`sudo ln -sf /usr/share/zoneinfo/Japan /etc/localtime`

## Fabric Server

seed 6443427340231861795

Install dependencies

```sh
sudo apt update;
sudo apt upgrade -y;
sudo apt install -y openjdk-21-jdk;
sudo apt install -y unzip zip;
sudo ln -sf /usr/share/zoneinfo/Japan /etc/localtime
```

```sh
mkdir mc;
cd mc;
curl -OJ https://meta.fabricmc.net/v2/versions/loader/1.20.6/0.15.11/1.0.1/server/jar;
java -Xmx4G -jar fabric-server-mc.1.20.6-loader.0.15.11-launcher.1.0.1.jar nogui;
sed -i '/eula=false/c\eula=true' eula.txt;
```

`scp ~/mc/1.20.6/world-2024-07-09T20-26-23Z.zip aws:~`

`unzip ~/world-2024-07-09T20-26-23Z.zip`

Create backup script

```sh
touch backup.sh;
chmod u+x backup.sh;
echo 'name=world-$(date +"%Y-%m-%dT%H-%M-%SZ").zip' >> backup.sh;
echo 'zip -q $name -r world && echo "saved to $name" || echo "Zip failed"' >> backup.sh;
```

### Mods

`scp -r ~/fabric-server/1.20.6/mods aws:~/mc/`

#### Mod List

```text
[JEI 物品管理器] jei-1.20.6-fabric-18.0.0.62.jar
[Xaero 的世界地图] XaerosWorldMap_1.38.8_Fabric_1.20.6.jar
[Xaero 的小地图] Xaeros_Minimap_24.2.0_Fabric_1.20.6.jar
[一键背包整理 Next] InventoryProfilesNext-fabric-1.20.6-2.0.2.jar
[失落废墟] AdditionalStructures-1.20.x-(v.4.2.1).jar
[旅行者背包] travelersbackpack-fabric-1.20.6-9.6.4.jar
[玉 🔍] Jade-1.20.6-Fabric-14.2.4.jar
[自然罗盘／生物群系指南针] NaturesCompass-1.20.6-2.2.5-fabric.jar
[苹果皮] appleskin-fabric-mc1.20.5-3.0.2.jar
[超多生物群系] BiomesOPlenty-fabric-1.20.6-18.4.0.8.jar
[键位冲突显示] Controlling-fabric-1.20.6-17.0.1.jar
GlitchCore-fabric-1.20.6-1.1.0.10.jar
Searchables-fabric-1.20.6-1.0.1.jar
TerraBlender-fabric-1.20.6-3.5.0.5.jar
architectury-12.1.3-fabric.jar
cardinal-components-api-6.0.0.jar
cloth-config-14.0.126-fabric.jar
cristellib-fabric-1.2.5.jar
fabric-api-0.100.0+1.20.6.jar
fabric-language-kotlin-1.11.0+kotlin.2.0.0.jar
ftb-essentials-fabric-2006.1.1.jar
ftb-library-fabric-2006.1.2.jar
libIPN-fabric-1.20.6-6.0.0.jar
t_and_t-1.13.1.jar
```

### Start Server

Better use tmux

```sh
tmux
java -Xmx4G -jar fabric-server-mc.1.20.6-loader.0.15.11-launcher.1.0.1.jar nogui
```

## Forge Server

6G memory is totally enough.

Server

1. Download forge installer
2. Install server
3. Install JDK 17
   `apt install openjdk-17-jdk`
4. Install forge server
   `java -jar forge-xxx.jar -installServer`
5. Set eula=true
   `sed -i '/eula=false/c\eula=true' eula.txt`
6. `java -Xmx6G -Xms6G -jar forge-xxx.jar --nogui`

Create an crontab job to upload to S3 maybe.

seed: 851437854892900405

## Vanilla Server

1. Download server jar
   <https://www.minecraft.net/en-us/article/minecraft-java-edition-1-20-6>
2. Install Java `sudo apt install -y default-jre`
3. InitSettings `java -jar server.jar --initSettings`
4. Edit eula.txt
5. `java -Xmx6G -Xms6G -jar server.jar --nogui`

### Backup from world.zip

```sh
unzip world-xxx.zip
```

### Server User Script

```sh
sudo apt update
sudo apt install openjdk-17-jdk
sudo apt install zip
sudo ln -sf /usr/share/zoneinfo/Japan /etc/localtime
```

## Mods Notes

### Lostcities

<https://legacy.curseforge.com/minecraft/mc-mods/the-lost-cities>

The server configuration is tricky, so you need to copy the local configuration. Then set `level-type=lostcities` in `server.properties`.

## 1.16.5 End Traveller

### Bugs

Witnessing the player's death will crash the game. Speculated to be related to the drop.

If you stand on the Zombie Extreme cargo rack for a few seconds, you will be judged as floating. It will prompt you that flying is not enabled on the server and you will be kicked out of the game.

KALE
Waiting for scan to complete
Loading mods
Building Mod List
Constructing 107 mods

### Config

The _blood moon_ is very short, I don't know what went wrong.

_Born in chaos_ creates diamond mine infested by insects. It's a bit discouraging, turn it off.

There should be a recipe for _tac_ bullets, it's not fun if they can not be forged.
