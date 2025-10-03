---
title: Almost Got Trolled By AI
pubDatetime: 2025-09-25
modDatetime: 2025-09-25
draft: true
description: No interview behaviour question can simulate this tricky real world problem
tags:
  - teamwork
  - AI
  - python
  - airflow
---

The typical behaviour questions:
Tell me about a time you had conflict with a teammate.
Tell me about a time you are under strict deadlines.
Tell me about a time you are under stress.

All of them are too weak compared to my real experience.

I got trolled by AI. Or technically the QA who abuses AI to do the test and reports.

## The Bullshit

One day I took over a pipeline together with a QA bug ticket. The pipeline was just an Airflow DAG. With under 250 lines of code. But I was astonished the QA raised a full page of bugs. There are 1184 words in the body but none of the words made any sense to me.

The QA mentioned `kerberos`, `kinit` but no they didn't even existed in the DAG.
Also `BashOperator`. Impossible because we only used `SSHOperator`.
Stated there were undefined template variable. That was what revealed the bad quality of the AI. If only the AI could read more code and dig deeper into the custom utilites, it would have known.
Other than these, the AI also stated totaly non-exist task names. It just went fully delusional and started outputing garbage.
It complained about `trigger_rule` set to `ALL_SUCCESS` was over strict. Another stupid judgement from AI.
Then `do_xcom_push=False` was viewed as misconfiguration. Which was intentional by developers. Average AI would have been more reasonable.
Then it spit out more non-exist functions. Who knows what code was being fed into the AI.

## Fighting Back Using AI Properly

I thought it was fun at first. So I pasted the DAG and the QA review into my AI and asked it to review again carefully. I let my AI generated a comment rejecting each of the QA concerns logically and clearly. I posted the comment to the ticket.

As a good engineer who cares about user experience like me, of course I also asked my AI to generate a TLDR that basically said: "None of the concerns are valid. Please use a better AI and come again".

## Trolling

Even with my honest comment, the AI abuse was not stopped there.

The AI replied. It apologized it had generated random stuff and now it has been fed with correct code.
Yes but Still AI nonsense.

It used a large part repeating what I commented and acknowledged that I was right.
Again, a common mistake of AI. I really don't care about AI's acknowledgement. And I hate long paragraphs with zero information.

Then it still insisted the templated variables were undefined.
I only felt sad that the QA cannot read a single Python code. It was just a matter of a few clicks of references then the QA would see the utility function. The project code was simple and not convoluted. Why it has to be a incompetent AI?

I was already tired of being trolled the second time so I pasted the code with line numbers to the comments.

## Question

What was the best solution under this situation?

I asked in my team's channel and I got suggestions like talking to the QA, raising the issue at stand-up meeting, creating a ticket saying the bug ticket was incorrect.

I asked my previous manager. He suggested me talk first then report to upper manager if not getting better.

Background was that it was a very important project and involves many engineers and managers. There were only 3 QAs + 1 QA manager. But there were 10+ developers creating pull requests everyday.

I worked with the other two QAs. They were very nice to work with and professional. They raise specific bugs. They never produce non-value garbage that waste both sides' time.

Of course I was not the only victim. I observed how other developers handle their tickets reviewed by the same QA. Many of the developers were too kind that they quoted and responded genuinely. Made me question myself, am I too aggresive? Too responsible?

## My Action

I don't know how professionaly QA works. But I do know QA should test the input and output of the system, rather than doing AI code review.

QA cannot even assure the quality of AI outputs. How can I trust any of the test reports.

I couldn't bear it because I had ownership and justice in my heart. I raised the issue to my manager, asking for his suggestion. I talked to the QA in person as well. He explained he had to do this because the tight schedule and push from QA manager. At this time I realized it was not trolling. It was simply because of incompetency. Anyway, he should discuss with his manager, not coping with work that decreased the bar.

I said that if had to use AI, at least use a better AI model for coding. I recommended Claude.

## Result

Nothing is changed. No sign of human involve. Just another AI generateing less garbage but still garbage.
