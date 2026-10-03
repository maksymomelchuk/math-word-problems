import type { ChoiceState } from './controls'

/** The state of option `index` in a menu, given her pick and how the screen stands. */
export function optionState(index: number, picked: number | null, rightIndex: number, done: boolean, markedWrong: number | null): ChoiceState {
  if (done && index === rightIndex) return 'right'
  if (index === markedWrong) return 'wrong'
  if (index === picked) return done ? 'wrong' : 'selected'
  return 'idle'
}
