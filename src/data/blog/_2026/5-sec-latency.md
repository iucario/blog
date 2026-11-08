---
title: Debugging 5-Second Latency Spikes in GKE and Why It Was DNS
slug: latency-investigation-gke-dns-keep-alive
description: How I investigated a mysterious 5-second P99 latency spike in our Ruby on Rails BFF on GKE, and how missing Keep-Alive turned a brief DNS glitch into an incident.
pubDatetime: 2026-11-08
modDatetime: 2026-11-08
tags:
  - Ruby
  - Kubernetes
  - GCP
  - Networking
---

Recently, our monitoring triggered an alert when the P99 response latency on our GCP Application Load Balancer (ALB) spiked above 5 seconds during peak traffic hours.

The DevOps team quickly looked into the slow requests and initially suspected database bottlenecks.
However, they told us it was very hard to investigate because they could not find proper traces.

I decided to jump in and see what was really going on.

## Trace And Log

Our architecture is straightforward.
The architecture involves an external ALB routing to a Ruby on Rails backend, which communicates with internal Go microservices over HTTPS.

During our sync, I was surprised to hear that traces were missing.
A few months ago, I had spent time standardizing logging and distributed tracing across our downstream services.

When I clicked the trace link directly from GCP Logs, the console showed an error and could not render the span hierarchy. Then I realized what happened.

I was very _confident_ and _proud_ that I had improved observability for this Go service, so why were the traces broken and disconnected?
Then it suddenly hit me. Some time ago, DevOps urged us repeatedly to remove 200 OK request logs for high-traffic endpoints directly from the application code, in order to reduce GCP Cloud Logging storage bills.

I previously wrote about this topic in [Saving GCP Log Storage Cost Using Log Router](./gcp-log-cost-saving), where I recommended filtering out logs at the GCP Log Router level instead of removing them from the app.
But in the end, code-level removal won out.

Because the successful logs were discarded, trace linking broke in the log viewer.
Luckily, when I manually copied the trace ID and searched inside the GCP Trace Explorer in the downstream project, the trace spans were still there.\
Even though over 99% of regular logs were gone, the timing data inside GCP Trace Explorer was enough to start an investigation.

## Downstream Services Were Fast

My first step was checking whether the downstream Go service caused the delay.

Since many of our alerts rely on application logs, an issue might go unnoticed if logs are disabled.\
But by manually inspecting multiple slow traces in Trace Explorer, I saw that the downstream API handled requests very quickly, usually under 50 milliseconds.

The infrastructure metrics looked healthy as well.\
Pod count, CPU, and memory usage remained flat. In addition, no new application releases or Kubernetes node upgrades happened during that window.

If downstream was fast and the nodes were not overloaded, the problem was definitely inside our Rails BFF.

## It Is Always DNS

This BFF app is quite legacy, and its logging and observability are really poor.
Based on limited information, let us investigate why so many requests suffered delays over 4 or 5 seconds here.

Pod count, CPU, memory, and the nodes themselves showed no abnormalities around that time. There were no releases, and there were no underlying node upgrades.

One typical error pattern gave it away. Between two requests sent by the BFF to the downstream Go service, we could observe a latency of around **4.8 seconds**. Meanwhile, there was almost no application logic between these two calls.

This made me suspect whether something went wrong with DNS.

Here is the evidence supporting that DNS was the problem:

1. The latency often happened before the BFF even sent the request, while the code had almost _no_ complex logic.
2. From the limited traces and logs, I observed blank intervals where the delay was consistently around **4.8 seconds**.
3. This Ruby on Rails app did not enable HTTP **Keep-Alive** for downstream clients.
4. The Docker image was using `glibc`, and the default DNS request timeout in `glibc` is **5 seconds**.
5. NodeLocal DNSCache was not enabled.
6. Kubernetes writes `ndots 5` into the `/etc/resolv.conf` of node pods, and we neither tuned this setting nor used FQDN.
7. Checking DNS metrics showed an error response spike during that exact time. There was no further information because DNS logging was disabled.

## How to Improve

* Enable HTTP Keep-Alive on the application side\
  This is the ultimate fix. Instead of tearing down and recreating connections on every request, reusing persistent TCP connections keeps queries off the critical path, bypassing repeated DNS queries and TLS handshakes entirely.
* Use FQDN\
  Kubernetes defaults to `ndots 5`, which forces the resolver to query multiple internal search suffixes before falling back to the raw domain. Using absolute FQDNs stops suffix expansion on the first query.\
  Alternatively, tune the Pod spec with `dnsConfig` to set `options ndots:2` so external hostnames resolve immediately.\
  <https://kubernetes.io/docs/concepts/services-networking/dns-pod-service>
* Enable NodeLocal DNSCache\
  <https://docs.cloud.google.com/kubernetes-engine/docs/how-to/nodelocal-dns-cache>

## Learnings

Do not cut corners on observability and monitoring just to save a little money.
You only realize the real cost when the boomerang flies back and hits you in the face during an incident.

Since we are already paying for a great cloud platform like GCP, leveraging its managed features is usually the best move.
Managing things through cloud infrastructure is far more convenient and much safer than rushing out emergency code releases.

And just enable HTTP Keep-Alive. I honestly cannot think of a single reason not to.
