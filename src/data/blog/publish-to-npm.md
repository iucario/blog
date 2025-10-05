---
title: Publish To NPM
slug: publish-to-npm
pubDatetime: 2025-10-05
modDatetime: 2025-10-05
draft: false
description: Publishing packages to public NPM registry tutorial
tags:
  - NPM
  - JavaScript
  - NodeJS
---

- Test the package can be installed correctly: `npm install . -g`.
- Confirm which files would be published locally: `npm pack`.
- The package/module is test to be functioning, `npm login` to login.
- `npm publish` to publish as an **unscoped package**.

<https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages>

## Package.json

Example `package.json`. Add keywords, author and homepage to help people find the pacakge and source code. I put TS output directory in `files` so the source TypeScript files and configs don't get published.

```json
{
  "name": "package-name",
  "version": "0.0.1",
  "type": "module",
  "description": "description",
  "main": "index.js",
  "scripts": {
    "test": "vitest run --silent",
    "build": "tsc -b"
  },
  "bin": {
    "binary-name": "./dist/index.js"
  },
  "keywords": [],
  "files": [
    "dist/"
  ],
  "author": "me",
  "homepage": "https://github.com/",
  "license": "MIT",
}
```

## GitHub Workflow

<https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages>

Adding `pnpm/action-setup@v4` as I use `pnpm`. <https://github.com/pnpm/action-setup>

```yaml
name: Node.js Package

on:
  release:
    types: [published]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test

  publish-npm:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          registry-url: https://registry.npmjs.org/
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
      - run: pnpm publish
        env:
          NODE_AUTH_TOKEN: ${{secrets.npm_token}}
```

Example NPM package: <https://www.npmjs.com/package/markdown2conf>
