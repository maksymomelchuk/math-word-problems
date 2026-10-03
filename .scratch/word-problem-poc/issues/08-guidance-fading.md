# How does the guidance fade across the problem set?

Labels: wayfinder:grilling
Status: closed
Assignee: maksymomelchuk
Blocked by: [Which problem types and difficulty ramp does the problem set cover?](04-problem-types-and-ramp.md), [What does one guided problem look like, step by step?](07-guided-problem-flow.md)
Parent: [Map](../MAP.md)

## Question

How does the support shrink from the first problem to the last, so that by the end she plans a problem on her own, the way her homework asks her to?

Decide:

- At each level, which steps are fully guided, which become prompts only, and which disappear
- Whether she can ask for a hint, and whether hints cost anything
- When she first has to produce the plan herself, and in what form (typed, picked from options, or on paper)
- What happens when she loops back through a problem she has already solved
- Whether the last stage moves to sketching on paper (on paper she has to draw her own diagram) or to stylus drawing on a tablet, and how she enters the result of a problem she solved on paper
- A fixed fading schedule, or fading a step once she has done it right twice

Start from the suggested fading plan in [Which word-problem teaching methods work for kids her age?](01-teaching-methods.md): worked examples, then backward fading with the decode step faded last, then step headings only with mixed types, then paper with a checklist card that is removed at the end.

The last paper stage should produce the school write-up from [How does Ukrainian 6th grade expect word problems to be solved on paper?](02-ukrainian-school-format.md). The checklist card can follow its skeleton.

From [Which problem types and difficulty ramp does the problem set cover?](04-problem-types-and-ramp.md): the levels are fixed at 7 / 8 / 8 / 7 problems (one relation → two relations → inverted wording → chains), with Level 1 grouped by type and Levels 2–4 mixed. See [problem-set-plan.md](../assets/problem-set-plan.md). Decide the fading per level, including which level, if any, is solved on paper.

From [What does one guided problem look like, step by step?](07-guided-problem-flow.md): the fully guided problem is in [guided-flow.md](../assets/guided-flow.md), with a clickable mock beside it.

- **The steps to fade** are Перекажи, Знайти, Відомо, Порівняння, Тип і схема, План, Обчисли and Відповідь. Estimate was dropped, so backward fading starts from Відповідь and Обчисли.
- **Some hints are built into the steps** and can fade on their own: the relations listed for her in Тип і схема, the number of slots in План, the three-option menus, and the «Чому?» prompt.
- **Length.** The parent accepted about 15 screens (4–6 minutes) for a fully guided triangle, on the understanding that fading shortens later problems.
- **Recognition and recall.** Every guided step is a pick from a menu, while paper is recall. The fading has to get her producing the short record and the plan herself by the end of the set.
- **Her teacher requires the short record**, so the paper stage's checklist card should include it.
- **Hints, shown answers and arithmetic slips are recorded per step**, which makes "fade after two right" possible.
- Each problem carries a list of the steps it prompts. [Build the guided-problem flow](12-build-guided-flow.md) defaults it to all of them; this ticket sets it.

## Comments

### Fading proposal (2026-10-03)

An AFK draft to start the grilling from: [fading-proposal.md](../assets/fading-proposal.md). Each "Decide" bullet has a recommended answer, alternatives and trade-offs per level, and a list of open questions. Nothing in it is decided.

### Resolution

Record: [fading-schedule-v1.md](../assets/fading-schedule-v1.md) (superseded; it was `fading-schedule.md` until the revisit below), with the schedule per level, how paper steps work, what she types, hints, the checklist card, replays and what each problem needs in the data. Grilled with the parent on 2026-10-03, not with her. Four parts were then settled by how learning apps do it and by the research, as the parent asked: [fading-apps.md](../assets/fading-apps.md) and [fading-evidence.md](../assets/fading-evidence.md). The parallel [fading-proposal.md](../assets/fading-proposal.md) was read alongside.

**Answer.**

- **A faded step becomes a paper step.** The app shows the step's heading. She writes that part in her notebook, taps «Готово», and sees the model (all valid plans, for the plan) beside 2–3 yes/no self-checks that name this problem's own lines («Порівняння записане від шуканого: «AC на 5,1 см більша, ніж BC»?»). *(Research-settled: children overrate their work, and item-by-item checks against a model catch more than one «Так» / «Інакше».)* Only her paper steps go in the notebook. She doesn't copy the parts that are still prompted.
- **Fixed schedule, per level, backward**, with decode the last step the app asks:
  - Level 1: everything prompted.
  - Level 2: Обчисли and Відповідь on paper.
  - Level 3: the short record and the plan on paper too. The decode runs before she writes the record. *(Research-settled: learners learn most about the steps that are faded, and it avoids four steps going to paper at once in Level 4.)*
  - 4.1–4.3: only the decode prompted.
  - 4.4–4.5: all paper with the checklist card.
  - 4.6–4.7: all paper, no card. 4.7 is the triangle.
  - She writes the short record and the plan from 3.1, and the whole write-up from 4.1.
- **No worked examples first.** The set opens with fully guided problems, and the closing Розбір shows each worked solution after she has tried.
- **What she types.** In Level 2, each action's result, with hint-then-show from the action's hint. From Level 3, the final answer and how many actions her plan has: «Не сходиться. Перевір дії ще раз.», then the model write-up, and she taps where hers went off (short record, plan or calculation).
- **Hints.** «Підказка» on paper steps only: the step's self-question, then the model. In 4.6–4.7 it brings back the card. Free and recorded. Prompted steps keep their hints that come after a wrong answer.
- **Built-in hints.** Slot count hidden from 2.5. «Чому?» shown only while its step is prompted. Relations listed while Тип і схема is prompted. Menus stay at three. From 3.1 she picks each relation's diagram and places the «?» herself. *(Research-settled: on paper she must choose, and an accurate diagram predicts right answers.)*
- **The checklist card** is on screen in 4.4–4.5. It's the Level 4 paper-step headings stacked, and includes the short record. The wording is a draft for the parent to review.
- **Paper, not a stylus.** Only the tablet has one, and the app can't check a drawing.
- **Replays run at her current stage**: the overlap of the problem's prompted steps and her furthest problem's.
- **A missed problem** (the app had to show a typed result or the final answer) **comes back once, at the end of its level**, at her current stage. No mastery gate and no menus coming back. *(Research-settled: apps help inside the problem at once, which the PoC already does; with a fixed 30, a spaced repeat is the only retry on the same problem.)*

**My calls, flagged to the parent.** On paper, the plan is the «Розв'язання» skeleton (numbered lines with only their explanations), filled in at Обчисли. Handover screens at 2.1, 2.5, 3.1, 4.1, 4.4 and 4.6 say what she now does herself. Перекажи becomes a heading with nothing to compare from 4.1. 4.3 has no comparison, so nothing in it is prompted.

**Data.** 15 problems need full or nearly full guided data (Levels 1–2), 10 need partial data (Level 3 without given menus, 4.1, 4.2), and 5 need none (4.3–4.7). All 30 need their write-up (with the short record's «?» and comparison lines tagged for the self-checks), other plans, final answer and closing screen.

**Limits.** Not tried with her. The schedule comes from an untested suggestion, and the evidence for the research-settled parts is moderate at best. Self-checks are her own judgement. Repeated mistakes aren't flagged to anyone; that's the trial's call. The triangle comes last, with the least support.

**Glossary.** [CONTEXT.md](../../../CONTEXT.md) gains Paper step and Checklist card.

**Passed to existing tickets:**

- [Build the guided-problem flow](12-build-guided-flow.md): the data types carry a hide-slot-count flag and attach «Чому?» to its step.
- [Write the guided-step data for the problem set](13-write-guided-data.md): which data each problem needs.
- [Which Duolingo-style game mechanics go into the PoC?](09-game-mechanics.md): hints are free; handover screens; self-checks on the end-of-problem screen; missed problems come back at the end of their level.

**New ticket:** [Build the paper steps and the fading schedule](14-build-fading.md).

### Reopened (2026-10-03)

After seeing the game mocks' paper screens, the parent wrote: "I dont like this mechanics because she need to solve whole word-problem alone in notebook. it should be better way to decompose that problem and solve it step by step." The schedule above is on hold until a new grilling settles it. A new AFK proposal for step-by-step alternatives is being written in [fading-revisit-proposal.md](../assets/fading-revisit-proposal.md). Until then, [Write the guided-step data for the problem set](13-write-guided-data.md) and [Build the paper steps and the fading schedule](14-build-fading.md) wait.

### Note (2026-10-03)

From [Build the guided-problem flow](12-build-guided-flow.md): her first try of a fully guided problem, the walking boy (2.3, a Level 2 problem), "was not ease for her", in the parent's words. The Тип і схема step was unclear to both of them; that's now [How does the Тип і схема step ask for the type so that it's clear to her?](15-clear-type-step.md). Worth weighing in the grilling: how fast any support fades after Level 1.

### Note (2026-10-03, her first try of 2.3)

The parent watched her play the walking boy: "she selects option to find 60/20=3 and then messed up if she need to multiply or divide 3000/3, and even she wants to add 3000+3". So she picked the «у скільки разів» plan from the cards, but at Обчисли, action 2, she couldn't tell which operation it needs. The app has one hint per action whichever sign she picks («Час у 3 рази менший, то й відстань у 3 рази менша.»), then shows the answer. Recognising a plan card didn't carry over to computing it. That bears on how long the plan and Обчисли stay prompted, and on the dropped Estimate step: «більше чи менше, ніж 3000 м?» would have caught both 3000 · 3 and 3000 + 3. The parent chose to build per-sign hints and a direction check now: [Help her pick the operation in Обчисли](16-help-pick-operation.md). Whether the direction check stays when Обчисли goes to paper is for this grilling.

### Resolution (2026-10-03, revisited)

Record: [fading-schedule.md](../assets/fading-schedule.md), now revised; the first schedule is kept as [fading-schedule-v1.md](../assets/fading-schedule-v1.md). The starting point was [fading-revisit-proposal.md](../assets/fading-revisit-proposal.md), and its option B was taken. As the parent asked, everything they didn't have to decide was settled by research:

- [fading-revisit-apps.md](../assets/fading-revisit-apps.md): how learning apps do it.
- [fading-revisit-evidence.md](../assets/fading-revisit-evidence.md): the research.
- [fading-revisit-school.md](../assets/fading-revisit-school.md): how Ukrainian school breaks a compound problem down.

The parent made two calls: **the notebook is fine** (the objection was to the whole problem at once, not to paper), and **a solo try is offered at 4.6–4.7**.

**Answer.**

- **No problem is handed over whole.** Every problem stays a sequence of steps to 4.7, and the app checks each step before the next opens. What fades is what the app *tells* her (prompted menus, on the v1 stages), not what it checks. *(No study found harm from keeping step checks; step-checking tutors d ≈ 0.76; no app stops checking on a schedule.)*
- **From 3.1 she makes the plan herself, as school does: one action at a time.** «Про що дізнаєшся першою дією?» She writes the explanation and taps which quantity she wrote: the valid ones from all plans and `Order:` lines, the asked quantity if it's too early, or «Інше». Then she computes and types the result. After two plans in a row right first time, she writes the whole plan first and it's checked line by line. A wrong line sends her back to one action at a time. *(School: the synthetic question, no plan skeleton at grade 5–6; Учи.ру: bigger steps on success, smaller after a mistake; immediate line checks for novices.)*
- **Every action's result is typed and checked, 2.1–4.7.** A wrong result that a wrong sign gives (3000 · 3 = 9000) gets that sign's hint. *(ASSISTments' common-wrong-answer feedback.)* Her last result is the final answer, so the "where did it go off" tap goes.
- **The direction check stays when Обчисли goes to paper**, before «у … разів» and rate actions. It's never asked on «дріб від числа», where "less" means multiplying. It fades per relation type after two right in a row, and comes back after a wrong sign. *(It's the school's прикидка; choosing × or : by expected size is the documented habit and error.)*
- **The app checks what it can.** Typed results, plan-line picks, «Яка схема в тебе?» (from 4.1) and «Хто більший?» (once the decode is on paper, from 4.4). Yes/no self-checks remain only for the short record and the answer sentence.
- **From 4.4 she chooses the next step** («Який крок далі?»). The checklist card is gone. Its lines live on behind «Підказка». *(A memorised routine decays without review, so she gets four problems of it, not two.)*
- **The solo try** at 4.6, 4.7 and replays after the set: «Крок за кроком» (default) or «Спробую сама». Solo, she writes it whole and types the answer. «Розбий на кроки» is there at any time, and a wrong answer switches to step by step.
- **Unchanged from v1**: Levels 1–2, the stage boundaries and handover points, the short record on paper from 3.1 with the decode before it, free hints, hint-then-show on prompted steps, replays at her current stage. A missed problem still comes back once at the end of its level; it's now one where a plan line or result had to be shown.

**My calls, flagged to the parent.**

- The handover drafts (in the schedule), including a line when she moves to whole plans.
- The plan-line hint, the school's «Що можна знайти з того, що вже відомо?».
- «Підказка» on План asks the school's analytic chain: «Що потрібно знати, щоб знайти …?».
- In small steps, picking План runs the plan and the actions together.

**Data.** The v1 list stands: 15 full, 10 partial, 5 none. Every action of 3.1–4.7 gains a hint, about 57 counting the other plans. Sign hints and direction checks are added where they apply. Valid lines, «Хто більший?» and wrong-sign results are derived by script. The card's wording is dropped.

**Limits.** Not tried with her, and 2.3 was hard even fully guided. The prompts still fade on a fixed schedule (adaptive beat fixed in the one study). Picks after writing trust her honesty. Problems run longer (the triangle about 8–11 minutes, a guess), so plan 1–2 Level 4 problems per sitting.

**Glossary.** In [CONTEXT.md](../../../CONTEXT.md), Fading, Paper step and Plan are reworded, Checklist card is removed, and Direction check and Solo try are added.

**Passed to existing tickets:**

- [Build the paper steps and the fading schedule](14-build-fading.md): its checklist is rewritten to this schedule.
- [Write the guided-step data for the problem set](13-write-guided-data.md): the data list.
- [Which Duolingo-style game mechanics go into the PoC?](09-game-mechanics.md): the paper end screen goes, the handovers are reworded, and the solo try is added. The session with her can resume once the mock is updated.
- [Help her pick the operation in Обчисли](16-help-pick-operation.md): the direction check on paper, and wrong-result sign hints.
- [How does the Тип і схема step ask for the type so that it's clear to her?](15-clear-type-step.md): how its «Схеми» version fits the diagram fade.
