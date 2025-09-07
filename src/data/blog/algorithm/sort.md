---
title: Sorting Algorithms
pubDatetime: 2025-09-07
modDatetime: 2025-09-10
draft: false
description: Sorting algorithms
tags:
  - python
  - algorithm
  - leetcode
  - quicksort
  - mergesort
---

<https://leetcode.com/problems/sort-an-array/>

## Merge Sort

```py
def merge(a: list[int], b: list[int]) -> list[int]:
    res = []
    i, j = 0, 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            res.append(a[i])
            i += 1
        else:
            res.append(b[j])
            j += 1
    res += a[i:]
    res += b[j:]
    return res

def merge_sort(nums: list[int]) -> list[int]:
    if len(nums) <= 1:
        return nums
    mid = len(nums) // 2
    left = merge_sort(nums[:mid])
    right = merge_sort(nums[mid:])
    return merge(left, right)
```

Divide and conquer:
<https://leetcode.com/problems/count-of-smaller-numbers-after-self/>

## Quick Sort

```py
def partition(nums, low, high):
    index = random.randint(low, high) # random index for sorted array
  v = nums[index]
  nums[index], nums[high] = nums[high], nums[index]
    i = low - 1
    for j in range(low, high):
        if nums[j] <= v:
            i += 1
            nums[i], nums[j] = nums[j], nums[i]
    nums[i+1], nums[high] = nums[high], nums[i+1]
    return i+1


def quick_sort(nums: list[int], low: int, high: int) -> list[int]:
    if low < high:
        i = partition(nums, low, high)
        quick_sort(nums, low, i - 1)
        quick_sort(nums, i + 1, high)
    return nums
```

We used random pivot index to handle sorted array.
However it is slow for array with one unique value. It becomes the worst case time `O(n^2)`.

Solution is to partition into _3 parts_. Introduce `lt` and `gt`, make `arr[lt:gt+1]` equal to the value.

Three scenarios:

1. `arr[i] < v`
   Swap `arr[lt]` with `arr[i]`. Increment both `lt` and `i`
2. `arr[i] > v`
   Swap `arr[gt]` with `arr[i]`. Decrement `gt`
3. `arr[i] == v`
   Increment `i`

```py
def quick_sort_3(nums, low, high):
    if low >= high:
        return nums
    i, lt, gt = low+1, low, high
    v = nums[low]
    while i <= gt:
        if nums[i] < v:
            nums[lt], nums[i] = nums[i], nums[lt]
            lt += 1
            i += 1
        elif nums[i] > v:
            nums[gt], nums[i] = nums[i], nums[gt]
            gt -= 1
        else:
            i += 1

    quick_sort_3(nums, low, lt-1)
    quick_sort_3(nums, gt+1, high)
    return nums
```

Use insertion sort for small arrays:

```py
def insertion_sort(nums, low, high):
    for i in range(low + 1, high + 1):
        for j in range(i, low, -1):
            if nums[j-1] > nums[j]:
                nums[j-1], nums[j] = nums[j], nums[j-1]
            else:
                break
```

And update the quick sort. The final version that passes the all test cases:

```py
def quick_sort_3(nums, low, high):
    if low >= high:
        return nums
    if low + 10 >= high:
        insertion_sort(nums, low, high)
        return nums
    i, lt, gt = low+1, low, high
    index = random.randint(low, high)
    v = nums[index]
    nums[index], nums[low] = nums[low], nums[index]
    while i <= gt:
        if nums[i] < v:
            nums[lt], nums[i] = nums[i], nums[lt]
            lt += 1
            i += 1
        elif nums[i] > v:
            nums[gt], nums[i] = nums[i], nums[gt]
            gt -= 1
        else:
            i += 1

    quick_sort_3(nums, low, lt-1)
    quick_sort_3(nums, gt+1, high)
    return nums
```

### Quick Select

Often used in "Find top k largest/smallest" problems. Quick sort, pivot at k.

- Time complexity: `O(n)` on average, `O(n^2)` worst case
- Space: `O(n)`

<https://leetcode.com/problems/k-closest-points-to-origin>
<https://leetcode.com/problems/kth-largest-element-in-an-array/>

## Heap Sort

Root is at index 0. For a node at `i`, its left child is `2*i+1`, right child is `2*i+2`. Parent is `(i-1)//2`.

Consider minheap in this example.

Heapify. From bottom to up. Swap a node with its parent while it is smaller than its parent. Also called _swim up_.

```py
def bottom_up(nums, i):
    while i > 0 and nums[i] < nums[(i-1)//2]:
        nums[(i-1)//2], nums[i] = nums[i], nums[(i-1)//2]
        i = (i-1)//2
```

Top-down heapify. Swap with the smaller child. Also called _sink_.

```py
def top_down(nums, i):
    n = len(nums)
    while i*2+1 < n:
        left = i*2+1
        if left+1 < size and nums[left] > nums[left+1]:
            left += 1
        if nums[i] <= nums[left]:
            break
        nums[left], nums[i] = nums[i], nums[left]
        i = left
```

**Insertion**: Add new key at the end of the array. And heapify it from bottom to up.\
**Remove root**: Swap root with the last key, pop it. Heapify the array from top to down.

Heap sort. With modifications on the arguments for **in-place** sorting.

```py
def top_down_sort(nums, i, size):
    while i*2+1 < size:
        left = i*2+1
        if left+1 < size and nums[left] > nums[left+1]:
            left += 1
        if nums[i] <= nums[left]:
            break
        nums[left], nums[i] = nums[i], nums[left]
        i = left

def heap_sort(nums):
    n = len(nums)
    for i in range((n-1)//2, -1, -1):
        top_down_sort(nums, i, n)

    for end in range(n-1, 0, -1):
        nums[0], nums[end] = nums[end], nums[0]
        top_down_sort(nums, 0, end)

    nums.reverse()
    return nums
```
