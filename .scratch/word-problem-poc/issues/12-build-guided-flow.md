# Build the guided-problem flow

Labels: wayfinder:task
Status: open
Assignee:
Blocked by: [Scaffold the PoC shell and deploy it to Netlify](10-scaffold-and-deploy.md)
Parent: [Map](../MAP.md)

## Question

Build the fully guided problem from [guided-flow.md](../assets/guided-flow.md) into the PoC shell. Use the walking boy and the triangle as its first two problems; their content can be ported from [guided-flow-mock.html](../assets/guided-flow-mock.html), which already works end to end.

- [ ] Each step of the routine as its own screen: Перекажи, Знайти, Відомо, Порівняння, Тип і схема, План, Обчисли, Відповідь, then the closing Розбір. No Estimate step.
- [ ] The problem text stays on top, with each step's highlight; the write-up builds up under it, exactly as on paper
- [ ] Wrong answers: a hint on the first try; on the second, the answer is shown with its reason and she carries on. In Обчисли, a wrong action and a wrong result get different feedback
- [ ] Taps only, plus the shell's keypad for results
- [ ] All three diagram families: segment bars, a segment split under a brace, and the three-quantity table. Also the shared diagram for chains and stacked diagrams for problems that mix families. The brace and the stacked case weren't mocked, so design them here
- [ ] TypeScript types for a problem's guided data, covering the fields in "What each problem needs in the data", kept in the separate typed data file from [Should the PoC be a plain web page or an Expo app?](03-poc-tech.md). The two sample problems are the first entries
- [ ] Each problem carries a list of the steps it prompts, defaulting to all of them, so fading can turn steps off later without rework. Which steps to turn off is not decided here
- [ ] Hints, shown answers and arithmetic slips are recorded against each step in the shell's progress module. Whether they're ever sent anywhere is the trial's call
- [ ] Deployed. The parent plays both problems through on her main device

Out of scope here: the game layer ([Which Duolingo-style game mechanics go into the PoC?](09-game-mechanics.md)), the fading schedule ([How does the guidance fade across the problem set?](08-guidance-fading.md)) and the other 28 problems' data ([Write the guided-step data for the problem set](13-write-guided-data.md)).

AFK: the agent builds it; the parent checks it on the device. For UI work, use `/impeccable` or `/emil-design-engineering`.

Resolved when both sample problems play through on her main device from the deployed link. The resolution records the data types' location and anything the brace or stacked diagrams decided.

## Comments
