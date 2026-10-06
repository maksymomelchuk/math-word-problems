import { useState } from 'react'
import { directionActive, learnerState } from '../fading/learner'
import type { StageSwitch } from '../fading/play'
import { loadStageSwitch, saveStageSwitch } from '../fading/stageSwitch'
import { STAGES, STAGE_IDS, type StageId } from '../fading/stages'
import type { Progress } from '../lib/progress'
import { PROBLEM_TYPES } from '../problems/types'
import './typeVariantPanel.css'

const TRY_PROBLEMS = ['2.3', '4.7']

const STEP_SIZES = [
  { id: 'auto', name: 'Як у неї зараз' },
  { id: 'small', name: 'Малі кроки: план по одній дії' },
  { id: 'big', name: 'Великі кроки: спершу весь план' },
] as const

/**
 * For the parent: play any problem at any stage of the fading, in small or big
 * steps, before the other problems' data exists. Plays with the switch on are
 * marked as checks and don't move her through the stages.
 */
export function StageSwitchPanel({ progress }: { progress: Progress }) {
  const [value, setValue] = useState<StageSwitch | null>(loadStageSwitch)
  const state = learnerState(progress)
  const faded = PROBLEM_TYPES.filter((type) => !directionActive(state, type.id)).map((type) => `«${type.name}»`)

  function choose(next: StageSwitch | null) {
    saveStageSwitch(next)
    setValue(next)
  }

  const ownPlan = value && ['3', '4a', '4b', '4c'].includes(value.stage)

  return (
    <details className="record variant-panel stage-panel" open={!!value || undefined}>
      <summary className="record-title" id="stage-title">
        Етап задач: {value ? `перемикач увімкнено, етап ${STAGES[value.stage].label}` : 'за номером задачі (перемикач для перевірки)'}
      </summary>
      <p className="page-lead">
        Звичайно кожна задача йде на етапі свого номера. Перемикач грає всі задачі на вибраному етапі, щоб перевірити 2.3 і 4.7 на будь-якому. Такі спроби позначено в записах «перевірка», і вони не
        просувають її етапами. Відкрита задача після зміни починається спочатку. Перед її навчанням вимкніть перемикач.
      </p>
      <div className="variant-options" role="radiogroup" aria-labelledby="stage-title">
        <label className="variant-option" data-checked={!value || undefined}>
          <input type="radio" name="stage" checked={!value} onChange={() => choose(null)} />
          <span className="variant-text">
            <span className="variant-name">Вимкнено: етап за номером задачі</span>
            <span className="variant-about">Так вона гратиме під час навчання.</span>
          </span>
        </label>
        {STAGE_IDS.map((id: StageId) => (
          <label key={id} className="variant-option" data-checked={value?.stage === id || undefined}>
            <input type="radio" name="stage" checked={value?.stage === id} onChange={() => choose({ stage: id, stepSize: value?.stepSize ?? 'auto' })} />
            <span className="variant-text">
              <span className="variant-name">Етап {STAGES[id].label}</span>
              <span className="variant-about">{STAGES[id].about}</span>
            </span>
          </label>
        ))}
      </div>
      {ownPlan && value && (
        <div className="variant-options step-size-options" role="radiogroup" aria-label="Крок плану">
          {STEP_SIZES.map((size) => (
            <label key={size.id} className="variant-option" data-checked={value.stepSize === size.id || undefined}>
              <input type="radio" name="step-size" checked={value.stepSize === size.id} onChange={() => choose({ ...value, stepSize: size.id })} />
              <span className="variant-text">
                <span className="variant-name">
                  {size.name}
                  {size.id === 'auto' && ` (зараз: ${state.stepSize === 'big' ? 'великі' : 'малі'})`}
                </span>
              </span>
            </label>
          ))}
        </div>
      )}
      <p className="variant-try">
        <span>{value ? `Грати на етапі ${STAGES[value.stage].label}:` : 'Відкрити:'}</span>
        {TRY_PROBLEMS.map((id) => (
          <a key={id} className="variant-try-link" href={`#/problem/${id}`}>
            Задача {id}
          </a>
        ))}
      </p>
      <p className="page-lead">
        Її план зараз: {state.stepSize === 'big' ? 'великі кроки (спершу весь план)' : 'малі кроки (по одній дії)'}. Перевірка «більше чи менше»{' '}
        {faded.length ? `уже не питається для: ${faded.join(', ')}.` : 'питається для всіх типів.'}
      </p>
    </details>
  )
}
