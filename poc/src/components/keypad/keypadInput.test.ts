import { describe, expect, it } from 'vitest'
import { applyKey, keyFromKeyboard, type KeypadKey } from './keypadInput'

const type = (keys: KeypadKey[], maxLength?: number) => keys.reduce((value, key) => applyKey(value, key, maxLength), '')

describe('applyKey', () => {
  it('types a decimal number', () => {
    expect(type(['1', '2', ',', '4', '4', '2'])).toBe('12,442')
  })

  it('allows one comma and starts a bare comma with 0', () => {
    expect(type([',', '5'])).toBe('0,5')
    expect(type(['1', ',', ',', '2', ','])).toBe('1,2')
  })

  it('replaces a lone leading zero', () => {
    expect(type(['0', '5'])).toBe('5')
    expect(type(['0', '0'])).toBe('0')
    expect(type(['0', ',', '0', '5'])).toBe('0,05')
    expect(type(['1', '0', '0'])).toBe('100')
  })

  it('backspaces one character, down to empty', () => {
    expect(type(['1', ',', '5', 'backspace'])).toBe('1,')
    expect(type(['1', 'backspace', 'backspace'])).toBe('')
  })

  it('stops at the maximum length but still backspaces', () => {
    expect(type(['1', '2', '3', '4'], 3)).toBe('123')
    expect(type(['1', '2', '3', 'backspace'], 3)).toBe('12')
  })
})

describe('keyFromKeyboard', () => {
  const key = (k: string, mods: Partial<KeyboardEvent> = {}) =>
    keyFromKeyboard({ key: k, ctrlKey: false, metaKey: false, altKey: false, ...mods })

  it('maps digits, both separators, backspace and enter', () => {
    expect(key('7')).toBe('7')
    expect(key('.')).toBe(',')
    expect(key(',')).toBe(',')
    expect(key('Backspace')).toBe('backspace')
    expect(key('Delete')).toBe('backspace')
    expect(key('Enter')).toBe('enter')
  })

  it('ignores other keys and shortcuts', () => {
    expect(key('a')).toBeNull()
    expect(key('Tab')).toBeNull()
    expect(key('F1')).toBeNull()
    expect(key('c', { metaKey: true })).toBeNull()
    expect(key('1', { ctrlKey: true })).toBeNull()
  })
})
