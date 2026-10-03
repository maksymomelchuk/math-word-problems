import { useState } from 'react'
import { findProblem } from '../problems/problems'
import { typePartName } from '../guided/typeStep/typeChecks'
import { loadTries, type TypeStepTry } from '../guided/typeStep/tryMode'
import { DEFAULT_TYPE_STEP_VARIANT, TYPE_STEP_VARIANTS, loadTypeStepVariant, saveTypeStepVariant, variantLabel, type TypeStepVariant } from '../guided/typeStep/variants'
import type { HelpEvent } from '../lib/progress'
import './typeVariantPanel.css'

const time = new Intl.DateTimeFormat('uk-UA', { dateStyle: 'medium', timeStyle: 'short' })

const TRY_PROBLEMS = ['2.3', '4.7']

function partName(problemId: string, part: string | undefined): string {
  if (!part) return ''
  if (part === 'diagram') return 'схема'
  if (part === 'types') return 'типи'
  const relations = findProblem(problemId)?.steps.typeDiagram?.relations ?? []
  return typePartName(relations, part) ?? part
}

function describeEvent(problemId: string, event: HelpEvent): string {
  const part = partName(problemId, event.part)
  return `${part ? `${part}: ` : ''}${event.help === 'shown' ? 'показано відповідь' : 'підказка'}`
}

function describeTry(entry: TypeStepTry): string {
  const events = entry.events.length ? entry.events.map((event) => describeEvent(entry.problemId, event)).join('; ') : 'без підказок'
  return `${entry.finishedAt ? '' : 'не завершено; '}${events}`
}

/**
 * For the parent: which version of Тип і схема she sees, a try of it on
 * either sample problem, and what the tries recorded.
 */
export function TypeVariantPanel({ tries = loadTries() }: { tries?: TypeStepTry[] }) {
  const [variant, setVariant] = useState<TypeStepVariant>(loadTypeStepVariant)

  function choose(next: TypeStepVariant) {
    saveTypeStepVariant(next)
    setVariant(next)
  }

  return (
    <section className="record variant-panel" aria-labelledby="variant-title">
      <h2 className="record-title" id="variant-title">
        Крок «Тип і схема»: який варіант показувати
      </h2>
      <p className="page-lead">Вибраний варіант діє в усіх задачах на цьому пристрої. У записах видно, який варіант вона бачила.</p>
      <div className="variant-options" role="radiogroup" aria-labelledby="variant-title">
        {TYPE_STEP_VARIANTS.map((option) => (
          <label key={option.id} className="variant-option" data-checked={variant === option.id || undefined}>
            <input type="radio" name="type-step-variant" value={option.id} checked={variant === option.id} onChange={() => choose(option.id)} />
            <span className="variant-text">
              <span className="variant-name">
                {variantLabel(option.id)}
                {option.id === DEFAULT_TYPE_STEP_VARIANT && <span className="variant-badge">рекомендовано</span>}
              </span>
              <span className="variant-about">{option.about}</span>
            </span>
          </label>
        ))}
      </div>
      <p className="variant-try">
        <span>Спробувати {variantLabel(variant)}:</span>
        {TRY_PROBLEMS.map((id) => (
          <a key={id} className="variant-try-link" href={`#/try/${id}`}>
            Задача {id}
          </a>
        ))}
      </p>
      {tries.length > 0 && (
        <details className="variant-tries">
          <summary>Спроби варіантів ({tries.length})</summary>
          <ol className="attempts">
            {tries
              .slice()
              .reverse()
              .map((entry) => (
                <li key={entry.startedAt}>
                  <p>
                    <strong>{time.format(new Date(entry.startedAt))}</strong>, задача {entry.problemId}, {variantLabel(entry.variant)}
                  </p>
                  <p className="attempt-events">{describeTry(entry)}</p>
                </li>
              ))}
          </ol>
        </details>
      )}
    </section>
  )
}
