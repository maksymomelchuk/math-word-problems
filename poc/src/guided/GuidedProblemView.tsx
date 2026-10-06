import { useEffect, useRef, useState } from 'react'
import type { GuidedProblem } from '../problems/types'
import { PROGRESS_VERSION, finishAttempt, loadProgress, recordHelp, recordLog, recordPlan, recordVariant, startAttempt, type LogEvent } from '../lib/progress'
import { resolvePlay, switchKey } from '../fading/play'
import { loadStageSwitch } from '../fading/stageSwitch'
import { FULLY_GUIDED, type Play } from '../fading/stages'
import { loadTypeStepVariant } from './typeStep/variants'
import { FlowContext, type FlowContextValue } from './context'
import { buildScreens, emptyNotebook, promptedSteps, stepGuidance, type Notebook, type Screen } from './flow'
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
import { HandoverScreen } from './paper/HandoverScreen'
import { NextStepScreen } from './paper/NextStepScreen'
import { PaperComputeScreen } from './paper/PaperComputeScreen'
import { PaperStepScreen } from './paper/PaperStepScreen'
import { PlanLineScreen } from './paper/PlanLineScreen'
import { PlanWholeScreen } from './paper/PlanWholeScreen'
import { SoloChoiceScreen } from './paper/SoloChoiceScreen'
import { SoloScreen } from './paper/SoloScreen'
import './guided.css'

type GuidedProblemViewProps = {
  problem: GuidedProblem
  onExit: () => void
}

/** The saved session for this problem, if it was started under the same stage switch. */
function resumable(problem: GuidedProblem): Session | null {
  const saved = loadSession()
  if (saved?.problemId !== problem.id) return null
  return (saved.switchKey ?? '') === switchKey(loadStageSwitch()) ? saved : null
}

function screensOf(problem: GuidedProblem, play: Play, notebook: Notebook): Screen[] {
  return buildScreens(problem, notebook.plan, play, notebook)
}

/**
 * One problem, screen by screen, at the stage its slot gives it (or the
 * parent's stage switch). Picks up a saved session for this problem, or starts
 * a new attempt in the progress record.
 */
export function GuidedProblemView({ problem, onExit }: GuidedProblemViewProps) {
  const [session, setSession] = useState<Session | null>(() => resumable(problem))
  const starting = useRef(false)

  useEffect(() => {
    if (session || starting.current) return
    starting.current = true
    const stageSwitch = loadStageSwitch()
    const play = resolvePlay(problem.id, loadProgress(), stageSwitch)
    const ownPlan = stepGuidance(problem, 'plan', play).mode === 'paper'
    const startedAt = startAttempt(problem.id, promptedSteps(problem, play), new Date(), undefined, {
      stage: play.stage,
      ...(ownPlan ? { stepSize: play.stepSize } : {}),
      ...(play.switched ? { switched: true } : {}),
      ...(play.repeat ? { repeat: true } : {}),
    })
    if (play.stepMove) recordLog(problem.id, startedAt, { at: startedAt, step: 'start', kind: 'stepSize', size: play.stepMove })
    setSession({ version: PROGRESS_VERSION, problemId: problem.id, startedAt, index: 0, notebook: emptyNotebook(), play, switchKey: switchKey(stageSwitch) })
  }, [session, problem])

  const play = session?.play ?? FULLY_GUIDED
  const screens = session ? screensOf(problem, play, session.notebook) : []
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
    play,
    update: (change) => setSession((s) => s && { ...s, notebook: change(s.notebook) }),
    next: () => {
      setSession((s) => s && { ...s, index: Math.min(s.index + 1, screensOf(problem, s.play ?? FULLY_GUIDED, s.notebook).length - 1) })
    },
    record: (event) =>
      recordHelp(problem.id, session.startedAt, {
        at: new Date().toISOString(),
        ...event,
        ...(event.step === 'typeDiagram' ? { variant: loadTypeStepVariant() } : {}),
      }),
    log: (event) => recordLog(problem.id, session.startedAt, { at: new Date().toISOString(), ...event } as LogEvent),
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
    case 'handover':
      return <HandoverScreen />
    case 'soloChoice':
      return <SoloChoiceScreen />
    case 'solo':
      return <SoloScreen />
    case 'nextStep':
      return <NextStepScreen due={screen.step} />
    case 'paper':
      return <PaperStepScreen step={screen.step} />
    case 'planWhole':
      return <PlanWholeScreen />
    case 'planLine':
      return <PlanLineScreen line={screen.line} big={screen.big} />
    case 'paperCompute':
      return <PaperComputeScreen position={screen.position} withPlan={!!screen.withPlan} />
  }
}
