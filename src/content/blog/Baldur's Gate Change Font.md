---
title: Baldur's Gate 3 Changing Font
description: Change the font of Baldur's Gate 3. Super easy.
pubDatetime: 2024-11-09T00:00:00Z
modDatetime: 2024-11-09T00:00:00Z
tags:
  - Gaming
---

# Baldur's Gate Changing Font

Download mod from NexusMods
https://www.nexusmods.com/baldursgate3/mods/775

Copy the "Public" folder and paste it inside of your `Baldur's Gate 3\Data`

Put your custom font files in `Baldurs Gate 3\Data\Public\Game\GUI\Assets\Fonts\Replacers`

Open the XAML file:
`Baldurs Gate 3\Data\Public\Game\GUI\Theme\Keyboard.Fonts.xaml`
And modify this line

```xml
<FontFamily x:Key="DefaultFont">/Assets/Fonts/Replacers/#ZhunYuan</FontFamily>
```

Make sure the font name is the same as the actual name of the file. The config does not recognize Chinese font names it seems.

I am using ZhunYuan and it looks like this in game:
![Baldur's Gate Screenshot](../../assets/images/baldurs%20gate.jpg)

[LXGW Wenkai](https://github.com/lxgw/LxgwWenKai) also looks realy good in game.
Any font is better than SongTi which is the default Chinese font.