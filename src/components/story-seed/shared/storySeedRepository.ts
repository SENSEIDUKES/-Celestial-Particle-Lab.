/**
 * The Story Seed storage port.
 *
 * The creator-controlled seed (`StorySeedInput`) is stored *inside* the
 * record, never merged with it, so the account-level fields below stay out of
 * `creator` / `story` / `world`. The real record and its database layer are a
 * later phase; for now the port is backed by the temporary Workshop
 * localStorage adapter, which can be swapped through `setStorySeedRepository`
 * without the Story Seed domain structure changing again.
 */

import {
  STORY_SEED_SCHEMA_VERSION,
  type StorySeedInput,
} from './storySeedSchema';
import { workshopStorySeedStorage } from './workshopStorySeedStorage';

/** A saved seed plus the minimum needed to list and reopen it. */
export interface StorySeedRecord {
  schemaVersion: typeof STORY_SEED_SCHEMA_VERSION;
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  seed: StorySeedInput;
}

export interface StorySeedRepository {
  create(userId: string, input: StorySeedInput): Promise<StorySeedRecord>;
  update(userId: string, existing: StorySeedRecord, input: StorySeedInput): Promise<StorySeedRecord>;
  list(userId: string): Promise<StorySeedRecord[]>;
  importMany(userId: string, inputs: StorySeedInput[]): Promise<StorySeedRecord[]>;
  reset(records?: StorySeedRecord[]): void;
}

let repository: StorySeedRepository = workshopStorySeedStorage;

/** Swap the backing store (used when the real repository replaces the Workshop one). */
export const setStorySeedRepository = (next: StorySeedRepository): void => {
  repository = next;
};

export const createStorySeed = (userId: string, input: StorySeedInput): Promise<StorySeedRecord> =>
  repository.create(userId, input);

export const updateStorySeed = (
  userId: string,
  existing: StorySeedRecord,
  input: StorySeedInput,
): Promise<StorySeedRecord> => repository.update(userId, existing, input);

export const listStorySeeds = (userId: string): Promise<StorySeedRecord[]> => repository.list(userId);

export const importStorySeeds = (
  userId: string,
  inputs: StorySeedInput[],
): Promise<StorySeedRecord[]> => repository.importMany(userId, inputs);

export const resetStorySeedRepository = (records: StorySeedRecord[] = []): void =>
  repository.reset(records);
