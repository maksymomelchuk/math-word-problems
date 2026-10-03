# How step-by-step apps handle the last stage, the plan and its checks

Desk research, 2026-10-03, for the reopened [How does the guidance fade across the problem set?](../issues/08-guidance-fading.md) and its [fading-revisit-proposal.md](fading-revisit-proposal.md). It fills gaps in [fading-apps.md](fading-apps.md), [fading-evidence.md](fading-evidence.md) and [teaching-methods.md](teaching-methods.md) and doesn't repeat them. A, B and C are the proposal's alternatives. "Q2", "Q3" and so on are the questions in its section 3.

- **[V]** I read it in the linked source. For papers this is sometimes only the abstract, as noted.
- **[S]** I saw it only in a search-result summary.
- **[I]** My inference. No source says it.

## TL;DR

1. **The last stage.** No step-by-step product I found stops checking steps on a schedule. What they hand over late is the breaking down: the problem arrives whole and the student decides the steps. Each step she enters is still checked (Mathspace), or steps appear only after a miss or on request (ASSISTments, Zearn, Khan). Unaided work happens on paper, read by a teacher. **Supports B. For Q4, an optional whole-problem try at 4.7 with «Розбий на кроки» is the most common app ending.**
2. **Who decides the plan, and how it's checked.** Tutors check the student's choice of next goal with menus (Andes, Pyrenees), typed lines read by a maths engine (Mathspace), or a graph of all valid paths with "any order" groups (CTAT). **Supports Q2, "she writes the plan", checked by B's plan-line picks. The 2.3 miss argues for also checking each line's operation, as Pyrenees checks the equation apart from the principle.**
3. **Granularity.** Most tutors check each step as it's entered, and Mathspace's guide tells the student to go back to her "latest correct step". Some check only after the whole solution, and delaying feedback near mastery counts as fading. Step-level checks beat answer-only checks (d ≈ 0.76 against 0.31), and finer checks add little. **Supports Q3's second option: line by line in Level 3, the whole plan then line by line from 4.1.**
4. **Naming the next routine step.** No children's app I found asks which routine step comes next. The nearest are a Solve It! self-question (paper) and Pyrenees, a university tutor where students choose what to find next. **Weak support for Q5. The evidence backs choosing what to find next (B's plan lines) more than naming routine steps.**
5. **Paper steps checked one by one.** ASSISTments is closest: work on paper, the answer to each scaffold typed, one at a time, but only after a miss. In one study, step-checked practice didn't beat paper, but skipped steps on paper went with lower gains. **Supports B's typed result per action, and Q6's objective checks.**
6. **Direction before computing.** Schema-based instruction and Solve It! keep "estimate first, then compare" in the routine to the end. The teacher's modelling fades, not the step. I found no app that asks "more or less than …?" before the operation. **Supports keeping ticket 16's direction check to 4.7, under B as a tap before each typed result. Caveat: with a multiplier below 1, "less" doesn't mean "divide".**
7. **Length.** Products for this age plan sessions of 15–30 minutes and lessons of 5–10. I found no published time for one step-supported multi-step word problem. **For Q7: an 8–11-minute triangle fills most of a short session. Plan 1–2 Level 4 problems per sitting.**

## 1. The last stage

- **Mathspace.** Students "Enter your next step" and get "feedback every time you press Submit". "Next Step" makes Mathspace "set up the next intermediate step for you" and costs marks; hints are free. [V] [student guide](https://content.govdelivery.com/attachments/VAEDUFCPS/2023/06/05/file_attachments/2516566/FCPS%20Student%20Guide%202023.pdf). Steps aren't enforced: "If a student skips to a final answer, it will be marked correctly unless intermediate steps are essential". [V] [help](https://help.mathspace.co/can-different-methods-be-used-to-answer-questions-mathspace-support)
- **Khan Academy.** "If there are multiple steps for a problem, our practice exercises usually include a hint for each step." Students should "try to answer it first before asking for a hint". [V] [blog](https://blog.khanacademy.org/how-should-people-practice-on-khan-academy/)
- **ASSISTments.** The first scaffold question "appears only if the student gets the item wrong", then they come "one at a time". [V] [Feng & Heffernan](https://web.cs.wpi.edu/~nth/pubs_and_grants/papers/journals/feng_heffernan_JILR.pdf)
- **Zearn.** Each Tower of Power has "two to four stages of problems that increase in complexity and decrease in scaffolding". A mistake brings a Boost that "breaks down the question into smaller steps", then a new problem. The lesson ends with a paper Exit Ticket. [V] [grade 5 course guide](https://webassets.zearn.org/resources/G05_Course_Guide_Z1.pdf)
- **MATHia** stays step by step in most workspaces (fading-apps §1). A few later ones drop a support: "the scaffolding is removed and students are responsible for solving a single literal equation". [V] [table of contents](https://cdn.carnegielearning.com/assets/tech-support/2020-2021_HSMS_SC_A2_MATHia_TOC_1_Blended_online.pdf). Its equation solver presumably still checks each move there. [I]
- **MATHia, support on by default.** In "Solving Quadratic Equations" the student picks "Apply Quadratic Formula" from a menu, and an optional scratchpad helps with the substitution. While it was optional, about a third failed to reach mastery. Opened by default, failures fell from 34.4% to 24.1%. High school, school years compared, not a controlled experiment. [V] [Fancsali et al. 2021](https://par.nsf.gov/servlets/purl/10291624)
- **Skye and Brilliant.** Skye's sessions follow "explicit modelling, guided practice, and independent practice", moving to independent practice "if the pupil is secure". [V] [Third Space Learning](https://thirdspacelearning.com/llm-info/). A Brilliant lesson is "a short sequence of interactive problems and a Skills Check (practice problems) at the end". [V] [help](https://brilliant.org/help/schools-and-educators/how-brilliant-fits-into-a-math-lesson/)
- **What it means.** Apps hand over deciding the steps, not working without checks. The MATHia case looks like her 2.3 miss: picking the right method from a menu didn't mean carrying it out, and support placed in front of students beat support on offer. Keep each action's check, and ticket 16's help, on by default, not behind «Підказка». [I]

## 2. Who decides the next action or the plan, and how it's checked

- **Andes** (physics, university) asks for the goal ("What quantity is the problem asking you to determine?") and the method ("What principle should you use…?"). Students answer "via hierarchical menus" with immediate feedback. Steve and Sherlock "list possible next steps and let the student choose". [V] [VanLehn 2006](https://www.cs.uky.edu/~sgware/reading/papers/vanlehn2006behavior.pdf)
- **Pyrenees** (probability, university): "Each principle application involves three steps: 1) selecting a target variable from the ones that are marked as sought, 2) selecting a principle to apply to the target variable, and 3) writing an equation for the selected principle." For each step, the tutor either asks the student or does it itself. [V] [Zhou et al.](https://par.nsf.gov/servlets/purl/10340884)
- **MATHia's equation solver** has the student choose the next move from a menu. [V] [Fancsali et al.](https://par.nsf.gov/servlets/purl/10291624)
- **Mathspace** reads typed or handwritten lines. A step that is "mathematically correct" but "not a step in Mathspace's solution" is accepted, though "No hints are targeted at these steps". [V] [student guide](https://content.govdelivery.com/attachments/VAEDUFCPS/2023/06/05/file_attachments/2516566/FCPS%20Student%20Guide%202023.pdf)
- **CTAT tutors** record "Alternate ways of solving a problem … as separate paths". In an "unordered" group, "the student can perform the steps in any order". [V] [CTAT wiki](https://github.com/CMUCTAT/CTAT/wiki/Example-tracing-Tutors)
- **Khanmigo** reads free text. The AI is told "to write out all the ways in which the student may have arrived at their answer behind the scenes", to follow any "solution path". [V] [Khan blog](https://blog.khanacademy.org/khanmigo-math-computation-and-tutoring-updates/). Eedi's chat tutor had a human approve each message. [V, abstract] [Eedi trial](https://arxiv.org/abs/2512.23633)
- **What it means.** B's plan-line check is the Andes and Pyrenees pattern: she writes the line, then picks which valid explanation is hers. The valid lines can be built like a CTAT graph from problem-set.md's plans and `Order:` lines. Pyrenees checks the principle and the equation separately, and her 2.3 miss falls between the two: right plan card, wrong operation. So each plan line could also ask for its sign, or B's typed result per action, with ticket 16's per-sign hints, catches it. [I]

## 3. Granularity of the plan check

- **Each entry at once.** Andes and the Algebra Cognitive Tutor "give feedback immediately after each student step". [V] [VanLehn 2006](https://www.cs.uky.edu/~sgware/reading/papers/vanlehn2006behavior.pdf). Mathspace checks each line on Submit: "If you make a mistake, go back to your latest correct step". [V] [student guide](https://content.govdelivery.com/attachments/VAEDUFCPS/2023/06/05/file_attachments/2516566/FCPS%20Student%20Guide%202023.pdf). That is "you went wrong at line 2".
- **After the whole solution.** Sherlock (adults) speaks up only for safety errors, then "replays the student's solution step-by-step". SQL-Tutor checks "when the student clicks on the Submit button". VanLehn calls delaying feedback as a student nears mastery "one instance of 'fading the scaffolding'". [V] [VanLehn 2006](https://www.cs.uky.edu/~sgware/reading/papers/vanlehn2006behavior.pdf). Photo checkers such as Homiwork read a whole written solution and point at errors. [S] [Homiwork](https://homiwork.com/en/app/check)
- **Timing.** In a programming tutor, immediate feedback was fastest, and immediate, flagged and on-request feedback gave equal test scores. [S] [Corbett & Anderson 2001](https://dl.acm.org/doi/10.1145/365024.365111). Letting students make "reasonable errors" and coaching them to find them gave "better transfer and retention". [V, abstract] [Mathan & Koedinger 2005](https://eric.ed.gov/?id=EJ722521). Both with adults.
- **Grain size.** Tutors that check each step gained about 0.76 SD over no tutoring, those that check only the answer about 0.31. Finer than steps added little: an "interaction plateau". [V] [VanLehn 2011](https://doi.org/10.1080/00461520.2011.611369)
- **What it means.** Action-by-action checks (B, C) are the grain size with evidence. The closed schedule's final-answer check from 3.1 was answer-only. A whole plan checked line by line from 4.1 is the delayed pattern: a recognised fade that still names the wrong line. [I]

## 4. Naming the next step of a routine

- **Solve It!** Its planning step has the self-question "What about the first step in this plan? What about the next step in the plan?" [V] [Özkubat et al. 2020](https://files.eric.ed.gov/fulltext/EJ1262581.pdf). Students learn the seven steps by heart with cue cards, which are then faded. [S] [IRIS](https://iris.peabody.vanderbilt.edu/module/srs/cresource/q2/p07/)
- **Pyrenees** taught a backward strategy explicitly: choose a quantity still sought, then a principle for it. It "closed the gap between high and low learners" in probability and in physics, "where it was not taught". [V, abstract] [Chi & VanLehn 2010](https://eric.ed.gov/?id=EJ880072). The physics tutor didn't enforce the strategy, and the students were at university. [S]
- **Help Tutor** (in the Geometry Cognitive Tutor). Feedback on help seeking improved it, and the gain "transferred to learning new domain-level content during the month following the intervention, while the help-seeking support was no longer in effect". [V, abstract] [Roll et al. 2011](https://eric.ed.gov/?id=EJ908875). A thinking habit can outlast its prompts.
- **Khanmigo** asked "Do you know the first step?", and was criticised in 2024 for asking it whatever the student had written. [V] [Dan Meyer](https://danmeyer.substack.com/p/khanmigo-wants-to-love-kids-but-doesnt). That is a solution step, not a routine step.
- **What it means.** «Який крок далі?» over routine steps has no product precedent. The closest evidence backs choosing what to find next, which B's plan lines already ask. [I]

## 5. Paper work checked step by step

- **ASSISTments.** Scaffold questions are "presented one at a time" after a miss, with the working on paper (fading-apps §1). [V] [Feng & Heffernan](https://web.cs.wpi.edu/~nth/pubs_and_grants/papers/journals/feng_heffernan_JILR.pdf)
- **Zearn.** "Students are prompted to complete problems in their paper Student Notes to transfer their software-based learning, check and correct their work." [V] [grade 5 course guide](https://webassets.zearn.org/resources/G05_Course_Guide_Z1.pdf)
- **On screen, not paper.** Thinkster has a space to show work on each problem, which a tutor reviews. [S] [review](https://cathyduffyreviews.com/homeschool-reviews-core-curricula/math-supplements/math-supplements-for-all-grade-levels/thinkster-math). Mathspace reads handwriting line by line on an iPad. [V] [help](https://help.mathspace.co/student-workbook-part-1-basic-features-mathspace-support)
- **Tutor against paper.** 97 ninth graders practised with a step-checking tutor and on paper. The tutor gave "more than twice the number of eventually-correct practice opportunities" but "did not yield greater learning gains", and "omission errors on paper were associated with lower learning gains". [V, abstract] [Borchers et al. 2023](https://www.xiameng.org/submitted-Camera-Ready-ECTEL-2023-Manuscript.pdf)
- **What it means.** B's "write the action, type its result" is ASSISTments' scaffold made standard. Its gain is that she can't skip an action, or get one wrong, unnoticed. Step checks aren't automatically better than paper, and writing has value of its own. [I]

## 6. Direction or reasonableness check before computing

- **Schema-based instruction** (DISC, 7th grade). "Students estimated an answer" before choosing a method, and later asked "Is the answer reasonable based on my estimate?" From the script: "I know that the answer is less than 24 … So the answer should be less than 12." Teachers "gradually shifted responsibility to the students", but the estimate stays a step. [V] [Jitendra et al. 2015, manuscript](https://files.eric.ed.gov/fulltext/ED572835.pdf)
- **Solve It!** "Predict/estimate the answer" comes before "Compute", and at Compute the student asks whether the answer is "close to my estimate". [V] [Intervention Central](https://www.interventioncentral.org/sites/default/files/pdfs/pdfs_interventions/math_meta_cog_strategy_montague_SAY_ASK_CHECK.pdf)
- **bettermarks'** word-problem guide has students check that the result is sensible with an Überschlag, a rough estimate. [V] [bettermarks](https://de.bettermarks.com/mathe/textaufgaben-loesen/)
- **Illustrative Mathematics, grade 6:** "We don't always have to make calculations to have a sense of what a quotient will be." [V] [IM 6.4.1](https://im.kendallhunt.com/MS/teachers/1/4/1/index.html)
- **A pitfall.** Children's implicit models, such as "multiplication makes bigger", fail when the multiplier or divisor is below 1. [S] [Fischbein et al. 1985](https://doi.org/10.2307/748969)
- **What it means.** The estimate stays to the end in the strategy programs, so ticket 16's direction check can too. Ask about the quantity, as ticket 16 does, and never let "less" stand for "divide": 6th grade has ·0,4 and fractions of a number. [I]

## 7. Length

| Product | Unit | Length | Source |
|---|---|---|---|
| Smartick | daily session | 15 min, to "promote maximum concentration" | [V] [blog](https://www.smartick.com/blog/about-smartick/back-to-school-smartick/) |
| DreamBox | home session | "at least 20-30 minutes", 10+ lessons a week | [V] [parent guide](https://info.discoveryeducation.com/rs/063-SDC-839/images/DreamBox-Overview-ForParents.pdf) |
| Zearn, grade 5 | digital lessons in a 75-min block | about 30 min | [V] [course guide](https://webassets.zearn.org/resources/G05_Course_Guide_Z1.pdf) |
| Zearn, middle school | one digital lesson | about 20 min | [S] [help](https://help.zearn.org/hc/en-us/articles/4403432562071-How-Long-Does-a-Middle-School-Lesson-Take) |
| Khan Academy, grades 3–8 | week | "at least 30 minutes" | [V] [blog](https://blog.khanacademy.org/students-achieve-better-than-projected-gains-in-math-when-they-use-the-personalized-learning-tool-map-accelerator-for-30-minutes-per-week/) |
| Skye | session | 20–30 min | [S] [Third Space Learning](https://thirdspacelearning.com/us/math-tutoring/ai-math-tutor/) |
| Brilliant | lesson | 5–10 min | [V] [help](https://brilliant.org/help/schools-and-educators/how-brilliant-fits-into-a-math-lesson/) |
| Duolingo Math | day | "5 minutes a day" | [S] [Duolingo](https://www.duolingo.com/course/math/Learn-Math) |
| Pirate Math (tutoring, grade 3) | session | 20–30 min, 3 a week | [S] [Evidence for ESSA](https://www.evidenceforessa.org/program/pirate-math/) |
| MATHia, quadratics (high school) | whole workspace | median 21–36 min | [V] [Fancsali et al.](https://par.nsf.gov/servlets/purl/10291624) |

- **Guidance by age.** Smartick says 15–20 minutes is the most children aged 4–14 can concentrate. [S] [Smartick](https://lp.smartick.com/math/). It cites no study, and I found no better-sourced guidance. [I]
- **What it means.** An 8–11-minute triangle is one or two whole app lessons long, and two Level 4 problems fill a typical session. A pause point after each problem matters more than shaving taps. [I]

## Not found

- A product that hands a multi-step word problem over whole with no checks inside the app. The unaided stage was always on paper, read by a person.
- A children's app that asks which routine step comes next, or checks plan lines written on paper.
- A product that checks every paper step's result as standard, not only after a miss.
- An app that asks "more or less than …?" before the operation inside a problem, or fades such a check.
- A published time for one step-supported multi-step word problem at ages 10–12.
- Public detail on step structure in DreamBox, Smartick, Duolingo Math, Mathigon, Photomath or Eedi's quizzes. Bettermarks' step-level feedback I saw only in summaries. [S]

## Limits

- Most sources are product help pages: what a product is meant to do, not what students do with it.
- The step-structure and feedback-timing evidence comes from adults or high-school students. VanLehn 2011 pools many ages.
- Zearn's help centre, IRIS, ACM and Springer blocked automated reading, so those claims are [S].
- Every "What it means" line is my inference. None of it has been tried with her.
