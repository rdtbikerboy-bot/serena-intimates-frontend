// debouncePersistence.ts
// Tiny debounce wrapper for persistence calls.
// Opt-in only — never applied globally.
// Call `debounced(...args)` — the underlying `fn` fires only after
// `wait` ms have passed without another call.

export function debouncePersistence<F extends (...args: any[]) => Promise<void>>(
  fn: F,
  wait = 200
): (...args: Parameters<F>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args); // fire-and-forget; error handling stays inside fn
    }, wait);
  };
}
