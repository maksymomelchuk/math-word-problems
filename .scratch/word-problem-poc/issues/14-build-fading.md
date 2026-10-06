# Build the paper steps and the fading schedule

Labels: wayfinder:task
Status: open
Assignee: maksymomelchuk
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

From [How is the trial run?](17-run-the-trial.md):

- **Show each new record in words** in «Для батьків», as the existing attempt lines do, so the parent can read them during the trial. For example: «План, дія 2: «…» — не з першого разу», «Перевір знак: результат 9000 (знак «·»)», «Яка схема в тебе: так», «Який крок далі: «План» замість «Порівняння»», «Розв'язувала сама: перейшла на кроки на «План»».
- **Keep what [Show the trial records in «Для батьків»](18-trial-records.md) derives from**: each attempt's start and finish time, whether it was a repeat of a missed problem, and the solo-try outcome. That ticket builds the summary list, the solo-try lines, minutes and the export on top of this.
- **What counts as missed** (the orchestrator's reading of the schedule's Missed problems): any plan line or action result the app had to show. That covers a plan card shown in Levels 1–2, an action shown in Level 1, a typed result shown from 2.1, and a model shown by a second «Підказка» tap, which costs no more than guessing. A wrong direction-check answer or a «Ні» self-check doesn't make a problem missed.

## Comments

### Note (2026-10-03, started early)

Started before [How does the Тип і схема step ask for the type so that it's clear to her?](15-clear-type-step.md) and [Help her pick the operation in Обчисли](16-help-pick-operation.md) close, on the orchestrator's call. The parent is away overnight, delegated everything, and asked to see the real app in the morning. It builds against Б «Схеми» (the default) while keeping every version working, and against 16 as built (the direction check gives a hint, then the answer). If the parent's sessions with her change either, the change comes as a follow-up. 2.3 must stay playable fully guided through the stage switch, and «Спробувати» must stay, so both sessions can still run on the live link.

Data contract, shared with [Write the guided-step data for the problem set](13-write-guided-data.md), which is being written in parallel:

- `RecordLine` gains `tag?: 'asked' | 'restated'`. `'asked'` marks the line with the «?» of what the problem asks; `'restated'` marks a comparison restated from the unknown's side. A `'restated'` line also has `compare?: { bigger: string; smaller: string }`, the two quantities as the «Хто більший: X чи Y?» buttons name them.
- `DirectionCheck` gains `relationType: ProblemTypeId`.
- Every other type change stays additive. Each problem's stage comes from its slot, not from data.

### Progress (2026-10-03)

The AFK part is built, tested and deployed. Live at https://reliable-macaron-77e751.netlify.app, bundle `index-ClRAZLB8.js`. Status stays open: the resolution is the parent playing the triangle through every stage on the iPad.

**What she gets now.** Each problem plays at the stage its slot gives it, from `fading/stages.ts`, not from which data it carries. 2.3 now plays at 2.1–2.4 and 4.7 at 4.6–4.7. The stage switch under «Для батьків» plays any problem at any stage.

- **Paper steps, one at a time.** Each shows a heading, «Готово», then that part's check:
  - the short record's model with its yes/no self-checks, from 3.1;
  - «Що більше: X чи Y?» from the restated lines, from 4.4;
  - «Яка схема в тебе?», then the model and ««?» стоїть там, де шукане?», from 4.1;
  - the answer's model and self-check, from 2.1;
  - a name pick for 3.7.

  After a «Ні»: «Виправ у зошиті. Тоді — «Далі».». «Підказка» shows the self-question first, then the model.
- **Level 2 actions.** The app names each action of her card plan. If the action has a direction check, it's asked next. Then she types the result.
- **Her own plan from 3.1, in small or big steps.** It works as the checklist says, including the switching, the plan-miss hint, and the valid lines with «Виправ у зошиті». With several valid lines, she picks the one she wrote.
- **Typed results.** A wrong sign gets its hint, otherwise «Не сходиться» and the action's hint. A second miss shows the action, then «У тебе така сама дія?» when no sign explained it.
- **The direction check fades per type** on paper Обчисли. Once it has faded, «Підказка» asks it.
- **The rest:**
  - «Який крок далі?» from 4.4;
  - the solo try at 4.6–4.7;
  - the handovers, and the two step-size lines;
  - from 3.1, a pick of each relation's diagram (only with А and «Як було») and the «?» as a chip;
  - replays and repeats of missed problems;
  - every new record, in words, in «Для батьків».

**Where (`poc/src/`).**
- The pure logic, with tests, is in `fading/`:
  - stages and plays: `stages.ts`, `play.ts`;
  - plan lines and action count: `plan.ts`;
  - wrong-sign results: `results.ts`;
  - self-checks and «Що більше?»: `paperChecks.ts`;
  - «?» chips: `questionSlots.ts`;
  - her state, derived from her records: `learner.ts`;
  - the loop functions for ticket 19: `loop.ts`.
- The screens are in `guided/paper/`. The flow is in `guided/flow.ts`.
- The records are `Attempt.log`, plus `stage`, `stepSize`, `switched` and `repeat`, in `lib/progress.ts`. Records already saved still read the same: every new field is optional.
- The stage switch is `screens/StageSwitchPanel.tsx`.
- 144 tests, the type check and lint pass.
- Played by touch in WebKit at 820×1180, 1180×820 and 390×844, and in Chromium at 1440×900. That covers 2.3 and 4.7 at every stage, both step sizes, all four versions of Тип і схема, and the solo try (right, wrong, «Розбий на кроки»). The same 20 runs passed on the live link at 820×1180. There were no console errors and no overflow. One diagram tap target measured 43 px at phone width.

**Changes from the schedule** (my calls):
- **Order from 3.1 on.** The decode comes before the short record in Level 4 too, and in «Який крок далі?». The reason is Level 3's: the record holds the restated comparison.
- **Знайти on paper (4.1 on)** is a heading with «Готово». It's checked with the short record's «?» line.
- **«Яка схема в тебе?»** asks her to mark every sketch on her diagram. With Б «Схеми» these are the six type sketches; with the other versions, the three family sketches. The right ones follow from the relations' types.
- **«Хто більший?» is worded «Що більше: X чи Y?»**, on the orchestrator's call. The step buttons are in alphabetical order, and the progress bar hides which step is due.
- **Self-checks keep the asked quantity in the nominative** («…про те, що шукали (периметр трикутника)?»), so no case ending can go wrong.
- **The fade counts only on paper Обчисли.** At 1.x the check is always asked.
- **Her state leaves out** stage-switch plays and records from before this build.
- **A replay plays at the later of the two stages.** The prompted steps only shrink from stage to stage, so that is their overlap.
- **A repeat is queued** once the missed problem is finished.
- **The 4.6 handover** sits on the solo-choice screen.

**Parent's checklist** (about 40 minutes):
1. Close «Задачі» fully and reopen it from the icon.
2. Under «Для батьків», open «Етап задач», pick a stage, then tap «Задача 4.7». The top bar shows «Етап …» while the switch is on. Play the triangle at 1.1–1.7, 2.1–2.4, 2.5–2.8, 3.1–3.8, 4.1–4.3, 4.4–4.5 and 4.6–4.7. At 3.1–3.8 and 4.4–4.5, play it once with «Малі кроки» and once with «Великі кроки». Make a few mistakes: «Інше», a wrong result, a «Ні», the wrong step.
3. At 4.6–4.7, play it three ways: «Спробую сама» with 37,7; then with a wrong answer; then with «Розбий на кроки».
4. Play 2.3 at 1.1–1.7: this is fully guided, as for tickets 15 and 16.
5. Check the records under «Для батьків». Then choose «Вимкнено» and tap «Стерти записи» before her trial.
6. For the sessions in tickets 15 and 16, set 1.1–1.7 first. Without the switch, 2.3 plays at 2.1–2.4. «Спробувати» is unchanged.

### Progress (2026-10-04, the parent's checklist by proxy)

The parent delegated their solo checks to the orchestrator. An agent ran the checklist above on the live link in WebKit, touch only, at 820×1180, 1180×820 and 390×844:

- The triangle at all seven stages through the stage switch, in small and big steps at 3.x and 4.4–4.5, and solo three ways (right, wrong, «Розбий на кроки»).
- 2.3 at 1.1–1.7, then the switch off and «Стерти записи».
- One continuous run through the whole set (1.1 → 4.7), with one miss per level. Each miss came back once at the end of its level. The direction check faded and came back after a wrong sign. Moves between small and big steps, and their lines, happened when they should.
- Reloads and reopening mid-problem resumed on the same screen at five different stages.

There were no crashes, console errors, dead ends or overflow, and no tap under 44 px at iPad sizes. Two minor items were found: diagram slots are 43 px at phone width, and with the stage switch at 4.4 or later a Level 1 problem asks «Що більше: Дарина чи Тарас?» (only the parent sees this). A polish pass takes both.

**Still the parent's:** playing it on her iPad from the home-screen icon. That's now part of playing Level 1 through in [Build the game layer and the loop through the problem set](19-build-game-layer.md).
