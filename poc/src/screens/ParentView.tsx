import { useState } from 'react'
import { HOMEWORK } from '../problems/homework'
import { PROBLEMS } from '../problems/problems'
import { loadProgress, resetProgress } from '../lib/progress'
import { clearSession } from '../guided/session'
import { clearTries } from '../guided/typeStep/tryMode'
import { saveStageSwitch } from '../fading/stageSwitch'
import { describeAttemptHeading, describeHelp, describeLog } from './logWords'
import { StageSwitchPanel } from './StageSwitchPanel'
import { TrialSummary } from './TrialSummary'
import { TypeVariantPanel } from './TypeVariantPanel'
import './screens.css'

/**
 * For the parent, at `#/parent`: the trial records at a glance (what had to
 * be shown, her solo tries, a text copy), the switches, then every attempt
 * (her homework's last) with its minutes, hints, shown answers and arithmetic
 * slips, and a reset.
 * Not linked from her screens.
 */
export function ParentView() {
  const [progress, setProgress] = useState(loadProgress)

  function reset() {
    if (
      !window.confirm(
        'Стерти всі записи на цьому пристрої? Цього не можна скасувати. Якщо потрібна копія, спершу натисніть «Скопіювати записи» вгорі. Перемикач етапів теж вимкнеться.',
      )
    )
      return
    resetProgress()
    clearSession()
    clearTries()
    saveStageSwitch(null)
    setProgress(loadProgress())
  }

  return (
    <div className="page page--parent">
      <header className="page-header">
        <a className="page-back" href="#/">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 6 8.5 12l6 6" />
          </svg>
          До задач
        </a>
        <h1 className="page-title">Для батьків</h1>
        <p className="page-lead">Що записано на цьому пристрої. Записи нікуди не надсилаються.</p>
      </header>
      <main>
        <TrialSummary progress={progress} />
        <StageSwitchPanel progress={progress} />
        <TypeVariantPanel />
        <h2 className="records-heading">Усі спроби</h2>
        {[...PROBLEMS, ...HOMEWORK.map((homework) => homework.problem)].map((problem) => {
          const attempts = progress.problems[problem.id]?.attempts ?? []
          return (
            <section key={problem.id} className="record">
              <h3 className="record-title">
                {problem.id} · {problem.story}
              </h3>
              {!attempts.length ? (
                <p className="record-empty">Ще не відкривали.</p>
              ) : (
                <ol className="attempts">
                  {attempts.map((attempt) => {
                    const heading = describeAttemptHeading(attempt)
                    return (
                      <li key={attempt.startedAt}>
                        <p>
                          <strong>{heading.when}</strong>
                          {heading.rest}
                        </p>
                        {(attempt.events.length > 0 || !attempt.log?.length) && <p className="attempt-events">{describeHelp(problem, attempt)}</p>}
                        {!!attempt.log?.length && (
                          <ul className="attempt-log">
                            {describeLog(problem, attempt).map((line, i) => (
                              <li key={i}>{line}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
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
