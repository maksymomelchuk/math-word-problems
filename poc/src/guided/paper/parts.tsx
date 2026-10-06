import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { SelfCheck } from '../../fading/paperChecks'
import { FIX_IN_NOTEBOOK } from '../../fading/paperText'
import type { StepId } from '../../problems/types'
import { useFlow } from '../context'
import { TaskHeading } from '../layout/controls'
import { bringIntoView } from '../layout/scroll'

type PaperHintProps = {
  step: StepId
  part?: string
  /** The step's self-question, on the first tap. */
  question: ReactNode
  /** The model, on the second tap. Left out when the step has none. */
  model?: ReactNode
  /** The second tap shows the answer itself (a plan line, an action): the screen settles it as shown. */
  onModel?: () => void
  disabled?: boolean
}

/**
 * «Підказка» on a paper step: the first tap shows the step's self-question,
 * the second the model. Free, and recorded.
 */
export function PaperHint({ step, part, question, model, onModel, disabled }: PaperHintProps) {
  const { log } = useFlow()
  const [taps, setTaps] = useState(0)
  const most = model ? 2 : 1
  const shown = useRef<HTMLDivElement>(null)

  // What a tap reveals opens below the button: bring it into view.
  useEffect(() => {
    if (taps) bringIntoView(shown.current)
  }, [taps])

  function tap() {
    if (taps >= most) return
    const next = (taps + 1) as 1 | 2
    setTaps(next)
    log({ kind: 'hint', step, tap: next, ...(part ? { part } : {}) })
    if (next === 2) onModel?.()
  }

  return (
    <div className="paper-hint">
      <button type="button" className="hint-button" onMouseDown={(e) => e.preventDefault()} onClick={tap} disabled={disabled || taps >= most} aria-expanded={taps > 0}>
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z" />
        </svg>
        {taps === 1 && most === 2 ? 'Ще підказка' : 'Підказка'}
      </button>
      <div className="paper-hint-shown" ref={shown}>
        {taps >= 1 && <div className="hint-box">{question}</div>}
        {taps >= 2 && model && (
          <div className="hint-model">
            <p className="eyebrow">Зразок</p>
            {model}
          </div>
        )}
      </div>
    </div>
  )
}

/** Lines as on the squared notebook page: a model to compare her notebook with. */
export function ModelLines({ lines, label }: { lines: readonly string[]; label?: string }) {
  return (
    <div className="model">
      {label && <p className="eyebrow">{label}</p>}
      <div className="paper">
        {lines.map((line, i) => (
          <p key={i} className="paper-line">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

/** The heading of a paper step: a small «У зошит» over the step's title, then what to write. */
export function PaperHeading({ title, eyebrow = 'У зошит', children }: { title: string; eyebrow?: string; children?: ReactNode }) {
  return (
    <>
      <TaskHeading title={title} eyebrow={eyebrow} />
      {children && <div className="task-prompt">{children}</div>}
    </>
  )
}

type SelfChecksProps = {
  checks: readonly SelfCheck[]
  answers: Readonly<Record<string, boolean>>
  onAnswer: (id: string, yes: boolean) => void
}

/** Yes/no questions beside the model. After a «Ні»: «Виправ у зошиті.» */
export function SelfChecks({ checks, answers, onAnswer }: SelfChecksProps) {
  return (
    <section className="self-checks" aria-label="Перевір себе">
      <p className="eyebrow">Перевір свій запис</p>
      <ul>
        {checks.map((check) => {
          const answer = answers[check.id]
          return (
            <li key={check.id} className="self-check" data-answer={answer === undefined ? undefined : answer ? 'yes' : 'no'}>
              <p className="self-check-question">{check.question}</p>
              <div className="self-check-buttons" role="group" aria-label={check.question}>
                {[true, false].map((yes) => (
                  <button
                    key={String(yes)}
                    type="button"
                    className="yes-no"
                    data-yes={yes || undefined}
                    aria-pressed={answer === yes}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onAnswer(check.id, yes)}
                  >
                    {yes ? 'Так' : 'Ні'}
                  </button>
                ))}
              </div>
              {answer === false && <p className="self-check-fix">{FIX_IN_NOTEBOOK}</p>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** A short note over a step, such as the step-size line. */
export function StepNote({ children }: { children: ReactNode }) {
  return <p className="step-note">{children}</p>
}
