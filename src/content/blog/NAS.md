---
title: My first NAS
description: QNAP TS464C. My first NAS. And It's great.
pubDatetime: 2025-01-20T00:00:00Z
modDatetime: 2025-01-20T00:00:00Z
tags:
  - gadget
  - hardware
---

QNAP TS464C

Bought from China. Can't believe the sum of price + shipping fee was still significantly cheaper than buying it in Japan.

What do I use it for?

Primarily as a media server and for storage.
Not touching remote access now. I don't need it.

As for UPS. I have not met a power outage ever in Japan for the past 4 years. So I don't worry much about power outages. I don't save valuable files only on NAS anyway. A UPS is not in urgent need.

## Why do I need a NAS?

One reason is the conflict between filename requirements for media server organization and seeding. It can be tedious to rename files in qBittorrent to meet Plex scanner rules.
It’s time to separate seeding files and media server libraries.

On Windows, I can hard link files in batch to achieve this. But the command is a script in cmd.exe.
On Linux and Mac symlink files are even easier. But I don't want to bother it. I need a large storage anyway.

## QNAP Terminal Commands

The commands are really limited. Even missing many essential tools.

Some handy commands:
`uname -a`
`busybox`
`poweroff`
`reboot`
`free -m`

Change mod to 755 for all folders in current directory. To hide the background colors of the folders copied from Windows.\
`find . -type d -exec chmod 755 {} +`

Why entware is being recommended? I can download softwares directly. What is the advantage?

## Installing Essentials

Download Python 3 and Oh my zsh from QNAP app center.

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

Git and ZSH can be install from third party App repository: MyQNAP Repo.

Do remember to add `export TERM=XTERM` to `.zshrc`. Or the Backspace and many keys will not work. Seems to be some problem caused by colors.

## Script For Regex Renaming

With Python3 installed I can do a lot of things.

An example of adding a ".chi" before ".srt" so that Plex can recognize them as Chinese subtitles.

`python3 ~/rename.py /tmp '(.*).srt' '\1.chi.srt' --dry-run`

```py
import os
import re
import sys
import argparse

# Set up argument parser
parser = argparse.ArgumentParser(description="Rename files in a directory using regex and output pattern.")
parser.add_argument("directory", help="The directory containing files to rename.")
parser.add_argument("regex_pattern", help="Regex pattern to extract parts of filenames.")
parser.add_argument("output_pattern", help="Output pattern for renaming files, using placeholders like \\1, \\2.")
parser.add_argument("--dry-run", "-d", action="store_true", help="Preview the changes without renaming files.")

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
for filename in os.listdir(directory):
    file_path = os.path.join(directory, filename)
    match = regex.match(filename)
    if match:
        try:
            new_name = re.sub(regex_pattern, output_pattern, filename)
        except re.error as e:
            print(f"Error in re.sub: {e}")
            sys.exit(1)

        new_path = os.path.join(directory, new_name)

        if dry_run:
            print(f"Dry Run: rename '{file_path}' to '{new_path}'")
        else:
            os.rename(file_path, new_path)
            print(f"Renamed: {file_path} -> {new_path}")
```
