---
title: Gomock v.s. Mockery
description: Which Go mock-generator is better?
pubDatetime: 2026-02-16
modDatetime: 2026-02-19
tags:
- Go
---

Gomock: <https://github.com/uber-go/mock>\
Mockery: <https://vektra.github.io/mockery>

My conclusion:
Mockery is better in terms of type hint and API.
Gomock may have clearer error messages.
Mockery configs are managed in one yaml file.
Gomock uses `//go:generate` directive in the files.
I would choose **Mockery** for my new projects.

## Code To Test

The interface in /internal/foo/client.go

```go
type Client interface {
 Get(path string) (string, error)
}
```

Used by function `Foo` in main.go

```go
type client struct{}

func (c *client) Get(path string) (string, error) {
 return "Hello", nil
}

func Foo(c Client) (string, error) {
 response, err := c.Get("/greet")
 return response, err
}
```

## Mockery Example

Create config `.mockery.yaml`. Then run `mockery` to generate mocks. The example is not used for this demo.

```yaml
all: false
dir: '{{.InterfaceDir}}'
filename: mocks_test.go
force-file-write: false
formatter: goimports
log-level: info
structname: '{{.Mock}}{{.InterfaceName}}'
pkgname: '{{.SrcPackageName}}'
recursive: false
template: testify
packages:
  github.com/vektra/mockery/v3/internal/fixtures:
    config:
      all: true
```

API with Testify

```go
func TestFoo(t *testing.T) {
 m := mocks.NewMockClient(t)
 m.EXPECT().Get(mock.Anything).
  Return("Bar", nil).Once()

 got, err := Foo(m)
 assert.NoError(t, err)
 assert.Equal(t, "Bar", got)
}
```

A compile error would appear if the returned types are not correct. For example:

> cannot use 123 (untyped int constant) as string value in argument to m.EXPECT().Get(mock.Anything).Returncompiler[IncompatibleAssign]

Error message

If the times being called do not match:

```
--- FAIL: TestFoo (0.00s)
    client.go:20: FAIL: Get(string)
                        at: [internal/mocks/client.go:72 main_test.go:13]
    client.go:20: FAIL: 0 out of 1 expectation(s) were met.
                The code you are testing needs to make 1 more call(s).
                at: [internal/mocks/client.go:20 
                /opt/homebrew/Cellar/go/1.25.7_1/libexec/src/testing/testing.go:1308 
                /opt/homebrew/Cellar/go/1.25.7_1/libexec/src/testing/testing.go:1572 
                /opt/homebrew/Cellar/go/1.25.7_1/libexec/src/testing/testing.go:1928]
```

## Gomock Example

Run `mockgen` to generate mocks.
`mockgen -source=internal/foo/client.go -package=mocks -destination=internal/mocks/foo.go`

main_test.go

```go
func TestFoo(t *testing.T) {
 ctrl := gomock.NewController(t)
 m := mocks.NewMockClient(ctrl)
 m.EXPECT().Get("/greet").
  Return("Bar", nil).Times(1)

 got, err := Foo(m)
 assert.NoError(t, err)
 assert.Equal(t, "Bar", got)
}
```

There is no types defined by `Return()` in mockgen. The args are `Return(rets ...any)`.

Error message if `Return(123, nil)`:

```txt
--- FAIL: TestFoo (0.00s)
    main_test.go:15: wrong type of argument 0 to Return for *mocks.MockClient.Get: int is not assignable to string [main_test.go:14]
    controller.go:97: missing call(s) to *mocks.MockClient.Get(is anything) main_test.go:14
    controller.go:97: aborting test due to missing call(s)
```

Error message if the called times do not match:

```
--- FAIL: TestFoo (0.00s)
    controller.go:97: missing call(s) to *mocks.MockClient.Get(is anything) main_test.go:14
    controller.go:97: aborting test due to missing call(s)
```
