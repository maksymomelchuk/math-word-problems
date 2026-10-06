# Which Duolingo-style game mechanics go into the PoC?

Labels: wayfinder:prototype
Status: open
Assignee: maksymomelchuk
Blocked by: [What does one guided problem look like, step by step?](07-guided-problem-flow.md)
Parent: [Map](../MAP.md)

## Question

Which game mechanics wrap the problems in the PoC? Candidates: a lesson path, XP or stars, streaks, hearts/lives, celebration moments, a mascot.

Mock up 2–3 options for the home screen and the end-of-problem screen in `../assets/`, show them to her, and record which one she picks and what she says about each. Keep it light; it can be adjusted later. A rich Roblox-like world is out of scope.

From [What does one guided problem look like, step by step?](07-guided-problem-flow.md):

- In a guided problem, a wrong answer gets a hint on the first try; on the second, the answer is shown with its reason and she carries on. The flow has no hearts or XP yet, so whether a wrong answer costs anything is this ticket's call.
- The end-of-problem screen has to hold the closing «Розбір»: the write-up, 2–3 checks, the key idea and the other valid plan. See [guided-flow.md](../assets/guided-flow.md).

From [How does the guidance fade across the problem set?](08-guidance-fading.md), revisited on 2026-10-03 (see [fading-schedule.md](../assets/fading-schedule.md)):

- **Hints she asks for are free and recorded.** Asking for help should never cost more than guessing, whatever a wrong answer costs here.
- **No problem is handed over whole.** Every problem stays one step per screen, and the app checks each step. **The paper-problem end screen goes**: the 8 self-checks, the typed answer and action count, and «Де твій розв'язок пішов не так?». Problem 30 ends on the ordinary end screen. That screen could carry a short line of the steps where she needed help.
- **Self-checks are left only for the short record and the answer sentence.** The app checks everything else itself: typed results, plan-line picks, the diagram pick and «Хто більший?».
- **Handover screens** stay at 2.1, 2.5, 3.1, 4.1, 4.4 and 4.6, with new drafts in the schedule. 4.4 is «…який крок далі — обираєш ти», and 4.6 offers the solo try. There's also a short line when she moves to writing the whole plan first. Whether these are celebration moments is this ticket's call.
- **The solo try** at 4.6, 4.7 and replays after the set: «Крок за кроком» (the default) or «Спробую сама», with «Розбий на кроки» at any time. Choosing step by step must never cost anything. Whether a solo success earns something extra is this ticket's call.
- **A missed problem comes back once at the end of its level** (after 4.7 for Level 4). A problem is missed when the app had to show a plan line or a result. The lesson path should show repeats as part of the level, not as a penalty.
- **From Level 2 she writes in a notebook beside the device**, one step at a time, so the notebook cues stay.
- **Problems run longer.** The triangle may take 8–11 minutes, so a sitting holds 1–2 Level 4 problems. A daily goal shouldn't count problems in a way that rushes her.

## Comments

### Progress (2026-10-03)

**Done (AFK).** One self-contained mock with three options for the game layer: [game-mechanics-mock.html](../assets/game-mechanics-mock.html). Each option has a home screen, a stub problem screen (the steps are skipped) and the end-of-problem screen. All three share one look and the same closing «Розбір» for the walking boy, shown as problem 10: the write-up with the швидкість–час–відстань table, three checks, the key idea and the other valid plan. So what differs between them is the mechanics.

| | 1 · Стежка | 2 · Зірки | 3 · Сердечка |
|---|---|---|---|
| Home | A lesson path of 30 nodes in four levels, with a bird mascot next to the next problem | A grid of 30 numbered tiles by level, each showing 0–3 stars | A "today" card with a daily-goal ring and the next problem; hearts and level bars beside it |
| Reward | +10 XP per problem; a daily streak (вогник) | 3 stars with no hints, 2 with hints, 1 if an answer was shown | A daily goal of 3 problems |
| What a wrong answer costs | Nothing | A star, won back by solving the problem again | A heart, only when an answer is shown. 5 a day; at 0, new problems wait until tomorrow |
| End screen | Confetti, the bird's line, XP and streak, then «Розбір» | The stars and the steps where she needed help, a «Ще раз» button, then «Розбір» | The goal ring fills, a heart goes if an answer was shown, then «Розбір» |

- The dark strip at the top switches between the options. The sliders button (top right) opens the parent controls: jump to a screen, set *How the problem went* (no hints / two hints / a hint + an answer shown), show the yellow design notes, or reset.
- Checked at phone (390 px), tablet (820 px) and laptop (1440 px) widths: nothing overflows and the console shows no errors. The file works offline. With JavaScript off, for example in a file-preview app, every screen is shown one under another with a label.
- Level titles show only «Рівень N» and the problem numbers, so none of them names a type or gives away the inverted-wording level. Learner-facing text avoids gendered past tense («Задачу розв'язано»).

**Checklist for the parent.** About 10 minutes on your own, then 15 with her.

On your own, on the laptop:

- [ ] Open `.scratch/word-problem-poc/assets/game-mechanics-mock.html` in Chrome or Safari by double-clicking it. No internet is needed.
- [ ] Click the sliders button, tick *Design notes*, and read the yellow note on each screen of options 1, 2 and 3. On each end screen, try all three *How the problem went* settings.
- [ ] Untick *Design notes*, click *Reset all three* and close the panel. Leave *How the problem went* on *Two hints*. Make the browser full-screen.

With her, on the laptop (a laptop browser runs the file reliably; phones and tablets tend to open local files as a static preview):

- [ ] Say only: «Я покажу тобі три варіанти, як може виглядати гра із задачами. Мені цікаво, що ти про них думаєш. Правильних відповідей тут немає.» Don't name the mechanics, and don't say which one you like.
- [ ] Go through the options in the order 1, 2, 3, using the tabs at the top. In each one, she taps «Почати», then «Завершити задачу», looks at the end screen for as long as she likes, then taps «Далі». Answer only what she asks, and don't explain the rules.
- [ ] On each end screen, before she taps «Далі»: note whether she scrolls down to «Розбір» on her own. Then open the panel, choose *A hint + an answer shown*, close it and ask «А тепер що змінилося?» Set it back to *Two hints*.
- [ ] After each option, ask these in order, without giving examples:
  1. «Що тут відбувається?»
  2. «Що тобі тут подобається?»
  3. «А що не подобається або незрозуміло?»
- [ ] Ask one follow-up per option, only if she hasn't already covered it: for option 1, «Що означає вогник?»; for option 2, «За що дають зірки?»; for option 3, «Що буде, коли сердечка закінчаться?», then «Як тобі таке правило?».
- [ ] After all three, let her switch between the tabs freely. Then ask «Якби ти розв'язувала задачі щодня, який варіант ти б вибрала?», «Чому?» and «Чи є щось з інших варіантів, що ти б сюди додала?»
- [ ] Last, ask «Що має бути, коли відповідь довелося показати?» Leave it open; don't offer choices.

Afterwards:

- [ ] Record under `## Comments` in this ticket: her pick; what she said about each option, in her own words where you can; anything she misunderstood; whether she looked at «Розбір» on her own; what she'd combine; and her answer about a shown answer.
- [ ] Add your own call on whether a wrong answer should cost anything (nothing, a star or a heart). This ticket decides it, and her preference is one input.

### Progress (2026-10-03, update)

**Updated to the fading decision** ([fading-schedule.md](../assets/fading-schedule.md)) in the same file, [game-mechanics-mock.html](../assets/game-mechanics-mock.html). The options, the look and everything else stay as before.

- **Hints are free in all three options.**
  - Option 2's stars now count only answers the app had to show after two wrong tries: 3 stars with none, 2 with one, 1 with two or more.
  - Neither the hint after a first wrong try nor a «Підказка» she asks for costs a star, XP or a heart. The legend, the end screens, the hearts card and the design notes say so.
  - The bird's line for a clean run now praises "no mistakes" instead of "no hints".
- **Missed problems come back at the end of their level.** A problem is missed when a typed result or the final answer had to be shown. Each home screen shows the repeats inside the level, styled like any other problem, with ↻:
  - Option 1: path nodes, captioned «Повтор задачі N».
  - Option 2: tiles. The repeat is where she wins the star back.
  - Option 3: a new Level 2 strip. Repeats can still be done with no hearts left.

  Level 1 shows one repeat done and Level 2 one queued. After «Далі», a "missed" problem 10 adds another. Option 2's «Ще раз» button on the end screen is gone, because the end-of-level repeat replaces an immediate retry.
- **A handover screen for each option**, as shown at 2.1: «Тепер дії і відповідь ти записуєш у зошит», with the steps split into «Тут, як і раніше» and «У зошиті».
  - Option 1 is a celebration with confetti and the bird.
  - Option 2 is a plain information card.
  - Option 3 is an "unlocked" notebook badge with a reminder that «Підказка» doesn't take hearts.
- **A paper-problem end screen for each option** (problem 30, the triangle, solved fully on paper). It shows:
  - the typed answer and her action count;
  - the model write-up part by part (short record, diagram, «Розв'язання», «Відповідь»), each part with 2–3 «Так»/«Ні» self-checks, 8 in all. «Ні» shows «Виправ у зошиті», and a counter shows how many she has checked;
  - «Де твій розв'язок пішов не так?» when the answer was shown;
  - then the checks and the key idea.

  Self-checks never change XP, stars or hearts, and the screen says «Ні» costs nothing.
- **Room for the notebook.** From Level 2, the home screens mark the levels «із зошитом» and the next problem «Знадобиться зошит». The problem stub splits the steps into app and notebook. Nothing is timed, and no screen moves on by itself.
- **Parent controls.** *Screen* now has *Handover (2.1)* and *End: paper problem 30*. *How the problem went* is now *No mistakes* / *A mistake + a hint she asked for* / *A result had to be shown (missed)*.
- Checked at 360, 390, 820 and 1440 px, on every screen of every option with all three outcomes and the after-«Далі» homes: nothing overflows and the console shows no errors. The no-JavaScript fallback shows all 15 screens.

**Checklist for the parent, updated.** This replaces the "On your own" and "With her" parts of the first checklist; "Afterwards" still applies, with one addition below. Allow about 20 minutes with her.

On your own, on the laptop:

- [ ] Open `.scratch/word-problem-poc/assets/game-mechanics-mock.html` in Chrome or Safari. Click the sliders button, tick *Design notes*, and read the yellow note on every screen of options 1, 2 and 3. Use *Screen* to reach *Handover (2.1)* and *End: paper problem 30*, and try all three *How the problem went* settings on both end screens.
- [ ] Untick *Design notes*, click *Reset all three* and close the panel. Leave *How the problem went* on *A mistake + a hint she asked for*. Make the browser full-screen.

With her, on the laptop:

- [ ] Say only: «Я покажу тобі три варіанти, як може виглядати гра із задачами. Мені цікаво, що ти про них думаєш. Правильних відповідей тут немає.» Don't name the mechanics, and don't say which one you like.
- [ ] For each option, in the order 1, 2, 3 (tabs at the top):
  1. **Home.** Let her look, then ask «Що тут відбувається?» If she doesn't mention a ↻ problem, point at one and ask «А це що?»
  2. **Handover.** Open the panel, choose *Handover (2.1)* and close the panel. Ask «Що тут треба робити?» and «Як тобі такий екран?»
  3. **Problem and end screen.** She taps «Почати», then «Завершити задачу», and looks at the end screen as long as she likes. Note whether she scrolls down to «Розбір» on her own. Then choose *A result had to be shown (missed)* in the panel and ask «А тепер що змінилося?» Set it back to *A mistake + a hint she asked for*.
  4. **Paper end screen.** Choose *End: paper problem 30* in the panel. Say «Уяви, що ти розв'язала цю задачу в зошиті.» Let her tap through the «Так»/«Ні» questions, then ask «Що ти тут робиш?» and «Чи зручно це робити з зошитом поруч?»
  5. **Questions.** Ask in order, without giving examples: «Що тобі тут подобається?», then «А що не подобається або незрозуміло?»
- [ ] Ask one follow-up per option, only if she hasn't already covered it: for option 1, «Що означає вогник?»; for option 2, «За що забирають зірку?»; for option 3, «Що буде, коли сердечка закінчаться?», then «Як тобі таке правило?».
- [ ] After all three, let her switch between the tabs freely. Then ask «Якби ти розв'язувала задачі щодня, який варіант ти б вибрала?», «Чому?» and «Чи є щось з інших варіантів, що ти б сюди додала?»
- [ ] Last, ask «Що має бути, коли відповідь довелося показати?» Leave it open; don't offer choices.

Afterwards, also record:

- [ ] Her reaction to each handover screen, celebration or plain.
- [ ] Whether she understood the ↻ repeats.
- [ ] How the self-check screen went: did she read each item, or just tap «Так»?

### Note (2026-10-03)

The session with her is on hold. The parent ran the mocks and doesn't want her solving a whole word problem alone in the notebook, so [How does the guidance fade across the problem set?](08-guidance-fading.md) is reopened. The handover screens, the notebook cues and the paper-problem end screen may change once it's settled. Path, stars and hearts don't depend on it.

### Note (2026-10-03, fading revisited)

[How does the guidance fade across the problem set?](08-guidance-fading.md) is settled again: the notebook stays, one step at a time, and the app checks each step. Before the session with her, update the mock:

- Drop the paper-problem end screen for problem 30.
- Reword the 2.1 handover to the new draft.
- Add the 4.6 solo-try choice to each option.

Path, stars and hearts are unaffected. Then the session can resume with the second checklist, minus its paper end-screen step.

### Progress (2026-10-03, mock updated)

**Updated to the revisited fading** ([fading-schedule.md](../assets/fading-schedule.md)) in the same file, [game-mechanics-mock.html](../assets/game-mechanics-mock.html). Path, stars and hearts are unchanged.

- **The paper-problem end screen is gone** from all three options. That removes the 8 self-checks, the typed answer and action count, «Де твій розв'язок пішов не так?», the *Screen* entry, and the notes and no-JS labels that went with them. Problem 30 ends on the ordinary end screen, like every other problem, and the panel's intro and each end screen's note say so. That screen could also carry a short line of the steps where she needed help. Options 2 and 3 already name the step when a result had to be shown, so nothing was added.
- **The 2.1 handover** now uses the schedule's draft: «Тепер дії і відповідь ти записуєш у зошит. Яку дію робити — підкажу.» In option 1 the bird says it, with confetti. Option 2 keeps the plain card, and option 3 the notebook badge.
  - «Тут, як і раніше» is unchanged: Перекажи, Знайти, Відомо, Порівняння, Тип і схема, План.
  - «У зошиті» (Обчисли, Відповідь) now reads «По одній дії: я називаю дію, ти записуєш її в зошит і вводиш сюди результат. Я його одразу перевіряю. Відповідь потім звіриш зі зразком.» Before, it said she compares her whole record with the model afterwards.
- **A new solo-try choice screen (4.6)** in each option. It opens problem 29 (Пазл) and shows the problem's text.
  - It starts with the schedule's 4.6 draft: «Тепер можеш спробувати розв'язати задачу сама. Або, як і раніше, крок за кроком.»
  - Then «Як розв'язуватимеш цю задачу?» with two cards that look the same:
    - «Крок за кроком», selected by default: «Пишеш у зошит по одному кроку, і кожен одразу перевіряємо.»
    - «Спробую сама»: «Пишеш у зошит увесь розв'язок, а потім вводиш відповідь.»
  - Below them: «Кнопка «Розбий на кроки» є весь час. А якщо відповідь не зійдеться, розберемо задачу крок за кроком.»
  - One line in each option's own terms says both ways earn the same:
    - Option 1: «Досвід однаковий: +10 XP за будь-який спосіб.»
    - Option 2: «Зірки рахуються однаково для обох способів.»
    - Option 3: «Для сердечок обидва способи однакові.»
  - Each screen keeps its option's character:
    - Option 1 has the bird, without confetti, because confetti on a choice screen would make the solo try look like the prize.
    - Option 2 is a plain card.
    - Option 3 has an "unlocked" badge with a fork, so what's unlocked is the choice, not the solo try.
  - «Почати» only shows which she chose («Обрано: …») and offers «На головну». The problem itself isn't mocked.
  - Nothing extra is shown for a solo success. Each design note asks whether there should be (see *Afterwards* below).
- **Small fixes** where the mock still disagreed with the schedule:
  - *Missed problem.* Two notes and option 2's legend said a typed result or the final answer had been shown. They now say a plan line or an action's result («рядок плану чи результат дії»). Option 1's note adds "after 4.7 for Level 4".
  - *Problem stub.* Option 1's note now says the actions go to paper one at a time, and each result is checked before the next one opens.
  - *Daily goal.* Option 3's note now warns that a goal of 3 problems would rush her in Level 4, where a problem may take 8–11 minutes and a sitting holds 1–2.
  - *Checklist card.* Option 3's paper-screen note said «Підказка» brings it back, but the schedule dropped it. The note went with that screen.
- **Parent controls.** *Screen* is now *Home*, *Handover (2.1)*, *Solo-try choice (4.6)*, *Problem (stub)* and *End: problem 10*. *Reset all three* also sets each choice back to «Крок за кроком».
- **Checked** at 360, 390, 820 and 1440 px, on every screen of every option with all three outcomes, plus the homes after «Далі». Nothing overflows and the console shows no errors. The choice works by touch, mouse and keyboard. With JavaScript off, all 15 screens are shown.

**Checklist for the parent.** This replaces both earlier checklists. About 10 minutes on your own, then about 25 with her.

On your own, on the laptop:

- [ ] Open `.scratch/word-problem-poc/assets/game-mechanics-mock.html` in Chrome or Safari by double-clicking it. No internet is needed.
- [ ] Click the sliders button, tick *Design notes*, and read the yellow note on every screen of options 1, 2 and 3. Use *Screen* to reach *Handover (2.1)* and *Solo-try choice (4.6)*. On the end screen, try all three *How the problem went* settings.
- [ ] Untick *Design notes*, click *Reset all three* and close the panel. Leave *How the problem went* on *A mistake + a hint she asked for*. Make the browser full-screen.

With her, on the laptop (a laptop browser runs the file reliably; phones and tablets tend to open local files as a static preview):

- [ ] Say only: «Я покажу тобі три варіанти, як може виглядати гра із задачами. Мені цікаво, що ти про них думаєш. Правильних відповідей тут немає.» Don't name the mechanics, and don't say which one you like.
- [ ] For each option, in the order 1, 2, 3 (tabs at the top):
  1. **Home.** Let her look, then ask «Що тут відбувається?» If she doesn't mention a ↻ problem, point at one and ask «А це що?»
  2. **Handover.** Open the panel, choose *Handover (2.1)* and close the panel. Ask «Що тут треба робити?» and «Як тобі такий екран?»
  3. **Problem and end screen.** She taps «Почати», then «Завершити задачу», and looks at the end screen as long as she likes. Note whether she scrolls down to «Розбір» on her own. Then choose *A result had to be shown (missed)* in the panel and ask «А тепер що змінилося?» Set it back to *A mistake + a hint she asked for*.
  4. **Solo-try choice.** Choose *Solo-try choice (4.6)* in the panel and close it. Say «Уяви, що це вже задача 29, майже в кінці.» Let her read, then ask «Що тут треба вибрати?» Then ask «Що б ти вибрала?» and «Чому?» Don't explain the two ways, and don't choose for her. If she asks what one means, ask back «А як ти думаєш?» Note which card she picks and whether she reads the lines under the cards. Then she can tap «Почати». In options 2 and 3 you can shorten this to «А тут що б ти вибрала? Чому?»
  5. **Questions.** Ask in order, without giving examples: «Що тобі тут подобається?», then «А що не подобається або незрозуміло?»
- [ ] Ask one follow-up per option, only if she hasn't already covered it: for option 1, «Що означає вогник?»; for option 2, «За що забирають зірку?»; for option 3, «Що буде, коли сердечка закінчаться?», then «Як тобі таке правило?».
- [ ] After all three, let her switch between the tabs freely. Then ask «Якби ти розв'язувала задачі щодня, який варіант ти б вибрала?», «Чому?» and «Чи є щось з інших варіантів, що ти б сюди додала?»
- [ ] Last, ask «Що має бути, коли відповідь довелося показати?» Leave it open; don't offer choices.

Afterwards, record under `## Comments` in this ticket:

- [ ] Her pick; what she said about each option, in her own words where you can; anything she misunderstood; whether she looked at «Розбір» on her own; what she'd combine; and her answer about a shown answer.
- [ ] Her reaction to each handover screen, celebration or plain.
- [ ] Whether she understood the ↻ repeats.
- [ ] Her reaction to the solo-try choice in each option: which card she picked and why, whether she noticed that «Розбий на кроки» is there at any time, and anything she said about one way being better or harder.
- [ ] Your own call on whether a wrong answer should cost anything (nothing, a star or a heart), and on whether a solo success should earn anything extra. The mock shows nothing extra. Anything in XP, stars or hearts would make step by step cost something by comparison, which the fading decision rules out. This ticket decides both, and her preference is one input.

### Note (2026-10-03, the parent's calls, delegated)

The parent is away overnight and delegated their calls on this ticket to the orchestrator ("make a research, check other saas, choose recommended option"). An AFK research file, [game-calls.md](../assets/game-calls.md), settles them with sources, and the orchestrator adopts its recommendations:

- **What a wrong answer costs: nothing**, in every option. The fixed consequences are enough: a hint, then the answer with its reason, and a missed problem comes back once at the end of its level. Free hints plus costly misses would pay her to tap «Підказка» twice before thinking. Duolingo dropped hearts in 2025 for the same reason.
- **A solo-try success earns nothing extra.** One plain line on the end screen says how she solved it, the same size for every way.
- **No streak**, daily or weekly. Where an option has a "today" spot, the goal is one finished problem, today only, hidden once the set is finished.
- **Handover screens aren't celebrations**: they're calm, in the option's look, with no confetti. Celebration moves to new level-end and set-end screens.
- **Also:**
  - «Далі» always goes home.
  - "Shown" means what makes a problem missed, in every counter.
  - There are no rewards inside a problem.
  - Praise names what happened («Усе зійшлося з першого разу.» replaces «Без жодної помилки! Так тримати!»).
  - The mascot is in option 1 only, and is never sad.
- **The fallbacks' rule is accepted**: if her reason for option 2 or 3 is the stars or hearts themselves, a second «Підказка» tap counts like two misses. It shows the model, which makes the problem missed, as [Build the paper steps and the fading schedule](14-build-fading.md) reads it.

**Built ahead of her pick: option 1 · Стежка**, in [Build the game layer and the loop through the problem set](19-build-game-layer.md). With the calls applied, it keeps the most (path, XP, mascot). Option 3 loses its hearts, and option 2's stars become a plain count. It's also the map's Duolingo-style default. The build keeps the option in one module, so a different pick is a contained switch.

**Still open, and the parent's with her:** the session from the "mock updated" checklist. This ticket resolves when her pick and her words are in. If she picks option 2 or 3, ticket 19 switches to that option's build spec in game-calls.md.
