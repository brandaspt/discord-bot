import { summarizeClaudeCodeReleases } from "./digest.js"
import { postToDiscord } from "./discord.js"

async function main(): Promise<void> {
  console.log(`Searching for Claude Code releases ...`)

  const message = await summarizeClaudeCodeReleases()

  await postToDiscord(message)
  console.log("Posted successfully.")
}

main().catch(err => {
  console.error("Fatal error:", err)
  process.exit(1)
})
