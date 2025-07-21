---
title: A Weird Way Of Using Git
description: Found a team using Git in a weird, ugly way. I can't find out why. Hopefully there is at least one reason. I know I shouldn't interfere other people's business but I just got too curious.
pubDatetime: 2025-03-23
modDatetime: 2025-03-23
tags:
  - git
  - whining
---

Found a team using Git in a weird, ugly way. I can't find out why. Hopefully there is at least one reason. I know I shouldn't interfere other people's business but I just got too curious.

## The Normal Way

Probably the normal way of using Git is:

1. Checkout a new branch from develop branch and do something on that feature branch
2. Other people merged new commits to develop so rebase on develop
3. Squash merge to develop

And there you go, a clean commit history.

## The Weird Way

There are two feature branches, A and B, that are both based on develop. Branch A will be merged to develop earlier as planned.

What the team has been doing is:

1. Feature A merge --no-ff to develop
2. Develop merge to feature B to keep it up-to-date
3. Feature B merge --no-ff to develop

They have really gross commit history. The lines are messy. I cannot look at it for more than one second. Luckily it is not the team I am working in.

Why are they doing this? Why stick to merge commit and don't want to use rebase?
It's fine if they do either merge --no-ff + rebase, or squash merge + merge to feature branch. Why the heck do both at the same time and make it a convention?

## Example

I created examples to show how the commit histories would look like using different strategies.

**TLDR**: Squash merge or rebase. The best is using both.

The command for showing the graph:\
`git log --all --decorate --oneline --graph`

First, merge branch fix to branch main. Then merge main to branch feature. Lastly merge feature to main. The history looks like this:

```
*   06570d5 (HEAD -> feature) Merge branch 'main' into feature
|\
| *   8400a70 (main) Merge branch 'fix'
| |\
| | * a56ef6e (fix) fix 1st commit
| |/
* / c66ba4f feature 1st commit
|/
* 04720df 2nd commit
* e960e90 1 commit
(END)
```

### Squash Merge

If I squash merge feature into main:

```
* 227ea1d (HEAD -> main) squash merge feature into main
| *   06570d5 (feature) Merge branch 'main' into feature
| |\
| |/
|/|
* |   8400a70 Merge branch 'fix'
|\ \
| * | a56ef6e (fix) fix 1st commit
|/ /
| * c66ba4f feature 1st commit
|/
* 04720df 2nd commit
* e960e90 1 commit
(END)
```

Looks messy because the branches are not deleted. After removing them:

```
* 227ea1d (HEAD -> main) squash merge feature into main
*   8400a70 Merge branch 'fix'
|\
| * a56ef6e fix 1st commit
|/
* 04720df 2nd commit
* e960e90 1 commit
(END)
```

### Merge --no-ff

If merge main to another branch and merge --no-ff back to main:

```
*   597de80 (HEAD -> main) Merge branch 'chore'
|\
| *   484492e (chore) Merge branch 'main' into chore
| |\
| |/
|/|
* | cd82466 main 3rd
| * b88a551 chore 1st commit
|/
* 227ea1d squash merge feature into main
*   8400a70 Merge branch 'fix'
|\
| * a56ef6e fix 1st commit
|/
* 04720df 2nd commit
* e960e90 1 commit
(END)
```

Deleting the 'chore' branch does not help:

```
*   597de80 (HEAD -> main) Merge branch 'chore'
|\
| *   484492e Merge branch 'main' into chore
| |\
| |/
|/|
* | cd82466 main 3rd
| * b88a551 chore 1st commit
|/
* 227ea1d squash merge feature into main
*   8400a70 Merge branch 'fix'
|\
| * a56ef6e fix 1st commit
|/
* 04720df 2nd commit
* e960e90 1 commit
(END)
```
