import fs from 'fs/promises'
import path from 'path'
import os from 'os'

let initialized = false

/**
 * The z-ai-web-dev-sdk reads its config from `.z-ai-config` files (in CWD,
 * homedir, or /etc). It does NOT read env vars directly. On Vercel's
 * serverless environment there's no `.z-ai-config` file shipped with the
 * deployment and the filesystem is read-only except for `/tmp`.
 *
 * This helper writes a `.z-ai-config` file to the current working directory
 * (which on Vercel serverless is `/var/task/` and IS writable during cold
 * starts) using values from env vars. It's idempotent — once the file exists
 * with the right content, it skips the write.
 *
 * Must be called (and awaited) before any `ZAI.create()` invocation.
 */
export async function ensureZaiConfig(): Promise<void> {
  if (initialized) return

  const baseUrl = process.env.ZAI_BASE_URL?.trim()
  const apiKey = process.env.ZAI_API_KEY?.trim()
  const token = process.env.ZAI_TOKEN?.trim()
  const chatId = process.env.ZAI_CHAT_ID?.trim()
  const userId = process.env.ZAI_USER_ID?.trim()

  // If no env vars are set, assume a config file already exists somewhere
  // the SDK will find (e.g. /etc/.z-ai-config on this dev machine, or a
  // committed .z-ai-config in the repo).
  if (!baseUrl || !apiKey) {
    initialized = true
    return
  }

  const config: Record<string, string> = { baseUrl, apiKey }
  if (token) config.token = token
  if (chatId) config.chatId = chatId
  if (userId) config.userId = userId

  // Try writing to CWD first (works on Vercel serverless: /var/task is writable
  // during cold start). Fall back to /tmp which is always writable.
  const candidates = [
    path.join(process.cwd(), '.z-ai-config'),
    path.join(os.tmpdir(), '.z-ai-config'),
  ]

  for (const filePath of candidates) {
    try {
      await fs.writeFile(filePath, JSON.stringify(config), 'utf-8')
      initialized = true
      return
    } catch (e) {
      // Try next candidate
    }
  }

  // If we got here, neither location was writable. The SDK will likely fail
  // when it tries to find a config, but at least let it try.
  initialized = true
}
