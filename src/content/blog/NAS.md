---
title: My first NAS
description: My first NAS. And It's great.
pubDatetime: 2024-12-01T00:00:00Z
modDatetime: 2024-12-01T00:00:00Z
tags:
  - others
draft: true
---

QNAP TS464C

Bought from China. Can't believe the sum of price + shipping fee was still significantly cheaper than buying it in Japan.

What do I use it for?

Primarily as a media server and for storage.
Not touching remote access now. I don't need it.

As for UPS. I have not met a power outage ever in Japan for the past 4 years. So I don't worry much about power outages. I don't save valuable files only on NAS anyway. A UPS is not in urgent need.

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

## Installing Essentials

Download Python 3 and Oh my zsh from QNAP app center.

SSH to an admin account.

Follow the guide to enable Python. <https://www.qnap.com/en/how-to/faq/article/how-to-run-python-3-on-the-nas>

I prefer more explicit commands:
```bash
_PYTHON3_QPKG_ROOT=$(/sbin/getcfg "Python3" Install_Path -f /etc/config/qpkg.conf)
_PYTHON3_QPKG_BIN="${_PYTHON3_QPKG_ROOT}/opt/python3/bin"
/bin/ln -sf "${_PYTHON3_QPKG_BIN}/python3" "${_PYTHON3_QPKG_BIN}/python"

echo 'PATH=$PATH:'$_PYTHON3_QPKG_BIN >> .zshrc
source .zshrc

python3 --version
```

Git and ZSH can be install from third party App repository: MyQNAP Repo.

Do remember to add `export TERM=XTERM` to `.zshrc`. Or the Backspace and many keys will not work. Seems to be some problem caused by colors.

## Script For Regex Renaming

An example of adding a ".chi" before ".srt" so that Plex can recognize them as Chinese subtitles.

`./rename.sh /tmp (.*).srt $1.chi.srt --dry-run`

```bash
#!/bin/bash

# Function to display usage
usage() {
    echo "Usage: $0 <directory> <regex_pattern> <output_pattern> [--dry-run | -d]"
    echo "  <directory>       The directory containing files to rename."
    echo "  <regex_pattern>   Regex pattern to extract parts of filenames."
    echo "  <output_pattern>  Output pattern for renaming files."
    echo "                    Use placeholders like \1, \2 for captured groups."
    echo "  --dry-run, -d     Preview the changes without renaming files."
    exit 1
}

# Check if at least three arguments are provided
if [ "$#" -lt 3 ]; then
    usage
fi

DIRECTORY="$1"
REGEX="$2"
OUTPUT_PATTERN="$3"
DRY_RUN=false

# Check for optional dry-run argument
if [ "$#" -eq 4 ]; then
    if [ "$2" == "--dry-run" ] || [ "$2" == "-d" ]; then
        DRY_RUN=true
    else
        usage
    fi
fi

# Check if the directory exists
if [ ! -d "$DIRECTORY" ]; then
    echo "Error: Directory $DIRECTORY does not exist."
    exit 1
fi


for FILE in "$DIRECTORY"/*.mp4; do
    # Extract parts using regex
    if [[ "$FILE" =~ $REGEX ]]; then
        NEW_NAME="$OUTPUT_PATTERN"

        # Replace $1, $2, etc., with captured groups
        for ((i=1; i<${#BASH_REMATCH[@]}; i++)); do
            NEW_NAME=${NEW_NAME//\$$i/${BASH_REMATCH[i]}}
        done
        
        if [ "$DRY_RUN" = true ]; then
            echo "Dry Run: rename '$FILE' to '$NEW_NAME'"
        else
            mv "$FILE" "$DIRECTORY/$NEW_NAME"
            echo "Renamed: $FILE -> $NEW_NAME"
        fi
    else
        echo "Filename does not match the expected pattern."
        exit 1
    fi
done
```