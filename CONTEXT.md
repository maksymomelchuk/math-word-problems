# Word Problem Trainer

A game-like trainer that teaches an 11-year-old to read a math word problem, work out what is being asked, and plan the steps, not to do the arithmetic.

## Language

**Word problem**:
A math problem stated in prose that the learner must turn into a sequence of calculations herself.
_Avoid_: Task, exercise, story problem

**Learner**:
The child solving word problems. The first learner is the user's 11-year-old daughter.
_Avoid_: User, player, student

**Problem set**:
The fixed collection of 30 word problems in four levels that the PoC contains, which the learner can loop through.
_Avoid_: Course, lesson pack, curriculum

**Level**:
One of the four consecutive parts of the problem set, each adding one kind of difficulty: one relation, two relations, inverted wording, then chains of three or more.
_Avoid_: Stage, unit, round

**Relation**:
One link between quantities in a word problem, either stated ("BC на 3,7 см більша за AB") or implied by the question ("Обчисли периметр" implies the sides add up to it). A multi-step word problem contains several relations.
_Avoid_: Condition, clue, fact

**Problem type**:
The kind of a relation, such as a difference comparison or a rate. The learner names the type of each relation, not of the whole word problem. A type is not an operation: the same type can need addition or subtraction. The six types are На … більше / менше, У … разів більше / менше, Частини і ціле, Дріб від числа, Три величини, and Зближення / віддалення.
_Avoid_: Problem category, topic, schema

**Inverted wording**:
A comparison stated from the known quantity, so its word clashes with the operation: in "12,4 дм, що на 3,8 дм менше від другої сторони" the second side is 12,4 + 3,8. The school calls it непряма форма.
_Avoid_: Trap, inconsistent language, "less by" trap

**Routine**:
The fixed sequence of steps the learner goes through for every word problem: retell, asked, given, decode, type and diagram, plan, compute, answer. It is what she should end up doing on paper on her own.
_Avoid_: Method, algorithm, procedure

**Decode**:
The routine step of reading a comparison by first deciding who is bigger, then restating inverted wording from the unknown's side ("BC на 5,1 см менша від AC" becomes "AC на 5,1 см більша, ніж BC").
_Avoid_: Translate, flip, rephrase

**Short record**:
The lines written before the solution that list the problem's quantities, with «?» on each unknown and each comparison stated from the unknown's side. The school calls it короткий запис; her teacher requires it.
_Avoid_: Summary, condition, notes

**Action**:
One numbered line of the solution: a calculation, its unit and its explanation, as in «1) 8,4 + 3,7 = 12,1 (см) — довжина сторони BC;». The school calls it дія.
_Avoid_: Step (reserved for the routine), operation

**Plan**:
The ordered list of what each action finds (the explanations after the dashes), each line decided before its action is calculated. A word problem can have more than one valid plan.
_Avoid_: Strategy, solution path

**Direction check**:
A question before an action: will its result be more or less than a number she already knows? She answers it from what the relation means, never from a word. The school calls it прикидка.
_Avoid_: Estimate (a numeric guess, dropped from the routine), sign rule

**Write-up**:
The full written solution as her school expects it: the short record, then «Розв'язання» as numbered actions, then «Відповідь» as a full sentence.
_Avoid_: Solution format, notebook entry

**Guided problem**:
A word problem in the PoC in which the app prompts and checks steps of the routine.
_Avoid_: Tutorial, walkthrough, worked example (a worked example is shown in full, not prompted)

**Paper step**:
A routine step the app no longer prompts: the learner writes that part of the write-up in her notebook, and the app checks it before the next step opens, by what she types or picks or, where it can't, by yes/no questions beside its model.
_Avoid_: Faded step, offline step, unguided step

**Fading**:
The gradual handing-over of routine steps from the app to the learner across the problem set: the app stops prompting a step but keeps checking it, ending with her writing every step on paper and choosing the next one herself.
_Avoid_: Scaffolding, difficulty ramp (difficulty comes from the levels)

**Solo try**:
An optional way to play one of the last problems: the whole problem at once in her notebook, with a switch to step by step at any time. Step by step stays the default.
_Avoid_: Test, unaided mode, challenge

**Verdict**:
The two-part outcome of the PoC: *does it help* (judged by the parent, from what they know of her abilities before and after the trial) and *is it interesting* (judged by the learner's own opinion).
_Avoid_: Result, evaluation
