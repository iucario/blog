---
title: Revisiting Authentication
description: OAuth, JSON Web Tokens, HTTPOnly Cookies and the best practices
pubDatetime: 2025-12-20
modDatetime: 2025-12-20
tags:
- OAuth
- JWT
- Authentication
- Cookie
---

[RFC6749](https://datatracker.ietf.org/doc/html/rfc6749) The OAuth 2.0 Authorization Framework

## Conclusion First

1. The Server should store and manage the status of refresh tokens
2. Store refresh tokens in **HttpOnly** cookies with secure configuration. Expire in a couple of weeks/days, depending on the business requirements
3. Store access tokens in memory or local storage. Expire in few minutes

Let me explain ↓

## Stateless Token

We could always store the token in a database and validate it on every request. However, this approach **doesn't scale** horizontally.
Therefore, we split a token into two: an access token and a refresh token, to better suit a distributed system.

The access token is stateless, so we don't need to access the database every time. However, verifying the signature will consume some additional CPU resources.

### Access Tokens

An access token represents a user. Access tokens have a very short validity period, typically only a few minutes. Therefore, even if an attacker obtains an access token, they have only a short window of time to cause damage.

Access tokens are typically in [JSON Web Token (JWT)](https://datatracker.ietf.org/doc/html/rfc7519) format. It contains a base64url-encoded payload storing non-sensitive user information. A field defining the scope of access allowed by the token and a signature the server can use to verify the token.

## Stateful Management

For years, I thought that JWT was invented to improve **sessions** and **cookies**, eliminating the need to store any tokens in a database. The completely stateless nature of tokens prevents me from *revoking* user credentials. This might be sufficient for toy projects, but in real-world projects, stateful management is crucial.

We store refresh tokens in a database and use them to manage user sessions.
There are many things we can achieve by leveraging it, auditing, fraud detection, revocation.

## Extra

### Cookies

<https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies>

Server set browser cookies by sending headers include:

```text
Set-Cookie: refresh_token=123abc; Max-Age=2592000; SameSite=Strict; 
  Path=/api/refresh; Secure; HttpOnly
```

Sent cookies only to HTTPS sites by setting `Secure`.
Prevent the cookies from being accessed by client JavaScript by setting `HttpOnly`.

`HttpOnly` mitigates crossing site scripting(XSS) attacks because even if a malicious script is executed on users' browsers, it cannot access the `HttpOnly` cookies.
