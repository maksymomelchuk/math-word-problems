# Build the paper steps and the fading schedule

Labels: wayfinder:task
Status: open
Assignee:
Blocked by: [How does the guidance fade across the problem set?](08-guidance-fading.md), [Build the guided-problem flow](12-build-guided-flow.md), [How does the Тип і схема step ask for the type so that it's clear to her?](15-clear-type-step.md), [Help her pick the operation in Обчисли](16-help-pick-operation.md)
Parent: [Map](../MAP.md)

## Question

Build the fading from [fading-schedule.md](../assets/fading-schedule.md) (revised 2026-10-03) into the PoC, on top of the guided-problem flow, so that each problem plays at its stage.

- [ ] **Each problem's stage** comes from its slot (1.x, 2.1–2.4, 2.5–2.8, 3.x, 4.1–4.3, 4.4–4.5, 4.6–4.7) and sets its prompted steps and built-in hints, as in the schedule table
- [ ] **Paper steps, always one at a time**: the heading, «Готово», then that part's check (below) before the next step opens. There is no whole-problem mode outside the solo try
- [ ] **Level 3 order**: Перекажи → Знайти → Порівняння → the short record on paper → Тип і схема → the plan and actions on paper → Відповідь. The decode runs before the short record exists, and its restated sentence stays on screen for her to write in
- [ ] **Level 2 actions**: for each action of her card plan, the app names it, asks the direction check if it has one, and takes the result on the keypad
- [ ] **Her own plan from 3.1, in small and big steps**:
  - **Small steps**, one action at a time: «Про що дізнаєшся першою дією? …», «Готово», then «Що знаходить твоя перша дія?». The options are the valid quantities at that point (from all plans and `Order:` lines), the asked quantity if it's too early, and «Інше». Then the direction check, then the typed result.
  - **Big steps**: the whole plan, then «Скільки дій у твоєму плані?», then the line picks, then the actions one at a time.
  - **Switching**: she starts in small steps at 3.1. She moves to big steps after two problems in a row with every plan line right first time. A plan line not right first time sends the next problem back to small steps.
  - **A plan miss**: «Що можна знайти з того, що вже відомо? Подивись на короткий запис.», then the valid lines with «Виправ у зошиті».
- [ ] **Typed results, 2.1–4.7**:
  - A wrong result that matches a wrong sign with the same numbers (or a swapped order for − and :) gets that sign's hint. Any other wrong result gets «Не сходиться» and the action's hint.
  - A second miss shows the action with its reason. If the sign wasn't inferred, «У тебе така сама дія?» follows. Then «Виправ у зошиті».
  - Her last result is the final answer. Two-part answers: 3.3 takes two results; 3.7's name part is a pick between the two names.
- [ ] **The direction check, on paper too**: before marked actions. It fades per relation type after two right in a row, each counted only if the action after it is right too, and comes back for a type after a wrong sign there. Once it has faded, «Підказка» on the action asks it
- [ ] **Checks on paper parts**:
  - «Яка схема в тебе?» from 4.1, a pick (the right one follows from the types), then the model and ««?» стоїть там, де шукане?».
  - «Хто більший: X чи Y?» for each comparison from 4.4, derived from the tagged restated line.
  - Yes/no self-checks beside the model for the short record (from 3.1) and the answer sentence (from 2.1), filled in from the write-up's tagged lines. After any «Ні»: «Виправ у зошиті», then «Далі».
- [ ] **«Який крок далі?» from 4.4**: the eight step names. A wrong pick gets «Спершу — ⟨step⟩.» and opens it. A missing step gets «Тут немає порівняння.». In small steps, План runs the plan and actions together
- [ ] **The solo try at 4.6, 4.7 and replays after 4.7**: «Крок за кроком» (default) or «Спробую сама». Solo shows the problem and the keypad for the final answer, with «Розбий на кроки» at any time. A wrong answer («Не сходиться. Розберімо крок за кроком.») or «Розбий на кроки» runs the step-by-step flow from the first step at her stage
- [ ] **«Підказка» on paper steps**: the first tap shows the step's self-question, the second the model (for a plan line, the valid lines). The self-questions are in the schedule's Hints section
- [ ] **Built-in hints**: the slot count hidden from 2.5. «Чому?» shown only while its step is prompted. From 3.1, after naming each relation's type, she picks its diagram from the three, the app draws the combined diagram, and the «?» is a chip she places. If [15](15-clear-type-step.md) picks «Схеми», she already picks sketches from Level 1, and only the «?» is new at 3.1
- [ ] **Handover screens** at 2.1, 2.5, 3.1, 4.1, 4.4 and 4.6, plus the line when she moves to big steps and the one when she moves back. The drafts are in the schedule. Keep them plain; the game layer may dress them up later
- [ ] **Replays** at her current stage and step size: the overlap of the replayed problem's prompted steps and those at her furthest problem. After 4.7, the solo try is offered
- [ ] **Missed problems come back**: a problem where the app had to show a plan line or a result is queued once at the end of its level (after 4.7 for Level 4), and plays as a replay. A second miss doesn't queue it again
- [ ] **Recorded per step** in the progress module, alongside the guided steps' records: plan-line picks, step-size moves, typed results with the inferred sign, direction answers and fade state per type, next-step picks, self-check answers, «Підказка» taps, the solo-try choice and where it switched
- [ ] **A stage switch** for the parent, so the walking boy and the triangle (which have full data) can be played at any stage, and in small or big steps, before the other 28 problems' data exists
- [ ] Deployed

Out of scope here: the game layer ([Which Duolingo-style game mechanics go into the PoC?](09-game-mechanics.md)) and the other problems' data ([Write the guided-step data for the problem set](13-write-guided-data.md)).

AFK: the agent builds it; the parent checks it on the device. For UI work, use `/impeccable` or `/emil-design-engineering`.

Resolved when the parent has played the triangle through at every stage, in small and big steps and as a solo try, on her main device from the deployed link, using the stage switch. The resolution records anything the build changed from the schedule.

From [Scaffold the PoC shell and deploy it to Netlify](10-scaffold-and-deploy.md): her main device is an iPad Air on iPadOS 18, opened from the home-screen icon (standalone, Safari's engine). Test there first: portrait and landscape, touch only.

From [Build the guided-problem flow](12-build-guided-flow.md): add a `'paper'` mode where the code already decides each step's mode and builds its screens, `stepGuidance()` and `buildScreens()` in `poc/src/guided/flow.ts`. The paper models are already in each problem's write-up, which is always present. The hide-slot-count flag already works: she picks how many plan cards to use.

From [How does the guidance fade across the problem set?](08-guidance-fading.md), revisited: this checklist was rewritten to the revised schedule. Gone from v1: the whole-problem paper mode, the checklist card, the final-answer and action-count check from Level 3, and the "where did it go off" tap. It builds on [Help her pick the operation in Обчисли](16-help-pick-operation.md)'s `signHints`, `reason` and `direction` on `Action` (`poc/src/problems/types.ts`) and its `checkAction` and `checkDirection` (`poc/src/guided/checks.ts`). Each direction check also needs the relation type it belongs to, for the per-type fade. It now waits for both prototype tickets: the parent's verdicts on the direction check and the Тип і схема version decide what this builds on.

## Comments
