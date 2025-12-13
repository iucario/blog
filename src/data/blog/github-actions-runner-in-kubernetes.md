---
title: Enterprise Github Actions Runner In Kubernetes
description: Cannot possibly make it happen because of permission
pubDatetime: 2025-11-27
modDatetime: 2025-11-27
tags:
  - GitHub
  - CICD
  - Kubernetes
---

Jenkins and Groovy are annoying and I have always wanted to introduce GitHub Actions to my team.

The challenge is my company-managed Kubernetes cluster does not permit bypassing security settings.
The best way is deploying the Runners in VMs. But I don't have the resource. I can only use Kubernetes clusters for testing.

Steps I take:

1. First download the runner-linux-x64.tar.gz from GitHub
2. Build an image that has the runner and essential tools:
    `docker build --platform linux/amd64 -t ghe-runner:latest .`
3. Push the image to registry
4. Create secret
    `kubectl create secret generic ghe-secret --from-literal=GITHUB_TOKEN=token`
5. Apply `kubectl apply -f deployment.yaml`

I can successfully deploy the runner in Kubernetes, lint and build my Go application. But [buildah](https://buildah.io/) does not work.

## The Error

When running `buildah`:

```text
Error during unshare(CLONE_NEWUSER): Operation not permitted
level=error msg="parsing PID \"\": strconv.Atoi: parsing \"\": invalid syntax"
level=error msg="(Unable to determine exit status)"
```

There are discussions about it:\
<https://github.com/containers/buildah/issues/1901>\
<https://gitlab.com/gitlab-org/gitlab/-/issues/503827>

[Podman](https://podman.io/docs) does not work either.

[buildkit](https://github.com/moby/buildkit) does not work.

```text
$ buildkitd  --rootless
buildkitd: rootless mode requires to be executed as the mapped root in a user namespace; you may use RootlessKit for setting up the namespace
```

[kaniko](https://github.com/GoogleContainerTools/kaniko) _might_ work but it is not maintained.
Kaniko is provided as an image that the runner in Kubnernetes cannot easily use.

## Possible Solutions

One theoretical solution to make the GitHub Runner run in the Kubernetes cluster in the company is to set `securityContext` to `privileged: true`. I cannot verify it because privileged containers are not allowed.

Another workaround is to build the Go binary and upload to GitHub Artifact. Create a base image and mount the Go binary in it. Use [skopeo](https://github.com/containers/skopeo) to tag and push images to registry. `kubectl` can work in Kubnernetes container.\
But this is too complicated for a CICD service.

The ultimate solution is simply use VMs. If my managers let me.

## Details

My Dockerfile:

```dockerfile
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    jq \
    git \
    sudo \
    libicu74 \
    buildah \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/* \
    && rm -rf /var/cache/apt/* \
    && rm -rf /usr/share/doc/* \
    && rm -rf /usr/share/man/*

RUN useradd -m -s /bin/bash -u 1001 runner && \
    usermod -aG sudo runner && \
    echo "runner ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

WORKDIR /home/runner

COPY actions-runner-linux-x64.tar.gz /tmp/
RUN tar xzf /tmp/actions-runner-linux-x64.tar.gz -C /home/runner && \
    rm /tmp/actions-runner-linux-x64.tar.gz && \
    chown -R runner:runner /home/runner

USER 1001

COPY --chown=runner:runner start.sh /home/runner/start.sh
RUN chmod +x /home/runner/start.sh

ENTRYPOINT ["/home/runner/start.sh"]
```

The `start.sh` gets token from GitHub Enterprise:

```sh
#!/bin/bash
set -e

GHE_URL="https://your-ghe"

# Get registration token
REG_TOKEN=$(curl -sX POST \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  "${GHE_URL}/api/v3/repos/${GITHUB_OWNER}/${GITHUB_REPOSITORY}/actions/runners/registration-token" \
  | jq -r .token)

# Configure runner
./config.sh \
  --url "${GHE_URL}/${GITHUB_OWNER}/${GITHUB_REPOSITORY}" \
  --token "${REG_TOKEN}" \
  --name "${RUNNER_NAME:-k8s-runner}" \
  --labels "${LABELS:-kubernetes,self-hosted}" \
  --work "${RUNNER_WORKDIR:-_work}" \
  --unattended \
  --replace

# Cleanup on exit
cleanup() {
  echo "Removing runner..."
  ./config.sh remove --token "${REG_TOKEN}"
}
trap cleanup EXIT

./run.sh
```

A simple `deployment.yaml` for deploying the GitHub Runner container:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ghe-runner
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ghe-runner
  template:
    metadata:
      labels:
        app: ghe-runner
      annotations:
        sidecar.istio.io/inject: "false"
        container.seccomp.security.alpha.kubernetes.io/buildah: "unconfined"
    spec:
      containers:
        - name: runner
          image: ghe-runner:latest
          imagePullPolicy: IfNotPresent
          securityContext:
            privileged: true # My k8s cluster does not allow
          resources:
            requests:
              memory: "2Gi"
              cpu: "1000m"
            limits:
              memory: "4Gi"
              cpu: "2000m"
          env:
            - name: GITHUB_TOKEN
              valueFrom:
                secretKeyRef:
                  name: ghe-secret
                  key: GITHUB_TOKEN
            - name: GHE_URL
              value: "https://your-github-enterprise"
            - name: GITHUB_OWNER
              value: "your-org-name"
            - name: GITHUB_REPOSITORY
              value: "your-repo-name"
            - name: RUNNER_NAME
              value: "k8s-ghe-runner"
            - name: LABELS
              value: "kubernetes,self-hosted"
```
