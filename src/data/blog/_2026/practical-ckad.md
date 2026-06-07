---
title: Practical CKAD Exam Tips
description: Learn how to prepare for the CKAD exams. Gain confidence and pass the exams with ease.
pubDatetime: 2026-06-07
modDatetime: 2026-06-07
tags:
  - Kubernetes
  - CKAD
---

I passed the Certified Kubernetes Application Developer exam with a score of 96 out of 100. And it only took me less than 1 hour.

I believe every engineer with proper practice can do this.

## The Exam

It was a hands-on exam through a remote Linux desktop.
While there was latency, it wasn't significant. The latency was around **100 milliseconds**, perfectly acceptable and smooth enough.
The latency of the actual exam was very low compared to the killer.sh mock exam and the KodeKloud lab.

There are tab completions and aliases.

Documentation for relevant topics is also linked in the task description, so no searching is necessary.
Sometimes the topics can be a hint.

A larger screen would definitely be helpful. The terminal window is too small on a 14-inch laptop.

The actual exam questions are indeed easier than those killer.sh mock questions.
You don't need to write a lot of YAML specs. So don't worry about it.
Even if you are not familiar with a topic, you will have plenty of time to look into the documentation.

## Tips

- Vim indentation
  - `ctrl-t`, `ctrl-d` to indent or dedent in insert mode
  - `>>`, `<<` in visual mode
- Replace a pod with the same name: `k replace -f pod.yaml`. Don't wait for it to delete and create.
- Use imperative commands to quickly produce a manifest file:\
  `k run mypod --image=nginx --port=80 --dry-run=client -o yaml > pod.yaml`
- `k api-resources -o wide` to see the verbs available on each resource
- Quickly look up a resource spec:\
  `k explain --recursive <resource>`
- Set default namespace:\
  `k config set-context --current --namespace=<name>`
- Get from all namespaces: `k get all -A`
- Verify permission: \
  `k auth can-i list pods --as system:serviceaccount:default:my-sa-name`

## Preparation

I definitely over-prepared for the CKAD exam. But being well-prepared is always better than being poorly prepared.
Here are my criteria for passing the exam.

You should know how to create Kubernetes resources using `k create`.
Most resources are available.

```text
Available Commands:
clusterrole           Create a cluster role
clusterrolebinding    Create a cluster role binding for a particular cluster role
configmap             Create a config map from a local file, directory or literal value
cronjob               Create a cron job with the specified name
deployment            Create a deployment with the specified name
ingress               Create an ingress with the specified name
job                   Create a job with the specified name
namespace             Create a namespace with the specified name
poddisruptionbudget   Create a pod disruption budget with the specified name
priorityclass         Create a priority class with the specified name
quota                 Create a quota with the specified name
role                  Create a role with single rule
rolebinding           Create a role binding for a particular role or cluster role
secret                Create a secret using a specified subcommand
service               Create a service using a specified subcommand
serviceaccount        Create a service account with the specified name
token                 Request a service account token
```

You should be familiar the spec of Persistent Volume, Persistent Volume Claim, Storage Class and Network Policy because they can't be imperatively created.

Know the differences between **StatefulSet** and Deployment are:

```yaml
apiVersion: apps/v1
kind: StatefulSet
spec:
 serviceName: my-headless-svc
 volumeClaimTemplates:
  # pvc templates here
 podManagementPolicy: OrderedReady | Parallel
```

### Pod and Container Definitions

Finally you should know the pod and container specs well:

Pod level

- initContainers
- securityContext
- serviceAccountName
- affinity
- tolerations
- nodeSelector
- volumes
  - emptyDir
  - secret
  - persistentVolumeClaim
  - configMap
- restartPolicy
- imagePullSecrets

Container level

- volumeMounts
- env
- envFrom
- command
- args
- resources
- startupProbe
- livenessProbe
- readinessProbe
- restartPolicy
- securityContext
  - capabilities
- ports

Okay, that's enough preparation. Good luck on the exams!
