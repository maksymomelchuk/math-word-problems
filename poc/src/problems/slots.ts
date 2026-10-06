/**
 * Problem-set slots, such as `2.3`: level 2, problem 3. Each problem's stage
 * in the fading schedule comes from its slot. No UI code.
 */

const SLOT = /^([1-4])\.([1-9]\d*)$/

/** The level and number of a slot, or null if it isn't one. */
export function parseSlot(id: string): { level: number; number: number } | null {
  const match = SLOT.exec(id)
  return match ? { level: Number(match[1]), number: Number(match[2]) } : null
}

/** Negative, zero or positive, as slot `a` comes before, with or after `b` in the problem set. */
export function compareSlots(a: string, b: string): number {
  const x = parseSlot(a)
  const y = parseSlot(b)
  if (!x || !y) return a.localeCompare(b)
  return x.level - y.level || x.number - y.number
}

/** The items in problem-set order, by their `id`. */
export function sortBySlot<T extends { id: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => compareSlots(a.id, b.id))
}
