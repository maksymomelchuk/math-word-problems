#!/usr/bin/env node
/**
 * The homework bot. She sends a photo of a word problem to Telegram with its
 * number in the caption; a few minutes later the problem is in her app, under
 * «Домашнє завдання», with every step of the routine on screen. One problem at
 * a time, in the order sent: `job.ts` does the work. The queue and Telegram's
 * offset are saved, so a restart picks up where it was.
 *
 * Settings come from the environment (`env.example` lists them).
 */
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { localDay, problemNumbers } from './caption.ts'
import { StepError, addHomework, type JobResult } from './job.ts'
import { telegram, type Message } from './telegram.ts'

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    console.error(`${name} is not set: see homework-bot/env.example`)
    process.exit(2)
  }
  return value
}

const config = {
  token: required('TELEGRAM_BOT_TOKEN'),
  allowed: new Set((process.env.ALLOWED_USER_IDS ?? '').split(',').map((id) => id.trim()).filter(Boolean)),
  parentChat: process.env.PARENT_CHAT_ID?.trim() || null,
  repo: resolve(process.env.REPO_DIR ?? join(dirname(fileURLToPath(import.meta.url)), '..')),
  data: resolve(process.env.DATA_DIR ?? join(homedir(), '.homework-bot')),
  model: process.env.CLAUDE_MODEL || undefined,
  /** Writes and checks each problem, but saves and publishes nothing: for a first try. */
  dryRun: process.env.DRY_RUN === '1',
  telegramApi: process.env.TELEGRAM_API_URL || undefined,
}
const STATE = join(config.data, 'state.json')

/** One problem to add: from a photo, by its number. */
type Job = { chatId: number; photo: string; number: string; day: string }

/** Saved after every change, so a restart picks up where it was. */
type State = {
  /** Telegram's offset: the next update to read. */
  offset: number
  queue: Job[]
  /** A photo sent without a number, by chat, until she says which problem. */
  pending: Record<string, { photo: string; day: string }>
}
/** Telegram's limit for one message. */
const MAX_MESSAGE = 4000

/** What the bot says, to her and to the parent. To her: no past-tense «я», which would need a gender. */
const WORDS = {
  help: 'Надішли фото задачі з підписом — її номером, наприклад 6.2. Я додам її в застосунок, у рядок «Домашнє завдання».',
  whichProblem: 'Яку задачу з фото додати? Напиши її номер, наприклад 6.2.',
  sendAsPhoto: 'Такий файл не вийде прочитати. Надішли, будь ласка, звичайне фото.',
  received: (numbers: string[], busy: boolean) =>
    `Фото отримано: ${numbers.length > 1 ? `задачі ${numbers.join(', ')}` : `задача ${numbers[0]}`}. ${busy ? 'Спершу закінчу попередню, потім візьмуся за цю.' : 'Готую в застосунку, це займе кілька хвилин.'}`,
  added: (number: string) => `Готово! Задача ${number} уже в застосунку. Відкрий його з іконки: задача вгорі, у рядку «Домашнє завдання».`,
  dryRun: (number: string) => `Задачу ${number} розібрано, але це пробний запуск: у застосунку її поки не буде.`,
  failed: (number: string, reason: string) => `Не вийшло додати задачу ${number}. ${reason}`,
  broke: (number: string) => `Не вийшло додати задачу ${number}: щось зламалося.${config.parentChat ? ' Батькам уже надіслано повідомлення.' : ''}`,
  parentAdded: (number: string, r: Extract<JobResult, { status: 'added' }>) => {
    if (r.commit === null) return `Пробний запуск: задача ${number} (${r.id}) пройшла всі перевірки, але її не збережено і не опубліковано. ${r.summary}`
    const where = r.pushed === false ? ' — не вдалося надіслати на GitHub, він лише на сервері' : ''
    return `Додано задачу ${number} (${r.id}): ${r.summary}\nКоміт ${r.commit}${where}.`
  },
  parentFailed: (number: string, reason: string) => `Задачу ${number} не додано: ${reason}`,
  parentBroke: (number: string, error: unknown) => `Задачу ${number} не додано через помилку: ${errorText(error)}`,
}

/** An error as the parent reads it: its message, and the end of the step's output. */
function errorText(error: unknown): string {
  if (error instanceof StepError) return error.log ? `${error.message}\n\n${error.log}` : error.message
  return error instanceof Error ? error.message : String(error)
}

const tg = telegram(config.token, config.telegramApi)

async function loadState(): Promise<State> {
  try {
    return JSON.parse(await readFile(STATE, 'utf8')) as State
  } catch {
    return { offset: 0, queue: [], pending: {} }
  }
}

const state = await loadState()

async function save(): Promise<void> {
  await writeFile(`${STATE}.tmp`, JSON.stringify(state, null, 2))
  await rename(`${STATE}.tmp`, STATE)
}

async function say(chatId: number | string, text: string): Promise<void> {
  await tg.send(chatId, text.slice(0, MAX_MESSAGE)).catch((error: unknown) => console.error(`Sending to ${chatId} failed: ${errorText(error)}`))
}

/** Her message goes to her; the details go to the parent. When the parent sent the photo, only the details. */
async function report(chatId: number, toHer: string, toParent: string): Promise<void> {
  if (config.parentChat && String(chatId) === config.parentChat) return say(chatId, toParent)
  await say(chatId, toHer)
  if (config.parentChat) await say(config.parentChat, toParent)
}

async function runJob({ chatId, photo, number, day }: Job): Promise<void> {
  const log = (line: string) => console.log(`[${number}] ${line}`)
  try {
    const publish = !config.dryRun
    const result = await addHomework({ repo: config.repo, photo, number, day, logDir: join(config.data, 'logs'), model: config.model, commit: publish, push: publish, deploy: publish, log })
    if (result.status === 'added') await report(chatId, result.commit === null ? WORDS.dryRun(number) : WORDS.added(number), WORDS.parentAdded(number, result))
    else await report(chatId, WORDS.failed(number, result.reason), WORDS.parentFailed(number, result.reason))
    log(result.status)
  } catch (error) {
    console.error(`[${number}] ${errorText(error)}`)
    await report(chatId, WORDS.broke(number), WORDS.parentBroke(number, error))
  }
}

let working = false

/** Works through the queue, one problem at a time. A job stays queued until it is done, so a restart redoes it. */
async function work(): Promise<void> {
  if (working) return
  working = true
  try {
    while (state.queue.length) {
      await runJob(state.queue[0])
      state.queue.shift()
      await save()
    }
  } finally {
    working = false
  }
}

async function enqueue(chatId: number, photo: string, day: string, numbers: string[]): Promise<void> {
  const busy = working || state.queue.length > 0
  for (const number of numbers) state.queue.push({ chatId, photo, number, day })
  await save()
  await say(chatId, WORDS.received(numbers, busy))
  void work()
}

/** The photo she sent, as the largest size Telegram has, or an image sent as a file. */
function imageOf(message: Message): { fileId: string; extension: string; unsupported?: boolean } | null {
  const largest = message.photo?.at(-1)
  if (largest) return { fileId: largest.file_id, extension: 'jpg' }
  const doc = message.document
  if (doc?.mime_type?.startsWith('image/')) return { fileId: doc.file_id, extension: doc.mime_type.slice(6), unsupported: !/^image\/(jpeg|png|webp)$/.test(doc.mime_type) }
  return null
}

async function handle(message: Message): Promise<void> {
  const sender = String(message.from?.id ?? '')
  if (!config.allowed.has(sender)) {
    console.log(`Ignored a message from Telegram user ${sender} (${message.from?.first_name ?? 'no name'})`)
    return
  }
  const chatId = message.chat.id
  const text = message.caption ?? message.text ?? ''
  if (/^\/(start|help)\b/.test(text)) return say(chatId, WORDS.help)

  const image = imageOf(message)
  if (image) {
    if (image.unsupported) return say(chatId, WORDS.sendAsPhoto)
    // Each photo in a folder of its own: the only folder outside the repo Claude Code may read.
    const folder = join(config.data, 'inbox', `${Date.now()}-${message.message_id}`)
    await mkdir(folder, { recursive: true })
    const photo = await tg.download(image.fileId, join(folder, `photo.${image.extension === 'jpeg' ? 'jpg' : image.extension}`))
    const day = localDay(new Date(message.date * 1000))
    const numbers = problemNumbers(message.caption)
    if (numbers.length) return enqueue(chatId, photo, day, numbers)
    state.pending[chatId] = { photo, day }
    await save()
    return say(chatId, WORDS.whichProblem)
  }

  const pending = state.pending[chatId]
  const numbers = problemNumbers(text)
  if (pending && numbers.length) {
    delete state.pending[chatId]
    return enqueue(chatId, pending.photo, pending.day, numbers)
  }
  return say(chatId, pending ? WORDS.whichProblem : WORDS.help)
}

await mkdir(config.data, { recursive: true })
console.log(`Homework bot: clone ${config.repo}, data ${config.data}, ${config.allowed.size} allowed sender(s), ${state.queue.length} queued${config.dryRun ? ', dry run (nothing saved or published)' : ''}`)
if (!config.allowed.size) console.log('ALLOWED_USER_IDS is empty: every message is ignored, and each sender’s Telegram ID is logged')
void work()

for (;;) {
  try {
    for (const update of await tg.updates(state.offset)) {
      state.offset = update.update_id + 1
      if (update.message) await handle(update.message).catch((error: unknown) => console.error(`Handling a message failed: ${errorText(error)}`))
      await save()
    }
  } catch (error) {
    console.error(`Polling Telegram failed: ${errorText(error)}`)
    await sleep(10_000)
  }
}
