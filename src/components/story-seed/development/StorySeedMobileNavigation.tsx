import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Bookmark, Check, CircleHelp, CircleUserRound, List, Settings, Sprout, X } from 'lucide-react';
import type { StorySeedInput } from '../shared/storySeedSchema';
import {
  LibraryBottomNavigation,
  type LibraryBottomNavigationItem,
  LibraryButton,
  LibraryNavigationDrawer,
  LibraryPanel,
} from '../../library';
import { haveSameSeedSectionState, type SeedSectionId } from './seedSections';
import type { SeedUpdate } from './seedState';
import { buildStorySeedDrawerSections, storySeedDrawerProfile } from './StorySeedSelector';
import { haveSameStorySeedSettings, StorySeedSettings } from './StorySeedSettings';

interface StorySeedMobileNavigationProps {
  seed: StorySeedInput;
  updateSeed: (update: SeedUpdate) => void;
  activeSection: SeedSectionId;
  equippedTitle?: string | null;
  showStoryBank: boolean;
  helpOpen: boolean;
  isGenerating: boolean;
  savedFeedback: boolean;
  onSelectSection: (id: SeedSectionId) => void;
  onToggleStoryBank: () => void;
  onOpenHelp: () => void;
  onSaveDraft: () => void;
}

/** Mobile drawer, bottom navigation, and utility sheets as one shared owner. */
const StorySeedMobileNavigationComponent = ({
  seed,
  updateSeed,
  activeSection,
  equippedTitle,
  showStoryBank,
  helpOpen,
  isGenerating,
  savedFeedback,
  onSelectSection,
  onToggleStoryBank,
  onOpenHelp,
  onSaveDraft,
}: StorySeedMobileNavigationProps) => {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [mobileSheet, setMobileSheet] = useState<'settings' | 'profile' | null>(null);
  const mobileSheetRef = useRef<HTMLDivElement>(null);
  const mobileSheetTriggerRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!mobileSheet) return;
    const sheet = mobileSheetRef.current;
    const trigger = mobileSheetTriggerRef.current;
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');
    const focusableElements = () => Array.from(
      sheet?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
    ).filter(element => !element.hasAttribute('hidden'));

    (focusableElements()[0] ?? sheet)?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileSheet(null);
        return;
      }
      if (event.key !== 'Tab') return;
      const elements = focusableElements();
      if (elements.length === 0) {
        event.preventDefault();
        sheet?.focus();
        return;
      }
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
      trigger?.focus();
    };
  }, [mobileSheet]);

  const toggleMobileSheet = useCallback((sheet: 'settings' | 'profile') => {
    setSelectorOpen(false);
    if (mobileSheet === sheet) {
      setMobileSheet(null);
      return;
    }
    mobileSheetTriggerRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    setMobileSheet(sheet);
  }, [mobileSheet]);

  const closeSelector = useCallback(() => setSelectorOpen(false), []);
  const selectDrawerSection = useCallback((id: SeedSectionId) => {
    onSelectSection(id);
    setSelectorOpen(false);
  }, [onSelectSection]);
  const drawerProfile = useMemo(() => storySeedDrawerProfile(equippedTitle), [equippedTitle]);
  const drawerSections = useMemo(
    () => selectorOpen
      ? buildStorySeedDrawerSections(seed, activeSection, selectDrawerSection)
      : [],
    [activeSection, seed, selectDrawerSection, selectorOpen],
  );

  const bottomNavItems = useMemo<LibraryBottomNavigationItem[]>(() => [
    {
      id: 'sections',
      label: 'Sections',
      icon: <List size={20} />,
      active: selectorOpen,
      onSelect: () => {
        setMobileSheet(null);
        setSelectorOpen(true);
      },
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <CircleUserRound size={20} />,
      active: mobileSheet === 'profile',
      onSelect: () => toggleMobileSheet('profile'),
    },
    {
      id: 'story-bank',
      label: 'Story Bank',
      icon: <Sprout size={20} />,
      active: showStoryBank,
      onSelect: () => {
        setMobileSheet(null);
        onToggleStoryBank();
      },
    },
    {
      id: 'help',
      label: 'Help',
      icon: <CircleHelp size={20} />,
      active: helpOpen,
      onSelect: () => {
        setMobileSheet(null);
        onOpenHelp();
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={20} />,
      active: mobileSheet === 'settings',
      onSelect: () => toggleMobileSheet('settings'),
    },
  ], [helpOpen, mobileSheet, onOpenHelp, onToggleStoryBank, selectorOpen, showStoryBank, toggleMobileSheet]);

  return (
    <>
      <LibraryNavigationDrawer
        open={selectorOpen}
        onClose={closeSelector}
        aria-label="Story Seed sections"
        closeLabel="Close sections"
        profile={drawerProfile}
        sections={drawerSections}
      />

      <LibraryBottomNavigation
        aria-label="Story Seed navigation"
        items={bottomNavItems}
        showLabels={false}
        className="lg:hidden"
      />

      <AnimatePresence>
        {mobileSheet && (
          <div className="fixed inset-0 z-[240] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              onClick={() => setMobileSheet(null)}
              className="story-seed-overlay-scrim absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
              role="dialog"
              aria-modal="true"
              aria-label={mobileSheet === 'settings' ? 'Story Seed settings' : 'Cultivator profile (placeholder)'}
              ref={mobileSheetRef}
              tabIndex={-1}
              className="absolute inset-x-0 bottom-0"
            >
              <LibraryPanel
                padding="none"
                className="story-seed-overlay-panel max-h-[calc(100dvh-5rem)] overscroll-contain overflow-y-auto rounded-b-none border-x-0 border-b-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))] [padding-left:env(safe-area-inset-left)] [padding-right:env(safe-area-inset-right)]"
              >
                <div className="flex items-center justify-between gap-3 px-4 pt-3">
                  <p className="font-sc text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                    {mobileSheet === 'settings' ? 'Settings' : 'Profile'}
                  </p>
                  <LibraryButton
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileSheet(null)}
                    aria-label={mobileSheet === 'settings' ? 'Close settings' : 'Close profile'}
                    icon={X}
                  />
                </div>

                {mobileSheet === 'settings' ? (
                  <div className="mt-2 space-y-3 px-4">
                    <StorySeedSettings seed={seed} updateSeed={updateSeed} />
                    <div className="space-y-2">
                      <LibraryButton
                        fullWidth
                        onClick={onSaveDraft}
                        disabled={isGenerating}
                        title="Save this Story Seed draft"
                        icon={savedFeedback ? Check : Bookmark}
                      >
                        {savedFeedback ? 'Saved' : 'Save Draft'}
                      </LibraryButton>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-3 px-4 pb-2">
                    <span
                      aria-hidden="true"
                      className="grid size-10 shrink-0 place-items-center rounded-full border border-gold-accent/40 bg-gold-accent/10 font-sc text-sm font-bold text-gold-accent"
                    >
                      S
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-sc text-sm font-bold uppercase tracking-widest text-signal">
                        SENSEI
                      </span>
                      <span className="block font-sans text-[11px] leading-relaxed text-neutral-500">
                        Cultivator Profile is a placeholder — it arrives with a future Library update.
                      </span>
                    </span>
                  </div>
                )}
              </LibraryPanel>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export const StorySeedMobileNavigation = memo(
  StorySeedMobileNavigationComponent,
  (previous, next) => previous.updateSeed === next.updateSeed
    && previous.activeSection === next.activeSection
    && previous.equippedTitle === next.equippedTitle
    && previous.showStoryBank === next.showStoryBank
    && previous.helpOpen === next.helpOpen
    && previous.isGenerating === next.isGenerating
    && previous.savedFeedback === next.savedFeedback
    && previous.onSelectSection === next.onSelectSection
    && previous.onToggleStoryBank === next.onToggleStoryBank
    && previous.onOpenHelp === next.onOpenHelp
    && previous.onSaveDraft === next.onSaveDraft
    && haveSameSeedSectionState(previous.seed, next.seed)
    && haveSameStorySeedSettings(previous.seed, next.seed),
);
