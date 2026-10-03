import { useRef } from 'react'
import { STEP_NAMES } from '../../problems/types'
import { stepsShown } from '../flow'
import { useFlow } from '../context'
import { useHeightVariable } from './scroll'

function segmentState(segment: number, current: number): 'done' | 'current' | 'todo' {
  if (segment < current) return 'done'
  if (segment === current) return 'current'
  return 'todo'
}

/** The close button and the routine's progress: one segment per step this problem has. */
export function TopBar() {
  const { screens, index, exit } = useFlow()
  const ref = useRef<HTMLElement>(null)
  useHeightVariable(ref, 'topbar-h')

  const steps = stepsShown(screens)
  const screen = screens[index]
  const current = screen.step === 'review' ? steps.length : steps.indexOf(screen.step)
  const label = screen.step === 'review' ? 'Розбір' : `Крок ${current + 1} з ${steps.length}: ${STEP_NAMES[screen.step]}`

  return (
    <header className="topbar" ref={ref}>
      <div className="topbar-inner">
        <button type="button" className="icon-button" aria-label="До списку задач" onClick={exit}>
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        <div className="progress">
          <ol className="progress-segments" aria-hidden="true">
            {steps.map((step, i) => (
              <li key={step} className="progress-segment" data-state={segmentState(i, current)} />
            ))}
          </ol>
          <p className="progress-label" aria-live="polite">
            {label}
          </p>
        </div>
      </div>
    </header>
  )
}
