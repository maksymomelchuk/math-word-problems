import { useEffect, useRef, useState } from 'react'
import { bringIntoView } from '../guided/layout/scroll'
import { loadProgress, type Progress } from '../lib/progress'
import { PROBLEMS } from '../problems/problems'
import { NOTHING_SHOWN, NO_OWN_ATTEMPTS, NO_SOLO, SHOWN_TITLE, SOLO_TITLE, hasOwnAttempts, recordsText, shownByLevel, soloLines, type SummaryLine } from './trialRecords'
import './trialRecords.css'

function Lines({ lines }: { lines: readonly SummaryLine[] }) {
  return (
    <ul className="trial-lines">
      {lines.map((line, i) => (
        <li key={`${line.problemId}-${i}`}>
          <strong className="trial-line-title">{line.title}</strong>, {line.when} — {line.what}
        </li>
      ))}
    </ul>
  )
}

/**
 * The top of «Для батьків»: what the parent judges *does it help* from, at a
 * glance. «Де довелося показати» by level, her solo tries, and «Скопіювати
 * записи». Her own attempts only, as `trialRecords.ts` reads them.
 */
export function TrialSummary({ progress }: { progress: Progress }) {
  const levels = shownByLevel(progress, PROBLEMS)
  const solo = soloLines(progress, PROBLEMS)
  const own = hasOwnAttempts(progress)

  return (
    <div className="trial">
      <section className="record trial-section" aria-labelledby="trial-shown">
        <h2 className="record-title" id="trial-shown">
          {SHOWN_TITLE}
        </h2>
        <p className="trial-lead">Задачі, де застосунку довелося показати рядок плану чи результат дії, і як пройшов їхній повтор у кінці рівня.</p>
        {!own && <p className="record-empty">{NO_OWN_ATTEMPTS}</p>}
        {own && !levels.length && <p className="record-empty">{NOTHING_SHOWN}</p>}
        {levels.map(({ level, lines }) => (
          <div key={level} className="trial-level">
            <h3 className="trial-level-title">Рівень {level}</h3>
            <Lines lines={lines} />
          </div>
        ))}
      </section>
      <section className="record trial-section" aria-labelledby="trial-solo">
        <h2 className="record-title" id="trial-solo">
          {SOLO_TITLE}
        </h2>
        <p className="trial-lead">Задачі 4.6, 4.7 і всі, які вона грає після 4.7: її вибір, як пішло і скільки хвилин.</p>
        {solo.length ? <Lines lines={solo} /> : <p className="record-empty">{NO_SOLO}</p>}
      </section>
      <CopyRecords />
    </div>
  )
}

/** Copies by selecting a textarea: the way older Safari copies, and only inside the tap itself. */
function copyBySelection(field: HTMLTextAreaElement): boolean {
  field.select()
  field.setSelectionRange(0, field.value.length)
  try {
    return document.execCommand('copy')
  } catch {
    return false
  }
}

/** The same, with a field made for it and removed straight after. */
function copyWithHiddenField(text: string): boolean {
  const field = document.createElement('textarea')
  field.value = text
  field.readOnly = true
  field.setAttribute('aria-hidden', 'true')
  field.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0;font-size:16px'
  const focused = document.activeElement
  document.body.append(field)
  const done = copyBySelection(field)
  field.remove()
  if (focused instanceof HTMLElement) focused.focus({ preventScroll: true })
  return done
}

/**
 * «Скопіювати записи»: every record as plain text, so the parent can keep a
 * weekly copy. It tries the clipboard on the tap. If the device refuses, the
 * text opens in a field the parent can select and copy by hand.
 */
function CopyRecords() {
  const [manual, setManual] = useState(false)
  const [text, setText] = useState('')
  const [flash, setFlash] = useState(0)
  const field = useRef<HTMLTextAreaElement>(null)
  const fallback = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  // The field opens below the button: bring it into view.
  useEffect(() => {
    if (manual) bringIntoView(fallback.current)
  }, [manual])

  function confirmCopied() {
    setFlash((n) => n + 1)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setFlash(0), 2400)
  }

  function copy() {
    // Built in the tap, from what is saved now: Safari copies only inside the tap itself.
    const fresh = recordsText(loadProgress(), PROBLEMS, new Date())
    setText(fresh)
    const clipboard = navigator.clipboard as Clipboard | undefined
    if (!clipboard?.writeText) {
      // No clipboard API (not a secure page): copy by selection, still inside the tap.
      if (copyWithHiddenField(fresh)) confirmCopied()
      else setManual(true)
      return
    }
    clipboard.writeText(fresh).then(confirmCopied, () => setManual(true))
  }

  function selectAndCopy() {
    if (field.current && copyBySelection(field.current)) confirmCopied()
  }

  return (
    <section className="copy-records" aria-label="Скопіювати записи">
      <div className="copy-row">
        <button type="button" className="copy-button" onClick={copy}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V6a2 2 0 0 1 2-2h9" />
          </svg>
          Скопіювати записи
        </button>
        <span className="copy-status" role="status">
          {flash > 0 && (
            <span key={flash} className="copy-status-text">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
              Скопійовано
            </span>
          )}
        </span>
      </div>
      <p className="trial-lead">Записи є лише на цьому пристрої, і «Стерти записи» їх видаляє. Раз на тиждень копіюйте їх, наприклад, у Нотатки.</p>
      {manual && (
        <div className="copy-manual" ref={fallback}>
          <p className="copy-manual-note">
            Пристрій не дав скопіювати одним дотиком. Торкніться «Виділити все»: якщо не скопіюється, торкніться виділеного тексту й виберіть «Скопіювати».
          </p>
          <textarea ref={field} className="copy-field" readOnly value={text} rows={8} aria-label="Записи текстом" />
          <button type="button" className="copy-button copy-button--quiet" onClick={selectAndCopy}>
            Виділити все
          </button>
        </div>
      )}
    </section>
  )
}
