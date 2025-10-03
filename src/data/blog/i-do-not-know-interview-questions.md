---
title: A Linux Command Cost Me An Interview
pubDatetime: 2025-09-29
modDatetime: 2025-09-29
draft: false
description: I failed an interview because I couldn't recall `lsof`.
tags:
  - Linux
  - Interview
  - SRE
  - Rant
---

>[!WARNING] Disclaimer
> This is a rant blog

I don't know Linux commands.
I don't know Bash.

What I _do_ have are tools like `tldr`, cheat.sh, and `man`. I can Google and ask AI.

I wrote a blog about frequent [Linux commands](./linux-commands). Honestly, I recommend interviewers read it (and many of my other good stories) to come up with better questions. I promise there are plenty of write-ups worth your time.

## Lsof

I really don't remember how to find the PID that is using a port.
I haven't used `lsof` in _five years_. I didn't need it in my daily work, nor during graduate school when I was doing deep learning research.

And it makes me wonder: why ask this? Doesn't the team use Docker or Kubernetes? In what situation do you really need to manually check which process is using which port? It feels outdated.

Here's the truth: I don't remember commands I don't use. Even for commands I do use, I usually rely on **tab completion**, `ctrl-r`, or arrow keys. I don't type full commands from memory every day.

Some commands are just unnatural to me. For example, I've never managed to remember how to use `find`. But I can Google it in seconds. And in real work, that's not a big deal.
Because there's always preparation.

Sometimes I wish companies would just send me an online judge and let me crack LeetCode problems honestly. Instead of asking me **introductory-level** questions and then showing full disrespect when I can not recall a command. The interviewer skipped most of the highlights on my resume, only asked two "101-level" questions, and then decided I wasn't qualified.

End of ranting.
