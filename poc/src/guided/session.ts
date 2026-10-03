/**
 * The problem she has open, saved after every screen, so it picks up where it
 * was if the home-screen app is reloaded (phones close background apps).
 * Only one problem is open at a time.
 */
import { PROGRESS_VERSION, type ProgressStorage } from '../lib/progress'
import type { Notebook } from './flow'

export type Session = {
  version: typeof PROGRESS_VERSION
  problemId: string
  /** The progress attempt this session records into. */
  startedAt: string
  /** The screen she is on. */
  index: number
  notebook: Notebook
}

export const SESSION_KEY = 'word-problem-poc:session'

function browserStorage(): ProgressStorage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

export function loadSession(storage = browserStorage()): Session | null {
  try {
    const raw = storage?.getItem(SESSION_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as Partial<Session>
    if (saved.version === PROGRESS_VERSION && typeof saved.problemId === 'string' && typeof saved.index === 'number' && saved.notebook) return saved as Session
  } catch {
    // corrupt: start over
  }
  return null
}

export function saveSession(session: Session, storage = browserStorage()): void {
  try {
    storage?.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // storage full or blocked: the problem still plays, it just won't resume
  }
}

export function clearSession(storage = browserStorage()): void {
  try {
    storage?.removeItem(SESSION_KEY)
  } catch {
    // nothing to clear
  }
}
