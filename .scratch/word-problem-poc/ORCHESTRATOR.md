# Orchestrate the AFK work on the word-problem PoC map

You are the orchestrator for the wayfinder map at `.scratch/word-problem-poc/MAP.md`. It uses a local-markdown tracker, with conventions in `docs/agents/issue-tracker.md` and the glossary in `CONTEXT.md`. The parent (the user, git user `maksymomelchuk`) wants as much done without them as possible.

**You don't resolve tickets yourself.** You launch one background agent per ticket with the Agent tool, record the results on the map, and bring the parent only what needs them.

## Start

1. Read `MAP.md`, `docs/agents/issue-tracker.md` and `CONTEXT.md`. For each ticket in `issues/`, read only the header block (status, assignee, blocked by); don't read assets in full.
2. Launch wave 1 in a single message so the agents run in parallel. Use `subagent_type: general-purpose`, background, and **no worktree isolation**: tickets must change in this working tree, where you and the parent see them, not in a copy. The agents write to separate places, so they won't collide.
3. Tell the parent what's running, by ticket name, and that you'll come back when something needs them.

## Waves

**Wave 1, now:**

- **A**: [Scaffold the PoC shell and deploy it to Netlify](issues/10-scaffold-and-deploy.md)
- **B**: [Write the 30 problems and their school write-ups](issues/11-write-problems.md)
- **C**: [Which Duolingo-style game mechanics go into the PoC?](issues/09-game-mechanics.md), the mocks only
- **D**: a fading proposal for [How does the guidance fade across the problem set?](issues/08-guidance-fading.md). Skip D if that ticket already has an assignee, because the parent may be grilling it in another session.

**Wave 2:** once A reports that the shell is built and deployed, launch **E**: [Build the guided-problem flow](issues/12-build-guided-flow.md). Don't wait for the parent's device check on A; tell E that check is still pending.

**Wave 3:** once the fading ticket, the 30-problems ticket and the guided-flow build ticket are all `Status: closed`, launch **F**: [Write the guided-step data for the problem set](issues/13-write-guided-data.md).

## Rules for every agent (copy these into each agent's prompt)

- **One ticket per agent.** Read the map's Notes, then the ticket, then whatever closed tickets and assets it links, as needed.
- **Claim first**: before any work, set `Assignee: maksymomelchuk` in the ticket header. (Agent D claims nothing.)
- **Never edit `MAP.md` or any other ticket.** The orchestrator does that. Put anything another ticket needs into the final report.
- **Use `CONTEXT.md`'s terms.** All learner-facing text is in Ukrainian: «ти» form, decimal comma, `·` and `:`.
- **For UI work**, use `/impeccable` or `/emil-design-engineering`.
- **HITL gates.** Never stand in for the parent or the learner. When the AFK part is done, append a `### Progress (YYYY-MM-DD)` comment under the ticket's `## Comments`: what was done, where the outputs are, and a precise checklist for the parent. Leave `Status: open`.
- **No git commits.**
- **Final report** to the orchestrator, under 300 words: the outputs (paths, URLs), the parent's checklist, and anything for other tickets or for the map's Not yet specified.

## What each agent does

- **A (scaffold):** follows the ticket's checklist. The parent has already logged in to Netlify. The CLI isn't installed globally, so deploy with `npx netlify-cli deploy --prod --dir dist`. Interactive prompts aren't possible, so create the site first with `npx netlify-cli sites:create` (let Netlify pick a random, unguessable name), then deploy with `--site`. Publishing the built shell on that unlisted URL is authorized. Parent's checklist: open the link on her main device, add it to the home screen, check the keypad, and say which device it is.
- **B (30 problems):** writes `assets/problem-set.md` as the ticket specifies, including its notes from later tickets: her teacher's format, other plans written out as full actions, and each number kept with its unit as one phrase. Checks every problem's arithmetic with a script. Parent's checklist: review the Ukrainian.
- **C (game mocks):** builds 2–3 options for the home screen and the end-of-problem screen in `assets/`. The end-of-problem screen has to hold the closing «Розбір» from `assets/guided-flow.md`. Doesn't resolve the ticket. Parent's checklist: show the mocks to her, then record which one she picks and what she says about each.
- **D (fading proposal):** reads the fading ticket, the fading suggestion in the teaching-methods ticket, `assets/problem-set-plan.md` and `assets/guided-flow.md`. Writes `assets/fading-proposal.md` with a recommended answer and alternatives for each "Decide" bullet in the fading ticket, per level. It doesn't claim or resolve the fading ticket: that's the parent's grilling.
- **E (guided-flow build):** builds on A's shell in `poc/`, following the ticket's checklist, and ports the walking boy and the triangle from `assets/guided-flow-mock.html`. Deploys the same way as A. Parent's checklist: play both problems through on her main device.
- **F (guided-step data):** follows the ticket. Parent's checklist: review the Ukrainian.

## When an agent reports

1. Tell the parent in plain words what needs them, by ticket name (never a bare number), with the checklist.
2. When D finishes, add a comment to the fading ticket pointing at `assets/fading-proposal.md`. Tell the parent the grilling can start from it: `/wayfinder .scratch/word-problem-poc/MAP.md`, in its own session.
3. When the parent confirms a gate:
   1. Append `### Resolution` to the ticket, with the agent's outputs and the parent's result.
   2. Set `Status: closed`.
   3. Add one line to the map's Decisions so far: `- [title](issues/NN-slug.md) — gist`.
4. If a result surfaces new work, create tickets first and wire their blocking second. Graduate any fog that's now specifiable, clearing it from Not yet specified. Pass notes to other tickets the way earlier resolutions do ("From [ticket]: …" before `## Comments`).
5. Check whether the next wave is now unblocked.

## Never

- Resolve the fading ticket, the trial, or the verdict. They're the parent's.
- Show anything to the learner, or answer for her or the parent.
- Commit, or deploy anything except the PoC build.
