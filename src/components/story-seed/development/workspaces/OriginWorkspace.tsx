import React, { useEffect, useState } from 'react';
import {
  BookOpen, Check, ChevronDown, Feather, Flower2, Gem, RefreshCw, Scroll,
  Search, Sparkles, Tag, X, type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { StorySeedInput } from '../../shared/storySeedSchema';
import { normalizeStoryStyle, STORY_STYLE_OPTIONS, type StoryStyle } from '../../shared/storyStyle';
import { CATEGORIZED_TAGS, CURATED_PREMISE_EXAMPLES, GENRE_PRESETS, TAG_PRESETS } from '../constants';
import { getSeedSection } from '../seedSections';
import { suggestTagsStub, useAppStore } from '../../shared/stubs';
import { patchStoryRequired, patchWorldIdentity, storyRequired, updateStoryTags, worldIdentity, type UpdateSeed } from '../seedState';
import { LibraryDragonCycleIcon, LibraryTextArea, LibraryTextBox } from '../../../library';
import { GuidanceNote, WorkspaceShell, workspaceCompactLabelClass } from './WorkspaceShell';

interface OriginWorkspaceProps {
  seed: StorySeedInput;
  updateSeed: UpdateSeed;
}

const TAG_LIMIT = 20;
const TAG_LIMIT_MESSAGE = `Fated limit reached. Only up to ${TAG_LIMIT} celestial tags can be woven into the universe.`;

const STYLE_PRESENTATION: Record<StoryStyle, { icon: LucideIcon; accent: string }> = {
  chinese: { icon: Scroll, accent: '#04ACFF' },
  korean: { icon: Gem, accent: '#FF4545' },
  japanese: { icon: Flower2, accent: '#34D399' },
};

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
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState<{ suggestedTags: string[]; reasoning: string } | null>(null);
  const [tagSuggestionError, setTagSuggestionError] = useState<string | null>(null);
  const [tagLimitError, setTagLimitError] = useState<string | null>(null);
  const [exampleIndex, setExampleIndex] = useState(0);
  const routingConfig = useAppStore(state => state.routingConfig);

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

  const handleSuggestTags = async () => {
    setIsSuggestingTags(true);
    setTagSuggestionError(null);
    try {
      const suggestions = await suggestTagsStub({ premise, genrePath: genre } as any);
      void routingConfig;
      setTagSuggestions(suggestions);
    } catch (suggestionError: any) {
      console.error('Error fetching recommended tags:', suggestionError);
      setTagSuggestionError(suggestionError.message || 'Failed to contact the celestial scribe. Please try again.');
    } finally {
      setIsSuggestingTags(false);
    }
  };

  const familyTags = activeTagFamily
    ? Array.from(new Set(CATEGORIZED_TAGS[activeTagFamily] || [])).filter(tag =>
      tag.toLowerCase().includes(tagSearch.toLowerCase()),
    )
    : [];
  const originComplete = Boolean(selectedStyle && genre.trim() && premise.trim());

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
          <p id="origin-style-title" className={workspaceCompactLabelClass}>Style <span className="text-human">*</span></p>
          <span className="font-sans text-[11px] text-neutral-500">Novel tradition</span>
        </div>
        <div role="radiogroup" aria-label="Novel tradition" id="story-style-options" className="grid grid-cols-3 gap-2">
          {STORY_STYLE_OPTIONS.map(option => {
            const selected = selectedStyle === option.value;
            const { icon: Icon, accent } = STYLE_PRESENTATION[option.value];
            return (
              <button key={option.value} type="button" role="radio" aria-checked={selected} id={`story-style-${option.value}`}
                onClick={() => updateSeed(patchStoryRequired({ style: option.value }))} data-selected={selected}
                style={{ '--choice-accent': accent } as React.CSSProperties}
                className="glass-choice flex min-h-[4.4rem] flex-col items-center justify-center gap-1.5 px-2 py-2">
                <Icon size={16} aria-hidden="true" className="glass-choice-icon" />
                <span className={`flex items-center gap-1 font-sc text-[10px] font-bold uppercase tracking-[0.1em] ${selected ? 'text-signal' : 'text-neutral-300'}`}>
                  {selected && <Check size={11} aria-hidden="true" style={{ color: accent }} />}{option.label}
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

      <section className="glass-panel p-4" aria-labelledby="origin-genre-title">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p id="origin-genre-title" className={workspaceCompactLabelClass}>Genre <span className="text-human">*</span></p>
          <button type="button" aria-expanded={isGenrePickerOpen} aria-controls="origin-genre-presets" onClick={() => setIsGenrePickerOpen(open => !open)}
            className="inline-flex items-center gap-1 font-sc text-[10px] font-bold uppercase tracking-widest text-portal transition-colors hover:text-signal">
            {isGenrePickerOpen ? 'Close paths' : 'Pick a path'}<ChevronDown size={13} className={isGenrePickerOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
        </div>
        <LibraryTextBox id="genre-custom-input" size="compact" value={genre} onChange={value => updateSeed(patchStoryRequired({ genre: value }))}
          placeholder="Choose or define a genre..." aria-label="Genre path" />
        <AnimatePresence initial={false}>
          {isGenrePickerOpen && (
            <motion.div id="origin-genre-presets" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {GENRE_PRESETS.map(preset => {
                  const selected = genre.trim() === preset.id;
                  return (
                    <button key={preset.id} type="button" onClick={() => updateSeed(patchStoryRequired({ genre: preset.id }))} aria-pressed={selected}
                      className={`min-h-[2.75rem] rounded-lg border px-2 py-1.5 text-left font-sans text-xs transition-all ${selected ? 'border-portal bg-portal/10 font-semibold text-signal' : 'border-neutral-800/80 bg-neutral-950/50 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'}`}>
                      <span aria-hidden="true" className="mr-1">{preset.icon}</span>{preset.name}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="glass-panel space-y-4 p-4 sm:p-5" aria-labelledby="origin-tags-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p id="origin-tags-title" className="flex items-center gap-2 font-sc text-[11px] font-bold uppercase tracking-widest text-signal"><Tag size={13} className="text-portal" aria-hidden="true" />Story Tags</p>
            <p className="mt-1 font-sans text-xs text-neutral-500">Optional — inferred from your origin if left empty.</p>
          </div>
          <button type="button" onClick={handleSuggestTags} disabled={isSuggestingTags}
            className="inline-flex min-h-[2.25rem] items-center gap-1.5 rounded border border-neutral-800 px-2.5 py-1 font-sc text-[10px] uppercase tracking-widest text-neutral-300 transition-colors hover:border-portal/50 hover:text-portal disabled:pointer-events-none disabled:opacity-50">
            <RefreshCw size={11} className={isSuggestingTags ? 'animate-spin' : ''} />{isSuggestingTags ? 'Channeling...' : tagSuggestions ? 'Refresh ideas' : 'Suggest tags'}
          </button>
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

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className={workspaceCompactLabelClass}>Your tags ({storyTags.length} / {TAG_LIMIT})</p>
            {storyTags.length > 0 && <button type="button" onClick={() => updateSeed(updateStoryTags(() => []))} className="font-sc text-[10px] uppercase tracking-widest text-neutral-500 transition-colors hover:text-red-400">Clear all</button>}
          </div>
          {storyTags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {storyTags.map(tag => <span key={tag} className="glass-chip animate-fadeIn px-2.5 py-1 font-sans text-xs"><span className="font-semibold">{tag}</span><button type="button" onClick={() => toggleTag(tag)} aria-label={`Remove tag ${tag}`} className="text-neutral-500 transition-colors hover:text-signal"><X size={12} /></button></span>)}
            </div>
          ) : <p className="font-sans text-xs italic leading-relaxed text-neutral-600">No manual tags yet. Your origin will provide them when you forge the blueprint.</p>}
        </div>

        <AnimatePresence initial={false}>
          {tagSuggestions && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="border-t border-neutral-800/80 pt-3">
              {tagSuggestions.reasoning && <p className="mb-2 border-l border-neutral-700 pl-2 font-sans text-xs italic text-neutral-400">&ldquo;{tagSuggestions.reasoning}&rdquo;</p>}
              <div className="flex flex-wrap gap-1.5">
                {tagSuggestions.suggestedTags.map(tag => {
                  const selected = storyTags.includes(tag);
                  return <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`rounded-lg border px-2.5 py-1 font-sans text-xs transition-all ${selected ? 'border-portal bg-neutral-900 font-semibold text-portal' : 'border-neutral-800/70 bg-[#0b0e1e]/50 text-neutral-400 hover:border-neutral-700 hover:text-signal'}`}>{selected ? '✓' : '+'} {tag}</button>;
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {tagSuggestionError && <p role="alert" className="font-sans text-xs text-red-400">{tagSuggestionError}</p>}

        <div className="border-t border-neutral-800/80 pt-4">
          <p className={workspaceCompactLabelClass}>Tag families</p>
          <div className="flex flex-wrap gap-1.5" id="tag-categories">
            {Object.keys(CATEGORIZED_TAGS).map(family => {
              const isOpen = activeTagFamily === family;
              return (
                <button key={family} type="button" aria-expanded={isOpen} aria-controls="origin-family-tags" onClick={() => { setActiveTagFamily(current => current === family ? null : family); setTagSearch(''); }}
                  className={`inline-flex min-h-[2.25rem] items-center gap-1 rounded-full border px-3 py-1 font-sc text-[10px] font-bold uppercase tracking-[0.14em] transition-all ${isOpen ? 'border-portal/60 bg-portal/10 text-portal shadow-[0_0_10px_rgba(4,172,255,0.18)]' : 'border-[rgba(150,166,220,0.22)] bg-[#0d1126]/60 text-neutral-300 hover:border-[rgba(150,166,220,0.45)] hover:text-signal'}`}>
                  {family}<ChevronDown size={12} className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                </button>
              );
            })}
          </div>
          <AnimatePresence initial={false}>
            {activeTagFamily ? (
              <motion.div id="origin-family-tags" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                <div className="mb-2 w-full sm:max-w-xs"><LibraryTextBox id="celestial-tag-search-input" size="compact" icon={Search} value={tagSearch} onChange={setTagSearch} placeholder={`Search ${activeTagFamily}...`} aria-label={`Search ${activeTagFamily} tags`} /></div>
                <div className="glass-panel scrollbar-thin flex max-h-52 flex-wrap content-start gap-1.5 overflow-y-auto p-3" id="filtered-tags-list">
                  {familyTags.length === 0 ? <p className="w-full py-3 text-center font-sans text-xs italic text-neutral-600">No tags match this family.</p> : familyTags.map(tag => {
                    const selected = storyTags.includes(tag);
                    return <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`rounded-lg border px-2.5 py-1 text-xs transition-all ${selected ? 'border-portal bg-neutral-900 font-semibold text-portal shadow-[0_0_8px_rgba(4,172,255,0.15)]' : 'border-neutral-800/70 bg-[#0b0e1e]/50 text-neutral-400 hover:border-neutral-700 hover:text-signal'}`}>{selected ? '✓' : '+'} {tag}</button>;
                  })}
                </div>
              </motion.div>
            ) : <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 font-sans text-xs italic text-neutral-600">Choose a family to reveal its tags.</motion.p>}
          </AnimatePresence>
        </div>
      </section>

      <GuidanceNote title="One origin, four signals">Style leads the way; Premise turns it into a hook; Genre sets the shelf; Story Tags sharpen the details the Library should protect.</GuidanceNote>
    </WorkspaceShell>
  );
};
