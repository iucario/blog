---
title: Hadoop Notes
pubDatetime: 2025-10-09
modDatetime: 2025-10-09
draft: true
description: Hadoop, hive
tags:
  - Hadoop
  - Hive
  - HDFS
---

## Hadoop Clients

hadoop, hive, beeline, spark-sql, spark-shell, pyspark, spark-submit, hbase, etc.

Access HDFS data;

Run Hadoop jobs (MR, Hive, Tez, Spark, Hbase, etc.)

## HDFS Cluster

Distributed Data Storage.

NameNode: Manage meta-data of HDFS (HDFS dirs, files and blocks)\
JournalNodes: Manage transaction of HDFS\
DataNode: Store data

## YARN Cluster

Distributed Data Processing

ResourceManager: Manage jobs (Scheduler, Resource allocator)\
NodeManager: Launch and manage tasks\
JobHistorySerever: Manage job history for MapReduce jobs\
TimeLineServer: Manage job history for other jobs\
Spark History: Server Manage job history for Spark jobs

## Hive

MetaStore DB (MySQL): Store meta-data of Hive (Database, tables, etc.); Invisible to users.\
MetaStore Service: Provides Thrift API to access Hive MataStoreDB for clients (bin/hive, spark, etc.); Deprecated from Hive version 2.0;\
HiveServer2 Service: Provides JDBC API to submit jobs for clients (hive beeline, etc.); HiveServer2 are shared by multiple users; User can apply to have dedicated HiveServer2 to avoid impact from other users;

## Zookeeper

Hadoop components use zookeeper such as configuration repository, HA manager, etc.

Some of Hadoop such as Hive, Hbase use it to store object information, etc.

## Ambari

Dashboard. Ambari provides an intuitive, easy-to-use Hadoop management web UI backed by its RESTful APIs.

By default uses port 8080. Default user/pass: `admin/admin`.

|Component |Ports |Purpose|
| --- | --- | --- |
|Ambari Server| 8080, 8440, 8441| Web UI, Agent communication|
|Core Hadoop |8020, 9000, |50070, 50075 HDFS NameNode, DataNode HTTP|
|YARN| 8032, 8088, 19888 |ResourceManager, UI, JobHistory|
|Hive| 9083, 10000 |Metastore, HiveServer2|
