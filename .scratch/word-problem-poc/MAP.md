# Map: Word problem trainer PoC

Labels: wayfinder:map
Status: open

## Destination

A tested PoC: a playable **problem set** of 10–30 Ukrainian word problems the **learner** loops through, ending in a **verdict**. *Does it help* is the parent's judgement, from what they know of her abilities before and after the trial; *is it interesting* comes from her own opinion. If it helps, the verdict also names the core loop the mobile app should keep.

## Notes

- **Domain**: teaching an 11-year-old (6th grade, Ukrainian school, on the «Ліга крилатих» programme, the grades 5–6 continuation of «Світ чекає крилатих»; its maths topic order isn't public, so the general НУШ picture is the default) to read a math word problem, work out what is asked, and plan the steps. She already calculates well, so the PoC trains reading and planning, not arithmetic. Decimals are new to her this year, though, so decimal arithmetic is still being learned. Two motivating examples: the triangle perimeter ("BC is greater than AB by 3.7 cm, but less than AC by 5.1 cm") and the walking boy ("3000 m in one hour, how far in 20 minutes?").
- **This map carries execution.** The destination is a *tested* PoC, so writing problems, building the PoC and running the trial are on the route, not handed off.
- **Language**: all problems and UI text are in Ukrainian, with decimal commas (`12,442`) in both input and display, and the school's `·` and `:` for multiplication and division. Problems address her as «ти» («Знайди», «Обчисли»), as her workbook does.
- **Devices**: a mix of phone, tablet and laptop, so the PoC must work on all three.
- **Game style**: Duolingo-style by default (she likes Roblox, but that can come later).
- **Glossary**: [CONTEXT.md](../../CONTEXT.md). Use its terms (word problem, learner, problem set, level, relation, problem type, inverted wording, routine, decode, short record, action, plan, write-up, guided problem, fading, verdict).
- **Skills**: `/grilling` and `/domain-modeling` for decisions. For UI work, `/impeccable` or `/emil-design-engineering`.
- **HITL with her**: tickets that involve the learner are run by the parent with her. The agent never answers for her or for the parent.
- **Tracker**: local markdown; conventions in [docs/agents/issue-tracker.md](../../docs/agents/issue-tracker.md).

## Decisions so far

<!-- one line per closed ticket: [title](issues/NN-slug.md) — one-line gist -->

- [Which word-problem teaching methods work for kids her age?](issues/01-teaching-methods.md) — a fixed routine of self-questions (asked → given → "who is bigger?" → type + pre-drawn diagram → plan → estimate → compute → check), faded from worked examples to unaided paper work; never teach keywords
- [How does Ukrainian 6th grade expect word problems to be solved on paper?](issues/02-ukrainian-school-format.md) — short record → «Розв'язання» by numbered steps "1) … = … (unit) — what it is;" → «Відповідь: …», arithmetic not equations; НУШ model programmes teach decimals in 5th grade, but her «Ліга крилатих» programme teaches them now, in 6th; the "less by" trap (непряма форма) is common, and grades 2–4 already teach its fix
- [Should the PoC be a plain web page or an Expo app?](issues/03-poc-tech.md) — a throwaway React + Vite + TS static web app on Netlify, with a home-screen icon; only the problem data (kept in a separate typed file) and the loop carry over to the app; progress stays local on one main device; an on-screen decimal-comma keypad
- [Which problem types and difficulty ramp does the problem set cover?](issues/04-problem-types-and-ramp.md) — six problem types, named per relation (на, у разів, частини і ціле, дріб від числа, три величини, зближення); 30 problems in four levels (one relation → two → inverted wording → chains), grouped in Level 1 and mixed after; whole numbers by default, decimals only with + and −
- [Write the two paper checks](issues/05-write-paper-checks.md) — two matched 4-problem checks (missing reference, walking-boy rate, inverted у разів, triangle chain), scored for understanding (Asked, Plan, Decode; /16) apart from the final answer (/4); check A isn't gone over with her until check B is done
- [What does one guided problem look like, step by step?](issues/07-guided-problem-flow.md) — the routine as eight tap-and-menu screens (retell, asked, given, decode for every comparison, type + school diagram, plan cards, she computes, full-sentence answer) that build the write-up on screen; hint, then show; every valid plan accepted; at most one «Чому?»; Estimate dropped

## Not yet specified

- **Building the PoC**: beyond the shell and the guided flow, it will split into build tickets once fading and the game mechanics are chosen. Expected to cover the fading logic (which steps each problem prompts, and the paper stage), the game layer, and the loop through the problem set.
- **Running the trial**: how many days and minutes per day (the studies behind the method ran 10–29 lessons, so a single pass through the problem set is a short dose); what the parent watches for during her first tries; whether the PoC should log her attempts to support the verdict.
- **Verdict write-up**: recording the parent's judgement of *does it help* and her opinion of *is it interesting*, and turning them into a go/no-go and a core loop for the app.

## Out of scope

- Native mobile app and store release. That is a separate effort, started only after a positive verdict.
- Accounts, multiple learners, parent or teacher dashboards.
- AI-generated or adaptive problems beyond the fixed problem set.
- A rich game world (Roblox-like 3D, a story campaign).
- Arithmetic drills. She already calculates well.
- [Run the before paper check with her](issues/06-run-before-paper-check.md): paper checks A and B were dropped on 2026-10-03. She goes straight to the app, and the parent judges *does it help* from what they know of her abilities. The checks from [Write the two paper checks](issues/05-write-paper-checks.md) stay as unused assets.
