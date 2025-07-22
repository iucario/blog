---
title: Upgrading React Exposes Problems But That’s a Good Thing(zh)
slug: upgrading-react
description: What I learned from handling a Frontend bug and working in a team
pubDatetime: 2025-03-07T00:00:00Z
modDatetime: 2025-03-09T00:00:00Z
featured: true
tags:
  - front-end
  - react
  - refactor
  - troubleshooting
  - chinese
---

## Background

半路参与了前端开发，本来是一个新人和一个老人在做。新人写得非常乱，老人也没有多干预。没有说帮忙搭好框架建好文件夹，配置好工具什么的。

我看到这种乱象当然不能忍，上来几个 commit 都是重构、配置、工具、升级等。把 webpack 换成了 vite，build 速度快了 2 倍。加上合理的 format lint 规则，自动检查 staged 提前发现低端错误。把大的组件拆分成 2 个，职责更明确，更好更改 debug。期间自然也在做修复 bug，新增功能等完成来自产品的需求。

## The Temptation of The Latest Version

但是最近我先是把一个前端 UI Lib 升级了。促使我升级的理由很诱人，这个 UI Lib 在新版本加入了 TypeScript 支持。何乐而不为。升级本身也没什么，我帮其他组件也改了以适应升级。因为之前等于是没有 type，升级了后 type 不符合所以会报错，我当然也不是纯闲的给其他文件改类型。

这次大的更改引起了老人的注意。他警告我没事不要乱改，虽然能理解我想要重构是好事，但是不要乱升级。并且 commit 信息里要写清楚改动。

## No Alternative But To Upgrade

这个 PR 还没 merge 呢，在一边加 unit test 一边修改组件逻辑的同时发现了另一个问题。是更新 UI Lib 带来的。具体来说是 Select 无法使用。我尝试了更换 Lib ，结果 MUI 的 Select 只要一点击就无限循环。我还认真看了所用的 UI Lib 的代码、打开了 StoryBook。但是找不到我的代码的原因。

我发现 UI Lib 用的 React 是 18 || 19。Package.json 是这样写的，并且错误信息提到了 FlushSync 这个 React 19 的新特性。我想也许更新 React 能有用，试了一下果然 Select 的问题解决了。于是 commit 了。\
与新人讨论了一下，也在 commit message 里写了无可奈何升级的 React 19 以及做了一些必要的改动。让新人 review 了一下感觉没问题，简陋的测试也通过了，于是 merge 了。

然而这里一切都看起来很美好圆满解决的时候，还有危机隐藏着。

## Maximum Recursion

第二天，老人一大早给我们 3 个拉了个群，长篇打字再次强调不要毫无理由地重构或是更新，不要为了重构而重构，意大利面代码可能因为一个重构或者升级就崩溃了。如果要重构升级，一定要做好完备的测试，非常重要！然后告诉我们一个 DatePicker 坏了，让我们自己去看那个页面，并且截图了 main branch 的 Merge 记录说是这些 commit 中的导致的。让我们 fix。

我立刻意识到自己的测试忽略了这个页面，并且承认了自己的错误。

## Debugging

然而解决问题更吸引我，打开那个 bug 的页面显示一片空白，console 显示 Maximum Recursion 的错误。这个错误前两天见到过，当时是因为用了 MUI 的 Select。我先在组件里第一行返回 Null，果然页面正常了，可以确定是这个 DatePicker 组件的错误。

我删除了引入 MUI 和其他 Lib 的代码，然后错误没有消失。这时我意识到是组件的代码逻辑本身有问题。
于是我仔细看了代码，首先删除了 useEffect，因为通常 state 更新处理不当容易导致 Maximum Recursion。果然错误消失了。

简单解释这个错误。改的部分称为 child 吧，接受 2 个参数，它从 parent 接受 **data** 显示，和一个 **update**  function 更新数据到 parent. 这是很正常的 React 的操作。

然而这个 child 的问题是它会在检测到 data 更新时进行 validation，然后把 validation 结果传回 parent。怎么传？它把 valid boolean 放进 data 里然后 **update**。\
Parent 给 child data，child validate data 后更新 valid 与否，更新造成 parent 数据更新尽管数据的值不一定变，parent 传入新的 data 造成 child re-render。无限循环。

发现问题后我立刻在群里汇报，然后开始更改。更改并没有找 bug 那么简单，因为 parent 需要 validate 但是 parent 自己没有 validate 的逻辑，必须让 child 计算更新 state 获得。\
我不想更改太多文件，以免又造成什么意外错误。暂时选择了用 useRef，感觉不够保险。最终还是从根源解决问题，直接在 parent 里 validate.

加上其他一些小修改，Push 代码，问题解决，就等另外 2 人的 review 了。这次在 merge 前我决定每种页面一定要都检查一遍，并且加上尽量完整的单元测试。这次的错误如果单元测试随便测一下也不至于那么晚才发现。

## Murphy's Law

> Anything that can go wrong will go wrong.

DatePicker 组件是老人写的，1 个月前我就发现在操作上有些 glitch，仿佛数据没有更新或是更新太快，有种卡卡的感觉。当时我没有时间解决它，这个问题也没有被 QA 发现所以没有得到重视。也许这次这个问题再次被交给我是因为我有准备吧，也是一种天意。

事实上，React 18 为什么没有彻底暴露这个问题倒是让我不明白。升级到 React 19 让本来的小问题变成了让页面爆炸的大问题，其实是一件好事。\
这下 2 个问题都一起解决了，我改了之后就不再有卡卡的感觉了。也许卡就是因为之前页面也有一定程度的循环占用了很多资源吧。切到我接手前端前的 commit 加入 console.log 发现，无限循环早就存在，证明它的逻辑根本上就是错误的。

虽然老人的发言都很正确，一个系统能用就不要动。但是趁现在产品还没有上线，此时不重构升级，之后更加没有机会，风险更大。我始终相信只要项目的架构设计健全了，Developer 也更不容易犯错，更好写出高质量的软件。我实在无法放任一个还没有发布的项目就已经是屎山。

在这个错误上，事实证明升级只是让潜在问题暴露，有问题的逻辑本身才是罪魁祸首。

我仍然会重构、更新、追求写能跑也好看的代码。但是会更加重视测试，谨慎地重构。
