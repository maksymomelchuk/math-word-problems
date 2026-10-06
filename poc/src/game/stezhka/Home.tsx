import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { isFinished, levels } from '../../fading/loop'
import { loadStageSwitch } from '../../fading/stageSwitch'
import { STAGES } from '../../fading/stages'
import { loadSession } from '../../guided/session'
import { Dock } from '../../guided/layout/Dock'
import { loadProgress, recordLevelEndSeen, recordSetEndSeen, type Progress } from '../../lib/progress'
import { openProblem } from '../../lib/navigation'
import { HOMEWORK } from '../../problems/homework'
import { PROBLEMS } from '../../problems/problems'
import { celebrationDue, levelSummary, pathOf, type Celebration, type Path, type PathItem, type PathLevel } from '../path'
import { goalMetToday, xpTotal } from '../score'
import { AgainIcon, Bird, BoltIcon, CheckIcon, LockIcon, NotebookIcon, StarIcon, TrophyIcon } from './art'
import { Confetti } from './Confetti'
import { HOMEWORK_GO, WORDS, finishOpenFirst, homeworkLabel, levelDoneTitle, levelHeld, levelHeldLine, levelTitle, nodeLabel, pathCount, repeatTitle, type HomeworkState } from './words'
import '../../guided/guided.css'
import './stezhka.css'

const SLOTS = PROBLEMS.map((p) => p.id)
/** The path's zigzag: each node's sideways step from the middle. */
const OFFSETS = [0, 1, 2, 1, 0, -1, -2, -1]
const BLOCK_NOTE_MS = 2600

/** Her home: the path through the four levels, or a level-end or set-end screen when one is due. */
export function StezhkaHome() {
  const [progress, setProgress] = useState(loadProgress)
  const due = celebrationDue(progress, SLOTS)

  if (due) {
    return (
      <CelebrationScreen
        key={due.kind === 'set' ? 'set' : due.level}
        due={due}
        progress={progress}
        onDone={() => {
          if (due.kind === 'set') recordSetEndSeen(levels(SLOTS).at(-1)!)
          else recordLevelEndSeen(due.level)
          setProgress(loadProgress())
        }}
      />
    )
  }
  return <PathScreen progress={progress} />
}

function GoalRing({ met }: { met: boolean }) {
  const r = 10
  const length = 2 * Math.PI * r
  return (
    <svg className="st-ring" viewBox="0 0 28 28" aria-hidden="true" focusable="false">
      <circle className="st-ring-track" cx="14" cy="14" r={r} />
      <circle className="st-ring-fill" cx="14" cy="14" r={r} strokeDasharray={length} strokeDashoffset={met ? 0 : length} />
      {met && <path d="M9.5 14.2l3 3 6-6.2" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  )
}

type GameBarProps = { progress: Progress; finished: boolean; openId: string | null; barRef: RefObject<HTMLElement | null> }

/** The XP total and today's goal, then her homework. No streak, no day count; the goal goes once the set is finished. */
function GameBar({ progress, finished, openId, barRef }: GameBarProps) {
  const xp = xpTotal(progress)
  const met = goalMetToday(progress)
  return (
    <header className="st-bar" ref={barRef}>
      <div className="st-bar-in">
        <p className="st-xp">
          <BoltIcon width="26" height="26" />
          <b>{xp}</b> <small>XP</small>
        </p>
        {!finished && (
          <p className="st-goal" data-met={met || undefined}>
            <GoalRing met={met} />
            <span>{met ? WORDS.goalMet : WORDS.goal}</span>
          </p>
        )}
      </div>
      <HomeworkRow progress={progress} openId={openId} />
    </header>
  )
}

function homeworkState(progress: Progress, openId: string | null, id: string): HomeworkState {
  if (openId === id) return 'open'
  return isFinished(progress, id) ? 'done' : 'new'
}

/**
 * Her homework, off the path: open from the start, in the sticky bar so it
 * shows wherever the path is scrolled. Opening it while a path problem is open
 * starts that problem over next time, as opening any other problem does.
 */
function HomeworkRow({ progress, openId }: { progress: Progress; openId: string | null }) {
  if (!HOMEWORK.length) return null
  return (
    <ul className="st-hw">
      {HOMEWORK.map(({ title, problem }) => {
        const state = homeworkState(progress, openId, problem.id)
        return (
          <li key={problem.id}>
            <a className="st-hw-link" href={`#/problem/${problem.id}`} onClick={openProblem} aria-label={homeworkLabel(title, state)} data-state={state}>
              {state === 'done' ? <CheckIcon width="22" height="22" /> : <NotebookIcon width="22" height="22" />}
              <span className="st-hw-text">
                <small>{WORDS.homework}</small>
                {title}
              </span>
              <span className="st-hw-go" aria-hidden="true">
                {HOMEWORK_GO[state]}
              </span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}

function PathScreen({ progress }: { progress: Progress }) {
  const path = pathOf(progress, SLOTS)
  const session = loadSession()
  const stageSwitch = loadStageSwitch()
  const nextRef = useRef<HTMLLIElement>(null)
  const barRef = useRef<HTMLElement>(null)
  const [blocked, setBlocked] = useState<string | null>(null)

  // Bring the next node into view on a long path, a frame after App's own scroll to the top.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const node = nextRef.current
      if (!node) return
      const { top, bottom } = node.getBoundingClientRect()
      // Below the sticky bar, which is taller with homework in it.
      const barBottom = barRef.current?.getBoundingClientRect().bottom ?? 0
      if (top < barBottom + 16 || bottom > window.innerHeight - 40) node.scrollIntoView({ block: 'center' })
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!blocked) return
    const timer = window.setTimeout(() => setBlocked(null), BLOCK_NOTE_MS)
    return () => window.clearTimeout(timer)
  }, [blocked])

  const openId = session?.problemId ?? null
  // The next problem is open: keep it, rather than start another over it.
  const nextOpen = !!path.next && openId === path.next.id
  const nextNumber = path.levels.flatMap((l) => l.items).find((i) => i.state === 'next')?.number ?? 0
  const current = path.levels.find((l) => l.state === 'current')

  return (
    <div className="st-home">
      <GameBar progress={progress} finished={path.finished} openId={openId} barRef={barRef} />
      {stageSwitch && (
        <p className="st-switch">Увімкнено перемикач етапів для перевірки: етап {STAGES[stageSwitch.stage].label}. Вимкніть його під «Для батьків».</p>
      )}
      <div className="st-home-in">
        <main className="st-path-col">
          {path.levels.map((level) => (
            <LevelPart
              key={level.level}
              level={level}
              isOpen={(item) => item.id === openId && (nextOpen ? item.state === 'next' : !item.repeat)}
              nextRef={nextRef}
              blocked={blocked}
              onBlocked={nextOpen ? (key) => setBlocked(key) : null}
              blockNote={finishOpenFirst(nextNumber)}
            />
          ))}
          <div className="st-finish" data-done={path.finished || undefined}>
            <span className="st-node-btn" role="img" aria-label={path.finished ? WORDS.setDone : 'Фініш'}>
              <TrophyIcon width="34" height="34" />
            </span>
          </div>
        </main>
        <aside className="st-side">
          <SideCard path={path} current={current} />
        </aside>
      </div>
      <footer className="st-footer">
        <a className="st-parent-link" href="#/parent">
          {WORDS.forParent}
        </a>
      </footer>
    </div>
  )
}

/** On wide screens: where she is in the current level. */
function SideCard({ path, current }: { path: Path; current: PathLevel | undefined }) {
  if (path.finished || !current) {
    return (
      <section className="st-side-card">
        <h2 className="st-side-title">{path.finished ? WORDS.setDone : WORDS.path}</h2>
        <p className="st-side-p">{path.finished ? WORDS.setFree : `${pathCount(path.done, path.total)} задач.`}</p>
      </section>
    )
  }
  return (
    <section className={`st-side-card st-lv-${current.level}`}>
      <h2 className="st-side-title">{levelTitle(current.level)}</h2>
      <span className="st-bar-track" aria-hidden="true">
        <i style={{ width: `${(current.problemsDone / current.problems) * 100}%` }} />
      </span>
      <p className="st-side-p">
        {current.problemsDone} з {current.problems} задач. Усього {pathCount(path.done, path.total)}.
      </p>
    </section>
  )
}

type LevelPartProps = {
  level: PathLevel
  isOpen: (item: PathItem) => boolean
  nextRef: RefObject<HTMLLIElement | null>
  blocked: string | null
  onBlocked: ((key: string) => void) | null
  blockNote: string
}

function LevelPart({ level, isOpen, nextRef, blocked, onBlocked, blockNote }: LevelPartProps) {
  const titleId = `st-level-${level.level}`
  return (
    <section className={`st-unit st-lv-${level.level}`} data-state={level.state} aria-labelledby={titleId}>
      <div className="st-banner">
        <div>
          <h2 className="st-banner-title" id={titleId}>
            {levelTitle(level.level)}
          </h2>
          {level.notebook && (
            <p className="st-nb-chip">
              <NotebookIcon width="18" height="18" />
              {WORDS.notebookLevel}
            </p>
          )}
        </div>
        <span className="st-banner-badge">
          {level.state === 'done' && (
            <>
              <CheckIcon width="22" height="22" />
              {WORDS.levelDone}
            </>
          )}
          {level.state === 'current' && pathCount(level.problemsDone, level.problems)}
          {level.state === 'locked' && (
            <>
              <LockIcon width="22" height="22" />
              <span className="st-sr">ще закритий</span>
            </>
          )}
        </span>
      </div>
      <ol className="st-path">
        {level.items.map((item, i) => {
          const key = `${item.repeat ? 'r' : 'p'}-${item.id}`
          return (
            <Node
              key={key}
              item={item}
              offset={OFFSETS[i % OFFSETS.length]}
              open={isOpen(item)}
              liRef={item.state === 'next' ? nextRef : undefined}
              note={blocked === key ? blockNote : null}
              onBlocked={onBlocked && item.state === 'done' && !isOpen(item) ? () => onBlocked(key) : null}
            />
          )
        })}
      </ol>
    </section>
  )
}

type NodeProps = {
  item: PathItem
  offset: number
  open: boolean
  liRef?: RefObject<HTMLLIElement | null>
  /** A short note over the node: the next problem is open, so this one waits. */
  note: string | null
  onBlocked: (() => void) | null
}

function Node({ item, offset, open, liRef, note, onBlocked }: NodeProps) {
  const label = nodeLabel(item.number, item.repeat, item.state, open)
  const icon = item.repeat ? <AgainIcon width="34" height="34" /> : item.state === 'done' ? <CheckIcon width="34" height="34" /> : item.state === 'next' ? <StarIcon width="34" height="34" /> : <LockIcon width="30" height="30" />
  const href = `#/problem/${item.id}`
  const caption = item.repeat && <span className="st-node-cap">{repeatTitle(item.number)}</span>

  if (item.state === 'next') {
    return (
      <li className="st-node st-node--next" data-notebook={item.notebook || undefined} data-repeat={item.repeat || undefined} style={{ '--o': offset } as CSSProperties} ref={liRef}>
        <a className="st-node-link" href={href} onClick={openProblem} aria-label={label}>
          <span className="st-bubble" aria-hidden="true">
            {open ? WORDS.resume : WORDS.start}
          </span>
          <span className="st-node-btn">{icon}</span>
        </a>
        <span className="st-node-bird" data-side={offset > 0 ? 'left' : 'right'} aria-hidden="true">
          <Bird />
        </span>
        {caption}
        {item.notebook && (
          <span className="st-nb-chip st-node-nb">
            <NotebookIcon width="18" height="18" />
            {WORDS.notebookNext}
          </span>
        )}
      </li>
    )
  }

  return (
    <li className="st-node" data-state={item.state} data-repeat={item.repeat || undefined} style={{ '--o': offset } as CSSProperties}>
      {item.state === 'locked' ? (
        <span className="st-node-btn" role="img" aria-label={label}>
          {icon}
        </span>
      ) : onBlocked ? (
        <button type="button" className="st-node-btn" aria-label={label} onClick={onBlocked}>
          {icon}
        </button>
      ) : (
        <a className="st-node-btn" href={href} onClick={openProblem} aria-label={label}>
          {icon}
        </a>
      )}
      {open && (
        <span className="st-bubble st-bubble--small" aria-hidden="true">
          {WORDS.resume}
        </span>
      )}
      {note && (
        <span className="st-note" role="status">
          {note}
        </span>
      )}
      {caption}
    </li>
  )
}

/**
 * After a level's last problem or repeat: confetti, the bird, «Рівень N
 * пройдено!» and what the level held. After the last level, the set end in its
 * place. «Далі» goes home, where the level's banner reads «Пройдено».
 */
function CelebrationScreen({ due, progress, onDone }: { due: Celebration; progress: Progress; onDone: () => void }) {
  const set = due.kind === 'set'
  const level = due.kind === 'level' ? due.level : levels(SLOTS).at(-1)!
  const held = levelHeld(levelSummary(progress, SLOTS, level))
  const items = pathOf(progress, SLOTS).levels.find((l) => l.level === level)?.items ?? []
  return (
    <div className={`st-celebrate st-lv-${level}`}>
      <main className="st-celebrate-in">
        <div className="st-burst st-burst--big">
          <Confetti size="big" />
          <Bird className="st-bird st-bird--hop st-bird--big" />
        </div>
        <h1 className="st-speech st-speech--big">
          {set ? (
            <>
              {WORDS.setDone} {WORDS.setFree}
            </>
          ) : (
            levelDoneTitle(level)
          )}
        </h1>
        <p className="st-held">{set ? levelHeldLine(level, held) : held}</p>
        <ol className="st-mini" aria-hidden="true">
          {items.map((item, i) => (
            <li key={`${item.repeat ? 'r' : 'p'}-${item.id}`} style={{ '--i': i } as CSSProperties}>
              {item.repeat ? <AgainIcon width="18" height="18" /> : <CheckIcon width="18" height="18" />}
            </li>
          ))}
        </ol>
      </main>
      <Dock feedback={{ tone: 'none', message: '' }} label={WORDS.next} onMain={onDone} quiet />
    </div>
  )
}
