import { assertEquals, assertThrows } from "asserts"
import { getEnvVar } from "./utils.ts"

Deno.test("getEnvVar returns value when env var is set", () => {
  Deno.env.set("TEST_VAR", "hello")
  try {
    assertEquals(getEnvVar("TEST_VAR"), "hello")
  } finally {
    Deno.env.delete("TEST_VAR")
  }
})

Deno.test("getEnvVar throws when env var is missing", () => {
  Deno.env.delete("MISSING_VAR")
  assertThrows(() => getEnvVar("MISSING_VAR"), Error, "Environment variable MISSING_VAR is not set")
})
