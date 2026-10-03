import { describe, expect, it } from 'vitest'
import { add, answersMatch, compare, divide, formatDecimal, multiply, parseDecimal, subtract } from './decimal'

const d = (text: string) => {
  const value = parseDecimal(text)
  if (!value) throw new Error(`not a number: ${text}`)
  return value
}
const show = (value: ReturnType<typeof divide>) => (value ? formatDecimal(value) : null)

describe('parseDecimal', () => {
  it('reads a decimal comma, a point, and whole numbers', () => {
    expect(show(d('12,442'))).toBe('12,442')
    expect(show(d('12.442'))).toBe('12,442')
    expect(show(d('3000'))).toBe('3000')
    expect(show(d('3 000'))).toBe('3000')
  })

  it('normalizes leading and trailing zeros', () => {
    expect(show(d('12,400'))).toBe('12,4')
    expect(show(d('007'))).toBe('7')
    expect(show(d(',5'))).toBe('0,5')
    expect(show(d('5,'))).toBe('5')
    expect(show(d('0,0'))).toBe('0')
  })

  it('reads negatives with a hyphen or a minus sign', () => {
    expect(show(d('-4,5'))).toBe('−4,5')
    expect(show(d('−0,05'))).toBe('−0,05')
  })

  it('rejects anything that is not one number', () => {
    for (const text of ['', ',', '1,2,3', '1.2,3', 'abc', '12 см', '1e3', '+-1']) {
      expect(parseDecimal(text)).toBeNull()
    }
  })
})

describe('arithmetic is exact', () => {
  it('0,1 + 0,2 = 0,3', () => {
    expect(show(add(d('0,1'), d('0,2')))).toBe('0,3')
    expect(answersMatch(show(add(d('0,1'), d('0,2')))!, '0,3')).toBe(true)
  })

  it('handles the motivating examples', () => {
    // Triangle: AB = 8,4; BC = AB + 3,7; AC = BC + 5,1.
    const bc = add(d('8,4'), d('3,7'))
    const ac = add(bc, d('5,1'))
    expect(show(bc)).toBe('12,1')
    expect(show(ac)).toBe('17,2')
    expect(show(add(add(d('8,4'), bc), ac))).toBe('37,7')
    // Walking boy: 3000 m in 60 min, how far in 20 min.
    expect(show(multiply(divide(d('3000'), d('60'))!, d('20')))).toBe('1000')
  })

  it('subtracts, multiplies and divides', () => {
    expect(show(subtract(d('12,4'), d('3,8')))).toBe('8,6')
    expect(show(subtract(d('1'), d('1,25')))).toBe('−0,25')
    expect(show(multiply(d('1,5'), d('0,2')))).toBe('0,3')
    expect(show(divide(d('7,5'), d('2,5')))).toBe('3')
    expect(show(divide(d('1'), d('8')))).toBe('0,125')
    expect(show(divide(d('-3'), d('-0,6')))).toBe('5')
  })

  it('returns null for division by zero or a non-terminating quotient', () => {
    expect(divide(d('1'), d('0'))).toBeNull()
    expect(divide(d('10'), d('3'))).toBeNull()
  })
})

describe('compare and answersMatch', () => {
  it('compares by value, not by how the number is written', () => {
    expect(compare(d('12,4'), d('12,40'))).toBe(0)
    expect(compare(d('0,9'), d('0,10'))).toBe(1)
    expect(compare(d('-1'), d('0,5'))).toBe(-1)
  })

  it('matches equal answers and rejects others', () => {
    expect(answersMatch('12,40', '12,4')).toBe(true)
    expect(answersMatch('12.4', '12,4')).toBe(true)
    expect(answersMatch('1000', '1000')).toBe(true)
    expect(answersMatch('12,44', '12,4')).toBe(false)
    expect(answersMatch('', '0')).toBe(false)
    expect(answersMatch('1,2,3', '1,2')).toBe(false)
  })
})
