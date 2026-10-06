import { useState } from 'react'
import { Diagrams } from '../../diagrams/Diagrams'
import { QUESTION_CHIP, QUESTION_HINT, placedValue, withQuestionSlots } from '../../fading/questionSlots'
import { FAMILY_GUIDE, TYPE_FAMILIES, familyOf, type TypeFamily } from '../../problems/typeGuide'
import { checkSlots } from '../checks'
import { useFlow } from '../context'
import { Dock } from '../layout/Dock'
import { FlowLayout } from '../layout/FlowLayout'
import { ProblemText } from '../layout/ProblemText'
import { Chip, OptionButton, TaskHeading } from '../layout/controls'
import { optionState } from '../layout/optionState'
import { TypePicture } from '../typeStep/TypePicture'
import { relationQuote, typeName } from '../typeStep/typeChecks'
import { loadTypeStepVariant } from '../typeStep/variants'
import { useTries } from '../useTries'

/**
 * Тип і схема, second half. In Levels 1–2 the diagram is drawn and the «?»
 * set for her, and she places the given numbers: tap a slot, then a chip.
 * From 3.1 she first picks each relation's diagram (unless her version of the
 * type step already had her pick a sketch), then the app draws the combined
 * diagram and the «?» is a chip she places too.
 */
export function DiagramScreen() {
  const { play } = useFlow()
  const [variant] = useState(loadTypeStepVariant)
  // «Схеми» names each type by its sketch, and «Два питання» asks «Що тут є?» from the three diagrams: she has already picked.
  const [picking, setPicking] = useState(play.pickDiagram && (variant === 'examples' || variant === 'baseline'))
  return picking ? <FamilyPick onDone={() => setPicking(false)} /> : <FillDiagram />
}

function FillDiagram() {
  const { problem, notebook, play, update, next } = useFlow()
  const tries = useTries('typeDiagram')
  const base = problem.steps.typeDiagram!.diagram
  const [question] = useState(() => (play.pickDiagram ? withQuestionSlots(base) : null))
  const data = question ? { ...base, ...question } : base
  const order = Object.keys(data.slots)
  const [fill, setFill] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(order[0] ?? null)
  const [wrong, setWrong] = useState<string[]>([])

  function place(chip: string) {
    if (tries.done || !selected) return
    const filled = { ...fill, [selected]: question ? placedValue(question, selected, chip) : chip }
    setFill(filled)
    setWrong((current) => current.filter((slot) => slot !== selected))
    setSelected(order.find((slot) => !filled[slot]) ?? selected)
    tries.clear()
  }

  function check() {
    const verdict = checkSlots(data.slots, fill, base.hint)
    const questionWrong = question && verdict.wrong.some((slot) => question.questionSlots[slot] || fill[slot] === QUESTION_CHIP)
    tries.submit(verdict.kind === 'wrong' && questionWrong ? { ...verdict, hint: QUESTION_HINT } : verdict, {
      part: 'diagram',
      explain: base.explain,
      onHint: () => {
        setWrong(verdict.wrong)
        setSelected(verdict.wrong[0] ?? selected)
      },
      reveal: () => {
        setFill({ ...data.slots })
        setWrong([])
      },
      settle: (shown) => update((n) => ({ ...n, diagram: shown ? { ...data.slots } : fill })),
    })
  }

  return (
    <FlowLayout
      text={<ProblemText parts={problem.text} questionFound={notebook.questionFound} />}
      task={
        <>
          <TaskHeading title={base.title} />
          <p className="task-prompt">{question ? 'Торкнись порожнього місця на схемі, потім числа. Знак «?» постав там, де шукане.' : base.prompt}</p>
          <div className="diagram-card">
            <Diagrams
              diagrams={data.diagrams}
              fill={fill}
              control={{
                selected: tries.done ? null : selected,
                wrong,
                right: tries.done,
                onSlot: (slot) => {
                  if (!tries.done) setSelected(slot)
                },
              }}
            />
          </div>
          {!tries.done && (
            <div className="chips" role="group" aria-label="Числа для схеми">
              {data.chips.map((chip) => (
                <Chip key={chip} kind={chip === QUESTION_CHIP ? 'sign' : 'number'} label={chip === QUESTION_CHIP ? 'Знак питання: шукане' : undefined} onClick={() => place(chip)}>
                  {chip}
                </Chip>
              ))}
            </div>
          )}
        </>
      }
      dock={<Dock feedback={tries.feedback} label={tries.done ? 'Далі' : 'Перевірити'} onMain={tries.done ? next : check} />}
    />
  )
}

/** From 3.1, after naming the types: which of the three diagrams she'd draw for each relation. */
function FamilyPick({ onDone }: { onDone: () => void }) {
  const { problem, notebook } = useFlow()
  const tries = useTries('typeDiagram')
  const { relations } = problem.steps.typeDiagram!
  const [at, setAt] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [markedWrong, setMarkedWrong] = useState<number | null>(null)
  const relation = relations[at]
  const right = TYPE_FAMILIES.indexOf(familyOf(relation.type))

  function check() {
    if (picked === null) return tries.submit({ kind: 'empty', message: 'Вибери схему.' })
    tries.submit(picked === right ? { kind: 'right' } : { kind: 'wrong', hint: `Це «${typeName(relation.type)}». Яку схему малюють до такого зв’язку?` }, {
      part: `pick-${at + 1}`,
      onHint: () => setMarkedWrong(picked),
    })
  }

  function onMain() {
    if (!tries.done) return check()
    if (at === relations.length - 1) return onDone()
    setAt(at + 1)
    setPicked(null)
    setMarkedWrong(null)
    tries.restart()
  }

  return (
    <FlowLayout
      text={<ProblemText parts={problem.text} questionFound={notebook.questionFound} relation={relation.id} />}
      task={
        <div className="type-step">
          <TaskHeading title="Яку схему намалюєш?" eyebrow={`Схема ${at + 1} з ${relations.length}`} />
          <div className="quote type-quote">«{relationQuote(relation)}» — {typeName(relation.type)}</div>
          <div className="type-options type-options--families" role="group" aria-label="Схеми">
            {TYPE_FAMILIES.map((family: TypeFamily, i) => (
              <OptionButton key={`${at}-${family}`} state={optionState(i, picked, right, tries.done, markedWrong)} disabled={tries.done} onClick={() => {
                if (tries.done) return
                setPicked(i)
                setMarkedWrong(null)
                tries.clear()
              }}>
                <TypePicture kind={family} />
                <span className="type-option-text">{FAMILY_GUIDE[family].option}</span>
              </OptionButton>
            ))}
          </div>
        </div>
      }
      dock={<Dock feedback={tries.feedback} label={tries.done ? 'Далі' : 'Перевірити'} onMain={onMain} />}
    />
  )
}
