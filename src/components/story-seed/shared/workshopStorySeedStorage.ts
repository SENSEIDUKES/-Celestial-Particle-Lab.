/**
 * Temporary Workshop-only Story Seed storage (browser `localStorage`, with an
 * in-memory fallback). It exists solely to validate the cleaned Story Seed
 * contract end to end.
 *
 * Everything database-shaped stops here: it is the single implementation of
 * the `StorySeedRepository` port and is replaced by passing the real one to
 * `setStorySeedRepository`. No other Story Seed module may import this file.
 */

import { generateUUID } from './id';
import {
  STORY_SEED_SCHEMA_VERSION,
  normalizeStorySeedInput,
  type StorySeedInput,
} from './storySeedSchema';
import type { StorySeedRecord, StorySeedRepository } from './storySeedRepository';

const STORAGE_KEY = 'seihouse-workshop-story-seeds-v3';
let memoryRecords: StorySeedRecord[] = [];

const storage = (): Storage | null => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
};

const seedTitle = (seed: StorySeedInput): string =>
  seed.world.optional.worldIdentity.title
  || seed.story.required.premise.slice(0, 80)
  || 'Untitled Seed';

const normalizeRecord = (value: unknown): StorySeedRecord | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  if (
    source.schemaVersion !== STORY_SEED_SCHEMA_VERSION
    || typeof source.id !== 'string'
    || typeof source.userId !== 'string'
    || typeof source.createdAt !== 'string'
    || typeof source.updatedAt !== 'string'
  ) return null;
  try {
    const seed = normalizeStorySeedInput(source.seed);
    return {
      schemaVersion: STORY_SEED_SCHEMA_VERSION,
      id: source.id,
      userId: source.userId,
      title: typeof source.title === 'string' && source.title.trim()
        ? source.title.trim()
        : seedTitle(seed),
      createdAt: source.createdAt,
      updatedAt: source.updatedAt,
      seed,
    };
  } catch {
    return null;
  }
};

const readRecords = (): StorySeedRecord[] => {
  const persisted = storage()?.getItem(STORAGE_KEY);
  if (!persisted) return [...memoryRecords];
  try {
    const parsed = JSON.parse(persisted);
    if (!Array.isArray(parsed)) return [];
    const records = parsed.map(normalizeRecord).filter((seed): seed is StorySeedRecord => seed !== null);
    memoryRecords = records;
    return [...records];
  } catch {
    return [];
  }
};

const writeRecords = (records: StorySeedRecord[]): void => {
  memoryRecords = [...records];
  storage()?.setItem(STORAGE_KEY, JSON.stringify(records));
};

const buildRecord = (
  userId: string,
  id: string,
  input: StorySeedInput,
  createdAt = new Date().toISOString(),
): StorySeedRecord => {
  if (!userId) throw new Error('Sign in to save story seeds to your account.');
  const seed = normalizeStorySeedInput(input);
  return {
    schemaVersion: STORY_SEED_SCHEMA_VERSION,
    id,
    userId,
    title: seedTitle(seed),
    createdAt,
    updatedAt: new Date().toISOString(),
    seed,
  };
};

export const workshopStorySeedStorage: StorySeedRepository = {
  async create(userId, input) {
    const record = buildRecord(userId, `seed-${generateUUID()}`, input);
    writeRecords([record, ...readRecords()]);
    return record;
  },

  async update(userId, existing, input) {
    if (existing.userId !== userId) throw new Error('Cannot update a story seed owned by another account.');
    const record = buildRecord(userId, existing.id, input, existing.createdAt);
    writeRecords(readRecords().map(seed => (seed.id === record.id ? record : seed)));
    return record;
  },

  async list(userId) {
    if (!userId) return [];
    return readRecords()
      .filter(seed => seed.userId === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async importMany(userId, inputs) {
    if (inputs.length > 500) throw new Error('A seed import can contain at most 500 seeds at a time.');
    const imported = inputs.map(input => buildRecord(userId, `seed-${generateUUID()}`, input));
    writeRecords([...imported, ...readRecords()]);
    return imported;
  },

  reset(records = []) {
    writeRecords(records);
  },
};
