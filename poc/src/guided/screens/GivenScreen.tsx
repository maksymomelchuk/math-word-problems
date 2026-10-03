import { useEffect, useRef, useState } from 'react'
import type { TextPart } from '../../problems/types'
import { checkOption, rightOption } from '../checks'
import { useFlow } from '../context'
import { applyWrites } from '../flow'
import { Dock } from '../layout/Dock'
import { FlowLayout } from '../layout/FlowLayout'
import { ProblemText, type PartMark } from '../layout/ProblemText'
import { OptionButton, TaskHeading } from '../layout/controls'
import { optionState } from '../layout/optionState'
import { bringIntoView } from '../layout/scroll'
import { useTries } from '../useTries'

/** Відомо: she taps a number she hasn't labelled yet, in any order, and picks what it means. One screen per number. */
export function GivenScreen({ nth }: { nth: number }) {
  const { problem, notebook, update, next } = useFlow()
  const tries = useTries('given')
  const given = problem.steps.given!
  const [active, setActive] = useState<string | null>(null)
  const [picked, setPicked] = useState<number | null>(null)
  const [markedWrong, setMarkedWrong] = useState<number | null>(null)
  const optionsRef = useRef<HTMLDivElement>(null)
  const item = active ? given.numbers.find((n) => n.number === active) : undefined
  const activeText = problem.text.find((part) => part.number === active)?.text

  useEffect(() => {
    if (active) bringIntoView(optionsRef.current)
  }, [active])

  function tap(part: TextPart) {
    if (tries.done) return
    if (!part.number) return tries.inform('Торкнись числа.')
    if (notebook.labelled.includes(part.number)) return tries.inform('Це число вже розібране.')
    if (part.number === active) return
    setActive(part.number)
    setPicked(null)
    setMarkedWrong(null)
    tries.restart()
  }

  function marks(part: TextPart): PartMark[] {
    if (!part.number) return []
    if (notebook.labelled.includes(part.number)) return ['labelled']
    if (part.number === active) return ['active']
    return tries.done ? [] : ['tappable']
  }

  function pick(index: number) {
    if (tries.done) return
    setPicked(index)
    setMarkedWrong(null)
    tries.clear()
  }

  function check() {
    if (!item) return tries.submit({ kind: 'empty', message: 'Спершу торкнись числа в задачі.' })
    if (picked === null) return tries.submit({ kind: 'empty', message: 'Вибери, що означає це число.' })
    tries.submit(checkOption(item.options, picked), {
      part: item.number,
      explain: item.explain ?? 'Записуємо в короткий запис.',
      onHint: () => setMarkedWrong(picked),
      settle: () => update((n) => ({ ...n, labelled: [...n.labelled, item.number], record: applyWrites(problem, n.record, item) })),
    })
  }

  const total = given.numbers.length
  return (
    <FlowLayout
      focus="text"
      text={<ProblemText parts={problem.text} questionFound={notebook.questionFound} marks={marks} onTap={tries.done ? undefined : tap} />}
      task={
        <>
          <TaskHeading title="Що відомо?" eyebrow={`Число ${nth + 1} з ${total}`} />
          {!item ? (
            <p className="task-prompt">Торкнись у задачі числа, яке ще не розібране.</p>
          ) : (
            <>
              <p className="task-prompt">Що означає «{activeText}»?</p>
              <div className="options" ref={optionsRef}>
                {item.options.map((option, index) => (
                  <OptionButton
                    key={`${item.number}-${index}`}
                    state={optionState(index, picked, rightOption(item.options), tries.done, markedWrong)}
                    disabled={tries.done}
                    onClick={() => pick(index)}
                  >
                    {option.text}
                  </OptionButton>
                ))}
              </div>
            </>
          )}
        </>
      }
      dock={<Dock feedback={tries.feedback} label={tries.done ? 'Далі' : 'Перевірити'} onMain={tries.done ? next : check} />}
    />
  )
}
