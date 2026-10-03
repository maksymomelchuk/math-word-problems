import { useState } from 'react'
import { Diagrams } from '../../diagrams/Diagrams'
import { checkSlots } from '../checks'
import { useFlow } from '../context'
import { Dock } from '../layout/Dock'
import { FlowLayout } from '../layout/FlowLayout'
import { ProblemText } from '../layout/ProblemText'
import { Chip, TaskHeading } from '../layout/controls'
import { useTries } from '../useTries'

/** Тип і схема, second half: she places the given numbers into the pre-drawn diagram. Tap a slot, then a chip. */
export function DiagramScreen() {
  const { problem, notebook, update, next } = useFlow()
  const tries = useTries('typeDiagram')
  const data = problem.steps.typeDiagram!.diagram
  const order = Object.keys(data.slots)
  const [fill, setFill] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(order[0] ?? null)
  const [wrong, setWrong] = useState<string[]>([])

  function place(chip: string) {
    if (tries.done || !selected) return
    const filled = { ...fill, [selected]: chip }
    setFill(filled)
    setWrong((current) => current.filter((slot) => slot !== selected))
    setSelected(order.find((slot) => !filled[slot]) ?? selected)
    tries.clear()
  }

  function check() {
    const verdict = checkSlots(data.slots, fill, data.hint)
    tries.submit(verdict, {
      part: 'diagram',
      explain: data.explain,
      onHint: () => {
        setWrong(verdict.wrong)
        setSelected(verdict.wrong[0] ?? selected)
      },
      reveal: () => {
        setFill({ ...data.slots })
        setWrong([])
      },
      settle: (shown) => update((n) => ({ ...n, diagram: shown ? { ...data.slots } : fill })),
    })
  }

  return (
    <FlowLayout
      text={<ProblemText parts={problem.text} questionFound={notebook.questionFound} />}
      task={
        <>
          <TaskHeading title={data.title} />
          <p className="task-prompt">{data.prompt}</p>
          <div className="diagram-card">
            <Diagrams
              diagrams={data.diagrams}
              fill={fill}
              control={{
                selected: tries.done ? null : selected,
                wrong,
                right: tries.done,
                onSlot: (slot) => {
                  if (!tries.done) setSelected(slot)
                },
              }}
            />
          </div>
          {!tries.done && (
            <div className="chips" role="group" aria-label="Числа для схеми">
              {data.chips.map((chip) => (
                <Chip key={chip} onClick={() => place(chip)}>
                  {chip}
                </Chip>
              ))}
            </div>
          )}
        </>
      }
      dock={<Dock feedback={tries.feedback} label={tries.done ? 'Далі' : 'Перевірити'} onMain={tries.done ? next : check} />}
    />
  )
}
