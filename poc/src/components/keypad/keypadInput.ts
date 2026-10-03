/** What the on-screen keypad can send. */
export type KeypadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | ',' | 'backspace'

export const DEFAULT_MAX_LENGTH = 9

/**
 * The typed text after one key press. Keeps the text a well-formed number in
 * progress: at most one comma, a leading comma becomes `0,`, and a lone `0`
 * is replaced by the next digit rather than giving `05`.
 */
export function applyKey(value: string, key: KeypadKey, maxLength = DEFAULT_MAX_LENGTH): string {
  if (key === 'backspace') return value.slice(0, -1)
  if (value.length >= maxLength) return value
  if (key === ',') {
    if (value.includes(',')) return value
    return (value || '0') + ','
  }
  return value === '0' ? key : value + key
}

/**
 * Maps a physical key to a keypad key: digits, `.` and `,` (both become the
 * comma), Backspace and Delete. Returns 'enter' for Enter and null for keys the
 * keypad ignores, including shortcuts with Ctrl, Cmd or Alt.
 */
export function keyFromKeyboard(event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey'>): KeypadKey | 'enter' | null {
  if (event.ctrlKey || event.metaKey || event.altKey) return null
  const { key } = event
  if (key.length === 1 && key >= '0' && key <= '9') return key as KeypadKey
  if (key === '.' || key === ',' || key === 'Decimal') return ','
  if (key === 'Backspace' || key === 'Delete') return 'backspace'
  if (key === 'Enter') return 'enter'
  return null
}
