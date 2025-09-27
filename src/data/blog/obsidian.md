---
title: Obsidian
pubDatetime: 2025-09-23
modDatetime: 2025-09-27
draft: true
description: My Obsidian plugins and config
tags:
  - markdown
  - note
  - Obsidian
---

## Custom CSS

`.obsidian/snippets/custom.css`

Custom line width. The default line width was too narrow so I made it wider.

```css
.workspace {
  --file-line-width: 50rem;
}
```

It has to be `rem` not `em` or the code block line width would be inconsistent.

## Plugins

[Obsidian Linter](https://github.com/platers/obsidian-linter)

Essential plugin.

The feature that it adds spaces between Latin and CJK characters automatically was contributed by me.

## How I Use Obisidian

I've tried several note-taking apps before and finally settled on Obsidian, which has all the basic features for taking notes in Markdown.

I don't like WYSIWYG(What You See Is What You Get) editors.
The frist thing I do is setting the Default editing mode to Source mode. I switch to reading view when I want to read.

I put the Obsidian folder in my OneDrive so it can be synchronized.

VSCode is also an excellent Markdown editor. The user experience is seamless when switching between Obsidian and VSCode.
