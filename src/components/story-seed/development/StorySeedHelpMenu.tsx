import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronRight, CircleHelp, Pause, Play, X } from 'lucide-react';
import { LibraryButton, LibraryPanel, cn } from '../../library';
import {
  DEFAULT_HELP_LANGUAGE,
  STORY_SEED_HELP_ITEMS,
  getHelpTranslation,
  type StorySeedHelpItem,
  type StorySeedHelpLanguage,
  type StorySeedHelpTranslation,
} from './storySeedHelp';

interface StorySeedHelpMenuProps {
  open: boolean;
  onClose: () => void;
  /**
   * Language of the written and spoken guidance. English is the launch
   * language; more slot in through `storySeedHelp.ts` without UI changes.
   */
  language?: StorySeedHelpLanguage;
}

/**
 * StorySeedHelpMenu — the `?` destination for Story Seed guidance.
 *
 * One clean home for the help lines that used to be scattered across section
 * tip boxes. Reveal is hover/tap-to-learn: hovering a topic on desktop shows
 * its info card in the side panel, tapping a topic on mobile expands its card
 * inline. Every card carries the written line and can play the matching
 * spoken line; one line plays at a time and playback stops when the revealed
 * topic changes or the menu closes.
 */
export const StorySeedHelpMenu = ({ open, onClose, language = DEFAULT_HELP_LANGUAGE }: StorySeedHelpMenuProps) => {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingId(null);
  };

  /** Reveal a topic's card (`null` collapses). Playback belongs to the
      visible card, so switching topics stops the previous line. */
  const revealItem = (id: string | null) => {
    if (id !== activeId) stopAudio();
    setActiveId(id);
  };

  const toggleAudio = (item: StorySeedHelpItem, translation: StorySeedHelpTranslation) => {
    if (playingId === item.id) {
      stopAudio();
      return;
    }
    stopAudio();
    const audio = new Audio(translation.audioUrl);
    audioRef.current = audio;
    setPlayingId(item.id);
    const release = () => {
      if (audioRef.current === audio) {
        audioRef.current = null;
        setPlayingId(null);
      }
    };
    audio.onended = release;
    audio.onerror = release;
    void audio.play().catch(release);
  };

  // Closing the menu silences playback and resets the revealed topic.
  useEffect(() => {
    if (open) return;
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingId(null);
    setActiveId(null);
  }, [open]);

  // Never leave a line playing after the menu unmounts.
  useEffect(() => () => audioRef.current?.pause(), []);

  // Same shell behavior as the other Story Seed sheets: Escape closes and
  // body scroll locks while the menu is open.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  const activeItem = STORY_SEED_HELP_ITEMS.find(item => item.id === activeId) ?? null;
  const activeTranslation = activeItem ? getHelpTranslation(activeItem, language) : undefined;

  const renderCard = (item: StorySeedHelpItem) => {
    const translation = getHelpTranslation(item, language);
    if (!translation) return null;
    const playing = playingId === item.id;
    return (
      <div className="rounded-xl border border-[rgba(205,178,113,0.22)] bg-[#0b0e1e]/70 p-4 shadow-[inset_0_0_24px_-14px_rgba(205,178,113,0.35)]">
        <p className="font-serif text-[15px] leading-relaxed text-[#C9C2B2]">{translation.line}</p>
        <button
          type="button"
          onClick={() => toggleAudio(item, translation)}
          aria-pressed={playing}
          className="mt-3.5 inline-flex min-h-[2.5rem] items-center gap-2 rounded-full border border-portal/40 bg-portal/10 px-4 py-2 font-sc text-[10px] font-bold uppercase tracking-[0.16em] text-portal transition-colors hover:border-portal hover:bg-portal/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-portal/70 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
        >
          {playing ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}
          {playing ? 'Pause' : 'Listen'} · English
        </button>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[250] flex items-end justify-center lg:items-center lg:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 32 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-label="Story Seed help"
            className="relative w-full max-w-xl lg:max-w-3xl"
          >
            <LibraryPanel
              padding="none"
              className="flex max-h-[85vh] flex-col pb-[env(safe-area-inset-bottom)] max-lg:rounded-b-none max-lg:border-x-0 max-lg:border-b-0 lg:pb-0"
            >
              <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-5">
                <div>
                  <p className="font-sc text-[11px] font-bold uppercase tracking-[0.34em] text-neutral-500">
                    <span className="text-[#CDB271]/90">Library</span>
                    <span className="mx-2.5 text-neutral-700">/</span>
                    <span className="text-neutral-400">Guidance</span>
                  </p>
                  <h2 className="mt-2 font-display text-xl font-bold uppercase tracking-[0.14em] text-[#F3EDE0] sm:text-2xl">
                    Story Seed Help
                  </h2>
                  <p className="mt-1.5 max-w-md font-serif text-[13px] leading-relaxed text-[#B0A99B]">
                    <span className="lg:hidden">Tap a topic for its guidance.</span>
                    <span className="hidden lg:inline">Hover or select a topic for its guidance.</span>
                    {' '}Every line can be listened to in English.
                  </p>
                </div>
                <LibraryButton
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label="Close help"
                  icon={X}
                />
              </div>

              <div className="mt-4 overflow-y-auto px-4 pb-5 sm:px-6 sm:pb-6">
                <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-5">
                  <ul className="space-y-2">
                    {STORY_SEED_HELP_ITEMS.map(item => {
                      const active = item.id === activeId;
                      const Icon = item.icon;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            aria-expanded={active}
                            // pointerType keeps this a true desktop hover —
                            // touch taps only ever toggle through onClick.
                            onPointerEnter={event => {
                              if (event.pointerType === 'mouse') revealItem(item.id);
                            }}
                            onClick={() => revealItem(active ? null : item.id)}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-portal/70',
                              active
                                ? 'border-[rgba(205,178,113,0.45)] bg-[rgba(205,178,113,0.08)]'
                                : 'border-neutral-800/70 bg-[#0d1126]/50 hover:border-neutral-700',
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className={cn(
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors',
                                active
                                  ? 'border-[rgba(205,178,113,0.5)] bg-[rgba(205,178,113,0.12)] text-[#DDC58A]'
                                  : 'border-[rgba(205,178,113,0.25)] bg-[rgba(11,14,30,0.6)] text-[#CDB271]/80',
                              )}
                            >
                              <Icon size={14} />
                            </span>
                            <span className={cn(
                              'min-w-0 flex-1 truncate font-sc text-[11px] font-bold uppercase tracking-[0.14em]',
                              active ? 'text-signal' : 'text-neutral-300',
                            )}
                            >
                              {item.label}
                            </span>
                            <ChevronRight
                              size={14}
                              aria-hidden="true"
                              className={cn(
                                'shrink-0 transition-transform motion-reduce:transition-none',
                                active ? 'rotate-90 text-[#DDC58A]' : 'text-neutral-600',
                              )}
                            />
                          </button>

                          {/* Mobile: the tapped topic's card expands inline. */}
                          <AnimatePresence initial={false}>
                            {active && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
                                className="overflow-hidden lg:hidden"
                              >
                                <div className="pt-2">{renderCard(item)}</div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Desktop: the hovered/selected topic's card rests beside
                      the list so hovering reads like a preview. */}
                  <div className="hidden lg:block">
                    {activeItem && activeTranslation ? (
                      renderCard(activeItem)
                    ) : (
                      <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-neutral-800/90 px-6 text-center">
                        <CircleHelp size={18} aria-hidden="true" className="text-[#CDB271]/60" />
                        <p className="font-sans text-xs leading-relaxed text-neutral-500">
                          Hover over a topic to reveal its guidance.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </LibraryPanel>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
