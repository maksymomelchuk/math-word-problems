# Which word-problem teaching methods work for kids her age?

Labels: wayfinder:research
Status: closed
Assignee: maksymomelchuk
Blocked by: —
Parent: [Map](../MAP.md)

## Question

What evidence-based approaches exist for teaching 10–12-year-olds to *understand and plan* a math word problem (not to compute it), and what sequence of steps does each one give the learner?

Cover at least:

- Pólya's four steps (understand, plan, carry out, look back)
- Schema-based instruction (Jitendra et al.): problem types as schemas such as change, group, compare and rate
- Singapore bar models, especially for "greater/less by" comparisons
- Worked examples with fading (Renkl, Atkinson), which shows how to remove support so the skill carries over to working alone
- The inconsistent-language trap (Lewis & Mayer): in "BC is *less* than AC by 5.1", the word says less but the operation is addition

For each method, record: the steps the learner goes through, how strong the evidence is, and how well it would fit a tap-and-type app on a phone. End with a recommended step sequence for the PoC.

Output: a markdown summary at `../assets/teaching-methods.md`, linked from the resolution.

## Comments

### Resolution

Summary: [teaching-methods.md](../assets/teaching-methods.md). It has a comparison table, one section per method, both motivating examples worked through, and references.

**Answer.** No single named method is the best fit. The strongest evidence supports a short, fixed routine of self-questions, faded until she does it alone. The parts rated "strong" in the US practice guide for grades 4–8 (WWC 2012) are:

- task lists or self-questions such as "what is asked? what is given?"
- teaching problem types with one consistent diagram per type

Schema-based instruction has the best trials with typical 12–13-year-olds (effect size 0.46 in a randomized trial with 1,999 students), but the gains shrink on standardized tests. Worked examples with fading are rated moderate (g = 0.48). Pólya's phases taught on their own, and bar models, have weak evidence. The "less than … by" trap is well documented at her age, and two fixes help:

- rebuilding the sentence: "who is bigger?", then flip it
- an *accurate* diagram

The "keyword → operation" strategy is harmful, so the PoC must not teach it.

**Recommended step sequence for one guided problem:**

1. Read and retell: pick the best one-line retelling.
2. What is asked: the unknown, with units.
3. What is given: each number with label and unit; flag mismatches such as 1 год = 60 хв.
4. Decode each "greater/less … by" sentence: "who is bigger?", then bigger = smaller + d.
5. Name the problem type and fill a pre-drawn diagram (schema boxes or bars).
6. Plan: put step cards in order. This is the main target for fading.
7. Estimate.
8. Compute (her strength).
9. Check against the diagram, the estimate and the units.

**Fading (suggested, untested):**

- Fully worked examples first.
- Then backward fading: hide check and compute first, then plan, then model, and decode last.
- Then only the step headings remain, with problem types mixed and several "less than … by" items.
- Last, problems solved on paper with a printed checklist card, and the card removed for the final few.

**Not verified:**

- Lewis 1989's details, taken from a later review.
- The grade and wording in de Koning 2017.
- Participant details of Atkinson 2003.
- Whether fading a step after two correct answers beats a fixed schedule.

**Open questions passed to existing tickets:**

- [What does one guided problem look like, step by step?](07-guided-problem-flow.md): which diagram each type uses, whether to keep Estimate, and how many "why?" prompts.
- [Which problem types and difficulty ramp does the problem set cover?](04-problem-types-and-ramp.md): how many types to name and what to call them; problem types grouped or mixed.
- [How does the guidance fade across the problem set?](08-guidance-fading.md): sketching on paper or on a tablet; how paper-solved problems are entered.
- [Write the two paper checks](05-write-paper-checks.md): one trap item, one rate item and one multi-step item in each check.
