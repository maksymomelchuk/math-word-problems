import type { TableCell, TableDiagram } from '../problems/types'
import { slotState, type SlotControl } from './slots'

type TableProps = {
  diagram: TableDiagram
  fill: Readonly<Record<string, string>>
  control?: SlotControl
}

/** The three-quantity table: швидкість–час–відстань, ціна–кількість–вартість, продуктивність–час–робота. One row per relation. */
export function Table({ diagram, fill, control }: TableProps) {
  function cell(content: TableCell, key: number) {
    if (content === null) return null
    if (typeof content === 'string') return <td key={key}>{content}</td>
    if ('rowSpan' in content) {
      return (
        <td key={key} rowSpan={content.rowSpan} className="table-note">
          {content.text}
        </td>
      )
    }
    const value = fill[content.slot] ?? ''
    const state = slotState(content.slot, fill, control)
    if (!control || control.right) {
      return (
        <td key={key}>
          <span className="table-slot" data-state={state}>
            {value}
          </span>
        </td>
      )
    }
    return (
      <td key={key}>
        <button
          type="button"
          className="table-slot"
          data-state={state}
          aria-pressed={state === 'selected'}
          aria-label={value ? `Клітинка: ${value}` : 'Порожня клітинка'}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => control.onSlot(content.slot)}
        >
          {value}
        </button>
      </td>
    )
  }

  return (
    <table className="diagram-table">
      <thead>
        <tr>
          <td />
          {diagram.columns.map((column) => (
            <th key={column} scope="col">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {diagram.rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            {row.cells.map(cell)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
