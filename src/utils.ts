export const getEnvVar = (key: string): string => {
  const value = Deno.env.get(key)
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`)
  }
  return value
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  { maxAttempts = 10, delayMs = 30_000 }: { maxAttempts?: number; delayMs?: number } = {}
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      const isUnavailable = message.includes("503") || message.includes("UNAVAILABLE")
      if (!isUnavailable || attempt === maxAttempts) throw err
      console.log(`Gemini API unavailable (attempt ${attempt}/${maxAttempts}), retrying in ${delayMs / 1000}s...`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
  throw new Error("unreachable")
}
