# How does Ukrainian 6th grade expect word problems to be solved on paper?

Labels: wayfinder:research
Status: closed
Assignee: maksymomelchuk
Blocked by: —
Parent: [Map](../MAP.md)

## Question

Which word-problem types does Ukrainian 6th-grade math cover (НУШ curriculum: whole numbers, common fractions, now decimals), and what written format does school expect a solution to follow? For example: короткий запис or схема, розв'язання по діях з поясненням or виразом, відповідь.

The PoC's steps should match what she has to write on paper, so the skill carries over to the paper check and to homework. Collect:

- A catalog of problem types with one sample problem each, including "на … більше/менше", "у … разів", знаходження частини від числа / числа за його частиною, рух (швидкість–час–відстань), периметр/площа, and покупки/ціна
- The expected written solution format, with one fully written-out example
- The usual Ukrainian wording for "what is asked" (e.g. "Знайдіть…", "Скільки…?") and for comparisons, since these are the phrases she has to learn to read

Output: a markdown summary at `../assets/ukrainian-grade6-word-problems.md`, linked from the resolution.

## Comments

### Resolution

Summary: [ukrainian-grade6-word-problems.md](../assets/ukrainian-grade6-word-problems.md). It covers the curriculum by programme, a catalog of problem types with real textbook samples, the written format with both motivating examples written out, a glossary of phrases, and sources.

**Answer.**

- **Curriculum.** In all seven approved НУШ programmes, decimals are 5th-grade material. "Now on decimals" in October of 6th grade is almost certainly the start-of-year review. Next in most textbooks: divisibility, then common fractions (дріб від числа, число за дробом), then ratios and proportions. So the problem set can use whole numbers, decimals and percentages freely. Fraction-of-a-number and proportion problems are probably still ahead of her. *(Corrected below: decimals are new to her this year. See "Update: her programme".)*
- **Problem types she has met:**
  - difference and multiplicative comparison
  - motion (зустрічний, у протилежних напрямках, навздогін, по річці)
  - buying (ціна–кількість–вартість)
  - perimeter and area
  - joint work
  - two numbers from their sum and difference
  - average
  - percentages

  The triangle's chained "що на … менше від …, але на … більше за …" shape is a standard 5th-grade exercise and test item (Мерзляк 5, №957–958). Neither motivating problem was found word for word.
- **Written format.** No national rule fixes it; textbooks and teachers do. The textbook model (Мерзляк 5, p. 64) is:
  1. A short record, optional by every document found but usual in practice: "BC — ?, на 3,7 см більша, ніж AB". Or a segment diagram (схема з відрізками), or a table: v–t–s for motion, ціна–кількість–вартість for buying.
  2. **Розв'язання** by numbered steps: "1) 8,4 + 3,7 = 12,1 (см) — довжина сторони BC;". The unit goes in parentheses, and after the dash comes what the result *is*. Multiplication is "·", division ":".
  3. **Відповідь: 37,7 см.** A short answer is enough when the steps carry explanations.

  Arithmetic by steps is the default in grades 5–6. An expression or an equation is also accepted, but the methodology says arithmetic should dominate until 7th grade. A written check is not expected.
- **Wording to train.**
  - The question is often an instruction ("Знайди(іть)…", "Визнач, на скільки…"). It sometimes comes before the data ("…, якщо …") and often has two parts.
  - Comparisons mix за / від / ніж and put the number before or after the reference.
  - The inconsistent form (**непряма форма**) is common in 5th-grade decimal work.
  - Ukrainian primary methodology (Скворцова, 3 клас) already teaches the "who is bigger?" fix: "спочатку треба з'ясувати, яким числом є шукане, більшим або меншим за дане, і лише потім обрати арифметичну дію". The PoC can use it as the Ukrainian self-question "Шукане більше чи менше за дане?".

**Key link for the PoC.** Each step of the routine from [Which word-problem teaching methods work for kids her age?](01-teaching-methods.md) lands on one line of the school write-up:

| PoC step | Line of the write-up |
|---|---|
| Asked, given | The short record |
| Decode | Rewriting the непряма line in the short record |
| Plan | The ordered list of step explanations, the text after each dash |
| Compute | The action, with the unit in parentheses |
| Answer | The Відповідь line |

So "plan" has a concrete paper form she already writes.

**Not verified:**
- Whether math-6 got new 2026 textbook editions.
- Some textbook-to-programme links.
- МОН's yearly maths recommendations (blocked, HTTP 403).
- Small conventions that vary by teacher: "—" or "-", "Відповідь:" or "Відповідь.", whether the last step gets an explanation.

**Questions for the parent:**
- Which textbook (author, edition) does she use, and which section is she on?
- Does her teacher require a short record, a full-sentence answer or a written check?

**Passed to existing tickets:**
- [Which problem types and difficulty ramp does the problem set cover?](04-problem-types-and-ramp.md): the type catalog, the school names, which number kinds are safe, and confirming her textbook.
- [What does one guided problem look like, step by step?](07-guided-problem-flow.md): the school write-up as the target output, the school diagrams, the self-question, and the teacher's format requirements.
- [How does the guidance fade across the problem set?](08-guidance-fading.md): the last paper stage produces the school write-up.
- [Write the two paper checks](05-write-paper-checks.md): the school format and wording; scoring the plan from the step explanations.

### Update: her programme

The parent says she studies under **«Ліга крилатих»**, the grades 5–6 continuation of «Світ чекає крилатих». Its maths course has its own programme, by О. В. Бугайова (approved 29.06.2022), and is not one of the seven НУШ model programmes the summary compares. The programme's topic order and textbook weren't found online.

The parent then confirmed she is learning decimals **for the first time** this year. So her programme teaches decimals in 6th grade, a year later than the НУШ model programmes, and the "start-of-year review" reading in the Answer above is wrong. What this changes:

- Keep decimals in the problem set simple, using only the operations she has covered.
- Treat percentages as probably not yet covered.
- The НУШ catalog is still the source for problem types and wording.

Her exact current topic is confirmed in [Which problem types and difficulty ramp does the problem set cover?](04-problem-types-and-ramp.md). The summary's section 1 has the details.
