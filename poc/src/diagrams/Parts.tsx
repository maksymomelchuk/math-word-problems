import type { PartsDiagram } from '../problems/types'
import { VIEW_WIDTH, horizontalBrace } from './geometry'
import { SvgLabel } from './Slot'
import type { SlotControl } from './slots'

const PAD = 10
const CAPTION = 18
const LABEL = 40
const SMALL_BRACE = 9
const SEGMENT = 28
const BRACE = 14

type PartsProps = {
  diagram: PartsDiagram
  fill: Readonly<Record<string, string>>
  control?: SlotControl
}

/**
 * One segment split into parts, with the whole under a brace below it, the
 * school's diagram for частини і ціле and дріб від числа. Labels sit above
 * their parts; a label over several parts (a fraction's share) gets its own
 * small brace. Shaded parts are the ones a fraction takes.
 */
export function Parts({ diagram, fill, control }: PartsProps) {
  const { pieces, above, whole } = diagram
  const hasCaptions = above.some((item) => item.caption)
  const hasSpans = above.some((item) => (item.to ?? item.from) > item.from)
  const labelTop = PAD + (hasCaptions ? CAPTION : 0)
  const segmentTop = labelTop + LABEL + (hasSpans ? SMALL_BRACE + 4 : 0)
  const segmentBottom = segmentTop + SEGMENT
  const braceTop = segmentBottom + 6
  const wholeY = braceTop + BRACE + 22
  const height = wholeY + 20 + (whole.caption ? CAPTION : 0) + 4

  const totalLength = pieces.reduce((sum, piece) => sum + piece.length, 0)
  const scale = (VIEW_WIDTH - 2 * PAD) / totalLength
  const starts = pieces.map((_, i) => PAD + pieces.slice(0, i).reduce((sum, piece) => sum + piece.length, 0) * scale)
  const end = (i: number) => starts[i] + pieces[i].length * scale
  const labelY = labelTop + LABEL / 2

  return (
    <svg className="diagram diagram-parts" viewBox={`0 0 ${VIEW_WIDTH} ${height}`} role="group" aria-label="Схема: відрізок і його частини">
      {pieces.map((piece, i) => (
        <rect key={i} className={piece.marked ? 'bar bar--extra' : 'bar'} x={starts[i]} y={segmentTop} width={piece.length * scale} height={SEGMENT} />
      ))}

      {above.map((item, k) => {
        const to = item.to ?? item.from
        const x1 = starts[item.from]
        const x2 = end(to)
        const cx = (x1 + x2) / 2
        return (
          <g key={k}>
            {item.caption && (
              <text x={cx} y={PAD + 12} textAnchor="middle" className="diagram-text diagram-caption">
                {item.caption}
              </text>
            )}
            <SvgLabel label={item.label} x={cx} y={labelY} fill={fill} control={control} />
            {to > item.from && <path className="diagram-brace" d={horizontalBrace(x1 + 2, x2 - 2, segmentTop - 4, SMALL_BRACE, true)} />}
          </g>
        )
      })}

      <path className="diagram-brace" d={horizontalBrace(starts[0], end(pieces.length - 1), braceTop, BRACE)} />
      <SvgLabel label={whole.label} x={VIEW_WIDTH / 2} y={wholeY} fill={fill} control={control} />
      {whole.caption && (
        <text x={VIEW_WIDTH / 2} y={wholeY + 32} textAnchor="middle" className="diagram-text diagram-caption">
          {whole.caption}
        </text>
      )}
    </svg>
  )
}
