---
title: Server Sent Events
description: Server Sent Events Go and TypeScript implementation. An alternative to WebSockets.
pubDatetime: 2026-03-29
modDatetime: 2026-03-29
tags:
  - Go
  - TypeScript
  - SSE
  - WebSocket
---


<https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events>

## Compare With WebSocket

Server Sent Events (SSE) is one-way, from server to the client. The data type is string. Works over HTTP protocol.\
WebSocket has its own protocol, `ws://`. Two-way communication. WS allows binary data. Common use cases include live stream chats, gaming.

Those are the obvious differences between SSE and WebSocket.
<https://germano.dev/sse-websockets> explained more details.

## Go Implementation

Main function. Starts a server handles `/events`.

```go
func main() {
 r := http.NewServeMux()
 r.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
  _, _ = fmt.Fprintln(w, "Hello, World!")
 })
 r.HandleFunc("/events", StreamEvents)

 port := "8080"
 fmt.Printf("Starting server on port %s...\n", port)

 server := &http.Server{
  Addr:         fmt.Sprintf(":%s", port),
  Handler:      r,
  ReadTimeout:  5 * time.Second,
  WriteTimeout: 10 * time.Second,
 }

 if err := server.ListenAndServe(); err != nil {
  fmt.Printf("Server failed to start: %v\n", err)
 }

 fmt.Println("Server stopped")
}
```

Events handler. It sends a message every 10 seconds for demonstration.

```go
// StreamEvents handles SSE connections
func StreamEvents(w http.ResponseWriter, r *http.Request) {
 // Disable write deadline for long-lived SSE connection
 rc := http.NewResponseController(w)
 if err := rc.SetWriteDeadline(time.Time{}); err != nil {
  slog.WarnContext(r.Context(), "Failed to disable write deadline", "error", err)
 }

 // Create new connection
 conn, err := NewConnection(w)
 if err != nil {
  slog.ErrorContext(r.Context(), "creating SSE connection", "error", err)
  w.WriteHeader(http.StatusInternalServerError)
  return
 }

 slog.InfoContext(r.Context(), "SSE connection established", "id", conn.ID)

 ch := make(chan string)
 defer close(ch)

 go func() {
  ticker := time.NewTicker(10 * time.Second)
  defer ticker.Stop()
  for {
   select {
   case <-ticker.C:
    ch <- fmt.Sprintf("current server time: %s", time.Now().Format(time.RFC3339))
   case <-r.Context().Done():
    slog.InfoContext(r.Context(), "client disconnected", "id", conn.ID)
    return
   }
  }
 }()

 go conn.Start(r.Context(), ch)
 if err := conn.sendEvent("connection established", "hello"); err != nil {
  slog.ErrorContext(r.Context(), "failed to send initial event", "id", conn.ID, "error", err)
  return
 }

 <-r.Context().Done()
 slog.InfoContext(r.Context(), "connection closed", "id", conn.ID)
}
```

The `Connection` struct stores some useful information. Can also store information such as user ID if needed.
It listens to the event channel for new messages and sends heartbeats every 10 seconds.

```go
// Connection represents a single SSE connection.
type Connection struct {
 ID      uuid.UUID
 writer  http.ResponseWriter
 flusher http.Flusher
}

// NewConnection creates a new SSE connection.
func NewConnection(w http.ResponseWriter) (*Connection, error) {
 flusher, ok := w.(http.Flusher)
 if !ok {
  return nil, errors.New("streaming not supported")
 }

 return &Connection{
  ID:      uuid.New(),
  writer:  w,
  flusher: flusher,
 }, nil
}
```

Connection has a `Start` function listening for events and writing SSE messages.

```go
func (c *Connection) Start(ctx context.Context, ch <-chan string) {
 c.writer.Header().Set("Content-Type", "text/event-stream")
 c.writer.Header().Set("Cache-Control", "no-cache")
 c.writer.Header().Set("Connection", "keep-alive")

 heartbeatTicker := time.NewTicker(time.Second * 10)
 defer heartbeatTicker.Stop()

 for {
  select {
  case <-ctx.Done():
   slog.InfoContext(ctx, "connection context cancelled", "id", c.ID)
   return
  case event := <-ch:
   if err := c.sendEvent("update", event); err != nil {
    slog.ErrorContext(ctx, "failed to send event", "id", c.ID, "error", err)
    return
   }
  case <-heartbeatTicker.C:
   if err := c.sendHeartbeat(); err != nil {
    slog.ErrorContext(ctx, "failed to send heartbeat", "id", c.ID, "error", err)
    return
   }
  }
 }
}

// sendEvent encodes the event and writes it as an SSE frame.
func (c *Connection) sendEvent(evt string, data string) error {
 ev := EventData{
  Event: data,
 }
 str, err := json.Marshal(ev)
 if err != nil {
  return fmt.Errorf("failed to marshal event: %w", err)
 }
 if _, err := fmt.Fprintf(c.writer, "event: %s\ndata: %s\n\n", evt, str); err != nil {
  return err
 }
 c.flusher.Flush()
 return nil
}

func (c *Connection) sendHeartbeat() error {
 if _, err := fmt.Fprintf(c.writer, ": heartbeat\n\n"); err != nil {
  return err
 }
 c.flusher.Flush()
 return nil
}

type EventData struct {
 Event string `json:"event"`
}
```

## Front End Implementation

<https://developer.mozilla.org/en-US/docs/Web/API/EventSource>

```js
evtSource.onmessage = (event) => {}
evtSource.onerror = (err) => {}
```

TypeScript.

```ts
export interface EventData {  
  event: string  
}

connectEventStream(
 onEvent: (event: EventData) => void,
 onError?: (error: Error) => void
): () => void {
 const eventSource = new EventSource(`${API_BASE_URL}/events`)

 eventSource.onmessage = (e) => {
  try {
   const event: EventData = JSON.parse(e.data)
   onEvent(event)
  } catch (err) {
   console.error('Failed to parse SSE event:', err)
  }
 }

 eventSource.onerror = (e) => {
  console.error('SSE error:', e)
  if (onError) {
   onError(new Error('Event stream connection error'))
  }
 }

 // Return cleanup function
 return () => {
  eventSource.close()
 }
}
```
