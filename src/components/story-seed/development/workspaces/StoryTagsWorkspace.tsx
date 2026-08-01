import React, { useState } from 'react';
import { RefreshCw, Search, Wand2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { IntakeData } from '../../shared/types';
import { CATEGORIZED_TAGS, TAG_PRESETS } from '../constants';
import { suggestTagsStub, useAppStore } from '../../shared/stubs';
import { getSeedSection } from '../seedSections';
import { GuidanceNote, WorkspaceShell, workspaceInputClass } from './WorkspaceShell';

interface StoryTagsWorkspaceProps {
  intake: IntakeData;
  updateIntake: (field: keyof IntakeData, value: any) => void;
}

const TAG_LIMIT = 20;
const TAG_LIMIT_MESSAGE = `Fated limit reached. Only up to ${TAG_LIMIT} celestial tags can be woven into the universe.`;

/**
 * Required Story workspace: the tag editor. Add custom tags, take AI-style
 * suggestions (Workshop stub), or browse the full preset grimoire. Ported from
 * the Phase 1 CoreSeedForm tag block; DOM ids are kept so Workshop preview
 * scripting keeps working.
 */
export const StoryTagsWorkspace = ({ intake, updateIntake }: StoryTagsWorkspaceProps) => {
  const section = getSeedSection('story-tags');
  // Production reads `routingConfig.storyMaker` and forwards it in the
  // `/api/suggest-tags` request body. The Workshop never makes that network
  // call (see `suggestTagsStub` in shared/stubs.ts) — `routingConfig` is kept
  // here only so this line stays a faithful copy of the store read.
  const routingConfig = useAppStore(state => state.routingConfig);
  const [customTagInput, setCustomTagInput] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [tagSearch, setTagSearch] = useState<string>('');
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState<{ suggestedTags: string[]; reasoning: string } | null>(null);
  const [tagSuggestionError, setTagSuggestionError] = useState<string | null>(null);
  const [tagLimitError, setTagLimitError] = useState<string | null>(null);

  const activeTags = intake.storyTags || [];

  const handleSuggestTags = async () => {
    setIsSuggestingTags(true);
    setTagSuggestionError(null);
    try {
      // Workshop replica: production POSTs to `/api/suggest-tags` here. That
      // network call is intentionally excluded — `suggestTagsStub` returns a
      // canned, genre-aware response instead. See shared/stubs.ts and the
      // feature README's "What was mocked" section.
      const resData = await suggestTagsStub({
        premise: intake.corePremise,
        genrePath: intake.genrePath,
      } as any);
      void routingConfig;
      setTagSuggestions(resData);
    } catch (err: any) {
      console.error('Error fetching recommended tags:', err);
      setTagSuggestionError(err.message || 'Failed to contact the celestial scribe. Please try again.');
    } finally {
      setIsSuggestingTags(false);
    }
  };

  const handleTogglePresetTag = (tag: string) => {
    if (activeTags.includes(tag)) {
      setTagLimitError(null);
      updateIntake('storyTags', (previous: string[] = []) => previous.filter(t => t !== tag));
    } else {
      if (activeTags.length >= TAG_LIMIT) {
        setTagLimitError(TAG_LIMIT_MESSAGE);
        return;
      }
      setTagLimitError(null);
      updateIntake('storyTags', (previous: string[] = []) =>
        previous.includes(tag) ? previous : [...previous, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim().replace(/^,|,$/g, '');
    if (!trimmed) return;
    if (activeTags.length >= TAG_LIMIT) {
      setTagLimitError(TAG_LIMIT_MESSAGE);
      return;
    }
    setTagLimitError(null);
    updateIntake('storyTags', (previous: string[] = []) =>
      previous.some(t => t.toLowerCase() === trimmed.toLowerCase()) ? previous : [...previous, trimmed]);
    setCustomTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTagLimitError(null);
    updateIntake('storyTags', (previous: string[] = []) => previous.filter(t => t !== tag));
  };

  const filteredPresets = Array.from(new Set(
    activeCategory === 'All'
      ? TAG_PRESETS
      : CATEGORIZED_TAGS[activeCategory] || []
  )).filter(tag =>
    tag.toLowerCase().includes(tagSearch.toLowerCase())
  );

  return (
    <WorkspaceShell section={section} complete={activeTags.length > 0}>
      {/* Add a tag */}
      <div>
        <label htmlFor="custom-tag-input" className="sr-only">Add a custom tag</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="custom-tag-input"
            type="text"
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomTag();
              }
            }}
            placeholder="Type a tag and press Enter..."
            className={`${workspaceInputClass} flex-1`}
          />
          <button
            type="button"
            onClick={handleAddCustomTag}
            className="rounded border border-portal/50 bg-portal/10 px-5 py-2 font-sc text-xs font-bold uppercase tracking-widest text-portal transition-colors hover:border-portal hover:bg-portal/20"
          >
            Add Tag
          </button>
        </div>
      </div>

      <AnimatePresence>
        {tagLimitError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1.5 rounded border border-[#8B0000]/30 bg-[#8B0000]/10 px-3 py-2 font-sans text-xs text-red-400"
            id="tag-limit-error"
          >
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#8B0000]" />
            {tagLimitError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current tags */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="font-sc text-[10px] uppercase tracking-widest text-neutral-400">
            Your Tags ({activeTags.length} / {TAG_LIMIT})
          </span>
          {activeTags.length > 0 && (
            <button
              type="button"
              onClick={() => updateIntake('storyTags', [])}
              className="font-sc text-[10px] uppercase tracking-widest text-neutral-500 transition-colors hover:text-red-400"
            >
              Clear All
            </button>
          )}
        </div>
        {activeTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {activeTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex animate-fadeIn items-center gap-1.5 rounded border border-portal/30 bg-portal/10 px-2.5 py-1 font-sans text-xs text-portal shadow-[0_0_8px_rgba(4,172,255,0.05)]"
              >
                <span className="font-semibold">{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`Remove tag ${tag}`}
                  className="text-neutral-500 transition-colors hover:text-signal focus:outline-none"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="rounded border border-dashed border-neutral-800 px-3 py-4 text-center font-sans text-xs italic text-neutral-600">
            No tags yet — Story Tags are required before generation. Add your own, take a suggestion, or browse the library below.
          </p>
        )}
      </div>

      {/* Suggested tags */}
      <div className="rounded-lg border border-neutral-900 bg-neutral-950/50 p-4">
        <div className="flex items-center justify-between gap-3 pb-3">
          <span className="flex items-center gap-2 font-sc text-[11px] font-bold uppercase tracking-widest text-signal">
            <Wand2 size={13} className="text-portal" />
            Suggested Tags
          </span>
          <button
            type="button"
            onClick={handleSuggestTags}
            disabled={isSuggestingTags}
            className="flex items-center gap-1.5 rounded border border-neutral-800 px-2.5 py-1 font-sc text-[10px] uppercase tracking-widest text-neutral-300 transition-colors hover:border-portal/50 hover:text-portal disabled:pointer-events-none disabled:opacity-50"
          >
            <RefreshCw size={11} className={isSuggestingTags ? 'animate-spin' : ''} />
            {isSuggestingTags ? 'Channeling...' : tagSuggestions ? 'Refresh' : 'Suggest'}
          </button>
        </div>

        {tagSuggestionError && (
          <p className="pb-2 font-sans text-xs text-red-400">{tagSuggestionError}</p>
        )}

        {tagSuggestions ? (
          <div className="space-y-2.5">
            {tagSuggestions.reasoning && (
              <p className="border-l border-neutral-800 pl-2 font-sans text-xs italic text-neutral-400">
                &ldquo;{tagSuggestions.reasoning}&rdquo;
              </p>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              {tagSuggestions.suggestedTags && tagSuggestions.suggestedTags.length > 0 ? (
                tagSuggestions.suggestedTags.map((tag) => {
                  const isSelected = activeTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTogglePresetTag(tag)}
                      className={`flex items-center gap-1 rounded border px-2.5 py-1 font-sans text-xs transition-all duration-300 ${
                        isSelected
                          ? 'border-portal bg-neutral-900 font-semibold text-portal shadow-[0_0_8px_rgba(4,172,255,0.15)]'
                          : 'border-neutral-900 bg-void text-neutral-400 hover:border-neutral-800 hover:text-signal'
                      }`}
                    >
                      {isSelected ? '✓' : '+'} {tag}
                    </button>
                  );
                })
              ) : (
                <span className="font-sans text-xs italic text-neutral-600">
                  Precept alignment could not extract custom matches automatically.
                </span>
              )}
            </div>
          </div>
        ) : (
          !tagSuggestionError && (
            <p className="font-sans text-xs text-neutral-600">
              Suggestions read your premise and genre. Write a premise first for sharper recommendations.
            </p>
          )
        )}
      </div>

      {/* Browse the tag library */}
      <div className="space-y-4 rounded-lg border border-neutral-900 bg-neutral-950/50 p-4">
        <div className="flex flex-col justify-between gap-3 border-b border-neutral-900 pb-3 sm:flex-row sm:items-center">
          <div className="flex items-center space-x-2">
            <span className="font-sc text-[11px] font-bold uppercase tracking-widest text-signal">Tag Library</span>
            <span className="rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 font-mono text-[10px] text-neutral-400">
              {filteredPresets.length} / {TAG_PRESETS.length}
            </span>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
            <input
              type="text"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              placeholder="Filter celestial tags..."
              className={`${workspaceInputClass} pl-8`}
              id="celestial-tag-search-input"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1" id="tag-categories">
          {['All', ...Object.keys(CATEGORIZED_TAGS)].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded border px-2.5 py-1 font-sans text-[10px] font-medium uppercase tracking-wider transition-all ${
                activeCategory === cat
                  ? 'border-portal bg-portal/10 font-bold text-portal shadow-[0_0_8px_rgba(4,172,255,0.15)]'
                  : 'border-neutral-900 bg-void text-neutral-500 hover:border-neutral-850 hover:text-neutral-350'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="scrollbar-thin flex max-h-56 flex-wrap gap-1.5 overflow-y-auto pr-1" id="filtered-tags-list">
          {filteredPresets.length === 0 ? (
            <div className="w-full py-4 text-center font-sans text-xs italic text-neutral-600">
              No celestial tag matches your search within this category.
            </div>
          ) : (
            filteredPresets.map((preset) => {
              const isSelected = activeTags.includes(preset);
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleTogglePresetTag(preset)}
                  className={`rounded border px-2.5 py-1 text-xs transition-all duration-300 ${
                    isSelected
                      ? 'border-portal bg-neutral-900 font-semibold text-portal shadow-[0_0_8px_rgba(4,172,255,0.15)]'
                      : 'border-neutral-900 bg-void text-neutral-400 hover:border-neutral-800 hover:text-signal'
                  }`}
                >
                  {isSelected ? '✓' : '+'} {preset}
                </button>
              );
            })
          )}
        </div>
      </div>

      <GuidanceNote title="How tags help">
        Tags guide the Library to tailor the world, characters, conflicts, and events to match the themes and tones you care about most.
      </GuidanceNote>
    </WorkspaceShell>
  );
};
