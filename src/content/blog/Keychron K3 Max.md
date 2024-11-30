---
title: My Keymap Configuration and Shortcuts
description: Configuring keymaps and shortcuts for the Keychron K3 Max keyboard on Windows.
pubDatetime: 2024-11-30T00:00:00Z
modDatetime: 2024-11-30T00:00:00Z
tags:
  - others
---

I often navigate using shortcuts like Ctrl+B, Ctrl+F, Ctrl+N, and Ctrl+P on macOS. Unfortunately, Windows lacks equivalent shortcuts.
It’s frustrating that Windows only offers the Win, Ctrl, and Alt keys as modifiers, with the Win key barely utilized.

One feature I love about macOS is its versatile modifier keys: Cmd, Opt, and Ctrl. This allows for a wider variety of shortcuts.

Before owning a QMK/VIA-compatible keyboard, I relied on keymapping software and AutoHotKey to replicate these shortcuts on Windows. However, I recently bought a Keychron K3 Max, which officially supports QMK/VIA.

## Config

The offical tool:
<https://launcher.keychron.com/>

Here is my keymap config for Keychron K3 Max.
<https://gist.github.com/iucario/514d2829f8a300ae58715e7f6ad8ced4>

In my setup, I’ve set the CapsLock key as a layer key because I use it as the Ctrl key on my MacBook as well.

MacOS
![MacOS Layer 1](<../../assets/images/keychron layer 0.webp>)
![MacOS Layer 2(With `FN` pressed)](<../../assets/images/keychron layer 1.webp>)

Windows
![Windows Layer 1](<../../assets/images/keychron layer 2.webp>)
![Windows Layer 2(With `FN` pressed)](<../../assets/images/keychron layer 3.webp>)

## Shortcuts

After configuring, here are the key shortcuts I use across both macOS and Windows:

Navigation:
- Ctrl+B → Left
- Ctrl+F → Right
- Ctrl+N → Down
- Ctrl+P → Up

Editing:
- Ctrl+K → Delete to the end of line
- Ctrl+H → Delete left character
- Ctrl+D → Delete right character