/**
 * One homework problem from a photo, end to end: bring the bot's clone up to
 * date, let Claude Code write the problem's file (`add-homework.md` says how),
 * check that it touched nothing else and that the tests, types, lint and build
 * pass, then commit, push and deploy.
 *
 * Claude Code gets the file tools and the three check commands only, and its
 * environment holds no Netlify or GitHub credentials: the bot itself commits,
 * pushes and deploys.
 */
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homeworkId, homeworkTitle } from './caption.ts'

const GUIDE = join(dirname(fileURLToPath(import.meta.url)), 'add-homework.md')
const HOMEWORK_DIR = 'poc/src/problems/homework'
const CLAUDE_TIMEOUT_MS = 40 * 60 * 1000
const STEP_TIMEOUT_MS = 10 * 60 * 1000
const CLAUDE_TOOLS = ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'Bash(npm --prefix poc test:*)', 'Bash(npm --prefix poc run typecheck:*)', 'Bash(npm --prefix poc run lint:*)']

/** A step that failed: `log` holds the end of its output for the parent. */
export class StepError extends Error {
  log: string

  constructor(message: string, log = '') {
    super(message)
    this.log = log
  }
}

type RunOptions = { cwd: string; env?: NodeJS.ProcessEnv; input?: string; timeout?: number }

/** Runs a command; resolves with its output, or rejects with a StepError holding the end of it. */
function run(command: string, args: string[], { cwd, env = process.env, input, timeout = STEP_TIMEOUT_MS }: RunOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: ['pipe', 'pipe', 'pipe'] })
    let out = ''
    child.stdout.on('data', (chunk) => (out += chunk))
    child.stderr.on('data', (chunk) => (out += chunk))
    const timer = setTimeout(() => child.kill('SIGTERM'), timeout)
    child.on('error', (error) => {
      clearTimeout(timer)
      reject(new StepError(`${command} didn't start: ${error.message}`))
    })
    child.on('close', (code, signal) => {
      clearTimeout(timer)
      if (code === 0) resolve(out)
      else reject(new StepError(`${command} ${args.join(' ').slice(0, 80)} ${signal ? `was stopped (${signal})` : `exited with ${code}`}`, out.slice(-3000)))
    })
    child.stdin.end(input ?? '')
  })
}

const git = (repo: string, ...args: string[]) => run('git', args, { cwd: repo })

/** Leaves the clone with no uncommitted changes, so a failed job can't leak into the next one. */
async function discardChanges(repo: string): Promise<void> {
  await git(repo, 'reset', '--hard', 'HEAD')
  await git(repo, 'clean', '-fd')
}

async function isClean(repo: string): Promise<boolean> {
  return (await git(repo, 'status', '--porcelain')).trim() === ''
}

/** Gets the bot's clone up to date with GitHub, keeping any commit that didn't get pushed last time. */
async function sync(repo: string): Promise<void> {
  await discardChanges(repo)
  await git(repo, 'fetch', 'origin', 'main')
  await git(repo, 'rebase', 'origin/main').catch(async (error: unknown) => {
    await git(repo, 'rebase', '--abort').catch(() => {})
    throw error
  })
}

/** Pushes the clone's commits to `main`. If someone pushed in between, puts them on top of theirs and tries once more. */
async function pushToMain(repo: string): Promise<boolean> {
  try {
    await git(repo, 'push', 'origin', 'HEAD:main')
    return true
  } catch {
    // behind GitHub: rebase and retry below
  }
  try {
    await git(repo, 'pull', '--rebase', 'origin', 'main')
    await git(repo, 'push', 'origin', 'HEAD:main')
    return true
  } catch {
    await git(repo, 'rebase', '--abort').catch(() => {})
    return false
  }
}

/** Installs the app's packages when its lock file changed since the last install. */
async function install(repo: string): Promise<void> {
  const lock = await readFile(join(repo, 'poc/package-lock.json'))
  const hash = createHash('sha256').update(lock).digest('hex')
  const marker = join(repo, 'poc/node_modules/.homework-bot-lock')
  if (existsSync(marker) && (await readFile(marker, 'utf8')) === hash) return
  await run('npm', ['ci', '--no-audit', '--no-fund'], { cwd: join(repo, 'poc') })
  await writeFile(marker, hash)
}

/** The status line `add-homework.md` asks Claude Code to end with. */
type Status = { status: 'added'; summary?: string } | { status: 'failed'; reason?: string }

/** The last line of Claude's answer that is the guide's JSON status line. */
function statusLine(text: string): Status | null {
  for (const line of text.trim().split('\n').reverse()) {
    const trimmed = line.trim().replace(/^`+|`+$/g, '')
    if (!trimmed.startsWith('{')) continue
    try {
      const parsed = JSON.parse(trimmed) as Partial<Status>
      if (parsed.status === 'added' || parsed.status === 'failed') return parsed as Status
    } catch {
      // not the status line
    }
  }
  return null
}

/** Only what Claude Code needs: its token, a home and a path. No Netlify or GitHub credentials. */
function claudeEnv(): NodeJS.ProcessEnv {
  const keep = ['PATH', 'HOME', 'USER', 'LANG', 'TZ', 'TMPDIR', 'CLAUDE_CODE_OAUTH_TOKEN']
  return Object.fromEntries(keep.filter((key) => process.env[key]).map((key) => [key, process.env[key]]))
}

export type JobOptions = {
  /** The clone to work in. */
  repo: string
  /** The photo, alone in its folder: the only folder outside the repo Claude Code may read. */
  photo: string
  /** The problem number she gave, such as `6.2`. */
  number: string
  /** The day she sent it, `2026-10-06`. */
  day: string
  /** Where Claude Code's whole answer is kept, one file per problem. */
  logDir?: string
  model?: string
  /** Off for a local try (`add.ts`), which needs a clone with nothing uncommitted. */
  sync?: boolean
  /** Off for a dry run: the checks run, the file stays uncommitted, and the next sync discards it. */
  commit?: boolean
  push?: boolean
  deploy?: boolean
  log?: (line: string) => void
}

export type JobResult =
  | {
      status: 'added'
      id: string
      title: string
      summary: string
      /** Null when committing was off: then nothing was pushed or deployed either. */
      commit: string | null
      /** Null when pushing was off. */
      pushed: boolean | null
      deployed: boolean
    }
  /** The photo or the problem: hers to retry, with `reason` saying why. */
  | { status: 'failed'; reason: string }

/** Adds problem `number` from `photo`. Rejects with a StepError when something other than the photo broke. */
export async function addHomework({ repo, photo, number, day, logDir, model, sync: syncFirst = true, commit: save = true, push = true, deploy = true, log = console.log }: JobOptions): Promise<JobResult> {
  if (syncFirst) {
    log('Syncing the clone with GitHub')
    await sync(repo)
  } else if (!(await isClean(repo))) {
    // A local try never resets work that isn't committed.
    throw new StepError(`${repo} has uncommitted changes: commit or stash them first`)
  }
  await install(repo)

  const taken = new Set((await readdir(join(repo, HOMEWORK_DIR))).map((file) => file.replace(/\.ts$/, '')))
  const id = homeworkId(day, number, taken)
  const title = homeworkTitle(number)
  const file = `${HOMEWORK_DIR}/${id}.ts`
  const prompt = `${await readFile(GUIDE, 'utf8')}

## This photo

- Photo: \`${photo}\`
- Problem number: ${number}
- File to write: \`${file}\`
- \`id\`: \`'${id}'\`, \`title\`: \`'${title.replace('\u00a0', '\\u00a0')}'\`, \`added\`: \`'${day}'\`
`

  let summary: string
  try {
    const status = await writeProblem({ repo, photo, prompt, id, logDir, model, log })
    if (status.status === 'failed') {
      await discardChanges(repo)
      return { status: 'failed', reason: status.reason ?? '' }
    }
    summary = status.summary ?? ''
    const changes = (await git(repo, 'status', '--porcelain', '-uall')).split('\n').filter(Boolean)
    if (changes.length !== 1 || changes[0] !== `?? ${file}`) throw new StepError('Claude Code changed more than its file', changes.join('\n'))
    log('Checking the tests, types, lint and build')
    await run('npm', ['--prefix', 'poc', 'test'], { cwd: repo })
    await run('npm', ['--prefix', 'poc', 'run', 'lint'], { cwd: repo })
    await run('npm', ['--prefix', 'poc', 'run', 'build'], { cwd: repo })
    if (!save) return { status: 'added', id, title, summary, commit: null, pushed: null, deployed: false }
    await git(repo, 'add', '--', file)
    await git(repo, 'commit', '-m', `Add homework ${number} (${id})`, '-m', summary)
  } catch (error) {
    await discardChanges(repo)
    throw error
  }
  const commit = (await git(repo, 'rev-parse', '--short', 'HEAD')).trim()

  let pushed: boolean | null = null
  if (push) {
    log('Pushing to GitHub')
    pushed = await pushToMain(repo)
  }
  if (deploy) {
    log('Deploying to Netlify')
    await run('npm', ['--prefix', 'poc', 'run', 'deploy'], { cwd: repo, env: { ...process.env, npm_config_yes: 'true' } })
  }
  return { status: 'added', id, title, summary, commit, pushed, deployed: deploy }
}

type WriteOptions = { repo: string; photo: string; prompt: string; id: string; logDir?: string; model?: string; log: (line: string) => void }

/** Lets Claude Code write the problem's file, and reads its status line. Its whole answer is kept in `logDir`. */
async function writeProblem({ repo, photo, prompt, id, logDir, model, log }: WriteOptions): Promise<Status> {
  log(`Running Claude Code for ${id}`)
  const args = ['-p', '--output-format', 'json', '--permission-mode', 'acceptEdits', '--add-dir', dirname(photo), ...(model ? ['--model', model] : []), '--allowedTools', ...CLAUDE_TOOLS]
  let output = ''
  try {
    output = await run('claude', args, { cwd: repo, env: claudeEnv(), input: prompt, timeout: CLAUDE_TIMEOUT_MS })
  } catch (error) {
    if (error instanceof StepError) output = error.log
    throw error
  } finally {
    if (logDir) {
      await mkdir(logDir, { recursive: true })
      await writeFile(join(logDir, `${id}.json`), output).catch(() => {})
    }
  }
  // One result object, or (in some versions) every message, the result last.
  type Result = { type?: string; result?: string; is_error?: boolean }
  let result: Result | undefined
  try {
    const parsed = JSON.parse(output) as Result | Result[]
    result = Array.isArray(parsed) ? parsed.findLast((message) => message.type === 'result') : parsed
  } catch {
    // handled below
  }
  if (!result) throw new StepError('Claude Code gave no JSON result', output.slice(-3000))
  const answer = String(result.result ?? '')
  if (result.is_error) throw new StepError('Claude Code stopped with an error', answer.slice(-3000))
  const status = statusLine(answer)
  if (!status) throw new StepError('Claude Code ended without a status line', answer.slice(-3000))
  return status
}
