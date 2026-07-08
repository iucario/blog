---
title: Use Kubernetes PreStop to Reduce Server Errors During Scale Down
description: How a simple PreStop hook can reduce transient 5xx errors during pod termination. In production.
pubDatetime: 2026-07-07
modDatetime: 2026-07-07
draft: false
tags:
  - go
  - kubernetes
---

Transient 5xx HTTP errors can happen while Kubernetes is terminating Pods during a scale down or rolling update.
This can happen because there is often a short **delay** before load balancers stop routing traffic to a Pod that is already shutting down.

So how can we reduce these errors?
Before adding complexity to your application, check whether the infrastructure already provides a solution.
In fact, I've seen experienced engineers try to solve this by adding coordination to application's health checks. The real issue, however, was infrastructure rather than application logic.

Google Cloud's documentation recommends using a `PreStop` hook to help reduce these transient errors. <https://docs.cloud.google.com/kubernetes-engine/docs/troubleshooting/load-balancing>

Let's verify this with a small experiment on a local Kubernetes cluster.

## Simple Graceful Shutdown Go Server

```go
func main() {
	log.Println(time.Now().Format(time.RFC3339Nano), "starting")
	hostname, _ := os.Hostname()

	mux := http.NewServeMux()
	mux.HandleFunc("GET /api", func(w http.ResponseWriter, r *http.Request) {
		log.Printf("request from %s", r.RemoteAddr)
		time.Sleep(time.Second * 1)
		_, _ = fmt.Fprintf(w, "%s %s\n", time.Now().Format("15:04:05.000"), hostname)
	})
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	server := &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	go func() {
		if err := server.ListenAndServe(); err != http.ErrServerClosed {
			log.Fatalf("HTTP server ListenAndServe: %v", err)
		}
	}()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan
	log.Println(time.Now().Format(time.RFC3339Nano), "signal received")

	shutdownCtx, shutdownRelease := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownRelease()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Graceful shutdown failed: %v", err)
	}
	log.Println(time.Now().Format(time.RFC3339Nano), "stopped")
}
```

## PreStop

```yaml
spec:
  containers:
  - name: demo
    lifecycle:
      preStop:
        exec:
          command: ["/bin/sh", "-c", "sleep 5"]
```

Before sending the SIGTERM, the command `sleep 5` will be executed first.
Leaving some time for the LB to be aware of the termination of the pod.
At the same time of deleting the pod(scale down), the pod status turns to `Terminating`.

```sh
date --rfc-3339=ns; k scale deployment demo --replicas 0
```

```text
2026-07-07 22:07:39.893813310+09:00
deployment.apps/demo scaled
```

On another terminal:

```sh
date --rfc-3339=ns; curl http://127.0.0.1:35721/api -i
```

```text
2026-07-07 22:07:43.478043761+09:00
HTTP/1.1 200 OK
Date: Tue, 07 Jul 2026 13:07:46 GMT
Content-Length: 13
Content-Type: text/plain; charset=utf-8
Connection: close

Hello, World! 
```

```text
demo-75c4f4698f-4nbjj 2026-07-07T13:07:46.266371607Z signal received
demo-75c4f4698f-4nbjj 2026-07-07T13:07:46.541886381Z stopped
```

As there is only one pod, the traffic was still routed to it even when it was terminating. The termination signal was sent to the pod at `22:07:46.266` while the scale happened at `22:07:39.893`. Delayed around 5 seconds.

### More Than One Pod

Kubernetes removes terminating Pods from a Service's endpoints so that they are no longer selected for new traffic. Different load balancer implementations may observe this change differently, but once they detect it, they stop sending new requests to the terminating Pod.

Here is the expriment to prove that.

I had 5 terminal tabs open:

1. The client

    ```sh
    while true; do
        curl -s http://127.0.0.1:43181/api &
        sleep 0.2
    done
    ```

    `127.0.0.1:43181` was the minikube service tunnel.
2. Scale down
    `date --rfc-3339=ns; k scale deployment demo --replicas 1`

    ```text
    2026-07-07 22:47:15.542540382+09:00
    deployment.apps/demo scaled
    ```

    Scaled down at **13:47:15.542** UTC. Note the timestamp.
3. EndpointSlices\
    `kubectl get endpointslices -w`\
    I can observe the moment I scaled the replicas down to 1, the endpoints decreased from 2 to 1.
4. One pod logs

    ```text
    2026/07/07 13:47:15 request from 10.244.0.1:29503
    2026/07/07 13:47:18 request from 10.244.0.1:45347
    ...
    2026/07/07 13:47:24 request from 10.244.0.1:1888
    ```

    This pod was not deleted and kept receiving requests.
5. The deleted pod logs

    ```text
    2026/07/07 13:47:15 request from 10.244.0.1:9515
    2026/07/07 13:47:15 request from 10.244.0.1:33639
    2026/07/07 13:47:20 2026-07-07T13:47:20.748081212Z signal received
    2026/07/07 13:47:20 2026-07-07T13:47:20.748236182Z stopped
    ```

    The last request the terminating pod received was at **13:47:15**, the time when I scaled it down.\
    Then at **13:47:20**, it received the SIGTERM, right after the `PreStop` sleep.\
    During the `PreStop` sleep, no request was routed to this pod. Exactly as my expectation.

The small expriment confirmed that `PreStop` is the solution.

## Full Code

Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: demo
  name: demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: demo
  strategy: {}
  template:
    metadata:
      labels:
        app: demo
    spec:
      terminationGracePeriodSeconds: 10
      containers:
        - image: demo:latest
          name: demo
          imagePullPolicy: Never
          ports:
            - containerPort: 8080
              name: http
          resources: {}
          readinessProbe:
            httpGet:
              port: http
              path: /health
            periodSeconds: 1
            initialDelaySeconds: 5
          startupProbe:
            httpGet:
              port: http
              path: /health
            periodSeconds: 1
            initialDelaySeconds: 5
          lifecycle:
            preStop:
              exec:
                command: ["/bin/sh", "-c", "sleep 5"]
```

Service

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app: demo
  name: demo
spec:
  ports:
    - name: 8080-8080
      port: 8080
      protocol: TCP
      targetPort: 8080
  selector:
    app: demo
  type: ClusterIP
```

Dockerfile

```dockerfile
FROM golang:1.26-alpine AS builder

WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY main.go ./
RUN go build -o main .

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
```
