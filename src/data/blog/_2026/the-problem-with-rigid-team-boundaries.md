---
title: The Problem with Rigid Team Boundaries
description: Why teams work better when knowledge, ownership, and responsibility are shared rather than strictly partitioned.
pubDatetime: 2026-03-11
modDatetime: 2026-03-11
tags:
  - teamwork
---

I like working on a team where everyone can contribute to development, DevOps, and quality assurance, etc.
It is more efficient when there is more ownership.

It requires the engineers to be versatile and have good computer science knowledge, which is never a problem for passionate engineers.

I don't really enjoy being on a team where developers only write application code and can't work on infrastructure. QA doesn't know much about engineering. DevOps or SREs don't usually write application code, but they help fix any problems with that code.

With AI, engineers can take on more responsibilities. Absolutely, a team should include experts in different fields. These experts are essential.

The way we traditionally divide up strict responsibility boundaries among engineers is being replaced.

## Advantages

### Alerts

How are the alerts being configured? Are they triggered by the response success rate, directly by the app code, keywords in logs, or response latency?
Who is responsible for handling the alerts that are triggered? What are the SLAs?

Developers must know the details of alerts so they can write good code and ensure system stability.

### Testing

Black box testing is a good thing. It's also important to have developers who built the system test it.
But most of the time, developers don't test their systems end to end when they're working in teams. They might not even have access to test environments.

QA testers don't know much about either the backend or the frontend. A lot of time is wasted on pointless conversations because the QA team can't provide useful information. It's not that the QA team is incompetent. It's a problem with the workflow. Beta testers should never replace developers doing their own tests.

### Optimization

Having full access to the infrastructure, allows developers to design more efficient apps.\
For example, will routing the same user to the same instance help with cache performance?\
How do the connection timeouts configured on the load balancers affect the application?

Without these information, developers can't design systems correctly.

### Communication

In many teams, developers aren't prohibited from accessing production environments and infrastructure. They can request permissions from SREs.
However, this back-and-forth adds unnecessary complexity. It's especially difficult for those who dislike bothering others over minor details.

Completely unnecessary communication cost.

### Happy Mental State

The main reason I like having this overview of the system, from infrastructure to end user experiences, is that it makes me happy.
Writing only application code is boring. It's really sad.
