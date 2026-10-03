# Issue tracker: Local Markdown

Issues for this repo live as markdown files in `.scratch/`. There is no git remote.

## Conventions

- One effort per directory: `.scratch/<effort-slug>/`
- Issues are `.scratch/<effort-slug>/issues/<NN>-<slug>.md`, numbered from `01`; the `NN` is the issue's id
- Assets created while resolving an issue go in `.scratch/<effort-slug>/assets/` and are linked from the issue
- Each issue opens with a header block of `Key: value` lines under its `# Title`
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

## Wayfinding operations

- **Map**: `.scratch/<effort-slug>/MAP.md`, header line `Labels: wayfinder:map`
- **Child ticket**: any file in that effort's `issues/` directory; its header carries `Parent: [Map](../MAP.md)`
- **Type**: header line `Labels: wayfinder:<research|prototype|grilling|task>`
- **State**: header line `Status: open` or `Status: closed`
- **Claim**: header line `Assignee:`; empty means unclaimed. Claim by writing your git user name there before any work
- **Blocking**: no native support, so it is a body convention. Header line `Blocked by:` lists links to the blocking tickets, or `—` for none. A ticket is unblocked when every ticket it lists is `Status: closed`
- **Frontier**: open tickets with an empty `Assignee:` whose `Blocked by:` tickets are all closed, taken in `NN` order
- **Resolve**: append the answer under `## Comments` as `### Resolution`, set `Status: closed`, then add a line to the map's Decisions so far
- **Out of scope**: set `Status: closed`, add `Closed as: out of scope`, and add a line to the map's Out of scope section
