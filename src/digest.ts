import { GoogleGenAI } from "@google/genai"
import { getEnvVar } from "./utils.ts"

const SYSTEM_PROMPT = `You are a technical writer posting daily Claude Code release summaries to a developer Discord server.

Format should be:
    🚀 **Claude Code Daily Release Summary** 🚀

    Latest version: \`x.y.z\`
    Published on: DD-MM-YYYY

    **New Features:**
    - Short description of feature 1
    - Short description of feature 2
    ...

When summarizing releases:
- Use Discord markdown: **bold**, \`backticks\` for commands/flags, - for bullets
- Keep each feature short, ideally no more than 10 words
- Post only new features, skip improvements, bug fixes or internal/tooling-only changes irrelevant to end users
- Do NOT wrap output in a code block`

interface GitHubRelease {
  tagName: string
  body: string
  publishedAt: string
}

async function fetchLatestRelease(): Promise<GitHubRelease> {
  const response = await fetch("https://api.github.com/repos/anthropics/claude-code/releases/latest", {
    headers: { Accept: "application/vnd.github+json" }
  })

  if (!response.ok) {
    throw new Error(`GitHub API request failed (${response.status})`)
  }

  const data = await response.json()
  const { tag_name: tagName, body, published_at: publishedAt } = data
  return { tagName, body, publishedAt }
}

function isFromYesterday(publishedAt: string): boolean {
  const releaseDate = new Date(publishedAt).toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
  return releaseDate === yesterday
}

export async function summarizeClaudeCodeLatestFeatures(): Promise<string | null> {
  const { tagName, body, publishedAt } = await fetchLatestRelease()

  if (!isFromYesterday(publishedAt)) {
    console.log(`Latest release ${tagName} published on ${publishedAt} is not from yesterday, skipping.`)
    return null
  }

  const apiKey = getEnvVar("GEMINI_API_KEY")
  const ai = new GoogleGenAI({ apiKey })

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Here are the release notes for Claude Code ${tagName} published on ${publishedAt}:
    
    ${body}
    Write a Discord message summarizing what's new for developers.`,
    config: {
      systemInstruction: SYSTEM_PROMPT
    }
  })

  const text = response.text?.trim()

  if (!text) {
    throw new Error("Gemini returned no text content")
  }

  return text
}
