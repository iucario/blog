---
title: Fish Shell
pubDatetime: 2025-05-13
modDatetime: 2025-05-13
description: Fish -- friendly interactive shell
---

<https://fishshell.com/docs/current/index.html>

Permanently add to PATH\
`fish_add_path -g ~/.local/bin`\
Or `set PATH $PATH xyz uvw`

Install Starship <https://starship.rs/>\
`curl -sS https://starship.rs/install.sh | sh -s -- -b ~/.local/bin`

Set Fish as start up shell in iTerm2.\
In iTerm2 settings -> Text -> Use built-in Powerline glyphs, set to true. Or the symbols may look misaligned.

Alias
`abbr --add gst 'git status'`

My favorite oh-my-zsh aliases, copied to Fish

```sh
> abbr -s
abbr -a -- l 'ls -lah'
abbr -a -- gst 'git status'
abbr -a -- glo 'git log --oneline --decorate'
abbr -a -- glol 'git log --graph --pretty="%Cred%h%Creset -%C(auto)%d%Creset %s %Cgreen(%ar) %C(bold blue)<%an>%Creset"'
abbr -a -- gpsup 'git push --set-upstream origin (git branch --show-current)'
abbr -a -- gaa 'git add --all'
abbr -a -- gl 'git pull'
```

Save to a script
`abbr > ~/.config/fish/conf.d/alias.fish`

To reload configs personally I do:\
`exec fish`

DONE. Enjoy.
