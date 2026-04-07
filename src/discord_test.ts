import { assertEquals, assertRejects } from "jsr:@std/assert"
import { stub } from "jsr:@std/testing/mock"
import { postToDiscord } from "./discord.ts"

const WEBHOOK_URL = "https://discord.com/api/webhooks/test"

function withWebhookUrl(fn: () => Promise<void>): () => Promise<void> {
  return async () => {
    Deno.env.set("DISCORD_WEBHOOK_URL", WEBHOOK_URL)
    try {
      await fn()
    } finally {
      Deno.env.delete("DISCORD_WEBHOOK_URL")
    }
  }
}

Deno.test("postToDiscord sends correct method, headers, and payload", withWebhookUrl(async () => {
  let capturedInput: string | URL | Request | undefined
  let capturedInit: RequestInit | undefined

  const fetchStub = stub(globalThis, "fetch", async (input, init) => {
    capturedInput = input
    capturedInit = init
    return new Response(null, { status: 204 })
  })

  try {
    await postToDiscord("Hello Discord!")
    assertEquals(capturedInput, WEBHOOK_URL)
    assertEquals(capturedInit?.method, "POST")
    assertEquals((capturedInit?.headers as Record<string, string>)["Content-Type"], "application/json")
    assertEquals(JSON.parse(capturedInit?.body as string).content, "Hello Discord!")
  } finally {
    fetchStub.restore()
  }
}))

Deno.test("postToDiscord truncates messages longer than 1950 chars", withWebhookUrl(async () => {
  const longMessage = "a".repeat(2000)
  let sentContent: string | undefined

  const fetchStub = stub(globalThis, "fetch", async (_input, init) => {
    sentContent = JSON.parse(init?.body as string).content
    return new Response(null, { status: 204 })
  })

  try {
    await postToDiscord(longMessage)
    assertEquals(sentContent?.length, 1950)
    assertEquals(sentContent?.endsWith("..."), true)
  } finally {
    fetchStub.restore()
  }
}))

Deno.test("postToDiscord does not truncate messages at exactly 1950 chars", withWebhookUrl(async () => {
  const message = "a".repeat(1950)
  let sentContent: string | undefined

  const fetchStub = stub(globalThis, "fetch", async (_input, init) => {
    sentContent = JSON.parse(init?.body as string).content
    return new Response(null, { status: 204 })
  })

  try {
    await postToDiscord(message)
    assertEquals(sentContent, message)
  } finally {
    fetchStub.restore()
  }
}))

Deno.test("postToDiscord throws on non-2xx response", withWebhookUrl(async () => {
  const fetchStub = stub(globalThis, "fetch", async () => {
    return new Response("Unauthorized", { status: 401 })
  })

  try {
    await assertRejects(
      () => postToDiscord("hello"),
      Error,
      "Discord webhook failed (401)",
    )
  } finally {
    fetchStub.restore()
  }
}))
