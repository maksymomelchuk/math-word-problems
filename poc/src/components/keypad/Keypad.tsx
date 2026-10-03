import { useEffect, useRef, useState } from 'react'
import { DEFAULT_MAX_LENGTH, applyKey, keyFromKeyboard, type KeypadKey } from './keypadInput'
import './Keypad.css'

type KeypadProps = {
  /** The typed text, with a decimal comma: `12,4`. */
  value: string
  onChange: (value: string) => void
  /** Enter on a physical keyboard. Fires even when `disabled`. */
  onEnter?: () => void
  disabled?: boolean
  maxLength?: number
  /** Also take input from the physical keyboard. Only one keypad on screen should. */
  listenToKeyboard?: boolean
}

const ROWS: KeypadKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'backspace']
const KEY_LABELS: Partial<Record<KeypadKey, string>> = { backspace: 'Стерти', ',': 'Кома' }
const PRESS_FLASH_MS = 120

/**
 * The decimal-comma keypad: digits, `,` and backspace, with big touch targets.
 * On a laptop the physical keys work too; a typed `.` shows as `,`.
 */
export function Keypad({
  value,
  onChange,
  onEnter,
  disabled = false,
  maxLength = DEFAULT_MAX_LENGTH,
  listenToKeyboard = true,
}: KeypadProps) {
  const [flashed, setFlashed] = useState<KeypadKey | null>(null)
  const latest = useRef({ value, onChange, onEnter, disabled, maxLength })
  useEffect(() => {
    latest.current = { value, onChange, onEnter, disabled, maxLength }
  })

  useEffect(() => {
    if (!listenToKeyboard) return
    let flashTimer: number | undefined

    function onKeyDown(event: KeyboardEvent) {
      const { value, onChange, onEnter, disabled, maxLength } = latest.current
      if (isEditable(event.target)) return
      const key = keyFromKeyboard(event)
      if (key === null) return
      // Enter works even while the keys are disabled, so the screen's main
      // button (e.g. "Ще раз" after a right answer) stays reachable.
      if (key === 'enter') {
        // A focused button other than our own keys keeps its native Enter.
        if (isOtherControl(event.target) || !onEnter) return
        event.preventDefault()
        if (!event.repeat) onEnter()
        return
      }
      if (disabled) return
      event.preventDefault()
      onChange(applyKey(value, key, maxLength))
      setFlashed(key)
      window.clearTimeout(flashTimer)
      flashTimer = window.setTimeout(() => setFlashed(null), PRESS_FLASH_MS)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(flashTimer)
    }
  }, [listenToKeyboard])

  return (
    <div className="keypad" role="group" aria-label="Клавіатура для чисел">
      {ROWS.map((key) => (
        <button
          key={key}
          type="button"
          className="keypad-key"
          data-keypad-key={key}
          data-pressed={flashed === key || undefined}
          disabled={disabled}
          aria-label={KEY_LABELS[key]}
          onClick={() => onChange(applyKey(value, key, maxLength))}
        >
          {key === 'backspace' ? <BackspaceIcon /> : key}
        </button>
      ))}
    </div>
  )
}

function BackspaceIcon() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7z" />
      <path d="m12 9.5 5 5m0-5-5 5" />
    </svg>
  )
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || target.matches('input, textarea, select')
}

function isOtherControl(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.matches('button:not([data-keypad-key]), a[href], summary')
}
