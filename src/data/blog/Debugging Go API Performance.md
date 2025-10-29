---
title: An Interesting Experience Debugging Go API Performance
pubDatetime: 2025-04-05
modDatetime: 2025-04-05
draft: false
featured: true
description: Unexpected and humorous results from investigation of high CPU usage of Go API.
tags:
  - go
  - debugging
  - kubernetes
  - filebeat
---

It is a fun story.

## Debugging

The project was about to release and I was doing the final load testing and setting up monitoring. However the API was taking much more CPU than I had expected.

I did profiling. Thanks to Go's rich and powerful tools, the profiling had been a great experience.\
I found logging was slow. So removed many info logs. Instead of logging to both a file and `stdout`, I set it to only log to the file. Used buffer for logging. Better but not enough.\
Cached CEL Program instead of only CEL AST. Somewhat faster but still not good enough.\
Found that slog itself was slower than third party libraries. So changed slog to zerolog. A lot faster now.

Yet the most critical error that caused the CPU usage on Grafana high was none of them above.

## Surprising Cause

The culprit was the Filebeat sidecar. The CPU usage was calculated for a pod which had two containers: the app and Filebeat.\
I filtered out Filebeat on Grafana. Turned out the app was already very performant. I knew Filebeat could be affecting the CPU usage gauge on Grafana but I didn't realize it was that much.

What a debugging experience!

## Optimization

Filebeat aside. My mentor and I did do many improvements that further boosted the performance.

- Used faster logger and only kept essential logs. This made me reconsider what errors and information to log in the app and the error handling.
- Cached CEL Program. Because it was taking some amount of time to create the CEL environment.
- Cached more. We found that very small percentage of the memory was used. Caching more data saves the time of many HTTP requests.
- Gave Filebeat container more CPU. Optimized Filebeat config.
- Created two gateways. Always create at least a replica of any service in Kubernetes as you never know if it might suddenly die and restart.

I think I will never forget this somewhat stressful but surprising debugging experience in my life.
