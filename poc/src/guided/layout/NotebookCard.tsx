import { useEffect, useRef, useState } from 'react'
import { Diagrams } from '../../diagrams/Diagrams'
import { writeUpSoFar } from '../flow'
import { useFlow } from '../context'
import { bringIntoView } from './scroll'

type Line = { key: string; text: string; heading?: boolean }

const DIAGRAM = 'diagram'

/** What was on the page, and which entries changed in the last update. */
type Seen = { signature: string; texts: Map<string, string>; fresh: Set<string> }

function snapshot(entries: readonly Line[], fresh = new Set<string>()): Seen {
  return { signature: entries.map((e) => `${e.key}\u0000${e.text}`).join('\n'), texts: new Map(entries.map((e) => [e.key, e.text])), fresh }
}

/**
 * The write-up as it builds up under the problem, line by line, exactly as on
 * paper: the short record, the diagram, «Розв'язання» and «Відповідь». A line
 * that was just written or rewritten flashes and is scrolled into view.
 */
export function NotebookCard() {
  const { problem, notebook } = useFlow()
  const { record, solution, answer } = writeUpSoFar(problem, notebook)
  const recordIds = problem.writeUp.shortRecord.filter((line) => notebook.record[line.id]).map((line) => line.id)

  const recordLines: Line[] = record.map((text, i) => ({ key: `record-${recordIds[i]}`, text }))
  const restLines: Line[] = [
    ...(solution ? [{ key: 'heading', text: "Розв'язання", heading: true }, ...solution.map((text, i) => ({ key: `solution-${i}`, text }))] : []),
    ...(answer ? [{ key: 'answer', text: answer }] : []),
  ]
  const entries = [...recordLines, ...(notebook.diagram ? [{ key: DIAGRAM, text: JSON.stringify(notebook.diagram) }] : []), ...restLines]

  // Adjusting state while rendering, React's pattern for "what changed since the last render".
  const [seen, setSeen] = useState(() => snapshot(entries))
  const current = snapshot(entries)
  if (current.signature !== seen.signature) {
    setSeen(snapshot(entries, new Set(entries.filter((e) => seen.texts.get(e.key) !== e.text).map((e) => e.key))))
  }

  const paper = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (seen.fresh.size) bringIntoView(paper.current?.querySelector('[data-fresh]') ?? null)
  }, [seen])

  const isFresh = (key: string) => seen.fresh.has(key) || undefined
  const empty = !entries.length

  return (
    <section className="notebook-card" aria-label="Запис у зошиті">
      <h2 className="eyebrow">Запис у зошиті</h2>
      <div className="paper" ref={paper}>
        {empty && <p className="paper-placeholder">Тут з'являтиметься запис, як у зошиті.</p>}
        {recordLines.map((line) => (
          <p key={line.key} className="paper-line" data-fresh={isFresh(line.key)}>
            {line.text}
          </p>
        ))}
        {notebook.diagram && problem.steps.typeDiagram && (
          <div className="paper-diagram" data-fresh={isFresh(DIAGRAM)}>
            <Diagrams diagrams={problem.steps.typeDiagram.diagram.diagrams} fill={notebook.diagram} />
          </div>
        )}
        {restLines.map((line) => (
          <p key={line.key} className={line.heading ? 'paper-line paper-heading' : 'paper-line'} data-fresh={isFresh(line.key)}>
            {line.text}
          </p>
        ))}
      </div>
    </section>
  )
}
