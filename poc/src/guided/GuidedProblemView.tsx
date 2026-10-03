import { useEffect, useRef, useState } from 'react'
import type { GuidedProblem } from '../problems/types'
import { PROGRESS_VERSION, finishAttempt, recordHelp, recordPlan, recordVariant, startAttempt } from '../lib/progress'
import { loadTypeStepVariant } from './typeStep/variants'
import { FlowContext, type FlowContextValue } from './context'
import { buildScreens, emptyNotebook, stepsShown, type Screen } from './flow'
import { clearSession, loadSession, saveSession, type Session } from './session'
import { AskedTapScreen } from './screens/AskedTapScreen'
import { ChoiceScreen } from './screens/ChoiceScreen'
import { ComputeScreen } from './screens/ComputeScreen'
import { DecodeScreen } from './screens/DecodeScreen'
import { DiagramScreen } from './screens/DiagramScreen'
import { GivenScreen } from './screens/GivenScreen'
import { PlanScreen } from './screens/PlanScreen'
import { ReviewScreen } from './screens/ReviewScreen'
import { TypesScreen } from './screens/TypesScreen'
import './guided.css'

type GuidedProblemViewProps = {
  problem: GuidedProblem
  onExit: () => void
}

/**
 * One guided problem, screen by screen. Picks up a saved session for this
 * problem, or starts a new attempt in the progress record.
 */
export function GuidedProblemView({ problem, onExit }: GuidedProblemViewProps) {
  const [session, setSession] = useState<Session | null>(() => {
    const saved = loadSession()
    return saved?.problemId === problem.id ? saved : null
  })
  const starting = useRef(false)

  useEffect(() => {
    if (session || starting.current) return
    starting.current = true
    const startedAt = startAttempt(problem.id, stepsShown(buildScreens(problem, null)))
    setSession({ version: PROGRESS_VERSION, problemId: problem.id, startedAt, index: 0, notebook: emptyNotebook() })
  }, [session, problem])

  const screens = session ? buildScreens(problem, session.notebook.plan) : []
  const index = session ? Math.min(session.index, screens.length - 1) : 0
  const atReview = screens[index]?.kind === 'review'
  const planChoice = session?.notebook.plan?.plan

  useEffect(() => {
    if (session) saveSession(session)
  }, [session])

  const startedAt = session?.startedAt
  useEffect(() => {
    if (startedAt && planChoice !== undefined) recordPlan(problem.id, startedAt, planChoice)
  }, [planChoice, startedAt, problem.id])

  // Which version of Тип і схема she saw, noted when she reaches it.
  const atTypes = screens[index]?.kind === 'types'
  useEffect(() => {
    if (startedAt && atTypes) recordVariant(problem.id, startedAt, 'typeDiagram', loadTypeStepVariant())
  }, [atTypes, startedAt, problem.id])

  useEffect(() => {
    if (!session || !atReview) return
    finishAttempt(problem.id, session.startedAt)
    clearSession()
  }, [atReview, session, problem.id])

  if (!session) return null

  const value: FlowContextValue = {
    problem,
    notebook: session.notebook,
    screens,
    index,
    update: (change) => setSession((s) => s && { ...s, notebook: change(s.notebook) }),
    next: () => {
      setSession((s) => s && { ...s, index: Math.min(s.index + 1, buildScreens(problem, s.notebook.plan).length - 1) })
    },
    record: (event) =>
      recordHelp(problem.id, session.startedAt, {
        at: new Date().toISOString(),
        ...event,
        ...(event.step === 'typeDiagram' ? { variant: loadTypeStepVariant() } : {}),
      }),
    exit: onExit,
    finish: onExit,
  }

  return (
    <FlowContext.Provider value={value}>
      <ScreenView key={index} screen={screens[index]} problem={problem} />
    </FlowContext.Provider>
  )
}

function ScreenView({ screen, problem }: { screen: Screen; problem: GuidedProblem }) {
  const { steps } = problem
  switch (screen.kind) {
    case 'retell':
      return <ChoiceScreen step="retell" choice={steps.retell!} />
    case 'askedTap':
      return <AskedTapScreen />
    case 'askedChoice':
      return <ChoiceScreen step="asked" part="unknown" choice={steps.asked!.choice} />
    case 'given':
      return <GivenScreen nth={screen.nth} />
    case 'hidden':
      return <ChoiceScreen step="given" part={`hidden-${screen.index + 1}`} choice={steps.given!.hidden![screen.index]} />
    case 'decode':
      return <DecodeScreen index={screen.index} stage={screen.stage} />
    case 'why':
      return <ChoiceScreen step={screen.step} part="why" why choice={screen.step === 'decode' ? steps.decode!.why! : steps.plan!.why!} />
    case 'types':
      return <TypesScreen />
    case 'diagram':
      return <DiagramScreen />
    case 'plan':
      return <PlanScreen />
    case 'compute':
      return <ComputeScreen position={screen.position} />
    case 'answer':
      return <ChoiceScreen step="answer" choice={steps.answer!} settle={(n) => ({ ...n, answered: true })} />
    case 'review':
      return <ReviewScreen />
  }
}
