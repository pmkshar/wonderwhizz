import ZAI from 'z-ai-web-dev-sdk'

/**
 * Build a ZAI client directly from env vars, bypassing the SDK's
 * `.z-ai-config` file lookup (which doesn't work on Vercel because the
 * filesystem is read-only and `/etc/.z-ai-config` is not shipped with the
 * deployment).
 *
 * The SDK's default `ZAI.create()` reads from `.z-ai-config` files only —
 * this helper constructs the client via `new ZAI(config)` with the same
 * shape of config object the SDK expects.
 */
interface ZaiConfig {
  baseUrl: string
  apiKey: string
  token?: string
  chatId?: string
  userId?: string
}

let cachedClient: ZAI | null = null

export function getZaiClient(): ZAI {
  if (cachedClient) return cachedClient

  const baseUrl = process.env.ZAI_BASE_URL?.trim()
  const apiKey = process.env.ZAI_API_KEY?.trim()
  const token = process.env.ZAI_TOKEN?.trim()
  const chatId = process.env.ZAI_CHAT_ID?.trim()
  const userId = process.env.ZAI_USER_ID?.trim()

  if (!baseUrl || !apiKey) {
    // Fall back to the SDK's built-in file lookup (works on local dev where
    // /etc/.z-ai-config exists).
    // We do this by calling ZAI.create() lazily — but since getZaiClient is
    // sync, we throw an error instructing the caller to use createZaiAsync
    // for the file-lookup path.
    throw new Error(
      'ZAI_BASE_URL and ZAI_API_KEY env vars are not set, and no .z-ai-config fallback was configured.'
    )
  }

  const config: ZaiConfig = { baseUrl, apiKey }
  if (token) config.token = token
  if (chatId) config.chatId = chatId
  if (userId) config.userId = userId

  cachedClient = new ZAI(config)
  return cachedClient
}

/**
 * Async version that falls back to ZAI.create() (file-based config lookup)
 * when env vars aren't set. Use this from API routes.
 */
export async function createZaiClient(): Promise<ZAI> {
  if (cachedClient) return cachedClient

  const baseUrl = process.env.ZAI_BASE_URL?.trim()
  const apiKey = process.env.ZAI_API_KEY?.trim()

  if (!baseUrl || !apiKey) {
    // Fall back to file-based config (works on local dev where
    // /etc/.z-ai-config exists).
    cachedClient = await ZAI.create()
    return cachedClient
  }

  return getZaiClient()
}
