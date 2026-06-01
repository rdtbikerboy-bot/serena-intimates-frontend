// safeSave.ts
// Minimal helper to safely persist data.
// Catches errors, logs them, and does not propagate.

import { serenaLogger } from '@/utils/logger';

export async function safeSave<T>(saver: (data: T) => Promise<void>, data: T): Promise<void> {
  try {
    await saver(data);
  } catch (e) {
    serenaLogger.error('safeSave error', e);
  }
}
