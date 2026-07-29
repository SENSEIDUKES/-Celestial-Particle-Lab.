export type WorkshopCategory =
  | 'backgrounds'
  | 'animations'
  | 'icons'
  | 'rewards'
  | 'reader-ui'
  | 'codex-ui'
  | 'other';

export type WorkshopEntry = {
  id: string;
  title: string;
  description: string;
  category: WorkshopCategory;
  status: 'draft' | 'refining' | 'approved';
};

export const workshopEntries: WorkshopEntry[] = [
  {
    id: 'celestial-backdrop',
    title: 'Celestial Particle Backdrop',
    description: 'Color-adaptive celestial particle field with a hidden scroll absorption point.',
    category: 'backgrounds',
    status: 'refining',
  },
  {
    id: 'chapter-generation-manifestation',
    title: 'Chapter Generation Manifestation',
    description: 'Shared LoadingSystem state simulator — primary veil and compact indicator driven by one task-card format.',
    category: 'animations',
    status: 'refining',
  },
  {
    id: 'idle-cultivation',
    title: 'Closed-Door Cultivation',
    description: 'Idle Qi reward presentation and absorption animation.',
    category: 'rewards',
    status: 'refining',
  },
  {
    id: 'idle-cultivation-v2',
    title: 'Closed-Door Cultivation V2',
    description: 'Refined idle Qi reward — ink-aura protected space, safe-area anchoring, ascending claim particles.',
    category: 'rewards',
    status: 'refining',
  },
  {
    id: 'relics-gallery',
    title: 'Relics Gallery',
    description: 'Visual development preview for Cosmic Artifacts separated by rarity rank, with the full-screen Relic Reveal celebration flow.',
    category: 'rewards',
    status: 'refining',
  },
  {
    id: 'relics-dev',
    title: 'Relics Gallery — DEV',
    description: 'DEV copy of the Relic Reveal sequence for active UI work: sealed premium card face, post-reveal rank lighting, spin sparks, and a rank-free stats box.',
    category: 'rewards',
    status: 'draft',
  },
];
