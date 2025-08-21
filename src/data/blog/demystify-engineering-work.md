---
title: The Demystification of The Work of Programmers(zh)
description: When the job no longer excites me so much, I realize I am outstanding.
pubDatetime: 2025-08-20
modDatetime: 2025-08-21
tags:
  - chinese
  - work
  - life
  - whining
---

世界是一个草台班子。最近对程序员的工作祛魅了。

没有工作前的我所幻想的程序员工作是，认真、严谨、理性、高效、有创造力的。工作后发现完全不是所想的那样 cool，甚至有些肮脏。\
很多 Ad-hoc，很多东拼西凑，很多妥协，很多业余上阵。

从一个故事说起。

## 故事

一个 20 多位优秀工程师的团队，大家就一起 copy paste 了一个人最先写的一段 Python 代码。但是没有一个人发现这段微微复杂的逻辑其实是错误的。

代码大体上是这么个逻辑：

```py
mode = 'default'
env = 'prod'
val = '' if mode == 'default' else 'some_value'
# 40 lines later ...
val = val if env == 'prod' else '' or 'value_i_want'
```

很简单一个测试可以说明，这段逻辑不会给出预期结果：

```py
>>> '' if True else '' or 'value_i_want'
''
>>> ('' if True else '') or 'value_i_want'
'value_i_want'
```

我能发现，因为：

1. 我不爱这种 Python 写法。看似灵活，其实很容易出错
2. 我质疑一切我一眼看不懂的写法，特别是 Python
3. 针对 Airflow 而言，我讨厌在 Task 里面写一堆 Jinja2 template 尤其还是有 conditional 逻辑的 template
4. 这个变量被定义了 2 次，非常不符合 best practice，我雷达响了
5. AI 说的。没错，我怀疑我是团队里唯一一个会使用 AI 辅助 code review 的

我提出这个问题之后，有几个人留言和我掰扯。但是似乎没人看懂重点，重点在于这是一个 Python 上的逻辑错误。第二天组会里又给大家讲解，有个人还是没理解我讲的问题，我知道他为什么不理解，因为他不太懂 Airflow。QA 在会议上没看懂，最后是给 QA 当面演示后团队里才普及正确的写法。

那么多 Tech leads，Senior engineers 没想到是我一个等级最低、salary 最低的发现并且解决这个问题。

然而更让人伤心的是 manager 看不到我的能力。

## 我很优秀 我认了

正如上文所述，我可以说是这个 Airflow 团队的中坚力量之一了。我 review 了很多 PR，提出了多个关键建议。\
令人绝望的是，我的 manager 给我的任务是让我学习我们项目的 ETL，包括 Airflow 以及其他一些不是 Airflow 的 ETL。我都工作一年半了，还在被当新手。\
这个 manager 是新来的还不熟悉我，所以他不知道。

我可以自豪地承认，我是我们 Team 10 多个人里:

- 最好的 Python 使用者，虽然工作一年多，但是 10 年老 Python 了
- 最好的 React 使用者，组里没有前端工程师，我是业余组最好的
- 最规范的 Shell Script 使用者，因为我会 shellcheck 而别人我没见过用
- 最优秀的文档编写者，所有人都深受 Confluence 其害，只有我反抗使用 GitHub Pages host 文档
- 最好的 mentor，因为获得了 mentee 的评价：「一生ついて行く」
- 最具有开源精神的，经常开源分享各种自用工作效率工具

不知道什么时候开始，我环顾四周发现，最靠谱的人之一竟然有我自己。

**我很优秀，我认了**。
