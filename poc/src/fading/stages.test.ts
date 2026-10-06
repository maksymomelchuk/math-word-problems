import { describe, expect, it } from 'vitest'
import { buildScreens, emptyNotebook, hasStep, promptedSteps, stepsShown, writesAt, type Notebook, type Screen } from '../guided/flow'
import { WALKING_BOY as boy, TRIANGLE as triangle } from '../problems/problems'
import type { GuidedProblem } from '../problems/types'
import { planFromLines } from './plan'
import { STAGE_IDS, handoverAt, laterStage, playAt, routineOrder, stageOfSlot, type Play } from './stages'

const name = (s: Screen) => {
  switch (s.kind) {
    case 'paper':
    case 'nextStep':
      return `${s.kind}:${s.step}`
    case 'planLine':
      return `line${s.line + 1}${s.big ? '-big' : ''}`
    case 'paperCompute':
      return `result${s.position + 1}`
    case 'why':
      return `why:${s.step}`
    default:
      return s.kind
  }
}

function notebookWith(p: GuidedProblem, lines: string[], extra: Partial<Notebook> = {}): Notebook {
  return { ...emptyNotebook(), lines, plan: planFromLines(p.writeUp.plans, lines), ...extra }
}

const kinds = (p: GuidedProblem, play: Play, notebook: Partial<Notebook> = {}) => buildScreens(p, notebook.plan ?? null, play, notebook).map(name)

describe('each problem plays at the stage its slot gives it', () => {
  it('reads the stage from the slot', () => {
    expect(['1.1', '1.7', '2.1', '2.4', '2.5', '2.8', '3.1', '3.8', '4.1', '4.3', '4.4', '4.5', '4.6', '4.7'].map(stageOfSlot)).toEqual([
      '1', '1', '2a', '2a', '2b', '2b', '3', '3', '4a', '4a', '4b', '4b', '4c', '4c',
    ])
    expect(handoverAt('2.1')).toMatch(/^Тепер дії і відповідь/)
    expect(handoverAt('2.3')).toBeUndefined()
    expect(laterStage('2a', '3')).toBe('3')
    expect(laterStage('4c', '1')).toBe('4c')
  })

  it('puts the decode before the short record from 3.1', () => {
    expect(routineOrder(playAt('2a'))).toEqual(['retell', 'asked', 'given', 'decode', 'typeDiagram', 'plan', 'compute', 'answer'])
    expect(routineOrder(playAt('3'))).toEqual(['retell', 'asked', 'decode', 'given', 'typeDiagram', 'plan', 'compute', 'answer'])
  })

  it('records the steps each stage prompts, where the data covers them', () => {
    expect(promptedSteps(triangle, playAt('1'))).toEqual(['retell', 'asked', 'given', 'decode', 'typeDiagram', 'plan', 'compute', 'answer'])
    expect(promptedSteps(triangle, playAt('3'))).toEqual(['retell', 'asked', 'decode', 'typeDiagram'])
    expect(promptedSteps(triangle, playAt('4a'))).toEqual(['decode'])
    expect(promptedSteps(boy, playAt('4a'))).toEqual([])
    expect(promptedSteps(triangle, playAt('4c'))).toEqual([])
  })
})

describe('the triangle at every stage', () => {
  it('1.x: fully guided, as before', () => {
    expect(kinds(triangle, playAt('1'))).toEqual(buildScreens(triangle, null).map(name))
    expect(kinds(triangle, playAt('1'))).toContain('compute')
    expect(kinds(triangle, playAt('1'))).toContain('answer')
  })

  it('2.1–2.4: plan cards, then each action named and its result typed, the answer on paper', () => {
    const chosen = { plan: 0, order: [0, 1, 2] }
    expect(kinds(triangle, playAt('2a'), { plan: chosen }).slice(-6)).toEqual(['plan', 'result1', 'result2', 'result3', 'paper:answer', 'review'])
    expect(kinds(triangle, playAt('2a', 'small', { handover: 'x' }))[0]).toBe('handover')
  })

  it('3.x, small steps: each plan line then its action, a line at a time', () => {
    const play = playAt('3')
    expect(kinds(triangle, play)).toEqual([
      'retell', 'askedTap', 'askedChoice', 'decode', 'decode', 'decode', 'why:decode', 'paper:given', 'types', 'diagram',
      'line1', 'paper:answer', 'review',
    ])
    expect(kinds(triangle, play, notebookWith(triangle, ['bc'])).slice(10)).toEqual(['line1', 'result1', 'line2', 'paper:answer', 'review'])
    expect(kinds(triangle, play, notebookWith(triangle, ['bc', 'ac', 'perimeter'])).slice(10)).toEqual([
      'line1', 'result1', 'line2', 'result2', 'line3', 'result3', 'paper:answer', 'review',
    ])
  })

  it('3.x, big steps: the whole plan, its lines, then the actions', () => {
    const play = playAt('3', 'big')
    expect(kinds(triangle, play).slice(10)).toEqual(['planWhole', 'line1-big', 'paper:answer', 'review'])
    expect(kinds(triangle, play, notebookWith(triangle, ['bc', 'ac', 'perimeter'])).slice(10)).toEqual([
      'planWhole', 'line1-big', 'line2-big', 'line3-big', 'result1', 'result2', 'result3', 'paper:answer', 'review',
    ])
  })

  it('4.1–4.3: only the decode is prompted; the diagram goes on paper', () => {
    expect(kinds(triangle, playAt('4a'))).toEqual([
      'paper:retell', 'paper:asked', 'decode', 'decode', 'decode', 'why:decode', 'paper:given', 'paper:typeDiagram', 'line1', 'paper:answer', 'review',
    ])
  })

  it('4.4–4.5: every step on paper, each after «Який крок далі?»; small steps run the plan and actions together', () => {
    expect(kinds(triangle, playAt('4b'), notebookWith(triangle, ['bc']))).toEqual([
      'nextStep:retell', 'paper:retell', 'nextStep:asked', 'paper:asked', 'nextStep:decode', 'paper:decode', 'nextStep:given', 'paper:given',
      'nextStep:typeDiagram', 'paper:typeDiagram', 'nextStep:plan', 'line1', 'result1', 'line2', 'nextStep:answer', 'paper:answer', 'review',
    ])
    const big = kinds(triangle, playAt('4b', 'big'), notebookWith(triangle, ['bc', 'ac', 'perimeter']))
    expect(big.slice(10)).toEqual(['nextStep:plan', 'planWhole', 'line1-big', 'line2-big', 'line3-big', 'nextStep:compute', 'result1', 'result2', 'result3', 'nextStep:answer', 'paper:answer', 'review'])
  })

  it('4.6–4.7: the solo choice first; the steps only if she goes step by step or switches', () => {
    const play = playAt('4c')
    expect(kinds(triangle, play)).toEqual(['soloChoice'])
    expect(kinds(triangle, play, { solo: 'solo' })).toEqual(['soloChoice', 'solo'])
    expect(kinds(triangle, play, { solo: 'right' })).toEqual(['soloChoice', 'solo', 'review'])
    expect(kinds(triangle, play, { solo: 'switched' }).slice(0, 4)).toEqual(['soloChoice', 'solo', 'nextStep:retell', 'paper:retell'])
    expect(kinds(triangle, play, { solo: 'steps' }).slice(0, 3)).toEqual(['soloChoice', 'nextStep:retell', 'paper:retell'])
  })

  it('merges a small-steps action into the plan on the progress bar', () => {
    const screens = buildScreens(triangle, null, playAt('3'), notebookWith(triangle, ['bc']))
    expect(stepsShown(screens)).toEqual(['retell', 'asked', 'decode', 'given', 'typeDiagram', 'plan', 'answer'])
  })
})

describe('the walking boy', () => {
  it('plays at 2.1–2.4 with its plan cards, and has no Порівняння on paper', () => {
    expect(kinds(boy, playAt('2a')).slice(0, 9)).toEqual(['retell', 'askedTap', 'askedChoice', 'given', 'given', 'hidden', 'types', 'diagram', 'plan'])
    expect(hasStep(boy, 'decode', playAt('4b'))).toBe(false)
    expect(hasStep(triangle, 'decode', playAt('4b'))).toBe(true)
    expect(kinds(boy, playAt('4b'))).not.toContain('nextStep:decode')
  })

  it('hides the slot count from 2.5', () => {
    expect(playAt('2a').hideSlotCount).toBe(false)
    expect(playAt('2b').hideSlotCount).toBe(true)
  })

  it('runs every stage without a gap', () => {
    for (const stage of STAGE_IDS) expect(buildScreens(boy, null, playAt(stage), { solo: 'steps' }).at(-1)?.kind).toBe('review')
  })
})

describe('the short record on screen', () => {
  it('is written by the prompted steps while Відомо is prompted, and only from her checked record from 3.1', () => {
    const decode = triangle.steps.decode!.comparisons[1]
    expect(writesAt(triangle, playAt('2a'), {}, decode)).toEqual({ ac: 'AC — ?, на 5,1 см більша, ніж BC' })
    expect(writesAt(triangle, playAt('3'), {}, decode)).toEqual({})
  })
})
