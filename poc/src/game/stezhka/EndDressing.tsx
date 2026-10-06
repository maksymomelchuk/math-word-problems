import { useState } from 'react'
import { loadProgress } from '../../lib/progress'
import { PROBLEMS } from '../../problems/problems'
import { endOfProblem } from '../path'
import { XP_PER_PROBLEM } from '../score'
import { AgainIcon, Bird, BoltIcon } from './art'
import { Confetti } from './Confetti'
import { WORDS, endLine, pathCount, repeatNote } from './words'
import './stezhka.css'

/**
 * The top of the end-of-problem screen: small confetti, the bird's line for
 * how it went, +10 XP and the path's progress, then the repeat note after a
 * first-pass miss. The closing Розбір follows it on the same screen.
 */
export function EndDressing({ problemId }: { problemId: string }) {
  // Read once as the screen opens, so it doesn't change while she reads.
  const [end] = useState(() => endOfProblem(loadProgress(), PROBLEMS.map((p) => p.id), problemId))
  if (!end) return null

  return (
    <section className="st-end" aria-labelledby="st-end-title">
      <div className="st-burst">
        <Confetti />
        <Bird className="st-bird st-bird--hop" />
      </div>
      <p className="st-speech">{endLine(end.outcome)}</p>
      <p className="st-end-title" id="st-end-title">
        {WORDS.solved}
      </p>
      <ul className="st-stats">
        <li className="st-stat st-stat--xp">
          <span className="st-stat-k">{WORDS.xp}</span>
          <span className="st-stat-v">
            <BoltIcon width="22" height="22" />+{XP_PER_PROBLEM} XP
          </span>
        </li>
        <li className="st-stat st-stat--path">
          <span className="st-stat-k">{WORDS.path}</span>
          <span className="st-stat-v">{pathCount(end.done, end.total)}</span>
        </li>
      </ul>
      {end.repeatAtLevel !== null && (
        <p className="st-again">
          <AgainIcon width="26" height="26" />
          {repeatNote(end.repeatAtLevel)}
        </p>
      )}
    </section>
  )
}
