# How does the Тип і схема step ask for the type so that it's clear to her?

Labels: wayfinder:prototype
Status: open
Assignee: maksymomelchuk
Blocked by: [Build the guided-problem flow](12-build-guided-flow.md)
Parent: [Map](../MAP.md)

## Question

The parent played the walking boy (2.3) on the iPad and said of the Тип і схема step: "this questions and options to answer is not clear" ([screenshot](../assets/ipad-screenshots/2.3-type-step-unclear.png)). How should the step ask for the type of each relation so that she understands what she's being asked and what the options mean?

As built, following step 5 of [guided-flow.md](../assets/guided-flow.md), the step reads «Який це тип? Назви тип кожного зв'язку в задачі.» Each relation is restated as a card («За 60 хв хлопчик проходить 3000 м», «За 20 хв з тією самою швидкістю він пройде ? м»), and each card offers all six type names as buttons. Possible reasons it's unclear, for the parent to confirm:

- «зв'язок» and «тип» are the glossary's words, not hers, and the instruction doesn't say why she's naming a type.
- The type names are bare labels with no example or picture. Has her class ever named «Три величини» or «Частини і ціле»?
- The relation cards are reworded, not the problem's own sentences, so she has to match them to the text first.
- Both relations in 2.3 have the same type, so the same six buttons twice feels like a repeated question.
- The diagram that follows is what she'll draw on paper, but it isn't visible while she picks.

Constraints: the type is named per relation, not per problem, and the six types and their names come from [Which problem types and difficulty ramp does the problem set cover?](04-problem-types-and-ramp.md). Never teach keywords ([Which word-problem teaching methods work for kids her age?](01-teaching-methods.md)): a type can't be offered as "the word «більше» means add".

- [ ] 2–3 variants of the step, built into the PoC so they run on her iPad. Reach them from «Для батьків», where the parent switches the active variant. Use both sample problems. For example: the question in her words; each type with a one-line example or a mini-diagram; picking the diagram picture instead of the name; the problem's own sentence highlighted in place of a reworded card.
- [ ] The parent tries them, then with her, and records which one she understands without help and what she says about each.

AFK: the agent builds the variants. For UI work, use `/impeccable` or `/emil-design-engineering`. HITL: the parent tries them with her.

Resolved when the parent picks a variant. The resolution records the step's wording and what goes into each problem's data for it.

From [Build the guided-problem flow](12-build-guided-flow.md): the flow is in `poc/src/guided/` (the step's screens in `screens/`, its checks in `checks.ts`), and «Для батьків» already exists for the variant switch. The style fixes for the problem text's highlights are being finished on that ticket; let the parent re-check them on the iPad along with the variants.

From [How does the guidance fade across the problem set?](08-guidance-fading.md), revisited: the diagram fade depends on the version picked here.

- **In the schedule**, the diagram is chosen for her in Levels 1–2. From 3.1 she picks each relation's diagram and places the «?». From 4.1 she draws it on paper and taps «Яка схема в тебе?».
- **If Б «Схеми» is picked**, she already picks a sketch from Level 1. Then only placing the «?» is new at 3.1, and the same sketches serve as the options for «Яка схема в тебе?».
- **With any version**, the relations stay listed while Тип і схема is prompted (Levels 1–3).
- [Build the paper steps and the fading schedule](14-build-fading.md) now waits for this ticket.

## Comments

### Note (2026-10-03)

The step was unclear to both the parent and her. The parent didn't single out the instruction, the type names or the reworded cards, so the variants should address all three.

### Progress (2026-10-03)

The AFK part is done: three new versions of Тип і схема, plus the old one, are built into `poc/` for both sample problems. **Not deployed yet**: the orchestrator deploys once the Обчисли work on [Help her pick the operation in Обчисли](16-help-pick-operation.md) is in too. Trying the versions, alone and then with her, is the parent's part.

**What all three new versions share.** They answer the three possible reasons from the Note.

- **One relation per screen**, headed «Тип 1 з 3», not six buttons per relation stacked on one screen. Each relation is named, then «Далі» moves to the next. Earlier ones are listed under «Уже названо».
- **The problem's own words, not a reworded card.** The words are highlighted pink in the problem text and quoted on the card: «Хлопчик пройшов 3000 м за годину.», not «За 60 хв хлопчик проходить 3000 м». Where the text only implies a relation, one line under the quote says what it means. For 2.3 that's «Він іде з тією самою швидкістю.». For 4.7 it's «Периметр — це всі три сторони разом: AB, BC і AC.».
- **The instruction in plain words, with no «зв'язок».** I also avoided «тип речення», because at school that means розповідне or питальне.
- **Hint, then show**, as on every step. The hint is the relation's existing one. A right answer says «Так. Це «Три величини».».

**The three versions:**

- **А «Приклади»**: six cards, each a type name with a one-line example from outside the problem set («У Марти 7 наліпок, а в Олі — на 3 більше.»). Title «На який приклад схоже?», prompt «Прочитай виділене в задачі. Вибери тип, приклад якого на це схожий. Тип підкаже, яку схему малювати.»
- **Б «Схеми»** (recommended, and the default until the parent picks): six small sketches of the school diagrams, with the type name under each. The sketches are bars with an extra piece, bars as copies, a segment in parts under a brace, a segment of fifths with 2/5 shaded, the швидкість–час–відстань table, and two movers going towards each other and apart. Title «Яка схема підходить?», prompt «Прочитай виділене в задачі. Вибери схему, яку до нього можна намалювати.»
- **В «Два питання»**: first «Що тут є?», picked from three options, each with its diagram: «Два числа порівнюють між собою», «Є ціле і його частини», «Є швидкість, час і відстань. Або ціна, кількість і вартість». Then a choice between that family's two types, each shown with its name: «Як саме порівнюють?», «Яка тут частина?» or «Один чи двоє?».
- **«Як було»**: the old screen, unchanged, kept as the baseline.

**Why Б is recommended.** It asks for the least reading, which is her weak spot, while А asks for the most. It also shows the diagram she draws next, and one consistent diagram per type is the part of schema teaching the research rates strongly ([teaching-methods.md](../assets/teaching-methods.md)). В is the longest: it asks two questions per relation, so 6 for 4.7 instead of 3. It's the fallback if six choices at once are too many.

**Wording.** The six types and their names are unchanged. No example or option names an operation, and a test enforces this, so nothing reads as a keyword rule. 4.7's inverted comparison is quoted as written, «Сторона BC … на 5,1 см менша від AC». Its type is the same as for the decoded line, so the trap isn't given away.

**What each problem's data needs for it** (for the resolution and [Write the guided-step data for the problem set](13-write-guided-data.md)):

- Each relation gets an `id`, a `quote` (the problem's own words, with `…` where words are left out), an optional `note` for an implied relation, and its `type` and `hint` as before. `text`, the reworded card, is needed only while «Як було» stays.
- Each piece of the text carries `relations: [id]` for the words to highlight.
- The validator checks that every quote is the problem's own words and that every id is marked in the text.
- The type meanings, examples and the questions for В don't vary by problem. They live in `poc/src/problems/typeGuide.ts`.

**Where it is.** The versions are in `poc/src/guided/typeStep/`, picked in `guided/screens/TypesScreen.tsx`. The parent's switch is `screens/TypeVariantPanel.tsx`, and the try mode is `screens/TypeStepTry.tsx` (`#/try/2.3`). The choice is saved on the device under `word-problem-poc:type-step-variant`, and «Стерти записи» doesn't reset it.

**Records.** Each attempt notes the version she saw. «Для батьків» shows it on the attempt line, for example «, «Тип і схема»: Б «Схеми»». Each hint and shown answer in the step also carries the version, and is listed against the relation's words. Tries started from «Для батьків» are kept apart, under «Спроби варіантів», and never count as starting or solving her problems.

**Checked.** The unit tests (14 new), the type check and lint pass. A script played every version on both problems by touch, with deliberate mistakes, then played the real flow of 2.3 and checked the records. It ran in Safari's engine (WebKit) at 820×1180, 1180×820, 390×844 and 320×700 (the narrowest Split View), and in Chromium at 1440×900. On every screen it found no overlapping or overflowing controls, no taps under 44 px, no hidden content and no console errors.

**Parent's checklist.** Do this once the orchestrator says the new version is live.

1. Close «Задачі» fully (swipe it up in the app switcher), then open it again from the icon.
2. Tap «Для батьків» at the bottom of the list. The top section is «Крок «Тип і схема»: який варіант показувати», and the active version is the blue one. Б «Схеми» is active until you change it.
3. **On your own, about 10 minutes.** For each of А, Б, В and «Як було»:
   1. Tap the version.
   2. Tap «Задача 4.7» next to «Спробувати …». This plays only Тип і схема (the types, then the diagram) with the short record already filled, then returns to «Для батьків».
   3. Make one mistake on purpose to see the hint, and two to see the answer shown.
   4. Play «Задача 2.3» too.
   5. Note any Ukrainian that reads wrong, any picture you find unclear, and whether the pink highlight in the text matches the quote.
4. **With her.** Pick a version, open «Спробувати», and hand her the iPad without explaining anything. Watch for:
   - whether she knows what to do without asking;
   - which words she asks about;
   - whether she reads the highlighted words or just guesses.
   
   Then ask her what the pictures or examples mean to her. Do the same for the other versions. Whichever she sees first teaches her something for the later ones, so write down the order you used.
5. For each version, record:
   - whether she understood it without help, and if not, where she got stuck;
   - what she said about it, in her words;
   - her hints and shown answers, from «Спроби варіантів» at the bottom of the section.
6. Leave her favourite selected, because that is what she'll see in the trial. Tell me which one you pick and her words.
7. While you're there, re-check the highlight fixes from [Build the guided-problem flow](12-build-guided-flow.md). In Знайти, the question should be one continuous highlight. In Відомо, each number should have a dashed frame that doesn't move when you tap it.

### Progress (2026-10-03, deployed)

Live at https://reliable-macaron-77e751.netlify.app: on 2026-10-03 its bundle (`index-DNezyNo5.js`) holds the Тип і схема versions (А «Приклади», Б «Схеми», В «Два питання», «Як було») and the variant switch, so the checklist above can start now.

### Progress (2026-10-03, the parent's solo checks by proxy)

The parent delegated their solo checks (steps 1–3 and 7 above) to the orchestrator. An agent ran them on the live link (`index-DNezyNo5.js`) by touch, in WebKit at 820×1180 and 1180×820, with a quick pass at 390×844 and in Chromium at 1440×900. It played А, Б, В and «Як було» on 4.7 and 2.3, each with a hint and a shown answer, plus the diagram. Screenshots are in `.playwright-mcp/proxy-check/`.

- **Clean**: the pink highlights match their quotes. Знайти's highlight is continuous. Відомо's dashed frames don't move when tapped (measured). There were no console errors, no overflow and no keyword rules.
- **Fixes, applied after [Build the paper steps and the fading schedule](14-build-fading.md) lands** (it's editing the same files). All pass the tests, the type check and lint on a copy of the current code:
  1. 2.3's relation hints (`problems.ts`): «Тут є швидкість, час і відстань.» gains «І рухається тільки один — хлопчик.», and «Знову швидкість, час і відстань.» gains «І знову рухається тільки хлопчик.». In В's «Один чи двоє?», and on «Зближення / віддалення» in А and Б, the hint didn't answer her mistake.
  2. 4.7's relation `bcAc` hint: «…одна сторона більша за іншу.» becomes «Сказано, на скільки одна сторона менша від іншої.», because the quote says «менша».
  3. `typeGuide.ts`: «назустріч одне одному» becomes «назустріч один одному» (two male cyclists).
  4. `screens.css`: «До задач» and «Зразки схем» in «Для батьків» were 26 px tall, and get a 44 px tap height.

**Still the parent's:** steps 4–6, trying the versions with her and picking one.

### Note (2026-10-03, stage switch first)

The fading build is live (`index-ClRAZLB8.js`), so each problem now plays at its slot's stage: 2.3 at 2.1–2.4 (actions in the notebook) and 4.7 at 4.6–4.7. **Before the session with her, open «Для батьків» and set the stage switch to 1.1–1.7**, so 2.3 plays fully guided as these checklists expect. «Спробувати» and the variant switch work as before. Afterwards, turn the switch off and tap «Стерти записи» before her trial starts.

### Note (2026-10-04, fixes applied)

The proxy check's fixes listed above are applied and live (deployed with all 30 problems), with the tests, the type check and lint passing.
