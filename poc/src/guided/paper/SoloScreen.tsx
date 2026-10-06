import { useState } from 'react'
import { Keypad } from '../../components/keypad/Keypad'
import { answersMatch } from '../../lib/decimal'
import { actionTokens } from '../checks'
import { useFlow } from '../context'
import { Dock } from '../layout/Dock'
import { FlowLayout } from '../layout/FlowLayout'
import { ProblemText } from '../layout/ProblemText'
import { OptionButton, TaskHeading } from '../layout/controls'
import type { Notebook } from '../flow'
import type { GuidedProblem } from '../../problems/types'
import type { Feedback } from '../useTries'
import './paper.css'

/** The whole write-up, as the model, once her solo answer is right. */
function wholeWriteUp(problem: GuidedProblem, notebook: Notebook): Notebook {
  const { writeUp, steps } = problem
  const main = writeUp.plans[0].actions
  return {
    ...notebook,
    questionFound: true,
    record: Object.fromEntries(writeUp.shortRecord.map((line) => [line.id, line.text])),
    diagram: steps.typeDiagram ? { ...steps.typeDiagram.diagram.slots } : null,
    plan: { plan: 0, order: main.map((_, i) => i) },
    lines: main.map((action) => action.id),
    computed: main.map(actionTokens),
    answered: true,
  }
}

/**
 * The solo try: the problem and her notebook. She writes the whole write-up
 * and types the final answer; «Розбий на кроки» is there at any time. A wrong
 * answer runs the step-by-step flow from the first step, and its checks find
 * where hers went off.
 */
export function SoloScreen() {
  const { problem, notebook, update, log, next } = useFlow()
  const parts = problem.writeUp.answerParts
  const [values, setValues] = useState<string[]>(() => parts.map(() => ''))
  const [active, setActive] = useState(() => Math.max(0, parts.findIndex((p) => p.kind === 'number')))
  const [wrong, setWrong] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>({ tone: 'none', message: '' })
  const hasNumbers = parts.some((p) => p.kind === 'number')

  function set(index: number, value: string) {
    if (wrong) return
    setValues((current) => current.map((v, i) => (i === index ? value : v)))
    setFeedback({ tone: 'none', message: '' })
  }

  function toSteps(reason: 'wrong' | 'break') {
    log({ kind: 'soloSwitch', step: 'start', reason })
    update((n) => ({ ...n, solo: 'switched' }))
    next()
  }

  function check() {
    if (wrong) return toSteps('wrong')
    if (values.some((v) => !v)) return setFeedback({ tone: 'info', message: parts.length > 1 ? 'Введи всі частини відповіді.' : 'Введи відповідь.' })
    const right = parts.every((part, i) => (part.kind === 'number' ? answersMatch(values[i], part.value) : values[i] === part.value))
    log({ kind: 'soloAnswer', step: 'start', value: values.join('; '), right })
    if (right) {
      update((n) => ({ ...wholeWriteUp(problem, n), solo: 'right' }))
      next()
      return
    }
    setWrong(true)
    setFeedback({ tone: 'bad', message: 'Не сходиться. Розберімо крок за кроком.' })
  }

  return (
    <FlowLayout
      text={<ProblemText parts={problem.text} questionFound={notebook.questionFound} />}
      task={
        <>
          <TaskHeading title="Розв’яжи сама" eyebrow="У зошит" />
          <p className="task-prompt">Запиши в зошит увесь розв’язок: короткий запис, схему, план і дії, відповідь. Потім введи відповідь тут.</p>
          <div className="solo-answer">
            {parts.map((part, i) =>
              part.kind === 'number' ? (
                <button
                  key={i}
                  type="button"
                  className="solo-field"
                  data-active={(i === active && !wrong) || undefined}
                  data-wrong={wrong || undefined}
                  aria-pressed={i === active}
                  aria-label={`${part.label ?? 'Відповідь'}: ${values[i] || 'порожньо'} ${part.unit}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setActive(i)}
                >
                  <span className="solo-field-label">{part.label ?? 'Відповідь'}:</span>
                  <span className="solo-field-value" data-empty={!values[i] || undefined}>
                    {values[i] || '…'}
                  </span>
                  <span className="solo-field-unit">{part.unit}</span>
                </button>
              ) : (
                <div key={i} className="solo-names">
                  <p className="eyebrow">{part.label ?? 'Хто?'}</p>
                  <div className="options options--row">
                    {part.options.map((option) => (
                      <OptionButton key={option} big state={values[i] === option ? (wrong ? 'wrong' : 'selected') : 'idle'} disabled={wrong} onClick={() => set(i, option)}>
                        {option}
                      </OptionButton>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
          {hasNumbers && (
            <div className="keypad-wrap" hidden={wrong}>
              <Keypad value={values[active] ?? ''} onChange={(value) => set(active, value)} onEnter={check} disabled={wrong} />
            </div>
          )}
          {!wrong && (
            <button type="button" className="secondary-button" onMouseDown={(e) => e.preventDefault()} onClick={() => toSteps('break')}>
              Розбий на кроки
            </button>
          )}
        </>
      }
      dock={<Dock feedback={feedback} label={wrong ? 'Далі' : 'Перевірити'} onMain={check} enterKey={false} />}
    />
  )
}
