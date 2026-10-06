import { useState } from 'react'
import { Keypad } from '../../components/keypad/Keypad'
import { actionCounts, askedWords, checkActionCount, countWords, planWords } from '../../fading/plan'
import { FIX_IN_NOTEBOOK, PAPER_TEXT, planSelfQuestion } from '../../fading/paperText'
import { STEP_MOVE_LINES } from '../../fading/stages'
import { useFlow } from '../context'
import { Dock } from '../layout/Dock'
import { FlowLayout } from '../layout/FlowLayout'
import { ProblemText } from '../layout/ProblemText'
import { TaskHeading } from '../layout/controls'
import { useTries } from '../useTries'
import { ModelLines, PaperHeading, PaperHint, StepNote } from './parts'
import './paper.css'

/**
 * Big steps, once her plan lines have been right two problems in a row: she
 * writes the whole plan first, then says how many actions it has. The line
 * picks follow, one per screen.
 */
export function PlanWholeScreen() {
  const { problem, notebook, play, log, next } = useFlow()
  const { plans } = problem.writeUp
  const tries = useTries('plan', { silent: true })
  const [phase, setPhase] = useState<'write' | 'count'>('write')
  const [count, setCount] = useState('')
  const counts = actionCounts(plans)

  function check() {
    tries.submit(checkActionCount(plans, count), {
      explain: 'Тепер перевіримо кожен рядок.',
      shownExplain: `У правильному плані — ${countWords(counts)}. ${FIX_IN_NOTEBOOK}`,
      reveal: () => setCount(String(counts[0])),
      onTry: ({ right, shown }) => log({ kind: 'actionCount', step: 'plan', value: count, right, ...(shown ? { shown: true } : {}) }),
    })
  }

  function onMain() {
    if (phase === 'write') return setPhase('count')
    if (tries.done) return next()
    check()
  }

  const mainPlan = plans[0].actions.map((action, i) => `${i + 1}) … — ${planWords(action)}`)

  return (
    <FlowLayout
      text={<ProblemText parts={problem.text} questionFound={notebook.questionFound} />}
      task={
        phase === 'write' ? (
          <>
            {play.stepMove === 'big' && <StepNote>{STEP_MOVE_LINES.big}</StepNote>}
            <PaperHeading title={PAPER_TEXT.plan.title}>{PAPER_TEXT.plan.prompt}</PaperHeading>
            <PaperHint step="plan" part="whole" question={planSelfQuestion(askedWords(problem))} model={<ModelLines lines={mainPlan} />} />
          </>
        ) : (
          <>
            <TaskHeading title="Скільки дій у твоєму плані?" eyebrow="План" />
            <p className="count-field" data-state={tries.done ? 'right' : undefined} aria-live="polite">
              <span className="count-value" data-empty={!count || undefined}>
                {count || '…'}
              </span>
            </p>
            <div className="keypad-wrap" hidden={tries.done}>
              <Keypad
                value={count}
                onChange={(value) => {
                  if (tries.done) return
                  setCount(value.replace(/\D/g, ''))
                  tries.clear()
                }}
                onEnter={onMain}
                disabled={tries.done}
                maxLength={2}
              />
            </div>
          </>
        )
      }
      dock={<Dock feedback={phase === 'write' ? { tone: 'none', message: '' } : tries.feedback} label={phase === 'write' ? 'Готово' : tries.done ? 'Далі' : 'Перевірити'} onMain={onMain} enterKey={phase === 'write'} />}
    />
  )
}
