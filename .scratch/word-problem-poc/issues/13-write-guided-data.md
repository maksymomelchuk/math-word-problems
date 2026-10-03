# Write the guided-step data for the problem set

Labels: wayfinder:task
Status: open
Assignee:
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
