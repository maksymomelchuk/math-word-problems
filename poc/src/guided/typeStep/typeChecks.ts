/**
 * The checks of the one-relation-per-screen versions of Тип і схема, as pure
 * functions. The first version's check is `checkTypes` in `../checks.ts`.
 */
import { familyOf, type TypeFamily } from '../../problems/typeGuide'
import { PROBLEM_TYPES, type ProblemTypeId, type Relation } from '../../problems/types'
import type { Verdict } from '../checks'

/** A type's name as she learns it: «Три величини». */
export function typeName(type: ProblemTypeId): string {
  return PROBLEM_TYPES.find((t) => t.id === type)?.name ?? type
}

/** Her type for one relation. `empty` is what to say when she hasn't picked yet. */
export function checkTypePick(relation: Relation, picked: ProblemTypeId | null, empty = 'Вибери тип.'): Verdict {
  if (picked === null) return { kind: 'empty', message: empty }
  return picked === relation.type ? { kind: 'right' } : { kind: 'wrong', hint: relation.hint }
}

/** «Що тут є?», the first of the two questions: the family of the relation's type. */
export function checkFamilyPick(relation: Relation, picked: TypeFamily | null): Verdict {
  if (picked === null) return { kind: 'empty', message: 'Вибери, що тут є.' }
  return picked === familyOf(relation.type) ? { kind: 'right' } : { kind: 'wrong', hint: relation.hint }
}

/** The part of Тип і схема a record belongs to: `type-2` for naming the second relation, `type-2-family` for «Що тут є?». */
export function typePart(index: number, stage: 'family' | 'type' = 'type'): string {
  return stage === 'family' ? `type-${index + 1}-family` : `type-${index + 1}`
}

/** Reads a `typePart` back: the relation's index and the stage, or null for another part. */
export function readTypePart(part: string): { index: number; stage: 'family' | 'type' } | null {
  const match = /^type-(\d+)(-family)?$/.exec(part)
  return match ? { index: Number(match[1]) - 1, stage: match[2] ? 'family' : 'type' } : null
}

/** The words she reads on the card: the problem's own, or the restated relation when the data has no quote yet. */
export function relationQuote(relation: Relation): string {
  return relation.quote ?? relation.text
}

/** A `typePart` in the parent's records: «тип «Хлопчик пройшов 3000 м за годину.»», plus «Що тут є?» for the first question. */
export function typePartName(relations: readonly Relation[], part: string): string | null {
  const read = readTypePart(part)
  if (!read) return null
  const relation = relations[read.index]
  const which = relation ? `тип «${relationQuote(relation)}»` : `тип ${read.index + 1}`
  return read.stage === 'family' ? `${which}, «Що тут є?»` : which
}
