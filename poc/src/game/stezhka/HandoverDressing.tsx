import { levelSlots } from '../../fading/loop'
import { routineOrder, type Play } from '../../fading/stages'
import { hasStep, stepGuidance } from '../../guided/flow'
import { PROBLEMS } from '../../problems/problems'
import { STEP_NAMES, type GuidedProblem, type StepId } from '../../problems/types'
import { problemNumber } from '../path'
import { Bird, NotebookIcon, PhoneIcon } from './art'
import { WORDS, levelTitle, problemTitle } from './words'
import './stezhka.css'

const SLOTS = PROBLEMS.map((p) => p.id)

function StepRow({ title, steps, paper }: { title: string; steps: StepId[]; paper?: boolean }) {
  if (!steps.length) return null
  return (
    <div className="st-split-row" data-paper={paper || undefined}>
      <h2 className="st-split-title">
        {paper ? <NotebookIcon width="18" height="18" /> : <PhoneIcon width="18" height="18" />}
        {title}
      </h2>
      <ul className="st-split-steps">
        {steps.map((step) => (
          <li key={step}>{STEP_NAMES[step]}</li>
        ))}
      </ul>
    </div>
  )
}

/**
 * A handover, dressed calmly: the bird says the stage's new rule, with no
 * confetti (it's the schedule's step, not something she earned), then which
 * of this problem's steps stay in the app and which go to the notebook.
 */
export function HandoverDressing({ problem, play }: { problem: GuidedProblem; play: Play }) {
  const opensLevel = !play.switched && levelSlots(SLOTS, problem.level)[0] === problem.id
  const steps = routineOrder(play).filter((step) => hasStep(problem, step, play))
  const inApp = steps.filter((step) => stepGuidance(problem, step, play).mode === 'guided')
  const onPaper = steps.filter((step) => !inApp.includes(step))

  return (
    <section className="st-handover" aria-labelledby="st-handover-title">
      <Bird className="st-bird st-bird--calm" />
      <p className="st-speech st-speech--big">{play.handover}</p>
      <p className="st-kicker">{WORDS.handoverKicker}</p>
      <h1 className="st-handover-title" id="st-handover-title">
        {opensLevel ? levelTitle(problem.level) : problemTitle(problemNumber(SLOTS, problem.id))}
      </h1>
      <div className="st-split">
        <StepRow title={WORDS.inApp} steps={inApp} />
        <StepRow title={WORDS.inNotebook} steps={onPaper} paper />
      </div>
      <p className="st-tip">{WORDS.handoverTip}</p>
    </section>
  )
}

/**
 * The solo-try choice, dressed: at 4.6 the bird says the stage's line, with no
 * confetti, so «Спробую сама» doesn't look like the prize. At 4.7 and on
 * replays the choice comes without it.
 */
export function SoloChoiceDressing({ line }: { line?: string }) {
  if (!line) return null
  return (
    <div className="st-solo-bird">
      <Bird className="st-bird st-bird--calm st-bird--small" />
      <p className="st-speech st-speech--side">{line}</p>
    </div>
  )
}

/** Under the two ways: both earn the same. */
export function SoloChoiceNote() {
  return <p className="st-tip st-tip--left">{WORDS.sameXp}</p>
}
