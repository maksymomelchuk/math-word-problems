# Write the guided-step data for the problem set

Labels: wayfinder:task
Status: open
Assignee: maksymomelchuk
Blocked by: [How does the guidance fade across the problem set?](08-guidance-fading.md), [Write the 30 problems and their school write-ups](11-write-problems.md), [Build the guided-problem flow](12-build-guided-flow.md), [How does the Тип і схема step ask for the type so that it's clear to her?](15-clear-type-step.md), [Help her pick the operation in Обчисли](16-help-pick-operation.md)
Parent: [Map](../MAP.md)

## Question

For each of the 30 problems, write the guided-step data its prompted steps need, in the typed data file from [Build the guided-problem flow](12-build-guided-flow.md). Follow "What each problem needs in the data" in [guided-flow.md](../assets/guided-flow.md).

- **Which steps each problem prompts** comes from [How does the guidance fade across the problem set?](08-guidance-fading.md). A problem gets data only for the steps it prompts.
- **The texts, write-ups, relations and other plans** come from [Write the 30 problems and their school write-ups](11-write-problems.md). Split each text so the question and each number can be tapped.
- **Wrong options are real misreadings** of that problem, each with a hint that points back at the text or the short record. Never a keyword rule: a hint like «менша» → віднімай is banned (see [Which word-problem teaching methods work for kids her age?](01-teaching-methods.md)).
- **«Чому?»**: at most one per problem, at its key idea.
- **The closing screen**: 2–3 checks against the condition, and the key idea in one sentence.

If all 30 are too much for one session, split by level.

AFK: the agent writes the data, and the parent reviews the Ukrainian.

From [Write the 30 problems and their school write-ups](11-write-problems.md) (see [problem-set.md](../assets/problem-set.md)):

- Each problem's `Order:` lines say which actions can swap; carry them into the data rather than writing the swaps as separate plans.
- Two-part answers (3.3, 3.7) need both parts in the Answer data; in 3.7 one part is a name.
- [check-problem-set.py](../assets/check-problem-set.py) checks every action, every other plan and the number rules in `problem-set.md`; adapt it to validate the typed data file.

From [How does the guidance fade across the problem set?](08-guidance-fading.md): which data each problem needs is in "What each problem needs in the data" in [fading-schedule.md](../assets/fading-schedule.md) (revised 2026-10-03).

- **Revised 2026-10-03.** The schedule was revisited: every problem now stays step by step, and every action is checked. The list below replaces the first one.
- **Levels 1–2**: full guided data, except Level 2 has no Відповідь menu.
- **Level 3**: text, retell, asked, decode, «Чому?» (after the decode only), relations and diagram. No given menus (she writes the short record herself), plan cards or answer menu. Her diagram pick needs no data, since each type's diagram is fixed.
- **4.1 and 4.2**: the text with comparison spans, the decode and «Чому?». **4.3–4.7**: no guided-step data.
- **Every action of all 30 problems, in every valid plan.** The actions in 3.1–4.7 now need this too, because from 3.1 she types each action's result, and the app checks it.
  - Its hint, used on a wrong result. That's about 57 new ones for 3.1–4.7.
  - Sign hints, for each wrong sign where a wrong sign is a likely mistake (у разів, rates, inverted wording), as [16](16-help-pick-operation.md) does for 2.3 and 4.7. A wrong result that a wrong sign gives triggers them.
  - A direction check on «у … разів» and rate actions whose result is bigger or smaller than a number she knows. Each one names the relation type it belongs to. **Never on «дріб від числа»** or any multiplier below 1.
- **All 30** still need the write-up, the other plans with their `Order:` lines, the final answer (3.7's two names for its name pick), and the closing screen's checks and key idea. In each write-up, tag the short record's «?» line and its restated comparison lines. The short record's self-checks and the «Хто більший?» pick are filled in from them.
- **Derived by script, not written**: the valid plan lines at each point (from the plans and `Order:` lines), the asked-quantity option, the action count and the wrong-sign results. Extend the checker to build and test them.
- **The checklist card is gone**, so it needs no wording. The parent reviews the handover drafts in the schedule along with the data's Ukrainian.
- The heavy part is Levels 1–2 (15 problems), so if it's split, split there.

From [Build the guided-problem flow](12-build-guided-flow.md): add the problems to `poc/src/problems/problems.ts`, typed by `poc/src/problems/types.ts`. The tests run the checker (`poc/src/problems/validate.ts`) over every problem. Each action's id is shared across plans and used by the plan cards, and a problem's `Order:` lines become a `needs` list on each action.

## Comments

### Note (2026-10-03, started early)

Claimed by the orchestrator. Started before [How does the Тип і схема step ask for the type so that it's clear to her?](15-clear-type-step.md) and [Help her pick the operation in Обчисли](16-help-pick-operation.md) close, and in parallel with [Build the paper steps and the fading schedule](14-build-fading.md): the parent is away overnight, delegated everything, and asked for the real app by morning. The data is variant-independent: every version of Тип і схема reads the same `quote`, `id`, `note`, `type` and `hint`.

Four agents, one per level, each in its own git worktree, write `poc/src/problems/level1.ts` to `level4.ts` (without 2.3 and 4.7, which exist). The orchestrator merges them into the main tree after the fading build, against the data contract in that ticket's note: `RecordLine.tag` (`'asked' | 'restated'`) with `compare` on restated lines, and `DirectionCheck.relationType`. The derived parts (valid plan lines, the asked-quantity option, the action count, «Хто більший?», the wrong-sign results) are code, in the fading build.

### Progress (2026-10-03, data written)

All 28 problems have their data, one file per level, each written in its own worktree against the contract. Each passes the validator, the type check and lint there. Each was compared word for word with [problem-set.md](../assets/problem-set.md) (texts, short records, every action line, other plans, `Order:` → `needs`, answers), and every action's arithmetic was rechecked exactly. They merge into the main tree after [Build the paper steps and the fading schedule](14-build-fading.md) lands.

- `level1.ts` (1.1–1.7): full guided data, plus `level1.test.ts`. The tests check the texts against problem-set.md, that no wrong sign gives the right result, the tags, `relationType`, that menus have 3 options, at most one «Чому?», and a keyword-rule regex.
- `level2.ts` (2.1, 2.2, 2.4–2.8): full guided data except the Відповідь menu. Missing references (2.1, 2.7) and unstated facts (2.4's cost, 2.8's «таких самих», 2.6's meeting time) get hidden questions in Відомо.
- `level3.ts` (3.1–3.8): text, retell, asked, decode with «Чому?» (only where a comparison is given: 3.1, 3.2, 3.4, 3.8), relations and diagram. 3.7's two parts are drawn equal, so the picture doesn't answer «хто більше».
- `level4.ts` (4.1–4.6): the decode and «Чому?» for 4.1–4.2. The orchestrator's addition: relations and a diagram for every problem, for «Яка схема в тебе?» and its model.

Calls across levels:

- **Sign hints** on every action whose wrong sign is a likely mistake. Levels 1 and 2 have them on every action, as 4.7 does.
- **Direction checks** only on «у … разів», rate and motion actions with a known number to compare against, each with `relationType`. None on «дріб від числа».
- **One clarification of the contract**: in 1.1–1.3 the «?» line is also the comparison line. It carries `tag: 'asked'` and `compare`, and any line with `compare` counts as a restated comparison.
- **Two validator rules** needed easing: a fraction's numerator 1, and a number a unit change converts, both now count as used, as `check-problem-set.py` already did. They're passed to the fading build.

**The parent's checklist** (after the merge and deploy): review the Ukrainian. That means the menus, hints, sign hints, direction questions, «Чому?», closing checks and key ideas in `poc/src/problems/level1.ts`–`level4.ts`, and the handover drafts in [fading-schedule.md](../assets/fading-schedule.md). The easiest way is to play each problem on the iPad with the stage switch. Note any line that reads wrong.

### Progress (2026-10-04, merged and deployed)

The four level files are merged into the main tree (`poc/src/problems/level1.ts`–`level4.ts`, plus `level1.test.ts`) and registered in `problems.ts`. All 30 problems pass the validator, including the fading build's new rule that each problem's data covers what its stage prompts. The type check, all 153 tests and lint pass. They're live at https://reliable-macaron-77e751.netlify.app, and the home screen lists 1.1–4.7. The checklist above stands. A proxy playthrough of every problem at its stage runs next.

### Progress (2026-10-04, proxy playthrough)

An agent played all 30 problems at their own stage on the live link in WebKit (820×1180, then 1180×820 and 390×844), each with deliberate mistakes on every kind of step, about 250 in all. Every hint matched its mistake. It fixed the data where needed (live since 2026-10-04):

- 2.3's hint on «Час, за який хлопчик пройде 3000 м» wrongly said 20 min.
- 1.3's «Чому?» named the operation before Обчисли, and its key idea is reworded.
- 3.7's sign hints argued from a missing phrase, close to a keyword rule.
- About 20 grammar and euphony fixes, such as «обидва швидкості» and «не в 3,7 раза».

Two left:

1. **3.7's plan-line option gives the answer away**: «на стільки більше риби наловив Денис, ніж Марко» tells her who caught more before she computes. The orchestrator's call: plan lines get their own optional wording (`line` on `Action`), used for the plan-line options and «Підказка». The write-up's explanation stays as the parent approved it. That's in the polish pass.
2. **«Заплатив/Заплатила — 200 грн»** in the short records of 2.4 and 4.5 comes from the approved [problem-set.md](../assets/problem-set.md). Left for the parent's review.

### Note (2026-10-04, 3.7 fixed)

The 3.7 leak is fixed and live (`index-BJxR-Pgc.js`). `Action` has an optional `line`, the plan line's words when the explanation would give an answer away. 3.7 action 2's plan line reads «на скільки кілограмів один брат наловив більше, ніж інший». It's used for the plan-line options, the asked words and «Підказка»'s model lines. The write-up keeps the approved explanation. A new validator rule flags any plan line that names a name-answer option, and 3.7 was the only leak. Accepted as is: once she has picked 3.7's line 2, the write-up line «2) … — на стільки більше риби наловив Денис…» shows before she computes it. By then she has 2,85 against 2,45 in front of her, which is how «хто» is meant to be answered.
