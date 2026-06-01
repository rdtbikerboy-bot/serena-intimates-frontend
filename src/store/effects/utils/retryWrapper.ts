// retryWrapper.ts
// Minimal retry helper. Retries the supplied async function up to
// `maxAttempts` times with a small incremental delay (100ms, 200ms, 400ms…).
// Errors are re‑thrown after the final attempt.
// Intentionally tiny — no queues, cancellation, telemetry, or policies.

export async function retryWrapper<T>(
  fn: () => Promise<T>,
  maxAttempts = 3
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (e) {
      attempt += 1;
      if (attempt >= maxAttempts) throw e;
      await new Promise((r) => setTimeout(r, 100 * 2 ** (attempt - 1)));
    }
  }
}
