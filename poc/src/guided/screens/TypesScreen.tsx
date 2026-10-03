import { useState } from 'react'
import { PROBLEM_TYPES, type ProblemTypeId } from '../../problems/types'
import { checkTypes } from '../checks'
import { useFlow } from '../context'
import { Dock } from '../layout/Dock'
import { FlowLayout } from '../layout/FlowLayout'
import { ProblemText } from '../layout/ProblemText'
import { Chip, TaskHeading } from '../layout/controls'
import { useTries } from '../useTries'
import { RelationTypesScreen } from '../typeStep/RelationTypesScreen'
import { loadTypeStepVariant } from '../typeStep/variants'

/** Тип і схема, first half, in the version the parent picked under «Для батьків». */
export function TypesScreen() {
  const [variant] = useState(loadTypeStepVariant)
  return variant === 'baseline' ? <AllRelationsTypesScreen /> : <RelationTypesScreen variant={variant} />
}

/** The first version («Як було»): she names the type of each relation, all restated and listed on one screen. */
function AllRelationsTypesScreen() {
  const { problem, notebook, next } = useFlow()
  const tries = useTries('typeDiagram')
  const { relations } = problem.steps.typeDiagram!
  const [picks, setPicks] = useState<(ProblemTypeId | undefined)[]>([])
  const [wrong, setWrong] = useState<number[]>([])

  function pick(relation: number, type: ProblemTypeId) {
    if (tries.done) return
    setPicks((current) => Object.assign([...current], { [relation]: type }))
    setWrong((current) => current.filter((w) => w !== relation))
    tries.clear()
  }

  function check() {
    const verdict = checkTypes(relations, picks)
    tries.submit(verdict, {
      part: 'types',
      shownExplain: 'Правильні типи позначено зеленим.',
      onHint: () => setWrong(verdict.wrong),
      reveal: () => {
        setPicks(relations.map((relation) => relation.type))
        setWrong([])
      },
    })
  }

  function relationState(relation: number): 'wrong' | 'right' | undefined {
    if (wrong.includes(relation)) return 'wrong'
    if (tries.done) return 'right'
    return undefined
  }

  return (
    <FlowLayout
      text={<ProblemText parts={problem.text} questionFound={notebook.questionFound} />}
      task={
        <>
          <TaskHeading title="Який це тип?" />
          <p className="task-prompt">Назви тип кожного зв'язку в задачі.</p>
          <ol className="relations">
            {relations.map((relation, i) => (
              <li key={i} className="relation" data-state={relationState(i)}>
                <p className="relation-text">{relation.text}</p>
                <div className="type-grid" role="group" aria-label={`Тип зв'язку: ${relation.text}`}>
                  {PROBLEM_TYPES.map((type) => (
                    <Chip key={type.id} kind="type" selected={picks[i] === type.id} disabled={tries.done} onClick={() => pick(i, type.id)}>
                      {type.name}
                    </Chip>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </>
      }
      dock={<Dock feedback={tries.feedback} label={tries.done ? 'Далі' : 'Перевірити'} onMain={tries.done ? next : check} />}
    />
  )
}
