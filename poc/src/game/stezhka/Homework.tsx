import { useState } from 'react'
import { loadSession } from '../../guided/session'
import { loadProgress, type Progress } from '../../lib/progress'
import { openProblem } from '../../lib/navigation'
import { HOMEWORK } from '../../problems/homework'
import type { Homework } from '../../problems/types'
import { homeworkShown, homeworkState } from '../homework'
import { CheckIcon, NotebookIcon } from './art'
import { HOMEWORK_GO, WORDS, allHomework, homeworkLabel } from './words'
import './stezhka.css'

type HomeworkLinksProps = { items: readonly Homework[]; progress: Progress; openId: string | null }

/** One link per homework problem, each with its state: «Почати», «Продовжити» or «Ще раз». */
function HomeworkLinks({ items, progress, openId }: HomeworkLinksProps) {
  return (
    <ul className="st-hw">
      {items.map(({ title, problem }) => {
        const state = homeworkState(progress, openId, problem.id)
        return (
          <li key={problem.id}>
            <a className="st-hw-link" href={`#/problem/${problem.id}`} onClick={openProblem} aria-label={homeworkLabel(title, state)} data-state={state}>
              {state === 'done' ? <CheckIcon width="22" height="22" /> : <NotebookIcon width="22" height="22" />}
              <span className="st-hw-text">
                <small>{WORDS.homework}</small>
                {title}
              </span>
              <span className="st-hw-go" aria-hidden="true">
                {HOMEWORK_GO[state]}
              </span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Her homework in the sticky top bar, so it shows wherever the path is
 * scrolled: the unsolved problems and the recently solved ones, then a link to
 * all of them when there are more. Opening one while a path problem is open
 * starts that problem over next time, as opening any other problem does.
 */
export function HomeworkBar({ progress, openId }: { progress: Progress; openId: string | null }) {
  const shown = homeworkShown(progress, HOMEWORK, openId)
  const more = HOMEWORK.length > shown.length
  if (!shown.length && !more) return null
  return (
    <>
      {shown.length > 0 && <HomeworkLinks items={shown} progress={progress} openId={openId} />}
      {more && (
        <a className="st-hw-all" href="#/homework">
          {allHomework(HOMEWORK.length)}
        </a>
      )}
    </>
  )
}

/** At `#/homework`: every homework problem, newest first. */
export function HomeworkPage() {
  const [progress] = useState(loadProgress)
  const openId = loadSession()?.problemId ?? null
  return (
    <div className="st-home">
      <main className="st-hw-page">
        <a className="st-hw-back" href="#/">
          {WORDS.backHome}
        </a>
        <h1 className="st-hw-title">{WORDS.homeworkAll}</h1>
        <HomeworkLinks items={HOMEWORK} progress={progress} openId={openId} />
      </main>
    </div>
  )
}
