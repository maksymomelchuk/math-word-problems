import { useState } from 'react'
import { Diagrams } from '../../diagrams/Diagrams'
import { DIAGRAM_CHECK, answerSelfCheck, askedLines, biggerQuestions, diagramPickAnswer, diagramPickHint, recordSelfChecks, restatedLines, restatedSentences } from '../../fading/paperChecks'
import { FIX_IN_NOTEBOOK, PAPER_TEXT } from '../../fading/paperText'
import { PROBLEM_TYPES, type AnswerPart } from '../../problems/types'
import { TYPE_FAMILIES, FAMILY_GUIDE } from '../../problems/typeGuide'
import type { Verdict } from '../checks'
import { useFlow } from '../context'
import { stepGuidance, type PaperStep } from '../flow'
import { Dock } from '../layout/Dock'
import { FlowLayout } from '../layout/FlowLayout'
import { ProblemText } from '../layout/ProblemText'
import { OptionButton, TaskHeading } from '../layout/controls'
import { optionState } from '../layout/optionState'
import { TypePicture } from '../typeStep/TypePicture'
import { loadTypeStepVariant } from '../typeStep/variants'
import { useTries, type Feedback } from '../useTries'
import { ModelLines, PaperHeading, PaperHint, SelfChecks } from './parts'
import { useSelfChecks } from './useSelfChecks'
import './paper.css'

const NO_FEEDBACK: Feedback = { tone: 'none', message: '' }

/**
 * A paper step, always one at a time: the heading, «Готово» once she has
 * written that part in her notebook, then that part's check before the next
 * step opens.
 */
export function PaperStepScreen({ step }: { step: PaperStep }) {
  switch (step) {
    case 'retell':
    case 'asked':
      return <HeadingOnly step={step} />
    case 'given':
      return <ShortRecord />
    case 'decode':
      return <PaperDecode />
    case 'typeDiagram':
      return <PaperDiagram />
    case 'answer':
      return <PaperAnswer />
  }
}

/** The problem text, on top of every screen. */
function Text() {
  const { problem, notebook } = useFlow()
  return <ProblemText parts={problem.text} questionFound={notebook.questionFound} />
}

/** Перекажи and Знайти have no check of their own: a heading and «Готово». Знайти's «?» is checked with the short record. */
function HeadingOnly({ step }: { step: 'retell' | 'asked' }) {
  const { problem, next } = useFlow()
  const text = PAPER_TEXT[step]
  const right = (options: { text: string; right?: true }[] | undefined) => options?.find((o) => o.right)?.text
  const asked = askedLines(problem.writeUp).map((line) => line.text)
  const model =
    step === 'retell'
      ? right(problem.steps.retell?.options as { text: string; right?: true }[] | undefined)
      : asked.length
        ? asked.join('; ')
        : right(problem.steps.asked?.choice.options as { text: string; right?: true }[] | undefined)
  return (
    <FlowLayout
      text={<Text />}
      task={
        <>
          <PaperHeading title={text.title} eyebrow={step === 'retell' ? 'Подумки' : 'Подумки, потім у зошит'}>
            {text.prompt}
          </PaperHeading>
          <PaperHint step={step} question={text.selfQuestion} model={model ? <p className="hint-model-text">{model}</p> : undefined} />
        </>
      }
      dock={<Dock feedback={NO_FEEDBACK} label="Готово" onMain={next} />}
    />
  )
}

/** The short record on paper (3.1 on): then the model, with «Шукане…», the units, and each comparison from the unknown's side. */
function ShortRecord() {
  const { problem, play, update, next } = useFlow()
  const [checking, setChecking] = useState(false)
  const lines = problem.writeUp.shortRecord.map((line) => line.text)
  const checks = recordSelfChecks(problem.writeUp)
  const self = useSelfChecks(checks)
  const [feedback, setFeedback] = useState<Feedback>(NO_FEEDBACK)
  // In Level 3 the decode runs first, so its restated sentences stay on screen for her to write in.
  const restated = stepGuidance(problem, 'decode', play).mode === 'guided' ? restatedSentences(problem) : []

  function onNext() {
    if (!self.complete) return setFeedback({ tone: 'info', message: 'Відповідай на кожне питання: так чи ні.' })
    // The model goes into the notebook on screen once she has checked hers against it.
    update((n) => ({ ...n, questionFound: true, record: Object.fromEntries(problem.writeUp.shortRecord.map((line) => [line.id, line.text])) }))
    next()
  }

  return (
    <FlowLayout
      text={<Text />}
      task={
        !checking ? (
          <>
            <PaperHeading title={PAPER_TEXT.given.title}>{PAPER_TEXT.given.prompt}</PaperHeading>
            {restated.length > 0 && (
              <div className="restated">
                <p className="eyebrow">Порівняння, від шуканого</p>
                <ul>
                  {restated.map((sentence) => (
                    <li key={sentence}>{sentence}</li>
                  ))}
                </ul>
              </div>
            )}
            <PaperHint step="given" question={PAPER_TEXT.given.selfQuestion} model={<ModelLines lines={lines} />} />
          </>
        ) : (
          <>
            <TaskHeading title="Перевір короткий запис" eyebrow="Короткий запис" />
            <ModelLines lines={lines} label="Зразок" />
            <SelfChecks checks={checks} answers={self.answers} onAnswer={(id, yes) => {
              self.answer(id, yes)
              setFeedback(NO_FEEDBACK)
            }} />
          </>
        )
      }
      dock={
        !checking ? (
          <Dock feedback={NO_FEEDBACK} label="Готово" onMain={() => setChecking(true)} />
        ) : (
          <Dock feedback={self.anyNo && self.complete ? { tone: 'info', message: `${FIX_IN_NOTEBOOK} Тоді — «Далі».` } : feedback} label="Далі" onMain={onNext} />
        )
      }
    />
  )
}

/** The decode on paper (4.4 on): «Що більше: X чи Y?» for each comparison, from the short record's restated lines. */
function PaperDecode() {
  const { problem, log, next } = useFlow()
  const questions = biggerQuestions(problem)
  const tries = useTries('decode', { silent: true })
  const [checking, setChecking] = useState(false)
  const [at, setAt] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [markedWrong, setMarkedWrong] = useState<number | null>(null)
  const question = questions[at]
  const right = question.options.indexOf(question.answer)

  function pick(i: number) {
    if (tries.done) return
    setPicked(i)
    setMarkedWrong(null)
    tries.clear()
  }

  function check() {
    if (picked === null) return tries.submit({ kind: 'empty', message: 'Вибери відповідь.' })
    const verdict: Verdict = picked === right ? { kind: 'right' } : { kind: 'wrong', hint: question.hint }
    tries.submit(verdict, {
      explain: question.explain,
      onHint: () => setMarkedWrong(picked),
      onTry: ({ right: ok, shown }) => log({ kind: 'bigger', step: 'decode', line: question.line, picked: question.options[picked], right: ok, ...(shown ? { shown: true } : {}) }),
    })
  }

  function onMain() {
    if (!checking) return setChecking(true)
    if (!tries.done) return check()
    if (at === questions.length - 1) return next()
    setAt(at + 1)
    setPicked(null)
    setMarkedWrong(null)
    tries.restart()
  }

  return (
    <FlowLayout
      text={<Text />}
      task={
        !checking ? (
          <>
            <PaperHeading title={PAPER_TEXT.decode.title} eyebrow="Подумки">
              {PAPER_TEXT.decode.prompt}
            </PaperHeading>
            <PaperHint step="decode" question={PAPER_TEXT.decode.selfQuestion} model={<ModelLines lines={restatedLines(problem.writeUp).map((line) => line.text)} />} />
          </>
        ) : (
          <>
            <TaskHeading title={question.question} eyebrow={`Порівняння ${at + 1} з ${questions.length}`} />
            <div className="options options--row">
              {question.options.map((option, i) => (
                <OptionButton key={`${at}-${option}`} big state={optionState(i, picked, right, tries.done, markedWrong)} disabled={tries.done} onClick={() => pick(i)}>
                  {option}
                </OptionButton>
              ))}
            </div>
          </>
        )
      }
      dock={<Dock feedback={checking ? tries.feedback : NO_FEEDBACK} label={!checking ? 'Готово' : tries.done ? 'Далі' : 'Перевірити'} onMain={onMain} />}
    />
  )
}

/**
 * The diagram on paper (4.1 on): «Яка схема в тебе?», a pick of the sketches
 * her diagram holds (the right ones follow from the types), then the model and
 * ««?» стоїть там, де шукане?».
 */
function PaperDiagram() {
  const { problem, log, update, next } = useFlow()
  const data = problem.steps.typeDiagram!.diagram
  const [variant] = useState(loadTypeStepVariant)
  const byType = variant === 'pictures'
  const answer: string[] = diagramPickAnswer(problem, byType)
  const options = byType ? PROBLEM_TYPES.map((t) => ({ id: t.id, name: t.name })) : TYPE_FAMILIES.map((id) => ({ id, name: FAMILY_GUIDE[id].option }))
  const tries = useTries('typeDiagram', { silent: true })
  const [phase, setPhase] = useState<'write' | 'pick' | 'model'>('write')
  const [picked, setPicked] = useState<string[]>([])
  const [wrong, setWrong] = useState(false)
  const self = useSelfChecks([DIAGRAM_CHECK])
  const [feedback, setFeedback] = useState<Feedback>(NO_FEEDBACK)

  function toggle(id: string) {
    if (tries.done) return
    setPicked((current) => (current.includes(id) ? current.filter((p) => p !== id) : [...current, id]))
    setWrong(false)
    tries.clear()
  }

  function check() {
    if (!picked.length) return tries.submit({ kind: 'empty', message: 'Познач схеми, які є в тебе.' })
    const right = picked.length === answer.length && answer.every((a) => picked.includes(a))
    tries.submit(right ? { kind: 'right' } : { kind: 'wrong', hint: diagramPickHint(answer, picked) }, {
      explain: 'Подивись на зразок схеми.',
      shownExplain: `Правильні схеми позначено зеленим. ${FIX_IN_NOTEBOOK}`,
      onHint: () => setWrong(true),
      reveal: () => {
        setPicked([...answer])
        setWrong(false)
      },
      onTry: ({ right: ok, shown }) => log({ kind: 'diagramPick', step: 'typeDiagram', picked: [...picked], right: ok, ...(shown ? { shown: true } : {}) }),
    })
  }

  function onMain() {
    if (phase === 'write') return setPhase('pick')
    if (phase === 'pick') {
      if (!tries.done) return check()
      return setPhase('model')
    }
    if (!self.complete) return setFeedback({ tone: 'info', message: 'Відповідай: так чи ні.' })
    update((n) => ({ ...n, diagram: { ...data.slots } }))
    next()
  }

  function state(id: string) {
    const isOn = picked.includes(id)
    if (tries.done) return answer.includes(id) ? 'right' : isOn ? 'wrong' : 'idle'
    if (isOn) return wrong ? 'wrong' : 'selected'
    return 'idle'
  }

  const model = <Diagrams diagrams={data.diagrams} fill={data.slots} />
  let dockFeedback: Feedback = NO_FEEDBACK
  if (phase === 'pick') dockFeedback = tries.feedback
  else if (phase === 'model') dockFeedback = self.anyNo ? { tone: 'info', message: `${FIX_IN_NOTEBOOK} Тоді — «Далі».` } : feedback

  return (
    <FlowLayout
      text={<Text />}
      task={
        <>
          {phase === 'write' && (
            <>
              <PaperHeading title={PAPER_TEXT.typeDiagram.title}>{PAPER_TEXT.typeDiagram.prompt}</PaperHeading>
              <PaperHint step="typeDiagram" question={PAPER_TEXT.typeDiagram.selfQuestion} model={<div className="diagram-card">{model}</div>} />
            </>
          )}
          {phase === 'pick' && (
            <>
              <TaskHeading title="Яка схема в тебе?" eyebrow="Схема" />
              <p className="task-prompt">Познач усе, що є на твоїй схемі. Можна кілька.</p>
              <div className={`sketch-options sketch-options--${byType ? 'types' : 'families'}`} role="group" aria-label="Схеми">
                {options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className="option sketch-option"
                    data-state={state(option.id)}
                    aria-pressed={picked.includes(option.id)}
                    disabled={tries.done}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => toggle(option.id)}
                  >
                    <TypePicture kind={option.id as never} />
                    <span className="sketch-name">{option.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {phase === 'model' && (
            <>
              <TaskHeading title="Перевір схему" eyebrow="Схема" />
              <p className="eyebrow">Зразок</p>
              <div className="diagram-card">{model}</div>
              <SelfChecks checks={[DIAGRAM_CHECK]} answers={self.answers} onAnswer={self.answer} />
            </>
          )}
        </>
      }
      dock={<Dock feedback={dockFeedback} label={phase === 'write' ? 'Готово' : phase === 'pick' && !tries.done ? 'Перевірити' : 'Далі'} onMain={onMain} />}
    />
  )
}

/** The answer on paper (2.1 on): any name part as a pick (3.7), then the model with its self-check. */
function PaperAnswer() {
  const { problem, update, next } = useFlow()
  const names = problem.writeUp.answerParts.filter((part): part is Extract<AnswerPart, { kind: 'name' }> => part.kind === 'name')
  const [phase, setPhase] = useState<'write' | 'names' | 'model'>('write')
  const check = answerSelfCheck(problem)
  const self = useSelfChecks([check])
  const [feedback, setFeedback] = useState<Feedback>(NO_FEEDBACK)

  function toModel() {
    setPhase('model')
  }

  function onMain() {
    if (phase === 'write') return names.length ? setPhase('names') : toModel()
    if (!self.complete) return setFeedback({ tone: 'info', message: 'Відповідай: так чи ні.' })
    update((n) => ({ ...n, answered: true }))
    next()
  }

  if (phase === 'names') return <NamePicks parts={names} onDone={toModel} />

  return (
    <FlowLayout
      text={<Text />}
      task={
        phase === 'write' ? (
          <>
            <PaperHeading title={PAPER_TEXT.answer.title}>{PAPER_TEXT.answer.prompt}</PaperHeading>
            <PaperHint step="answer" question={PAPER_TEXT.answer.selfQuestion} model={<ModelLines lines={[problem.writeUp.answer]} />} />
          </>
        ) : (
          <>
            <TaskHeading title="Перевір відповідь" eyebrow="Відповідь" />
            <ModelLines lines={[problem.writeUp.answer]} label="Зразок" />
            <SelfChecks checks={[check]} answers={self.answers} onAnswer={self.answer} />
          </>
        )
      }
      dock={
        <Dock
          feedback={phase === 'model' && self.anyNo ? { tone: 'info', message: `${FIX_IN_NOTEBOOK} Тоді — «Далі».` } : feedback}
          label={phase === 'write' ? 'Готово' : 'Далі'}
          onMain={onMain}
        />
      }
    />
  )
}

/** A name part of the answer (3.7): a pick between the names, hint then show. */
function NamePicks({ parts, onDone }: { parts: Extract<AnswerPart, { kind: 'name' }>[]; onDone: () => void }) {
  const { log } = useFlow()
  const tries = useTries('answer', { silent: true })
  const [at, setAt] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [markedWrong, setMarkedWrong] = useState<number | null>(null)
  const part = parts[at]
  const right = part.options.indexOf(part.value)

  function check() {
    if (picked === null) return tries.submit({ kind: 'empty', message: 'Вибери відповідь.' })
    tries.submit(picked === right ? { kind: 'right' } : { kind: 'wrong', hint: 'Подивись на свої результати: у кого більше?' }, {
      onHint: () => setMarkedWrong(picked),
      onTry: ({ right: ok, shown }) => log({ kind: 'name', step: 'answer', picked: part.options[picked], right: ok, ...(shown ? { shown: true } : {}) }),
    })
  }

  function onMain() {
    if (!tries.done) return check()
    if (at === parts.length - 1) return onDone()
    setAt(at + 1)
    setPicked(null)
    setMarkedWrong(null)
    tries.restart()
  }

  return (
    <FlowLayout
      text={<Text />}
      task={
        <>
          <TaskHeading title={part.label ?? 'Хто?'} eyebrow="Відповідь" />
          <div className="options options--row">
            {part.options.map((option, i) => (
              <OptionButton
                key={`${at}-${option}`}
                big
                state={optionState(i, picked, right, tries.done, markedWrong)}
                disabled={tries.done}
                onClick={() => {
                  if (tries.done) return
                  setPicked(i)
                  setMarkedWrong(null)
                  tries.clear()
                }}
              >
                {option}
              </OptionButton>
            ))}
          </div>
        </>
      }
      dock={<Dock feedback={tries.feedback} label={tries.done ? 'Далі' : 'Перевірити'} onMain={onMain} />}
    />
  )
}
