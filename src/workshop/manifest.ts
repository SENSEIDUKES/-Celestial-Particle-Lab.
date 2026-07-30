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
  status: 'draft' | 'refining' | 'approved';
  source: WorkshopSource;
};

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
    status: 'refining',
    source: {
      repository: 'SENSEIDUKES/Light-Novels',
      path: 'src/CelestialParticleShower.tsx',
      lastCompared: '2026-07-29',
    },
  },
  {
    id: 'chapter-generation-manifestation',
    title: 'Chapter Generation Manifestation',
    description: 'Aura Veil state simulator — one shared manifestation shell with narrative and media manifestation modes, driven by one task-card format.',
    category: 'animations',
    status: 'refining',
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
    status: 'refining',
    source: {
      repository: 'SENSEIDUKES/Light-Novels',
      path: 'src/components/IdleCultivationModal.tsx',
      lastCompared: '2026-07-29',
    },
  },
  {
    id: 'relics-gallery',
    title: 'Relics Gallery',
    description: 'Cosmic Artifact cards separated by rarity rank, with the full-screen Relic Reveal celebration flow.',
    category: 'rewards',
    status: 'refining',
    source: {
      repository: 'SENSEIDUKES/Light-Novels',
      path: 'src/components/UserProfileInventoryPanel.tsx',
      lastCompared: '2026-07-29',
    },
  },
];
