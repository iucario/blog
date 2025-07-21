---
title: First Post
author: iucario
pubDatetime: 2024-11-04
modDatetime: 2024-11-04
slug: first-post
featured: false
draft: false
description: Setting up my blog again
---

Using Astro Paper.

日本語が食べられません

中文锟斤拷烫烫烫

让我研究怎么优化 CJK 字体大小🤔🤔

Test image
![alt text](../../assets/images/AstroPaper-v3.png)

## Git Hook

For MacOS

```bash
#!/bin/bash

today=$(date +"%Y-%m-%d")

# staged markdown files
staged_files=$(git diff --cached --name-only --diff-filter=ACM | grep '\.md$')
echo $staged_files
if [ -z $staged_files ]; then
    exit 0;
fi
# insert date at frontmatter modDatetime. Handles spaces in file names.
echo "$staged_files" | while IFS= read -r file; do
    # check if the file has a frontmatter
    if grep -q '\---' "$file"; then
        # check if modDatetime: exists in the frontmatter
        if grep -q '^modDatetime:' "$file"; then
            # replace the modDatetime: value with today's date
            sed -i '' "s/^modDatetime:.*/modDatetime: ${today}/" "$file"
        else
            # add modDatetime: to the frontmatter
            sed -i '' "1s/^/modDatetime: ${today}\n/" "$file"
        fi
    fi
done

# add all changes to git
echo "$staged_files" | while IFS= read -r file; do
    [ -f "$file" ] && git add "$file"
done
```
