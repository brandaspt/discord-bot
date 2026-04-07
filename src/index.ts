import { summarizeClaudeCodeLatestFeatures } from "./digest.ts"
import { postToDiscord } from "./discord.ts"

async function main(): Promise<void> {
  console.log(`Searching for Claude Code releases ...`)

  const message = await summarizeClaudeCodeLatestFeatures()

  if (message === null) {
    return
  }

  await postToDiscord(message)
  console.log("Posted successfully.")
}

main().catch(err => {
  console.error("Fatal error:", err)
  Deno.exit(1)
})
