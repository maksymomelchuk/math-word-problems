import type { Label } from '../problems/types'
import { slotWidth, textWidth } from './geometry'

/** Filling slots: which one is picked, which are wrong, and what tapping one does. */
export type SlotControl = {
  selected: string | null
  wrong: readonly string[]
  right: boolean
  onSlot: (slot: string) => void
}

export type SlotState = 'empty' | 'filled' | 'selected' | 'wrong' | 'right'

export function slotState(slot: string, fill: Readonly<Record<string, string>>, control?: SlotControl): SlotState {
  if (control?.right) return 'right'
  if (control?.wrong.includes(slot)) return 'wrong'
  if (control?.selected === slot) return 'selected'
  return fill[slot] ? 'filled' : 'empty'
}

/** The width a label takes, for laying out what comes after it. */
export function labelWidth(label: Label, fill: Readonly<Record<string, string>>): number {
  return typeof label === 'string' ? textWidth(label) : slotWidth(fill[label.slot] || '00')
}
