import { useState } from 'react'
import type { Choice, StepId } from '../../problems/types'
import { checkOption, rightOption } from '../checks'
import { useFlow } from '../context'
import { writesAt, type Notebook } from '../flow'
import { Dock } from '../layout/Dock'
import { FlowLayout } from '../layout/FlowLayout'
import { ProblemText } from '../layout/ProblemText'
import { OptionButton, TaskHeading } from '../layout/controls'
import { optionState } from '../layout/optionState'
import { useTries } from '../useTries'

type ChoiceScreenProps = {
  choice: Choice
  step: StepId
  /** The part of the step, for the record. */
  part?: string
  /** A «Чому?» prompt. */
  why?: boolean
  eyebrow?: string
  /** What else settling this screen writes, besides its short-record lines. */
  settle?: (notebook: Notebook) => Notebook
}

/** A pick-one menu: Перекажи, what exactly is asked, hidden information, «Чому?», Відповідь. */
export function ChoiceScreen({ choice, step, part, why, eyebrow, settle = (n) => n }: ChoiceScreenProps) {
  const { problem, notebook, play, update, next } = useFlow()
  const tries = useTries(step)
  const [picked, setPicked] = useState<number | null>(null)
  const [markedWrong, setMarkedWrong] = useState<number | null>(null)
  const right = rightOption(choice.options)

  function pick(index: number) {
    if (tries.done) return
    setPicked(index)
    setMarkedWrong(null)
    tries.clear()
  }

  function check() {
    tries.submit(checkOption(choice.options, picked), {
      part,
      explain: choice.explain,
      onHint: () => setMarkedWrong(picked),
      settle: () => update((n) => settle({ ...n, record: writesAt(problem, play, n.record, choice) })),
    })
  }

  return (
    <FlowLayout
      text={<ProblemText parts={problem.text} questionFound={notebook.questionFound} />}
      task={
        <>
          <TaskHeading title={choice.title} eyebrow={eyebrow} why={why} />
          <p className="task-prompt">{choice.prompt}</p>
          <div className="options">
            {choice.options.map((option, index) => (
              <OptionButton key={index} state={optionState(index, picked, right, tries.done, markedWrong)} disabled={tries.done} onClick={() => pick(index)}>
                {option.text}
              </OptionButton>
            ))}
          </div>
        </>
      }
      dock={<Dock feedback={tries.feedback} label={tries.done ? 'Далі' : 'Перевірити'} onMain={tries.done ? next : check} />}
    />
  )
}
