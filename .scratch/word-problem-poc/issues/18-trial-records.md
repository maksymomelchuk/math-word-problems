# Show the trial records in «Для батьків»

Labels: wayfinder:task
Status: open
Assignee: maksymomelchuk
Blocked by: [How is the trial run?](17-run-the-trial.md), [Build the paper steps and the fading schedule](14-build-fading.md)
Parent: [Map](../MAP.md)

## Question

The trial plan in [How is the trial run?](17-run-the-trial.md) needs «Для батьків» to show at a glance what the parent judges *does it help* from, without a long scroll. The records already exist on the device. [Build the paper steps and the fading schedule](14-build-fading.md) adds plan lines, typed results, direction-check answers, next-step picks and the solo-try choice. This ticket only shows them. Part 4 of [trial-proposal.md](../assets/trial-proposal.md) has the reasons.

- [ ] **«Де довелося показати»** at the top of «Для батьків»: one line per missed problem (the app had to show a plan line or an action's result), grouped by level. Each line says what was shown, whether it was a slip, and how the repeat went, for example «3.4 · Кавуни, 5 жовт. — показано дію 1 (знак «−»); повтор — без показу».
- [ ] **Solo tries**: one line per problem played at 4.6, 4.7 or later, with her choice («Крок за кроком» / «Спробую сама»), the outcome (right; switched at which step; a wrong answer, then step by step), and minutes. The free weeks aren't watched, so this is how the parent sees them.
- [ ] **Minutes** on each finished attempt, pauses included.
- [ ] **«Скопіювати записи»**: the records as plain text to the clipboard, so the parent can keep a weekly copy. They live only on the iPad, and «Стерти записи» loses them.
- [ ] Unit tests, the type check and lint pass. Checked on her iPad size first (WebKit at 820×1180 and 1180×820, touch only), then phone and laptop widths.
- [ ] Deployed. The parent checks it on the iPad after playing a few problems with deliberate misses.

No charts, per-type scores or daily totals (dashboards are out of scope). Lines are for the parent, in Ukrainian like the rest of «Для батьків».

AFK: the agent builds it. HITL: the parent checks it on the iPad.

Resolved when the parent confirms the list reads clearly on the iPad.

## Comments

### Progress (2026-10-04)

Built and tested locally. **Not deployed yet**: the orchestrator deploys it with ticket 19. Status stays open until the parent has checked it on the iPad.

**What the parent sees at the top of «Для батьків»:**

- **«Де довелося показати»**, by level, one line per missed problem: «3.4 · Кавуни, 5 жовт. — показано дію 1 (знак «−»); повтор — без показу». A line can say:
  - what was shown: «план», «рядок плану 2», «дію 2» (with «через «Підказку»» when a second «Підказка» showed it);
  - why it was shown: the wrong sign, «помилка в обчисленні» (a slip), or «інша дія»;
  - how the repeat went: «без показу», «знову показано …», «ще попереду», «почато, ще не завершено». If the problem isn't finished yet, it says «задачу ще не завершено».

  A play after the first pass that was missed gets its own line, marked «ще раз».
- **«Сама чи крок за кроком»**: one line per play where she was offered the solo try (4.6, 4.7, and replays after 4.7). Each line gives:
  - her choice;
  - how it went: «правильно»; «відповідь 17,2 не зійшлася, далі крок за кроком»; or «натиснула «Розбий на кроки» через 3 хв»;
  - the first step where she needed a hint or made a mistake after that, and anything shown;
  - the minutes.
- **Minutes** on every finished attempt in the full list too, pauses included: «розв'язано о 16:14, 12 хв».
- **«Скопіювати записи»** copies everything as plain text: the summary, then every attempt. A «Скопійовано» confirmation shows for a moment. If the device refuses the clipboard, the text opens in a field with «Виділити все». «Стерти записи» now reminds the parent to copy first.

The summary leaves out stage-switch checks, records from before the fading build, and «Спробувати» tries.

**Where (`poc/src/screens/`).**
- `trialRecords.ts` holds the summary and the text copy, as pure functions. Its tests are in `trialRecords.test.ts`.
- `TrialSummary.tsx` and `trialRecords.css` are the view.
- `logWords.ts` now also holds the words for the guided steps (moved out of `ParentView.tsx`), the minutes, and the attempt heading.
- Everything is derived from the records. `lib/progress.ts` is unchanged.

**Checks.** 183 tests, the type check and lint pass. Tested by touch in WebKit at 820×1180, 1180×820 and 390×844, and in Chromium at 1440×900:
- real plays with misses: 2.3 with a result shown, its repeat, 4.7 «Спробую сама» with a wrong answer, then a 4.7 replay solved alone;
- a seeded month of records: a whole trial's summary fits about one iPad screen in portrait;
- all three copy paths: the clipboard, the refused-clipboard field, and copying with no clipboard API.

There was no sideways scroll and no console errors.

**Parent's checklist** (about 15 minutes):
1. Close «Задачі» fully and reopen it from the icon. Under «Для батьків», check that «Етап задач» is «Вимкнено».
2. Play two or three problems from the start of her list with deliberate misses: in one, get an action wrong twice, so the app shows it. Leave one problem unfinished.
3. Open «Для батьків». At the top, check that each line is clear: what was shown, whether it was a slip, and «повтор — ще попереду». Check the minutes on the attempts below.
4. Optional: if you play on to the end of Level 1, play the repeat when it comes up. Then check that its line says «повтор — без показу».
5. Tap «Скопіювати записи» and paste into Нотатки. If «Скопійовано» doesn't appear, try the field and «Виділити все», and tell us.
6. Before her trial, tap «Стерти записи».

The «Сама чи крок за кроком» list fills only from her own plays from 4.6 on. Stage-switch checks stay out of the summary, so it can't be checked quickly now. It was tested with seeded records.

### Note (2026-10-04, deployed)

Live at https://reliable-macaron-77e751.netlify.app, deployed by the orchestrator together with the game layer, the trial records and the data fixes. The type check, all 183 tests and lint pass. The checklist above can start.
