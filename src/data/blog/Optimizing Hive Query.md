---
title: Optimizing Hive Query
pubDatetime: 2025-08-08
modDatetime: 2025-08-08
featured: false
description: Too many CTEs causes performance issue, which makes the Spark job hanging. How it can be optimized using CASE WHEN
tags:
  - SQL
  - Hive
  - Spark
  - Optimization
  - CTE
---

## A Long Night

I was convinced that it was just _another_ regular infrastructure failure at the beginning.

The Hive query ran for 2 hours with no sign of ending. Yet all other similar queries were finished in around 10 minutes. Even a query that was 99% similar took only 12 minutes to complete.

The client requested delivery of the results on the same day. So I waited until 23:59 that day, hoping to see the query magically finish.

There was no _miracle_ at that night.

## Initial Diagnosis

I brought the weird problem up with my team the next day.

The engineer who understood the query's business logic and the very person who created this query had no idea about it.

Another engineer who had some experience dealing with the company's database infrastructure complained it might be caused by an infrastructure issue. He suggested that I submit a ticket to the database team.

A PM compared the diff between successful queries and asked me to modify a `LIKE '%keyword%'` condition in the query.
I executed the query again but no luck.

We didn't know what to optimize next so we inquired database team.

## The Database Team

Long story short, the database team did not provide much help in terms of optimization or debugging.

But the PM was resourceful. After days of exchanging messages with database team I found I was added to a group chat with the **saviour** of the Hive query.

## Optimization

The saviour was an engineer from another team who was very skilled in Hive queries and Hadoop.
I got really valuable advices from the external expert.

She suggested me to replace `CONCAT` with specific date filters. Because the database was partitioned by dates. This was a useful improvement. It was also obvious so I already had tried before she mentioned.
The date filters were not the root cause of forever-running query.

After some observation on the query. She suggested me to combine CTEs using `CASE WHEN`.
That was the key to solve this mystery.

It **worked**!

Let's get a bit into the technical details.

### Technical Analysis

The query had nearly 30 Common Table Expressions(CTEs) that had similar structure with only differences on conditions.
There were over 30 `LEFT JOIN`s at the end.

I combined over 20 CTEs into 3 CTEs using `CASE WHEN`.

For example, the original query looked like this:

```sql
WITH t1 AS (
    SELECT id, count(1) as cnt
    FROM a_big_table
    WHERE CONCAT(year, '-', month, '-', day)
        BETWEEN '2025-08-01' AND '2025-08-08'
    AND column_1 = 'value_1'
    GROUP BY id
),

t2 AS (
    SELECT id, count(1) as cnt
    FROM a_big_table
    WHERE CONCAT(year, '-', month, '-', day)
        BETWEEN '2025-08-01' AND '2025-08-08'
    AND column_2 = 'value_2'
    GROUP BY id
)

SELECT id, t1.cnt, t2.cnt
FROM t1
LEFT JOIN t2 ON t1.id = t2.id;
```

The aggregation made it one query. With the optimization on date filters:

```sql
WITH t AS (
    SELECT
        id,
        COUNT(CASE WHEN column_1 = 'value_1' THEN 1 ELSE 0 END) AS cnt1,
        COUNT(CASE WHEN column_2 = 'value_2' THEN 1 ELSE 0 END) AS cnt2
    FROM a_big_table
    WHERE YEAR = '2025'
        AND MONTH = '08'
        AND DAY BETWEEN '01' AND '08'
    GROUP BY id
)
SELECT id, cnt1, cnt2
FROM t;
```

It decreased the number of scans on `a_big_table` and the number of `LEFT JOIN`s.

The query finished in 13 minutes.

Prior to this, I had never questioned the performance of queries containing large amounts of CTE and querying large tables.
Our infrastructure has always had a notorious reputation, and it was undoubtedly the first thing I would blame for slow queries.

But I was wrong.

I won't forget combining CTEs using `CASE WHEN` in my life.
