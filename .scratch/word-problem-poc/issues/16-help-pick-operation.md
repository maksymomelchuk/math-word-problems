# Help her pick the operation in Обчисли

Labels: wayfinder:task
Status: open
Assignee: maksymomelchuk
Blocked by: [Build the guided-problem flow](12-build-guided-flow.md)
Parent: [Map](../MAP.md)

## Question

In her first try of the walking boy (2.3), the parent saw this: "she selects option to find 60/20=3 and then messed up if she need to multiply or divide 3000/3, and even she wants to add 3000+3". She picked the «у скільки разів» plan from the cards, but at Обчисли, action 2, she couldn't tell which operation it needs. Today each action has one hint, whichever sign she picks («Час у 3 рази менший, то й відстань у 3 рази менша.»), and then the answer is shown. The parent chose to build more help into the step now.

- [ ] **A hint for each wrong sign.** When she builds an action with the wrong sign, the hint answers *that* mistake and points back at the relation or the short record. For 2.3, plan B, action 2:
  - for «+»: «3 — це не метри, а у скільки разів менше часу. До метрів не додають рази.»
  - for «·»: «За 20 хв він пройде більше чи менше, ніж за годину?»
  
  Do the same for both plans of 2.3 and every action of 4.7. The wording is a draft for the parent to review. The second miss still shows the answer, with its reason.
- [ ] **A direction check before some actions.** Before she builds an action for a «у … разів» or rate relation (Три величини), ask one quick question about the result, such as «За 20 хв він пройде більше чи менше, ніж 3000 м?», with two buttons. A wrong pick gets a hint from the text, then the right one is shown. Then she builds the action. The data marks which actions get the check, so the data ticket can set it for all 30. This brings back the dropped Estimate step as a direction check only, not a numeric estimate.
- [ ] Types and data: per-sign hints and the direction check go into `poc/src/problems/types.ts`, with the validator and tests updated. Fill both sample problems.
- [ ] Hints, shown answers and direction-check misses are recorded per step, like the rest.
- [ ] Deployed. The parent re-checks on the iPad, then plays 2.3 with her again.

Never a keyword rule ([Which word-problem teaching methods work for kids her age?](01-teaching-methods.md)): no hint may say «менше → ділимо» as a word trigger. A hint can say what the relation means for this problem's quantities: «час у 3 рази менший, тож і відстань у 3 рази менша».

AFK: the agent builds it. For UI work, use `/impeccable` or `/emil-design-engineering`. HITL: the parent checks it on the iPad, with her.

Resolved when the parent confirms it helps on the iPad. The resolution records the hint and direction-check fields in the types, and the reviewed wording.

From [How does the guidance fade across the problem set?](08-guidance-fading.md), revisited: this answers whether the direction check stays when Обчисли goes to paper. It does. From 2.1 the check runs before she writes each marked action in her notebook, and from 3.1 after her plan line for that action is checked.

- **It fades per relation type.** After two right in a row on a type, each counted only if the action after it is right too, it stops for that type. A wrong sign on that type brings it back. Once it has faded, «Підказка» on the action asks it.
- **It's never asked on «дріб від числа»** or any multiplier below 1, where "less" goes with multiplying.
- **The sign hints reach paper too.** If a typed result is what a wrong sign gives with the same numbers (3000 · 3 = 9000), that sign's hint shows.
- **One more field.** Each direction check needs the relation type it belongs to, for the per-type fade. [Build the paper steps and the fading schedule](14-build-fading.md) builds all this, and now waits for this ticket.

## Comments

### Progress (2026-10-03)

The AFK part is built and tested locally. **It isn't deployed yet**: the orchestrator deploys once the Тип і схема work in [15](15-clear-type-step.md) is done too. The checklist below is for after that deploy. Status stays open until you've checked it on the iPad and played 2.3 with her.

**What she sees now in Обчисли**

- **A hint for each wrong sign.** If she builds an action with the wrong sign, the hint answers that sign. It points at what the numbers mean, at the short record or at the diagram, and never says "word → operation". Your two drafts for 2.3, plan B, action 2 are used word for word. The right sign with the wrong numbers (e.g. 3 : 3000) still gets the action's old hint. An arithmetic slip still gets «Дію складено правильно. Перевір обчислення.» and is recorded apart.
- **The second miss shows the answer with its reason**, e.g. «Подивись, як правильно. 3000 : 3 = 1000 (м). Година — це 3 рази по 20 хв, тож 3000 м ділимо на 3 рівні частини.»
- **The direction check.** On actions the data marks, the screen first asks «Спершу подумай: За 20 хв він пройде більше чи менше, ніж 3000 м?» with «Більше» / «Менше». A wrong pick gets a hint from the text; a second wrong pick shows the right one with its reason. «Далі» then opens the chips and keypad, and her answer stays above the action in a blue box: «Ти вже знаєш: За 20 хв він пройде менше, ніж 3000 м.»
- **Where the check is set:** 2.3 plan A, both actions (rate); 2.3 plan B, action 2 (the «у 3 рази менший» action). It isn't set on plan B action 1 (60 : 20 = 3 рази), because its result is a number of times, not something more or less than a number she knows. 4.7 has no «у разів» or rate actions, so it has no check.
- **Records** (under «Для батьків»): a wrong sign is listed with the sign, e.g. «Обчисли (відстань, яку хлопчик пройде за 20 хв): підказка, знак «+»». A direction-check miss is listed as «…, більше чи менше». Your records already on the iPad stay: the record format only gained a field.

**One choice for you.** The direction check works like every other question: hint first, then the answer shown. With two buttons, her second pick after a hint is almost always right, but the miss is still recorded. If you'd rather the hint and the right answer appear together on the first miss, say so. It's a small change.

**Where it is (`poc/src/`)**

- Types, `problems/types.ts`: on `Action`, `signHints` (a hint for each wrong sign), `reason` (shown with the answer) and `direction`. The new `DirectionCheck` has `question`, `comparedWith` (the number in the question), `answer` (`'більше'` or `'менше'`), `hint` and `explain`. The data marks a check by giving an action a `direction`.
- Data, `problems/problems.ts`: filled in for both plans of 2.3 and every action of 4.7.
- Data check, `problems/validate.ts`. Sign hints are never given for the action's own sign, and once given they cover all three wrong signs. A direction question holds «більше чи менше» and its number and ends with «?». The answer must agree with the action's result compared with `comparedWith`, so 1000 against 3000 must be «менше».
- Screen: `guided/screens/ComputeScreen.tsx`. Checks: `checkAction`, `shownAction`, `checkDirection` and `directionStatement` in `guided/checks.ts`. Records: `sign` on `HelpEvent` in `lib/progress.ts`, and the part `<action id>-direction`.
- Tests: `guided/compute.test.ts` and `problems/actionHelp.test.ts` (new), plus one line in `guided/checks.test.ts` and one test in `lib/progress.test.ts`. 90 tests, the type check and lint pass.
- Checked by touch with a script, making every mistake above: Safari's engine (WebKit) at iPad Air 820×1180 and 1180×820, iPhone 390×844 and 844×390; Chromium at 1440×900 (keyboard too), 1024×1366 and 360×740. There were no console errors and nothing overflowed. On a phone held sideways, the direction buttons start just above the bottom bar, so she scrolls a little, as on the other two-button screens.

**New Ukrainian lines for you to review** (drafts; yours are marked)

On screen:

- «Спершу подумай» (over the direction question); buttons «Більше», «Менше»
- «Ти вже знаєш» (over her answer while she builds)
- «Вибери: більше чи менше.» (tapping «Перевірити» with nothing picked)
- For you, under «Для батьків»: «…, більше чи менше», «знак «+»»

2.3, plan A, action 1, 3000 : 60 = 50 (м):

- Check: «За 1 хв він проходить більше чи менше, ніж 3000 м?» → менше
  - hint: «Подивись на короткий запис: 3000 м — це за всю годину, за 60 хв. А 1 хв довша чи коротша за годину?»
  - reason: «Хвилина коротша за годину, тож за хвилину він проходить менше, ніж 3000 м.»
- «+»: «3000 — це метри, а 60 — хвилини. До метрів не додають хвилини. Подивись на короткий запис: за 60 хв — 3000 м. А за 1 хв?»
- «−»: «3000 — це метри, а 60 — хвилини. Від метрів не віднімають хвилини. Подивись на короткий запис: за 60 хв — 3000 м. А за 1 хв?»
- «·»: «За 1 хв він проходить більше чи менше, ніж за всю годину? А 3000 · 60 — більше чи менше, ніж 3000?»
- Reason with the shown answer: «За кожну з 60 хвилин він проходить однаково, тож 3000 м ділимо на 60 рівних частин.»

2.3, plan A, action 2, 50 · 20 = 1000 (м):

- Check: «За 20 хв він пройде більше чи менше, ніж за 1 хв (50 м)?» → більше
  - hint: «За 1 хв — 50 м. А 20 хв довші чи коротші за 1 хв?»
  - reason: «20 хв довші за 1 хв, тож і пройде він більше, ніж 50 м.»
- «+»: «50 — це метри, а 20 — хвилини. До метрів не додають хвилини. За 1 хв — 50 м. А за 20 таких хвилин?»
- «−»: «50 — це метри, а 20 — хвилини. Від метрів не віднімають хвилини. За 1 хв — 50 м. А за 20 таких хвилин?»
- «:»: «За 20 хв він пройде більше чи менше, ніж за 1 хв? А 50 : 20 — більше чи менше, ніж 50?»
- Reason: «Щохвилини він проходить 50 м, а йде 20 хв: це 20 разів по 50 м.»

2.3, plan B, action 1, 60 : 20 = 3 (рази):

- «+»: «60 + 20 — це година і ще 20 хв. А шукаємо, у скільки разів 20 хв менше, ніж година: скільки разів 20 хв уміщаються в 60 хв?»
- «−»: «60 − 20 показує, на скільки хвилин 20 хв менше, ніж година. А шукаємо, у скільки разів: скільки разів 20 хв уміщаються в 60 хв?»
- «·»: «Шукаємо, скільки разів 20 хв уміщаються в 60 хв. Невже аж 60 · 20 = 1200 разів?»
- Reason: «20 хв уміщаються в 60 хв 3 рази: 20 + 20 + 20 = 60.»

2.3, plan B, action 2, 3000 : 3 = 1000 (м):

- Check: «За 20 хв він пройде більше чи менше, ніж 3000 м?» → менше
  - hint: «3000 м — це за всю годину. А 20 хв довші чи коротші за годину?»
  - reason: «20 хв коротші за годину, тож і пройде він менше, ніж 3000 м.»
- «+» (yours): «3 — це не метри, а у скільки разів менше часу. До метрів не додають рази.»
- «−»: «3 — це не метри, а у скільки разів менше часу. Від метрів не віднімають рази.»
- «·» (yours): «За 20 хв він пройде більше чи менше, ніж за годину?»
- Reason: «Година — це 3 рази по 20 хв, тож 3000 м ділимо на 3 рівні частини.»

4.7, action 1, 8,4 + 3,7 = 12,1 (см):

- «−»: «Подивись на короткий запис: BC на 3,7 см більша, ніж AB. А 8,4 − 3,7 вийде менше, ніж AB.»
- «·»: «BC більша, ніж AB, не у 3,7 раза, а на 3,7 см. Подивись на схему: BC — це AB і ще 3,7 см.»
- «:»: «3,7 см — це не у скільки разів, а на скільки BC більша, ніж AB. Подивись на схему: BC — це AB і ще 3,7 см.»
- Reason: «BC — це AB і ще 3,7 см.»

4.7, action 2, 12,1 + 5,1 = 17,2 (см):

- «−»: ««Менша» в задачі сказано про BC. Подивись на короткий запис: AC на 5,1 см більша, ніж BC. А 12,1 − 5,1 вийде менше, ніж BC.»
- «·»: «AC більша, ніж BC, не у 5,1 раза, а на 5,1 см. Подивись на схему: AC — це BC і ще 5,1 см.»
- «:»: «5,1 см — це не у скільки разів, а на скільки AC більша, ніж BC. Подивись на схему: AC — це BC і ще 5,1 см.»
- Reason: «AC на 5,1 см більша, ніж BC: це BC і ще 5,1 см.»

4.7, action 3, 8,4 + 12,1 + 17,2 = 37,7 (см):

- «−»: «Периметр — це довжина межі трикутника: обійди його по AB, BC і AC. Чи може такий шлях бути коротшим за одну сторону?»
- «·»: «Периметр — це довжина межі трикутника: обійди його по AB, BC і AC. Скільки сантиметрів ти пройдеш?»
- «:»: «Периметр — це довжина всієї межі трикутника, а не її частина: обійди його по AB, BC і AC. Скільки сантиметрів ти пройдеш?»
- Reason: «Периметр — це AB, BC і AC разом: шлях навколо трикутника.»

**Parent's checklist** (once the orchestrator says it's deployed; about 15 minutes, then a play with her)

Each action screen gives one hint, and the next miss shows the answer. To see another sign's hint on the same action, tap × after the hint, then «Продовжити»: the action starts fresh, with the direction check first.

1. Close «Задачі» fully (swipe it up in the app switcher) and open it again from the icon.
2. **2.3, plan B.** At План, pick «у скільки разів 20 хв менше, ніж 1 год», then «відстань, яку хлопчик пройде за 20 хв».
   1. Дія 1: build 60 + 20, type 80, «Перевірити»: you see the «+» hint. Fix it to 60 : 20 = 3.
   2. Дія 2: you see «Спершу подумай: За 20 хв він пройде більше чи менше, ніж 3000 м?» and no number chips yet. Tap «Більше», «Перевірити»: a red hint. Tap «Більше» again, «Перевірити»: «Менше» turns green with the reason. Tap «Далі»: the blue «Ти вже знаєш» box and the chips appear.
   3. Build 3000 + 3: «3 — це не метри…». Tap ×, then «Продовжити», answer the check, build 3000 · 3: «За 20 хв він пройде більше чи менше, ніж за годину?». Again × and «Продовжити», then 3000 − 3: the «−» hint. Then make any second mistake: the answer is shown with «Година — це 3 рази по 20 хв…».
3. **2.3, plan A.** Open 2.3 again, and pick «відстань, яку хлопчик проходить за 1 хв», then «відстань, яку хлопчик пройде за 20 хв». Дія 1 has its own check («…ніж 3000 м?» → менше). Дія 2 asks «…ніж за 1 хв (50 м)?» → більше. On дія 2, try 50 + 20, 50 − 20 and 50 : 20 (× and «Продовжити» between them), and read each hint.
4. **4.7, дія 2 (AC):** try 12,1 − 5,1, then · and :. The «−» hint should start with ««Менша» в задачі сказано про BC.»
5. **«Для батьків»:** each mistake is listed with its sign, e.g. «знак «+»», and the direction-check misses with «більше чи менше». Then tap «Стерти записи», so her play starts clean.
6. **With her:** let her play 2.3 from the start, without help. Write down:
   - which plan she picks;
   - her direction-check answers;
   - on action 2: whether she picks the sign herself on the first try, after which hint, or only when the answer is shown;
   - anything she says about the question or the hints.

   «Для батьків» will show the misses and signs.
7. Send back any wording changes to the lines above, and whether the hint-then-show on the direction check should stay or change (see "One choice for you").
