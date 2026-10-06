import { useState } from 'react'
import { PLAN_MISS_HINT, askedWords, lineOptions, ordinal, ordinalWith, planFromLines } from '../../fading/plan'
import { FIX_IN_NOTEBOOK, planSelfQuestion } from '../../fading/paperText'
import { STEP_MOVE_LINES } from '../../fading/stages'
import { useFlow } from '../context'
import { Dock } from '../layout/Dock'
import { FlowLayout } from '../layout/FlowLayout'
import { ProblemText } from '../layout/ProblemText'
import { OptionButton, TaskHeading } from '../layout/controls'
import type { ChoiceState } from '../layout/controls'
import { useTries, type Feedback } from '../useTries'
import { ModelLines, PaperHeading, PaperHint, StepNote } from './parts'
import './paper.css'

/**
 * One line of her own plan, from 3.1. In small steps she first writes it
 * («Про що дізнаєшся першою дією?»), then picks what it finds; in big steps
 * she has written the whole plan and picks each line in turn. The options are
 * every quantity a valid plan can find now, the asked quantity while it's too
 * early, and «Інше». A miss gets the school's question, then the valid lines
 * with «Виправ у зошиті», and she carries on from a valid one.
 */
export function PlanLineScreen({ line, big }: { line: number; big: boolean }) {
  const { problem, notebook, play, update, log, next } = useFlow()
  const { plans } = problem.writeUp
  const lines = notebook.lines ?? []
  const before = lines.slice(0, line)
  const options = lineOptions(problem, before)
  const valid = options.filter((o) => o.right).map((o) => o.id)
  const tries = useTries('plan', { silent: true })
  const [settled] = useState(() => lines[line])
  const [phase, setPhase] = useState<'write' | 'pick'>(big || settled ? 'pick' : 'write')
  const [picked, setPicked] = useState<string | null>(settled ?? null)
  const [markedWrong, setMarkedWrong] = useState<string | null>(null)
  /** The valid lines were shown: by a second miss or a second «Підказка». */
  const [revealed, setRevealed] = useState(false)
  const [note, setNote] = useState<Feedback | null>(null)
  const [viaHint, setViaHint] = useState(false)
  const done = !!settled || tries.phase === 'right'
  const choosing = revealed && !done

  function settle(id: string) {
    update((n) => {
      const next = [...(n.lines ?? []).slice(0, line), id]
      return { ...n, lines: next, plan: planFromLines(plans, next) }
    })
  }

  function shownMessage(): string {
    const words = valid.map((id) => `«${options.find((o) => o.id === id)?.text}»`).join(' або ')
    const many = valid.length > 1 ? ' Вибери, що в тебе.' : ''
    return `${capital(ordinalWith(line))} дією можна знайти ${words}. ${FIX_IN_NOTEBOOK}${many}`
  }

  function reveal() {
    setRevealed(true)
    setMarkedWrong(null)
    setPicked(valid.length === 1 ? valid[0] : null)
  }

  function pick(id: string) {
    if (done) return
    if (choosing) {
      if (valid.includes(id)) setPicked(id)
      setNote(null)
      return
    }
    if (tries.done) return
    setPicked(id)
    setMarkedWrong(null)
    tries.clear()
  }

  function check() {
    if (picked === null) return tries.submit({ kind: 'empty', message: 'Вибери, що знаходить ця дія.' })
    const right = valid.includes(picked)
    tries.submit(right ? { kind: 'right' } : { kind: 'wrong', hint: PLAN_MISS_HINT }, {
      explain: big ? undefined : 'Тепер обчисли цю дію.',
      shownExplain: shownMessage(),
      onHint: () => setMarkedWrong(picked),
      reveal,
      settle: (shown) => {
        if (!shown) settle(picked)
      },
      onTry: ({ right: ok, shown }) => log({ kind: 'planLine', step: 'plan', line, picked, right: ok, ...(shown ? { shown: true } : {}) }),
    })
  }

  function onMain() {
    if (phase === 'write') return setPhase('pick')
    if (done) return next()
    if (choosing) {
      if (!picked) return setNote({ tone: 'info', message: 'Вибери рядок, який у тебе в зошиті.' })
      if (viaHint) log({ kind: 'planLine', step: 'plan', line, picked, right: true, shown: true })
      settle(picked)
      return next()
    }
    check()
  }

  function state(id: string): ChoiceState {
    if (done) return id === picked ? 'right' : 'idle'
    if (revealed) {
      if (id === picked) return 'selected'
      return valid.includes(id) ? 'right' : id === markedWrong ? 'wrong' : 'idle'
    }
    if (id === markedWrong) return 'wrong'
    return id === picked ? 'selected' : 'idle'
  }

  const validModel = <ModelLines lines={valid.map((id) => `${line + 1}) … — ${options.find((o) => o.id === id)?.text}`)} />
  const onHintModel = () => {
    setViaHint(true)
    tries.show({ message: shownMessage(), reveal })
  }
  const moveNote = !big && line === 0 && play.stepMove === 'small' ? <StepNote>{STEP_MOVE_LINES.small}</StepNote> : null

  return (
    <FlowLayout
      text={<ProblemText parts={problem.text} questionFound={notebook.questionFound} />}
      task={
        phase === 'write' ? (
          <>
            {moveNote}
            <PaperHeading title="План" eyebrow={`Дія ${line + 1}, у зошит`}>
              Про що дізнаєшся {ordinalWith(line)} дією? Запиши в зошит «{line + 1})» і після риски — що знаходиш. Обчислення — потім.
            </PaperHeading>
            <PaperHint step="plan" part={`line-${line + 1}`} question={planSelfQuestion(askedWords(problem))} model={validModel} onModel={onHintModel} />
          </>
        ) : (
          <>
            <TaskHeading title={big ? `Що знаходить ${ordinal(line)} дія твого плану?` : `Що знаходить твоя ${ordinal(line)} дія?`} eyebrow={big ? `Рядок ${line + 1} плану` : `Дія ${line + 1}`} />
            <div className="options">
              {options.map((option) => (
                <OptionButton key={option.id} state={state(option.id)} disabled={done || (tries.done && !choosing) || (choosing && !valid.includes(option.id))} onClick={() => pick(option.id)}>
                  {option.text}
                </OptionButton>
              ))}
            </div>
            {big && !done && !revealed && (
              <PaperHint step="plan" part={`line-${line + 1}`} question={planSelfQuestion(askedWords(problem))} model={validModel} onModel={onHintModel} />
            )}
          </>
        )
      }
      dock={
        <Dock
          feedback={note ?? (phase === 'write' ? { tone: 'none', message: '' } : tries.feedback)}
          label={phase === 'write' ? 'Готово' : done || choosing ? 'Далі' : 'Перевірити'}
          onMain={onMain}
        />
      }
    />
  )
}

function capital(word: string): string {
  return word.charAt(0).toLocaleUpperCase('uk') + word.slice(1)
}
