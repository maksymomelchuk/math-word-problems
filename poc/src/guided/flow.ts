/**
 * One guided problem as a list of screens, and the write-up it builds on the
 * way. Pure functions over plain data, so the state can be saved and tested.
 */
import { expression, slotCount } from './checks'
import { numbersIn } from '../problems/numbers'
import { STEP_IDS, type Action, type GuidedProblem, type Sign, type StepGuidance, type StepId, type Writes } from '../problems/types'

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
}

export function emptyNotebook(): Notebook {
  return { record: {}, questionFound: false, labelled: [], diagram: null, plan: null, computed: [], answered: false }
}

/** How the problem runs a step. The one place fading will change. */
export function stepGuidance(problem: GuidedProblem, step: StepId): StepGuidance {
  return problem.guidance?.[step] ?? { mode: 'guided' }
}

/** The plan's slot count as shown, or null when she decides how many actions there are. */
export function shownSlotCount(problem: GuidedProblem): number | null {
  return slotCount(problem.writeUp.plans, problem.guidance?.plan?.hideSlotCount)
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

/**
 * The problem's screens, in order, ending with the closing Розбір. A guided
 * step with no data, such as Порівняння in a problem with no comparison, has
 * no screens. «Чому?» comes right after its step, so it goes when its step
 * does. Обчисли has one screen per action of the plan she picked (the main
 * plan until she has picked one).
 */
export function buildScreens(problem: GuidedProblem, chosen: ChosenPlan | null): Screen[] {
  const screens: Screen[] = []
  for (const step of STEP_IDS) {
    const guidance = stepGuidance(problem, step)
    switch (guidance.mode) {
      case 'guided':
        screens.push(...guidedScreens(problem, step, chosen))
        break
    }
  }
  screens.push({ kind: 'review', step: 'review' })
  return screens
}

/** The routine steps this problem has screens for, for the progress bar. */
export function stepsShown(screens: readonly Screen[]): StepId[] {
  return STEP_IDS.filter((step) => screens.some((s) => s.step === step))
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
    solution = [
      ...(problem.writeUp.unitChanges ?? []).map((change) => change.line),
      ...actions.map((action, position) => {
        const tokens = notebook.computed[position]
        return actionLine(action, position, actions.length, tokens ? splitTokens(tokens) : undefined)
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
