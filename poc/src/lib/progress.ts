/**
 * The learner's progress, saved in localStorage on this device only.
 *
 * Each problem keeps a list of attempts. An attempt records, against each
 * step of the routine, every hint she got, every answer that was shown, and
 * every arithmetic slip, each with its time, so later tickets can count
 * streaks or daily limits and fading can read how a step went. Saved data from
 * an older version is dropped on load, so a PoC device starts over cleanly.
 */
import type { Direction, ProblemTypeId, Sign, StepId } from '../problems/types'

export const PROGRESS_VERSION = 2

/** One wrong try on a screen of the routine. */
export type HelpEvent = {
  /** When it happened, as an ISO 8601 time. */
  at: string
  step: StepId
  /**
   * Which part of the step: `why` for «Чому?», `question` for tapping the
   * question and `unknown` for what exactly is unknown in Знайти, a number
   * id or `hidden-N` in Відомо, a comparison id (`-flip` for saying it from
   * the unknown's side) in Порівняння, `types` (all relations at once),
   * `type-N` (relation N alone; `-family` for «Що тут є?») or `diagram` in Тип і схема,
   * an action id in Обчисли (`-direction` for the «більше чи менше» check
   * before it). Left out when the step has one part.
   */
  part?: string
  /** What she got: a hint (first wrong try) or the answer shown (second). */
  help: 'hint' | 'shown'
  /** The action was right but its result wasn't: an arithmetic slip, kept apart from other mistakes. */
  slip?: true
  /** In Обчисли, the wrong sign she built the action with. */
  sign?: Sign
  /** In Тип і схема, the version of the step she saw (see `guided/typeStep/variants.ts`). */
  variant?: string
}

/**
 * One record of a paper step or of the fading, kept per attempt alongside the
 * guided steps' hints (ticket «Build the paper steps and the fading schedule»).
 * `step` is the routine step, or `start` for the solo try and the step size.
 * A try that ends with the answer shown has `shown`.
 */
export type LogEvent = { at: string; step: StepId | 'start' } & (
  /** «Підказка» on a paper step: the self-question (tap 1) or the model (tap 2). */
  | { kind: 'hint'; tap: 1 | 2; part?: string }
  /** A plan line pick: an action id, or `other` for «Інше». `line` counts from 0. */
  | { kind: 'planLine'; line: number; picked: string; right: boolean; shown?: true }
  /** «Скільки дій у твоєму плані?» in big steps. */
  | { kind: 'actionCount'; value: string; right: boolean; shown?: true }
  /** A typed result, with the wrong sign it came from, if any. `relationType` is the action's direction check's. */
  | { kind: 'result'; line: number; action: string; value: string; right: boolean; sign?: Sign; relationType?: ProblemTypeId; shown?: true }
  /** «У тебе така сама дія?» after a result was shown: a slip, or another action. */
  | { kind: 'sameAction'; line: number; action: string; slip: boolean }
  /** A direction-check answer on paper. `viaHint`: asked from «Підказка» after the check had faded. */
  | { kind: 'direction'; line: number; action: string; relationType: ProblemTypeId; picked: Direction; right: boolean; viaHint?: true; shown?: true }
  /** The direction check stopped (`faded`) or came back for a type. */
  | { kind: 'fade'; relationType: ProblemTypeId; faded: boolean }
  /** «Який крок далі?»: her pick, and the step that was due. */
  | { kind: 'nextStep'; picked: StepId; due: StepId; right: boolean; missing?: true }
  /** A yes/no self-check beside a model (`fading/paperChecks.ts` names them). */
  | { kind: 'selfCheck'; check: string; yes: boolean }
  /** «Яка схема в тебе?»: the sketches she picked. */
  | { kind: 'diagramPick'; picked: string[]; right: boolean; shown?: true }
  /** «Хто більший: X чи Y?» for the restated line `line`. */
  | { kind: 'bigger'; line: string; picked: string; right: boolean; shown?: true }
  /** A name part of the answer (3.7). */
  | { kind: 'name'; picked: string; right: boolean; shown?: true }
  /** The solo try: her choice at the start. */
  | { kind: 'solo'; choice: 'steps' | 'solo' }
  /** The final answer she typed in the solo try. */
  | { kind: 'soloAnswer'; value: string; right: boolean }
  /** She went step by step after a wrong solo answer, or tapped «Розбий на кроки». */
  | { kind: 'soloSwitch'; reason: 'wrong' | 'break' }
  /** She moved between small and big steps for her plan. */
  | { kind: 'stepSize'; size: 'small' | 'big' }
)

/** A log event before it's stamped with its time. */
export type LogEventInput = WithoutTime<LogEvent>
type WithoutTime<E> = E extends unknown ? Omit<E, 'at'> : never

export type Attempt = {
  /** When she opened the problem. Also identifies the attempt. */
  startedAt: string
  /** When she reached the closing Розбір. Missing while unfinished. */
  finishedAt?: string
  /** The routine steps the problem prompted this time. */
  prompted: StepId[]
  /** The index of the valid plan she followed, once she has one. */
  plan?: number
  /** The version of a step she saw, for steps the parent can switch: `{ typeDiagram: 'pictures' }`. Set when she reaches the step. */
  variants?: Partial<Record<StepId, string>>
  events: HelpEvent[]
  /** The fading stage it played at (`fading/stages.ts`), such as `3`. */
  stage?: string
  /** Her plan's step size, when she made her own plan. */
  stepSize?: 'small' | 'big'
  /** Played from the parent's stage switch: a check, kept out of her progress through the stages. */
  switched?: true
  /** The repeat of a problem she missed. */
  repeat?: true
  /** The paper steps' and the fading's records, in order. */
  log?: LogEvent[]
}

/** What an attempt notes about how it plays, when it starts. */
export type AttemptInfo = Pick<Attempt, 'stage' | 'stepSize' | 'switched' | 'repeat'>

export type ProblemRecord = {
  attempts: Attempt[]
}

/**
 * The game layer's own state (ticket «Build the game layer»): the level-end
 * and set-end screens she has seen, so each shows once. XP and the daily goal
 * aren't stored: they're counted from the attempts (`game/score.ts`).
 */
export type GameState = {
  /** The levels whose level-end screen she has seen. */
  levelEnds?: number[]
  /** She has seen the set-end screen. */
  setEnd?: true
}

export type Progress = {
  version: typeof PROGRESS_VERSION
  /** Records keyed by problem id (the problem-set slot, such as `2.3`). */
  problems: Record<string, ProblemRecord>
  /** Added with the game layer. Missing in records saved before it. */
  game?: GameState
}

export const STORAGE_KEY = 'word-problem-poc:progress'

/** The subset of the Web Storage API used here, so tests can pass a fake. */
export type ProgressStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function emptyProgress(): Progress {
  return { version: PROGRESS_VERSION, problems: {} }
}

function browserStorage(): ProgressStorage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null // access can throw when storage is blocked
  }
}

/** The saved progress, or empty progress if nothing valid is saved. */
export function loadProgress(storage = browserStorage()): Progress {
  try {
    const raw = storage?.getItem(STORAGE_KEY)
    if (!raw) return emptyProgress()
    const saved: unknown = JSON.parse(raw)
    if (isProgress(saved)) return saved
  } catch {
    // unreadable or corrupt: fall through to a clean start
  }
  return emptyProgress()
}

/** Saves progress. Returns false if the device refused (storage full or blocked). */
export function saveProgress(progress: Progress, storage = browserStorage()): boolean {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(progress))
    return storage !== null
  } catch {
    return false
  }
}

export function resetProgress(storage = browserStorage()): void {
  try {
    storage?.removeItem(STORAGE_KEY)
  } catch {
    // nothing saved that we can reach
  }
}

function isProgress(value: unknown): value is Progress {
  if (typeof value !== 'object' || value === null) return false
  const { version, problems } = value as Partial<Progress>
  return version === PROGRESS_VERSION && typeof problems === 'object' && problems !== null && !Array.isArray(problems)
}

// ---------- recording ----------

/** Progress with a new, unfinished attempt at a problem. */
export function withAttemptStarted(progress: Progress, problemId: string, startedAt: string, prompted: StepId[], info: AttemptInfo = {}): Progress {
  const record = progress.problems[problemId] ?? { attempts: [] }
  return {
    ...progress,
    problems: { ...progress.problems, [problemId]: { attempts: [...record.attempts, { startedAt, prompted, events: [], ...info }] } },
  }
}

/** Progress with one attempt changed. Unknown attempts are left alone. */
export function withAttempt(progress: Progress, problemId: string, startedAt: string, change: (attempt: Attempt) => Attempt): Progress {
  const record = progress.problems[problemId]
  if (!record?.attempts.some((attempt) => attempt.startedAt === startedAt)) return progress
  const attempts = record.attempts.map((attempt) => (attempt.startedAt === startedAt ? change(attempt) : attempt))
  return { ...progress, problems: { ...progress.problems, [problemId]: { attempts } } }
}

/** Loads, changes and saves the progress in one go. */
export function updateProgress(change: (progress: Progress) => Progress, storage = browserStorage()): boolean {
  return saveProgress(change(loadProgress(storage)), storage)
}

export function startAttempt(problemId: string, prompted: StepId[], now = new Date(), storage = browserStorage(), info: AttemptInfo = {}): string {
  const startedAt = now.toISOString()
  updateProgress((progress) => withAttemptStarted(progress, problemId, startedAt, prompted, info), storage)
  return startedAt
}

/** Adds a paper step's or the fading's record to an attempt. */
export function withLog(progress: Progress, problemId: string, startedAt: string, event: LogEvent): Progress {
  return withAttempt(progress, problemId, startedAt, (attempt) => ({ ...attempt, log: [...(attempt.log ?? []), event] }))
}

export function recordLog(problemId: string, startedAt: string, event: LogEvent, storage = browserStorage()): void {
  updateProgress((progress) => withLog(progress, problemId, startedAt, event), storage)
}

export function recordHelp(problemId: string, startedAt: string, event: HelpEvent, storage = browserStorage()): void {
  updateProgress((progress) => withAttempt(progress, problemId, startedAt, (attempt) => ({ ...attempt, events: [...attempt.events, event] })), storage)
}

export function recordPlan(problemId: string, startedAt: string, plan: number, storage = browserStorage()): void {
  updateProgress((progress) => withAttempt(progress, problemId, startedAt, (attempt) => ({ ...attempt, plan })), storage)
}

/** Notes which version of a step she saw in this attempt. */
export function recordVariant(problemId: string, startedAt: string, step: StepId, variant: string, storage = browserStorage()): void {
  updateProgress(
    (progress) => withAttempt(progress, problemId, startedAt, (attempt) => ({ ...attempt, variants: { ...attempt.variants, [step]: variant } })),
    storage,
  )
}

export function finishAttempt(problemId: string, startedAt: string, now = new Date(), storage = browserStorage()): void {
  updateProgress(
    (progress) => withAttempt(progress, problemId, startedAt, (attempt) => (attempt.finishedAt ? attempt : { ...attempt, finishedAt: now.toISOString() })),
    storage,
  )
}

/** True if any attempt at the problem reached the Розбір. */
export function isSolved(progress: Progress, problemId: string): boolean {
  return progress.problems[problemId]?.attempts.some((attempt) => attempt.finishedAt) ?? false
}

// ---------- the game layer ----------

/** Progress with a level's level-end screen seen. */
export function withLevelEndSeen(progress: Progress, level: number): Progress {
  const seen = progress.game?.levelEnds ?? []
  return seen.includes(level) ? progress : { ...progress, game: { ...progress.game, levelEnds: [...seen, level] } }
}

/** Progress with the set-end screen seen. It closes the last level too. */
export function withSetEndSeen(progress: Progress, lastLevel: number): Progress {
  const closed = withLevelEndSeen(progress, lastLevel)
  return { ...closed, game: { ...closed.game, setEnd: true } }
}

export function recordLevelEndSeen(level: number, storage = browserStorage()): void {
  updateProgress((progress) => withLevelEndSeen(progress, level), storage)
}

export function recordSetEndSeen(lastLevel: number, storage = browserStorage()): void {
  updateProgress((progress) => withSetEndSeen(progress, lastLevel), storage)
}
