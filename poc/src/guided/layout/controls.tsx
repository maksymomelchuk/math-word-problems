import type { MouseEvent, ReactNode } from 'react'

/**
 * A mouse click doesn't move focus onto the control, so a laptop's Enter keeps
 * pressing the main button. Keyboard focus (Tab) still works as usual.
 */
function keepFocus(event: MouseEvent) {
  event.preventDefault()
}

export type ChoiceState = 'idle' | 'selected' | 'right' | 'wrong'

type OptionButtonProps = {
  state: ChoiceState
  disabled?: boolean
  onClick: () => void
  children: ReactNode
  /** Short, centred, bigger text: for two-way choices such as «AB» / «BC». */
  big?: boolean
}

/** A menu option. */
export function OptionButton({ state, disabled, onClick, children, big }: OptionButtonProps) {
  return (
    <button
      type="button"
      className={big ? 'option option--big' : 'option'}
      data-state={state}
      aria-pressed={state === 'selected' || state === 'right'}
      disabled={disabled}
      onMouseDown={keepFocus}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

type ChipProps = {
  selected?: boolean
  wrong?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
  kind?: 'number' | 'sign' | 'type' | 'tool'
  label?: string
}

/** A small tappable chip: a number, a sign, a type name. */
export function Chip({ selected, wrong, disabled, onClick, children, kind = 'number', label }: ChipProps) {
  return (
    <button
      type="button"
      className={`chip chip--${kind}`}
      data-selected={selected || undefined}
      data-wrong={wrong || undefined}
      aria-pressed={kind === 'type' ? !!selected : undefined}
      aria-label={label}
      disabled={disabled}
      onMouseDown={keepFocus}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

type TaskHeadingProps = {
  title: string
  /** A small line above the title, such as «Порівняння 1 з 2». */
  eyebrow?: string
  why?: boolean
}

export function TaskHeading({ title, eyebrow, why }: TaskHeadingProps) {
  return (
    <header className="task-heading">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="task-title">
        {title}
        {why && <span className="why-badge">Чому?</span>}
      </h1>
    </header>
  )
}
