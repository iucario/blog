---
title: Stop My Team From Writing Python Like It Is 2010
description: On Python formatting, typing, and the tooling gap in real-world teams.
pubDatetime: 2025-07-22
modDatetime: 2025-07-23
featured: true
tags:
  - python
  - ruff
  - pyright
  - pylance
  - yapf
---

A small code review disagreement led me to think about Python tools in 2025.

## Impressions of Python

I have a basic sanity setup in place: VSCode + `Pylance` + `yapf`. It's not fancy for current standards.
But seems it's not universal for even experienced engineers. Some people still write Python like they’re hacking together shell scripts: no formatting, no linting, no types, just a file that runs.
I have `shellcheck` for shell scripts by the way.

I understand people may have bad impression or stereotypes against Python. But Python has changed a LOT and is really a better language now compare to itself 10 years ago.
With typing, modern toolchains, and a thriving ecosystem, it's more than just a scripting language.
Senior engineers should really take Python as seriously as they would any other compiled language. Don't just treat it as a standalone script.

## Python Tools

### Format and Lint

<https://docs.astral.sh/ruff/>

`ruff` and `uv`.
They are relatively new but they work as expected from a Python equivalent of NPM and even more. Mentioning `uv` here because they are both from the same creators.

This simple `pyproject.toml` works great for me. There are many more rules can be configured.

```toml
[tool.ruff]
line-length = 120
exclude = [".venv"]
fix = true

[tool.ruff.lint]
extend-select = ["E501", "I"]

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
```

It can format your code on save in your favorite editor, with extension for VSCode, PyCharm, etc.

It is 2025 already. Why not use modern tools for Python?

### Sort Imports

VSCode has `isort`  extension. It is also included in `ruff`.
`ruff` can organize the imports on save and warn about unused imports clearer.

Simply run:

```sh
ruff check . --fix
```

### Static type checker

[Pyright](https://microsoft.github.io/pyright/#/) and Mypy.

I have `Pylance` extension installed in my VSCode and it incorporates `Pyright`.
To use it in build stage you can install a standalone version:

```sh
pip install pyright
# or
npm install -g pyright
```

## Original Question

Let's get back to the original question that drove me to find the best Python tools solution for team working.

Here is a simple definition of Airflow tasks dependencies:

```py
t1 >> [t2, t3]
```

However my Pyright complains: `random.py:75:5 - warning: Expression value is unused (reportUnusedExpression)`

Airflow task overrides bit shift `>>` and returns a value. Yet the value is unused. That's why Pyright complains about it.

```py
def __rshift__(self, other: DependencyMixin | Sequence[DependencyMixin]):
    """Implement Task >> Task."""
    self.set_downstream(other)
    return other
```

There are various ways to declare task dependencies. This method is the most common and is the one my colleagues have always used. My PR challenged this method and was nitpicked by the a reviewer, saying my PR broke the _consistency_.

[Chain](<https://github.com/apache/airflow/blob/3f6d78c09e9637445c6bfd059caf31967de47071/task-sdk/src/airflow/sdk/bases/operator.py#L1632>) is an elegant and functional way of chaining the tasks dependencies. But the reviewer does not like it because no other dag did this, only mine.

It can be solved by `_ = t1 >> [t2, t3]`. But it still breaks the _consistency_ with other dags.

The only way to improve the code quality and engineers' sanity is to introduce `ruff` and `pyright`.
So I listed current standard Python tools in the blog. Also I proposed the tools to all of my colleagues.
I feel like my working environment just got a little better :)
