/**
 * Everything option 1 says to her, in one place. Praise names what happened,
 * with the same warmth for every outcome; nothing praises her as a person,
 * nothing pushes for one more problem, nothing is said about days away.
 */
import type { HomeworkState } from '../homework'
import { countWords, shownLine, type Outcome } from '../outcome'

export const WORDS = {
  goal: 'Мета на сьогодні\u00a0— одна задача',
  goalMet: 'Мету на сьогодні виконано',
  start: 'Почати',
  resume: 'Продовжити',
  notebookLevel: 'із зошитом',
  notebookNext: 'Знадобиться зошит',
  levelDone: 'Пройдено',
  solved: "Задачу розв'язано!",
  xp: 'Досвід',
  path: 'Стежка',
  next: 'Далі',
  handoverKicker: 'Новий етап',
  inApp: 'Тут, як і раніше',
  inNotebook: 'У зошиті',
  handoverTip: 'Поклади поруч зошит і ручку. Не знаєш, що далі? Натисни «Підказка».',
  sameXp: 'Досвід однаковий: +10\u00a0XP за будь-який спосіб.',
  setDone: 'Усі 30 задач пройдено!',
  setFree: 'Тепер можна повертатися до будь-якої задачі.',
  forParent: 'Для батьків',
  homework: 'Домашнє завдання',
  homeworkAll: 'Домашні задачі',
  again: 'Ще раз',
  backHome: 'До стежки',
}

/** The bird's line on the end-of-problem screen. Only the line changes with how it went: nothing is ever taken away. */
export function endLine(outcome: Outcome): string {
  switch (outcome.kind) {
    case 'solo':
      return "Увесь розв'язок — у зошиті, і відповідь зійшлася."
    case 'clean':
      return 'Усе зійшлося з першого разу.'
    case 'hints':
      return "Підказки саме для цього. Задачу розв'язано!"
    case 'shown':
      return `${shownLine(outcome.shown)} Нічого страшного.`
  }
}

export function repeatNote(level: number): string {
  return `Ця задача ще раз з'явиться в кінці рівня ${level}.`
}

export function levelTitle(level: number): string {
  return `Рівень ${level}`
}

export function levelDoneTitle(level: number): string {
  return `Рівень ${level} пройдено!`
}

/** What a level held: «7 задач, 1 повтор». */
export function levelHeld({ problems, repeats }: { problems: number; repeats: number }): string {
  const parts = [countWords(problems, ['задача', 'задачі', 'задач'])]
  if (repeats) parts.push(countWords(repeats, ['повтор', 'повтори', 'повторів']))
  return parts.join(', ')
}

/** On the set-end screen, the last level's line: «Рівень 4 пройдено: 7 задач, 1 повтор». */
export function levelHeldLine(level: number, held: string): string {
  return `Рівень ${level} пройдено: ${held}`
}

export function problemTitle(number: number): string {
  return `Задача ${number}`
}

export function repeatTitle(number: number): string {
  return `Повтор задачі ${number}`
}

/** A node's name for a screen reader. */
export function nodeLabel(number: number, repeat: boolean, state: 'done' | 'next' | 'locked', open: boolean): string {
  const name = repeat ? repeatTitle(number) : problemTitle(number)
  if (state === 'locked') return `${name}: ще ${repeat ? 'закритий' : 'закрита'}`
  if (state === 'next') return `${name}: ${open ? 'продовжити' : 'почати'}`
  return `${name}: розв'язано${open ? ', продовжити' : ', відкрити ще раз'}`
}

/** The word on a homework link's button. */
export const HOMEWORK_GO: Record<HomeworkState, string> = { new: WORDS.start, open: WORDS.resume, done: WORDS.again }

const HOMEWORK_ACTION: Record<HomeworkState, string> = { new: 'почати', open: 'продовжити', done: "розв'язано, відкрити ще раз" }

/** A homework link's name for a screen reader: «Домашнє завдання, Завдання 6, задача 2: почати». */
export function homeworkLabel(title: string, state: HomeworkState): string {
  return `${WORDS.homework}, ${title}: ${HOMEWORK_ACTION[state]}`
}

/** The link to every homework problem: «Усі домашні задачі (3)». */
export function allHomework(count: number): string {
  return `Усі домашні задачі (${count})`
}

export function finishOpenFirst(number: number): string {
  return `Спершу закінчи задачу ${number}, вона вже відкрита.`
}

export function pathCount(done: number, total: number): string {
  return `${done} з ${total}`
}
