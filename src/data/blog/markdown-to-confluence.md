---
title: Markdown To Confluence
pubDatetime: 2025-09-11
modDatetime: 2025-09-17
draft: false
description: My CLI tool for converting Markdown documents to Confluence wiki markup and publishing. Time to make the documenting workflow humanized and streamlined.
tags:
  - JavaScript
  - Markdown
  - Confluence
---

<https://github.com/iucario/markdown2conf>

## Confluence Is Bad

Confluence is bad in so many ways.
I believe engineers would understand my points so I won't waste time here.

## Markdown Is Good

Less is more.

I like the simplicity and the ecosystem of Markdown.

Markdown files can be version-controled and formatted. The exact two essential attributes for the source of technical documents.

## Markdown2conf

<https://github.com/iucario/markdown2conf>

Markdown2conf is using [Marked](https://github.com/markedjs/marked) as the parser. It outputs Confluence [wiki markup](https://confluence.atlassian.com/doc/confluence-wiki-markup-251003035.html) by overwriting the Renderers of Marked.

Features:

- Converts Markdown to Confluence Wiki Markup
- Supports tables, code blocks, callouts, images, mermaid and more
- Extracts YAML frontmatter (title, labels, id) from Markdown files
- Confluence macro tags are preserved without escaping, allowing native macros to function as intended
- Easy to use CLI

**Mermaid JS** is supported by HTML macro. Like this:

```html
{html}
<pre class="mermaid">
    ${text}
</pre>
<script type="module">import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';</script>
{html}
```

## Conclusion

The tool's impact on the team's documentation is immeasurable.

Writing in Markdown forces us to focus more on the content rather than the format or style. There were countless times when I felt frustrated by wide Confluence tables with cells crammed full of code blocks, lists, nested pages, and more. Markdown has no such issue.

Users **own** their documents. They are not locked into Confluence. They can choose to publish anywhere—whether it's GitHub Pages, a hosted site, or even back to Confluence.

There are tons of Confluence wiki markups and macros that aren't part of the Markdown syntax. The good news is that `Markdown2conf` preserves macro tags, so users can still use them to extend Markdown.

With `Markdown2conf`, you don't have to choose between Markdown's simplicity and Confluence's popularity.
