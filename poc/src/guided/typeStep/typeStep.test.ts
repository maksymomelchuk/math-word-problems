import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { findProblem } from '../../problems/problems'
import { quoteInText, quotePieces } from '../../problems/quotes'
import { FAMILY_GUIDE, TYPE_FAMILIES, TYPE_GUIDE, familyOf } from '../../problems/typeGuide'
import { PROBLEM_TYPES, type GuidedProblem } from '../../problems/types'
import { validateProblem } from '../../problems/validate'
import { checkRelationQuotes } from '../../problems/validateRelations'
import { loadProgress, recordVariant, startAttempt, type ProgressStorage } from '../../lib/progress'
import { ProblemText } from '../layout/ProblemText'
import { checkFamilyPick, checkTypePick, readTypePart, relationQuote, typeName, typePart, typePartName } from './typeChecks'
import { clearTries, finishTry, loadTries, notebookAtTypeStep, recordTryEvent, startTry } from './tryMode'
import { DEFAULT_TYPE_STEP_VARIANT, TYPE_VARIANT_KEY, loadTypeStepVariant, saveTypeStepVariant, variantLabel } from './variants'

function problem(id: string): GuidedProblem {
  const found = findProblem(id)
  if (!found) throw new Error(`no problem ${id}`)
  return found
}

function memoryStorage(initial: Record<string, string> = {}): ProgressStorage & { data: Record<string, string> } {
  const data = { ...initial }
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value
    },
    removeItem: (key) => {
      delete data[key]
    },
  }
}

/** The text inside each span with this class, in static markup. */
function textsOf(html: string, className: string): string[] {
  const texts: string[] = []
  const marker = `<span class="run ${className}">`
  for (let start = html.indexOf(marker); start >= 0; start = html.indexOf(marker, start + 1)) {
    let depth = 0
    let text = ''
    for (const token of html.slice(start).match(/<\/?span[^>]*>|[^<]+/g) ?? []) {
      if (token.startsWith('</span')) depth -= 1
      else if (token.startsWith('<span')) depth += 1
      else text += token
      if (depth === 0) break
    }
    texts.push(text)
  }
  return texts
}

const boy = problem('2.3')
const triangle = problem('4.7')
const boyRelations = boy.steps.typeDiagram!.relations
const triangleRelations = triangle.steps.typeDiagram!.relations

describe('naming one relation at a time', () => {
  it('asks for a pick first, then gives a wrong type the relation’s hint', () => {
    const [bcAb] = triangleRelations
    expect(checkTypePick(bcAb, null)).toEqual({ kind: 'empty', message: 'Вибери тип.' })
    expect(checkTypePick(bcAb, null, 'Вибери схему.')).toEqual({ kind: 'empty', message: 'Вибери схему.' })
    expect(checkTypePick(bcAb, 'ratio')).toEqual({ kind: 'wrong', hint: bcAb.hint })
    expect(checkTypePick(bcAb, 'difference')).toEqual({ kind: 'right' })
  })

  it('checks «Що тут є?» against the family of the relation’s type', () => {
    const [hour] = boyRelations
    const perimeter = triangleRelations[2]
    expect(checkFamilyPick(hour, null).kind).toBe('empty')
    expect(checkFamilyPick(hour, 'table')).toEqual({ kind: 'right' })
    expect(checkFamilyPick(hour, 'compare')).toEqual({ kind: 'wrong', hint: hour.hint })
    expect(checkFamilyPick(perimeter, 'parts')).toEqual({ kind: 'right' })
  })

  it('records each relation as its own part, and names it by her problem’s words', () => {
    expect(typePart(0)).toBe('type-1')
    expect(typePart(2, 'family')).toBe('type-3-family')
    expect(readTypePart('type-3-family')).toEqual({ index: 2, stage: 'family' })
    expect(readTypePart('types')).toBeNull()
    expect(typePartName(boyRelations, 'type-1')).toBe('тип «Хлопчик пройшов 3000 м за годину.»')
    expect(typePartName(triangleRelations, 'type-3-family')).toBe('тип «Знайди периметр трикутника.», «Що тут є?»')
    expect(typePartName(boyRelations, 'diagram')).toBeNull()
  })

  it('reads the problem’s own words, or the restated relation when there is no quote', () => {
    expect(relationQuote(boyRelations[1])).toBe('Яку відстань він пройде за 20 хвилин?')
    expect(relationQuote({ text: 'P = AB + BC + AC', type: 'partsWhole', hint: 'h' })).toBe('P = AB + BC + AC')
    expect(typeName('threeQuantities')).toBe('Три величини')
  })
})

describe('the six types, explained', () => {
  it('has a meaning and an example for every type, and puts each in one family', () => {
    for (const { id } of PROBLEM_TYPES) {
      expect(TYPE_GUIDE[id].meaning, id).not.toBe('')
      expect(TYPE_GUIDE[id].example, id).not.toBe('')
    }
    const paired = TYPE_FAMILIES.flatMap((family) => FAMILY_GUIDE[family].options.map((option) => [option.type, family]))
    expect(paired.map(([type]) => type).sort()).toEqual(PROBLEM_TYPES.map((t) => t.id).sort())
    for (const [type, family] of paired) expect(familyOf(type as never)).toBe(family)
  })

  it('never names an operation, so no type reads as a keyword rule', () => {
    const texts = [
      ...Object.values(TYPE_GUIDE).flatMap((guide) => [guide.meaning, guide.example]),
      ...Object.values(FAMILY_GUIDE).flatMap((family) => [family.option, family.title, ...family.options.map((o) => o.text)]),
    ]
    for (const text of texts) expect(text, text).not.toMatch(/дода|відн[іи]м|множ|діли|поділ|[+−·]|\d\s*:\s*\d/)
  })
})

describe('the problem’s own words', () => {
  it('finds a quote in the text, with « … » for words left out, in order', () => {
    expect(quotePieces('Сторона BC … на 5,1 см менша від AC')).toEqual(['Сторона BC', 'на 5,1 см менша від AC'])
    expect(quoteInText('Сторона BC … на 5,1 см менша від AC', triangle.text)).toBe(true)
    expect(quoteInText('на 5,1 см менша від AC … Сторона BC', triangle.text)).toBe(false)
    expect(quoteInText('AC на 5,1 см більша, ніж BC', triangle.text)).toBe(false)
    expect(quoteInText('', triangle.text)).toBe(false)
  })

  it('holds for both sample problems', () => {
    expect(checkRelationQuotes(boy.text, boyRelations)).toEqual([])
    expect(checkRelationQuotes(triangle.text, triangleRelations)).toEqual([])
  })

  it('flags reworded quotes, unmarked or unknown ids, and a missing quote', () => {
    const relations = structuredClone(triangleRelations)
    relations[0].quote = 'BC на 3,7 см більша, ніж AB'
    relations[1].id = 'nowhere'
    delete relations[2].quote
    const errors = checkRelationQuotes(triangle.text, relations).join('\n')
    expect(errors).toMatch(/relation 1: «BC на 3,7 см більша, ніж AB» isn't the problem's own words/)
    expect(errors).toMatch(/relation 2: no part of the text is marked «nowhere»/)
    expect(errors).toMatch(/the text marks relation «bcAc», which isn't listed/)
    expect(errors).toMatch(/relation 3: has no quote, which the other relations have/)

    const broken = structuredClone(triangle)
    broken.steps.typeDiagram!.relations[0].quote = 'BC довша за AB'
    expect(validateProblem(broken).join('\n')).toMatch(/4\.7 Тип і схема: relation 1: «BC довша за AB» isn't the problem's own words/)
  })

  it('highlights the relation’s words in the problem text', () => {
    const html = renderToStaticMarkup(createElement(ProblemText, { parts: triangle.text, questionFound: false, relation: 'bcAc' }))
    // «Сторона BC … на 5,1 см менша від AC»: the subject and the comparison, as quoted
    expect(textsOf(html, 'run--relation')).toEqual(['Сторона BC', 'на 5,1 см менша від AC'])
    // Порівняння still marks the whole comparison as one run
    const decodeHtml = renderToStaticMarkup(createElement(ProblemText, { parts: triangle.text, questionFound: false, comparison: 'bcAc' }))
    expect(textsOf(decodeHtml, 'run--comparison')).toEqual([', але на 5,1 см менша від AC'])
    const boyHtml = renderToStaticMarkup(createElement(ProblemText, { parts: boy.text, questionFound: true, relation: 'twenty' }))
    expect(boyHtml).toMatch(/run--found"><span class="run run--relation">/)
    expect(renderToStaticMarkup(createElement(ProblemText, { parts: boy.text, questionFound: false }))).not.toMatch(/run--relation/)
  })
})

describe('the version the parent picked', () => {
  it('starts on the recommended version and keeps the parent’s pick', () => {
    const storage = memoryStorage()
    expect(loadTypeStepVariant(storage)).toBe(DEFAULT_TYPE_STEP_VARIANT)
    saveTypeStepVariant('questions', storage)
    expect(loadTypeStepVariant(storage)).toBe('questions')
    expect(loadTypeStepVariant(memoryStorage({ [TYPE_VARIANT_KEY]: 'nonsense' }))).toBe(DEFAULT_TYPE_STEP_VARIANT)
    expect(variantLabel('pictures')).toBe('Б «Схеми»')
    expect(variantLabel('baseline')).toBe('«Як було»')
  })

  it('is noted on her attempt when she reaches the step', () => {
    const storage = memoryStorage()
    const startedAt = startAttempt('2.3', ['typeDiagram'], new Date('2026-10-03T10:00:00Z'), storage)
    recordVariant('2.3', startedAt, 'typeDiagram', 'pictures', storage)
    expect(loadProgress(storage).problems['2.3'].attempts[0].variants).toEqual({ typeDiagram: 'pictures' })
  })
})

describe('the parent’s try of the step', () => {
  it('starts with the write-up as it stands at Тип і схема', () => {
    const notebook = notebookAtTypeStep(boy)
    expect(notebook.record).toEqual({ hour: 'За 1 год (60 хв) — 3000 м', twenty: 'За 20 хв — ? м' })
    expect(notebook.questionFound).toBe(true)
    expect(notebook.labelled).toEqual(['n1', 'n2'])
    expect(notebook.diagram).toBeNull()
  })

  it('keeps its own records, with the version, apart from her problems', () => {
    const storage = memoryStorage()
    const startedAt = startTry('4.7', 'questions', new Date('2026-10-03T10:00:00Z'), storage)
    recordTryEvent(startedAt, { at: '2026-10-03T10:01:00.000Z', step: 'typeDiagram', part: 'type-1-family', help: 'hint', variant: 'questions' }, storage)
    finishTry(startedAt, new Date('2026-10-03T10:02:00Z'), storage)
    expect(loadTries(storage)).toEqual([
      {
        problemId: '4.7',
        variant: 'questions',
        startedAt: '2026-10-03T10:00:00.000Z',
        finishedAt: '2026-10-03T10:02:00.000Z',
        events: [{ at: '2026-10-03T10:01:00.000Z', step: 'typeDiagram', part: 'type-1-family', help: 'hint', variant: 'questions' }],
      },
    ])
    expect(loadProgress(storage).problems).toEqual({})
    clearTries(storage)
    expect(loadTries(storage)).toEqual([])
  })
})
