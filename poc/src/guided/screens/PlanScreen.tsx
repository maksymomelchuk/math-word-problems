import { useState } from 'react'
import { matchPlan, type Verdict } from '../checks'
import { useFlow } from '../context'
import { shownSlotCount } from '../flow'
import { Dock } from '../layout/Dock'
import { FlowLayout } from '../layout/FlowLayout'
import { ProblemText } from '../layout/ProblemText'
import { OptionButton, TaskHeading } from '../layout/controls'
import { useTries } from '../useTries'

/**
 * План: she puts the cards (what each action finds) into numbered slots.
 * Every valid plan is accepted, swappable actions in either order; one card
 * is a distractor. Without a slot count she decides how many actions.
 */
export function PlanScreen() {
  const { problem, notebook, play, update, next } = useFlow()
  const tries = useTries('plan')
  const step = problem.steps.plan!
  const { plans } = problem.writeUp
  const slots = shownSlotCount(problem, play)
  const capacity = slots ?? step.cards.length
  const [order, setOrder] = useState<string[]>([])
  const [wrong, setWrong] = useState(false)

  function add(card: string) {
    if (tries.done || order.length >= capacity) return
    setOrder([...order, card])
    setWrong(false)
    tries.clear()
  }

  function remove(position: number) {
    if (tries.done) return
    setOrder(order.filter((_, i) => i !== position))
    setWrong(false)
    tries.clear()
  }

  function check() {
    const match = matchPlan(plans, step, order, slots)
    const verdict: Verdict = match.kind === 'right' ? { kind: 'right' } : match
    tries.submit(verdict, {
      explain: match.kind === 'right' && match.plan > 0 ? 'Це теж правильний план.' : undefined,
      shownExplain: step.orderHint,
      onHint: () => setWrong(true),
      reveal: () => {
        setOrder(plans[0].actions.map((action) => action.id))
        setWrong(false)
      },
      settle: (shown) => {
        const chosen = shown || match.kind !== 'right' ? { plan: 0, order: plans[0].actions.map((_, i) => i) } : { plan: match.plan, order: match.order }
        update((n) => ({ ...n, plan: chosen }))
      },
    })
  }

  const cardText = (id: string) => step.cards.find((card) => card.id === id)?.text ?? ''
  const rows = slots ?? Math.min(capacity, order.length + (tries.done ? 0 : 1))
  let state: 'right' | 'wrong' | undefined
  if (tries.done) state = 'right'
  else if (wrong) state = 'wrong'

  return (
    <FlowLayout
      text={<ProblemText parts={problem.text} questionFound={notebook.questionFound} />}
      task={
        <>
          <TaskHeading title="Склади план" />
          <p className="task-prompt">
            Що знайдеш першою дією, а що — потім? Кожна картка — це те, що знаходить одна дія.
            {slots !== null ? ` Дій: ${slots}.` : ' Скільки дій, тут не підказано: бери стільки карток, скільки потрібно.'}
          </p>
          <ol className="plan-slots" data-state={state}>
            {Array.from({ length: rows }, (_, i) => {
              const card = order[i]
              return (
                <li key={i}>
                  <button
                    type="button"
                    className="plan-slot"
                    data-filled={card ? '' : undefined}
                    disabled={tries.done || !card}
                    aria-label={card ? `Дія ${i + 1}: ${cardText(card)}. Торкнись, щоб прибрати.` : `Дія ${i + 1}: порожньо`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => remove(i)}
                  >
                    <span className="plan-slot-number">{i + 1})</span>
                    <span className="plan-slot-text">{card ? cardText(card) : '…'}</span>
                  </button>
                </li>
              )
            })}
          </ol>
          {!tries.done && (
            <>
              <p className="eyebrow">Картки</p>
              <div className="options">
                {step.cards
                  .filter((card) => !order.includes(card.id))
                  .map((card) => (
                    <OptionButton key={card.id} state="idle" disabled={order.length >= capacity} onClick={() => add(card.id)}>
                      {card.text}
                    </OptionButton>
                  ))}
              </div>
            </>
          )}
        </>
      }
      dock={<Dock feedback={tries.feedback} label={tries.done ? 'Далі' : 'Перевірити'} onMain={tries.done ? next : check} />}
    />
  )
}
