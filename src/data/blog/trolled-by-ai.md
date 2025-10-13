---
title: Trolled By AI
pubDatetime: 2025-09-25
modDatetime: 2025-09-27
draft: false
description: No interview behaviour question can simulate this tricky real world problem
tags:
  - teamwork
  - AI
  - behaviour-question
---

Some typical behaviour questions:

- Tell me about a time you are under strict deadlines.
- Tell me about a time when you had to work under pressure.
- Describe a situation where you had to deal with a difficult team member.

I could give several perfect stories for an interview, showing exactly how I solved the issue and made the team better. There are no casualties and there's a happy ending. But reality does not always has good endings. All of these cherry-picked stories feel too weak compared to my real experience.

I got **trolled** by AI. Or technically the QA team member who spammed AI to conduct tests and reports.

## The Faulty QA Report

One day, I took over a pipeline along with an attached QA bug ticket. The pipeline was just an Airflow DAG. With under 250 lines of code. But I was astonished the QA had raised a full page of bugs. A ticket with 1,184 words, about the same length of this blog.

The ticket mentioned `kerberos`, `kinit` yet neither of those keywords existed anywhere in the Airflow DAG.
It also incorrectly claimed it was using `BashOperator` when all the developers of the project only used `SSHOperator`.

It claimed there were **undefined template variable**. That was what revealed the low quality of the AI. If the AI or the QA had been able to read the _entire_ codebase and dig deeper into our custom utility functions, it would have known better.

Other parts of the report were completely unhinged. The AI stated entirely **non-existent** task names, going fully delusional and outputting utter garbage.
It complained about `trigger_rule` being set to `ALL_SUCCESS` was over strict. Another wrong judgement from AI.

More frustratingly, `do_xcom_push=False` was flagged as misconfiguration, despite being an intentional design choice by the developers. An average AI would have been more reasonable.

Finally, the AI spat out more **non-existent functions**. It made me wonder what codebase was actually being fed to the AI to generate such a mess.

## Fighting Back Using Smarter AI

At first, I thought this whole thing was **funny**. So I took the original code and the QA review and pasted into my AI, asking it to review again carefully. I had my AI generate a comment that logically and clearly rejected every single one of the QA's concerns. I posted the comment to the ticket.

As a good engineer who cares about user experience, I also had my AI generate a **TL;DR** summary. It simply stated something like: "None of these concerns are valid. Please use a better model with correct context." Don't worry about the tone, the actual comment was more friendly and helpful.

## Trolling

Even with my honest and straightforward comment, the AI abuse didn't stop.

The AI replied. It apologized it had previously generated random stuff and now had been fed with correct code.
But guess what? It was **still AI nonsense**.

The new response spent a large part of its body repeating and acknowledging my previous comment, confirming that I was right.
This is another common mistake of large language models. I truly don't need or care about an AI's acknowledgment, and I hate getting long paragraphs that contain **zero new information**.

The AI then insisted again that the templated variables were undefined.
At this point, I just felt _sad_ that the QA couldn't read a single line of Python code. It would have taken them just a few clicks to follow the references and see the utility function.The project code was simple and not convoluted. Why did it have to be an incompetent AI making these judgments?

I was already tired of being trolled for the _second_ time, so I simply pasted the relevant code with line numbers directly into the comments section.

## Question

What was the best way to handle this situation?

I first asked in my team's channel and I got suggestions such as talking to the QA, raising the issue at stand-up meeting, or creating a ticket saying the bug report was incorrect.

I also reached out to my previous manager. He suggested **courtesy before force**: starting with a direct conversation and only escalate to a higher manager if the situation didn't improve.

The background is important. This was a critical project involving many engineers and managers. We had a small QA team: only **3 QA** members plus 1 QA manager. In contrast, we had **over 10 developers** creating pull requests daily.

I had a great working relationship with the _other two_ QA team members. They were very professional, raised specific bugs, and never generated non-value garbage that wasted anyone's time.

And I wasn't the only victim of the AI-generated reports. I observed how other developers handled their tickets from the same QA. Many of them were perhaps too _kind_. They quoted and responded genuinely to the AI nonsense. After speaking to one developer who didn't show any sign of frustration over the AI reports, I started to question myself: Was my drive for **high standards** and my feeling of **ownership** over the project making me too sensitive?

## Taking Action and Speaking Up

I may not be a QA expert, but I know the fundamental role of Quality Assurance is to test a system's input and output, not to perform AI code reviews blindly. When the QA team couldn't even assure the quality of the AI's own output, how could I trust _any_ of their reports?

Driven by my sense of **ownership and justice**, I couldn't simply let it go. I raised the issue to my manager, asking for his suggestion. I spoke to the QA team member in person. He explained that he was forced to rely on the AI due to _tight schedules_ and _pressure_ from the QA manager. He sincerely apologized for the troubles the AI had caused.
At that moment, I realized this wasn't deliberate "trolling". It was a result of the AI being used without the _critical human context_ necessary to filter the lengthy bogus reports.

I also offered a concrete, positive suggestion: if using AI was inevitable, at least use a better model for code analysis. I recommended _Claude_.

## Result and Lesson Learned

Despite my actions and recommendations, the situation didn't improve too much.
The subsequent QA reports still showed few signs of human involvement. It was just another AI-generated reply, producing **less noise, but still noise**. The QA didn't even bother to ask the AI to summarize a little bit.

I use AI every day, from chat bots to agents, so I know it's capable of much better. With enough context and a correct prompt, AI can be a powerful tool. This whole experience showed a crucial truth: the quality of an AI's output depends largely on the skill of the human user.

I remained unconvinced by the QA's excuses. We had two other QA members who, under the same pressure, consistently managed to produce valuable work. Their success proved that the choice of using flawed AI and lowering the quality bar was unprofessional. It wasn't about the tool. It was about the **ownership and effort** applied to the process.
