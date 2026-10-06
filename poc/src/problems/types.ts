/**
 * The data of a guided word problem, following "What each problem needs in
 * the data" in `.scratch/word-problem-poc/assets/guided-flow.md` and the data
 * notes in `fading-schedule.md`.
 *
 * Every problem has its text, its school write-up (with every valid plan),
 * its final answer and its closing screen. The guided-step data is optional,
 * step by step, because a problem only has data for the steps it prompts.
 *
 * This file and `problems.ts` hold no UI code, so the mobile app can reuse
 * them as they are. Numbers are strings written the school's way: `8,4`.
 */

/** The steps of the routine, in order. */
export const STEP_IDS = ['retell', 'asked', 'given', 'decode', 'typeDiagram', 'plan', 'compute', 'answer'] as const
export type StepId = (typeof STEP_IDS)[number]

/** The routine steps' names on screen. */
export const STEP_NAMES: Record<StepId, string> = {
  retell: 'Перекажи',
  asked: 'Знайти',
  given: 'Відомо',
  decode: 'Порівняння',
  typeDiagram: 'Тип і схема',
  plan: 'План',
  compute: 'Обчисли',
  answer: 'Відповідь',
}

/**
 * How a problem runs one step of the routine: prompted on screen (`guided`)
 * or written in her notebook and then checked (`paper`). Each problem's stage
 * comes from its slot (`fading/stages.ts`), so the data normally leaves this out.
 */
export type StepGuidance = {
  mode: 'guided' | 'paper'
}

/** Per-step guidance and built-in hint flags. A step left out is guided, with all its built-in hints. */
export type Guidance = { [S in StepId]?: StepGuidance } & {
  plan?: StepGuidance & {
    /** Hide the number of actions: she decides how many (hidden from 2.5 in the fading schedule). */
    hideSlotCount?: boolean
  }
}

export const PROBLEM_TYPES = [
  { id: 'difference', name: 'На … більше / менше' },
  { id: 'ratio', name: 'У … разів більше / менше' },
  { id: 'partsWhole', name: 'Частини і ціле' },
  { id: 'fraction', name: 'Дріб від числа' },
  { id: 'threeQuantities', name: 'Три величини' },
  { id: 'motion', name: 'Зближення / віддалення' },
] as const
export type ProblemTypeId = (typeof PROBLEM_TYPES)[number]['id']

/** The arithmetic signs, as the school writes them. */
export const SIGNS = ['+', '−', '·', ':'] as const
export type Sign = (typeof SIGNS)[number]

// ---------- always present ----------

/** One piece of the problem text. Joined, the pieces' `text` is the problem. */
export type TextPart = {
  text: string
  /** Makes this piece a number: its id in `steps.given.numbers`. Its digits are Обчисли chips (a fraction m/n gives m and n). */
  number?: string
  /** Part of what the problem asks. Tapping it in Знайти is right. */
  question?: true
  /** The ids of the comparisons (`steps.decode.comparisons`) this piece belongs to, for highlighting. */
  comparisons?: string[]
  /** The ids of the relations (`steps.typeDiagram.relations`) this piece states, highlighted while she names the relation's type. */
  relations?: string[]
}

/**
 * A short-record line, in its final, decoded form. Two tags fill in the paper
 * checks from 3.1 (the data contract with «Write the guided-step data»):
 * `asked` marks the line with the «?» of what the problem asks; `restated`
 * marks a comparison as written from the unknown's side, and `compare` names
 * its two quantities as the «Хто більший: X чи Y?» buttons say them.
 */
export type RecordLine = {
  id: string
  text: string
  tag?: 'asked' | 'restated'
  /** On a `restated` line only: «AC — ?, на 5,1 см більша, ніж BC» has `{ bigger: 'AC', smaller: 'BC' }`. */
  compare?: { bigger: string; smaller: string }
}

/** A unit change: «1 год = 60 хв» opens «Розв'язання», and 60 becomes an Обчисли chip. */
export type UnitChange = { line: string; value: string }

/** One numbered line of «Розв'язання». It has one sign; a sum of several numbers is one action. */
export type Action = {
  /**
   * What the action finds, such as `bc`. The same quantity has the same id
   * in every plan, and the plan cards use these ids.
   */
  id: string
  terms: string[]
  sign: Sign
  result: string
  unit: string
  /** The explanation after the dash: «довжина сторони BC». */
  explanation: string
  /**
   * The plan line's words, where `explanation` would give an answer away
   * before she computes: 3.7's «на стільки більше риби наловив Денис, ніж
   * Марко» names who caught more, so its line reads «на скільки кілограмів
   * один брат наловив більше, ніж інший». Used for the plan-line options and
   * «Підказка»'s model lines; the write-up and the shown action keep
   * `explanation`. Defaults to `explanation`.
   */
  line?: string
  /**
   * The actions (numbered from 1 in this plan) that must come before this
   * one. Defaults to every earlier action. A problem's `Order:` line, such as
   * «1) is independent of 2)», becomes `needs: []` on action 2, and either
   * order is accepted without listing it as a separate plan.
   */
  needs?: number[]
  /** The hint for a wrong action or result. Needed while Обчисли is prompted; it points at the short record, never at an operation. */
  hint?: string
  /**
   * A hint for each wrong sign she can build the action with, replacing `hint`
   * for that sign. Each answers that mistake from the relation or the short
   * record («3 — це не метри, а у скільки разів менше часу»), never as a
   * keyword rule («менше → ділимо» is banned). Given at all, it covers all
   * three wrong signs. The right sign with wrong numbers still gets `hint`.
   */
  signHints?: Partial<Record<Sign, string>>
  /** Why the action is what it is, for this problem's quantities. Said with the answer when Обчисли shows it. */
  reason?: string
  /** Asked before she builds the action. Set for «у … разів» and rate (три величини) actions. */
  direction?: DirectionCheck
}

/** The two answers of a direction check, as her buttons say them. */
export const DIRECTIONS = ['більше', 'менше'] as const
export type Direction = (typeof DIRECTIONS)[number]

/**
 * The direction check before an action: one quick question about its result,
 * answered with «Більше» or «Менше». Not a numeric estimate.
 */
export type DirectionCheck = {
  /** Holds «більше чи менше» and ends with «?»: «За 20 хв він пройде більше чи менше, ніж 3000 м?» */
  question: string
  /** The number in the question that the result is compared with, so the data check can confirm `answer`. */
  comparedWith: string
  answer: Direction
  /** For a wrong pick: points back at the text or the short record. */
  hint: string
  /** Said after the right answer, whether she picked it or it was shown. */
  explain: string
  /** The type of the relation the action works out. The check fades per type once she gets it right twice in a row. Never `fraction`. */
  relationType: ProblemTypeId
}

export type SolutionPlan = { actions: Action[] }

/** One part of the final answer. A two-part question has two, and a part can be a name. */
export type AnswerPart =
  | { kind: 'number'; value: string; unit: string; label?: string }
  | { kind: 'name'; value: string; options: string[]; label?: string }

/** The school write-up: the model for every step, prompted or on paper. */
export type WriteUp = {
  shortRecord: RecordLine[]
  unitChanges?: UnitChange[]
  /** Every valid plan; the first is the main one. Computing follows the one she picks. */
  plans: SolutionPlan[]
  /** «Відповідь: …», a full sentence. */
  answer: string
  /** The final answer, part by part. */
  answerParts: AnswerPart[]
}

/** The closing Розбір. */
export type Review = {
  /** 2–3 checks against the condition. */
  checks: string[]
  keyIdea: string
}

// ---------- guided-step data ----------

/** A menu option. A wrong one carries the hint that points back at the text or the short record. */
export type Option = { text: string; right: true } | { text: string; hint: string }

/**
 * What a settled screen writes into the short record. `writes` puts lines in
 * their final form; `drafts` puts a line in an earlier form that a later step
 * rewrites (an inverted comparison before the decode, a time before its unit change).
 */
export type Writes = {
  writes?: string[]
  drafts?: Record<string, string>
}

/** A pick-one menu screen. */
export type Choice = Writes & {
  title: string
  prompt: string
  options: Option[]
  /** Said after the right answer, whether she picked it or it was shown. */
  explain?: string
}

export type AskedStep = {
  /** The hint when she taps a part of the text that isn't the question. */
  tapHint: string
  /** What exactly is unknown, with its unit, or, when the question hides a relation, what she needs to know. */
  choice: Choice
}

export type GivenNumber = Writes & {
  /** The `TextPart.number` id. */
  number: string
  options: Option[]
  explain?: string
}

export type GivenStep = {
  numbers: GivenNumber[]
  /** Questions about hidden information (a unit change, an omitted reference), asked after the numbers. */
  hidden?: Choice[]
}

export type TwoWay = {
  options: [string, string]
  answer: string
  hint: string
}

/** Decoding one comparison, plain or inverted. */
export type Comparison = Writes & {
  /** The id used in `TextPart.comparisons`. */
  id: string
  /** The comparison as it reads in the problem. */
  sentence: string
  /** «Хто тут більший?» */
  bigger: TwoWay
  /** When the sentence doesn't start from the unknown: said again from the unknown's side. `frame` holds `___` for the blank. */
  flip?: TwoWay & { frame: string }
  explain: string
}

export type DecodeStep = {
  comparisons: Comparison[]
  /** The problem's «Чому?», when its key idea is the decode. Shown only while Порівняння is prompted. */
  why?: Choice
}

export type Relation = {
  /** The relation restated, as the first version of Тип і схема lists it («За 60 хв хлопчик проходить 3000 м»). */
  text: string
  type: ProblemTypeId
  hint: string
  /** The id used in `TextPart.relations`: the problem's own words for it are highlighted in the text. */
  id?: string
  /**
   * The problem's own words for the relation, quoted on its card. Pieces
   * left out are « … »: «Сторона BC … на 5,1 см менша від AC».
   */
  quote?: string
  /** For a relation the text only implies, what it says, under the quote: «Він іде з тією самою швидкістю.» */
  note?: string
}

/** A diagram label: fixed text, or a slot she fills with a chip. */
export type Label = string | { slot: string }

/** Segment bars from one left edge (на, у разів). A chain shares one set of bars. */
export type BarsDiagram = {
  family: 'bars'
  rows: {
    label: string
    pieces: {
      length: number
      /** Drawn in the second colour: the extra piece of a «на … більше» bar. */
      extra?: true
      /** Drawn dashed and empty: the piece a shorter bar lacks, so a «на … менше» comparison needs no second bar. */
      missing?: true
      /** Shown above the piece. */
      label?: Label
    }[]
    /** Shown after the bar's end, usually «?». */
    end?: Label
  }[]
  /** A brace on the right over all the bars, for their sum. */
  total?: Label
}

/** One segment split into parts, with the whole under a brace (частини і ціле, дріб від числа). */
export type PartsDiagram = {
  family: 'parts'
  pieces: {
    length: number
    /** Shaded: the parts a fraction takes. */
    marked?: true
  }[]
  /** Labels above the segment, each over pieces `from`…`to` (0-based, inclusive). Over more than one piece they get a brace. */
  above: { from: number; to?: number; label: Label; caption?: string }[]
  /** The whole, under the brace below the segment. */
  whole: { label: Label; caption?: string }
}

/** A cell of the three-quantity table. `null` is covered by a cell above that spans rows. */
export type TableCell = Label | { text: string; rowSpan: number } | null

/** The швидкість–час–відстань table, or ціна–кількість–вартість, продуктивність–час–робота. */
export type TableDiagram = {
  family: 'table'
  columns: [string, string, string]
  rows: { label: string; cells: [TableCell, TableCell, TableCell] }[]
}

export type Diagram = (BarsDiagram | PartsDiagram | TableDiagram) & {
  /** A caption over this diagram when several are stacked. */
  caption?: string
}

export type DiagramData = {
  title: string
  prompt: string
  /** One diagram, or one per family, stacked, when the problem mixes families. */
  diagrams: Diagram[]
  /** The right chip for each slot. */
  slots: Record<string, string>
  /** The chips she places. Each can go into more than one slot. */
  chips: string[]
  hint: string
  explain?: string
}

export type TypeDiagramStep = {
  /** The relations, listed for her, in solving order. */
  relations: Relation[]
  diagram: DiagramData
}

/** A plan card: what one action finds (`id` is an `Action.id`), or, with a `reason`, the distractor. */
export type Card = { id: string; text: string; reason?: string }

export type PlanStep = {
  /** All cards, in the order she sees them, including the distractor. */
  cards: Card[]
  /** The hint for a wrong order. */
  orderHint: string
  /** The problem's «Чому?», when its key idea is the plan. Shown only while План is prompted. */
  why?: Choice
}

/** Data for the steps a problem prompts. Обчисли needs only the actions' hints. */
export type GuidedSteps = {
  retell?: Choice
  asked?: AskedStep
  given?: GivenStep
  /** Left out when the problem has no comparison, which skips Порівняння. */
  decode?: DecodeStep
  typeDiagram?: TypeDiagramStep
  plan?: PlanStep
  /** The Відповідь menu: three full sentences. */
  answer?: Choice
}

export type GuidedProblem = {
  /** The problem-set slot, such as `2.3`. Also the key of its progress record. */
  id: string
  level: 1 | 2 | 3 | 4
  /** For the parent and the code only. Never shown to her: a story name can give a type away. */
  story: string
  text: TextPart[]
  writeUp: WriteUp
  review: Review
  /** Which steps it prompts and their built-in hints. Left out, every step with data is guided. */
  guidance?: Guidance
  steps: GuidedSteps
}
