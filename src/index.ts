import { postToDiscord } from "./discord.js"
import { summarizeClaudeCodeReleases } from "./summarize.js"

async function main(): Promise<void> {
  console.log(`Searching for Claude Code releases ...`)

  const message = await summarizeClaudeCodeReleases()

  if (message === null) {
    console.log("No Claude Code releases yesterday. Skipping Discord post.")
    return
  }

  await postToDiscord(message)
  console.log("Posted successfully.")
}

main().catch(err => {
  console.error("Fatal error:", err)
  process.exit(1)
})
