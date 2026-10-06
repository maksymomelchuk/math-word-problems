# Game calls: what the game layer does, whichever option she picks

An AFK proposal for [Which Duolingo-style game mechanics go into the PoC?](../issues/09-game-mechanics.md) (2026-10-03). Nothing is decided. Her pick among the options in [game-mechanics-mock.html](game-mechanics-mock.html), and her opinions, come from her session with the parent. This settles the rest, so the game-layer build can be specified once her pick arrives. Terms are from [CONTEXT.md](../../../CONTEXT.md). "(summary)" marks a source seen only in a search summary.

## Summary

| Call | Recommendation |
|---|---|
| 1. What a wrong answer costs | **Nothing**, in every option. A wrong answer, or an answer the app had to show, costs no XP, star, heart or streak. Its only consequences are the fixed ones: a hint, then the answer with its reason, and a problem with a shown plan line or result comes back once at the end of its level |
| 2. A solo-try success | **Nothing extra.** The end screen says in one plain line how she solved it, the same size for every way. «Для батьків» records it |
| 3. Daily goal and streak | **No streak**, daily or weekly. Where an option has a "today" spot, the goal is **one finished problem**, for today only: no history, no "missed" message, no push for more. It's hidden once the set is finished |
| 4. Handover screens | **Not celebrations.** A calm screen in the option's own look, with no confetti. The celebration moves to the **end of each level**, which falls just before 2.1, 3.1 and 4.1 |
| 5. Other open points | Add level-end and set-end screens. One meaning of "shown" everywhere. «Далі» goes home, and nothing asks for one more. No rewards inside a problem. Praise names what she did. The mascot appears in option 1 only and never makes her feel guilty |

## 1. What a wrong answer costs

**Recommendation: nothing.** In all three options, a wrong or shown answer takes away or holds back no XP, star or heart. The fixed consequences are enough: a hint, then the answer with its reason. A shown plan line or result (after two misses or by a second «Підказка» tap, as [ticket 14](../issues/14-build-fading.md) reads it) brings the problem back once at the end of its level.

**Why.**

- **Free hints plus costly misses pay her to ask before trying.** «Підказка»'s second tap shows the model for free, while two wrong tries cost a star or a heart, so the cheapest route is two taps before thinking. That "clicking through" to the bottom-out hint is the commonest misuse of help in tutors and goes with poorer learning ([Aleven & Koedinger 2001](http://pact.cs.cmu.edu/pubs/Aleven%20Koedinger%2001.pdf); [Aleven et al. 2016](https://link.springer.com/article/10.1007/s40593-015-0089-1); summary). Charging for the second tap closes the gap, but then a hint isn't free. With nothing at stake, asking and trying cost the same, and «Для батьків» shows where she really needed help.
- **Duolingo dropped it.** In 2025 it replaced hearts with energy because "each mistake cost 1 heart … This was not the most effective way to support learning", and beginners were "2X more likely to run out of hearts mid-lesson" ([Duolingo, July 2025](https://blog.duolingo.com/duolingo-energy/)). Khan Academy Kids answers a miss with hints and a gentle sound ([blog](https://blog.khanacademy.org/supporting-english-language-acquisition-with-khan-academy-kids/), summary). Zearn's Boost breaks the problem into steps at no cost ([fading-apps.md](fading-apps.md)).
- **Treating errors as part of learning goes with better maths.** In 6th–7th-grade maths classes, a positive error climate went with more adaptive reactions to errors and better grades ([Steuer, Rosentritt-Brunn & Dresel 2013](https://www.researchgate.net/publication/257178528_Dealing_with_errors_in_mathematics_classrooms_Structure_and_relevance_of_perceived_error_climate), summary). Performance goals predicted avoiding help ([Ryan, Pintrich & Midgley 2001](https://link.springer.com/article/10.1023/A:1009013420053), summary). She found 2.3 hard even fully guided. A star lost after ten minutes on a Level 4 problem turns that effort into a loss.
- **Hearts can end a sitting.** With 5 a day and a lockout, one hard day stops her mid-sitting and breaks the trial's 4 sittings a week.

| Alternative | Trade-off |
|---|---|
| **A star**, as option 2 mocks it: one star fewer for a shown answer, won back at the repeat, hints free | A graded challenge that many children like: Beast Academy gives up to three stars per lesson ([help](https://help.beastacademy.com/a/1798922-class-overview)), and Matific grades by score ([help](https://help.matific.com/en-us/articles/15485851-starmaster-introduction), summary). It also makes the repeat a chance to win the star back. Loss framing can raise effort on tests in older students ([Corvinus 2026](https://blog.efmdglobal.org/2026/09/10/corvinus-students-higher-scores/), summary). But either the second-tap gap stays open or a hint stops being free. A lost star after a long problem reads as failure. Replaying for missing stars in the free weeks blurs "does she open it herself" |
| **A heart with a daily lockout**, as option 3 mocks it | The strongest push to be careful, but it can stop a sitting, and Duolingo dropped it. Not recommended in any form that has a lockout |

| Option | What call 1 means |
|---|---|
| 1 · Стежка | No change: +10 XP however the problem went. Only the bird's line changes, and the repeat note stays |
| 2 · Зірки | Stars stop being a grade. A finished problem's tile gets its star, and a ↻ tile lights up the same way. If her reason for picking option 2 is the three-star grade itself, use the star fallback in the build spec. Its rule that a second «Підказка» tap costs a star, like two misses, needs the orchestrator's OK |
| 3 · Сердечка | Hearts go, along with the lockout. The today card, the next problem and the level bars stay. If her reason is the hearts themselves, use the heart fallback in the build spec |

## 2. Does a solo-try success earn something extra?

**Recommendation: nothing extra.** A solo success earns the same XP, star or goal tick as step by step, with no badge and no mark on the node or tile. The end screen says how it went in one line, the same size for every way: «Увесь розв'язок — у зошиті, і відповідь зійшлася.» or «Крок за кроком — і відповідь зійшлася.» «Для батьків» shows the solo-try line ([ticket 18](../issues/18-trial-records.md)).

**Why.**

- Anything extra makes step by step cost something by comparison, which the fading decision rules out.
- Choosing the solo try is one of the trial's interest signals ([trial-proposal.md](trial-proposal.md), part 5). With a prize attached, the choice would show that she wanted the prize, not that she felt ready.
- Expected tangible rewards for a task lower later free-choice interest, more in children than in college students; positive feedback doesn't lower it ([Deci, Koestner & Ryan 1999](https://depts.washington.edu/techdocs/papers/deciExtrinsicRewardsAndIntrinsicMotivation99.pdf)). Preschoolers who expected a "Good Player" certificate later drew about half as much in free play ([Lepper, Greene & Nisbett 1973](https://www.researchgate.net/publication/281453299_Undermining_children%27s_intrinsic_interest_with_extrinsic_reward_A_test_of_the_overjustification_hypothesis)). A plain line saying what she did is feedback, not a prize.

| Alternative | Trade-off |
|---|---|
| A mark on the node or tile | Visible recognition she may value. But every step-by-step node then looks lesser, and a course with badges and a leaderboard lowered intrinsic motivation over a semester ([Hanus & Fox 2015](https://www.sciencedirect.com/science/article/abs/pii/S0360131514002000); college students) |
| A one-off bird line, the first time only | Unexpected rewards don't undermine interest (Deci et al. 1999). After the first time she expects it, though, and it still ranks the two ways |

**Per option.** 1: +10 XP either way, and the bird says the plain line. 2: the same star, with no mark on the tile. 3: the goal ticks either way, and no heart comes back.

## 3. The daily goal and the streak

**Recommendation: no streak, daily or weekly. A daily goal only where the option has a "today" spot, and it counts one finished problem.**

- **What counts:** one finished problem, a repeat or replay included. The app can see that. It can't see a sitting, and a minutes goal needs a timer.
- **Today only:** no calendar, no count of days, nothing said about a day without a problem.
- **No push for more:** nothing says «Ще одна задача!» or «Можна ще».
- **Hidden once the set is finished**, because the free weeks have no schedule.

**Why.**

- **A streak works by making a break feel like a loss.** A broken streak shown in a log lowered later engagement, and people paid to repair one ([Silverman & Barasch 2023](https://www.insead.edu/faculty-research/publications/journal-articles/or-track-how-broken-streaks-affect-consumer), summary). Duolingo says "losing a streak can be very discouraging" and added a Weekend Amulet because weekends break streaks ([blog](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/)). With 4 sittings a week, a daily streak breaks every week by design. In the free weeks, any streak is the pull the trial wants absent.
- **School maths products that keep a streak make it weekly:** Khan Academy (one skill to proficient a week, [blog](https://blog.khanacademy.org/get-motivated-to-learn-with-khan-academys-new-streaks-and-levels-features/)) and DreamBox (5 lessons a week, [help](https://dreamboxlearning.zendesk.com/hc/en-us/articles/27281845725971-How-3rd-8th-Grade-Students-Track-Their-Progress-in-DreamBox-Math), summary). Brilliant keeps a daily one, with Streak Charges to save it ([help](https://brilliant.org/help/features/what-is-a-streak/)). A weekly streak would put the parent's schedule inside the app and still pull in the free weeks.
- **One problem a day never rushes Level 4**, where a problem takes 8–14 minutes.

| Alternative | Trade-off |
|---|---|
| No daily goal anywhere | The cleanest signal, but option 3 is built around its today card |
| A weekly goal of 4 sittings, with no streak (as Zearn sets 3–4 lessons a week, [help](https://help.zearn.org/hc/en-us/articles/115008117448-Celebrate-school-goals), summary) | Matches the trial plan, but the app then enforces the parent's schedule, and it pulls in the free weeks |
| A day count that never resets («12 днів із задачами») | Nothing to lose, but it still rewards showing up, which the trial rules out |

| Option | What call 3 means |
|---|---|
| 1 · Стежка | The вогник, its week strip and «…щоб вогник не згас» go. A small ring, «Мета на сьогодні — одна задача», takes their place |
| 2 · Зірки | No change: option 2 has no goal and no streak |
| 3 · Сердечка | The ring counts one problem, not three. «Ще одна задача!» and «Можна ще, якщо хочеш» go. «Мету на сьогодні виконано» shows once, and after that the end screen says nothing about the goal |

## 4. Are handover screens celebrations?

**Recommendation: no.** Each handover (2.1, 2.5, 3.1, 4.1, 4.4, 4.6) is a calm screen in the option's own look: the schedule's draft, what stays in the app and what goes to the notebook, and «Почати». No confetti. The celebration moves to **the end of each level**, after its last problem or repeat, and to the end of the set.

**Why.**

- **The handovers follow a fixed schedule; she doesn't earn them.** 2.5 and 4.4 fall mid-level. Praise works when it's contingent and specific (Brophy 1981), and a slot number is neither. Finishing a level is something she did.
- **A handover gives her a new rule** to read and follow with the notebook. Irrelevant decoration lowers learning, a small-to-medium effect ([Sundararajan & Adesope 2020](https://link.springer.com/article/10.1007/s10648-020-09522-4), summary), and a party screen invites a quick tap past.
- **A handover adds work just before harder problems.** Confetti raises the stakes there, which is why the 4.6 screen already has none.
- **It fits the trial.** Each handover opens a sitting with the parent beside her, and a level end closes one on a high.

| Alternative | Trade-off |
|---|---|
| Celebrate every handover (option 1 as mocked) | Lively, and she may enjoy it. But it praises the schedule rather than her, and it competes with the new rule |
| A still "unlocked" badge (option 3 as mocked) | A fair middle ground that frames the notebook as earned trust. It's fine as long as it isn't animated like a prize |

| Option | What call 4 means |
|---|---|
| 1 · Стежка | The bird says the draft, without confetti, as at 4.6. At a level end, confetti and the bird, and the level banner turns «Пройдено» |
| 2 · Зірки | The plain card stays. At a level end, a card: «Рівень N пройдено!» with the level's stars |
| 3 · Сердечка | The still badge stays. At a level end, the level bar fills, with «Рівень N пройдено!» on the today card |

## 5. Other points the ticket leaves open

| Point | Recommendation | Why |
|---|---|---|
| **Level-end and set-end screens** (not mocked) | After a level's last problem or repeat: «Рівень N пройдено!» and what the level held («7 задач, 1 повтор»), then home. After Level 4's repeats: «Усі 30 задач пройдено! Тепер можна повертатися до будь-якої задачі.», and every problem opens | The celebration from call 4. The set end announces the free part without pushing |
| **«Далі» and "one more"** | «Далі» always goes home, as in the mock. Nothing chains into the next problem or invites another | "Asking for one more" is a trial signal, and a stop after each problem helps the parent's 15-minute rule |
| **What counts as "shown"** | One meaning in every counter and line: what makes a problem missed (ticket 14). A prompted step's shown answer, a wrong direction check, a «Ні» self-check and a wrong solo answer are recorded, never counted | Fixes option 2's legend, which takes a star for any shown answer but brings back only plan lines and results |
| **Where she needed help, on the end screen** | One line naming what had to be shown, in all options (options 2 and 3 already do this). Hints aren't listed | Listing hints would mark asking as a fault. «Для батьків» has them |
| **Rewards inside a problem** | None: no combo counter, no points per step, nothing timed. Per-step feedback stays as in the guided flow | Combos reward speed and lucky taps on two-button checks, the quick guessing the trial watches for ([Baker 2007](https://learninganalytics.upenn.edu/ryanbaker/BakerCHI2007Final.pdf)) |
| **How praise is worded** | Name what happened, with the same warmth for every outcome. No inflated words («неймовірно») and no praise of her as a person. Replace «Без жодної помилки! Так тримати!» with «Усе зійшлося з першого разу.» Keep «Підказки саме для цього.» | Praise for ability turned 5th graders towards performance goals ([Mueller & Dweck 1998](https://doi.org/10.1037/0022-3514.75.1.33)). Inflated praise cut challenge-seeking in children with low self-esteem ([Brummelman et al. 2014](https://journals.sagepub.com/doi/abs/10.1177/0956797613514251)). Feedback aimed at the self helps least ([Kluger & DeNisi 1996](https://www.mrbartonmaths.com/resourcesnew/8.%20Research/Marking%20and%20Feedback/The%20effects%20of%20feedback%20interventions.pdf)) |
| **Mascot** | Only in option 1, unless she asks to combine. It speaks in text bubbles at handovers, the 4.6 choice, end screens and level ends. Never during steps, never sad when she's been away | Agents help school-age learners a little, and on-screen text works better than narration ([Schroeder, Adesope & Gilbert 2013](https://eric.ed.gov/?id=EJ1076333), summary). A sad bird would pull her back, just as a streak does |
| **Replays after the set** | A miss in a replay after the set doesn't queue another repeat. A replay earns what any problem earns. The daily goal is hidden | The free weeks have no schedule. Ticket 14 covers only first-pass repeats |

## Build spec per option

Common to all three: nothing taken away for a miss, nothing extra for a solo success, no streak, no rewards inside a problem, «Далі» goes home, and the level-end and set-end screens from point 5. After the set, every problem opens and any daily goal is hidden.

### 1 · Стежка

- **Home:** a path of 30 nodes in four levels. Only the next problem is open until the set is finished. ↻ «Повтор задачі N» nodes sit inside their level. From Level 2, «із зошитом», and «Знадобиться зошит» on the next node.
- **Top bar:** the XP total and a ring, «Мета на сьогодні — одна задача». No вогник, week strip or day count.
- **XP:** +10 per finished problem, however it went.
- **End screen:** small confetti and the bird's line for the outcome:
  - clean: «Усе зійшлося з першого разу.»;
  - with hints: «Підказки саме для цього. Задачу розв'язано!»;
  - something shown: what was shown, «Нічого страшного», and the repeat note;
  - solo: the plain solo line.

  Then +10 XP, the path progress, «Розбір» and «Далі».
- **Handovers and the 4.6 choice:** the bird says the draft, with no confetti. 4.6 keeps «Досвід однаковий: +10 XP за будь-який спосіб.»
- **Level end:** confetti, the bird, «Рівень N пройдено!», and the banner turns «Пройдено».
- **The bird** (Кмітка, a placeholder) speaks in text bubbles on those screens only. Never during steps, never sad.

### 2 · Зірки

- **Home:** a grid of 30 tiles by level. The next tile shows «Почати» and, from Level 2, the notebook. ↻ repeat tiles sit inside their level.
- **Stars:** one per finished problem. A repeat lights its ↻ tile the same way. Level headers count them («5 з 8»). The legend reads «Розв'язуй задачі — і збирай зірки. Підказки й показані відповіді зірок не забирають.»
- **No** XP, streak, daily goal or mascot.
- **End screen:** «Задачу розв'язано», the star, one line on anything shown with the repeat note, then «Розбір» and «Далі». A solo success gets the plain solo line.
- **Handovers and the 4.6 choice:** the plain card. 4.6 keeps «Зірки рахуються однаково для обох способів.»
- **Level end:** a card, «Рівень N пройдено!», with its stars.
- **Fallback, if her reason for picking option 2 is the three-star grade:** 3 stars, minus one for each plan line or result shown (after two misses or by a second «Підказка» tap; the first tap stays free), with at least 1. Never for a prompted step. Won back at the repeat, but not by replays after the set. Shown only on the end screen.

### 3 · Сердечка

- **Home:** the today card, with the ring («Мета на сьогодні — одна задача»), the next problem with «Знадобиться зошит», and «Почати». Level bars beside it, with ↻ repeats in the level strip. No «Ще одна задача!» or «Можна ще».
- **No hearts, no lockout, no XP, no mascot.** Any problem can be opened on any day.
- **End screen:** the ring fills on the day's first finished problem («Мету на сьогодні виконано»). Then «Задачу розв'язано», one line on anything shown with the repeat note, «Розбір» and «Далі».
- **Handovers and the 4.6 choice:** the still notebook or fork badge. «Кнопка «Підказка» сердечок не забирає» becomes «Не знаєш, що далі? Натисни «Підказка».», and «Для сердечок обидва способи однакові» goes.
- **Level end:** the level bar fills, with «Рівень N пройдено!» on the card.
- **Fallback, if her reason for picking option 3 is the hearts:** 3 hearts per problem, refilled at the next problem, lost on the same events as option 2's fallback. They never block anything.
