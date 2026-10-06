import { useState } from 'react'
import { SoloChoiceDressing, SoloChoiceNote } from '../../game'
import { problemNumber } from '../../game/path'
import { PROBLEMS } from '../../problems/problems'
import { useFlow } from '../context'
import { Dock } from '../layout/Dock'
import { FlowLayout } from '../layout/FlowLayout'
import { ProblemText } from '../layout/ProblemText'
import { OptionButton, TaskHeading } from '../layout/controls'
import './paper.css'

const CHOICES = [
  { id: 'steps', title: 'Крок за кроком', about: 'Як і раніше: по одному кроку, і кожен одразу перевіряємо.' },
  { id: 'solo', title: 'Спробую сама', about: 'Увесь розв’язок — у зошиті, потім вводиш відповідь. «Розбий на кроки» — будь-коли.' },
] as const

/** The solo try at 4.6, 4.7 and replays after 4.7: «Крок за кроком» (the default) or «Спробую сама». */
export function SoloChoiceScreen() {
  const { problem, notebook, play, update, log, next } = useFlow()
  const [choice, setChoice] = useState<'steps' | 'solo'>('steps')

  function start() {
    log({ kind: 'solo', step: 'start', choice })
    update((n) => ({ ...n, solo: choice }))
    next()
  }

  return (
    <FlowLayout
      text={<ProblemText parts={problem.text} questionFound={notebook.questionFound} />}
      task={
        <>
          <SoloChoiceDressing line={play.handover} />
          <TaskHeading title="Як будеш розв’язувати?" eyebrow={play.handover ? 'Новий етап' : `Задача ${problemNumber(PROBLEMS.map((p) => p.id), problem.id)}`} />
          <div className="options" role="radiogroup" aria-label="Як будеш розв’язувати?">
            {CHOICES.map((c) => (
              <OptionButton key={c.id} state={choice === c.id ? 'selected' : 'idle'} onClick={() => setChoice(c.id)}>
                <span className="choice-title">{c.title}</span>
                <span className="choice-about">{c.about}</span>
              </OptionButton>
            ))}
          </div>
          <SoloChoiceNote />
        </>
      }
      dock={<Dock feedback={{ tone: 'none', message: '' }} label="Почати" onMain={start} quiet />}
    />
  )
}
