/**
 * From 3.1 the «?» is a chip she places on the diagram, not drawn for her.
 * Every fixed label holding «?» becomes a slot; placing the «?» chip there
 * shows the label as it was («P — ?»). Pure functions, no UI code.
 */
import type { Diagram, DiagramData, Label, TableCell } from '../problems/types'

export const QUESTION_CHIP = '?'
export const QUESTION_HINT = 'Знак «?» став там, що треба знайти. Подивись на короткий запис.'

export type QuestionDiagram = Pick<DiagramData, 'diagrams' | 'slots' | 'chips'> & {
  /** For each new slot, the label it shows once the «?» chip is in it. */
  questionSlots: Record<string, string>
}

export function withQuestionSlots(data: Pick<DiagramData, 'diagrams' | 'slots' | 'chips'>): QuestionDiagram {
  const questionSlots: Record<string, string> = {}
  let n = 0
  const label = (l: Label): Label => {
    if (typeof l !== 'string' || !l.includes(QUESTION_CHIP)) return l
    n += 1
    const slot = `question-${n}`
    questionSlots[slot] = l
    return { slot }
  }
  const cell = (c: TableCell): TableCell => (c === null || (typeof c === 'object' && 'rowSpan' in c) ? c : label(c))
  const diagrams = data.diagrams.map((d): Diagram => {
    switch (d.family) {
      case 'bars':
        return {
          ...d,
          rows: d.rows.map((row) => ({
            ...row,
            pieces: row.pieces.map((piece) => (piece.label === undefined ? piece : { ...piece, label: label(piece.label) })),
            ...(row.end === undefined ? {} : { end: label(row.end) }),
          })),
          ...(d.total === undefined ? {} : { total: label(d.total) }),
        }
      case 'parts':
        return { ...d, above: d.above.map((a) => ({ ...a, label: label(a.label) })), whole: { ...d.whole, label: label(d.whole.label) } }
      case 'table':
        return { ...d, rows: d.rows.map((row) => ({ ...row, cells: row.cells.map(cell) as [TableCell, TableCell, TableCell] })) }
    }
  })
  return {
    diagrams,
    slots: { ...data.slots, ...questionSlots },
    chips: n ? [...data.chips, QUESTION_CHIP] : [...data.chips],
    questionSlots,
  }
}

/** What a slot shows when she places a chip in it: the «?» chip shows its label in a «?» slot. */
export function placedValue(diagram: QuestionDiagram, slot: string, chip: string): string {
  return chip === QUESTION_CHIP ? (diagram.questionSlots[slot] ?? chip) : chip
}
