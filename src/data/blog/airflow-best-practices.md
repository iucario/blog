---
title: Airflow Best Practices
pubDatetime: 2025-08-28
modDatetime: 2025-08-29
draft: true
description: Airflow pitfalls, or essentially Python pitfalls
tags:
  - python
  - airflow
---

I have witnessed a number of bizarre mistakes while reviewing Airflow pull requests for the team recently. Certain Airflow features have also left me baffled. I feel it it necessary to document what I _personally_ consider to be best practices.

Airflow has an article about it:
<https://airflow.apache.org/docs/apache-airflow/stable/best-practices.html>

## Local Testing

_Fears_ regarding the uncertainty of Airflow DAGs stem from the lack of testing them in local environments. It is difficult to test thoroughly in local because of the nature of Airflow. However basic syntax and templates, etc. can be easily tested with a few commands.

```sh
airflow tasks list <dag>
airflow tasks render <dag> <task> <execution_time>
```

Before rendering the task, the DAG has to be imported and variables must be set.

```sh
airflow dags list
airflow dags list-import-errors
airflow variables list
airflow variables set jsonvar '{"key1": "value1"}'
```

## Template

The most common errors I have encountered are all related to Airflow templates.

<https://airflow.apache.org/docs/apache-airflow/stable/templates-ref.html>

Example code:

```py
with DAG(
    "my_dag",
    default_args={
        "depends_on_past": False,
        "email": ["airflow@example.com"],
        "email_on_failure": False,
        "email_on_retry": False,
        "retries": 1,
        "retry_delay": timedelta(minutes=5),
    },
    description="A simple tutorial DAG",
    schedule="0 12 * * *",
    start_date=pendulum.datetime(2025, 1, 1, tz="Asia/Tokyo"),
    catchup=False,
    tags=["example"],
) as dag:
    t1 = BashOperator(
        task_id="t1",
        bash_command=textwrap.dedent("""
            echo jsonvar {{ var.json.jsonvar }}
            echo data_interval_start {{ data_interval_start }}
            echo data_interval_end {{ data_interval_end }}
        """),
    )
```

```sh
> airflow tasks render my_dag t1 2025-08-28T11:00:00+09:00

echo jsonvar {'key1': 'value1'}
echo data_interval_start 2025-08-26 03:00:00+00:00
echo data_interval_end 2025-08-27 03:00:00+00:00

> airflow tasks render my_dag t1 2025-08-28T13:00:00+09:00

echo jsonvar {'key1': 'value1'}
echo data_interval_start 2025-08-27 03:00:00+00:00
echo data_interval_end 2025-08-28 03:00:00+00:00
```

Sometimes we want to use template variables as well as Python variables. We can use f-string but need to pay attention to the curly braces `{}`.

```py
t2 = BashOperator(
  task_id="t2",
  bash_command=f"echo {{{{ params.arg1 }}}}; echo {arg2}",
)
```

## Time

### Timezone

To ensure the DAG's timezone is `Asia/Tokyo`, use `pendulum.datetime` with `tz`. Then you don't have to worry about server timezone.

```py
start_date=pendulum.datetime(2025, 1, 1, tz="Asia/Tokyo")
```

One rule is to never use Python's `datetime.datetime`.

### Interval

Airflow thinks in **time intervals**, not just single timestamps.

The date range `{{ data_interval_start }}` and `{{ data_interval_end }}` is the time period the run is supposed to cover.

If a DAG is scheduled at 12:00 every day in JPT.

```py
schedule="0 12 * * *",
start_date=pendulum.datetime(2025, 1, 1, tz="Asia/Tokyo"),
```

The dag triggered at `2025-08-29T12:00:00+09:00` has `data_interval_start = 2025-08-28T12:00:00+09:00` and `data_interval_end = 2025-08-29T12:00:00+09:00`

## Network

> Using Airflow Variables yields network calls and database access, so their usage in top-level Python code for dags should be avoided as much as possible.

To check whether a function is called on DAG parsing. Add some prints to that function and run:

```py
python src/dag/my_dag.py
```

It can be eased by configuring Airflow:

```text
use_cache = True
cache_ttl_seconds = 900
```

In conclusion, better use templates `{{ var.value.get('foo') }}`, not `Variables`. Configure cache.

## Others

`Param` has a `description` arg. Utilize that.

My work involves Hadoop and large volume of data a lot. One pitfall is saving large temporary data on Airflow server. Think about how the data flows before writing your tasks.

The _default_ [Xcoms](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/xcoms.html#xcoms) supports megabytes of data. It is not for data transferring. For high volume data you may consider [object storage xcom backend](https://airflow.apache.org/docs/apache-airflow-providers-common-io/stable/xcom_backend.html#object-storage-xcom-backend).
In the end Airflow is a fancy crontab in a way. It can coordinate big data jobs but itself is not Spark or any similar tool.
