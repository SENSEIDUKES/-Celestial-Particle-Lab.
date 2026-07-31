import type { ComponentType, ReactNode } from 'react';
import { CelestialBackdropWorkspace } from './workshop/previews/celestial-backdrop/CelestialBackdropWorkspace';
import { ChapterManifestationWorkspace } from './workshop/previews/chapter-manifestation/ChapterManifestationWorkspace';
import { ClosedDoorCultivationWorkspace } from './workshop/previews/closed-door-cultivation/ClosedDoorCultivationWorkspace';
import { ReaderChamberWorkspace } from './workshop/previews/reader-chamber/ReaderChamberWorkspace';
import { RelicsWorkspace } from './workshop/previews/relics/RelicsWorkspace';
import { WorkshopHome } from './workshop/WorkshopHome';
import { ArrowLeft } from 'lucide-react';
import './styles.css';

/**
 * One entry per manifest id. Adding a feature means adding one line here —
 * never a new `if` block per version. There is no separate registry entry
 * for a "V2"; a feature's Original Reference / Development split lives
 * inside its own workspace component (see FeatureWorkspace).
 */
const previewRegistry: Record<string, ComponentType> = {
  'celestial-backdrop': CelestialBackdropWorkspace,
  'chapter-generation-manifestation': ChapterManifestationWorkspace,
  'idle-cultivation': ClosedDoorCultivationWorkspace,
  'reader-chamber': ReaderChamberWorkspace,
  'relics-gallery': RelicsWorkspace,
};

function PreviewLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-full backdrop-blur transition-all duration-200 border border-neutral-700/50 shadow-lg"
        style={{ textDecoration: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.875rem' }}
      >
        <ArrowLeft size={16} />
        Back to Workshop
      </a>
      {children}
    </>
  );
}

export default function App() {
  const preview = new URLSearchParams(window.location.search).get('preview');
  const Workspace = preview ? previewRegistry[preview] : undefined;

  if (Workspace) {
    return (
      <PreviewLayout>
        <Workspace />
      </PreviewLayout>
    );
  }

  return <WorkshopHome />;
}
