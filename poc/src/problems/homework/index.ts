import type { Homework } from '../types'

/**
 * Her homework problems, one per file (`hw-*.ts`, each exporting its
 * `Homework` as default), newest first, and in problem order within a day.
 * The homework bot (`homework-bot/`) adds a file here for each photo she
 * sends; nothing else needs to change.
 */
const files = import.meta.glob<{ default: Homework }>('./hw-*.ts', { eager: true })

const byNumber = new Intl.Collator('uk', { numeric: true })

export const HOMEWORK: readonly Homework[] = Object.values(files)
  .map((file) => file.default)
  .sort((a, b) => b.added.localeCompare(a.added) || byNumber.compare(a.title, b.title))
