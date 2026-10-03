# Lead the word-problem PoC map to the trial

You are the orchestrator for the wayfinder map at `.scratch/word-problem-poc/MAP.md`. It uses a local-markdown tracker: conventions are in `docs/agents/issue-tracker.md`, and the glossary is in `CONTEXT.md`. The parent (the user, git user `maksymomelchuk`) wants as much done without them as possible.

**You lead the map; you don't resolve tickets yourself.** You launch one background agent per AFK ticket with the Agent tool. You record the results on the map, keep the map current, and bring the parent only what needs them.

**Ask the parent as little as possible.** When a question comes up, first check how similar apps do it and what the research says, then decide. The assets already hold a lot:

- `fading-revisit-apps.md` and `fading-apps.md`: how learning apps do it.
- `fading-revisit-evidence.md` and `fading-evidence.md`: the research.
- `fading-revisit-school.md` and `ukrainian-grade6-word-problems.md`: Ukrainian school.
- `teaching-methods.md`: teaching methods.

Bring the parent only real decisions, with a recommendation. Batch them, and use clickable options where you can.

## Where the map stands (2026-10-03)

**Closed**: everything up to the guided flow, plus the revisited fading ([How does the guidance fade across the problem set?](issues/08-guidance-fading.md), recorded in `assets/fading-schedule.md`).

**Open**:

| Ticket | State |
|---|---|
| [How does the Тип і схема step ask for the type so that it's clear to her?](issues/15-clear-type-step.md) | Built. Waiting for the parent's iPad check, then the try with her |
| [Help her pick the operation in Обчисли](issues/16-help-pick-operation.md) | Built. Waiting for the parent's iPad check, then 2.3 with her |
| [Which Duolingo-style game mechanics go into the PoC?](issues/09-game-mechanics.md) | The mock needs three updates (its last Note), then the session with her |
| [Build the paper steps and the fading schedule](issues/14-build-fading.md) | Blocked by 15 and 16 |
| [Write the guided-step data for the problem set](issues/13-write-guided-data.md) | Blocked by 15 and 16 |

**Fog** (the map's Not yet specified): building the game layer and the loop through the problem set, running the trial, and the verdict write-up.

Tickets 15 and 16 say "not deployed yet", but the live link (https://reliable-macaron-77e751.netlify.app) already serves both builds. On 2026-10-03 its bundle held the type-step variant switch and «Спершу подумай».

## Start

1. Read `MAP.md`, `docs/agents/issue-tracker.md` and `CONTEXT.md`. For each ticket in `issues/`, read only the header block; zoom in on a body when you need it.
2. Confirm that the live bundle still holds both builds. Append a one-line `### Progress (date, deployed)` to tickets 15 and 16.
3. Launch wave 1 in a single message, so the agents run in parallel.
4. Tell the parent, by ticket name, what's running and what needs them now: the iPad checks for tickets 15 and 16, merged into one sitting.
   - **Alone, about 25 minutes**: ticket 16's checks, then ticket 15's versions.
   - **With her**: 2.3 played from the start, with Б «Схеми» active (ticket 16's watch list), then ticket 15's other versions through «Спробувати». Write down the order used.

## Waves

**Wave 1, now:**

- **A, the game mock.** Update `assets/game-mechanics-mock.html` for the revised fading, as listed in ticket 09's last Note:
  - drop the problem-30 paper end screen;
  - reword the 2.1 handover to the draft in the schedule;
  - add the 4.6 solo-try choice («Крок за кроком» / «Спробую сама») to each option.

  A doesn't resolve 09. The parent's checklist is ticket 09's second checklist, minus its paper end-screen step, plus the solo-try screen.
- **B, a trial proposal.** Graduate the map's "Running the trial" fog into a new grilling ticket: "How is the trial run?" Its question covers days and minutes per day, problems per sitting, what the parent watches in her first tries and at the solo try, what the PoC shows the parent (the short list of problems where a plan line or result had to be shown), and how her own opinion for *is it interesting* is collected.
  - Leave the ticket unblocked. Clear the patch from Not yet specified.
  - B writes `assets/trial-proposal.md`: a recommended answer and alternatives for each part, from app practice and research (the studies behind the method ran 10–29 lessons; products for her age plan sessions of 15–30 minutes). B doesn't claim or resolve the ticket.
  - When B is done, tell the parent to grill it in its own session: `/wayfinder .scratch/word-problem-poc/MAP.md`.

**Wave 2**, once tickets 15 and 16 are both closed:

- **C, the fading build** ([Build the paper steps and the fading schedule](issues/14-build-fading.md)). C follows the ticket's checklist and `assets/fading-schedule.md`, deploys, and checks the live link. The parent's checklist: play the triangle at every stage, in small and big steps and as a solo try, using the stage switch.
- **D, the data** ([Write the guided-step data for the problem set](issues/13-write-guided-data.md)). Launch it after C finishes, because C changes the data types. If you split it by level, give each agent its own data file so they don't collide. The parent's checklist: review the Ukrainian, including the handover drafts.

**Wave 3**, once ticket 09 is resolved (her pick, and the parent's call on what a wrong answer costs):

- Graduate the "Building the PoC" fog into build tickets for the game layer and the loop through the problem set. That covers the path and progress, which problem comes next, missed problems coming back at the end of their level, the handover screens, and the solo-try choice.
- Wire them after the fading build, and launch each when it's unblocked.

**Wave 4**, once the data, the fading build and the game build are all closed:

- Deploy the whole PoC, and have the parent play Level 1 through on her iPad.
- Then the trial runs as its resolved ticket says (HITL: the parent with her).
- Then graduate the verdict write-up into a ticket for the parent.

## Rules for every agent (copy these into each agent's prompt)

- **One ticket per agent.** Read the map's Notes, then the ticket, then whatever closed tickets and assets it links, as needed.
- **Claim first**: before any work, set `Assignee: maksymomelchuk` in the ticket header. A proposal agent (like B) claims nothing.
- **Never edit `MAP.md` or any other ticket.** The orchestrator does that. Put anything another ticket needs into the final report.
- **Use `CONTEXT.md`'s terms.** All learner-facing text is in Ukrainian: «ти» form, decimal comma, `·` and `:`. Never a keyword rule («менше → ділимо»).
- **Research before asking.** If a design question comes up, check how similar apps do it and what the research says (see the assets above). Decide, and list each call in the final report with its reason. Put a question to the parent in the report, with a recommendation, only if research can't settle it.
- **For UI work**, use `/impeccable` or `/emil-design-engineering`.
- **For code**:
  - Build on `poc/`.
  - Run the unit tests, the type check and lint before reporting.
  - Test her iPad first: WebKit at 820×1180 and 1180×820, touch only. Then phone and laptop widths.
  - Deploy only the PoC: `cd poc && npm run deploy`. Then check the live link.
  - Playwright logs go to `.playwright-mcp/`, which git ignores.
- **HITL gates.** Never stand in for the parent or the learner. When the AFK part is done, append a `### Progress (YYYY-MM-DD)` comment under the ticket's `## Comments`: what was done, where the outputs are, and a precise checklist for the parent. Leave `Status: open`.
- **No git commits.**
- **Final report** to the orchestrator, under 300 words: the outputs (paths, URLs), the parent's checklist, the calls made, and anything for other tickets or for the map's Not yet specified.

## When an agent reports

1. Tell the parent in plain words, by ticket name (never a bare number), what needs them, with the checklist.
2. When a proposal agent finishes, add a comment to its ticket pointing at the proposal. Tell the parent the grilling can start in its own session: `/wayfinder .scratch/word-problem-poc/MAP.md`.
3. When the parent confirms a gate:
   1. Append `### Resolution` to the ticket, with the agent's outputs and the parent's result, in their words where you have them.
   2. Set `Status: closed`.
   3. Add one line to the map's Decisions so far: `- [title](issues/NN-slug.md) — gist`.
4. If a result surfaces new work, create the tickets first and wire their blocking second. Graduate any fog that's now specifiable, and clear it from Not yet specified. Pass notes to other tickets the way earlier resolutions do ("From [ticket]: …" before `## Comments`).
5. If the parent's feedback overturns a decision, as with the fading, record it as a note on the ticket and reopen it. Put the tickets that depend on it on hold, and offer an AFK proposal for the new grilling.
6. Check whether the next wave is now unblocked.

## Never

- Resolve a grilling ticket, the trial or the verdict. They're the parent's, in their own `/wayfinder` sessions.
- Show anything to the learner, or answer for her or the parent.
- Commit, or deploy anything except the PoC build.
