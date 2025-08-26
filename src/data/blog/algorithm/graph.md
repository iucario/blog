---
title: Graph
pubDatetime: 2025-08-23
modDatetime: 2025-08-24
draft: false
description: Notes of graph algorithms and applications
tags:
  - algorithm
  - leetcode
  - graph
---

## Table of Contents

## Data Structure

- List of edges
- Adjacency matrix
- Adjacency lists

## Union Find

```py
parent = []

def find(x) -> int:
    if parent[x] == x:
        return x
    return find(parent[x])

def union(a, b):
    pa = find(a)
    pb = find(b)
    parent[pb] = pa
```

Time complexity for find and union is tree height. Construction is `O(N)`.
In worst case where the tree is a linked list, the time complexity for find is `N` times array access.

Can be improved by weighted union find.
Have an array recording the tree sizes. Always union the smaller tree to the larger tree's root.
The complexity is at most `O(logN)` for find and union.

## DFS

- Complexity
 Time & Space `O(V + E)`. Visiting all the vertices and edges.

### Topological Sort

A graph has a topological sort if and only if it is a DAG.

DFS + recording in post-order. The trick is to set 3 states: not visited, being processing, visited.

```py
def findOrder(self, num: int, prerequisites: List[List[int]]) -> List[int]:
    adj = defaultdict(list)
    for a, b in prerequisites:
        adj[a].append(b)

    # 0: unprocessed, 1: in processing, 2: done
    status = [0] * num
    path = []

    def dfs(x):
        if status[x] == 1:
            return False
        if status[x] == 2:
            return True
        status[x] = 1
        for nei in adj[x]:
            res = dfs(nei)
            if res == False:
                return False
        status[x] = 2
        path.append(x)
        return True
    
    for x in range(num):
        if dfs(x) == False:
            return []
    return path
```

BFS one is also called Kahn's algorithm.

1. Starts from zero in-degree nodes, which are nodes that are required by zero nodes
2. Pop zero in-degree node from queue and append to `path`
3. For its neighbors, in-degree - 1
4. If in-degree is 0, push to queue
5. Return `reversed(path)` if len(path) == vertices

## BFS

- Complexity
 Time & Space `O(V + E)`

### Minimum Spanning Tree

- Prim's algorithm
  - Start with any vertex, then add edges to it. Always take the minimum weight edge.
  - Time: `O(E log(E))`. Space `E`

- Kruskal's algorithm
  - Start with minimum weight edge. Add edge that does not form a cycle. Stop after V-1 edges have been taken.
  - Time: `O(E log(E))`. Space `E`

## Shortest Path

Negative cycles have no meaning.

### Dijkstra's Algorithm

Find minimum cost from node A to node B. Single source paths. No negative paths.

Algorithm:

1. Initialize all nodes except start `cost = INT_MAX`
2. Build a min heap. `(cost, node)`. While heap not empty:
    1. Node = heap.pop()
    2. If Node is your target, return
    3. For neighbors of Node, if cost of
        `start → Node + Node → neighbor` < `start → neighbor`.
        Push `(new_cost, neighbor)` to heap

- Complexity: Time `O(E log(V))`, Space `O(V)`
- Does not work on negative path. Because no revisit.
- Can be run on every start node to find all-pairs shorted paths

### Bellman-Ford Algorithm

Single source shortest path. Allows negative paths. Can be used to detect negative cycles.

Algorithm:

1. Looping V times, as we are relaxing V times
2. For each edge in edges, relax
3. If on the V-th loop, can still be relaxed, meaning there is a negative cycle. Abort

- Complexity: Time `O(VE)`, Space `O(V)`
  Each of the V loops relaxes E edges.
- No need for building the graph. Pairs of (src, dest, cost)  are enough.

Better for _sparse_ graph.

### Floyd-Warshall Algorithm

Shortest path for all pairs of (src, dest).

- Time complexity `O(V^3)`
- Works for negative edges. Better for _dense_ graph.

```py
dist = [[float('inf')] * n for _ in range(n)] # n*n distance matrix

for k in range(n): # for all intermediate node k
  for i in range(n): # all start node i
    for j in range(n): # all end node j
      dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
```

## Hierholzer's Algorithm

Finding the route of using all the edges exactly once, in a _Eulerian graph_.
_Eulerian circuit_ exists if all vertices have even degree.

Algorithm:

1. Starting from a given node, keep consuming its unused edges
2. When no unused edge exists, push it to a stack
3. The reversed stack is the _Eulerian path_

Complexity: Time `O(E)`, Space `O(E)`

<https://neetcode.io/problems/reconstruct-flight-path>

```py
def findItinerary(self, tickets: List[List[str]]) -> List[str]:
  tickets.sort() # sort makes the function here O(ElogE)
  adj = defaultdict(list)
  for a, b in reversed(tickets):
    adj[a].append(b)

  st = ["JFK"]
  res = []

  while st:
    x = st[-1]
    if len(adj[x]) > 0:
      nei = adj[x].pop()
      st.append(nei)
    else:
      res.append(x)
      st.pop()

  return list(reversed(res))
```

## Longest Path In DAG

[Wikipedia](https://en.wikipedia.org/w/index.php?title=Longest_path_problem&oldid=525448430#Weighted_directed_acyclic_graphs)

1. Topological sort it
2. Initialize an array of costs to -inf. Initialize a parent array.
3. For node in the topological path:
    1. For neighbor in adj:
        1. If has a larger weighted path:
        2. `cost[nei] = cost[node] + weight`
        3. Update parent
4. The end point is the index of the max cost in the array
5. From end point, build the path

Complexity: Time `O(V + E)`

## Leetcode

Number of sub-graphs / connected components\
<https://leetcode.com/problems/number-of-provinces/>

Bipartite\
<https://leetcode.com/problems/possible-bipartition/>

Cycle Detection\
<https://leetcode.com/problems/redundant-connection/>

Precedence-constrained Scheduling\
<https://leetcode.com/problems/course-schedule/>\
Essentially is cycle detection

Topological Sort\
<https://neetcode.io/problems/foreign-dictionary>\
<https://leetcode.com/problems/course-schedule-ii>\
DFS post order. Only works for DAG. This problem is a combination.

Parallel job scheduling\
<https://leetcode.com/problems/parallel-courses-iii/>

Single-source paths. No negative edges. From a source to all destinations.\
<https://leetcode.com/problems/cheapest-flights-within-k-stops>

Dijkstra's algorithm.\
<https://neetcode.io/problems/swim-in-rising-water>\
BFS + With stop check. This problem is not a typical Dijkstra's algorithm.

Minimum spanning tree\
<https://neetcode.io/problems/min-cost-to-connect-points>

Eulerian path\
<https://neetcode.io/problems/reconstruct-flight-path>

## Miscellaneous

I was once asked an NP hard problem in an interview: Given a graph where nodes may be disconnected and each node has a weight, find a _simple path_ with the maximum weight. A simple path means that no node is visited more than once.

Special cases:

- Tree. Then the problem is similar to <https://leetcode.com/problems/binary-tree-maximum-path-sum>
- Cycle. If negative weights exist, the problem becomes maximum subarray sum
- DAG. Same as critical path.

For node number that is small. DFS can solve it. The state is the visited nodes and the current node. We use save the bit mask of visited nodes in an integer.
This problem might be what the interviewer meant: <https://leetcode.com/problems/find-the-shortest-superstring>

```py
@cache
def dfs(mask, curr):
  newmask = mask | (1 << curr)
  ret = weights[curr]
  for nei in adj[curr]:
    if mask & (1 << nei) == 1:
      continue
    w = dfs(newmask, nei)
    ret = max(ret, w+ret)
  return ret
```

Complexity: `2^N * N` states, at each state explores neighbors once. The total transitions will be `2^N * E * 2`.
Time `O(2^N * E)`. Space `O(2^N * N)`

For practical large graphs. Heuristic and approximation.

For example. Simulated Annealing:

1. Start with a random path
2. Randomly pick one:
    - Extend the path by adding randomly an unvisited neighbor at either end
    - Shrink the path by removing a node from either end
3. Always accept better paths
4. Sometimes accept worse paths based on `exp(delta / temp)` to escape local maxima
5. Temperature decreases by `alpha` each iteration
6. Keep track of the best path found

## Reference

1. <https://en.wikipedia.org/wiki/Longest_path_problem>
2. <https://en.wikipedia.org/wiki/Travelling_salesman_problem>
