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
];
