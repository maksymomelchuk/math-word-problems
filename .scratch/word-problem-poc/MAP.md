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
- [How does the guidance fade across the problem set?](issues/08-guidance-fading.md) — revisited 2026-10-03, after the parent objected to whole problems alone on paper. Every problem stays step by step to the end. Steps move to the notebook on fixed stages, but the app keeps checking each one. From 3.1 she plans one action at a time as school does, and writes the whole plan first once she's ready. Every action's result is typed. The direction check fades per relation type. From 4.4 she picks the next step. An optional solo try comes at 4.6–4.7
- [Write the 30 problems and their school write-ups](issues/11-write-problems.md) — 30 problems in [problem-set.md](assets/problem-set.md), one per slot, in her teacher's format (noun-phrase explanations, short units for counted things, a fraction of a number as two actions); ten other plans written out in full, swappable actions as `Order:` lines; the walking boy at 2.3, the triangle at 4.7; every action checked by script
- [Scaffold the PoC shell and deploy it to Netlify](issues/10-scaffold-and-deploy.md) — the React + Vite + TS shell in `poc/` (decimal-comma keypad, exact decimals, local progress) is live at https://reliable-macaron-77e751.netlify.app, deployed with `cd poc && npm run deploy`; her main device is an iPad Air on iPadOS 18, opened from the home-screen icon
- [Build the guided-problem flow](issues/12-build-guided-flow.md) — the fully guided routine is live for the walking boy (2.3) and the triangle (4.7), with types in `poc/src/problems/types.ts`, a data checker, timestamped per-step records behind «Для батьків», and brace, stacked and chain diagrams; played through on her iPad, liked, but 2.3 wasn't easy for her and the Тип і схема step was unclear to both of them

## Not yet specified

- **Building the PoC**: beyond the shell, the guided flow and the paper steps (now [Build the paper steps and the fading schedule](issues/14-build-fading.md)), it will split into build tickets once the game mechanics are chosen. Expected to cover the game layer and the loop through the problem set (the path, progress, which problem comes next).
- **Running the trial**: how many days and minutes per day (the studies behind the method ran 10–29 lessons, so a single pass through the problem set is a short dose); what the parent watches for during her first tries; whether the PoC should log her attempts to support the verdict. It already records hints, shown answers and slips per step on the device. The fading adds plan-line picks, typed results with the sign behind a wrong one, direction-check answers, next-step picks and the solo-try choice. Apps that cap retries tell the teacher. Here the open question is whether the parent gets a short list of problems where a plan line or a result had to be shown (dashboards are out of scope). Nothing is solved unaided unless she chooses the solo try at 4.6–4.7 (the triangle among them), so that choice, and her homework, are the natural moments for the parent to watch. Problems now run longer step by step: the triangle may take 8–11 minutes, and products for her age plan sessions of 15–30 minutes, so a sitting holds 1–2 Level 4 problems. On her iPad, the home-screen app keeps its progress apart from Safari, so she should always open it from the icon, not the link. Her records stay on the iPad (read and reset under «Для батьків»), and only one open problem resumes at a time.
- **Verdict write-up**: recording the parent's judgement of *does it help* and her opinion of *is it interesting*, and turning them into a go/no-go and a core loop for the app.

## Out of scope

- Native mobile app and store release. That is a separate effort, started only after a positive verdict.
- Accounts, multiple learners, parent or teacher dashboards.
- AI-generated or adaptive problems beyond the fixed problem set.
- A rich game world (Roblox-like 3D, a story campaign).
- Arithmetic drills. She already calculates well.
- [Run the before paper check with her](issues/06-run-before-paper-check.md): paper checks A and B were dropped on 2026-10-03. She goes straight to the app, and the parent judges *does it help* from what they know of her abilities. The checks from [Write the two paper checks](issues/05-write-paper-checks.md) stay as unused assets.
