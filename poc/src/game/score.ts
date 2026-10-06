/**
 * XP and the daily goal, counted from her own attempts, never stored, so
 * «Стерти записи» resets them and the parent's stage-switch plays don't count.
 * Nothing is ever taken away: a finished problem earns the same however it
 * went, a repeat or a replay included, and a solo success earns no more.
 * Pure, no UI code.
 */
import { ownAttempts } from '../fading/learner'
import type { Progress } from '../lib/progress'

/** XP for every finished problem, however it went. */
export const XP_PER_PROBLEM = 10

/** Her XP: every problem she has finished, repeats and replays included. */
export function xpTotal(progress: Progress): number {
  return ownAttempts(progress).filter((a) => a.finishedAt).length * XP_PER_PROBLEM
}

/** The local calendar day of a time, as `2026-10-04`. */
export function localDay(time: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${time.getFullYear()}-${pad(time.getMonth() + 1)}-${pad(time.getDate())}`
}

/**
 * Today's goal is one finished problem, a repeat or a replay included. Today
 * only: no history, nothing said about another day.
 */
export function goalMetToday(progress: Progress, now = new Date()): boolean {
  const today = localDay(now)
  return ownAttempts(progress).some((a) => a.finishedAt && localDay(new Date(a.finishedAt)) === today)
}
