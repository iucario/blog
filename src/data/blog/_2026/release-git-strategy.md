---
title: Git and Release Strategies I've Seen Go Wrong and What Works Better(zh)
description: The bad release practices and weak ownership I've seen and the better alternatives.
pubDatetime: 2026-08-22
modDatetime: 2026-08-22
tags:
  - git
  - DevOps
  - Chinese
---


吐槽我见过的 Git 和 Release 策略的罪恶。这些罪恶的策略很不实用、不自由不灵活。再讲讲我见过的更好的策略，和更适合我们的方法。
如果你见过好的策略或奇葩的策略，不妨在评论分享讨论 ^_^

凑数封面图。
![git](../../../assets/images/Git%20Branching%20and%20Merging-2026-08-22-081749.svg)

## Gatekeeping 强欲

创建一个 PR，会自动测试并且 build image 并 push 到 registry。\
想要部署的话，可以直接用 GCP console 或者 Kubectl set image，如果我有权限的话。然而我没有。\
每次我都不得不给 DevOps 发消息给我 grant PAM。这是一大障碍。既然我要了 STG 权限就能给，那么不如直接给我永久的权限。

## Git Tags Spam 暴食

DevOps 所设想的使用方法更是幽默。我需要给我的开发中的 branch 打上 git tag。这个 tag 需要是 v1.2.3 格式才能被 CICD workflow 识别。\
流程与没有 tag 的 PR 流程一样，不过最后一步，它会给我们的 helm-charts 的 repo 起一个 PR，内容是修改 image tag。\
Semver 是好的，但我们**用坏**了它。很难以置信一个开发中的 branch 如果想要部署在 DEV 或是 STG 环境中需要 git tag.

> [!IMPORTANT] 不要滥用 tag
> Release Git tag 永远应该只指向到 main 的 commit。否则将导致无止尽的冲突。

GitHub 会保留所有 tags 哪怕是已删除的分支上。如果真的遵守规定，最终的结果是不同人 git tag 冲突，没有人知道下一个小版本是否已被占用，没有人清楚 release 时应该是什么版本。代码库也会多出很多无关的 tag，没有人知道一个 Semver 是否是可以 rollback 到的正经 release。\
我会 force push 我的 tag 到最新的 commit 上，其他人可不能保证。何况最终 QA 测试通过的版本 tag 我无法无风险地删掉。将来万一要调查什么，我才能拿出这个 tagged commit。

## Helm Charts Repository 傲慢

没有将 Kubernetes 配置放在代码自己的 repo 里，而是选择用一个 Helm charts repo 管理所有的服务所有的代码库。这是一个**错误**。

Helm repo 里分别声明了不同版本的 values 文件，只有一个 main branch，它反映了当前的部署状态事实。\
创建这个大统一 repo 的人可能以为这样就很完美了，很清晰。我很感谢这个作者至少没有试图在 helm charts repo 里引入任何 Git Flow，那样会让事情变得更混乱。

这个 repo 本身就是罪恶的，比如这样的问题就会出现，在某个版本，我们决定更改一个环境变量的值。部署到 STG，自然我们必须更改 helm charts 的配置。\
然而因为某些原因这个版本被推迟发布了，于是 STG values 被复原了。在一段时间之后终于这个版本要发布了，此时我们只能寄希望于工程师还记得这件事，或是有足够的文档。否则就会出现部署失败或是应用出错的问题。

## Stakeholder Review 怠惰

不可避免的客观事实是，1. 这是一个多人协作的项目。2. 如同很多日本公司一样，release 需要领导审批，通常要提前一周万事俱备，一周间只能等待。\
[Trunk based development](https://www.atlassian.com/continuous-delivery/continuous-integration/trunk-based-development) 在这里不 work。

各种验收结束，QA 测试完，等待发布的这一周里，不可控的事情太多了。\
a) 可能有更紧急的发布插队。b) 可能有安全漏洞被发现需要打补丁。\
理论上任何代码变动都需要重新测试，会耗时耗力。如果你们有全套的自动化测试那还好，可如果和我们一样需要大量依赖人手工测试的话，代价可太高了。

Release 这种事情就该由一个人决定日程。可是当你有一个不管理的领导，那就**享大福**咯。

## The Better Approach

我支持极少人数的团队，至少一个服务不应该由超过 2 个人维护。这 2 个人我指包括开发和 Ops。当只有 2 个人做决策的时候，一切都会变得简单。
不过实际上还是得考虑多人多团队的情况。那么 Git 和 release 的流程就很关键了。

- Main branch 一定是唯一事实\
  无论是：a) 先 merge 到 main 再发布。 b) 先发布再 merge 到 main。

- Image Build 一定要把 commit hash 放进去。例如 `my-app:abcd123`。可以视情况加入 datetime。

- Release Git tag 永远应该只指向 main 的 commit。正如我上面强调过的那样。\
  通常 tag 表示这个版本是已经发布的或是马上可以发布的。在 image tag 加上这个 git tag。例如 `my-app:v2.3.4-abcd123`

- 需要有 Image promotion\
  在 QA 环境中通过测试的 image 应该被直接 promote 到 prod registry。生产部署要固定 image digest。

- 非生产环境的部署应该是 branch based\
  部署到 DEV STG 应该是非常轻松的事情，不应该有任何阻碍。选择你的 branch，点击部署。就这么简单。

- 谨慎考虑 Helm-charts repository 的必要性\
  将 Kubernetes 配置放在离代码最近的地方是最好的。让 infra 代码也和应用代码一起 version control。\
  如果需要复用 infra 代码，抽象成 package 或是什么，但是也要尽量少的抽象。

- 自动化端到端测试至关重要\
  QA 团队的技术力是很重要的。QA 不应该成为这个流程的 blocker。\
  自然，后端和前端开发应该有自己的完备的自动化测试。

- 领导应该承担责任，做他们该做的工作。当有发布冲突或是紧急情况插队时，他们要及时调整日程。

- Release 应该足够频繁\
  一次性 release 一个大的是很有风险的，同时在此期间同时维护 2 个或多个 branch 也是很容易出错很浪费资源的。\
  如果领导和 PM 不确定产品的形态，可以用 feature flag 等手段控制。
