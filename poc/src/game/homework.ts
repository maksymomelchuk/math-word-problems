/**
 * Her homework on the home screen: which problems show in the top bar and how
 * each stands. Homework is off the path, so none of it is ever locked. Pure,
 * no UI code.
 */
import { isFinished } from '../fading/loop'
import type { Progress } from '../lib/progress'
import type { Homework } from '../problems/types'

/** Not opened yet (or not finished), open now, or solved at least once. */
export type HomeworkState = 'new' | 'open' | 'done'

/** How long a solved problem stays on her home screen. */
const RECENT_DAYS = 7
/** At most this many rows in the top bar; the rest are on the homework page. */
export const SHOWN_MAX = 2

export function homeworkState(progress: Progress, openId: string | null, id: string): HomeworkState {
  if (openId === id) return 'open'
  return isFinished(progress, id) ? 'done' : 'new'
}

function daysSince(day: string, now: Date): number {
  const [y, m, d] = day.split('-').map(Number)
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return (today - Date.UTC(y, m - 1, d)) / 86_400_000
}

/**
 * The rows in her top bar, from `homework` (newest first): the unsolved ones,
 * then the ones solved that were added in the last week, at most `SHOWN_MAX`.
 */
export function homeworkShown(progress: Progress, homework: readonly Homework[], openId: string | null, now = new Date()): Homework[] {
  const solved = (h: Homework) => homeworkState(progress, openId, h.problem.id) === 'done'
  const unsolved = homework.filter((h) => !solved(h))
  const recent = homework.filter((h) => solved(h) && daysSince(h.added, now) < RECENT_DAYS)
  return [...unsolved, ...recent].slice(0, SHOWN_MAX)
}
