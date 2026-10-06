/**
 * How a problem plays when she opens it: its stage from its slot (or the
 * later stage, for a replay behind her furthest problem), her plan's step
 * size, the solo try, the handover and the step-size line. The parent's stage
 * switch overrides the stage. Pure, no UI code.
 */
import type { Progress } from '../lib/progress'
import { compareSlots } from '../problems/slots'
import { learnerState } from './learner'
import { handoverDue, isFinished, isRepeatDue } from './loop'
import { STAGES, laterStage, playAt, stageOfSlot, type Play, type StageId, type StepSize } from './stages'

/** The parent's stage switch: play every problem at this stage, in this step size (`auto` is hers). */
export type StageSwitch = { stage: StageId; stepSize: 'auto' | StepSize }

/** The last slot of the problem set: replays after it offer the solo try. */
export const LAST_SLOT = '4.7'

/** The stages where she makes her own plan, so the step size applies. */
const OWN_PLAN: readonly StageId[] = ['3', '4a', '4b', '4c']

export function resolvePlay(problemId: string, progress: Progress, stageSwitch: StageSwitch | null): Play {
  const state = learnerState(progress)
  if (stageSwitch) {
    const { stage, stepSize } = stageSwitch
    const handover = STAGES[stage].handover
    return playAt(stage, stepSize === 'auto' ? state.stepSize : stepSize, { switched: true, ...(handover ? { handover } : {}) })
  }
  const own = stageOfSlot(problemId)
  const behind = state.furthest !== null && compareSlots(state.furthest, problemId) > 0
  const stage = behind ? laterStage(own, stageOfSlot(state.furthest!)) : own
  const solo = stage === '4c' && (own === '4c' || isFinished(progress, LAST_SLOT))
  const handover = behind ? null : handoverDue(progress, problemId)
  const stepMove = OWN_PLAN.includes(stage) ? state.justMoved : null
  return playAt(stage, state.stepSize, {
    solo,
    ...(handover ? { handover } : {}),
    ...(stepMove ? { stepMove } : {}),
    ...(isRepeatDue(progress, problemId) ? { repeat: true } : {}),
  })
}

/** The switch as a key, so an open problem started under another setting starts over. */
export function switchKey(stageSwitch: StageSwitch | null): string {
  return stageSwitch ? `${stageSwitch.stage}/${stageSwitch.stepSize}` : ''
}
