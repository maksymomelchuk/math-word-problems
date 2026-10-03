import { useState } from 'react'
import { PROBLEMS } from '../problems/problems'
import { STEP_NAMES, type GuidedProblem, type StepId } from '../problems/types'
import { loadProgress, resetProgress, type Attempt, type HelpEvent } from '../lib/progress'
import { clearSession } from '../guided/session'
import { typePartName } from '../guided/typeStep/typeChecks'
import { clearTries } from '../guided/typeStep/tryMode'
import { variantLabel } from '../guided/typeStep/variants'
import { TypeVariantPanel } from './TypeVariantPanel'
import './screens.css'

const time = new Intl.DateTimeFormat('uk-UA', { dateStyle: 'medium', timeStyle: 'short' })

const PART_NAMES: Record<string, string> = {
  question: 'питання в тексті',
  unknown: 'що шукаємо',
  why: '«Чому?»',
  types: 'типи',
  diagram: 'схема',
}

/** The part of a step in words: the number, the comparison or the action itself. */
function partName(problem: GuidedProblem, step: StepId, part: string): string {
  if (PART_NAMES[part]) return PART_NAMES[part]
  if (part.startsWith('hidden-')) return 'приховане'
  if (step === 'typeDiagram') return typePartName(problem.steps.typeDiagram?.relations ?? [], part) ?? part
  if (step === 'given') return `«${problem.text.find((p) => p.number === part)?.text ?? part}»`
  if (step === 'decode') {
    const id = part.replace(/-flip$/, '')
    const sentence = problem.steps.decode?.comparisons.find((c) => c.id === id)?.sentence ?? id
    return part.endsWith('-flip') ? `«${sentence}», від шуканого` : `«${sentence}», хто більший`
  }
  if (step === 'compute') {
    const id = part.replace(/-direction$/, '')
    const explanation = problem.writeUp.plans.flatMap((p) => p.actions).find((a) => a.id === id)?.explanation ?? id
    return part.endsWith('-direction') ? `${explanation}, більше чи менше` : explanation
  }
  return part
}

function helpName(event: HelpEvent): string {
  if (event.slip) return event.help === 'shown' ? 'помилка в обчисленні, показано' : 'помилка в обчисленні'
  return event.help === 'shown' ? 'показано відповідь' : 'підказка'
}

function describe(problem: GuidedProblem, attempt: Attempt): string {
  if (!attempt.events.length) return 'без підказок'
  return attempt.events
    .map((event) => {
      const part = event.part ? ` (${partName(problem, event.step, event.part)})` : ''
      const sign = event.sign ? `, знак «${event.sign}»` : ''
      return `${STEP_NAMES[event.step]}${part}: ${helpName(event)}${sign}`
    })
    .join('; ')
}

/**
 * For the parent, at `#/parent`: what is recorded on this device (every
 * attempt, with its hints, shown answers and arithmetic slips), and a reset.
 * Not linked from her screens.
 */
export function ParentView() {
  const [progress, setProgress] = useState(loadProgress)

  function reset() {
    if (!window.confirm('Стерти всі записи на цьому пристрої? Цього не можна скасувати.')) return
    resetProgress()
    clearSession()
    clearTries()
    setProgress(loadProgress())
  }

  return (
    <div className="page page--parent">
      <header className="page-header">
        <h1 className="page-title">Для батьків</h1>
        <p className="page-lead">Що записано на цьому пристрої. Записи нікуди не надсилаються.</p>
      </header>
      <main>
        <TypeVariantPanel />
        {PROBLEMS.map((problem) => {
          const attempts = progress.problems[problem.id]?.attempts ?? []
          return (
            <section key={problem.id} className="record">
              <h2 className="record-title">
                {problem.id} · {problem.story}
              </h2>
              {!attempts.length ? (
                <p className="record-empty">Ще не відкривали.</p>
              ) : (
                <ol className="attempts">
                  {attempts.map((attempt) => (
                    <li key={attempt.startedAt}>
                      <p>
                        <strong>{time.format(new Date(attempt.startedAt))}</strong>
                        {attempt.finishedAt ? ` — розв'язано о ${time.format(new Date(attempt.finishedAt))}` : ' — не завершено'}
                        {attempt.plan !== undefined && `, план ${attempt.plan + 1}`}
                        {attempt.variants?.typeDiagram && `, «Тип і схема»: ${variantLabel(attempt.variants.typeDiagram)}`}
                      </p>
                      <p className="attempt-events">{describe(problem, attempt)}</p>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          )
        })}
        <div className="parent-actions">
          <a className="text-link" href="#/">
            До задач
          </a>
          <a className="text-link" href="#/diagrams">
            Зразки схем
          </a>
          <button type="button" className="danger-button" onClick={reset}>
            Стерти записи
          </button>
        </div>
      </main>
    </div>
  )
}
