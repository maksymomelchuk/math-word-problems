# Write the 30 problems and their school write-ups

Labels: wayfinder:task
Status: closed
Assignee: maksymomelchuk
Blocked by: [Which problem types and difficulty ramp does the problem set cover?](04-problem-types-and-ramp.md)
Parent: [Map](../MAP.md)

## Question

Write the 30 word problems of the problem set in Ukrainian, one per slot in [problem-set-plan.md](../assets/problem-set-plan.md), each with its school write-up.

For each problem:

- **The text**, in the «ти» form, following its slot: its relations in order, which ones are inverted, the number rules, and what the slot trains. Adapt the slot's textbook shape with new numbers and a new story; don't copy it. Slots 2.3 and 4.7 use the walking boy and the triangle exactly as the plan gives them.
- **The school write-up** from [How does Ukrainian 6th grade expect word problems to be solved on paper?](02-ukrainian-school-format.md): a short record, then «Розв'язання» by numbered steps "1) … = … (unit) — what it is;", then «Відповідь: …».
- **Its relations as tags**, in solving order: each one's problem type, and whether it's inverted.
- **Other plans a teacher would accept**, if there are any. See "One problem, more than one valid plan" in the plan.

Check each problem's arithmetic against the number rules: decimal results only from + and −, whole-number results from fraction relations, and exact divisions. Vary the stories and keep them familiar to an 11-year-old, with different characters and settings in neighbouring slots.

Leave out the guided-step data, such as retelling options, diagram data and prompts. Its shape comes from [What does one guided problem look like, step by step?](07-guided-problem-flow.md).

AFK: the agent writes, the parent reviews the Ukrainian. Output: `../assets/problem-set.md`.

The paper checks were dropped (see the map's Out of scope), so their stories are no longer reserved. The walking boy and the triangle stay exactly as the plan gives them.

From [What does one guided problem look like, step by step?](07-guided-problem-flow.md):

- **Her teacher's format**: a short record every time, an explanation after each action, and «Відповідь» as a full sentence («Відповідь: периметр трикутника дорівнює 37,7 см.»). Write every write-up that way.
- **Write other plans out as full actions** (numbers, sign, result, unit, explanation), because the guided flow accepts every valid plan and computes along the one she picks.
- **Keep each number and its unit as one phrase** («3000 м», «20 хвилин»): the flow has her tap each number in the text.
- The guided-step data is now its own ticket: [Write the guided-step data for the problem set](13-write-guided-data.md).

## Comments

### Progress (2026-10-03)

**Done (AFK).** All 30 problems are written in [problem-set.md](../assets/problem-set.md), one per slot of [problem-set-plan.md](../assets/problem-set-plan.md). Each has the text in «ти», its relations as tags in solving order (type, and *plain* or *inverted* for each comparison), the write-up in her teacher's format (short record, «Розв'язання» by actions with explanations, «Відповідь» as a full sentence), and its other plans written out as full actions. Nine problems have other plans, ten plans in all: 2.3, 2.5, 2.6, 3.3, 3.8, 4.2, 4.4 (two), 4.5 and 4.6. Slots 2.3 and 4.7 are the walking boy and the triangle, word for word. An overview table at the top lists every story, its relations and its answer.

**Checked by script.** [check-problem-set.py](../assets/check-problem-set.py) reads `problem-set.md` and checks every action's arithmetic and how its result is written. It checks that every operand is a number from the text, a unit change or an earlier result, and that every other plan reaches the answer. It also checks the number rules: whole numbers in Levels 1–2, decimals only with + and −, exact divisions, fractions only with дріб від числа, and only the catalog's unit changes. Result: 30 problems and 40 plans, no errors. Twelve deliberately broken copies were all flagged, so the check itself works. Run it again after any edit: `python3 check-problem-set.py` in `assets/`.

**Choices the parent may want to change:**

- Explanations after the dash are noun phrases («— кількість каштанів, які зібрав Тарас»), as in the mock.
- Counted things get short units in parentheses: кашт., вар., с., пир., фото, дер., уч., сл., дет.
- A fraction of a number takes two actions («40 : 8 = 5», then «5 · 3 = 15»), because each action has one sign.

**Checklist for the parent.** Read the texts (the lines starting with «>») and the write-ups, and mark anything to change directly in the file or in a comment here:

- [ ] **Natural phrasing.** Read each text aloud. Does it sound like her workbook, not like a translation? I'm least sure about:
  - 1.7: past «вийшли» mixed with present «йде»;
  - 2.2: «всього 56 яблунь і вишень» (or «56 дерев»?);
  - 3.6: «набирає текст … зі швидкістю 24 слова за хвилину» as a work rate;
  - 3.3: «Це становить 3/5 від усіх учасників хору»;
  - 1.5, 1.6, 4.1, 4.2: a plural verb after «X з …» («Софія з однокласниками збирали»).
- [ ] **«Ти» form.** The instructions are «Знайди» (3.4, 4.7) and «Визнач» (3.6). Every other problem asks a question.
- [ ] **Units.** Each number sits next to its unit, and the units are ones she knows: м/хв, км/год, г against кг (2.7). Is «з купюри в 200 грн» (2.4, 4.5) how her book says it, or «у 200 грн»?
- [ ] **Inverted wording.** Problems 3.1, 3.2, 3.4, 3.8, 4.1, 4.2 and 4.7, plus 3.3 (число за дробом). Check that each comparison really says what the short record decodes. For example, 3.2 «48 км, що в 4 рази більше, ніж пробіг … Левко» means that Левко ran 12 км.
- [ ] **Her teacher's habits.** Short-record layout, the explanation style, the abbreviations above (does she write «шт.» instead?), and fractions in two actions (or does she write «40 · 3/8»?).
- [ ] **Full-sentence answers.** Natural, especially the two-part ones: 3.3 and 3.7.
- [ ] **Other plans.** Would her teacher accept them? 2.5 B and 3.3 B (counting the remaining fifths or eighths) are the least usual.
- [ ] **Stories and numbers.** Are the stories familiar to her? Check the пластуни (3.1), the kayaks (3.5) and the parcels (4.1). Are the decimal subtractions with different places all right for where she is: 5,3 − 2,45 (3.7) and 4,8 − 0,75 (4.1)?

Status stays open until the parent has reviewed the Ukrainian.

### Resolution

Problems: [problem-set.md](../assets/problem-set.md), checked by [check-problem-set.py](../assets/check-problem-set.py) (`python3 check-problem-set.py` in `assets/`; 30 problems and 40 plans, no errors). The parent reviewed the Ukrainian and approved it as written on 2026-10-03, including the choices listed in the progress comment.

**Answer.**

- **30 problems, one per slot** of [problem-set-plan.md](../assets/problem-set-plan.md), each with its relations tagged in solving order (*plain* or *inverted* for each comparison) and an overview table at the top. The walking boy is 2.3 and the triangle is 4.7, word for word.
- **Her teacher's format** for every write-up: short record, «Розв'язання» as numbered actions with a noun-phrase explanation after each dash, «Відповідь» as a full sentence. Counted things take short units (кашт., уч. and so on), and a fraction of a number takes two actions, since each action has one sign.
- **Other plans as full actions**: ten, on nine problems (2.3, 2.5, 2.6, 3.3, 3.8, 4.2, 4.4 twice, 4.5, 4.6). Actions that can swap are listed in `Order:` lines, not as separate plans.
- **Two-part answers** in 3.3 and 3.7; in 3.7 one part is a name.

**Passed to existing tickets:** [Build the guided-problem flow](12-build-guided-flow.md) (one sign per action, number chips, `Order:` lines, two-part answers) and [Write the guided-step data for the problem set](13-write-guided-data.md) (the same, plus adapting the checker to the typed data file).

**Map fog:** none.
