import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen, Building2, Castle, Check, ChevronDown, ChevronRight, Compass, Crown, Eye, Feather,
  FlaskConical, Flame, Flower2, GraduationCap, History, House, Layers, MoonStar,
  MountainSnow, Orbit, PawPrint, Scroll, Search, Sparkle, Sparkles, Sword, Tag, Wand2, X, Zap,
  type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { StorySeedInput } from '../../shared/storySeedSchema';
import { getStoryStyleLabel, normalizeStoryStyle, STORY_STYLE_OPTIONS, type StoryStyle } from '../../shared/storyStyle';
import {
  CATEGORIZED_TAGS, CATEGORY_COLORS, CURATED_PREMISE_EXAMPLES, GENRE_PRESETS, getTagMetadata,
  STORY_TAG_CATALOG, TAG_PRESETS,
  type StoryTagCategory, type StoryTagCategoryColor, type StoryTagMetadata,
} from '../constants';
import { getSeedSection } from '../seedSections';
import { patchStoryRequired, patchWorldIdentity, storyRequired, updateStoryTags, worldIdentity, type UpdateSeed } from '../seedState';
import { LibraryDragonCycleIcon, LibraryTextArea, LibraryTextBox } from '../../../library';
import { WorkspaceShell, workspaceCompactLabelClass } from './WorkspaceShell';

interface OriginWorkspaceProps {
  seed: StorySeedInput;
  updateSeed: UpdateSeed;
}

const TAG_LIMIT = 12;
const TAG_LIMIT_MESSAGE = `Fated limit reached. Only up to ${TAG_LIMIT} celestial tags can be woven into the universe.`;
/** Helpful copy only — 9–12 tags is allowed and never warned about. */
const TAG_RECOMMENDED_COPY = 'Recommended: 4–8 tags.';

/**
 * Tradition tablets. The three Style options share one soft-violet tablet
 * accent (the same family as the Story Path tiles below) so they read as a
 * single set; each tradition keeps its personality only through a muted tint
 * on its sigil medallion. Sigils are tradition marks, not generic glyphs:
 * a scroll for Chinese, a mugunghwa bloom for Korean, a snow-capped peak
 * for Japanese.
 */
const TRADITION_TABLET_ACCENT = '#A78BFA'; // same soft violet as GENRE_PATH_ACCENT
const STYLE_PRESENTATION: Record<StoryStyle, { icon: LucideIcon; tint: string }> = {
  chinese: { icon: Scroll, tint: '#8FA8D8' },
  korean: { icon: Flower2, tint: '#D49BA0' },
  japanese: { icon: MountainSnow, tint: '#9FBEA9' },
};

/**
 * Story Path sigils for the Genre picker. Refined Lucide sigils replace the
 * preset emojis on the Origin surface so every path tile reads as one
 * consistent celestial set. Keyed by `GENRE_PRESETS` id; `Sparkles` is the
 * fallback for any preset added without a sigil. (`constants.ts` keeps the
 * original emoji icons for the isolated legacy workspace files.)
 */
const GENRE_PATH_SIGILS: Record<string, LucideIcon> = {
  Xianxia: Sword,
  Xuanhuan: Flame,
  'LitRPG / System': Zap,
  'Academy Cultivation': GraduationCap,
  'Kingdom Building': Castle,
  'Crafting / Alchemy': FlaskConical,
  'Beast Taming': PawPrint,
  'Tower Climb': Layers,
  Regression: History,
  'Urban Cultivation': Building2,
  'Apocalypse Cultivation': MoonStar,
  'Cosmic Cultivation': Orbit,
  'Political Intrigue': Crown,
  'Cozy Slice-of-Life': House,
  'Mystery Cultivation': Eye,
};

/** Path tiles glow a soft violet; the define-your-own tile glows gold. Both
    hues already live in the Story Seed palette (see TAG_COLOR_ACCENTS). */
const GENRE_PATH_ACCENT = '#A78BFA';
const CUSTOM_GENRE_PATH_ACCENT = '#D4AF37';

const SEMANTIC_TAGS = [
  { keywords: ['system', 'cheat', 'status', 'panel', 'attribute', 'litrpg'], tag: 'game systems' },
  { keywords: ['level', 'progression', 'exp', 'grow', 'ladder', 'rank'], tag: 'level progression' },
  { keywords: ['cultivat', 'meridian', 'dantian', 'qi ', 'immortal', 'spirit root'], tag: 'cultivation realms' },
  { keywords: ['regress', 'return', 'back in time', 'years ago', 'loop', 'timeline'], tag: 'regression/reincarnation' },
  { keywords: ['reincarnat', 'reborn', 'transmigrat', 'isekai', 'another world'], tag: 'reincarnation rules' },
  { keywords: ['academy', 'school', 'sect school', 'dorm', 'class', 'rankings', 'exam'], tag: 'academy cultivation' },
  { keywords: ['sect', 'clan', 'faction', 'disciple', 'elder', 'patriarch'], tag: 'sect politics' },
  { keywords: ['kingdom', 'build', 'territory', 'village', 'town', 'lord', 'ruler'], tag: 'kingdom building' },
  { keywords: ['alchem', 'pill', 'cauldron', 'elixir', 'herb', 'refine'], tag: 'pill refinement' },
  { keywords: ['forge', 'weapon', 'sword', 'artifact', 'hammer', 'craft'], tag: 'weapon forging' },
  { keywords: ['tame', 'beast', 'monster', 'pet', 'animal', 'dragon', 'phoenix'], tag: 'bonded beasts' },
  { keywords: ['tower', 'dungeon', 'floor', 'boss', 'raid', 'climb'], tag: 'dungeon/tower climb' },
  { keywords: ['intrigue', 'noble', 'politics', 'court', 'emperor', 'prince', 'king'], tag: 'political intrigue' },
  { keywords: ['marry', 'marriage', 'romance', 'love', 'wife', 'husband', 'bride', 'groom'], tag: 'arranged marriage' },
  { keywords: ['enemies', 'lovers', 'hate', 'rivals to lovers'], tag: 'enemies to lovers' },
  { keywords: ['death', 'die', 'assassinate', 'doom', 'kill', 'murder'], tag: 'death flags' },
  { keywords: ['curse', 'cursed', 'blessing', 'hex'], tag: 'curse tracking' },
  { keywords: ['fate', 'destiny', 'karma', 'karmic', 'fated'], tag: 'fate bonds' },
  { keywords: ['apocalypse', 'zombie', 'collapse', 'ruin', 'camp', 'survival'], tag: 'apocalypse cultivation' },
  { keywords: ['space', 'star', 'galaxy', 'cosmic', 'void', 'moon', 'stellar'], tag: 'cosmic cultivation' },
  { keywords: ['cozy', 'slice of life', 'slice-of-life', 'slow life', 'peaceful', 'farm'], tag: 'cozy / slice-of-life cultivation' },
  { keywords: ['betray', 'backstab', 'trust', 'allies', 'alliance'], tag: 'betrayal fallout' },
  { keywords: ['rebellion', 'rebel', 'war', 'army', 'battle', 'soldier', 'siege'], tag: 'military strategy' },
  { keywords: ['slow burn', 'slow-burn'], tag: 'slow-burn romance' },
];

/**
 * Category color accents (Step 3). Hex values for the catalog's named
 * category colors so tag chips and family pills can carry their category's
 * accent. The mapping comes straight from `STORY_TAG_CATALOG`/`CATEGORY_COLORS`
 * — including `black` for Meta & Continuity, which is rendered as a true
 * black dot with a faint light ring so it stays visible on dark glass.
 */
const TAG_COLOR_ACCENTS: Record<StoryTagCategoryColor, string> = {
  gray: '#9CA3AF',
  red: '#F87171',
  green: '#34D399',
  purple: '#A78BFA',
  pink: '#F472B6',
  gold: '#D4AF37',
  blue: '#60A5FA',
  teal: '#2DD4BF',
  orange: '#FB923C',
  black: '#000000',
};

const CategoryColorDot = ({ color }: { color: StoryTagCategoryColor }) => (
  <span
    aria-hidden="true"
    className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
    style={
      color === 'black'
        ? { backgroundColor: '#000000', boxShadow: '0 0 0 1px rgba(226, 232, 240, 0.45)' }
        : { backgroundColor: TAG_COLOR_ACCENTS[color] }
    }
  />
);

/** Subtle border tint for a category color; skipped for `black` (invisible on dark). */
const categoryBorderStyle = (color: StoryTagCategoryColor): React.CSSProperties | undefined =>
  color === 'black' ? undefined : { borderColor: `${TAG_COLOR_ACCENTS[color]}4D` };

const tagChipClass = (selected: boolean) =>
  selected
    ? 'border-portal bg-neutral-900 font-semibold text-portal shadow-[0_0_8px_rgba(4,172,255,0.15)]'
    : 'border-neutral-800/70 bg-[#0b0e1e]/50 text-neutral-400 hover:border-neutral-700 hover:text-signal';

/** One catalog tag as a toggle chip, carrying its category color accent. */
const CatalogTagChip = ({ entry, selected, onToggle, className = '' }: {
  entry: StoryTagMetadata;
  selected: boolean;
  onToggle: (tag: string) => void;
  className?: string;
}) => (
  <button
    type="button"
    onClick={() => onToggle(entry.label)}
    title={entry.category}
    style={selected ? undefined : categoryBorderStyle(entry.color)}
    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-all ${tagChipClass(selected)} ${className}`}
  >
    <CategoryColorDot color={entry.color} />
    {selected ? '✓' : '+'} {entry.label}
  </button>
);

/** Catalog search: a query matches the tag label, every alias, and the category name. */
const searchStoryTagCatalog = (query: string): StoryTagMetadata[] => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return STORY_TAG_CATALOG.filter(entry =>
    entry.label.toLowerCase().includes(normalized) ||
    entry.category.toLowerCase().includes(normalized) ||
    entry.aliases.some(alias => alias.toLowerCase().includes(normalized)));
};

const SEARCH_RESULT_LIMIT = 24;

/**
 * Round-robin across categories (catalog order within each) so suggestion
 * rows stay varied instead of filling up with a single family.
 */
const pickVariedTags = (entries: StoryTagMetadata[], limit: number): StoryTagMetadata[] => {
  const buckets = new Map<StoryTagCategory, StoryTagMetadata[]>();
  entries.forEach(entry => {
    const bucket = buckets.get(entry.category);
    if (bucket) bucket.push(entry);
    else buckets.set(entry.category, [entry]);
  });
  const queues = Array.from(buckets.values());
  const picked: StoryTagMetadata[] = [];
  for (let index = 0; picked.length < limit && queues.some(queue => queue.length > 0); index += 1) {
    const next = queues[index % queues.length]?.shift();
    if (next) picked.push(next);
  }
  return picked;
};

const STYLE_SUGGESTION_LIMIT = 10;
const STYLE_SPECIFIC_SHARE = 6;

/**
 * Style-aware suggestions: tradition-specific tags lead and strong general
 * tags (`styles` containing `all`) fill the rest — an enhancement of the
 * general pool, not a takeover. Deterministic catalog lookup; no AI call.
 */
const buildStyleSuggestions = (style: StoryStyle | undefined): StoryTagMetadata[] => {
  const general = STORY_TAG_CATALOG.filter(entry => entry.styles.includes('all'));
  if (!style) return pickVariedTags(general, STYLE_SUGGESTION_LIMIT);
  const specific = STORY_TAG_CATALOG.filter(entry => entry.styles.includes(style) && !entry.styles.includes('all'));
  const specificPicks = pickVariedTags(specific, STYLE_SPECIFIC_SHARE);
  const generalPicks = pickVariedTags(general, STYLE_SUGGESTION_LIMIT - specificPicks.length);
  return [...specificPicks, ...generalPicks];
};

/** Keeps all four Story essentials in one mobile-first creation flow. */
export const OriginWorkspace = ({ seed, updateSeed }: OriginWorkspaceProps) => {
  const section = getSeedSection('origin');
  const { premise, genre, storyTags } = storyRequired(seed);
  const identity = worldIdentity(seed);
  const selectedStyle = normalizeStoryStyle(storyRequired(seed).style);
  const [ghostSuggestion, setGhostSuggestion] = useState<string | null>(null);
  const [activeTagFamily, setActiveTagFamily] = useState<string | null>(null);
  const [customTagInput, setCustomTagInput] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [isGenrePickerOpen, setIsGenrePickerOpen] = useState(false);
  const [isCustomPathOpen, setIsCustomPathOpen] = useState(false);
  const [tagLimitError, setTagLimitError] = useState<string | null>(null);
  const [exampleIndex, setExampleIndex] = useState(0);

  // Suggestions and search both read the Step 2 catalog metadata directly —
  // deterministic lookups, no AI call in this pass.
  const styleSuggestions = useMemo(() => buildStyleSuggestions(selectedStyle), [selectedStyle]);
  const tagSearchResults = useMemo(() => searchStoryTagCatalog(tagSearch), [tagSearch]);
  const isTagSearchActive = tagSearch.trim().length > 0;

  // Premise examples follow the chosen Style; until one is picked, the cycle
  // draws from every tradition's bank.
  const premiseBank = selectedStyle
    ? CURATED_PREMISE_EXAMPLES[selectedStyle]
    : Object.values(CURATED_PREMISE_EXAMPLES).flat();
  const premiseExample = premiseBank[exampleIndex % premiseBank.length];
  const reshufflePremiseExample = () => setExampleIndex(index => (index + 1) % premiseBank.length);

  useEffect(() => setExampleIndex(0), [selectedStyle]);

  useEffect(() => {
    if (!premise.trim() || storyTags.length >= TAG_LIMIT) {
      setGhostSuggestion(null);
      return;
    }
    const lastWord = premise.split(/[\s,.;!?]+/).filter(Boolean).pop();
    const prefixMatch = lastWord && lastWord.length >= 2
      ? TAG_PRESETS.find(tag => tag.toLowerCase().startsWith(lastWord.toLowerCase()) && !storyTags.includes(tag))
      : undefined;
    if (prefixMatch) {
      setGhostSuggestion(prefixMatch);
      return;
    }
    const lowerPremise = premise.toLowerCase();
    const semanticMatch = SEMANTIC_TAGS.find(({ keywords, tag }) =>
      !storyTags.includes(tag) && keywords.some(keyword => lowerPremise.includes(keyword)),
    )?.tag;
    setGhostSuggestion(
      semanticMatch && TAG_PRESETS.includes(semanticMatch)
        ? semanticMatch
        : TAG_PRESETS.find(tag => lowerPremise.includes(tag.toLowerCase()) && !storyTags.includes(tag)) ?? null,
    );
  }, [premise, storyTags]);

  const addTag = (tag: string) => {
    if (storyTags.some(existing => existing.toLowerCase() === tag.toLowerCase())) return;
    if (storyTags.length >= TAG_LIMIT) {
      setTagLimitError(TAG_LIMIT_MESSAGE);
      return;
    }
    setTagLimitError(null);
    updateSeed(updateStoryTags(previous => [...previous, tag]));
  };

  const toggleTag = (tag: string) => {
    if (storyTags.includes(tag)) {
      setTagLimitError(null);
      updateSeed(updateStoryTags(previous => previous.filter(existing => existing !== tag)));
    } else {
      addTag(tag);
    }
  };

  const addCustomTag = () => {
    const tag = customTagInput.trim().replace(/^,|,$/g, '');
    if (!tag) return;
    if (storyTags.length >= TAG_LIMIT) {
      setTagLimitError(TAG_LIMIT_MESSAGE);
      return;
    }
    addTag(tag);
    setCustomTagInput('');
  };

  const familyEntries = activeTagFamily
    ? Array.from(new Set(CATEGORIZED_TAGS[activeTagFamily] || []))
        .map(tag => getTagMetadata(tag))
        .filter((entry): entry is StoryTagMetadata => Boolean(entry))
    : [];
  const originComplete = Boolean(selectedStyle && genre.trim() && premise.trim());

  // Story Paths (Genre): a genre is "custom" when it matches no preset id.
  // The custom path input opens explicitly via the Define tile, or implicitly
  // whenever the stored genre is already a custom one.
  const trimmedGenre = genre.trim();
  const isCustomGenre = Boolean(trimmedGenre) && !GENRE_PRESETS.some(preset => preset.id === trimmedGenre);
  const isCustomPathActive = isCustomPathOpen || isCustomGenre;
  const SelectedGenreSigil = GENRE_PATH_SIGILS[trimmedGenre];

  return (
    <WorkspaceShell section={section} complete={originComplete}>
      <LibraryTextBox
        id="origin-story-title-input"
        label="Story Title"
        icon={BookOpen}
        helpText="Optional — the Library will generate a title if you leave this blank."
        value={identity.title || ''}
        onChange={value => updateSeed(patchWorldIdentity({ title: value }))}
        placeholder="e.g., Ashes of the Ninth Meridian"
      />

      <section className="glass-panel p-4" aria-labelledby="origin-style-title">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p id="origin-style-title" className={workspaceCompactLabelClass}>Style <span className="text-[#D9B36C]">*</span></p>
          <span className="flex items-center gap-1.5 font-sc text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
            Novel tradition<Sparkle size={9} aria-hidden="true" className="text-[#CDB271]/70" />
          </span>
        </div>
        <div role="radiogroup" aria-label="Novel tradition" id="story-style-options" className="grid grid-cols-3 gap-2">
          {STORY_STYLE_OPTIONS.map(option => {
            const selected = selectedStyle === option.value;
            const { icon: Icon, tint } = STYLE_PRESENTATION[option.value];
            return (
              <button key={option.value} type="button" role="radio" aria-checked={selected} id={`story-style-${option.value}`}
                onClick={() => updateSeed(patchStoryRequired({ style: option.value }))} data-selected={selected}
                style={{ '--choice-accent': TRADITION_TABLET_ACCENT } as React.CSSProperties}
                className="glass-choice flex min-h-[4.4rem] flex-col items-center justify-center gap-1.5 px-2 py-2">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-full border transition-all"
                  style={selected
                    ? { borderColor: `${tint}8C`, backgroundColor: `${tint}1F`, boxShadow: `0 0 12px ${tint}47` }
                    : { borderColor: `${tint}40`, backgroundColor: 'rgba(11, 14, 30, 0.6)' }}
                >
                  <Icon size={15} style={{ color: tint }} />
                </span>
                <span className={`flex items-center gap-1 font-sc text-[10px] font-bold uppercase tracking-[0.1em] ${selected ? 'text-signal' : 'text-neutral-300'}`}>
                  {selected && <Check size={11} aria-hidden="true" style={{ color: tint }} />}{option.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <LibraryTextArea
        id="core-premise-input"
        label="Core Premise / Secret Catalyst"
        icon={Feather}
        required
        maxLength={3000}
        value={premise}
        onChange={value => updateSeed(patchStoryRequired({ premise: value }))}
        onKeyDown={event => {
          if (event.key !== 'Tab') return;
          if (!premise.trim()) {
            // Empty field: Tab accepts the system premise example shown as ghost text.
            event.preventDefault();
            updateSeed(patchStoryRequired({ premise: premiseExample }));
            return;
          }
          if (ghostSuggestion) {
            event.preventDefault();
            addTag(ghostSuggestion);
            setGhostSuggestion(null);
          }
        }}
        rows={6}
        placeholder={premiseExample}
        helpText={premise.trim() ? undefined : 'Example shown as ghost text — press Tab to use it, or the dragon for another.'}
        rightElement={premise.trim() ? undefined : (
          <button
            type="button"
            onClick={reshufflePremiseExample}
            aria-label="Show another example premise"
            title="Show another example premise"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-portal/35 bg-portal/10 text-portal transition-all hover:border-portal hover:bg-portal/15 hover:shadow-[0_0_12px_rgba(4,172,255,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-portal/70 active:scale-90"
          >
            <LibraryDragonCycleIcon size={17} />
          </button>
        )}
        className="pb-10 pr-10"
      >
        <AnimatePresence>
          {ghostSuggestion && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.95, y: 2 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 2 }}
              transition={{ duration: 0.2 }}
              onClick={() => { addTag(ghostSuggestion); setGhostSuggestion(null); }}
              title="Click or press Tab to weave this tag into your Story Tags"
              className="absolute bottom-2.5 right-2.5 flex min-w-0 max-w-[80%] items-center gap-1.5 rounded-lg border border-portal/40 bg-[#0b0e1e]/90 px-2.5 py-1 font-mono text-[10px] tracking-wider text-portal shadow-[0_0_12px_rgba(4,172,255,0.15)] transition-all hover:border-portal hover:text-signal sm:max-w-full"
            >
              <Sparkles size={11} className="animate-pulse text-portal" />
              <span className="truncate">Tab: {ghostSuggestion}</span>
            </motion.button>
          )}
        </AnimatePresence>
      </LibraryTextArea>

      <section className="glass-panel p-4 sm:p-5" aria-labelledby="origin-genre-title">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p id="origin-genre-title" className={workspaceCompactLabelClass}>Genre <span className="text-[#D9B36C]">*</span></p>
          <button type="button" aria-expanded={isGenrePickerOpen} aria-controls="origin-genre-presets" onClick={() => setIsGenrePickerOpen(open => !open)}
            className="inline-flex items-center gap-1 font-sc text-[10px] font-bold uppercase tracking-widest text-[#CDB271] transition-colors hover:text-[#E3C878]">
            {isGenrePickerOpen ? 'Close paths' : 'Pick a path'}<ChevronDown size={13} className={isGenrePickerOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
        </div>

        {/* Collapsed: a real tappable button — the invitation to open the
            Story Paths menu, or the chosen path once one is set. */}
        {!isGenrePickerOpen && (
          <button type="button" onClick={() => setIsGenrePickerOpen(true)}
            style={{ '--choice-accent': GENRE_PATH_ACCENT } as React.CSSProperties}
            className="glass-choice flex w-full items-center gap-3 px-4 py-3 text-left">
            <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all ${
              !trimmedGenre
                ? 'border-[rgba(150,166,220,0.2)] bg-[rgba(11,14,30,0.6)]'
                : isCustomGenre
                  ? 'border-[rgba(212,175,55,0.55)] bg-[rgba(212,175,55,0.1)] shadow-[0_0_12px_rgba(212,175,55,0.28)]'
                  : 'border-[rgba(167,139,250,0.55)] bg-[rgba(167,139,250,0.12)] shadow-[0_0_12px_rgba(167,139,250,0.3)]'
            }`}>
              {trimmedGenre
                ? (SelectedGenreSigil
                    ? <SelectedGenreSigil size={16} className="glass-choice-icon" />
                    : <Sparkles size={15} style={{ color: CUSTOM_GENRE_PATH_ACCENT }} />)
                : <Compass size={16} className="glass-choice-icon" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block truncate font-sc text-[11px] font-bold uppercase tracking-[0.12em] ${trimmedGenre ? 'text-signal' : 'text-neutral-200'}`}>
                {trimmedGenre || 'Choose Story Path'}
              </span>
              <span className="mt-0.5 block font-sans text-[11px] text-neutral-500">
                {trimmedGenre ? 'Your story path — tap to change' : 'Xianxia, System, Mystery, or your own'}
              </span>
            </span>
            <ChevronRight size={15} aria-hidden="true" className="shrink-0 text-neutral-500" />
          </button>
        )}

        <AnimatePresence initial={false}>
          {isGenrePickerOpen && (
            <motion.div id="origin-genre-presets" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="pt-1">
                <div className="flex items-center justify-center gap-2.5 sm:gap-3">
                  <span aria-hidden="true" className="flex items-center gap-1.5">
                    <span className="h-px w-5 bg-gradient-to-r from-transparent to-[rgba(167,139,250,0.55)] sm:w-8" />
                    <Sparkle size={9} className="text-[#A78BFA]" />
                  </span>
                  <h3 className="whitespace-nowrap font-display text-base font-bold uppercase tracking-[0.14em] text-signal sm:text-lg sm:tracking-[0.22em]">Story Paths</h3>
                  <span aria-hidden="true" className="flex items-center gap-1.5">
                    <Sparkle size={9} className="text-[#A78BFA]" />
                    <span className="h-px w-5 bg-gradient-to-l from-transparent to-[rgba(167,139,250,0.55)] sm:w-8" />
                  </span>
                </div>
                <p className="mt-1.5 text-center font-sans text-xs text-neutral-400">Choose a path, or define your own.</p>
              </div>

              <div role="radiogroup" aria-label="Story paths" className="mt-4 grid grid-cols-2 gap-2 min-[360px]:grid-cols-3">
                {GENRE_PRESETS.map(preset => {
                  const selected = trimmedGenre === preset.id;
                  const Sigil = GENRE_PATH_SIGILS[preset.id] ?? Sparkles;
                  return (
                    <button key={preset.id} type="button" role="radio" aria-checked={selected} onClick={() => { setIsCustomPathOpen(false); updateSeed(patchStoryRequired({ genre: preset.id })); }}
                      data-selected={selected} style={{ '--choice-accent': GENRE_PATH_ACCENT } as React.CSSProperties}
                      className="glass-choice flex min-h-[5.5rem] flex-col items-center justify-center gap-2 px-1.5 py-3">
                      <span aria-hidden="true" className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${selected ? 'border-[rgba(167,139,250,0.55)] bg-[rgba(167,139,250,0.12)] shadow-[0_0_12px_rgba(167,139,250,0.3)]' : 'border-[rgba(150,166,220,0.2)] bg-[rgba(11,14,30,0.6)]'}`}>
                        <Sigil size={16} className="glass-choice-icon" />
                      </span>
                      {/* Zero-width spaces after slashes give long compound
                          names ("Crafting/Alchemy") a clean wrap point. */}
                      <span className={`font-sc text-[10px] font-bold uppercase leading-tight tracking-[0.08em] ${selected ? 'text-signal' : 'text-neutral-300'}`}>{preset.name.replace(/\//g, '/\u200B')}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom path — the official way to write a genre that is not on the list. */}
              <button type="button" onClick={() => setIsCustomPathOpen(open => !open)}
                aria-expanded={isCustomPathActive} aria-controls="genre-custom-path-fields"
                data-selected={isCustomPathActive} style={{ '--choice-accent': CUSTOM_GENRE_PATH_ACCENT } as React.CSSProperties}
                className="glass-choice mt-3 flex w-full items-center gap-3 px-4 py-3 text-left">
                <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all ${isCustomPathActive ? 'border-[rgba(212,175,55,0.55)] bg-[rgba(212,175,55,0.1)] shadow-[0_0_12px_rgba(212,175,55,0.28)]' : 'border-[rgba(150,166,220,0.2)] bg-[rgba(11,14,30,0.6)]'}`}>
                  <Sparkle size={15} className="glass-choice-icon" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block font-sc text-[11px] font-bold uppercase tracking-[0.12em] ${isCustomPathActive ? 'text-signal' : 'text-neutral-200'}`}>Define My Own Path</span>
                  <span className="mt-0.5 block font-sans text-[11px] text-neutral-500">Craft a genre that&rsquo;s uniquely yours.</span>
                </span>
                <ChevronRight size={15} aria-hidden="true" className={`shrink-0 transition-transform ${isCustomPathActive ? 'rotate-90 text-[#D4AF37]' : 'text-neutral-500'}`} />
              </button>

              <AnimatePresence initial={false}>
                {isCustomPathActive && (
                  <motion.div id="genre-custom-path-fields" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="mt-3 rounded-xl border border-[rgba(212,175,55,0.18)] bg-[rgba(212,175,55,0.04)] p-3">
                      <p className="mb-2 flex items-center gap-1.5 font-sc text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                        <Sparkles size={11} aria-hidden="true" />Define your genre
                      </p>
                      <LibraryTextBox id="genre-custom-input" size="compact" value={isCustomGenre ? genre : ''} onChange={value => updateSeed(patchStoryRequired({ genre: value }))} placeholder="Example: urban xianxia mystery" aria-label="Custom genre" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="glass-panel space-y-4 p-4 sm:p-5" aria-labelledby="origin-tags-title">
        <div>
          <p id="origin-tags-title" className="flex items-center gap-2 font-sc text-[11px] font-bold uppercase tracking-widest text-signal"><Tag size={13} className="text-[#CDB271]" aria-hidden="true" />Story Tags</p>
          <p className="mt-1 font-sans text-xs text-neutral-500">Optional — inferred from your origin if left empty.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <LibraryTextBox id="custom-tag-input" size="compact" icon={Tag} value={customTagInput} onChange={setCustomTagInput}
              onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addCustomTag(); } }} placeholder="Add a specific tag..." aria-label="Add a custom tag" />
          </div>
          <button type="button" onClick={addCustomTag} className="min-h-[2.75rem] rounded border border-portal/50 bg-portal/10 px-4 py-2 font-sc text-[10px] font-bold uppercase tracking-widest text-portal transition-colors hover:border-portal hover:bg-portal/20">Add tag</button>
        </div>

        <AnimatePresence>
          {tagLimitError && <motion.p id="tag-limit-error" role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="rounded border border-[#8B0000]/30 bg-[#8B0000]/10 px-3 py-2 font-sans text-xs text-red-400">{tagLimitError}</motion.p>}
        </AnimatePresence>

        {/* Suggested Tags — deterministic catalog picks tuned to the selected
            Style, with strong general tags mixed in (no AI call). One focused
            scrollable row, so suggestions never become a wall of chips. */}
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 font-sc text-[10px] font-bold uppercase tracking-widest text-neutral-300"><Wand2 size={12} className="text-[#CDB271]" aria-hidden="true" />Suggested Tags</p>
            <span className="font-sans text-[11px] text-neutral-500">{selectedStyle ? `Tuned to ${getStoryStyleLabel(selectedStyle)} tradition` : 'Pick a Style above to tune these'}</span>
          </div>
          <div className="scrollbar-thin flex gap-1.5 overflow-x-auto pb-1" id="style-suggested-tags">
            {styleSuggestions.map(entry => (
              <CatalogTagChip key={entry.label} entry={entry} selected={storyTags.includes(entry.label)} onToggle={toggleTag} className="shrink-0 whitespace-nowrap" />
            ))}
          </div>
        </div>

        {/* Search Tags — one bar across the whole catalog: labels, aliases,
            and category names. While a query is active, its results replace
            the family browser below. */}
        <div className="border-t border-neutral-800/80 pt-4">
          <div className="mb-3 w-full sm:max-w-xs">
            <LibraryTextBox id="celestial-tag-search-input" size="compact" icon={Search} value={tagSearch} onChange={setTagSearch} placeholder="Search tags, aliases, families..." aria-label="Search story tags" />
          </div>
          {isTagSearchActive ? (
            <>
              <p className="mb-2 font-sans text-[11px] text-neutral-500">
                {tagSearchResults.length} {tagSearchResults.length === 1 ? 'match' : 'matches'} across all families
              </p>
              <div className="glass-panel scrollbar-thin flex max-h-52 flex-wrap content-start gap-1.5 overflow-y-auto p-3" id="filtered-tags-list">
                {tagSearchResults.length === 0 ? (
                  <p className="w-full py-3 text-center font-sans text-xs italic text-neutral-600">No tags, aliases, or families match this search.</p>
                ) : (
                  tagSearchResults.slice(0, SEARCH_RESULT_LIMIT).map(entry => (
                    <CatalogTagChip key={entry.label} entry={entry} selected={storyTags.includes(entry.label)} onToggle={toggleTag} />
                  ))
                )}
                {tagSearchResults.length > SEARCH_RESULT_LIMIT && (
                  <p className="w-full pt-1 text-center font-sans text-[11px] italic text-neutral-600">
                    +{tagSearchResults.length - SEARCH_RESULT_LIMIT} more — keep typing to narrow the search.
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <p className={workspaceCompactLabelClass}>Tag families</p>
              <div className="mt-2 flex flex-wrap gap-1.5" id="tag-categories">
                {Object.keys(CATEGORIZED_TAGS).map(family => {
                  const isOpen = activeTagFamily === family;
                  return (
                    <button key={family} type="button" aria-expanded={isOpen} aria-controls="origin-family-tags" onClick={() => { setActiveTagFamily(current => current === family ? null : family); setTagSearch(''); }}
                      className={`inline-flex min-h-[2.25rem] items-center gap-1.5 rounded-full border px-3 py-1 font-sc text-[10px] font-bold uppercase tracking-[0.14em] transition-all ${isOpen ? 'border-portal/60 bg-portal/10 text-portal shadow-[0_0_10px_rgba(4,172,255,0.18)]' : 'border-[rgba(150,166,220,0.22)] bg-[#0d1126]/60 text-neutral-300 hover:border-[rgba(150,166,220,0.45)] hover:text-signal'}`}>
                      <CategoryColorDot color={CATEGORY_COLORS[family as StoryTagCategory]} />{family}<ChevronDown size={12} className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                    </button>
                  );
                })}
              </div>
              <AnimatePresence initial={false}>
                {activeTagFamily ? (
                  <motion.div id="origin-family-tags" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                    <div className="glass-panel scrollbar-thin flex max-h-52 flex-wrap content-start gap-1.5 overflow-y-auto p-3" id="filtered-tags-list">
                      {familyEntries.map(entry => (
                        <CatalogTagChip key={entry.label} entry={entry} selected={storyTags.includes(entry.label)} onToggle={toggleTag} />
                      ))}
                    </div>
                  </motion.div>
                ) : <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 font-sans text-xs italic text-neutral-600">Choose a family to reveal its tags.</motion.p>}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Selected tags — still plain strings in the seed; the dot only marks
            tags that exist in the catalog (custom tags keep the plain chip). */}
        <div className="border-t border-neutral-800/80 pt-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className={workspaceCompactLabelClass}>Your tags ({storyTags.length} / {TAG_LIMIT})</p>
            <span className="font-sans text-[11px] text-neutral-500">{TAG_RECOMMENDED_COPY}</span>
            {storyTags.length > 0 && <button type="button" onClick={() => updateSeed(updateStoryTags(() => []))} className="font-sc text-[10px] uppercase tracking-widest text-neutral-500 transition-colors hover:text-red-400">Clear all</button>}
          </div>
          {storyTags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {storyTags.map(tag => {
                const metadata = getTagMetadata(tag);
                return (
                  <span key={tag} className="glass-chip animate-fadeIn px-2.5 py-1 font-sans text-xs">
                    {metadata && <CategoryColorDot color={metadata.color} />}
                    <span className="font-semibold">{tag}</span>
                    <button type="button" onClick={() => toggleTag(tag)} aria-label={`Remove tag ${tag}`} className="text-neutral-500 transition-colors hover:text-signal"><X size={12} /></button>
                  </span>
                );
              })}
            </div>
          ) : <p className="font-sans text-xs italic leading-relaxed text-neutral-600">No manual tags yet. Your origin will provide them when you forge the blueprint.</p>}
        </div>
      </section>
    </WorkspaceShell>
  );
};
