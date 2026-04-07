import { assertEquals, assertRejects } from "jsr:@std/assert"
import { stub } from "jsr:@std/testing/mock"
import { summarizeClaudeCodeLatestFeatures } from "./digest.ts"

function makeRelease(daysAgo: number): string {
  const date = new Date(Date.now() - daysAgo * 86_400_000)
  return JSON.stringify({
    tag_name: "v1.0.0",
    body: "Some release notes",
    published_at: date.toISOString(),
  })
}

Deno.test("summarizeClaudeCodeLatestFeatures returns null when release is from today", async () => {
  Deno.env.set("GEMINI_API_KEY", "test-key")

  const fetchStub = stub(globalThis, "fetch", async () => {
    return new Response(makeRelease(0), { status: 200 })
  })

  try {
    const result = await summarizeClaudeCodeLatestFeatures()
    assertEquals(result, null)
  } finally {
    fetchStub.restore()
    Deno.env.delete("GEMINI_API_KEY")
  }
})

Deno.test("summarizeClaudeCodeLatestFeatures returns null when release is from 2 days ago", async () => {
  Deno.env.set("GEMINI_API_KEY", "test-key")

  const fetchStub = stub(globalThis, "fetch", async () => {
    return new Response(makeRelease(2), { status: 200 })
  })

  try {
    const result = await summarizeClaudeCodeLatestFeatures()
    assertEquals(result, null)
  } finally {
    fetchStub.restore()
    Deno.env.delete("GEMINI_API_KEY")
  }
})

Deno.test("summarizeClaudeCodeLatestFeatures throws when GitHub API fails", async () => {
  Deno.env.set("GEMINI_API_KEY", "test-key")

  const fetchStub = stub(globalThis, "fetch", async () => {
    return new Response("Not Found", { status: 404 })
  })

  try {
    await assertRejects(
      () => summarizeClaudeCodeLatestFeatures(),
      Error,
      "GitHub API request failed (404)",
    )
  } finally {
    fetchStub.restore()
    Deno.env.delete("GEMINI_API_KEY")
  }
})
