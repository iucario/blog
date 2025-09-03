---
title: Python For Algorithm
pubDatetime: 2025-09-03
modDatetime: 2025-09-03
draft: false
description: Must know Python tools for algorithm
tags:
  - python
  - algorithm
  - leetcode
---

Defaultdict

```py
from collections import defaultdict
adj = defaultdict(list)
```

Priority queue

```py
import heapq
heapq.heappush(heap, item)
smallest = heapq.heappop(heap)
smallest = heapq.heappushpop(heap, item) # more efficient than separated
heapq.heapify(x) # inplace
heapq.nlargest(k, nums) # a list of k largest numbers
```

Sort by custom key

```py
sorted_list = sorted(tuples, key=lambda x : x[1])
coordinates.sort(key=lambda x : (x[0], -x[1]))
```

Char to Int, Int to char

```py
ord('a') == 97
chr(97) == 'a'
```

Cache

```py
@functools.cache
def dp(x, y):
```

Bit

```py
(x >> i) & 1 # getting i-th bit, counting from right
```

Bisect
`bisect.bisect_right()` is the default `bisect.bisect()`\
It inserts at a position which is _after_ all the existence of `x`\
`bisect.bisect_left()` insertion point is before any existence of `x`

```py
import bisect
l = [0, 1, 1, 5]
bisect.bisect_left(l, 1) == 1
bisect.bisect_right(l, 1) == 3
```

Insort. Similar to bisect but slower because it inserts elements.

> The `insort()` functions are `O(n)` because the logarithmic search step is dominated by the linear time insertion step.

Fraction.
Sometimes it can be useful. It is hashable.

```py
from fractions import Fraction
Fraction(9, 3) == 3
```

Combinations & Permutations

```py
>>> from itertools import combinations, permutations
>>> list(combinations(range(3), 2))
[(0, 1), (0, 2), (1, 2)]
>>> list(permutations(range(3)))
[(0, 1, 2), (0, 2, 1), (1, 0, 2), (1, 2, 0), (2, 0, 1), (2, 1, 0)]
```
