export class AssertionError extends Error {
  override name = "AssertionError"
  constructor(message?: string) {
    super(message ?? "Assertion failed")
  }
}

export type AssertErrorType = AssertionError

export function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) throw new AssertionError(msg)
}
