import { GoogleGenAI } from "@google/genai"
import { getEnvVar } from "./utils.js"

const SYSTEM_PROMPT = `You are a technical writer posting daily Claude Code release summaries to a developer Discord server.

Format should be:
    🚀 **Claude Code Daily Release Summary** 🚀

    Latest version: \`x.y.z\`

    **New Features:**
    - Short description of feature 1
    - Short description of feature 2
    ...

When summarizing releases:
- Use Discord markdown: **bold**, \`backticks\` for commands/flags, - for bullets
- Keep each feature short, ideally no more than 10 words
- Post only the most important new features (5 max), skip improvements, bug fixes or internal/tooling-only changes irrelevant to end users
- Do NOT wrap output in a code block
- Only cover the single latest release — do not combine or reference older versions
- If you cannot access the releases page or find no releases, respond with exactly: NO_RELEASES`

export async function summarizeClaudeCodeReleases(): Promise<string | null> {
  const apiKey = getEnvVar("GEMINI_API_KEY")
  const ai = new GoogleGenAI({ apiKey })

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Go to https://github.com/anthropics/claude-code/releases and find the single latest release at the top of the page. Extract only the features listed in that release. Do not combine multiple releases. Write a Discord message summarizing what's new for developers.`,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ googleSearch: {} }]
    }
  })

  const text = response.text?.trim()

  if (!text) {
    throw new Error("Gemini returned no text content")
  }

  return text === "NO_RELEASES" ? null : text
}
