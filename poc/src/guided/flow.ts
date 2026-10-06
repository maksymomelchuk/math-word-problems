/**
 * One problem as a list of screens, and the write-up it builds on the way.
 * Pure functions over plain data, so the state can be saved and tested. How a
 * problem plays (which steps are prompted, which go to her notebook) comes
 * from its `Play`, resolved from its slot in `../fading/`.
 */
import { expression, slotCount } from './checks'
import { numbersIn } from '../problems/numbers'
import { biggerQuestions } from '../fading/paperChecks'
import { planComplete } from '../fading/plan'
import { FULLY_GUIDED, routineOrder, type Play } from '../fading/stages'
import { STEP_IDS, type Action, type GuidedProblem, type Sign, type StepGuidance, type StepId, type Writes } from '../problems/types'

/** The paper steps with a screen of their own: a heading, «Готово», then that part's check. */
export type PaperStep = 'retell' | 'asked' | 'given' | 'decode' | 'typeDiagram' | 'answer'

export type Screen =
  | { kind: 'retell'; step: 'retell' }
  | { kind: 'askedTap'; step: 'asked' }
  | { kind: 'askedChoice'; step: 'asked' }
  /** Labelling the `nth` number she taps (0-based). */
  | { kind: 'given'; step: 'given'; nth: number }
  | { kind: 'hidden'; step: 'given'; index: number }
  | { kind: 'decode'; step: 'decode'; index: number; stage: 'bigger' | 'flip' }
  /** «Чому?», recorded against the step it follows. */
  | { kind: 'why'; step: 'decode' | 'plan' }
  | { kind: 'types'; step: 'typeDiagram' }
  | { kind: 'diagram'; step: 'typeDiagram' }
  | { kind: 'plan'; step: 'plan' }
  /** The action at `position` in the order she planned. */
  | { kind: 'compute'; step: 'compute'; position: number }
  | { kind: 'answer'; step: 'answer' }
  /** A new stage starts with this problem. */
  | { kind: 'handover'; step: 'start' }
  /** «Крок за кроком» or «Спробую сама». */
  | { kind: 'soloChoice'; step: 'start' }
  /** The solo try: the whole write-up in her notebook, then the final answer. */
  | { kind: 'solo'; step: 'start' }
  /** «Який крок далі?» before `step` (4.4 on). */
  | { kind: 'nextStep'; step: StepId }
  | { kind: 'paper'; step: PaperStep }
  /** Big steps: the whole plan in her notebook, then how many actions it has. */
  | { kind: 'planWhole'; step: 'plan' }
  /** Her plan line `line` (0-based): written first in small steps, then picked. */
  | { kind: 'planLine'; step: 'plan'; line: number; big: boolean }
  /** An action on paper: its direction check, then its typed result. `withPlan`: in small steps, right after its plan line. */
  | { kind: 'paperCompute'; step: 'compute'; position: number; withPlan?: true }
  | { kind: 'review'; step: 'review' }

/** The plan she picked: which valid plan, and its action indexes in her order. */
export type ChosenPlan = { plan: number; order: number[] }

/** What the screens have settled so far. Plain data, so it can be saved. */
export type Notebook = {
  /** Short-record lines by id, as written so far. */
  record: Record<string, string>
  questionFound: boolean
  /** Number ids labelled in Відомо, in the order she did them. */
  labelled: string[]
  /** The filled diagram slots, once the diagram is done. */
  diagram: Record<string, string> | null
  plan: ChosenPlan | null
  /** The action she built for each position of her plan, as chip tokens. */
  computed: string[][]
  answered: boolean
  /** Her own plan from 3.1: the action ids of her lines so far. `plan` follows them. */
  lines?: string[]
  /** The solo try: her choice, then how it went (`right`, or `switched` to step by step). */
  solo?: 'steps' | 'solo' | 'right' | 'switched'
}

export function emptyNotebook(): Notebook {
  return { record: {}, questionFound: false, labelled: [], diagram: null, plan: null, computed: [], answered: false }
}

/** True if the problem has the data to prompt this step. Обчисли needs only the actions, which every problem has. */
export function hasGuidedData(problem: GuidedProblem, step: StepId): boolean {
  const { steps } = problem
  switch (step) {
    case 'retell':
      return !!steps.retell
    case 'asked':
      return !!steps.asked
    case 'given':
      return !!steps.given
    case 'decode':
      return !!steps.decode?.comparisons.length
    case 'typeDiagram':
      return !!steps.typeDiagram
    case 'plan':
      return !!steps.plan
    case 'compute':
      return true
    case 'answer':
      return !!steps.answer
  }
}

/** How the problem runs a step at this play: prompted when its stage prompts it and the data covers it, else on paper. */
export function stepGuidance(problem: GuidedProblem, step: StepId, play: Play = FULLY_GUIDED): StepGuidance {
  return { mode: play.prompted.includes(step) && hasGuidedData(problem, step) ? 'guided' : 'paper' }
}

/** The plan's slot count as shown, or null when she decides how many actions there are. */
export function shownSlotCount(problem: GuidedProblem, play: Play = FULLY_GUIDED): number | null {
  return slotCount(problem.writeUp.plans, play.hideSlotCount || problem.guidance?.plan?.hideSlotCount)
}

function guidedScreens(problem: GuidedProblem, step: StepId, chosen: ChosenPlan | null): Screen[] {
  const { steps } = problem
  switch (step) {
    case 'retell':
      return steps.retell ? [{ kind: 'retell', step }] : []
    case 'asked':
      return steps.asked
        ? [
            { kind: 'askedTap', step },
            { kind: 'askedChoice', step },
          ]
        : []
    case 'given':
      return steps.given
        ? [
            ...steps.given.numbers.map((_, nth): Screen => ({ kind: 'given', step, nth })),
            ...(steps.given.hidden ?? []).map((_, index): Screen => ({ kind: 'hidden', step, index })),
          ]
        : []
    case 'decode':
      if (!steps.decode?.comparisons.length) return []
      return [
        ...steps.decode.comparisons.flatMap((comparison, index): Screen[] => [
          { kind: 'decode', step, index, stage: 'bigger' },
          ...(comparison.flip ? [{ kind: 'decode', step, index, stage: 'flip' } as const] : []),
        ]),
        ...(steps.decode.why ? [{ kind: 'why', step } as const] : []),
      ]
    case 'typeDiagram':
      return steps.typeDiagram
        ? [
            { kind: 'types', step },
            { kind: 'diagram', step },
          ]
        : []
    case 'plan':
      return steps.plan ? [{ kind: 'plan', step }, ...(steps.plan.why ? [{ kind: 'why', step } as const] : [])] : []
    case 'compute':
      return problem.writeUp.plans[chosen?.plan ?? 0].actions.map((_, position): Screen => ({ kind: 'compute', step, position }))
    case 'answer':
      return steps.answer ? [{ kind: 'answer', step }] : []
  }
}

/** Her plan lines' screens: in small steps each line with its action, in big steps the whole plan, its count, then the lines. */
function ownPlanScreens(problem: GuidedProblem, play: Play, lines: readonly string[]): Screen[] {
  const done = planComplete(problem.writeUp.plans, lines)
  const picked = lines.map((_, line) => line)
  const pending = done ? [] : [lines.length]
  if (play.stepSize === 'big') {
    return [{ kind: 'planWhole', step: 'plan' }, ...[...picked, ...pending].map((line): Screen => ({ kind: 'planLine', step: 'plan', line, big: true }))]
  }
  return [
    ...picked.flatMap((line): Screen[] => [
      { kind: 'planLine', step: 'plan', line, big: false },
      { kind: 'paperCompute', step: 'compute', position: line, withPlan: true },
    ]),
    ...pending.map((line): Screen => ({ kind: 'planLine', step: 'plan', line, big: false })),
  ]
}

function paperScreens(problem: GuidedProblem, step: StepId, play: Play, chosen: ChosenPlan | null, lines: readonly string[]): Screen[] {
  switch (step) {
    case 'retell':
    case 'asked':
    case 'given':
    case 'answer':
      return [{ kind: 'paper', step }]
    case 'decode':
      return biggerQuestions(problem).length ? [{ kind: 'paper', step }] : []
    case 'typeDiagram':
      return problem.steps.typeDiagram ? [{ kind: 'paper', step }] : []
    case 'plan':
      return ownPlanScreens(problem, play, lines)
    case 'compute': {
      const plan = problem.writeUp.plans[chosen?.plan ?? 0]
      if (stepGuidance(problem, 'plan', play).mode === 'guided') return plan.actions.map((_, position): Screen => ({ kind: 'paperCompute', step, position }))
      if (play.stepSize === 'big' && planComplete(problem.writeUp.plans, lines)) return lines.map((_, position): Screen => ({ kind: 'paperCompute', step, position }))
      return []
    }
  }
}

/**
 * The problem's screens, in order, ending with the closing Розбір. Each step
 * is prompted or on paper, as the play says; a step with nothing to do, such as
 * Порівняння in a problem with no comparison, has no screens. «Чому?» comes
 * right after its step, so it goes when its step does. Without a play, every
 * step is prompted, as before fading.
 *
 * The list grows as she goes: her own plan adds a line at a time, and the
 * solo try adds the steps only if she switches to them. Screens before the
 * one she is on never change.
 */
export function buildScreens(problem: GuidedProblem, chosen: ChosenPlan | null, play: Play = FULLY_GUIDED, notebook: Partial<Notebook> = {}): Screen[] {
  const screens: Screen[] = []
  const review: Screen = { kind: 'review', step: 'review' }
  if (play.solo) {
    screens.push({ kind: 'soloChoice', step: 'start' })
    const { solo } = notebook
    if (!solo) return screens
    if (solo !== 'steps') screens.push({ kind: 'solo', step: 'start' })
    if (solo === 'solo') return screens
    if (solo === 'right') return [...screens, review]
  } else if (play.handover) screens.push({ kind: 'handover', step: 'start' })

  const lines = notebook.lines ?? []
  for (const step of routineOrder(play)) {
    const group = stepGuidance(problem, step, play).mode === 'guided' ? guidedScreens(problem, step, chosen) : paperScreens(problem, step, play, chosen, lines)
    if (!group.length) continue
    if (play.nextStep) screens.push({ kind: 'nextStep', step })
    screens.push(...group)
  }
  screens.push(review)
  return screens
}

/** True if the problem has this step at this play, whether prompted or on paper: Порівняння is missing when there's no comparison. */
export function hasStep(problem: GuidedProblem, step: StepId, play: Play): boolean {
  if (stepGuidance(problem, step, play).mode === 'guided') return guidedScreens(problem, step, null).length > 0
  if (step === 'decode') return biggerQuestions(problem).length > 0
  if (step === 'typeDiagram') return !!problem.steps.typeDiagram
  return true
}

/** The steps this play prompts, as her attempt records them. */
export function promptedSteps(problem: GuidedProblem, play: Play): StepId[] {
  return STEP_IDS.filter((step) => stepGuidance(problem, step, play).mode === 'guided' && guidedScreens(problem, step, null).length > 0)
}

/** The progress bar's segment for a screen: in small steps an action belongs to the plan, as she plans and computes together. */
export function segmentOf(screen: Screen): StepId | 'review' | 'start' {
  return screen.kind === 'paperCompute' && screen.withPlan ? 'plan' : screen.step
}

/** The routine steps this problem has screens for, in the order she meets them, for the progress bar. */
export function stepsShown(screens: readonly Screen[]): StepId[] {
  const steps: StepId[] = []
  for (const screen of screens) {
    const step = segmentOf(screen)
    if (step !== 'review' && step !== 'start' && !steps.includes(step)) steps.push(step)
  }
  return steps
}

/** The notebook after a screen settles with these writes: drafts first, then final lines from the short record. */
export function applyWrites(problem: GuidedProblem, record: Record<string, string>, writes: Writes): Record<string, string> {
  const next = { ...record, ...writes.drafts }
  for (const id of writes.writes ?? []) {
    const line = problem.writeUp.shortRecord.find((l) => l.id === id)
    if (line) next[id] = line.text
  }
  return next
}

/**
 * The notebook after a prompted screen settles, at this play. Once she writes
 * the short record herself (3.1 on), the prompted steps before it don't write
 * its lines for her: the model goes in after her own record is checked.
 */
export function writesAt(problem: GuidedProblem, play: Play, record: Record<string, string>, writes: Writes): Record<string, string> {
  return stepGuidance(problem, 'given', play).mode === 'guided' ? applyWrites(problem, record, writes) : record
}

// ---------- the write-up ----------

/** The actions of the chosen plan, in her order. */
export function plannedActions(problem: GuidedProblem, chosen: ChosenPlan): Action[] {
  const { actions } = problem.writeUp.plans[chosen.plan]
  return chosen.order.map((index) => actions[index])
}

/**
 * An action line: «1) 8,4 + 3,7 = 12,1 (см) — довжина сторони BC;». Without
 * `built`, the plan's skeleton, as on paper: «1) … — довжина сторони BC;».
 */
export function actionLine(action: Action, position: number, count: number, built?: { terms: string[]; sign: Sign }): string {
  const end = position === count - 1 ? '.' : ';'
  const calculation = built ? `${expression(built.terms, built.sign)} = ${action.result} (${action.unit})` : '…'
  return `${position + 1}) ${calculation} — ${action.explanation}${end}`
}

/** A built action's chip tokens, split into terms and its sign. */
export function splitTokens(tokens: readonly string[]): { terms: string[]; sign: Sign } {
  return { terms: tokens.filter((_, i) => i % 2 === 0), sign: tokens[1] as Sign }
}

export type WriteUpSoFar = {
  record: string[]
  /** «Розв'язання» lines, once she has a plan. */
  solution: string[] | null
  answer: string | null
}

/** The write-up as far as the notebook goes, exactly as on paper. */
export function writeUpSoFar(problem: GuidedProblem, notebook: Notebook): WriteUpSoFar {
  const record = problem.writeUp.shortRecord.flatMap((line) => (notebook.record[line.id] ? [notebook.record[line.id]] : []))
  let solution: string[] | null = null
  if (notebook.plan) {
    const actions = plannedActions(problem, notebook.plan)
    // Her own plan grows a line at a time: only the plan's last action ends with «.».
    const count = problem.writeUp.plans[notebook.plan.plan].actions.length
    solution = [
      ...(problem.writeUp.unitChanges ?? []).map((change) => change.line),
      ...actions.map((action, position) => {
        const tokens = notebook.computed[position]
        return actionLine(action, position, count, tokens ? splitTokens(tokens) : undefined)
      }),
    ]
  }
  return { record, solution, answer: notebook.answered ? problem.writeUp.answer : null }
}

/** A plan written out in full, in its own order: for the other plan on the closing screen. */
export function planLines(problem: GuidedProblem, plan: number): string[] {
  const { actions } = problem.writeUp.plans[plan]
  return actions.map((action, position) => actionLine(action, position, actions.length, action))
}

/** The Обчисли chips: the text's numbers, any unit change, then earlier results. Each value once. */
export function numberChips(problem: GuidedProblem, results: readonly string[]): string[] {
  const values = [
    ...problem.text.flatMap((part) => (part.number ? numbersIn(part.text) : [])),
    ...(problem.writeUp.unitChanges ?? []).map((change) => change.value),
    ...results,
  ]
  return [...new Set(values)]
}
