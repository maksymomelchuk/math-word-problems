/**
 * The few Telegram Bot API calls the bot needs. Long polling: the bot asks
 * Telegram for new messages, so the server needs no open port or domain.
 */
import { writeFile } from 'node:fs/promises'

/** The parts of a Telegram message the bot reads. */
export type Message = {
  message_id: number
  /** Unix time, in seconds. */
  date: number
  from?: { id: number; first_name?: string }
  chat: { id: number }
  text?: string
  caption?: string
  /** One photo in several sizes, the largest last. */
  photo?: { file_id: string }[]
  /** A file, such as a photo sent uncompressed. */
  document?: { file_id: string; mime_type?: string }
}

export type Update = { update_id: number; message?: Message }

export type Telegram = ReturnType<typeof telegram>

/** `base` is Telegram's API address, or a fake one's for a test. */
export function telegram(token: string, base = 'https://api.telegram.org') {
  async function call<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    const response = await fetch(`${base}/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(params),
    })
    const body = (await response.json()) as { ok: boolean; result: T; description?: string }
    if (!body.ok) throw new Error(`Telegram ${method}: ${body.description}`)
    return body.result
  }

  return {
    /** New messages after `offset`, waiting up to 50 s for one to arrive. */
    updates: (offset: number) => call<Update[]>('getUpdates', { offset, timeout: 50, allowed_updates: ['message'] }),
    send: (chatId: number | string, text: string) => call<unknown>('sendMessage', { chat_id: chatId, text, link_preview_options: { is_disabled: true } }),
    /** Saves a photo or file she sent to `path`. */
    async download(fileId: string, path: string): Promise<string> {
      const file = await call<{ file_path: string }>('getFile', { file_id: fileId })
      const response = await fetch(`${base}/file/bot${token}/${file.file_path}`)
      if (!response.ok) throw new Error(`Telegram file download: HTTP ${response.status}`)
      await writeFile(path, Buffer.from(await response.arrayBuffer()))
      return path
    },
  }
}
