# Build the guided-problem flow

Labels: wayfinder:task
Status: closed
Assignee: maksymomelchuk
Blocked by: [Scaffold the PoC shell and deploy it to Netlify](10-scaffold-and-deploy.md)
Parent: [Map](../MAP.md)

## Question

Build the fully guided problem from [guided-flow.md](../assets/guided-flow.md) into the PoC shell. Use the walking boy and the triangle as its first two problems; their content can be ported from [guided-flow-mock.html](../assets/guided-flow-mock.html), which already works end to end.

- [x] Each step of the routine as its own screen: Перекажи, Знайти, Відомо, Порівняння, Тип і схема, План, Обчисли, Відповідь, then the closing Розбір. No Estimate step.
- [x] The problem text stays on top, with each step's highlight; the write-up builds up under it, exactly as on paper
- [x] Wrong answers: a hint on the first try; on the second, the answer is shown with its reason and she carries on. In Обчисли, a wrong action and a wrong result get different feedback
- [x] Taps only, plus the shell's keypad for results
- [x] All three diagram families: segment bars, a segment split under a brace, and the three-quantity table. Also the shared diagram for chains and stacked diagrams for problems that mix families. The brace and the stacked case weren't mocked, so design them here
- [x] TypeScript types for a problem's guided data, covering the fields in "What each problem needs in the data", kept in the separate typed data file from [Should the PoC be a plain web page or an Expo app?](03-poc-tech.md). The two sample problems are the first entries
- [x] Each problem carries a list of the steps it prompts, defaulting to all of them, so fading can turn steps off later without rework. Which steps to turn off is not decided here
- [x] Hints, shown answers and arithmetic slips are recorded against each step in the shell's progress module. Whether they're ever sent anywhere is the trial's call
- [x] Deployed. The parent plays both problems through on her main device

Out of scope here: the game layer ([Which Duolingo-style game mechanics go into the PoC?](09-game-mechanics.md)), the fading schedule ([How does the guidance fade across the problem set?](08-guidance-fading.md)) and the other 28 problems' data ([Write the guided-step data for the problem set](13-write-guided-data.md)).

AFK: the agent builds it; the parent checks it on the device. For UI work, use `/impeccable` or `/emil-design-engineering`.

Resolved when both sample problems play through on her main device from the deployed link. The resolution records the data types' location and anything the brace or stacked diagrams decided.

From [Write the 30 problems and their school write-ups](11-write-problems.md) (see [problem-set.md](../assets/problem-set.md)):

- **Each action has one sign.** A fraction of a number takes two actions, and 1/4 needs no «· 1».
- **The number chips** in Обчисли are the text's numbers, any unit change, and earlier results.
- **Swappable actions**: each problem has `Order:` lines saying which actions can swap. Accept either order without listing it as a separate plan.
- **Two-part answers** (3.3, 3.7): the types need an Answer step that can hold two parts. In 3.7 one part is a name, not a number.

From [How does the guidance fade across the problem set?](08-guidance-fading.md) (see [fading-schedule.md](../assets/fading-schedule.md)):

- **Fading is built separately**, in [Build the paper steps and the fading schedule](14-build-fading.md). Here, only keep the data types ready for it.
- **The types carry a hide-slot-count flag** for План (hidden from 2.5).
- **«Чому?» is attached to the step it follows**, the decode or the plan, so it disappears when that step isn't prompted.
- **Every guided-step field is optional per step**, since a problem only has data for the steps it prompts. The write-up, the other plans, the final answer and the closing screen are always present.

From [Scaffold the PoC shell and deploy it to Netlify](10-scaffold-and-deploy.md): her main device is an iPad Air on iPadOS 18, opened from the home-screen icon (standalone, Safari's engine). Test there first: portrait and landscape, touch only.

## Comments

### Progress (2026-10-03)

The AFK part is done: both problems are built and live. The last item, playing them on her iPad, is the parent's. I built this while the shell's device check was still pending. That check has since been done (iPad Air, iPadOS 18), so I tested at iPad Air sizes first.

**Live link:** https://reliable-macaron-77e751.netlify.app (the same site and home-screen icon as the shell). Deployed with `cd poc && npm run deploy`.

**What's in `poc/src/`:**

- **Data types: `problems/types.ts`.** The data file is `problems/problems.ts`, with the walking boy (2.3) and the triangle (4.7), word for word from [problem-set.md](../assets/problem-set.md). Neither file has any UI code. Every problem always has its text, its `writeUp` (short record, unit changes, every valid plan, «Відповідь», the answer's parts), and its `review`. The guided-step data sits under `steps`, and each step is optional. «Чому?» lives inside its step (`steps.decode.why` or `steps.plan.why`), so it goes when that step does. `guidance` is a per-step map that defaults to guided, and `guidance.plan.hideSlotCount` is the fading flag. An action has one sign and an `id` that the plan cards use. `Order:` lines become `needs`, and swapped orders are accepted without listing them as extra plans. `answerParts` can hold two parts, and one can be a name.
- **Data check: `problems/validate.ts`.** It's the TypeScript counterpart of `check-problem-set.py`. It checks every action's arithmetic (exact decimals) and where each number comes from. It also checks one right option per menu, that every number and comparison in the text has its data, the diagram slots and chips, the plan cards, and that the steps' writes add up to the short record. It needs data only for the steps a problem prompts.
- **The flow:** the pure logic is in `guided/checks.ts` (answer checks, plan acceptance, building an action) and `guided/flow.ts` (the screen list, the write-up). The screens are in `guided/screens/` and the diagrams in `diagrams/`.
- **Records: `lib/progress.ts`, now version 2.** Each problem keeps a list of attempts. An attempt has its start and finish times, the steps it prompted, and the plan she followed. Each wrong try is an event with its time, its step, the part of the step, and `hint` or `shown`. Arithmetic slips are flagged `slip`. An open problem also resumes where it was after the app is reloaded (`guided/session.ts`).
- **For the parent:** a quiet «Для батьків» link at the bottom of the list. It shows the records and has a reset. From there, «Зразки схем» shows tappable samples of every diagram family.
- **Checked:** 60 unit tests, the type check and lint pass. A script played both problems end to end by touch, with deliberate mistakes on most screens: WebKit at iPad Air 820×1180 and 1180×820, iPhone 13 portrait and landscape, Chromium at phone, tablet and 1440×900 laptop sizes. There were no console errors and nothing overflowed. Each finished write-up matches problem-set.md, and the records listed every hint, shown answer and slip. I checked the live link the same way after deploying.

**What I decided here (for the resolution):**

- **The brace diagram** (частини і ціле, дріб від числа): one segment drawn to scale, with a curly brace under it and the whole below the brace. Labels sit above their parts. A label over several parts gets its own small brace above them, and for a fraction the parts it takes are shaded. Captions are optional.
- **The stacked case:** one diagram per family, one under the other, each with a caption (such as «Покупка» and «Решта»). They share one set of slots and chips.
- **The shared chain diagram:** the bars from one left edge, with dashed guides carrying each bar's end down. A brace on the right holds the sum (the triangle's «P — ?»).
- **On screen, the plan is the «Розв'язання» skeleton** «1) … — довжина сторони BC;», as on paper in [fading-schedule.md](../assets/fading-schedule.md). Обчисли fills in each line.
- **Learner text says «дія», not «крок», for an action**, following the glossary. This changed three strings from the mock: «Остання дія має знаходити те, що питають у задачі.», the walking boy's order hint «…це вже остання дія.», and its «Чому?», «Чому перша дія плану саме така?» with the answer «Бо її можна виконати одразу з відомих чисел…». The other texts are the mock's.
- **Wide screens (iPad landscape, laptop)** put the problem and the write-up in a left column, beside the task. Portrait has one column.

**For fading ([Build the paper steps and the fading schedule](14-build-fading.md)):** `stepGuidance()` and `buildScreens()` in `guided/flow.ts` are the places to change. Add `'paper'` to `StepGuidance.mode`, and the `switch` in `buildScreens` shows where its screens go. The paper models are already in `writeUp`. `hideSlotCount` already works: without a slot count, she takes as many cards as she likes, and «Чогось не вистачає…» covers a plan that's too short. A guided step with no data is skipped.

**Parent's checklist.** About 15 minutes, on her iPad, before the trial.

1. Open «Задачі» from the home-screen icon. If you still see the old keypad page, close the app (swipe it up in the app switcher) and open it again.
2. The list shows «Рівень 2 · Задача 2.3» and «Рівень 4 · Задача 4.7», each with «Почати».
3. **Задача 2.3, iPad upright.** Make the mistakes listed here on purpose to see the hint, then the shown answer:
   1. Перекажи: tap «Хлопчик пройшов 3000 м. Треба дізнатися, скільки хвилин він ішов.», then «Перевірити». You should see a red hint, «Перечитай останнє речення…». Tap the second option, then «Перевірити»: green «Так. Саме про це задача.», then «Далі».
   2. Знайти: tap «3000 м» in the text, then «Перевірити»: a hint. Tap «Яку відстань він пройде…», then «Перевірити»: the question turns yellow.
   3. «Що саме шукаємо?»: tap «Швидкість хлопчика», then «Перевірити» (a hint). Tap «Час, за який хлопчик пройде 3000 м», then «Перевірити»: the right answer is shown in green with «Подивись, як правильно…», the button turns red, and «За 20 хв — ? м» appears in «Запис у зошиті».
   4. Відомо: tap «20 хвилин» first, then «Час, за який треба знайти відстань». Then tap «3000 м», then «…за 1 годину». Then answer «Ні. Спершу переведу: 1 год = 60 хв»: the first line becomes «За 1 год (60 хв) — 3000 м».
   5. Тип і схема: «Три величини» for both. In the table, tap a cell, then a chip: 60 хв, 3000 м, 20 хв.
   6. План: tap «у скільки разів 20 хв менше, ніж 1 год», then «відстань, яку хлопчик пройде за 20 хв» (the second plan). You should see «Так. Це теж правильний план.» Tapping a card in a slot puts it back.
   7. Обчисли, дія 1: tap 60, :, 20, type 4 on the keypad, then «Перевірити». You should see «Дію складено правильно. Перевір обчислення.» (an arithmetic slip). Fix it to 3. Дія 2: 3000 : 3 = 1000.
   8. Відповідь, then Розбір: check that the full write-up, the three checks, «Головне» and «Інший правильний план» (3000 : 60 = 50 …) are all there. Tap «Готово».
4. **Задача 4.7, iPad on its side.** This is the two-column layout.
   1. Midway, at any screen, tap × at the top left. The list should say «Продовжити», and reopening should continue where you left off.
   2. Порівняння, «BC на 5,1 см менша від AC»: tap «BC» (a hint), then «AC». For «AC на 5,1 см ___, ніж BC», tap «менша» (a hint), then «більша». The short-record line should become «AC — ?, на 5,1 см більша, ніж BC».
   3. План: AC, then BC, then периметр should give the hint «Щоб знайти AC, треба вже знати BC…». Fix the order to BC, AC, периметр.
   4. Обчисли, дія 2: tap 12,1, −, 5,1 and type 7. You should see the action's hint, «Подивись на короткий запис: AC на 5,1 см більша, ніж BC.», which is different from the slip message in 3.7.
5. At the bottom of the list, tap «Для батьків». Both problems should be listed with their hints, shown answers and slips. Then tap «Стерти записи», so the trial starts clean. Have a look at «Зразки схем» too: these are the brace and stacked diagrams, which weren't in the mock.
6. Report:
   - whether every tap landed the first time: the words in the text, the small numbers, the diagram slots, the keypad;
   - anything that read wrong in Ukrainian;
   - whether anything was hidden behind the bottom bar, in either orientation;
   - whether the hint and the shown answer behaved as described above;
   - your view on the brace and stacked diagrams;
   - screenshots of anything that looked off.

**A note for the trial.** The resume keeps only one open problem at a time. Opening a different problem starts that one fresh.

### Parent's check (2026-10-03)

The parent played 4.7 on the iPad: "we solved task 4.7, lgtm. Some styles are broken and overlaps, but in general we like it". Which screens are broken is still to come (screenshots), and 2.3 isn't reported yet. The style fixes are being made on this ticket before it closes.

### Resolution

Both sample problems play through on her iPad from the home-screen icon: https://reliable-macaron-77e751.netlify.app. The parent played 4.7 ("lgtm … in general we like it") and then 2.3 ("walking boy done, everything else works. It was not ease for her :D") on 2026-10-03.

- **Data types**: `poc/src/problems/types.ts`. The two problems, word for word from [problem-set.md](../assets/problem-set.md): `poc/src/problems/problems.ts`. The data checker, a TypeScript port of `check-problem-set.py` that the tests run over every problem: `poc/src/problems/validate.ts`.
- **Flow**: `poc/src/guided/` (`flow.ts` decides each step's guidance and builds its screens; `checks.ts` checks the answers). Records: `poc/src/lib/progress.ts` (version 2), with timestamped hints, shown answers and slips per step. Visible to her: a quiet «Для батьків» link to read and reset them, «Зразки схем», and resuming one open problem after a reload.
- **The brace and stacked diagrams**, as designed here (see the progress comment): brace = one segment to scale with the whole under a curly brace and the parts labelled above, shading for the parts a fraction takes; stacked = one captioned diagram per family, one under the other, sharing one set of slots and chips; chain = bars from one left edge, with a brace on the right holding the sum. The parent gave no separate view on them.
- **Learner text** says «дія», not «крок», for an action.
- **Found on the device**: the question highlight breaks into pieces, and the number underline overlaps it and slides off its number ([screenshots](../assets/ipad-screenshots/)). The fixes are being made and deployed under this ticket; the parent re-checks them on the iPad together with [How does the Тип і схема step ask for the type so that it's clear to her?](15-clear-type-step.md). The Тип і схема step itself was unclear to both the parent and her, which became that new ticket.

**Passed to existing tickets:** [How does the guidance fade across the problem set?](08-guidance-fading.md) (2.3 wasn't easy for her even fully guided), [Write the guided-step data for the problem set](13-write-guided-data.md) and [Build the paper steps and the fading schedule](14-build-fading.md) (where the code expects their work).

**New ticket:** [How does the Тип і схема step ask for the type so that it's clear to her?](15-clear-type-step.md).

**Map fog:** her records stay on the iPad only, and only one open problem resumes at a time (added to Running the trial).

### Progress (2026-10-03, fixes)

The style fixes from the parent's iPad screenshots ([ipad-screenshots/](../assets/ipad-screenshots/)) are live at https://reliable-macaron-77e751.netlify.app. They were deployed with `cd poc && npm run deploy` and checked on the live link.

**Fixes, and the screens they were on:**

1. **The question highlight was broken into separate boxes** (Знайти onwards, every screen with the question highlighted; both screenshots). It showed as «Яку відстань він» / «пройде за» / «20 хвилин» / «?», with seams and overlaps where it wrapped. Now the whole question is one continuous highlight that carries across the line break.
2. **The comparison highlight had the same seams** (Порівняння, 4.7). «, але на 5,1 см менша від AC» was three pink boxes; it is now one.
3. **The dotted underline under the numbers was in the wrong place** (Відомо; both screenshots). Safari on the iPad drew it beside «3000 м» rather than under it, and it ran along the bottom of the yellow highlight. Tappable numbers no longer use an underline. Each one now has a dashed blue frame around it.
4. **The picked number overlapped the highlight around it** (Відомо, «20 хвилин» inside the question; screenshot 2). The picked number is now a blue box that sits inside the yellow highlight. On Відомо, every number keeps the same size and position whether it's waiting, picked or done, so tapping one changes only its colours and never moves the text or the line height.
5. **Highlights on neighbouring lines overlapped** (Знайти and Відомо). A tappable piece of text had extra height for easier tapping, which pushed its highlight into the line above and below. The extra height is gone and the lines are spaced a little further apart, so highlights on neighbouring lines no longer touch.
6. **The table pushed the page sideways in a narrow window** (2.3, from Тип і схема to Розбір, at Split View's narrowest width). The table now fits a narrow window, and it scrolls inside the notebook rather than moving the whole page.
7. **iPad safeguards I couldn't see headless:**
   - quick taps on the text no longer zoom the page (pinch zoom still works);
   - press-and-hold on a tappable word no longer selects the text;
   - iOS's own button styling is reset, so answers that turned green or red don't look faded.

**How it was checked.** A script played both problems through by touch with deliberate mistakes, using Safari's engine (WebKit). On every screen it checked for overlapping controls, overflowing text, broken or overlapping highlights, diagram labels that overlap, and content hidden behind the top or bottom bar. Sizes: iPad Air 11" (820×1180, 1180×820), iPad Air 13" (1024×1366, 1366×1024), Split View at 320, 585 and 795 wide, the 11" at 125% zoom, and a laptop. No issues and no console errors. Unit tests, the type check and lint pass.

**Not acted on:** [2.3-type-step-unclear.png](../assets/ipad-screenshots/2.3-type-step-unclear.png) shows Тип і схема from before these fixes. Its broken question highlight is fixed. If "unclear" is about the step itself (the prompt or the type names), that's a content change and needs the parent's words first.

**Parent's checklist.**

1. Close «Задачі» fully (swipe it up in the app switcher) and open it again from the icon, so the new version loads.
2. Open 2.3 (Продовжити or Почати) and play it through. Check:
   - **Знайти:** tap the question. It turns light blue as one piece, then yellow as one piece after «Перевірити». There's no seam at the line break.
   - **Відомо:** «3000 м» and «20 хвилин» each have a dashed blue frame. Tap «20 хвилин»: it turns into a blue box inside the yellow, and «?» and the text around it don't move. After a right answer, the number turns green.
3. Open 4.7 and go as far as Порівняння, iPad on its side. The comparison and the question should each be one continuous highlight.
4. Try both orientations, then report anything that still overlaps or looks broken, with a screenshot and the step name.

### Note (2026-10-03, re-check)

The parent: "highlights look fine on macbook now". The iPad re-check is still to come with [15](15-clear-type-step.md) and [16](16-help-pick-operation.md).
