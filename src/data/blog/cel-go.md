---
title: Building An Expression Evaluator Using CEL Go
slug: cel-go
pubDatetime: 2025-10-20
modDatetime: 2025-10-20
draft: false
description: Common Expression Language(CEL) Go basic usage, custom functions, etc.
tags:
  - Go
  - CEL-Go
---

Common Expression Language(CEL) is an an ideal tool for lightweight expression evaluation.
It is a language and CEL-Go is an implementation.

<https://github.com/google/cel-go>

There is a code lab help you quick start: <https://codelabs.developers.google.com/codelabs/cel-go/index.html>.

## CEL Go Simple Usage

```go
func main() {
    data := map[string]any{
        "xyz": true,
        "123": false,
    }
    expression := "data.xyz == true"

    env, err := cel.NewEnv(
        cel.Variable("data", cel.DynType),
    )
    if err != nil {
        glog.Exit(err)
    }

    ast, issues := env.Compile(expression)
    if issues.Err() != nil {
        glog.Exit(issues.Err())
    }

    program, err := env.Program(ast)
    if err != nil {
        glog.Exitf("program error: %v", err)
    }

    out, details, err := program.Eval(map[string]any{"data": data})
    fmt.Println("Eval Result:", out, details, err)
}
```

The result is:

```text
$ go run .
Eval Result: true <nil> <nil>
```

But if we try to access the key `123` in the JSON data: `expression := "data.123 == true"`

```text
$ go run .
F1020 21:44:48.014163   78523 main.go:30] ERROR: <input>:1:5: Syntax error: mismatched input '.123' expecting <EOF>
 | data.123 == true
 | ....^
exit status 1
```

It can be corrected using `expression := "data['123'] == true"`. However when the expression is a variable and can be changed, we will need to build the expression from some data. One solution I am using is binding custom functions to `cel.Env`.

## CEL Go Custom Functions

Given a string containing user information. We want to find out if the result of a condition is true for this data.
The expression string must be compiled by an `cel.Env` to an AST, then converted to a `cel.Program`.

```go
func main() {
   
    str := `
    {
        "user": {
            "verified": true,
            "sub": {
                "123name": "foo"
            },
            "role": "admin",
            "random": "foobarbaz"
        },
        "profile": {
            "year": 2024,
            "random": "bar",
            "sub": {
                "123name": "foo"
            }
        }
    }`

    attr := make(map[string]any)
    json.NewDecoder(strings.NewReader(str)).Decode(&attr)
    data := map[string]any{"data": attr}
    const expression string = `
        data.get("user", "random").contains("foo") &&
        data.get("profile", "random").contains("bar")
    `
    env := createEnv()
    ast, issues := env.Compile(expression)
    if issues.Err() != nil {
        glog.Exit(issues.Err())
    }

    program, err := env.Program(ast)
    if err != nil {
        glog.Exitf("program error: %v", err)
    }

    out, det, err := program.Eval(data)
    fmt.Println("Eval Result:", out, det, err)
}
```

Binding custom functions to the `cel.Env`.
Note that we created the `NewEnv` with a `cel.Variable` data that is a map containing the JSON data we just saw.
We also created a `cel.Function` with options defining the ID, args, return type and custon function.

The reason why we have to add the extra `data` map and custom function is that this way allows more flexible key names.

```go
func createEnv() *cel.Env {
    funcOptions := cel.MemberOverload(
        "get_attr", /* OverloadID */
        []*cel.Type{cel.MapType(cel.StringType, cel.AnyType), cel.StringType, cel.StringType}, /* args */
        cel.AnyType, /* resultType */
        cel.FunctionBinding(myFunc),
    )
    env, err := cel.NewEnv(
        cel.Variable("data", cel.MapType(cel.StringType, cel.DynType)),
        cel.Function("get", funcOptions),
    )
    if err != nil {
        glog.Exitf("env error: %v", err)
    }
    return env
}
```

The custom function that gets value from nested map with dot-separated path.
The first arg is the data map, the second arg is key, the third is path with dots.
E.g. `myFunc(data, "a", "b.c")` => `data["a"]["b"]["c"]`

```go
func myFunc(args ...ref.Val) ref.Val {
    m := args[0].Value().(map[string]any)
    key := args[1].Value().(string)
    key2 := args[2].Value().(string)
    if data, ok := m[key]; ok {
        v := getNestedValue(data.(map[string]any), key2)
        if v == nil {
            return types.NullValue
        }
        return types.DefaultTypeAdapter.NativeToValue(v)
    }
    return types.ValOrErr(args[0], "no such key: "+key)
}

// Helper function
func getNestedValue(data map[string]any, key string) any {
    keys := strings.Split(key, ".")
    current := data

    for _, k := range keys {
        if v, ok := current[k]; ok {
            if nestedMap, isMap := v.(map[string]any); isMap {
                current = nestedMap
            } else {
                return v
            }
        } else {
            return nil
        }
    }
    return nil
}
```
