import { useEffect, useRef, useState } from 'react'
import type { GuidedProblem } from '../problems/types'
import { FlowContext, type FlowContextValue } from '../guided/context'
import { buildScreens } from '../guided/flow'
import { DiagramScreen } from '../guided/screens/DiagramScreen'
import { TypesScreen } from '../guided/screens/TypesScreen'
import { finishTry, notebookAtTypeStep, recordTryEvent, startTry } from '../guided/typeStep/tryMode'
import { loadTypeStepVariant } from '../guided/typeStep/variants'
import '../guided/guided.css'

function backToParent() {
  window.location.replace('#/parent')
}

/**
 * For the parent, at `#/try/2.3`: only Тип і схема of one problem, in the
 * version picked under «Для батьків», then back there. Its hints and shown
 * answers go to the tries' own records, not to her problems.
 */
export function TypeStepTry({ problem }: { problem: GuidedProblem }) {
  const screens = buildScreens(problem, null)
  const first = screens.findIndex((screen) => screen.kind === 'types')
  const [index, setIndex] = useState(first)
  const [notebook, setNotebook] = useState(() => notebookAtTypeStep(problem))
  const [variant] = useState(loadTypeStepVariant)
  const [startedAt, setStartedAt] = useState<string | null>(null)
  const starting = useRef(false)

  useEffect(() => {
    if (starting.current || first < 0) return
    starting.current = true
    setStartedAt(startTry(problem.id, variant))
  }, [problem.id, variant, first])

  if (first < 0) {
    return (
      <div className="page page--parent">
        <p className="page-lead">У задачі {problem.id} немає кроку «Тип і схема».</p>
        <a className="text-link" href="#/parent">
          Для батьків
        </a>
      </div>
    )
  }

  const value: FlowContextValue = {
    problem,
    notebook,
    screens,
    index,
    update: setNotebook,
    next: () => {
      if (screens[index + 1]?.step === 'typeDiagram') return setIndex(index + 1)
      if (startedAt) finishTry(startedAt)
      backToParent()
    },
    record: (event) => {
      if (startedAt) recordTryEvent(startedAt, { at: new Date().toISOString(), ...event, variant })
    },
    exit: backToParent,
    finish: backToParent,
  }

  return (
    <FlowContext.Provider value={value}>
      {screens[index].kind === 'types' ? <TypesScreen key={index} /> : <DiagramScreen key={index} />}
    </FlowContext.Provider>
  )
}
