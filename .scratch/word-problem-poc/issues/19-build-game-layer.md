# Build the game layer and the loop through the problem set

Labels: wayfinder:task
Status: open
Assignee: maksymomelchuk
Blocked by: [Build the paper steps and the fading schedule](14-build-fading.md)
Parent: [Map](../MAP.md)

## Question

Wrap the 30 problems in the game layer and the loop, so she opens the app and is taken from one problem to the next through the four levels, with her missed problems coming back at each level's end. This graduates the map's "Building the PoC" fog.

It builds **option 1 · Стежка** with the calls from [game-calls.md](../assets/game-calls.md), adopted on the parent's delegation (see the last Note in [Which Duolingo-style game mechanics go into the PoC?](09-game-mechanics.md)). Her pick isn't in yet, so keep the option-specific parts (home, top bar, end screen dressing, handover and level-end dressing, the mascot) in one module, so a switch to option 2 or 3's build spec is contained. The look and the screens are in [game-mechanics-mock.html](../assets/game-mechanics-mock.html) (option 1). The calls change the mock in places, and the calls win.

- [ ] **Home: the path.** 30 nodes in four levels, «Рівень N» titles only, with nothing that names a type or gives away the inverted-wording level. Only the next problem is open until the set is finished; done problems can be reopened. ↻ «Повтор задачі N» nodes sit inside their level, from the fading build's repeat queue, styled like any problem. From Level 2: «із зошитом» on the level, «Знадобиться зошит» on the next node. A problem left open resumes from its node. Kept: «Для батьків» at the bottom, the stage switch behind it.
- [ ] **Top bar**: the XP total and a ring, «Мета на сьогодні — одна задача» (one finished problem today, repeats count; no history, no "missed" message, no push for more). No вогник, week strip or day count.
- [ ] **XP**: +10 per finished problem, however it went. Nothing is taken away for a miss. A solo success earns the same.
- [ ] **End-of-problem screen**: small confetti and the bird's line for the outcome: clean «Усе зійшлося з першого разу.»; with hints «Підказки саме для цього. Задачу розв'язано!»; something shown, what was shown, «Нічого страшного» and the repeat note; solo, one plain line («Увесь розв'язок — у зошиті, і відповідь зійшлася.»). Then +10 XP, the path progress, the closing «Розбір», and «Далі», which always goes home. "Shown" means what makes a problem missed.
- [ ] **Handover screens** (2.1, 2.5, 3.1, 4.1, 4.4, 4.6) and the step-size lines from the fading build, dressed calmly: the bird says the draft, with no confetti. The 4.6 choice keeps «Досвід однаковий: +10 XP за будь-який спосіб.» Each handover opens before the problem it belongs to.
- [ ] **Level-end screen** after a level's last problem or repeat: confetti, the bird, «Рівень N пройдено!» with what the level held («7 задач, 1 повтор»), then home, where the level's banner reads «Пройдено». **Set-end screen** after Level 4's repeats: «Усі 30 задач пройдено! Тепер можна повертатися до будь-якої задачі.»
- [ ] **After the set**: every problem opens, replays play at her current stage with the solo try offered, a miss in a replay doesn't queue another repeat, and the daily goal is hidden.
- [ ] **The bird** (Кмітка, a placeholder name) speaks in text bubbles on the end, handover, 4.6 and level-end screens only. Never during steps, never sad when she's been away.
- [ ] **No rewards inside a problem**: no combo, no points per step, nothing timed. Praise names what happened, never her as a person, and has no inflated words.
- [ ] XP, the goal ring and level state are kept with the progress, changing the record format only additively, so her records on the iPad stay readable.
- [ ] Unit tests, the type check and lint pass. Checked on her iPad first (WebKit at 820×1180 and 1180×820, touch only), then phone and laptop widths. Deployed.

AFK: the agent builds it. For UI work, use `/impeccable` or `/emil-design-engineering`. HITL: the parent plays Level 1 through on her iPad, from the home-screen icon.

Resolved when the parent has played Level 1 through on the iPad and confirms the loop works. If her pick in ticket 09 is option 2 or 3, the switch to that option's build spec in game-calls.md is part of this ticket.

## Comments

### Progress (2026-10-04)

Option 1 · Стежка is built and checked on a local server, not deployed: the orchestrator deploys. Status stays open: the resolution is the parent playing Level 1 through on the iPad.

**What she gets now.** She opens the app and lands on her path through the four levels.

- **Home.** A path of 30 nodes in four levels. Each banner shows «Рівень N», and from Level 2 «із зошитом», then «3 з 8», «Пройдено» or a lock. Only the next node opens. It has a bobbing «Почати» (or «Продовжити» if it's open), the bird beside it, and from Level 2 «Знадобиться зошит» under it. Finished nodes reopen as replays. ↻ «Повтор задачі N» nodes come from the repeat queue and sit at their level's end. A trophy closes the path. «Для батьків» is at the bottom, with the stage switch behind it. When the switch is on, its banner shows on the path too.
- **Top bar**: the XP total, and a ring with «Мета на сьогодні — одна задача». Once a problem is finished today, the ring fills and reads «Мету на сьогодні виконано». No streak, no day count. The ring goes once the set is finished.
- **XP**: +10 for every finished problem, repeats and replays included. Nothing is taken away, and a solo success earns no more.
- **End of a problem** (the closing Розбір screen):
  - small confetti, and the bird's line for how it went;
  - «Задачу розв'язано!», «Досвід +10 XP» and «Стежка N з 30»;
  - after a first-pass miss, «Ця задача ще раз з'явиться в кінці рівня N.»;
  - then «Розбір», unchanged, under its heading;
  - «Далі», which goes home.
- **Handovers** (2.1, 2.5, 3.1, 4.1, 4.4) open the problem as before, now dressed. The bird says the schedule's draft, with no confetti. Then «Новий етап», with «Рівень N» at a level start or «Задача N» at 2.5 and 4.4. Then this problem's steps split into «Тут, як і раніше» and «У зошиті», and «Поклади поруч зошит і ручку. Не знаєш, що далі? Натисни «Підказка».»
- **The 4.6 choice**: the bird says the 4.6 draft beside the cards, with no confetti. «Досвід однаковий: +10 XP за будь-який спосіб.» sits under the cards on every choice screen.
- **Level end**, on the way home after a level's last problem or repeat:
  - confetti and the bird;
  - «Рівень N пройдено!» and «7 задач, 1 повтор»;
  - a row of the level's done nodes;
  - «Далі». The banner then reads «Пройдено».
- **Set end**, after Level 4's repeats: «Усі 30 задач пройдено! Тепер можна повертатися до будь-якої задачі.» and «Рівень 4 пройдено: …». After it, every node opens and the goal ring is gone. Replays play at her stage with the solo try offered, and a miss in a replay queues nothing.
- **Nothing inside a problem changed**: no XP, combo or timer during steps, and the bird never appears there.

**Where (`poc/src/`).**
- `game/index.ts` names the option in use. Option 1's parts are all in `game/stezhka/`: `Home.tsx` (path, top bar, level-end and set-end screens), `EndDressing.tsx`, `HandoverDressing.tsx` (also the 4.6 dressing), `Confetti.tsx`, `art.tsx` (icons and the bird), `words.ts` (every line she reads) and `stezhka.css`. A switch to option 2 or 3 means a sibling folder with the same five exports, plus changing `game/index.ts`.
- The parts every option shares, with tests in `game/game.test.ts`:
  - `game/path.ts`: the path model, her numbers 1–30, the celebration due, and the end-of-problem summary;
  - `game/outcome.ts`: how a problem went, and what had to be shown;
  - `game/score.ts`: XP and the goal.
- `fading/loop.ts` gained `repeatsDone`, `levelRepeats` and `finishedProblems`, and now exports `levels`. Tests are in `fading/loop.test.ts`.
- Records: `Progress` gained an optional `game: { levelEnds?, setEnd? }`, so each level-end and the set-end screen shows once. It's in `lib/progress.ts`, with a test. Saved records read as before. XP and the goal aren't stored: they're counted from her own attempts, so «Стерти записи» resets them, and stage-switch checks and records from before fading earn nothing.
- The game is wired in at `screens/Home.tsx`, `guided/screens/ReviewScreen.tsx`, `guided/paper/HandoverScreen.tsx` and `guided/paper/SoloChoiceScreen.tsx`. The plain handover's CSS is gone from `paper.css`.
- One library was added: `canvas-confetti` 1.9.4, plus `@types/canvas-confetti` 1.9.0. It draws nothing when reduced motion is set. The JS bundle is 167 KB gzipped, most of it problem data.
- 183 tests, the type check and lint pass.
- **Played by touch** with a data-driven script, in WebKit at 820×1180 (every screen layout-checked), 1180×820 and 390×844, and in Chromium at 1440×900. Each run plays Level 1 from the path:
  - a hint at 1.2, and a deliberate miss at 1.3 (the plan shown);
  - leaving 1.4 half-way and resuming it, after a reload too;
  - 1.5–1.7, then the repeat of 1.3;
  - the level end, the 2.1 handover, and 2.1 at its paper stage.

  From prepared records: the 3.1, 4.1 and 4.4 handovers, the 4.6 choice, a solo success at 4.7, the set end, a replay after the set, records from before, and «Для батьків» with the stage switch. No console errors and no overflow. With reduced motion there's no confetti, hop or bob.

**Changes from the ticket and game-calls.md** (my calls):
- **Her numbers are 1–30**, on the nodes, the handover and choice titles and «Повтор задачі N», as in the mock. The parent's page keeps the slot ids.
- **The banners show «Рівень N» only.** The mock's «Задачі 8–15» is dropped, since the ticket says titles only.
- **While the next problem is open, finished nodes wait.** A tap shows «Спершу закінчи задачу N, вона вже відкрита.» Only one problem can be open at a time (ticket 12), so a replay would throw away her place.
- **"What was shown" is one line**: «Довелося показати план / рядок плану / дію (дві дії…). Нічого страшного.» The repeat note shows only when a repeat was really queued, so never after a repeat, a replay or a stage-switch check.
- **"Clean" means everything right first time.** Any wrong try, any «Підказка» tap, a «Ні» self-check or a wrong solo answer gets the hints line.
- **The set end replaces Level 4's level end**, so there's one screen, not two in a row.
- **Each level end shows once**, when she reaches home. If she closes the app on the end screen, it still comes next time.
- **The handover is dressed in place**, keeping the problem text beside it, as the fading build had it. The bird appears on the choice screen only at 4.6. At 4.7 and on replays the choice comes without it.
- **The step-size lines stay calm notes on the plan screen**, where the fading build put them. They come during steps, where the bird never speaks.
- **On home the bird is silent** beside the next node, as in the mock.
- **A stage-switch check shows +10 on its end screen**, but her total doesn't change.

**Parent's checklist** (about 25 minutes, on her iPad, after the orchestrator deploys):
1. Under «Для батьків», set «Етап задач» to «Вимкнено» and tap «Стерти записи». Close «Задачі» fully and reopen it from the icon.
2. **The path.** The top bar shows 0 XP and an empty ring, «Мета на сьогодні — одна задача». Node 1 bobs «Почати» with the bird beside it, and the rest are locked. Levels 2–4 are grey with «із зошитом». Check that nothing names a type.
3. **Problem 1, played right.** Confetti, the bird says «Усе зійшлося з першого разу.», then «+10 XP», «Стежка 1 з 30» and «Розбір». «Далі» goes home: 10 XP, a full ring reading «Мету на сьогодні виконано», node 1 ✓, node 2 open.
4. **Problem 2.** Make one wrong pick, then the right one. The bird says «Підказки саме для цього. Задачу розв'язано!»
5. **Problem 3, a deliberate miss.** On «Склади план», check a wrong card twice, so the plan is shown. The end screen says «Довелося показати план. Нічого страшного.» and «Ця задача ще раз з'явиться в кінці рівня 1.» Home shows a grey ↻ «Повтор задачі 3» at the end of Level 1.
6. **Problem 4.** Leave it half-way with ✕. Its node shows «Продовжити». Tap a ✓ node: it says «Спершу закінчи задачу 4…». Reopen 4: it continues where you left it. It does after closing the app fully, too.
7. **Problems 5–7, then the repeat.** Play the ↻ repeat (now «Почати») right. Its end screen has no repeat note.
8. **The level end.** Confetti, the bird, «Рівень 1 пройдено!», «7 задач, 1 повтор» and a row of 8 nodes. «Далі» goes home: Level 1 reads «Пройдено», Level 2 is blue, and node 8 shows «Знадобиться зошит». The screen doesn't come back.
9. **The handover before 2.1.** Tap node 8. The bird says «Тепер дії і відповідь ти записуєш у зошит. Яку дію робити — підкажу.», with no confetti, then «Рівень 2» and the app/notebook split. «Почати» starts the problem.
10. **«Для батьків».** Check that the records, «Етап задач» and «Спробувати» still work. Tap «Стерти записи» before her trial.

What to look for: whether the bird's lines read right to you; whether the bobbing bubble is too busy; whether reopening ✓ nodes pulls her off the path during the pass.

### Note (2026-10-04, deployed)

Live at https://reliable-macaron-77e751.netlify.app, deployed by the orchestrator together with the game layer, the trial records and the data fixes. The type check, all 183 tests and lint pass. The checklist above can start.

### Note (2026-10-04, polish pass)

A polish pass made the screens one consistent app, and it's live (`index-BJxR-Pgc.js`, JS 167 KB gzipped):

- shared type sizes, spacing and motion timings, and the warm off-white page under white cards, as in the mock;
- the fonts load with the page, so nothing reflows;
- «Розбір» sits in a card on the end screen;
- the level-end nodes fill in one by one;
- «Для батьків» has a «До задач» link at the top (the home-screen app has no back button).

Reduced motion turns all of it off. Texts and flows are unchanged. The only library added is `canvas-confetti`; Tailwind and shadcn/ui weren't needed. Before deploying, the full playthrough ran again: all 30 problems at their stage, at 820×1180, 1180×820 and 390×844, with 264 deliberate mistakes per run, plus the Стежка Level 1 run (a miss and its repeat, the level end, the 2.1 handover). There were zero findings and zero console errors.
