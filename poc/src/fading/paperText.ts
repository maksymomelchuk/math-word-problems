/**
 * What a paper step says: its heading, what to write, and its «Підказка»
 * self-question. The self-questions are the old checklist card's lines
 * (fading-schedule-v1.md), plus the schedule's lines for План and Обчисли.
 * Drafts for the parent to review. No UI code.
 */
import type { StepId } from '../problems/types'

export type PaperText = { title: string; prompt: string; selfQuestion: string }

export const PAPER_TEXT: Record<StepId, PaperText> = {
  retell: {
    title: 'Перекажи собі задачу',
    prompt: 'Прочитай задачу ще раз і перекажи її собі своїми словами: про що вона і що треба знайти.',
    selfQuestion: 'Прочитай задачу двічі. Перекажи її собі.',
  },
  asked: {
    title: 'Що треба знайти?',
    prompt: 'Знайди в задачі питання. Що саме треба знайти і в яких одиницях? У короткому записі позначиш це знаком «?».',
    selfQuestion: 'Що треба знайти? Запиши з «?».',
  },
  given: {
    title: 'Запиши короткий запис',
    prompt: 'Запиши в зошит, що відомо і що треба знайти: кожне число з одиницею, шукане — зі знаком «?», порівняння — від шуканого.',
    selfQuestion: 'Що відомо? Запиши кожне число з одиницями. Що треба знайти? Запиши з «?».',
  },
  decode: {
    title: 'Порівняння',
    prompt: 'Прочитай кожне порівняння в задачі. Хто більший? Як сказати те саме, почавши з шуканого?',
    selfQuestion: 'Є порівняння? Хто більший? Запиши його від шуканого.',
  },
  typeDiagram: {
    title: 'Намалюй схему',
    prompt: 'Намалюй у зошиті схему до задачі. Підпиши на ній числа, а «?» постав там, де шукане.',
    selfQuestion: 'Назви тип кожного зв\'язку. Намалюй схему.',
  },
  plan: {
    title: 'Запиши план',
    prompt: 'Запиши план: про що дізнаєшся кожною дією. Поки без обчислень, тільки пояснення після риски.',
    selfQuestion: 'План: що знаходить кожна дія? Остання — те, що питають.',
  },
  compute: {
    title: 'Обчисли',
    prompt: 'Обчисли і допиши дію в зошит. Введи результат.',
    selfQuestion: 'Що означає кожне число в дії?',
  },
  answer: {
    title: 'Запиши відповідь',
    prompt: 'Запиши в зошит відповідь повним реченням: «Відповідь: …».',
    selfQuestion: 'Відповідь — повним реченням. Що питали в задачі?',
  },
}

/**
 * The school's chain from the question, for «Підказка» on the plan. The asked
 * quantity stays in the write-up's words (nominative), so no case ending can go wrong.
 */
export function planSelfQuestion(asked: string): string {
  return `Шукаємо: ${asked}. Що потрібно знати, щоб це знайти? Що з цього вже відомо?`
}

/** After a «Ні» self-check, a pick shown, or a result shown. */
export const FIX_IN_NOTEBOOK = 'Виправ у зошиті.'
