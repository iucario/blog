---
title: Got Bitten By Java Logback and Helm Charts
slug: got-bitten-by-java-logback-and-helm-charts
description: Unexpected behavior of Helm Chart, poor logging design and communication cost me days to deploy the application.
pubDatetime: 2026-04-30
modDatetime: 2026-04-30
tags:
  - kubernetes
  - Helm
  - Java
  - Logback
  - GCP
  - GKE
---

Unexpected behavior of Helm Chart, poor logging design and communication cost me days to deploy the application.

## Helm Charts Converts Large Integers To Scientific Notation

The direct issue was Helm Charts turning large numbers into scientific notation like "1e6".
Java application didn't expect this value and exited.

Helm mentions this in its document: <https://helm.sh/docs/chart_best_practices/values/#make-types-clear>

> Large integers like `foo: 12345678` will get converted to scientific notation in some cases.

I never liked Helm Charts in the first place. For projects that have more than 3 environments it can be useful. But unfortunately ours are not.
Kustomize doesn't do this kind of _"smart"_ things.

### Example

The config map:

```text
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
{{- range .Values.env }}
  {{ .name }}: {{ .value | quote}}
{{- end }}
```

And the environment variables in `values.yaml`:

```yaml
env:
  - name: some_int
    value: 100_000
  - name: large_int
    value: 1_000_000
  - name: quoted_int
    value: "1000000"
```

Render chart templates and look at the generated configmap:

```yaml
# Source: example/templates/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app.config
data:
  some_int: "100000"
  large_int: "1e+06"
  quoted_int: "1000000"
```

## Java Logback Setting

The real problem was hidden because Logback was configured to send logs to GCP cloud logging only.
The setup was disastrously wrong. It wasn't logging to the console. There was no information such as Pod name, Deployment, or image tag. Querying the logs was extremely difficult.
When querying using namespace and container name, no application logs were found.

It wasn't actually necessary when stdout and stderr logs are automatically collected by GKE logging agent. <https://docs.cloud.google.com/kubernetes-engine/docs/concepts/about-logs#logging-agent>

Perhaps someone created [cloud logging for Java](https://docs.cloud.google.com/logging/docs/setup/java) _four years ago_ to send errors to GCP **Error Reporting**. The best approach is to redirect to stdout:

```text
<redirectToStdout>true</redirectToStdout>
```

Deployment tags and trace IDs can then be easily collected and queried.

Well. To be honest it wasn't 100% Logback setting's fault. I wasn't very familiar with Java Springboot or Logback configuration. Otherwise I would have noticed where the logs had been.

But how on earth can an XML file that isn't even referenced in the code be associated with logging configuration? Ultimately, it's a Java issue. Too many _magical_ things happen with XML files. Have to pay attention to every XML file and build files in Java projects from now on.

>[!TIP] Ultimately a Java issue
> Every XML file and build file matters

## Inaccessible Information

The third factor, and perhaps the most fundamental, is overly strict **access control**.
Due to VPC and permission settings, I was unable to access the GKE cluster. Despite requesting permissions, the SRE took several hours to resolve the issue.

I checked the GKE cluster details page as soon as I gained access. Several tabs were clearly displayed on the page. One of them was "App Errors(10)", which was prominently displayed and hard to miss.
I clicked on it and can immediately spot the Java error message:
"\*\*\*APPLICATION FAILED TO START\*\*\*: Failed to bind properties. Value: 1e+06".

This problem could have been discovered much earlier if developers had had viewing permissions for GKE.

It's ironic and frustrating that those who are truly doing the jobs for the owner are being blocked by the owner.
