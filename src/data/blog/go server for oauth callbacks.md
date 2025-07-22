---
title: Spinning Up a Temporary Go Server for OAuth Callbacks in CLI Apps
pubDatetime: 2025-06-08
modDatetime: 2025-06-09
description: Set up a temporary Go HTTP server to handle OAuth callbacks, commonly used in CLI applications for authentication flows.
tags:
  - Go
  - dev
  - Oauth
---

We often have to set up a server for handling callback when building a client side application that works with OAuth.
The application can be a CLI, terminal app, etc.

The workflow usually starts with the user opens the link in brower and login, the target website will then redirect user to your server address with code in query parameters.
The server will exchange code for access token with the website.

I have been building a terminal app and the gist below is my solution written in Go.

<https://gist.github.com/iucario/5151d9e2ddbdac726cb465b7f616d1ad>

## Unable To Connect Error

There was a problem I encountered during developing.
The local server returns a HTML page to the user on success for better user experience. But everytime I tried I only got error: unable to connect. Looked like that the server had stopped before browser got the reponse.

The issue was resolved by putting server shutdown in a goroutine:

```go
go func() {
    if err := srv.Shutdown(ctx); err != nil {
        fmt.Println("Server Shutdown error:", err)
    }
}()
```

By moving the server shutdown into a goroutine, the handler function can complete and send the response to the browser before the server begins shutting down.

## Code

Go function for opening a link in browser

```go
func openBrowser(url string) {
    var err error

    switch runtime.GOOS {
    case "linux":
        err = exec.Command("xdg-open", url).Start()
    case "windows":
        err = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
    case "darwin":
        err = exec.Command("open", url).Start()
    default:
        err = fmt.Errorf("unsupported platform")
    }
    if err != nil {
        log.Fatal(err)
    }
}
```

Functions to start the server

```go
func BrowserLogin() {
    fmt.Println("Login server POC")
    LOGIN_URL := fmt.Sprintf("http://localhost:%d/auth?code=testcode", port)

    // Create WaitGroup to keep program running until auth completes
    serverDone := &sync.WaitGroup{}
    serverDone.Add(1)

    // Start server
    startServer(serverDone)

    // Open browser
    openBrowser(LOGIN_URL)
    fmt.Println(LOGIN_URL)

    // Wait for authentication to complete
    serverDone.Wait()
    fmt.Println("Stopped")
}

func startServer(wg *sync.WaitGroup) {
    srv := &http.Server{
        Addr:         fmt.Sprintf(":%d", port),
        ReadTimeout:  5 * time.Second,
        WriteTimeout: 10 * time.Second,
        IdleTimeout:  120 * time.Second,
    }

    http.HandleFunc("/auth", func(w http.ResponseWriter, r *http.Request) {
        code := r.URL.Query().Get("code")
        if code != "" {
            workWithCode(code)
            fmt.Println("Login success.")
            w.Header().Set("Content-Type", "text/html; charset=utf-8")
            fmt.Fprintln(w, "Login success. You can close this page now.")
            // Shutdown server after successful login
            fmt.Println("Initiating server shutdown")
            go func() {
                ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
                defer cancel()

                if err := srv.Shutdown(ctx); err != nil {
                    fmt.Println("Server Shutdown error:", err)
                }
            }()
        } else {
            w.Header().Set("Content-Type", "text/html; charset=utf-8")
            fmt.Fprintln(w, "Hi")
        }
    })

    // Start server
    go func() {
        defer wg.Done()
        if err := srv.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
            fmt.Println("ListenAndServe error:", err)
        }
        fmt.Println("Stopped serving new connections")
    }()
}

func workWithCode(code string) {
    fmt.Println("Get access token with code", code)
    time.Sleep(1 * time.Second)
}
```
