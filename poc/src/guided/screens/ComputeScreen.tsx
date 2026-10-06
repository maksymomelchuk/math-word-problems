import { useLayoutEffect, useRef, useState } from 'react'
import { Keypad } from '../../components/keypad/Keypad'
import { DIRECTIONS, SIGNS, type Direction, type DirectionCheck } from '../../problems/types'
import { actionTokens, appendToken, checkAction, checkDirection, directionStatement, shownAction } from '../checks'
import { useFlow } from '../context'
import { numberChips, plannedActions } from '../flow'
import { Dock } from '../layout/Dock'
import { FlowLayout } from '../layout/FlowLayout'
import { ProblemText } from '../layout/ProblemText'
import { Chip, OptionButton, TaskHeading } from '../layout/controls'
import { optionState } from '../layout/optionState'
import { bringIntoView } from '../layout/scroll'
import { useTries } from '../useTries'
import { lineText } from '../../fading/plan'

const SIGN_NAMES = { '+': 'плюс', '−': 'мінус', '·': 'помножити', ':': 'поділити' } as const
const DIRECTION_LABELS: Record<Direction, string> = { більше: 'Більше', менше: 'Менше' }

/**
 * Обчисли, one screen per action of her plan. When the data gives the action
 * a direction check, she first says whether its result is more or less than a
 * number she knows. Then she builds the action from number chips and one
 * sign, works it out herself, and types the result on the keypad. A wrong sign
 * gets its own hint, any other wrong action the action's hint, and a wrong
 * result is an arithmetic slip.
 */
export function ComputeScreen({ position }: { position: number }) {
  const { problem, notebook, update, next } = useFlow()
  const tries = useTries('compute')
  const directionTries = useTries('compute')
  const chosen = notebook.plan ?? { plan: 0, order: problem.writeUp.plans[0].actions.map((_, i) => i) }
  const actions = plannedActions(problem, chosen)
  const action = actions[position]
  const check = action.direction
  const chips = numberChips(
    problem,
    actions.slice(0, position).map((a) => a.result),
  )
  const [building, setBuilding] = useState(!check)
  const [direction, setDirection] = useState<Direction | null>(null)
  const [directionWrong, setDirectionWrong] = useState<Direction | null>(null)
  const [tokens, setTokens] = useState<string[]>([])
  const [result, setResult] = useState('')
  const [wrong, setWrong] = useState<'action' | 'result' | null>(null)
  const builderRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (building && check) bringIntoView(builderRef.current)
  }, [building, check])

  function pickDirection(picked: Direction) {
    if (directionTries.done) return
    setDirection(picked)
    setDirectionWrong(null)
    directionTries.clear()
  }

  function checkDirectionPick() {
    if (!check) return
    directionTries.submit(checkDirection(check, direction), {
      part: `${action.id}-direction`,
      explain: check.explain,
      onHint: () => setDirectionWrong(direction),
    })
  }

  function tapChip(token: string) {
    if (tries.done) return
    setTokens(appendToken(tokens, token))
    if (wrong === 'action') setWrong(null)
    tries.clear()
  }

  function erase() {
    if (tries.done) return
    setTokens(tokens.slice(0, -1))
    if (wrong === 'action') setWrong(null)
    tries.clear()
  }

  function type(value: string) {
    if (tries.done) return
    setResult(value)
    if (wrong === 'result') setWrong(null)
    tries.clear()
  }

  function checkBuilt() {
    const verdict = checkAction(tokens, result, action)
    tries.submit(verdict, {
      part: action.id,
      shownExplain: shownAction(action),
      onHint: () => setWrong(verdict.kind === 'wrong' && verdict.slip ? 'result' : 'action'),
      reveal: () => {
        setTokens(actionTokens(action))
        setResult(action.result)
        setWrong(null)
      },
      settle: (shown) =>
        update((n) => {
          const computed = [...n.computed]
          computed[position] = shown ? actionTokens(action) : tokens
          return { ...n, computed }
        }),
    })
  }

  const done = tries.done
  return (
    <FlowLayout
      text={<ProblemText parts={problem.text} questionFound={notebook.questionFound} />}
      task={
        <>
          <TaskHeading title="Обчисли" eyebrow={`Дія ${position + 1} з ${actions.length}`} />
          <p className="task-prompt">Знайди: {lineText(problem, action.id)}.</p>
          {check &&
            (building ? (
              <DirectionNote check={check} />
            ) : (
              <DirectionQuestion check={check} picked={direction} markedWrong={directionWrong} done={directionTries.done} onPick={pickDirection} />
            ))}
          <p className="action-line" data-state={done ? 'right' : undefined}>
            <span>{position + 1}) </span>
            <span className="action-slot" data-wrong={wrong === 'action' || undefined} data-empty={!tokens.length || undefined}>
              {tokens.length ? tokens.join(' ') : '…'}
            </span>
            <span> = </span>
            <span className="action-slot action-slot--result" data-wrong={wrong === 'result' || undefined} data-empty={!result || undefined}>
              {result || '…'}
              {building && !done && <span className="caret" aria-hidden="true" />}
            </span>
            <span>
              {' '}
              ({action.unit}) — {action.explanation}
              {position === actions.length - 1 ? '.' : ';'}
            </span>
          </p>
          {building && (
            <div className="builder" ref={builderRef} data-after-check={check ? true : undefined}>
              {!done && (
                <>
                  <p className="eyebrow">Дія: торкнись чисел і знака</p>
                  <div className="chips" role="group" aria-label="Числа і знаки">
                    {chips.map((chip) => (
                      <Chip key={chip} onClick={() => tapChip(chip)}>
                        {chip}
                      </Chip>
                    ))}
                    {SIGNS.map((sign) => (
                      <Chip key={sign} kind="sign" label={SIGN_NAMES[sign]} selected={tokens[tokens.length - 1] === sign} onClick={() => tapChip(sign)}>
                        <span className={sign === '·' ? 'sign-dot' : undefined}>{sign}</span>
                      </Chip>
                    ))}
                    <Chip kind="tool" label="Стерти останнє в дії" onClick={erase} disabled={!tokens.length}>
                      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7z" />
                        <path d="m12 9.5 5 5m0-5-5 5" />
                      </svg>
                    </Chip>
                  </div>
                  <p className="eyebrow">Результат: порахуй (можна на папері) і введи</p>
                </>
              )}
              <div className="keypad-wrap" hidden={done}>
                <Keypad value={result} onChange={type} onEnter={done ? next : checkBuilt} disabled={done} />
              </div>
            </div>
          )}
        </>
      }
      dock={
        building ? (
          <Dock feedback={tries.feedback} label={done ? 'Далі' : 'Перевірити'} onMain={done ? next : checkBuilt} enterKey={false} />
        ) : (
          <Dock
            feedback={directionTries.feedback}
            label={directionTries.done ? 'Далі' : 'Перевірити'}
            onMain={directionTries.done ? () => setBuilding(true) : checkDirectionPick}
          />
        )
      }
    />
  )
}

type DirectionQuestionProps = {
  check: DirectionCheck
  picked: Direction | null
  markedWrong: Direction | null
  done: boolean
  onPick: (picked: Direction) => void
}

/** The direction check, before she builds the action: «За 20 хв він пройде більше чи менше, ніж 3000 м?» */
export function DirectionQuestion({ check, picked, markedWrong, done, onPick }: DirectionQuestionProps) {
  const at = (d: Direction | null) => (d === null ? null : DIRECTIONS.indexOf(d))
  return (
    <section className="direction" aria-label="Більше чи менше?">
      <p className="eyebrow">Спершу подумай</p>
      <p className="direction-question">{check.question}</p>
      <div className="options options--row">
        {DIRECTIONS.map((d, i) => (
          <OptionButton key={d} big state={optionState(i, at(picked), at(check.answer)!, done, at(markedWrong))} disabled={done} onClick={() => onPick(d)}>
            {DIRECTION_LABELS[d]}
          </OptionButton>
        ))}
      </div>
    </section>
  )
}

/** The direction check's answer, kept in view while she builds the action. */
export function DirectionNote({ check }: { check: DirectionCheck }) {
  return (
    <p className="direction-note">
      <span className="eyebrow">Ти вже знаєш</span>
      <span>{directionStatement(check)}</span>
    </p>
  )
}
