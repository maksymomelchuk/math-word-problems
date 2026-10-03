import { useState } from 'react'
import type { Verdict } from '../checks'
import { useFlow } from '../context'
import { Dock } from '../layout/Dock'
import { FlowLayout } from '../layout/FlowLayout'
import { ProblemText, type PartMark } from '../layout/ProblemText'
import { TaskHeading } from '../layout/controls'
import { useTries } from '../useTries'

/** Знайти, first half: she taps the question in the problem text. */
export function AskedTapScreen() {
  const { problem, notebook, update, next } = useFlow()
  const tries = useTries('asked')
  const [tapped, setTapped] = useState<number | null>(null)
  const [markedWrong, setMarkedWrong] = useState<number | null>(null)
  const asked = problem.steps.asked!
  const tappedQuestion = tapped !== null && !!problem.text[tapped].question
  const questionText = problem.text
    .filter((part) => part.question)
    .map((part) => part.text)
    .join('')
    .trim()

  function tap(index: number) {
    if (tries.done) return
    setTapped(index)
    setMarkedWrong(null)
    tries.clear()
  }

  function marks(_part: (typeof problem.text)[number], index: number): PartMark[] {
    if (tries.done || tappedQuestion) return []
    if (index === markedWrong) return ['wrong']
    if (index === tapped) return ['selected']
    return []
  }

  function check() {
    if (tapped === null) return tries.submit({ kind: 'empty', message: 'Торкнись потрібного місця в тексті задачі.' })
    const verdict: Verdict = tappedQuestion ? { kind: 'right' } : { kind: 'wrong', hint: asked.tapHint }
    tries.submit(verdict, {
      part: 'question',
      explain: 'Саме це треба знайти.',
      shownExplain: 'Що треба знайти, виділено жовтим.',
      onHint: () => setMarkedWrong(tapped),
      settle: () => update((n) => ({ ...n, questionFound: true })),
    })
  }

  return (
    <FlowLayout
      focus="text"
      text={
        <ProblemText
          parts={problem.text}
          questionFound={notebook.questionFound}
          questionSelected={tappedQuestion && !tries.done}
          marks={marks}
          onTap={tries.done ? undefined : (_, index) => tap(index)}
        />
      }
      task={
        <>
          <TaskHeading title="Що треба знайти?" />
          <p className="task-prompt">Торкнись у тексті задачі місця, де сказано, що треба знайти.</p>
          {tappedQuestion && !tries.done && <p className="task-note">Вибрано: «{questionText}»</p>}
        </>
      }
      dock={<Dock feedback={tries.feedback} label={tries.done ? 'Далі' : 'Перевірити'} onMain={tries.done ? next : check} />}
    />
  )
}
