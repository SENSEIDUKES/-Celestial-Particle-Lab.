import type { IntakeData, WorldBlueprint } from './types';
import {
  STORY_SEED_SCHEMA_VERSION,
  createStorySeedInput,
  normalizeStorySeedInput,
  type StorySeedInput,
} from './storySeedSchema';

export const STORY_SEED_FORMAT = 'seihouse-story-seed' as const;
export const STORY_SEED_COLLECTION_FORMAT = 'seihouse-story-seed-collection' as const;
export const STORY_SEED_FORMAT_VERSION = STORY_SEED_SCHEMA_VERSION;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const portableSeed = (seed: StorySeedInput): Record<string, unknown> => {
  const normalized = normalizeStorySeedInput(seed);
  const additionalCharacters = normalized.world.optional.additionalCharacters
    ?.map(({ id: _id, ...character }) => character);
  const factions = normalized.world.optional.factions
    ?.map(({ id: _id, ...faction }) => faction);
  return {
    ...normalized,
    world: {
      optional: {
        ...normalized.world.optional,
        ...(additionalCharacters ? { additionalCharacters } : {}),
        ...(factions ? { factions } : {}),
      },
    },
  };
};

export const createStorySeedExport = (seed: StorySeedInput) => ({
  format: STORY_SEED_FORMAT,
  version: STORY_SEED_FORMAT_VERSION,
  seed: portableSeed(seed),
});

export const createStorySeedCollectionExport = (seeds: StorySeedInput[]) => ({
  format: STORY_SEED_COLLECTION_FORMAT,
  version: STORY_SEED_FORMAT_VERSION,
  seeds: seeds.map(portableSeed),
});

const isGeneratedStoryPackage = (value: Record<string, unknown>): boolean =>
  'memory' in value || 'arcs' in value || 'chapters' in value || 'imageHistory' in value || 'codex' in value;

const migrateLegacyPayload = (value: Record<string, unknown>): StorySeedInput => {
  const intake = isRecord(value.intake) ? value.intake as IntakeData : value as IntakeData;
  const blueprint = isRecord(value.blueprint) ? value.blueprint as unknown as WorldBlueprint : undefined;
  return normalizeStorySeedInput(createStorySeedInput(intake, blueprint));
};

const extractStorySeed = (value: unknown): StorySeedInput => {
  if (!isRecord(value)) throw new Error('Each seed must be a JSON object.');
  if (isGeneratedStoryPackage(value)) {
    throw new Error('This is a generated story package, not a portable story seed.');
  }
  if (isRecord(value.seed)) return extractStorySeed(value.seed);
  if (isRecord(value.creator) && isRecord(value.story) && isRecord(value.world)) {
    return normalizeStorySeedInput(value);
  }
  if (isRecord(value.intake) || isRecord(value.blueprint)) return migrateLegacyPayload(value);
  throw new Error('No reusable Story Seed data was found in this JSON file.');
};

export const parseStorySeedJson = (input: string): StorySeedInput[] => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    throw new Error('The selected file is not valid JSON.');
  }

  const candidates = Array.isArray(parsed)
    ? parsed
    : isRecord(parsed) && Array.isArray(parsed.seeds)
      ? parsed.seeds
      : [parsed];
  if (candidates.length === 0) throw new Error('The seed file is empty.');
  return candidates.map(extractStorySeed);
};

const safeFilenamePart = (title: string): string =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80) || 'untitled';

const triggerBrowserDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
};

const isMobileShareDevice = (): boolean => {
  const shareNavigator = navigator as Navigator & { userAgentData?: { mobile?: boolean } };
  return Boolean(shareNavigator.userAgentData?.mobile)
    || /Android|iPhone|iPad|iPod|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

const downloadJsonFile = async (value: unknown, filename: string): Promise<void> => {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  if (typeof File !== 'undefined' && typeof navigator !== 'undefined' && isMobileShareDevice()) {
    const file = new File([blob], filename, { type: blob.type });
    const shareNavigator = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
      canShare?: (data: ShareData) => boolean;
    };
    const shareData: ShareData = { files: [file], title: filename };
    if (
      typeof shareNavigator.share === 'function'
      && (typeof shareNavigator.canShare !== 'function' || shareNavigator.canShare(shareData))
    ) {
      try {
        await shareNavigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }
  }
  triggerBrowserDownload(blob, filename);
};

export const downloadStorySeed = (seed: StorySeedInput): Promise<void> => {
  const normalized = normalizeStorySeedInput(seed);
  return downloadJsonFile(
    createStorySeedExport(normalized),
    `seihouse_story_seed_${safeFilenamePart(normalized.world.optional.title || 'untitled')}.json`,
  );
};

export const downloadStorySeedCollection = (seeds: StorySeedInput[]): Promise<void> =>
  downloadJsonFile(
    createStorySeedCollectionExport(seeds),
    `seihouse_story_seeds_${new Date().toISOString().slice(0, 10)}.json`,
  );
