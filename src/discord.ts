import { getEnvVar } from "./utils.js"

export async function postToDiscord(message: string): Promise<void> {
  const webhookUrl = getEnvVar("DISCORD_WEBHOOK_URL")

  const content = message.length > 1950 ? message.slice(0, 1947) + "..." : message

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content })
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Discord webhook failed (${response.status}): ${body}`)
  }
}
