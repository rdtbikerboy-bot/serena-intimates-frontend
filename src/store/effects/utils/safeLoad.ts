// safeLoad.ts
// Minimal helper to safely load data from a persistence source.
// Returns the loaded value or null on any error and logs the error.

import { serenaLogger } from '@/utils/logger';

export async function safeLoad<T>(loader: () => Promise<T | null>): Promise<T | null> {
  try {
    return await loader();
  } catch (e) {
    // Log error but do not rethrow – pipeline will fallback to defaults.
    serenaLogger.error('safeLoad error', e);
    return null;
  }
}
