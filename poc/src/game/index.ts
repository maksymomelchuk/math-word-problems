/**
 * The game layer in use: option 1 · Стежка (ticket «Build the game layer and
 * the loop through the problem set», on the calls in
 * `.scratch/word-problem-poc/assets/game-calls.md`). Everything option-specific
 * (home, top bar, the bird, the dressing of the end, handover, 4.6 and
 * level-end screens) is in `./stezhka/`; the rest of the app reaches it only
 * through these names. Switching to option 2 or 3 means a sibling folder with
 * the same five exports, and changing the lines below.
 *
 * Option-neutral, for any option: the loop (`../fading/loop.ts`), the path and
 * the celebrations due (`./path.ts`), how a problem went (`./outcome.ts`), XP
 * and the daily goal (`./score.ts`).
 */
export { StezhkaHome as GameHome } from './stezhka/Home'
export { EndDressing } from './stezhka/EndDressing'
export { HandoverDressing, SoloChoiceDressing, SoloChoiceNote } from './stezhka/HandoverDressing'
