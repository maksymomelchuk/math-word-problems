import type { JSX, KeyboardEvent } from 'react'
import type { TextPart } from '../../problems/types'

/** How one piece of the text is marked on a screen. */
export type PartMark = 'tappable' | 'selected' | 'wrong' | 'active' | 'labelled'

type ProblemTextProps = {
  parts: readonly TextPart[]
  /** The question stays highlighted once she has found it. */
  questionFound: boolean
  /** On Знайти: she has picked the question, so the whole of it shows as picked. */
  questionSelected?: boolean
  /** The comparison to highlight (Порівняння). */
  comparison?: string
  /** The relation whose words to highlight (Тип і схема, one relation at a time). */
  relation?: string
  /** Marks on single pieces: a number to tap, the picked or labelled number, a wrong tap. */
  marks?: (part: TextPart, index: number) => PartMark[]
  /** Makes pieces tappable. */
  onTap?: (part: TextPart, index: number) => void
}

type Piece = { part: TextPart; index: number }

/** Consecutive pieces with the same key, together. A null key means unmarked. */
function runs(pieces: readonly Piece[], key: (piece: Piece) => string | null): { key: string | null; pieces: Piece[] }[] {
  const groups: { key: string | null; pieces: Piece[] }[] = []
  for (const piece of pieces) {
    const k = key(piece)
    const last = groups[groups.length - 1]
    if (last && last.key === k) last.pieces.push(piece)
    else groups.push({ key: k, pieces: [piece] })
  }
  return groups
}

/**
 * The problem text, on top on every screen, with each step's highlight.
 *
 * A highlighted phrase (the question, a comparison) is one span around its
 * pieces, so it reads as one continuous marker across pieces and line wraps.
 * On a screen that marks numbers, every number is a token with the same shape
 * (a 2px border and a little padding) for the whole screen, so marking one
 * only changes colours and never moves the text. Nothing uses
 * `text-decoration`, which Safari on iPad drew in the wrong place.
 */
export function ProblemText({ parts, questionFound, questionSelected = false, comparison, relation, marks, onTap }: ProblemTextProps) {
  function onKeyDown(event: KeyboardEvent, part: TextPart, index: number) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onTap?.(part, index)
    }
  }

  function renderPiece({ part, index }: Piece): JSX.Element {
    const own = marks?.(part, index) ?? []
    const className = ['part', part.number ? 'part--number' : '', ...own.map((mark) => `part--${mark}`)].filter(Boolean).join(' ')
    if (!onTap) {
      return (
        <span key={index} className={className}>
          {part.text}
        </span>
      )
    }
    return (
      <span
        key={index}
        className={className}
        role="button"
        tabIndex={0}
        aria-pressed={own.includes('selected') || own.includes('active')}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onTap(part, index)}
        onKeyDown={(event) => onKeyDown(event, part, index)}
      >
        {part.text}
      </span>
    )
  }

  function highlight({ part }: Piece): string | null {
    if (comparison && part.comparisons?.includes(comparison)) return 'comparison'
    if (relation && part.relations?.includes(relation)) return 'relation'
    return null
  }

  function renderComparisons(pieces: Piece[]): JSX.Element[] {
    return runs(pieces, highlight).flatMap((group) =>
      group.key
        ? [
            <span key={`c${group.pieces[0].index}`} className={`run run--${group.key}`}>
              {group.pieces.map(renderPiece)}
            </span>,
          ]
        : group.pieces.map(renderPiece),
    )
  }

  let questionState: 'selected' | 'found' | null = null
  if (questionSelected) questionState = 'selected'
  else if (questionFound) questionState = 'found'
  const pieces = parts.map((part, index) => ({ part, index }))
  // On a screen that marks numbers (Відомо), every number is a token from the start.
  const numberTokens = parts.some((part, index) => part.number && marks?.(part, index).some((m) => m === 'tappable' || m === 'active' || m === 'labelled'))

  return (
    <section className="problem-card" aria-label="Задача">
      <p className="problem-text" data-tappable={onTap ? '' : undefined} data-tokens={numberTokens ? '' : undefined}>
        {runs(pieces, ({ part }) => (part.question ? 'question' : null)).flatMap((group) =>
          group.key && questionState
            ? [
                <span key={`q${group.pieces[0].index}`} className={`run run--${questionState}`}>
                  {renderComparisons(group.pieces)}
                </span>,
              ]
            : renderComparisons(group.pieces),
        )}
      </p>
    </section>
  )
}
