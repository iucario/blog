---
title: Git Commands
description: Useful git commands in my daily work.
pubDatetime: 2026-04-14
modDatetime: 2026-04-24
tags:
  - git
---

## Git

Rebase with another repo

```sh
git remote add repo https://github.com/repo
git fetch repo
git rebase repo/main
git remote remove repo
```

Redo last commit
`git reset --soft HEAD~1`

Merge one file from another branch
`git checkout --patch otherbranch file`
If new file, use it without `--patch`

Fix up a previous commit.

```sh
git commit --fixup <commit>
git rebase --auto-squash <commit>~1
```

Rebase from certain commit. Extremely useful when your team squashes the commits and you have to rebase onto the latest branch.

```sh
git rebase --onto <branch> <commit>
```

Checkout a file from other branch

```sh
git restore --source <branch> -W <filepath>
```

## Aliases

Shell alias

```txt
gpsup='git push --set-upstream origin $(git_current_branch)'
gaa='git add --all'
gau='git add --update'
```

Git config

```txt
[alias]
    co = checkout
    br = branch
    ca = commit --amend
    cm = commit -m
    ls = log --all --decorate --oneline --graph
    pf = push --force-with-lease
[pull]
    ff = only
[core]
    editor = vim
```

## Commit message

I seldomly follow it but this is the first convention I've learned.

<http://karma-runner.github.io/6.3/dev/git-commit-msg.html>

- **feat** for a new feature for the user, not a new feature for build script. Such commit will trigger a release bumping a MINOR version.
- **fix** for a bug fix for the user, not a fix to a build script. Such commit will trigger a release bumping a PATCH version.
- **perf** for performance improvements. Such commit will trigger a release bumping a PATCH version.
- **docs** for changes to the documentation.
- **style** for formatting changes, missing semicolons, etc.
- **refactor** for refactoring production code, e.g. renaming a variable.
- **test** for adding missing tests, refactoring tests; no production code change.
- **build** for updating build configuration, development tools or other changes irrelevant to the user.
