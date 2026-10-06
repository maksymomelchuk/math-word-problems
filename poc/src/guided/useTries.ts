import { useState } from 'react'
import type { StepId } from '../problems/types'
import type { Verdict } from './checks'
import { useFlow } from './context'

export type Tone = 'none' | 'info' | 'ok' | 'bad' | 'shown'
export type Feedback = { tone: Tone; message: string }

/** Where a screen stands: still answering, answered right, or the answer was shown. */
export type Phase = 'open' | 'right' | 'shown'

const NO_FEEDBACK: Feedback = { tone: 'none', message: '' }

export type SubmitOptions = {
  /** Which part of the step, for the record (a number id, an action id…). */
  part?: string
  /** Said after the right answer, whether she picked it or it was shown. */
  explain?: string
  /** Said after the shown answer instead of `explain`. */
  shownExplain?: string
  /** Show the right answer on screen (second wrong try). */
  reveal?: () => void
  /** Write the settled answer into the notebook. `shown` is true when the app showed it. */
  settle?: (shown: boolean) => void
  /** After a wrong try that gets a hint, e.g. to mark what was wrong. */
  onHint?: () => void
  /** After every answered try, right or wrong, for a paper step's own records. `shown`: this try ended with the answer shown. */
  onTry?: (outcome: { right: boolean; shown: boolean }) => void
}

/**
 * Hint, then show: the first wrong try gets a hint, the second shows the
 * answer with its reason and she carries on. Each wrong try is recorded
 * against the step, and an arithmetic slip is marked as one. A paper step's
 * checks are `silent`: the screen keeps its own records in the attempt's log.
 */
export function useTries(step: StepId, { silent = false }: { silent?: boolean } = {}) {
  const { record } = useFlow()
  const [tries, setTries] = useState(0)
  const [phase, setPhase] = useState<Phase>('open')
  const [feedback, setFeedback] = useState<Feedback>(NO_FEEDBACK)

  function submit(verdict: Verdict, options: SubmitOptions = {}) {
    if (phase !== 'open') return
    if (verdict.kind === 'empty') {
      setFeedback({ tone: 'info', message: verdict.message })
      return
    }
    if (verdict.kind === 'right') {
      options.onTry?.({ right: true, shown: false })
      options.settle?.(false)
      setPhase('right')
      setFeedback({ tone: 'ok', message: options.explain ? `Так. ${options.explain}` : 'Правильно!' })
      return
    }
    const attempt = tries + 1
    setTries(attempt)
    const shown = attempt >= 2
    options.onTry?.({ right: false, shown })
    if (!silent) record({ step, ...(options.part ? { part: options.part } : {}), help: shown ? 'shown' : 'hint', ...(verdict.slip ? { slip: true } : {}), ...(verdict.sign ? { sign: verdict.sign } : {}) })
    if (!shown) {
      options.onHint?.()
      setFeedback({ tone: 'bad', message: verdict.hint })
      return
    }
    options.reveal?.()
    options.settle?.(true)
    setPhase('shown')
    setFeedback({ tone: 'shown', message: `Подивись, як правильно. ${options.shownExplain ?? options.explain ?? 'Правильну відповідь позначено зеленим.'}` })
  }

  /** She changed her answer: the old feedback no longer applies. */
  function clear() {
    if (phase === 'open') setFeedback(NO_FEEDBACK)
  }

  /** A fresh start on a new part of the same screen (another number in Відомо). */
  function restart() {
    setTries(0)
    setPhase('open')
    setFeedback(NO_FEEDBACK)
  }

  /** A note that isn't about her answer, such as «Торкнись числа.». */
  function inform(message: string) {
    if (phase === 'open') setFeedback({ tone: 'info', message })
  }

  /** Shows the answer without a wrong try: the second «Підказка» tap on a paper step. */
  function show(options: Pick<SubmitOptions, 'reveal' | 'settle'> & { message: string }) {
    if (phase !== 'open') return
    options.reveal?.()
    options.settle?.(true)
    setPhase('shown')
    setFeedback({ tone: 'shown', message: options.message })
  }

  /** A message in the dock with the screen's own tone, such as «Виправ у зошиті.» after a «Ні». */
  function say(feedback: Feedback) {
    setFeedback(feedback)
  }

  return { phase, done: phase !== 'open', tries, feedback, submit, clear, restart, inform, show, say }
}
