import { useEffect, useRef, useState } from 'react';
import { Bookmark, Check, CircleHelp, Settings, Vault } from 'lucide-react';
import type { StorySeedInput } from '../shared/storySeedSchema';
import {
  LibraryButton,
  LibraryHeaderBadge,
  LibraryPanel,
} from '../../library';
import type { SeedUpdate } from './seedState';
import { StorySeedSettings } from './StorySeedSettings';

const CELESTIAL_LIBRARY_EMBLEM_URL =
  'https://pub-e482c2dbbb984c3c87ecdd8ae3a92183.r2.dev/LIBRARY/images/CELESTIAL%20LIBRARY%20ICON.jpg';

interface StorySeedHeaderProps {
  seed: StorySeedInput;
  updateSeed: (update: SeedUpdate) => void;
  isGenerating: boolean;
  savedFeedback: boolean;
  showStoryBank: boolean;
  onSaveDraft: () => void;
  onToggleStoryBank: () => void;
  onOpenHelp: () => void;
}

/** Desktop identity and utility actions for the finalized Story Seed shell. */
export const StorySeedHeader = ({
  seed,
  updateSeed,
  isGenerating,
  savedFeedback,
  showStoryBank,
  onSaveDraft,
  onToggleStoryBank,
  onOpenHelp,
}: StorySeedHeaderProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!settingsOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSettingsOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) setSettingsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [settingsOpen]);

  return (
    <header className="relative z-40 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
      <LibraryHeaderBadge
        title="Story Seed"
        subtitle="Grow Your Universe"
        emblemSrc={CELESTIAL_LIBRARY_EMBLEM_URL}
        emblemAlt="Celestial Library"
        emblemHref="/"
        emblemLinkLabel="Return to Workshop home"
      />

      <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-x-4 gap-y-2 pt-1 max-lg:hidden">
        <LibraryButton
          onClick={onSaveDraft}
          disabled={isGenerating}
          title="Save this Story Seed draft"
          icon={savedFeedback ? Check : Bookmark}
        >
          <span className="hidden sm:inline">{savedFeedback ? 'Saved' : 'Save Draft'}</span>
          <span className="sm:hidden">{savedFeedback ? 'Saved' : 'Save'}</span>
        </LibraryButton>

        <div className="flex items-center gap-1">
          <div className="relative" ref={settingsRef}>
            <LibraryButton
              variant="ghost"
              size="sm"
              onClick={() => setSettingsOpen(open => !open)}
              icon={Settings}
              aria-expanded={settingsOpen}
              aria-haspopup="dialog"
            >
              Settings
            </LibraryButton>
            {settingsOpen && (
              <div
                className="absolute right-0 top-[calc(100%+0.5rem)] w-[22rem] max-w-[calc(100vw-2rem)]"
                role="dialog"
                aria-label="Story Seed settings"
              >
                <LibraryPanel padding="sm">
                  <StorySeedSettings seed={seed} updateSeed={updateSeed} />
                </LibraryPanel>
              </div>
            )}
          </div>
          <LibraryButton
            variant={showStoryBank ? 'secondary' : 'ghost'}
            size="sm"
            onClick={onToggleStoryBank}
            icon={Vault}
            aria-pressed={showStoryBank}
            title="Open the Story Bank — saved Story Seeds and their World Blueprints"
          >
            Story Bank
          </LibraryButton>
        </div>

        <LibraryButton
          variant="ghost"
          size="sm"
          onClick={onOpenHelp}
          icon={CircleHelp}
          title="Story Seed Help — guidance for every section"
        >
          Help
        </LibraryButton>
      </div>
    </header>
  );
};
