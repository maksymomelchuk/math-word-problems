import { PROBLEMS } from '../problems/problems'
import { isSolved, loadProgress } from '../lib/progress'
import { loadSession } from '../guided/session'
import { openProblem } from '../lib/navigation'
import './screens.css'

type Status = 'open' | 'solved' | 'new'

const STATUS_LABELS: Record<Status, string> = {
  open: 'Продовжити',
  solved: "Розв'язано",
  new: 'Почати',
}

function problemStatus(open: boolean, solved: boolean): Status {
  if (open) return 'open'
  if (solved) return 'solved'
  return 'new'
}

/**
 * The list of problems, by level. A level shows only «Рівень N» and a problem
 * only its number and opening words: no title that could name a type. The
 * parent's page is linked at the bottom: the home-screen app has no address
 * bar, and its storage is its own, so the records can only be read from inside it.
 */
export function Home() {
  const progress = loadProgress()
  const session = loadSession()
  const levels = [...new Set(PROBLEMS.map((problem) => problem.level))]

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Задачі</h1>
      </header>
      <main>
        {levels.map((level) => (
          <section key={level} className="level" aria-labelledby={`level-${level}`}>
            <h2 className="eyebrow" id={`level-${level}`}>
              Рівень {level}
            </h2>
            <ul className="problem-list">
              {PROBLEMS.filter((problem) => problem.level === level).map((problem) => {
                const status = problemStatus(session?.problemId === problem.id, isSolved(progress, problem.id))
                return (
                  <li key={problem.id}>
                    <a className="problem-link" href={`#/problem/${problem.id}`} onClick={openProblem} data-status={status}>
                      <span className="problem-link-number">Задача {problem.id}</span>
                      <span className="problem-link-preview">{problem.text.map((part) => part.text).join('')}</span>
                      <span className="problem-link-status">{STATUS_LABELS[status]}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </main>
      <footer className="page-footer">
        <a className="text-link text-link--quiet" href="#/parent">
          Для батьків
        </a>
      </footer>
    </div>
  )
}
