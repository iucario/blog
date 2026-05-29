---
title: How To Be A Bad Engineer
description: Use runtime configuration obfuscation to increase system complexity. So that no one but you can understand or control the system.
pubDatetime: 2026-05-29
modDatetime: 2026-05-29
---

Inspired by a V2EX post: <https://www.v2ex.com/t/1212589#r_17638581> by **akakidz**. Kudos.

This is so fun and really to the point. I have to turn this idea into an article. ^_^

>[!IMPORTANT] Tip
> Good engineers don't do these please

## Turn Business Logic Into Configs

Before the AI coding era some engineers would obfuscate their code to safeguard their jobs. If a company wished to dismiss these engineers, it would have to spend time unravelling the spaghetti code they had written, which is a significant cost.

That doesn't work very well for AI.
The truly effective method today is what I call _runtime configuration obfuscation_.

Gradually embed business logic into configuration files, extensions and workflows.

For example:

- Write business logic to helm charts
- Inject environment variables from another repository during CICD process
- Complex dependencies between multiple configurations
- Dynamically registering features via configs

Make sure no one other than you can understand the system's details. When managers or colleagues ask, tell them that this is to ensure the system's flexibility and scalability.

## Put Core Functions Into Private SDK

Most teams with clear workflows and standard review processes do not permit the use of private SDKs. But it is plausible especially in poorly managed teams and non-production environments.

- Your team uses Java and a private maven registry
- Your team has many Git repositories, micro services and SDKs
- The SDK repo has many unresolved PRs. The version control and CICD are chaotic. There is no correlation between released versions and source code commits
- You have credentials to publish packages to the registry. These credentials are, of course, **not** documented, so only a handful of people are aware of them.

Now you have got the perfect environment to be a _bad_ engineer.

Publish a new version of SDK from your machine. Make the team rely on you. Every updates that involves the SDK must pass through you.
Of course others could decompile the Jar files to source code. So you obfuscate during local build and make it unreadable. Any colleague who takes over your work will have a very hard time of it.

What other suggestions do you have? Feel free to share in the comments!
