import { useEffect, useRef, useState, type ReactNode } from 'react'
import { FAMILY_GUIDE, TYPE_FAMILIES, TYPE_GUIDE, familyOf, type TypeFamily } from '../../problems/typeGuide'
import { PROBLEM_TYPES, type ProblemTypeId } from '../../problems/types'
import { useFlow } from '../context'
import { Dock } from '../layout/Dock'
import { FlowLayout } from '../layout/FlowLayout'
import { ProblemText } from '../layout/ProblemText'
import { OptionButton, TaskHeading } from '../layout/controls'
import { optionState } from '../layout/optionState'
import { bringIntoView } from '../layout/scroll'
import { useTries } from '../useTries'
import { TypePicture } from './TypePicture'
import { checkFamilyPick, checkTypePick, relationQuote, typeName, typePart } from './typeChecks'
import type { TypeStepVariant } from './variants'
import './typeStep.css'

type Stage = 'family' | 'type'

type Variant = Exclude<TypeStepVariant, 'baseline'>

type Choice = { id: string; content: ReactNode }

/**
 * Тип і схема, first half, one relation per screen part: the problem's own
 * words are highlighted in the text and quoted on the card, and she names
 * their type. How she names it is the version the parent picked:
 * `examples` (six names, each with an example), `pictures` (six small
 * diagrams with the names under them) or `questions` («Що тут є?» from three
 * diagram families, then which of its two types).
 */
export function RelationTypesScreen({ variant }: { variant: Variant }) {
  const { problem, notebook, next } = useFlow()
  const tries = useTries('typeDiagram')
  const { relations } = problem.steps.typeDiagram!
  const firstStage: Stage = variant === 'questions' ? 'family' : 'type'
  const [at, setAt] = useState(0)
  const [stage, setStage] = useState<Stage>(firstStage)
  const [family, setFamily] = useState<TypeFamily | null>(null)
  const [picked, setPicked] = useState<ProblemTypeId | null>(null)
  const [markedWrong, setMarkedWrong] = useState<string | null>(null)
  const top = useRef<HTMLDivElement>(null)
  const opened = useRef(false)

  const relation = relations[at]
  const rightFamily = familyOf(relation.type)

  useEffect(() => {
    // The layout brings the task into view when the screen opens; after that, each new relation.
    if (opened.current) bringIntoView(top.current)
    opened.current = true
  }, [at])

  function choose(id: string) {
    if (tries.done) return
    if (stage === 'family') setFamily(id as TypeFamily)
    else setPicked(id as ProblemTypeId)
    setMarkedWrong(null)
    tries.clear()
  }

  /** Stage two asks within the right family, whether she picked it or it was shown. */
  function toTypeStage() {
    setStage('type')
    setPicked(null)
    setMarkedWrong(null)
    tries.restart()
  }

  function check() {
    if (stage === 'family') {
      const verdict = checkFamilyPick(relation, family)
      if (verdict.kind === 'right') {
        toTypeStage()
        tries.inform('Так. А тепер — який саме тип?')
        return
      }
      tries.submit(verdict, {
        part: typePart(at, 'family'),
        onHint: () => setMarkedWrong(family),
      })
      return
    }
    tries.submit(checkTypePick(relation, picked, variant === 'pictures' ? 'Вибери схему.' : 'Вибери тип.'), {
      part: typePart(at),
      explain: `Це «${typeName(relation.type)}».`,
      onHint: () => setMarkedWrong(picked),
    })
  }

  function onMain() {
    if (!tries.done) return check()
    if (stage === 'family') return toTypeStage()
    if (at === relations.length - 1) return next()
    setAt(at + 1)
    setStage(firstStage)
    setFamily(null)
    setPicked(null)
    setMarkedWrong(null)
    tries.restart()
  }

  const choices = choicesFor(stage, variant, rightFamily)
  const ids = choices.map((choice) => choice.id)
  const pick = stage === 'family' ? family : picked
  const pickedIndex = pick === null ? null : ids.indexOf(pick)
  const wrongIndex = markedWrong === null ? null : ids.indexOf(markedWrong)
  const right = ids.indexOf(stage === 'family' ? rightFamily : relation.type)

  const heading = {
    examples: { title: 'На який приклад схоже?', prompt: 'Прочитай виділене в задачі. Вибери тип, приклад якого на це схожий. Тип підкаже, яку схему малювати.' },
    pictures: { title: 'Яка схема підходить?', prompt: 'Прочитай виділене в задачі. Вибери схему, яку до нього можна намалювати.' },
    questions:
      stage === 'family'
        ? { title: 'Що тут є?', prompt: 'Прочитай виділене в задачі. Що в ньому є?' }
        : { title: FAMILY_GUIDE[rightFamily].title, prompt: 'Тепер точніше: який це тип?' },
  }[variant]

  return (
    <FlowLayout
      text={<ProblemText parts={problem.text} questionFound={notebook.questionFound} relation={relation.id} />}
      task={
        <div className="type-step" ref={top}>
          <TaskHeading title={heading.title} eyebrow={`Тип ${at + 1} з ${relations.length}`} />
          <div className="quote type-quote">
            «{relationQuote(relation)}»{relation.note && <span className="type-quote-note">{relation.note}</span>}
          </div>
          {variant === 'questions' && stage === 'type' && (
            <p className="type-settled">
              <TypePicture kind={rightFamily} />
              <span>{FAMILY_GUIDE[rightFamily].option}</span>
            </p>
          )}
          <p className="task-prompt">{heading.prompt}</p>
          <div className={`type-options type-options--${listKind(stage, variant)}`} role="group" aria-label={heading.title}>
            {choices.map((choice, i) => (
              <OptionButton
                key={`${at}-${stage}-${choice.id}`}
                state={optionState(i, pickedIndex, right, tries.done, wrongIndex)}
                disabled={tries.done}
                onClick={() => choose(choice.id)}
              >
                {choice.content}
              </OptionButton>
            ))}
          </div>
          {at > 0 && (
            <section className="type-named" aria-label="Уже названо">
              <h2 className="eyebrow">Уже названо</h2>
              <ol>
                {relations.slice(0, at).map((done, i) => (
                  <li key={i}>
                    «{relationQuote(done)}» — <strong>{typeName(done.type)}</strong>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      }
      dock={<Dock feedback={tries.feedback} label={tries.done ? 'Далі' : 'Перевірити'} onMain={onMain} />}
    />
  )
}

/** The options on the card: the three families, the right family's two types, or all six types as pictures or examples. */
function choicesFor(stage: Stage, variant: Variant, rightFamily: TypeFamily): Choice[] {
  if (stage === 'family') {
    return TYPE_FAMILIES.map((id) => ({
      id,
      content: (
        <>
          <TypePicture kind={id} />
          <span className="type-option-text">{FAMILY_GUIDE[id].option}</span>
        </>
      ),
    }))
  }
  if (variant === 'questions') {
    return FAMILY_GUIDE[rightFamily].options.map(({ type, text }) => ({
      id: type,
      content: (
        <>
          <span className="type-option-text">{text}</span>
          <span className="type-tag">{typeName(type)}</span>
        </>
      ),
    }))
  }
  if (variant === 'pictures') {
    return PROBLEM_TYPES.map(({ id, name }) => ({
      id,
      content: (
        <>
          <TypePicture kind={id} />
          <span className="type-option-name">{name}</span>
        </>
      ),
    }))
  }
  return PROBLEM_TYPES.map(({ id, name }) => ({
    id,
    content: (
      <>
        <span className="type-option-name">{name}</span>
        <span className="type-option-example">{TYPE_GUIDE[id].example}</span>
      </>
    ),
  }))
}

/** The option list's modifier class: `type-options--families`, `--pair`, `--pictures` or `--examples`. */
function listKind(stage: Stage, variant: Variant): string {
  if (stage === 'family') return 'families'
  if (variant === 'questions') return 'pair'
  return variant
}
