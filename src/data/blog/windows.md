---
title: Windows Setup
pubDatetime: 2025-11-16
modDatetime: 2025-11-16
draft: true
description: Customize Powershell, essential Windows softwares, etc.
tags:
  - Windows
  - Powershell
  - Winget
  - WSL
---

Install oh-my-posh <https://ohmyposh.dev/>

```sh
winget install --id Git.Git -e --source winget
winget install --id GitHub.cli
winget install --id xanderfrangos.twinkletray
winget install --id vim.vim
winget install --id Microsoft.PowerToys --source winget
winget install -e --id LocalSend.LocalSend
```

Add alias. `vim $profile`

```sh
New-Alias vi vim
```

## Font

Save me from the horrible Windows font rendering.

Chinese Japanese fonts:
[Sarasa Gothic](https://github.com/be5invis/Sarasa-Gothic), Noto Sans SC, Noto Sans JP, Maple Mono.
