import { assertRejects } from "asserts"
import { stub } from "mock"
import { summarizeClaudeCodeLatestFeatures } from "./digest.ts"

Deno.test("summarizeClaudeCodeLatestFeatures throws when GitHub API fails", async () => {
  Deno.env.set("GEMINI_API_KEY", "test-key")

  const fetchStub = stub(globalThis, "fetch", () => {
    return Promise.resolve(new Response("Not Found", { status: 404 }))
  })

  try {
    await assertRejects(() => summarizeClaudeCodeLatestFeatures(), Error, "GitHub API request failed (404)")
  } finally {
    fetchStub.restore()
    Deno.env.delete("GEMINI_API_KEY")
  }
})
