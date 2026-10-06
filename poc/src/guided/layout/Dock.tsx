import { useEffect, useRef } from 'react'
import type { Feedback } from '../useTries'
import { useHeightVariable } from './scroll'

type DockProps = {
  feedback: Feedback
  label: string
  onMain: () => void
  /** Enter presses the main button. Off where a keypad already handles Enter. */
  enterKey?: boolean
  /** A screen that never has feedback (a handover, the end): no empty line held over the button. */
  quiet?: boolean
}

/** The bottom bar: feedback on her answer, and the one main button («Перевірити», «Далі»). */
export function Dock({ feedback, label, onMain, enterKey = true, quiet = false }: DockProps) {
  const ref = useRef<HTMLElement>(null)
  useHeightVariable(ref, 'dock-h')
  const latest = useRef(onMain)
  useEffect(() => {
    latest.current = onMain
  })

  useEffect(() => {
    if (!enterKey) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Enter' || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return
      // A focused control keeps its own Enter (picking an option, a slot).
      const target = event.target
      if (target instanceof HTMLElement && target.matches('button, a[href], summary, [role="button"], input, textarea, select')) return
      event.preventDefault()
      latest.current()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enterKey])

  return (
    <footer className="dock" data-tone={feedback.tone} data-quiet={quiet || undefined} ref={ref}>
      <div className="dock-inner">
        <p className="dock-message" role="status" aria-live="polite" hidden={quiet}>
          {feedback.message && (
            <span key={`${feedback.tone}:${feedback.message}`} className="dock-message-text">
              {feedback.message}
            </span>
          )}
        </p>
        <button type="button" className="main-button" data-tone={feedback.tone} onClick={onMain}>
          {label}
        </button>
      </div>
    </footer>
  )
}
