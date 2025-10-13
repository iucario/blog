---
title: Linux Cheat Sheet
slug: linux-cheat-sheet
pubDatetime: 2025-10-02
modDatetime: 2025-10-02
draft: false
description: Daily Linux commands
tags:
  - Linux
  - Command-Line
---

## Links

"The art of command line" should have included most essential commmands.
<https://github.com/jlevy/the-art-of-command-line>

"Linux Productivity Tools" by Ketan M.
<https://www.olcf.ornl.gov/wp-content/uploads/2019/12/LPT_OLCF.pdf>

Plus all kinds of cheatsheets online. <https://tmuxcheatsheet.com/>

You would thank [shellcheck](https://www.shellcheck.net/).

## My Tips

I don't think there is any meaning memorising all the commands and options. I learn the commands when I use them. I forget if I don't touch them for a long time.

On top of that, why would I bother when I have handy tools like `tldr`, `cheat.sh` and `man`.

The really important commands you should remember are:

```sh
brew install tlrc
tldr tar
# or
curl cht.sh/tar
# or
man tar
```

## Commands

File

- `grep <pattern> <file>`
- `zcat <file.gzip>`
- `zless <file.gzip>`
- `head/tail -n 10`
- `tail -f <file>`
- `scp <server:path> <dest>`
- `du -sh <path> | sort -h`
- `cat <file> | tr '\n' ';'`
- `sed` tldr
- `tee`
- `find . -maxdepth 1 -type f -exec wc -l {} \;`
- `cmd > log.txt 2>&1` redirect stderr and stdout to log.txt
- `split --number 2 <file>` Used one time when I have to split a 10G file into under 1G per file.

I can spend a section on `sed` and `awk` and more on `find`. But I will probably ask AI when I want to use them.

File permisson:

```none
# user group other
-rwxrwxrwx
# directory
drwxrwxrwx
```

SSH

- `ssh-keygen -t ed25519 -a 32 -f ~/.ssh/id_ed25519 -C "comment"`

Bash

- `set -euo pipefail` exit immediately if a command exits with non-zero status.
- `history`
- Heredoc

  ```sh
  cat << EOF
  line 1
  line 2
  EOF
  ```

System

- `top`
- `ps aux`
- `lsof -i :8080`
- `lsof -p <PID> | wc -l` check number of file descriptors.
- `lshw`
- `df`
- `free --human` Show free memory
- `uname -a` details about the current machine and the operating system
- `lsb_release -a`
- `uptime`
- `w` Show who is logged on and what they are doing.
- `hostname`
- `nohup <script.sh> &`
- `jobs`
- `kill <pid>`
- `sudo nvme smart-log <device>`. Checking the SSD status. Probably the last thing to confirm when a database was down.
- `systemctl status <service>`

Network

- `host <domain> <dns>`
- `ufw` Uncomplicated Firewall
- `ip addr`
- `dig example.com`
- `netstat -tuln`

DNS file: `/etc/resolv.conf`

## Notes

An inode stores all metadata about a file, _except_ for the filename.

Hard links:

- Only link to a file, not a directory
- Can't reference a file on a different disk/volume
- Links will reference a file even if it is moved
- Links reference inode/physical locations on the disk

Symbolic (soft) links:

- Can link to directories
- Can reference a file/folder on a different hard disk/volume
- Links remain if the original file is deleted
- Links will NOT reference the file anymore if it is moved
- Links reference abstract filenames/directories and NOT physical locations.
- They have their own inode
