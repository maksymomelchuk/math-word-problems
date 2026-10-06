/**
 * The parent's stage switch, kept on this device apart from her records. While
 * it is on, every problem plays at the chosen stage and step size, and those
 * plays are marked as checks, so they don't move her through the stages.
 */
import type { ProgressStorage } from '../lib/progress'
import type { StageSwitch } from './play'
import { STAGE_IDS } from './stages'

export const STAGE_SWITCH_KEY = 'word-problem-poc:stage-switch'

function browserStorage(): ProgressStorage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

function isStageSwitch(value: unknown): value is StageSwitch {
  if (typeof value !== 'object' || value === null) return false
  const { stage, stepSize } = value as Partial<StageSwitch>
  return (STAGE_IDS as readonly unknown[]).includes(stage) && (stepSize === 'auto' || stepSize === 'small' || stepSize === 'big')
}

/** The switch, or null when problems play at the stage their slot gives them. */
export function loadStageSwitch(storage = browserStorage()): StageSwitch | null {
  try {
    const saved: unknown = JSON.parse(storage?.getItem(STAGE_SWITCH_KEY) ?? 'null')
    return isStageSwitch(saved) ? saved : null
  } catch {
    return null
  }
}

export function saveStageSwitch(value: StageSwitch | null, storage = browserStorage()): void {
  try {
    if (value) storage?.setItem(STAGE_SWITCH_KEY, JSON.stringify(value))
    else storage?.removeItem(STAGE_SWITCH_KEY)
  } catch {
    // storage blocked: the switch lasts until the page reloads
  }
}
