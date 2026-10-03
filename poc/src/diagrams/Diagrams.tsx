import type { Diagram } from '../problems/types'
import { Bars } from './Bars'
import { Parts } from './Parts'
import { Table } from './Table'
import type { SlotControl } from './slots'
import './diagrams.css'

type DiagramsProps = {
  diagrams: readonly Diagram[]
  fill: Readonly<Record<string, string>>
  control?: SlotControl
}

/**
 * A problem's diagrams. Usually one; a problem that mixes families (a
 * purchase table and the change segment) stacks one per family, each under
 * its caption, sharing one set of slots and chips.
 */
export function Diagrams({ diagrams, fill, control }: DiagramsProps) {
  return (
    <div className="diagrams" data-stacked={diagrams.length > 1 || undefined}>
      {diagrams.map((diagram, i) => (
        <figure key={i} className="diagram-figure">
          {diagram.caption && <figcaption className="diagram-figcaption">{diagram.caption}</figcaption>}
          {diagram.family === 'bars' && <Bars diagram={diagram} fill={fill} control={control} />}
          {diagram.family === 'parts' && <Parts diagram={diagram} fill={fill} control={control} />}
          {diagram.family === 'table' && <Table diagram={diagram} fill={fill} control={control} />}
        </figure>
      ))}
    </div>
  )
}
