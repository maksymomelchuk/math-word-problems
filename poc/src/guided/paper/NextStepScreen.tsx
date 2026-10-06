import { useState } from 'react'
import { STEP_IDS, STEP_NAMES, type StepId } from '../../problems/types'
import { useFlow } from '../context'
import { hasStep, stepGuidance } from '../flow'
import { Dock } from '../layout/Dock'
import { FlowLayout } from '../layout/FlowLayout'
import { ProblemText } from '../layout/ProblemText'
import { OptionButton, TaskHeading } from '../layout/controls'
import type { Feedback } from '../useTries'
import './paper.css'

/** The step names in alphabetical order, so the buttons' order never tells her the routine's. */
const BY_NAME = [...STEP_IDS].sort((a, b) => STEP_NAMES[a].localeCompare(STEP_NAMES[b], 'uk'))

/** «Тут немає порівняння.», or the same for another step the problem doesn't have. */
function missingMessage(step: StepId): string {
  return step === 'decode' ? 'Тут немає порівняння. Який крок далі?' : `У цій задачі немає кроку «${STEP_NAMES[step]}». Який крок далі?`
}

/**
 * «Який крок далі?» before each step, from 4.4: the eight step names. The
 * right one opens it; a wrong one gets «Спершу — ⟨step⟩.» and opens that
 * step; a step the problem doesn't have says so. Free, and recorded.
 */
export function NextStepScreen({ due }: { due: StepId }) {
  const { problem, notebook, play, log, next } = useFlow()
  const [wrong, setWrong] = useState<StepId | null>(null)
  const [missing, setMissing] = useState<StepId[]>([])
  const [feedback, setFeedback] = useState<Feedback>({ tone: 'none', message: '' })
  const together = play.stepSize === 'small' && stepGuidance(problem, 'plan', play).mode === 'paper'
  const settled = wrong !== null

  function pick(step: StepId) {
    if (settled) return
    if (step === due) {
      log({ kind: 'nextStep', step: due, picked: step, due, right: true })
      next()
      return
    }
    if (!hasStep(problem, step, play)) {
      log({ kind: 'nextStep', step: due, picked: step, due, right: false, missing: true })
      setMissing((current) => [...current, step])
      setFeedback({ tone: 'info', message: missingMessage(step) })
      return
    }
    log({ kind: 'nextStep', step: due, picked: step, due, right: false })
    setWrong(step)
    setFeedback({ tone: 'bad', message: `Спершу — ${STEP_NAMES[due]}.` })
  }

  function state(step: StepId) {
    if (settled && step === due) return 'right'
    if (step === wrong) return 'wrong'
    return 'idle'
  }

  return (
    <FlowLayout
      text={<ProblemText parts={problem.text} questionFound={notebook.questionFound} />}
      task={
        <>
          <TaskHeading title="Який крок далі?" />
          <p className="task-prompt">Вибери крок, який робиш зараз.</p>
          <div className="step-grid" role="group" aria-label="Кроки">
            {BY_NAME.map((step) => (
              <OptionButton key={step} state={state(step)} disabled={(settled && step !== due) || missing.includes(step)} onClick={() => pick(step)}>
                {STEP_NAMES[step]}
                {step === 'plan' && together && <span className="step-sub"> і дії</span>}
              </OptionButton>
            ))}
          </div>
        </>
      }
      dock={<Dock feedback={feedback} label={settled ? 'Далі' : 'Вибери крок'} onMain={settled ? next : () => setFeedback({ tone: 'info', message: 'Торкнись кроку, який робиш зараз.' })} />}
    />
  )
}
