import type { KeyboardEvent } from 'react'
import type { Label } from '../problems/types'
import { SLOT_HEIGHT, SLOT_HIT, slotWidth } from './geometry'
import { slotState, type SlotControl } from './slots'

function onKey(event: KeyboardEvent, act: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    act()
  }
}

type SvgLabelProps = {
  label: Label
  /** Centre of the label. */
  x: number
  y: number
  fill: Readonly<Record<string, string>>
  control?: SlotControl
  /** Left-align at x instead of centring (labels to the right of something). */
  start?: boolean
}

/** A diagram label in SVG: fixed text, or a slot with a 44-unit tap area. */
export function SvgLabel({ label, x, y, fill, control, start = false }: SvgLabelProps) {
  if (typeof label === 'string') {
    return (
      <text x={x} y={y + 5} textAnchor={start ? 'start' : 'middle'} className="diagram-text">
        {label}
      </text>
    )
  }
  const value = fill[label.slot] ?? ''
  const width = slotWidth(value || '00')
  const cx = start ? x + width / 2 : x
  const state = slotState(label.slot, fill, control)
  const interactive = control && !control.right
  return (
    <g
      className="svg-slot"
      data-state={state}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? (value ? `Місце на схемі: ${value}` : 'Порожнє місце на схемі') : undefined}
      aria-pressed={interactive ? state === 'selected' : undefined}
      onMouseDown={interactive ? (event) => event.preventDefault() : undefined}
      onClick={interactive ? () => control.onSlot(label.slot) : undefined}
      onKeyDown={interactive ? (event) => onKey(event, () => control.onSlot(label.slot)) : undefined}
    >
      {interactive && <rect className="svg-slot-hit" x={cx - Math.max(width, SLOT_HIT) / 2} y={y - SLOT_HIT / 2} width={Math.max(width, SLOT_HIT)} height={SLOT_HIT} />}
      <rect className="svg-slot-box" x={cx - width / 2} y={y - SLOT_HEIGHT / 2} width={width} height={SLOT_HEIGHT} rx={8} />
      <text x={cx} y={y + 5} textAnchor="middle" className="diagram-text diagram-value">
        {value}
      </text>
    </g>
  )
}
