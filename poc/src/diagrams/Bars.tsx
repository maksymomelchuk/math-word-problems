import type { BarsDiagram } from '../problems/types'
import { VIEW_WIDTH, textWidth, verticalBrace } from './geometry'
import { SvgLabel } from './Slot'
import { labelWidth, type SlotControl } from './slots'

const PAD = 4
const LABEL_BAND = 40
const BAR = 26
const GAP = 12
const BRACE = 12
const END_GAP = 6

type BarsProps = {
  diagram: BarsDiagram
  fill: Readonly<Record<string, string>>
  control?: SlotControl
}

/**
 * Segment bars from one left edge, the school's схема з відрізками. Each row
 * is a bar made of pieces drawn to scale; a dashed guide carries a bar's end
 * down to the longer bars under it; an optional brace on the right holds the
 * bars' sum, which is how a chain shares one diagram.
 */
export function Bars({ diagram, fill, control }: BarsProps) {
  const { rows, total } = diagram
  const hasLabels = rows.some((row) => row.pieces.some((piece) => piece.label))
  const band = hasLabels ? LABEL_BAND : 0
  const rowLabelWidth = Math.max(30, ...rows.map((row) => textWidth(row.label) + 10))
  const endWidth = Math.max(0, ...rows.map((row) => (row.end ? labelWidth(row.end, fill) + END_GAP : 0)))
  const totalWidth = total ? BRACE + 8 + labelWidth(total, fill) + 2 : 0
  const trackX = rowLabelWidth
  const trackWidth = VIEW_WIDTH - trackX - endWidth - totalWidth - PAD
  const lengths = rows.map((row) => row.pieces.reduce((sum, piece) => sum + piece.length, 0))
  const scale = trackWidth / Math.max(...lengths)

  const rowTop = (r: number) => PAD + r * (band + BAR + GAP)
  const barTop = (r: number) => rowTop(r) + band
  const ends = lengths.map((length) => trackX + length * scale)
  const barsBottom = barTop(rows.length - 1) + BAR
  const height = barsBottom + PAD + 2
  const braceX = trackX + trackWidth + endWidth + 4

  return (
    <svg className="diagram diagram-bars" viewBox={`0 0 ${VIEW_WIDTH} ${height}`} role="group" aria-label="Схема з відрізками">
      {rows.map((row, r) => {
        let x = trackX
        return (
          <g key={r}>
            <text x={0} y={barTop(r) + BAR / 2 + 5} className="diagram-text diagram-row-label">
              {row.label}
            </text>
            {row.pieces.map((piece, p) => {
              const width = piece.length * scale
              const left = x
              x += width
              return (
                <g key={p}>
                  <rect className={piece.missing ? 'bar bar--missing' : piece.extra ? 'bar bar--extra' : 'bar'} x={left} y={barTop(r)} width={width} height={BAR} />
                  {piece.label !== undefined && <SvgLabel label={piece.label} x={left + width / 2} y={rowTop(r) + band / 2 - 2} fill={fill} control={control} />}
                </g>
              )
            })}
            {row.end !== undefined && <SvgLabel label={row.end} x={ends[r] + END_GAP} y={barTop(r) + BAR / 2} fill={fill} control={control} start />}
          </g>
        )
      })}

      {rows.map((_, r) => {
        const longerBelow = rows.map((__, k) => k).filter((k) => k > r && ends[k] > ends[r] + 0.5)
        if (!longerBelow.length) return null
        const last = longerBelow[longerBelow.length - 1]
        return <line key={`guide-${r}`} className="diagram-guide" x1={ends[r]} y1={barTop(r)} x2={ends[r]} y2={barTop(last) + BAR} />
      })}

      {total !== undefined && (
        <g>
          <path className="diagram-brace" d={verticalBrace(braceX, barTop(0), barsBottom, BRACE)} />
          <SvgLabel label={total} x={braceX + BRACE + 6} y={(barTop(0) + barsBottom) / 2} fill={fill} control={control} start />
        </g>
      )}
    </svg>
  )
}
