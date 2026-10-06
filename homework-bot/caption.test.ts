import assert from 'node:assert/strict'
import { test } from 'node:test'
import { homeworkId, homeworkTitle, localDay, problemNumbers } from './caption.ts'

test('reads the problem numbers she writes', () => {
  assert.deepEqual(problemNumbers('6.2'), ['6.2'])
  assert.deepEqual(problemNumbers('6,2'), ['6.2'])
  assert.deepEqual(problemNumbers('№ 512'), ['512'])
  assert.deepEqual(problemNumbers('6.1 і 6.2'), ['6.1', '6.2'])
  assert.deepEqual(problemNumbers('6.1, 6.2, 6.2'), ['6.1', '6.2'])
  assert.deepEqual(problemNumbers('Задача'), [])
  assert.deepEqual(problemNumbers(undefined), [])
})

test('names and files each problem', () => {
  assert.equal(homeworkTitle('6.2'), 'Завдання 6, задача 2')
  assert.equal(homeworkTitle('512'), 'Задача 512')
  assert.equal(localDay(new Date(2026, 9, 6, 23, 59)), '2026-10-06')
  assert.equal(homeworkId('2026-10-06', '6.2', new Set()), 'hw-2026-10-06-6.2')
  assert.equal(homeworkId('2026-10-06', '6.2', new Set(['hw-2026-10-06-6.2', 'hw-2026-10-06-6.2-2'])), 'hw-2026-10-06-6.2-3')
})
