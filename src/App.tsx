import { CelestialBackdropPreview } from './workshop/CelestialBackdropPreview';
import AILoadingVeilPreview from './workshop/previews/AILoadingVeilPreview/AILoadingVeilPreview';
import { IdleCultivationPreview } from './workshop/previews/idle-cultivation/IdleCultivationPreview';
import { IdleCultivationV2Preview } from './workshop/previews/idle-cultivation-v2/IdleCultivationV2Preview';
import RelicsPreview from './workshop/previews/relics/RelicsPreview';
import RelicsDevPreview from './workshop/previews/relics-dev/RelicsDevPreview';
import { WorkshopHome } from './workshop/WorkshopHome';
import { ArrowLeft } from 'lucide-react';
import './styles.css';

function PreviewLayout({ children }: { children: React.ReactNode }) {
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

  if (preview === 'celestial-backdrop') {
    return (
      <PreviewLayout>
        <CelestialBackdropPreview />
      </PreviewLayout>
    );
  }

  if (preview === 'chapter-generation-manifestation') {
    return (
      <PreviewLayout>
        <AILoadingVeilPreview />
      </PreviewLayout>
    );
  }

  if (preview === 'idle-cultivation') {
    return (
      <PreviewLayout>
        <IdleCultivationPreview />
      </PreviewLayout>
    );
  }

  if (preview === 'idle-cultivation-v2') {
    return (
      <PreviewLayout>
        <IdleCultivationV2Preview />
      </PreviewLayout>
    );
  }

  if (preview === 'relics-gallery') {
    return (
      <PreviewLayout>
        <RelicsPreview />
      </PreviewLayout>
    );
  }

  if (preview === 'relics-dev') {
    return (
      <PreviewLayout>
        <RelicsDevPreview />
      </PreviewLayout>
    );
  }

  return <WorkshopHome />;
}
