---
title: Go Graceful Shutdown Mistakes Even Senior Engineers Make
description: A summary of incorrect usages I've come across and two correct ways to use them
pubDatetime: 2026-08-07
modDatetime: 2026-08-07
tags:
  - Go
draft: true
---

I have talked about graceful shutdown on the infrastructure side using Kubernetes `preStop` in [prestop](/posts/prestop).
This time, I will focus purely on the Go application code.
This article covers incorrect usages I've come across and two correct ways to use them.

## A Signal Channel

This is one way to block the program until it receives a termination signal.

```go
sigChan := make(chan os.Signal, 1)
signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
<-sigChan
```

## Use a Shutdown Function and a Shutdown Context

This is how the standard library's HTTP server handles its lifecycle.
I am sure every Go developer is very familiar with this pattern:

```go
go func() {
  if err := server.ListenAndServe(); err != http.ErrServerClosed {
    log.Fatalf("HTTP server ListenAndServe: %v", err)
  }
}()
// sigChan stuff omitted
shutdownCtx, shutdownRelease := context.WithTimeout(context.Background(), 10*time.Second)
defer shutdownRelease()

if err := server.Shutdown(shutdownCtx); err != nil {
  log.Fatalf("Graceful shutdown failed: %v", err)
}
```

Note that `server.ListenAndServe()` doesn't need a context because its shutdown is signaled by `server.Shutdown(shutdownCtx)`.
See: <https://pkg.go.dev/net/http#Server.Shutdown>

If you choose this pattern in your long-running application, you should **implement** the `Shutdown(ctx)` function to properly stop accepting new connections and release the resources used by the app.

The first **mistake** I've seen is creating a _fake_ `Shutdown(ctx)` function that does nothing.
The engineers might have wanted to mimic how HTTP servers shut down gracefully, but they missed the most important implementation inside it.
Some may also have mistakenly thought that `defer shutdownRelease()` could delay the program exit for 10 seconds. But that's a rather amateurish idea too.

> [!IMPORTANT] Implement Shutdown(ctx) Properly
> HTTP servers can shut down gracefully because `Shutdown` is implemented to handle the shutdown process. Your app should handle it for your use cases.

### Shutdown Example

Suppose you have a process running in the background that keeps processing new messages. It isn't necessarily an HTTP server.
You can let `Shutdown` signal the app to stop receiving new messages and drain the in-flight messages until the timeout expires.

```go
type App struct {
  ctx      context.Context
  cancel   context.CancelFunc
  done     chan struct{}
  stopOnce sync.Once
  wg       sync.WaitGroup
}

func NewApp() *App {
  ctx, cancel := context.WithCancel(context.Background())
  return &App{
    ctx:    ctx,
    cancel: cancel,
    done:   make(chan struct{}),
  }
}

func (a *App) Shutdown(ctx context.Context) error {
  a.stopOnce.Do(a.cancel) // Stop receiving new messages

  select {
  case <-a.done:
    return nil // Graceful shutdown successful
  case <-ctx.Done():
    return ctx.Err() // Timeout
  }
}

func (a *App) Start() error {
  defer close(a.done)

  var pullErr error
  for {
    msg, err := pullMessage(a.ctx)
    if err != nil {
      pullErr = err
      break
    }

    a.wg.Go(func() {
      a.process(msg)
    })
  }

  a.wg.Wait()
  if errors.Is(pullErr, context.Canceled) {
    return nil
  }
  return pullErr
}
```

## Context-Driven Lifecycle

In this pattern you don't need the Shutdown function. Instead you use the context passed in `Start(ctx)` to control the lifecycle.

Usually, the first Shutdown approach is more explicit and cleaner. But this also works.

The second **mistake** I've observed was running `Start(ctx)` in a goroutine without taking other measures to stop the main program from exiting during draining.
The context is canceled by SIGTERM and propagates to the background processes. But there is no shutdown function that blocks.
Before the processes can drain in-flight messages, the main program exits without knowing the status of the goroutines.
That's why you should make the `Start(ctx)` block.

> [!IMPORTANT] Start(ctx) Handles The Entire Lifecycle
> Let `app.Start(ctx)` block in the main goroutine.
> If you have to start it in a goroutine, use it together with a done channel or something similar.

```go
ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
defer cancel()
err := app.Start(ctx) // Block here
if err != nil && errors.Is(err, context.Canceled) {
  log.Println("shut down gracefully")
}
```

### Start Context Example

```go
func (a *App) Start(ctx context.Context) error {
  g, groupCtx := errgroup.WithContext(ctx)
  for {
    select {
      case <-groupCtx.Done():
        return g.Wait()
      default:
        msg := pullMessage(groupCtx)
        g.Go(func() error {
          return a.process(groupCtx, msg)
        })
    }
  }
}
```

## Learnings

Go is a relatively simple programming language.
However, a lack of respect for Go and the unknown knowledge can lead to careless mistakes.
Even as a senior engineer, one cannot dismiss these details.

The devil is in the details.

This is what I see as the **advantage** of being a relatively junior engineer: we gain a deep understanding of the details and do not allow experience to cloud our judgement.
