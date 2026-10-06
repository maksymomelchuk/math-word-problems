import { useState } from 'react'
import type { Verdict } from '../checks'
import { useFlow } from '../context'
import { writesAt } from '../flow'
import { Dock } from '../layout/Dock'
import { FlowLayout } from '../layout/FlowLayout'
import { ProblemText } from '../layout/ProblemText'
import { OptionButton, TaskHeading } from '../layout/controls'
import { optionState } from '../layout/optionState'
import { useTries } from '../useTries'

type DecodeScreenProps = { index: number; stage: 'bigger' | 'flip' }

/**
 * Порівняння, asked for every comparison, plain or inverted, so the step never
 * gives the trap away: first «Хто тут більший?», then, when the sentence
 * doesn't start from the unknown, the sentence said again from its side.
 */
export function DecodeScreen({ index, stage }: DecodeScreenProps) {
  const { problem, notebook, play, update, next } = useFlow()
  const tries = useTries('decode')
  const { comparisons } = problem.steps.decode!
  const comparison = comparisons[index]
  const question = stage === 'bigger' ? comparison.bigger : comparison.flip!
  const last = stage === 'flip' || !comparison.flip
  const [picked, setPicked] = useState<number | null>(null)
  const [markedWrong, setMarkedWrong] = useState<number | null>(null)
  const right = question.options.indexOf(question.answer)

  function pick(i: number) {
    if (tries.done) return
    setPicked(i)
    setMarkedWrong(null)
    tries.clear()
  }

  function check() {
    if (picked === null) return tries.submit({ kind: 'empty', message: 'Вибери відповідь.' })
    const verdict: Verdict = picked === right ? { kind: 'right' } : { kind: 'wrong', hint: question.hint }
    tries.submit(verdict, {
      part: stage === 'flip' ? `${comparison.id}-flip` : comparison.id,
      explain: last ? comparison.explain : `Так, ${comparison.bigger.answer}.`,
      onHint: () => setMarkedWrong(picked),
      settle: () => {
        if (last) update((n) => ({ ...n, record: writesAt(problem, play, n.record, comparison) }))
      },
    })
  }

  let shown: string | null = null
  if (tries.done) shown = question.answer
  else if (picked !== null) shown = question.options[picked]

  return (
    <FlowLayout
      text={<ProblemText parts={problem.text} questionFound={notebook.questionFound} comparison={comparison.id} />}
      task={
        <>
          <TaskHeading title={stage === 'bigger' ? 'Хто більший?' : 'Почни з шуканого'} eyebrow={`Порівняння ${index + 1} з ${comparisons.length}`} />
          <p className="quote">«{comparison.sentence}»</p>
          {stage === 'bigger' ? (
            <p className="task-prompt">Шукане більше чи менше за дане? Хто тут більший?</p>
          ) : (
            <>
              <p className="task-prompt">Скажи те саме, почавши з невідомого:</p>
              <p className="quote quote--frame">
                {comparison.flip!.frame.split('___').map((piece, i, pieces) => (
                  <span key={i}>
                    {piece}
                    {i < pieces.length - 1 && <span className="blank">{shown ?? '   '}</span>}
                  </span>
                ))}
              </p>
            </>
          )}
          <div className="options options--row">
            {question.options.map((option, i) => (
              <OptionButton key={option} big state={optionState(i, picked, right, tries.done, markedWrong)} disabled={tries.done} onClick={() => pick(i)}>
                {option}
              </OptionButton>
            ))}
          </div>
        </>
      }
      dock={<Dock feedback={tries.feedback} label={tries.done ? 'Далі' : 'Перевірити'} onMain={tries.done ? next : check} />}
    />
  )
}
