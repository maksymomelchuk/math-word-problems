import { useRef, useState } from 'react'
import { Keypad } from '../../components/keypad/Keypad'
import { directionActive, fadeChanges, learnerState, type LearnerState } from '../../fading/learner'
import { FIX_IN_NOTEBOOK, PAPER_TEXT } from '../../fading/paperText'
import { lineText } from '../../fading/plan'
import { checkResult } from '../../fading/results'
import { loadProgress } from '../../lib/progress'
import type { Direction, DirectionCheck, Sign } from '../../problems/types'
import { actionTokens, checkDirection, shownAction } from '../checks'
import { useFlow } from '../context'
import { plannedActions, stepGuidance } from '../flow'
import { Dock } from '../layout/Dock'
import { FlowLayout } from '../layout/FlowLayout'
import { ProblemText } from '../layout/ProblemText'
import { TaskHeading } from '../layout/controls'
import { DirectionNote, DirectionQuestion } from '../screens/ComputeScreen'
import { useTries, type Feedback } from '../useTries'
import { PaperHint } from './parts'
import './paper.css'

/**
 * An action on paper, 2.1 to 4.7. In Level 2 the app names it; from 3.1 her
 * plan line has just named it. The direction check comes first while it's
 * active for the action's relation type. She writes the action in her
 * notebook and types its result. A wrong result from a wrong sign gets that
 * sign's hint, any other «Не сходиться» and the action's hint; a second miss
 * shows the action with its reason, then «У тебе така сама дія?» when no sign
 * explained it, then «Виправ у зошиті».
 */
export function PaperComputeScreen({ position, withPlan }: { position: number; withPlan: boolean }) {
  const { problem, notebook, play, update, log, next } = useFlow()
  const chosen = notebook.plan ?? { plan: 0, order: problem.writeUp.plans[0].actions.map((_, i) => i) }
  const actions = plannedActions(problem, chosen)
  const action = actions[position]
  const total = problem.writeUp.plans[chosen.plan].actions.length
  const named = stepGuidance(problem, 'plan', play).mode === 'guided'
  const check = action.direction
  const [initial] = useState(() => learnerState(loadProgress()))
  const state = useRef<LearnerState>(initial)
  const asked = !!check && directionActive(initial, check.relationType)
  const [phase, setPhase] = useState<'direction' | 'result' | 'same' | 'fix'>(asked ? 'direction' : 'result')
  const directionTries = useTries('compute', { silent: true })
  const tries = useTries('compute', { silent: true })
  const [direction, setDirection] = useState<Direction | null>(null)
  const [directionWrong, setDirectionWrong] = useState<Direction | null>(null)
  const [result, setResult] = useState('')
  const [signs, setSigns] = useState<Sign[]>([])
  const [note, setNote] = useState<Feedback | null>(null)
  const last = position === total - 1

  /** Notes in her records when the direction check stopped or came back for a type. */
  function noteFades() {
    const after = learnerState(loadProgress())
    for (const change of fadeChanges(state.current, after)) log({ kind: 'fade', step: 'compute', ...change })
    state.current = after
  }

  function checkDirectionPick() {
    if (!check) return
    directionTries.submit(checkDirection(check, direction), {
      explain: check.explain,
      onHint: () => setDirectionWrong(direction),
      onTry: ({ right, shown }) =>
        log({ kind: 'direction', step: 'compute', line: position, action: action.id, relationType: check.relationType, picked: direction!, right, ...(shown ? { shown: true } : {}) }),
    })
  }

  function settleShown() {
    update((n) => {
      const computed = [...n.computed]
      computed[position] = actionTokens(action)
      return { ...n, computed }
    })
  }

  function checkTyped() {
    const verdict = checkResult(action, result)
    const sign = verdict.kind === 'wrong' ? verdict.sign : undefined
    const seen = sign ? [...signs, sign] : signs
    if (sign) setSigns(seen)
    tries.submit(verdict, {
      shownExplain: `${shownAction(action)}${seen.length ? ` ${FIX_IN_NOTEBOOK}` : ''}`,
      reveal: () => setResult(action.result),
      settle: () => settleShown(),
      onTry: ({ right, shown }) => {
        log({
          kind: 'result',
          step: 'compute',
          line: position,
          action: action.id,
          value: result,
          right,
          ...(sign ? { sign } : {}),
          ...(check ? { relationType: check.relationType } : {}),
          ...(shown ? { shown: true } : {}),
        })
        noteFades()
        if (shown) setPhase(seen.length ? 'fix' : 'same')
      },
    })
  }

  function answerSame(slip: boolean) {
    log({ kind: 'sameAction', step: 'compute', line: position, action: action.id, slip })
    setPhase('fix')
    tries.say({ tone: 'shown', message: slip ? `Тоді перевір обчислення. ${FIX_IN_NOTEBOOK}` : `Подивись на дію вище. ${FIX_IN_NOTEBOOK}` })
  }

  function onMain() {
    if (phase === 'direction') {
      if (directionTries.done) return setPhase('result')
      return checkDirectionPick()
    }
    if (phase === 'same') return setNote({ tone: 'info', message: 'Вибери: так чи ні.' })
    if (tries.done) return next()
    checkTyped()
  }

  const hintModel = <p className="hint-model-text">{shownAction(action)}</p>
  const showByHint = () =>
    tries.show({
      message: `Подивись, як правильно. ${shownAction(action)} ${FIX_IN_NOTEBOOK}`,
      reveal: () => setResult(action.result),
      settle: () => {
        settleShown()
        setPhase('fix')
      },
    })

  let dockFeedback: Feedback = tries.feedback
  if (phase === 'direction') dockFeedback = directionTries.feedback
  else if (note) dockFeedback = note

  return (
    <FlowLayout
      text={<ProblemText parts={problem.text} questionFound={notebook.questionFound} />}
      task={
        <>
          <TaskHeading title={PAPER_TEXT.compute.title} eyebrow={withPlan ? `Дія ${position + 1}` : `Дія ${position + 1} з ${total}`} />
          {named ? (
            <p className="task-prompt">
              <strong>
                Дія {position + 1}: {lineText(problem, action.id)}.
              </strong>{' '}
              Запиши її в зошит і обчисли. Введи результат.
            </p>
          ) : (
            <p className="task-prompt">{PAPER_TEXT.compute.prompt}</p>
          )}
          {check && asked && (phase === 'direction' ? (
            <DirectionQuestion check={check} picked={direction} markedWrong={directionWrong} done={directionTries.done} onPick={(d) => {
              if (directionTries.done) return
              setDirection(d)
              setDirectionWrong(null)
              directionTries.clear()
            }} />
          ) : (
            <DirectionNote check={check} />
          ))}
          {phase !== 'direction' && (
            <>
              <p className="action-line" data-state={tries.phase === 'right' ? 'right' : undefined}>
                <span>{position + 1}) … = </span>
                <span className="action-slot action-slot--result" data-empty={!result || undefined}>
                  {result || '…'}
                  {!tries.done && <span className="caret" aria-hidden="true" />}
                </span>
                <span>
                  {' '}
                  ({action.unit}) — {action.explanation}
                  {last ? '.' : ';'}
                </span>
              </p>
              {phase === 'same' && (
                <section className="same-action" aria-label="У тебе така сама дія?">
                  <p className="direction-question">У тебе така сама дія?</p>
                  <div className="options">
                    <button type="button" className="option" onMouseDown={(e) => e.preventDefault()} onClick={() => answerSame(true)}>
                      Так, помилка в обчисленні
                    </button>
                    <button type="button" className="option" onMouseDown={(e) => e.preventDefault()} onClick={() => answerSame(false)}>
                      Ні, інша дія
                    </button>
                  </div>
                </section>
              )}
              {!tries.done && (
                <PaperHint
                  step="compute"
                  part={action.id}
                  question={check && !asked ? <HintDirection check={check} line={position} actionId={action.id} /> : PAPER_TEXT.compute.selfQuestion}
                  model={hintModel}
                  onModel={showByHint}
                />
              )}
              <div className="keypad-wrap" hidden={tries.done}>
                <Keypad
                  value={result}
                  onChange={(value) => {
                    if (tries.done) return
                    setResult(value)
                    tries.clear()
                  }}
                  onEnter={onMain}
                  disabled={tries.done}
                />
              </div>
            </>
          )}
        </>
      }
      dock={
        <Dock
          feedback={dockFeedback}
          label={phase === 'direction' ? (directionTries.done ? 'Далі' : 'Перевірити') : tries.done ? 'Далі' : 'Перевірити'}
          onMain={onMain}
          enterKey={phase === 'direction'}
        />
      }
    />
  )
}

/** Once the direction check has faded for a type, «Підказка» on the action asks it. Free: it doesn't count towards the fade. */
function HintDirection({ check, line, actionId }: { check: DirectionCheck; line: number; actionId: string }) {
  const { log } = useFlow()
  const [picked, setPicked] = useState<Direction | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  function pick(d: Direction) {
    if (done) return
    setPicked(d)
    const verdict = checkDirection(check, d)
    const right = verdict.kind === 'right'
    log({ kind: 'direction', step: 'compute', line, action: actionId, relationType: check.relationType, picked: d, right, viaHint: true })
    if (right) {
      setDone(true)
      setMessage(`Так. ${check.explain}`)
    } else setMessage(verdict.kind === 'wrong' ? verdict.hint : null)
  }

  return (
    <div className="hint-direction">
      <DirectionQuestion check={check} picked={picked} markedWrong={!done && picked ? picked : null} done={done} onPick={pick} />
      {message && <p className="hint-direction-message">{message}</p>}
    </div>
  )
}
