import { useEffect } from 'react'
// Shared controls first, so each screen's own styles can build on them.
import './App.css'
import { HomeworkPage } from './game'
import { GuidedProblemView } from './guided/GuidedProblemView'
import { backToList } from './lib/navigation'
import { useHashRoute } from './lib/useHashRoute'
import { findProblem } from './problems/problems'
import { DiagramGallery } from './screens/DiagramGallery'
import { Home } from './screens/Home'
import { ParentView } from './screens/ParentView'
import { TypeStepTry } from './screens/TypeStepTry'

/**
 * Routes: `#/` her home (the game layer's path through the problem set, with
 * the level-end and set-end screens), `#/problem/2.3` a guided problem,
 * `#/homework` all her homework, and two pages for the parent that her screens
 * don't link to: `#/parent` (what is recorded, and a reset) and `#/diagrams`
 * (diagram samples), plus `#/try/2.3`, the parent's try of one problem's Тип і
 * схема in the version picked there.
 */
export default function App() {
  const [page, id] = useHashRoute()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page, id])

  const problem = id ? findProblem(id) : undefined
  if (page === 'problem' && problem) return <GuidedProblemView key={problem.id} problem={problem} onExit={backToList} />
  if (page === 'try' && problem) return <TypeStepTry key={problem.id} problem={problem} />
  if (page === 'homework') return <HomeworkPage />
  if (page === 'parent') return <ParentView />
  if (page === 'diagrams') return <DiagramGallery />
  return <Home />
}
