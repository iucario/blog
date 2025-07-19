---
title: Setting Up A New Mac
slug: setting-up-a-new-mac
description: Softwares, tools and config files to install on a new MacBook
pubDatetime: 2025-04-14
modDatetime: 2025-04-14
tags:
    - Macbook
    - tool
---

## Software

Download from official sites

- 1password
- iTerm2
- Homebrew
- Oh-My-Zsh
- Rectangle
- Notion
- VSCode
- Discord
- Arc
- Chrome

App Store

- Xcode
- OneDrive
- LocalSend
- Infuse

## Homebrew

Softwares that can be installed via Homebrew

```bash
brew install obsidian \
  firefox \
  scroll-reverser \
  monitorcontrol

brew install mpv --cask
```

## Config

Dotfiles

```bash
gh repo clone dotfiles
cd dotfiles
./install
```

## Develop

```bash
brew install gh go golangci-lint tlrc

brew install python@3.13

brew install fish starship

brew install docker colima
```

## Fonts

```bash
brew install font-0xproto font-iosevka-nerd-font font-geist-mono \
  font-inconsolata-lgc-nerd-font font-jetbrains-mono \
  font-sofia-sans font-noto-sans-jp font-noto-sans-sc \
  font-adwaita font-symbols-only-nerd-font
```

Maple font mono nerd font Chinese. Build and download from official site with my preferences.
<https://font.subf.dev/en/playground/>

SF mono and SF pro <https://developer.apple.com/fonts/>
