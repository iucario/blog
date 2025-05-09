---
title: QNAP TS464C
description: My first NAS. And It's great. Just do use a hard disk dedicated for NAS
pubDatetime: 2025-02-10
modDatetime: 2025-05-09
tags:
  - gadget
  - hardware
---

QNAP TS464C\
Bought from China. Can't believe the sum of price + shipping fee was still significantly cheaper than buying it in Japan.

## Before Anything

Buy a hard disk dedicated for NAS.

My hard disk died after serving 5 months. It was for desktops but I let it run 24/7 in my NAS.
It was a 8TB Seagate BarraCuda. I should have bought a Seagate Ironwolf level or above disk.

## Why do I need a NAS?

One reason is the conflict between filename requirements for media server organization and seeding. It can be tedious to rename files in qBittorrent to meet Plex scanner rules.
It's time to separate seeding files and media server libraries.

On Windows, I can hard link files in batch to achieve this. But the command is a script in cmd.exe.
On Linux and Mac symlink files are even easier. But I don't want to bother it. I need a large storage anyway.

What do I use it for?

Primarily as a media server and for storage.
Not touching remote access now. I don't need it.

As for UPS. I have not met a power outage ever in Japan for the past 4 years. So I don't worry much about power outages. I don't save valuable files only on NAS anyway. A UPS is not in urgent need.

## QNAP Terminal Commands

The commands are really limited. Even missing many essential tools.

Change mod to 755 for all folders in current directory. To hide the background colors for folders copied from Windows.

`find . -type d -exec chmod 755 {} +`

## Installing Essentials

Download from QNAP app center.

- Python 3
- Oh my zsh
- Git

Git and ZSH can be install from third party App repository: MyQNAP Repo.

### Zsh

After installing OMZ, run `zsh`, the prompt became: `[\u@\h \W]\$`. `.zshrc` was empty. Have to go to <https://ohmyz.sh/#install>.

Do remember to add `export TERM=XTERM` to `.zshrc`. Or the Backspace and many keys will not work. Seems to be some problem caused by colors.

### Python

SSH to an admin account.

Follow the guide to enable Python.
<https://www.qnap.com/en/how-to/faq/article/how-to-run-python-3-on-the-nas>

I prefer more explicit commands:

```bash
_PYTHON3_QPKG_ROOT=$(/sbin/getcfg "Python3" Install_Path -f /etc/config/qpkg.conf)

_PYTHON3_QPKG_BIN="${_PYTHON3_QPKG_ROOT}/opt/python3/bin"

/bin/ln -sf "${_PYTHON3_QPKG_BIN}/python3" "${_PYTHON3_QPKG_BIN}/python"

echo 'PATH=$PATH:'$_PYTHON3_QPKG_BIN >> .zshrc
source .zshrc

python3 --version
```

## Script For Regex Renaming

An example of adding a ".chi" before ".srt" so that Plex can recognize them as Chinese subtitles.

`python3 ~/rename.py /tmp '(.*).srt' '\1.chi.srt' --dry-run`

Patterns for renaming most videos\
Input: `.*\[(\d\d)\].*(mkv|ass)`\
Output: `Anime.S01E\1.\2`

```py
import os
import re
import sys
import argparse

# Set up argument parser
parser = argparse.ArgumentParser(description="Rename files in a directory using regex.")
parser.add_argument("directory", help="The directory containing files")
parser.add_argument("regex_pattern", help="Regex pattern for input")
parser.add_argument("output_pattern", help="Output pattern, use placeholders like \\1, \\2.")
parser.add_argument("-d", "--dry-run", action="store_true", help="Preview the changes")

args = parser.parse_args()

# Assign arguments to variables
directory = args.directory
regex_pattern = args.regex_pattern
output_pattern = args.output_pattern
dry_run = args.dry_run

# Check if the directory exists
if not os.path.isdir(directory):
    print(f"Error: Directory {directory} does not exist.")
    sys.exit(1)

# Compile the regex pattern
try:
    regex = re.compile(regex_pattern)
except re.error as e:
    print(f"Error: Invalid regex pattern. {e}")
    sys.exit(1)

# Iterate over files in the directory
for filename in sorted(os.listdir(directory)):
    match = regex.match(filename)
    if not match:
        continue

    try:
        new_name = re.sub(regex_pattern, output_pattern, filename)
    except re.error as e:
        print(f"Error in re.sub: {e}")
        sys.exit(1)

    new_path = os.path.join(directory, new_name)

    file_path = os.path.join(directory, filename)
    if dry_run:
        print(f"Dry Run: rename '{file_path}' to '{new_path}'")
    else:
        os.rename(file_path, new_path)
        print(f"Renamed: {file_path} -> {new_path}")
```
