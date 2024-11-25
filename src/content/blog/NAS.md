---
title: My first NAS
description: My first NAS. And It's great.
pubDatetime: 2024-12-01T00:00:00Z
modDatetime: 2024-12-01T00:00:00Z
tags:
  - others
draft: true
---

# My first NAS

QNAP TS464C

What do I use it for?

Media server. Storage.
Not touching remote access now. I have no need for that.

I have not met a power outage ever in Japan for the past 4 years. So I don't worry much about power. I don't save valuable files only on NAS anyway. A UPS is not in urgent need.

## Why do I need a NAS?

One reason is the conflict between filename requirements for media server organization and seeding. It can be tedious to rename files in qBittorrent to meet Plex scanner rules. It’s time to separate seeding files and media server libraries.

On Windows, I can hard link files in batch to achieve this. But the command is a script in cmd.exe. On Linux and Mac symlink files are even easier. But I don't want to bother it. I need a large storage anyway.

## QNAP Terminal Commands

`uname -a`

`busybox`

`poweroff`
`reboot`
`free -m`

Why entware is being recommended? I can download softwares directly. What is the advantage?

## Script For Renaming Subtitle Files

Add `.chi` before `.srt` so that Plex can recognize these as Chinese subtitles

```bash
#!/bin/bash

for file in *.srt; do
  if [[ -e "$file" ]]; then
    # Rename the file by inserting .chi before .srt
    new_name="${file%.srt}.chi.srt"
    echo "Renaming '$file' to '$new_name'"
    mv "$file" "$new_name"
  fi
done

echo "Renaming complete!"
```
