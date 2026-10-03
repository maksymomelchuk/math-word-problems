/**
 * Checks the relations' own words, which the one-relation-per-screen versions
 * of Тип і схема read: each quote is the problem's own words, and each
 * relation's id marks the pieces of the text to highlight.
 */
import { quoteInText } from './quotes'
import type { Relation, TextPart } from './types'

export function checkRelationQuotes(text: readonly TextPart[], relations: readonly Relation[]): string[] {
  const errors: string[] = []
  const ids = relations.flatMap((relation) => (relation.id ? [relation.id] : []))
  if (new Set(ids).size !== ids.length) errors.push('a relation id is used twice')
  const marked = new Set(text.flatMap((part) => part.relations ?? []))
  for (const id of marked) {
    if (!ids.includes(id)) errors.push(`the text marks relation «${id}», which isn't listed`)
  }
  const quoted = relations.some((relation) => relation.quote)
  relations.forEach((relation, i) => {
    const where = `relation ${i + 1}`
    if (relation.id && !marked.has(relation.id)) errors.push(`${where}: no part of the text is marked «${relation.id}»`)
    if (relation.quote && !quoteInText(relation.quote, text)) errors.push(`${where}: «${relation.quote}» isn't the problem's own words`)
    if (relation.quote && !relation.id) errors.push(`${where}: has a quote but no id to highlight it`)
    if (quoted && !relation.quote) errors.push(`${where}: has no quote, which the other relations have`)
  })
  return errors
}
