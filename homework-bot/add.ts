#!/usr/bin/env node
/**
 * Adds a homework problem from a photo without Telegram, for a try on any
 * machine with Claude Code logged in:
 *
 *   node homework-bot/add.ts <photo> <number> [--repo <clone>] [--push] [--deploy]
 *
 * By default it only commits to the clone (the repo this script is in, unless
 * `--repo` says otherwise), which must have no uncommitted changes. `--push`
 * and `--deploy` do what the bot does after.
 */
import { copyFile, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { localDay, problemNumbers } from './caption.ts'
import { StepError, addHomework } from './job.ts'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { repo: { type: 'string' }, push: { type: 'boolean' }, deploy: { type: 'boolean' }, model: { type: 'string' } },
})
const [photoArg, numberArg] = positionals
const [number] = problemNumbers(numberArg)
if (!photoArg || !number) {
  console.error('Usage: node homework-bot/add.ts <photo> <number> [--repo <clone>] [--push] [--deploy]')
  process.exit(2)
}

// The photo goes into a folder of its own, the only one outside the repo that Claude Code may read.
const inbox = await mkdtemp(join(tmpdir(), 'homework-'))
const photo = join(inbox, basename(photoArg))
await copyFile(resolve(photoArg), photo)

const repo = resolve(values.repo ?? join(dirname(fileURLToPath(import.meta.url)), '..'))
try {
  const result = await addHomework({
    repo,
    photo,
    number,
    day: localDay(new Date()),
    logDir: join(inbox, 'logs'),
    model: values.model,
    sync: false,
    push: !!values.push,
    deploy: !!values.deploy,
  })
  console.log(JSON.stringify(result, null, 2))
  console.log(`Claude Code's answer: ${join(inbox, 'logs')}`)
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  if (error instanceof StepError && error.log) console.error(error.log)
  process.exit(1)
}
