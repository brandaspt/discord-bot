import { getEnvVar } from "./utils.ts"

export async function postToDiscord(message: string): Promise<void> {
  const webhookUrl = getEnvVar("DISCORD_WEBHOOK_URL")
  const threadId = Deno.env.get("DISCORD_THREAD_ID")
  if (threadId) {
    console.log(`Posting to Discord thread ${threadId}...`)
  } else {
    console.log("Posting to Discord channel...")
  }
  const url = threadId ? `${webhookUrl}?thread_id=${threadId}` : webhookUrl

  const content = message.length > 1950 ? message.slice(0, 1947) + "..." : message

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content })
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Discord webhook failed (${response.status}): ${body}`)
  }
}
