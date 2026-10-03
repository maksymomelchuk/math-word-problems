# One guided problem, step by step

Decided in [What does one guided problem look like, step by step?](../issues/07-guided-problem-flow.md) with the parent, 2026-10-03. Terms are from [CONTEXT.md](../../../CONTEXT.md).

Clickable mock: [guided-flow-mock.html](guided-flow-mock.html). Open it in a browser and switch between the walking boy (slot 2.3) and the triangle (slot 4.7). The mock still carries yellow notes for the parent. Its Estimate step has been removed to match the decisions below.

This file describes a **fully guided problem**, one where the app prompts every step of the routine. Which steps a given problem prompts is decided in [How does the guidance fade across the problem set?](../issues/08-guidance-fading.md).

## Her teacher's format (from the parent)

- A **short record** is required for every word problem.
- Each action has an **explanation** after the dash: «1) 8,4 + 3,7 = 12,1 (см) — довжина сторони BC;».
- **«Відповідь» is a full sentence**: «Відповідь: периметр трикутника дорівнює 37,7 см.»

No photo of her notebook was collected; these three answers settled the format. A guided problem builds this write-up on screen as she goes.

## The routine, screen by screen

| # | Step | What she does | What it writes |
|---|---|---|---|
| 1 | **Перекажи** (retell) | Picks the best of three one-line retellings. The wrong ones are whole-problem misreadings, such as "the three numbers are the sides" (it gives 17,2, the classic trap answer). | Nothing |
| 2 | **Знайти** (asked) | (a) Taps the question in the problem text. (b) Picks what exactly is unknown, with its unit, from three. When the question hides a relation, (b) asks what she needs to know instead: "to find the perimeter you need all three sides". | The «?» lines of the short record |
| 3 | **Відомо** (given) | Taps each number, in any order, and picks its meaning from three. Each wrong meaning is one specific misreading with its own hint ("3,7 см is not the length of BC"). Hidden information, such as a unit change, an omitted reference or a banknote, gets its own question afterwards. | One short-record line per number. A unit change also goes into the short record («За 1 год (60 хв) — 3000 м») and becomes the first line of «Розв'язання» («1 год = 60 хв») |
| 4 | **Порівняння** (decode) | For **every** comparison, plain or inverted, so the step never gives the trap away: «Шукане більше чи менше за дане? Хто тут більший?» (two buttons). If the sentence doesn't start from the unknown, she then completes it from the unknown's side: «AC на 5,1 см ___, ніж BC» → більша. Skipped when the problem has no comparison. | The restated sentence replaces the line in the short record: «AC — ?, на 5,1 см більша, ніж BC» |
| 5 | **Тип і схема** (type and diagram) | Names the type of each relation from the six (the relations are listed for her). Then places the given numbers into a pre-drawn diagram: tap a slot, then a number. | The filled diagram, shown next to the short record |
| 6 | **План** (plan) | Puts cards in order into numbered slots. Each card is an action's explanation («довжина сторони BC»); one card is a distractor. **Every valid plan listed for the problem is accepted**. | The «Розв'язання» skeleton: «1) … = … (см) — довжина сторони BC;» |
| 7 | **Обчисли** (compute) | For each action: builds it from number chips (the given numbers and earlier results) and a sign (+ − · :). Then **works it out herself**, on scratch paper if she likes, and types the result on the on-screen keypad. | That action's line, filled in |
| 8 | **Відповідь** (answer) | Picks the full sentence that answers the question, from three. The wrong ones are "stopped an action early" and "true, but not what was asked". | «Відповідь: …» |
| — | **Розбір** (closing) | Not a step of the routine. See [Closing screen](#closing-screen). | — |

**Feedback that points at the mistake.**

- Plan: a distractor card gets its own reason. If the last card isn't the asked quantity: «Останній крок має знаходити те, що питають у задачі.» A wrong order gets the problem's prerequisite hint: «Щоб знайти AC, треба вже знати BC: AC порівнюють саме з BC.»
- Compute: a wrong action (a plan or decode mistake) gets a hint from the short record: «Подивись на короткий запис: AC на 5,1 см більша, ніж BC.» A right action with a wrong result gets «Дію складено правильно. Перевір обчислення.» and is recorded as an arithmetic slip, apart from the other mistakes.

**Dropped: Estimate.** The PoC is a short dose, so screens go to what it targets: what is asked, the plan and the decode. Dropping it also saves an item to write for each of the 30 problems. The research routine's Check step becomes the closing screen's checks, which the app shows; she doesn't carry them out herself.

**«Чому?» prompts: at most one per problem.** It's a menu of three reasons, placed at the problem's key idea: after the decode when there's a comparison («Чому до BC додаємо 5,1, хоча написано «менша»?»), otherwise after the plan. They stay rare because adding these prompts to worked examples made the examples help less in one meta-analysis.

## Across all steps

- **The problem text stays on top** the whole time. Each step highlights its part: the question, the number being labelled, the comparison being decoded.
- **The write-up builds up under the text**, line by line, exactly as it would go on paper.
- **Wrong answers: hint, then show.** The first wrong try gets a hint that points back at the text or the short record. The second shows the right answer with the reason, and she carries on. She never gets stuck and can't guess her way through. Each hint and each shown answer is recorded against its step.
- **She taps; she types only numbers.** Every choice is a tap. The only typing is results, on the decimal-comma keypad.
- **No game layer here.** XP, hearts, and what a wrong answer costs belong to [Which Duolingo-style game mechanics go into the PoC?](../issues/09-game-mechanics.md).

## Diagrams per type

Each diagram is one the school already uses, so she can draw it on paper. It is pre-drawn; she places the given numbers.

| Types | Diagram | Notes |
|---|---|---|
| На … більше / менше, У … разів більше / менше | **Segment bars from one left edge** (схема з відрізками) | На: the bigger bar is the smaller one plus an extra piece labelled with the difference. У разів: the bigger bar is k copies of the smaller. Shown after the decode, so the bars can be drawn to scale without giving it away. |
| Частини і ціле, Дріб від числа | **One segment split into parts under a brace** labelled with the whole | Дріб: the segment is split into n equal parts, with m marked. |
| Три величини, Зближення / віддалення | **The table** швидкість–час–відстань (ціна–кількість–вартість, продуктивність–час–робота) | One row per relation. Зближення adds a row for швидкість зближення. |

- **Chains share one diagram** when their relations share quantities. The triangle is three bars plus a brace for P.
- **A problem that mixes families** shows one diagram per family, stacked, such as a purchase table plus a change segment.
- The mock has the bars and the table. The brace diagram and the stacked case weren't mocked.

## Closing screen

- The full write-up stays above: short record, «Розв'язання» as numbered actions with explanations, «Відповідь» as a full sentence.
- 2–3 checks against the condition: «AC − BC = 17,2 − 12,1 = 5,1 см — як в умові.»; «1000 · 3 = 3000 м. Сходиться.»
- The key idea in one sentence: «У задачі слово «менша», а дія — додавання. Щоразу питай себе: шукане більше чи менше за дане?»
- The other valid plan, if there is one, written out as actions.

## What each problem needs in the data

A fully guided problem needs all of this. A problem with fewer prompted steps needs only the parts for its steps. Much of it comes straight from the write-up in [Write the 30 problems and their school write-ups](../issues/11-write-problems.md).

- **Text**, split so the question and each number can be tapped, with the span of each comparison marked for highlighting.
- **Retell**: three options, one right, each wrong one with its hint.
- **Asked**: three options for the unknown (with unit), with hints, and the «?» lines they write.
- **Given**: for each number, three meanings with hints and the short-record line it writes; any hidden-information question, with the lines it changes.
- **Decode**: for each comparison, who is bigger, the restated sentence when it needs flipping, hints, and the line it rewrites.
- **«Чому?»**: at most one prompt, with three options and hints.
- **Relations**: each one's wording, type and hint.
- **Diagram**: its family and its labelled slots.
- **Plans**: one or more. Each plan is an ordered list of actions (numbers, sign, result, unit, explanation, hint). Plus the cards, including one distractor with its reason, and the order hint.
- **Answer**: three full sentences with hints, and the «Відповідь» line.
- **Closing**: 2–3 checks and the key idea.

## Left to other tickets

- Which steps each problem prompts, and how the support shrinks: [How does the guidance fade across the problem set?](../issues/08-guidance-fading.md)
- The game layer, including what a wrong answer costs: [Which Duolingo-style game mechanics go into the PoC?](../issues/09-game-mechanics.md)
- Whether her attempts are logged for the verdict: the trial, still in the map's fog.

## Limits

- **Not tried with her.** She hasn't seen it yet. The length is a guess: about 15 screens, or 4–6 minutes, for the fully guided triangle. The parent accepted that on the understanding that fading shortens later problems.
- **Every step is recognition, not recall.** Menus and cards let her pick; on paper she must produce. Fading has to close that gap by the end of the set.
- **Two diagram cases weren't mocked**: the brace diagram and stacked diagrams.
