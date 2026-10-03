import { createContext, useContext } from 'react'
import type { GuidedProblem } from '../problems/types'
import type { HelpEvent } from '../lib/progress'
import type { Notebook, Screen } from './flow'

export type FlowContextValue = {
  problem: GuidedProblem
  notebook: Notebook
  screens: Screen[]
  index: number
  /** Changes the notebook when a screen settles. */
  update: (change: (notebook: Notebook) => Notebook) => void
  /** On to the next screen. */
  next: () => void
  /** Records a hint, a shown answer or a slip against a step. */
  record: (event: Omit<HelpEvent, 'at'>) => void
  /** Back to the list of problems. The problem stays open. */
  exit: () => void
  /** The closing Розбір is done. */
  finish: () => void
}

export const FlowContext = createContext<FlowContextValue | null>(null)

export function useFlow(): FlowContextValue {
  const value = useContext(FlowContext)
  if (!value) throw new Error('useFlow needs a FlowContext')
  return value
}
