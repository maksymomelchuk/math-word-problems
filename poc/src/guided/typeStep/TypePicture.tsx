import type { JSX } from 'react'
import { horizontalBrace } from '../../diagrams/geometry'
import type { TypeFamily } from '../../problems/typeGuide'
import type { ProblemTypeId } from '../../problems/types'
import '../../diagrams/diagrams.css'

const W = 168
const H = 76

/** A small sketch of a type's diagram, or of a family's, as on paper. Decorative: the button around it carries the words. */
export function TypePicture({ kind }: { kind: ProblemTypeId | TypeFamily }) {
  return (
    <svg className="type-picture" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
      {SKETCHES[kind]}
    </svg>
  )
}

function Bar({ x, y, w, extra }: { x: number; y: number; w: number; extra?: boolean }) {
  return <rect className={extra ? 'bar bar--extra' : 'bar'} x={x} y={y} width={w} height={14} />
}

function Label({ x, y, children, start }: { x: number; y: number; children: string; start?: boolean }) {
  return (
    <text className="type-picture-text" x={x} y={y} textAnchor={start ? 'start' : 'middle'}>
      {children}
    </text>
  )
}

function Arrow({ from, to, y }: { from: number; to: number; y: number }) {
  const dir = Math.sign(to - from)
  return (
    <g className="type-picture-arrow">
      <line x1={from} y1={y} x2={to - dir * 6} y2={y} />
      <path d={`M ${to} ${y} L ${to - dir * 8} ${y - 5} L ${to - dir * 8} ${y + 5} Z`} />
    </g>
  )
}

function MiniTable({ headers }: { headers: [string, string, string] }) {
  // Column widths fit the headers at the sketch's font size: «швидкість», «час», «відстань».
  const edges = [2, 64, 108, 166]
  const rows = [6, 26, 46, 66]
  return (
    <g>
      <rect className="type-picture-head" x={edges[0]} y={rows[0]} width={edges[3] - edges[0]} height={20} />
      {rows.map((y) => (
        <line key={`r${y}`} className="type-picture-rule" x1={edges[0]} y1={y} x2={edges[3]} y2={y} />
      ))}
      {edges.map((x) => (
        <line key={`c${x}`} className="type-picture-rule" x1={x} y1={rows[0]} x2={x} y2={rows[3]} />
      ))}
      {headers.map((header, c) => (
        <Label key={header} x={(edges[c] + edges[c + 1]) / 2} y={20}>
          {header}
        </Label>
      ))}
      <Label x={(edges[2] + edges[3]) / 2} y={60}>
        ?
      </Label>
    </g>
  )
}

const fifth = (W - 12) / 5

const SKETCHES: Record<ProblemTypeId | TypeFamily, JSX.Element> = {
  difference: (
    <g>
      <Bar x={6} y={12} w={84} />
      <Bar x={6} y={48} w={84} />
      <Bar x={90} y={48} w={48} extra />
      <line className="diagram-guide" x1={90} y1={12} x2={90} y2={62} />
      <Label x={114} y={42}>
        на 3
      </Label>
    </g>
  ),
  ratio: (
    <g>
      <Bar x={6} y={12} w={44} />
      <Bar x={6} y={48} w={44} />
      <Bar x={50} y={48} w={44} />
      <Bar x={94} y={48} w={44} />
      <line className="diagram-guide" x1={50} y1={12} x2={50} y2={62} />
      <Label x={60} y={24} start>
        у 3 рази
      </Label>
    </g>
  ),
  partsWhole: (
    <g>
      <Bar x={6} y={22} w={86} />
      <Bar x={92} y={22} w={70} />
      <Label x={49} y={16}>
        частина
      </Label>
      <Label x={127} y={16}>
        частина
      </Label>
      <path className="diagram-brace" d={horizontalBrace(6, 162, 42, 10)} />
      <Label x={84} y={70}>
        ціле
      </Label>
    </g>
  ),
  fraction: (
    <g>
      {[0, 1, 2, 3, 4].map((i) => (
        <Bar key={i} x={6 + i * fifth} y={22} w={fifth} extra={i < 2} />
      ))}
      <Label x={6 + fifth} y={16}>
        2/5
      </Label>
      <path className="diagram-brace" d={horizontalBrace(6, 162, 42, 10)} />
      <Label x={84} y={70}>
        число
      </Label>
    </g>
  ),
  threeQuantities: <MiniTable headers={['швидкість', 'час', 'відстань']} />,
  motion: (
    <g>
      <circle className="type-picture-dot" cx={12} cy={22} r={5} />
      <Arrow from={20} to={60} y={22} />
      <circle className="type-picture-dot" cx={156} cy={22} r={5} />
      <Arrow from={148} to={108} y={22} />
      <Label x={84} y={12}>
        назустріч
      </Label>
      <circle className="type-picture-dot" cx={76} cy={60} r={5} />
      <Arrow from={68} to={28} y={60} />
      <circle className="type-picture-dot" cx={92} cy={60} r={5} />
      <Arrow from={100} to={140} y={60} />
      <Label x={84} y={46}>
        у різні боки
      </Label>
    </g>
  ),
  compare: (
    <g>
      <Bar x={6} y={16} w={72} />
      <Bar x={6} y={46} w={132} />
      <line className="diagram-guide" x1={78} y1={16} x2={78} y2={60} />
    </g>
  ),
  parts: (
    <g>
      <Bar x={6} y={20} w={54} />
      <Bar x={60} y={20} w={58} />
      <Bar x={118} y={20} w={44} />
      <path className="diagram-brace" d={horizontalBrace(6, 162, 40, 10)} />
      <Label x={84} y={68}>
        ціле
      </Label>
    </g>
  ),
  table: <MiniTable headers={['швидкість', 'час', 'відстань']} />,
}
