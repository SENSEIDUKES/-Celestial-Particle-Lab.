// Portable subset of Light-Novels `src/lib/codexContext.ts` — only the
// alias-normalization helpers the intake forms use
// (`normalizeCodexAliases`, `parseCodexAliases`) plus the collision helper
// they support. `NamedCodexEntry` is redefined locally in `./types` as a
// narrow `{ id?, name?, aliases? }` shape (production extends the full
// `BaseCodexEntry`, which belongs to the excluded Codex system).

import type { NamedCodexEntry } from './types';

export interface AliasCollision {
  alias: string;
  conflictingEntryId?: string;
  conflictingEntryName: string;
}

/**
 * Canonical comparison key for user-authored Codex identity fields.
 * NFKC keeps visually equivalent Unicode forms deterministic while preserving
 * the user's original casing in persisted values.
 */
export const normalizeCodexSurface = (value: unknown): string =>
  typeof value === 'string'
    ? value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase()
    : '';

/** Trim and case-insensitively deduplicate aliases, excluding the canonical name. */
export const normalizeCodexAliases = (
  value: unknown,
  canonicalName?: string,
): string[] => {
  if (!Array.isArray(value)) return [];

  const canonicalKey = normalizeCodexSurface(canonicalName);
  const seen = new Set<string>();

  return value
    .filter((alias): alias is string => typeof alias === 'string')
    .map(alias => alias.normalize('NFKC').trim().replace(/\s+/g, ' '))
    .filter(alias => {
      const key = normalizeCodexSurface(alias);
      if (!key || key === canonicalKey || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

/** Parse a compact intake/editor value without asking a model to infer aliases. */
export const parseCodexAliases = (value: string, canonicalName?: string): string[] =>
  normalizeCodexAliases(value.split(/[\n,;]+/), canonicalName);

/**
 * Detect aliases that already identify another entry in the same Codex kind.
 * Callers decide the kind boundary (characters, factions, locations, etc.).
 * Not currently invoked by the copied intake forms — carried over for parity
 * with production's exported surface.
 */
export const findCodexAliasCollisions = (
  entryId: string | undefined,
  canonicalName: string | undefined,
  aliases: unknown,
  entries: NamedCodexEntry[],
): AliasCollision[] => {
  const normalizedAliases = normalizeCodexAliases(aliases, canonicalName);
  const collisions: AliasCollision[] = [];

  for (const alias of normalizedAliases) {
    const aliasKey = normalizeCodexSurface(alias);
    const conflictingEntry = entries.find(entry => {
      if (entry.id && entryId && entry.id === entryId) return false;

      const surfaces = [entry.name, ...normalizeCodexAliases(entry.aliases, entry.name)];
      return surfaces.some(surface => normalizeCodexSurface(surface) === aliasKey);
    });

    if (conflictingEntry) {
      collisions.push({
        alias,
        conflictingEntryId: conflictingEntry.id,
        conflictingEntryName: conflictingEntry.name || 'another Codex entry',
      });
    }
  }

  return collisions;
};
