/**
 * The fading schedule's stages (`.scratch/word-problem-poc/assets/fading-schedule.md`):
 * which steps the app prompts at each stage, which go to her notebook, and the
 * built-in hints. Each problem's stage comes from its slot, never from which
 * data it carries. Pure data and functions, no UI code.
 */
import { parseSlot } from '../problems/slots'
import { STEP_IDS, type StepId } from '../problems/types'

export const STAGE_IDS = ['1', '2a', '2b', '3', '4a', '4b', '4c'] as const
export type StageId = (typeof STAGE_IDS)[number]

/** How she makes her own plan from 3.1: one action at a time, or the whole plan first. */
export type StepSize = 'small' | 'big'

export type Stage = {
  id: StageId
  /** The slots, as the parent's page names the stage: «3.1–3.8». */
  label: string
  /** The stage's first slot, where its handover screen opens. */
  first: string
  /** The steps the app prompts. Every other step the problem has is a paper step. */
  prompted: readonly StepId[]
  /** The plan cards come without the number of actions (2.5–2.8). */
  hideSlotCount: boolean
  /** She picks each relation's diagram and places the «?» herself (3.x). */
  pickDiagram: boolean
  /** She picks each next step (4.4 on). */
  nextStep: boolean
  /** The solo try is offered at this stage's own slots (4.6, 4.7). */
  solo: boolean
  /** The handover screen at the stage's first slot. The drafts are the schedule's. */
  handover?: string
  /** What changes, for the parent's stage switch. */
  about: string
}

const ALL: readonly StepId[] = STEP_IDS
const LEVEL_2: readonly StepId[] = ['retell', 'asked', 'given', 'decode', 'typeDiagram', 'plan']

export const STAGES: Record<StageId, Stage> = {
  '1': {
    id: '1',
    label: '1.1–1.7',
    first: '1.1',
    prompted: ALL,
    hideSlotCount: false,
    pickDiagram: false,
    nextStep: false,
    solo: false,
    about: 'Усі вісім кроків на екрані. Дію вона складає з чисел і знаків.',
  },
  '2a': {
    id: '2a',
    label: '2.1–2.4',
    first: '2.1',
    prompted: LEVEL_2,
    hideSlotCount: false,
    pickDiagram: false,
    nextStep: false,
    solo: false,
    handover: 'Тепер дії і відповідь ти записуєш у зошит. Яку дію робити — підкажу.',
    about: 'Дії і відповідь — у зошиті. Застосунок називає кожну дію, а результат вона вводить.',
  },
  '2b': {
    id: '2b',
    label: '2.5–2.8',
    first: '2.5',
    prompted: LEVEL_2,
    hideSlotCount: true,
    pickDiagram: false,
    nextStep: false,
    solo: false,
    handover: 'Тепер скільки дій у плані, вирішуєш ти.',
    about: 'Як 2.1–2.4, але без підказки, скільки дій у плані.',
  },
  '3': {
    id: '3',
    label: '3.1–3.8',
    first: '3.1',
    prompted: ['retell', 'asked', 'decode', 'typeDiagram'],
    hideSlotCount: true,
    pickDiagram: true,
    nextStep: false,
    solo: false,
    handover: 'Тепер короткий запис і план ти пишеш у зошит. План — по одній дії, і кожну одразу перевіряємо.',
    about: 'Короткий запис, план, дії і відповідь — у зошиті. План свій, малими або великими кроками. Схему вона вибирає сама і ставить «?».',
  },
  '4a': {
    id: '4a',
    label: '4.1–4.3',
    first: '4.1',
    prompted: ['decode'],
    hideSlotCount: true,
    pickDiagram: false,
    nextStep: false,
    solo: false,
    handover: 'Тепер у зошит ти пишеш усе, крім порівняння. Схему теж малюєш сама.',
    about: 'На екрані лише порівняння. Решта, і схема теж, — у зошиті.',
  },
  '4b': {
    id: '4b',
    label: '4.4–4.5',
    first: '4.4',
    prompted: [],
    hideSlotCount: true,
    pickDiagram: false,
    nextStep: true,
    solo: false,
    handover: 'Тепер і порівняння пишеш у зошит. А який крок далі — обираєш ти.',
    about: 'Усе — у зошиті. Перед кожним кроком вона обирає, який крок далі.',
  },
  '4c': {
    id: '4c',
    label: '4.6–4.7',
    first: '4.6',
    prompted: [],
    hideSlotCount: true,
    pickDiagram: false,
    nextStep: true,
    solo: true,
    handover: 'Тепер можеш спробувати розв\'язати задачу сама. Або, як і раніше, крок за кроком.',
    about: 'Як 4.4–4.5, і на початку вибір: «Крок за кроком» або «Спробую сама».',
  },
}

/** The stage of a problem-set slot, such as `3` for `3.4`. */
export function stageOfSlot(id: string): StageId {
  const slot = parseSlot(id)
  if (!slot) return '1'
  switch (slot.level) {
    case 1:
      return '1'
    case 2:
      return slot.number <= 4 ? '2a' : '2b'
    case 3:
      return '3'
    default:
      if (slot.number <= 3) return '4a'
      return slot.number <= 5 ? '4b' : '4c'
  }
}

/** The later of two stages. A replay runs at the later one: its prompted steps are the overlap of both. */
export function laterStage(a: StageId, b: StageId): StageId {
  return STAGE_IDS.indexOf(a) >= STAGE_IDS.indexOf(b) ? a : b
}

/** The handover text at this slot, if it opens a stage. */
export function handoverAt(id: string): string | undefined {
  const stage = STAGES[stageOfSlot(id)]
  return stage.first === id ? stage.handover : undefined
}

/** The lines when she moves between small and big steps. */
export const STEP_MOVE_LINES: Record<StepSize, string> = {
  big: 'Ти добре складаєш план. Тепер спершу запиши його цілим.',
  small: 'Цього разу — знову по одній дії.',
}

/** How one attempt plays: resolved when the problem opens, and kept with the open problem. */
export type Play = {
  stage: StageId
  /** The steps the app prompts. A prompted step with no data for it is a paper step. */
  prompted: StepId[]
  hideSlotCount: boolean
  pickDiagram: boolean
  nextStep: boolean
  /** «Крок за кроком» or «Спробую сама» first. */
  solo: boolean
  /** Her plan from 3.1: one action at a time, or the whole plan first. */
  stepSize: StepSize
  /** The handover screen opens the problem. */
  handover?: string
  /** She has just moved between small and big steps: its line opens her plan. */
  stepMove?: StepSize
  /** Played from the parent's stage switch: kept apart from her progress through the stages. */
  switched?: boolean
  /** The repeat of a problem she missed. */
  repeat?: boolean
}

/** A play at a stage, with its built-in hints. */
export function playAt(stage: StageId, stepSize: StepSize = 'small', extra: Partial<Play> = {}): Play {
  const s = STAGES[stage]
  return {
    stage,
    prompted: [...s.prompted],
    hideSlotCount: s.hideSlotCount,
    pickDiagram: s.pickDiagram,
    nextStep: s.nextStep,
    solo: s.solo,
    stepSize,
    ...extra,
  }
}

/** Every step prompted, as the guided flow was before fading: for a problem left open before this build, and the parent's «Спробувати». */
export const FULLY_GUIDED: Play = playAt('1')

/**
 * The routine's order at a stage. From 3.1 the decode comes before the short
 * record, because the record holds the comparison as restated from the
 * unknown's side.
 */
export function routineOrder(play: Play): StepId[] {
  if (play.prompted.includes('given')) return [...STEP_IDS]
  return ['retell', 'asked', 'decode', 'given', 'typeDiagram', 'plan', 'compute', 'answer']
}
