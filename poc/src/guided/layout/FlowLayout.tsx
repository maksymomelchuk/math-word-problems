import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { NotebookCard } from './NotebookCard'
import { TopBar } from './TopBar'
import { bringIntoView } from './scroll'

type FlowLayoutProps = {
  /** The `ProblemText`, with this screen's highlights. */
  text: ReactNode
  /** The screen's own part: its question and what she taps. */
  task: ReactNode
  dock: ReactNode
  /** What to bring into view when the screen opens: the text (when she taps it) or the task. */
  focus?: 'text' | 'task'
}

/**
 * A screen of the guided problem: the problem text on top, the write-up
 * building under it, the screen's task, and the dock. On wide screens the
 * text and write-up sit in a column of their own, beside the task.
 */
export function FlowLayout({ text, task, dock, focus = 'task' }: FlowLayoutProps) {
  const textRef = useRef<HTMLDivElement>(null)
  const taskRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (focus === 'text') bringIntoView(textRef.current, 'start')
    else bringIntoView(taskRef.current)
    // Runs when the screen opens: each screen mounts its own layout, and `focus` doesn't change.
  }, [focus])

  return (
    <div className="flow">
      <TopBar />
      <div className="flow-body">
        <div className="flow-side" ref={textRef}>
          {text}
          <NotebookCard />
        </div>
        <main className="task" ref={taskRef}>
          {task}
        </main>
      </div>
      {dock}
    </div>
  )
}
