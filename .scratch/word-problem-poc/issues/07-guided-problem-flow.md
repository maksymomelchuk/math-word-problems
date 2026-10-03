# What does one guided problem look like, step by step?

Labels: wayfinder:prototype
Status: closed
Assignee: maksymomelchuk
Blocked by: [Which word-problem teaching methods work for kids her age?](01-teaching-methods.md), [How does Ukrainian 6th grade expect word problems to be solved on paper?](02-ukrainian-school-format.md)
Parent: [Map](../MAP.md)

## Question

Using the two real examples (the triangle perimeter and the walking boy), draft the complete guided flow of one word problem in Ukrainian:

- Every step she goes through. For example: find the question, then pick out what is known, then spot what is hidden (1 год = 60 хв), then choose the order, then compute, then write the answer
- What she taps, highlights or types at each step
- Whether she does the arithmetic herself (on paper, typing in the result) or the app does it
- What happens when she gets a step wrong
- What the closing explanation looks like, so she understands *why*, including the "less by → add" trap
- Which diagram each problem type uses. For example: bars for comparison and total problems, and a ratio table or double number line for rate problems. Or use one style everywhere. The research says to keep it the same for every problem of a type
- Whether to keep the Estimate step. It makes each problem longer, but the check relies on it
- How many "why?" prompts to use, and where. Keep them few and pick-from-a-menu: in one meta-analysis, adding them to worked examples made the examples help less

Start from the nine-step sequence recommended in [Which word-problem teaching methods work for kids her age?](01-teaching-methods.md).

The flow should lead to the write-up she produces on paper, from [How does Ukrainian 6th grade expect word problems to be solved on paper?](02-ukrainian-school-format.md): a short record, then «Розв'язання» by numbered steps with unit and explanation, then «Відповідь». Section 5 of its summary maps the nine steps onto that write-up and lists the school's own diagrams. Ask the parent whether her teacher requires a short record, a full-sentence answer or a written check. Bring a photo of one word problem she solved in her notebook.

Make it rough and concrete: a clickable HTML mock or a screen-by-screen outline in `../assets/`. Go through it with the parent, and ideally with her. If the before paper check has already run, use where she got stuck.

From [Which problem types and difficulty ramp does the problem set cover?](04-problem-types-and-ramp.md): she names the type of each *relation*, not of the whole problem, so the flow must handle 1–4 relations of different types in one problem. The six types are in [problem-set-plan.md](../assets/problem-set-plan.md). They pair into three possible diagrams: comparison bars, a whole split into parts, and the three-quantity table. Some problems have more than one valid plan, and so more than one set of relations. The walking boy is either two три величини relations, or у разів + три величини. Decide whether the flow accepts either. Problems use «ти».

## Comments

### Resolution

Record: [guided-flow.md](../assets/guided-flow.md), with the routine screen by screen, feedback, the diagram for each type, the closing screen and what each problem needs in the data. Clickable mock: [guided-flow-mock.html](../assets/guided-flow-mock.html), the walking boy and the triangle, fully guided. Gone through with the parent on 2026-10-03, not with her, since check A has to come before she sees any PoC screens.

**Facts from the parent (2026-10-03):** her teacher requires a short record every time and an explanation after each action, and wants «Відповідь» as a full sentence. These answers settled the format, so no notebook photo was collected.

**Answer.**

- **The routine on screen:** Перекажи → Знайти → Відомо → Порівняння → Тип і схема → План → Обчисли → Відповідь, then a closing Розбір. Each step writes its part of the write-up under the problem text, so a fully guided problem ends with exactly what goes on paper.
- **Every choice is a tap from a menu.** She retells, finds the question and labels each number from menus of three, and each wrong option is a specific misreading with its own hint. She orders plan cards (the action explanations, plus one distractor).
- **Decode is asked for every comparison**, plain or inverted, so the step never gives the trap away: «Шукане більше чи менше за дане? Хто тут більший?», then the sentence completed from the unknown's side, which rewrites the short-record line.
- **She does the arithmetic.** She builds each action from chips and types the result on the keypad. A wrong action and an arithmetic slip get different feedback, and slips are recorded separately.
- **Every valid plan is accepted.** Computing follows the plan she picked, and the closing screen shows the other.
- **Diagrams, from the school:** segment bars for на and у разів; a segment under a brace for частини і ціле and дріб від числа; the швидкість–час–відстань table for три величини and зближення.
- **Wrong answers:** a hint on the first try; on the second, the answer is shown with its reason and she carries on.
- **«Чому?»:** at most one per problem, picked from a menu, at its key idea.
- **Closing screen:** the write-up, 2–3 checks against the condition, the key idea in one sentence, and the other plan.
- **Estimate is dropped.** The paper check doesn't score it, and the dose is short.

**Limits.** Not tried with her. The length is a guess: about 15 screens, or 4–6 minutes, for the fully guided triangle. The parent accepted it, with fading to shorten later problems. Every step is recognition, while paper is recall. The brace diagram and stacked diagrams weren't mocked.

**Glossary.** [CONTEXT.md](../../../CONTEXT.md) gains Routine, Decode, Short record, Action, Plan, Write-up, Guided problem and Fading. "Step" now means a step of the routine; a numbered line of the solution is an action.

**Passed to existing tickets:**

- [How does the guidance fade across the problem set?](08-guidance-fading.md): the routine's steps and which built-in hints can be faded; the length the parent accepted; recognition versus recall.
- [Which Duolingo-style game mechanics go into the PoC?](09-game-mechanics.md): wrong answers are hint-then-show; the end-of-problem screen has to hold the closing screen. It's now also blocked by [Run the before paper check with her](06-run-before-paper-check.md), because it shows her mocks.
- [Write the 30 problems and their school write-ups](11-write-problems.md): her teacher's format, and other plans written out as full actions.

**New tickets:** [Build the guided-problem flow](12-build-guided-flow.md) and [Write the guided-step data for the problem set](13-write-guided-data.md).
