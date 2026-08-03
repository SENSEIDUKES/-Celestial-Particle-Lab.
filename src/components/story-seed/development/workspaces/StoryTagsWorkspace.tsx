import React, { useState } from 'react';
import { RefreshCw, Search, Tag, Wand2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { StorySeedInput } from '../../shared/storySeedSchema';
import { CATEGORIZED_TAGS, TAG_PRESETS } from '../constants';
import { suggestTagsStub, useAppStore } from '../../shared/stubs';
import { getSeedSection } from '../seedSections';
import { storyRequired, updateStoryTags, type UpdateSeed } from '../seedState';
import { LibraryTextBox } from '../form-fields';
import { GuidanceNote, WorkspaceShell, workspaceCompactLabelClass } from './WorkspaceShell';

interface StoryTagsWorkspaceProps {
  seed: StorySeedInput;
  updateSeed: UpdateSeed;
}

const TAG_LIMIT = 20;
const TAG_LIMIT_MESSAGE = `Fated limit reached. Only up to ${TAG_LIMIT} celestial tags can be woven into the universe.`;

/**
 * The tag editor for `story.required.storyTags`. Story Tags are one of the
 * four required Story inputs of the Story Seed contract, but they are never
 * required *by hand* — an empty set is inferred from Premise, Genre, and Style
 * at generation time (`shared/storyTagInference.ts`) and saved with the seed.
 * Manual tags are always preserved as-is. DOM ids are kept so Workshop preview
 * scripting keeps working.
 */
export const StoryTagsWorkspace = ({ seed, updateSeed }: StoryTagsWorkspaceProps) => {
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

  const activeTags = storyRequired(seed).storyTags;

  const handleSuggestTags = async () => {
    setIsSuggestingTags(true);
    setTagSuggestionError(null);
    try {
      // Workshop replica: production POSTs to `/api/suggest-tags` here. That
      // network call is intentionally excluded — `suggestTagsStub` returns a
      // canned, genre-aware response instead. See shared/stubs.ts and the
      // feature README's "What was mocked" section.
      const resData = await suggestTagsStub({
        premise: storyRequired(seed).premise,
        genrePath: storyRequired(seed).genre,
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
      updateSeed(updateStoryTags(previous => previous.filter(t => t !== tag)));
    } else {
      if (activeTags.length >= TAG_LIMIT) {
        setTagLimitError(TAG_LIMIT_MESSAGE);
        return;
      }
      setTagLimitError(null);
      updateSeed(updateStoryTags(previous => previous.includes(tag) ? previous : [...previous, tag]));
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
    updateSeed(updateStoryTags(previous =>
      previous.some(t => t.toLowerCase() === trimmed.toLowerCase()) ? previous : [...previous, trimmed]));
    setCustomTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTagLimitError(null);
    updateSeed(updateStoryTags(previous => previous.filter(t => t !== tag)));
  };

  const filteredPresets = Array.from(new Set(
    activeCategory === 'All'
      ? TAG_PRESETS
      : CATEGORIZED_TAGS[activeCategory] || []
  )).filter(tag =>
    tag.toLowerCase().includes(tagSearch.toLowerCase())
  );

  return (
    <WorkspaceShell
      section={section}
      complete={activeTags.length > 0}
      optionalNote="Automatically generated if left empty"
    >
      {/* Add a tag */}
      <div>
        <label htmlFor="custom-tag-input" className="sr-only">Add a custom tag</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <LibraryTextBox
              id="custom-tag-input"
              icon={Tag}
              value={customTagInput}
              onChange={(val) => setCustomTagInput(val)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomTag();
                }
              }}
              placeholder="Type a tag and press Enter..."
            />
          </div>
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
              onClick={() => updateSeed(updateStoryTags(() => []))}
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
                className="glass-chip animate-fadeIn px-2.5 py-1 font-sans text-xs"
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
          <p className="font-sans text-xs italic leading-relaxed text-neutral-600">
            No tags yet. The Library will read your Premise, Genre, and Style and generate a tag set
            when you forge the blueprint — or add your own here to steer it.
          </p>
        )}
      </div>

      {/* Suggested tags */}
      <div className="border-t border-neutral-900/70 pt-6">
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
                      className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 font-sans text-xs transition-all duration-300 ${
                        isSelected
                          ? 'border-portal bg-neutral-900 font-semibold text-portal shadow-[0_0_8px_rgba(4,172,255,0.15)]'
                          : 'border-neutral-800/70 bg-[#0b0e1e]/50 text-neutral-400 hover:border-neutral-700 hover:text-signal'
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
      <div className="space-y-4 border-t border-neutral-900/70 pt-6">
        <div className="flex flex-col justify-between gap-3 pb-1 sm:flex-row sm:items-center">
          <div className="flex items-center space-x-2">
            <span className="font-sc text-[11px] font-bold uppercase tracking-widest text-signal">Tag Library</span>
            <span className="rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 font-mono text-[10px] text-neutral-400">
              {filteredPresets.length} / {TAG_PRESETS.length}
            </span>
          </div>
          <div className="w-full sm:max-w-xs">
            <LibraryTextBox
              id="celestial-tag-search-input"
              icon={Search}
              value={tagSearch}
              onChange={(val) => setTagSearch(val)}
              placeholder="Filter celestial tags..."
              aria-label="Filter celestial tags"
            />
          </div>
        </div>

        {/* Parent families read as filter tabs — pill-shaped, small-caps
            serif, brighter edge — so they can never be mistaken for the
            child tag chips listed below them. */}
        <div className="space-y-2">
          <p className={workspaceCompactLabelClass}>Families</p>
          <div className="flex flex-wrap gap-1.5" id="tag-categories">
            {['All', ...Object.keys(CATEGORIZED_TAGS)].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full border px-3 py-1.5 font-sc text-[10px] font-bold uppercase tracking-[0.18em] transition-all ${
                  activeCategory === cat
                    ? 'border-portal/60 bg-portal/10 text-portal shadow-[0_0_10px_rgba(4,172,255,0.18)]'
                    : 'border-[rgba(150,166,220,0.22)] bg-[#0d1126]/60 text-neutral-300 hover:border-[rgba(150,166,220,0.45)] hover:text-signal'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Child tags live inside their own glass panel under the tabs. */}
        <div className="space-y-2">
          <p className={workspaceCompactLabelClass}>Tags</p>
          <div className="glass-panel scrollbar-thin flex max-h-56 flex-wrap content-start gap-1.5 overflow-y-auto p-3" id="filtered-tags-list">
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
                  className={`rounded-lg border px-2.5 py-1 text-xs transition-all duration-300 ${
                    isSelected
                      ? 'border-portal bg-neutral-900 font-semibold text-portal shadow-[0_0_8px_rgba(4,172,255,0.15)]'
                      : 'border-neutral-800/70 bg-[#0b0e1e]/50 text-neutral-400 hover:border-neutral-700 hover:text-signal'
                  }`}
                >
                  {isSelected ? '✓' : '+'} {preset}
                </button>
              );
            })
          )}
          </div>
        </div>
      </div>

      <GuidanceNote title="How tags help">
        Tags guide the Library to tailor the world, characters, conflicts, and events to match the
        themes and tones you care about most. Leave them empty and a set is generated from your
        Premise, Genre, and Style — then saved into the seed so the novel can always be recreated.
      </GuidanceNote>
    </WorkspaceShell>
  );
};
