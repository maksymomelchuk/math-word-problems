/** Shared drawing helpers for the diagrams, in SVG user units. */

export const VIEW_WIDTH = 340
export const SLOT_HEIGHT = 30
/** A slot's tap height: 44 px or more even where a phone draws the 340-unit diagram a little smaller. */
export const SLOT_HIT = 46

/** A rough width for text in the diagrams' 15-unit font. */
export function textWidth(text: string): number {
  return Math.ceil(text.length * 8.6)
}

export function slotWidth(value: string): number {
  return Math.max(48, textWidth(value) + 18)
}

/** A curly brace below a span (tip down), or above it with `up`. */
export function horizontalBrace(x1: number, x2: number, y: number, depth: number, up = false): string {
  const d = Math.min(depth, (x2 - x1) / 2)
  const s = up ? -1 : 1
  const mid = (x1 + x2) / 2
  const h = d / 2
  return [
    `M ${x1} ${y}`,
    `q 0 ${s * h} ${h} ${s * h}`,
    `L ${mid - h} ${y + s * h}`,
    `q ${h} 0 ${h} ${s * h}`,
    `q 0 ${-s * h} ${h} ${-s * h}`,
    `L ${x2 - h} ${y + s * h}`,
    `q ${h} 0 ${h} ${-s * h}`,
  ].join(' ')
}

/** A curly brace to the right of a vertical span, tip pointing right. */
export function verticalBrace(x: number, y1: number, y2: number, depth: number): string {
  const d = Math.min(depth, (y2 - y1) / 2)
  const mid = (y1 + y2) / 2
  const h = d / 2
  return [
    `M ${x} ${y1}`,
    `q ${h} 0 ${h} ${h}`,
    `L ${x + h} ${mid - h}`,
    `q 0 ${h} ${h} ${h}`,
    `q ${-h} 0 ${-h} ${h}`,
    `L ${x + h} ${y2 - h}`,
    `q 0 ${h} ${-h} ${h}`,
  ].join(' ')
}
