export type WorkshopCategory =
  | 'backgrounds'
  | 'animations'
  | 'icons'
  | 'rewards'
  | 'reader-ui'
  | 'codex-ui'
  | 'other';

export interface WorkshopSource {
  /** Repository containing the production implementation this feature is compared against. */
  repository: string;
  /** File path of the production implementation, relative to that repository. */
  path: string;
  /** Date the Original Reference was last checked against the real production implementation. */
  lastCompared: string;
}

export type WorkshopEntry = {
  id: string;
  title: string;
  description: string;
  category: WorkshopCategory;
  /** Manually maintained Workshop release version. Never inferred from source changes. */
  version: `v${number}.${number}`;
  source: WorkshopSource;
};

export type WorkshopTrack = 'development' | 'production';

/**
 * A feature's track is intentionally derived from its manually assigned version.
 * Updating source code alone must never move a card between tracks.
 */
export function getWorkshopTrack(version: WorkshopEntry['version']): WorkshopTrack {
  return Number.parseFloat(version.slice(1)) >= 2 ? 'production' : 'development';
}

/** Keep milestone labels deliberate while leaving all other versions literal. */
export function getWorkshopVersionLabel(version: WorkshopEntry['version']) {
  if (version === 'v1.0') return 'v1.0 · Prototype';
  if (version === 'v2.0') return 'v2.0 · Production';
  return version;
}

/**
 * One entry per actual feature — never per version. A feature's Original
 * Reference vs Development split lives inside its own Workshop page
 * (see FeatureWorkspace), not as a second manifest entry or homepage card.
 */
export const workshopEntries: WorkshopEntry[] = [
  {
    id: 'celestial-backdrop',
    title: 'Celestial Particle Backdrop',
    description: 'Color-adaptive celestial particle field with a hidden scroll absorption point.',
    category: 'backgrounds',
    version: 'v1.5',
    source: {
      repository: 'SENSEIDUKES/Light-Novels',
      path: 'src/components/ParticleEffect.tsx',
      lastCompared: '2026-07-29',
    },
  },
  {
    id: 'chapter-generation-flow',
    title: 'Chapter Generation',
    description: 'Inspection tool for the chapter-generation pipeline — the exact assembly order of context/prompt inputs, the assembled text at each stage, and the final structured ChapterContent output. Development additionally prototypes Cultural Prose Styles and Scene Ending Anchors.',
    category: 'other',
    version: 'v1.1',
    source: {
      repository: 'SENSEIDUKES/Light-Novels',
      path: 'src/server/routes/storyRouter.ts',
      lastCompared: '2026-07-31',
    },
  },
  {
    id: 'chapter-generation-manifestation',
    title: 'Chapter Generation Manifestation',
    description: 'Aura Veil state simulator — one shared manifestation shell with narrative and media manifestation modes, driven by one task-card format.',
    category: 'animations',
    version: 'v1.6',
    source: {
      repository: 'SENSEIDUKES/Light-Novels',
      path: 'src/components/AILoadingVeil.tsx',
      lastCompared: '2026-07-29',
    },
  },
  {
    id: 'idle-cultivation',
    title: 'Closed-Door Cultivation',
    description: 'Idle Qi reward presentation and absorption animation.',
    category: 'rewards',
    version: 'v2.0',
    source: {
      repository: 'SENSEIDUKES/Light-Novels',
      path: 'src/components/ClosedDoorCultivationModal.tsx',
      lastCompared: '2026-07-29',
    },
  },
  {
    id: 'relics-gallery',
    title: 'Relics Gallery',
    description: 'Cosmic Artifact cards separated by rarity rank, with the full-screen Relic Reveal celebration flow.',
    category: 'rewards',
    version: 'v1.3',
    source: {
      repository: 'SENSEIDUKES/Light-Novels',
      path: 'src/components/UserProfileInventoryPanel.tsx',
      lastCompared: '2026-07-29',
    },
  },
  {
    id: 'reader-chamber',
    title: 'Reader Chamber',
    description: 'The full reading UI — header, viewport with system blocks and world cards, playback controls, preferences, bookmarks, and Alter Fate — running on a local mock story.',
    category: 'reader-ui',
    version: 'v1.2',
    source: {
      repository: 'SENSEIDUKES/Light-Novels',
      path: 'src/components/ReaderChamber.tsx',
      lastCompared: '2026-07-31',
    },
  },
];
