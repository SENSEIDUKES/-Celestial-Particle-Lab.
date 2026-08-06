import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  FileText,
  GitBranch,
  HelpCircle,
  Layers,
  MapPin,
  Target,
  Users,
  Wand2,
  Zap,
} from 'lucide-react';
import type { WorldBlueprint, WorldBlueprintMainCharacter } from '../shared/types';
import {
  STORY_PREMISE_MAX_LENGTH,
  STORY_TAG_LIMIT,
  type StorySeedInput,
  type StorySeedStoryRequired,
} from '../shared/storySeedSchema';
import { getStoryStyleLabel, STORY_STYLE_OPTIONS, type StoryStyle } from '../shared/storyStyle';
import { AGENTS, useAppStore } from '../shared/stubs';
import { patchStoryRequired, patchWorldIdentity, type UpdateSeed } from './seedState';

interface BlueprintReviewProps {
  blueprint: WorldBlueprint;
  setBlueprint: React.Dispatch<React.SetStateAction<WorldBlueprint>>;
  seed: StorySeedInput;
  updateSeed: UpdateSeed;
  onBack: () => void;
  onStartStory: () => void;
  onExportSeed: () => void;
  isGenerating: boolean;
}

interface EditableLabelProps {
  htmlFor: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

const EditableLabel = ({ htmlFor, children, icon: Icon }: EditableLabelProps) => (
  <div className="mb-2 flex items-center justify-between gap-3">
    <label
      className="flex items-center gap-2 font-sc text-xs font-bold uppercase tracking-widest text-signal"
      htmlFor={htmlFor}
    >
      {Icon && <Icon size={14} className="text-portal" />}
      <span>{children}</span>
    </label>
    <span className="shrink-0 font-mono text-[9px] text-portal">Editable</span>
  </div>
);

const SectionHeading = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <h2 id={id} className="border-b border-neutral-900 pb-2 font-sc text-sm font-bold uppercase tracking-[0.18em] text-portal">
    {children}
  </h2>
);

const fieldClassName = 'w-full rounded-md border border-neutral-900 bg-void p-3 font-sans text-sm text-neutral-300 transition-all focus:border-portal focus:outline-none focus:ring-1 focus:ring-portal/20';
const compactFieldClassName = `${fieldClassName} text-xs`;

const formatDate = (value: string): string => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
};

const markdownList = (items: string[]): string => {
  const cleanItems = items.map(item => item.trim()).filter(Boolean);
  return cleanItems.length > 0
    ? cleanItems.map(item => `- ${item}`).join('\n')
    : '_None yet_';
};

export const BlueprintReview = ({
  blueprint,
  setBlueprint,
  seed,
  updateSeed,
  onBack,
  onStartStory,
  onExportSeed,
  isGenerating,
}: BlueprintReviewProps) => {
  const activeAgentId = useAppStore(state => state.activeAgentId);
  const [copied, setCopied] = useState(false);
  const [tagLimitError, setTagLimitError] = useState<string | null>(null);
  const origin = seed.story.required;
  const storyTagCount = new Set(origin.storyTags.map(tag => tag.trim()).filter(Boolean)).size;
  const styleLabel = getStoryStyleLabel(origin.style) || origin.style;
  const mainCharacter: WorldBlueprintMainCharacter = {
    name: blueprint.mainCharacter?.name || '',
    age: blueprint.mainCharacter?.age || '',
    personality: blueprint.mainCharacter?.personality || '',
    appearance: blueprint.mainCharacter?.appearance || '',
    backgroundProfile: blueprint.mainCharacter?.backgroundProfile || blueprint.mcProfile || '',
  };

  const updateOrigin = (patch: Partial<StorySeedStoryRequired>) => {
    updateSeed(patchStoryRequired(patch));
    setBlueprint(current => ({
      ...current,
      originSnapshot: { ...origin, ...current.originSnapshot, ...patch },
    }));
  };

  const updateTitle = (title: string) => {
    updateSeed(patchWorldIdentity({ title }));
    setBlueprint(current => ({ ...current, title }));
  };

  const updateStoryTags = (value: string) => {
    const storyTags = value.split(/\r?\n|,/);
    const uniqueTagCount = new Set(storyTags.map(tag => tag.trim()).filter(Boolean)).size;
    setTagLimitError(uniqueTagCount > STORY_TAG_LIMIT
      ? `Story Tags cannot exceed ${STORY_TAG_LIMIT}.`
      : null);
    updateOrigin({ storyTags });
  };

  const updateMainCharacter = (patch: Partial<WorldBlueprintMainCharacter>) => {
    setBlueprint(current => {
      const currentMainCharacter: WorldBlueprintMainCharacter = {
        name: current.mainCharacter?.name || '',
        age: current.mainCharacter?.age || '',
        personality: current.mainCharacter?.personality || '',
        appearance: current.mainCharacter?.appearance || '',
        backgroundProfile: current.mainCharacter?.backgroundProfile || current.mcProfile || '',
      };
      const nextMainCharacter = { ...currentMainCharacter, ...patch };
      return {
        ...current,
        mainCharacter: nextMainCharacter,
        // Keep the established combined field synchronized for existing
        // initial-story generation consumers.
        mcProfile: nextMainCharacter.backgroundProfile,
      };
    });
  };

  const handleCopyBlueprint = () => {
    const metadata = [
      `**Blueprint Version:** ${blueprint.blueprintVersion || 'v1.0'}`,
      blueprint.creator ? `**Creator:** ${blueprint.creator}` : '',
      blueprint.status ? `**Status:** ${blueprint.status}` : '',
      blueprint.createdAt ? `**Created:** ${formatDate(blueprint.createdAt)}` : '',
      blueprint.updatedAt ? `**Updated:** ${formatDate(blueprint.updatedAt)}` : '',
    ].filter(Boolean).join('\n');
    const textToCopy = `
# ${blueprint.title || 'Untitled Story'}

${metadata}

## Origin Snapshot

### Core Premise / Secret Catalyst (User-Created Origin)
${origin.premise || ''}

**Genre:** ${origin.genre || ''}

**Style / Novel Tradition:** ${styleLabel || ''}

### Story Tags
${markdownList(origin.storyTags)}

## Main Character

**Name:** ${mainCharacter.name}

**Age:** ${mainCharacter.age}

### Personality
${mainCharacter.personality}

### Appearance
${mainCharacter.appearance}

### Background / Profile
${mainCharacter.backgroundProfile}

## World Setting

### World Overview
${blueprint.worldOverview || ''}

### Opening Location
${blueprint.startingLocation || ''}

### World Order
${blueprint.societyStructure || ''}

### Power System Outline
${blueprint.powerSystemOutline || ''}

## Overall Story Direction

### Overall / Core Story Direction
${blueprint.logline || ''}

### First Arc Promise
${blueprint.firstArcPromise || ''}

### Destined Ending
${blueprint.destinedEnding || ''}

### Trope Guidance / Story Direction
${blueprint.tropeRules || ''}

**Estimated Arcs:** ${blueprint.estimatedArcs || ''}

### Generated Style Bible
${blueprint.styleBible || ''}

## Side Characters
${markdownList(blueprint.initialCharacters || [])}

## Factions
${markdownList(blueprint.majorFactions || [])}

## Major Mysteries
${markdownList(blueprint.majorMysteries || [])}

## Unresolved Plot Threads
${markdownList(blueprint.unresolvedPlotThreads || [])}
`.trim();

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mx-auto max-w-4xl pb-20" id="creation-portal-root">
      <header className="mb-10 space-y-4 text-center">
        <span className="block font-sc text-xs uppercase tracking-[0.2em] text-portal">World Blueprint</span>

        <div className="mx-auto max-w-2xl space-y-3">
          <div>
            <label className="mb-1 block font-sc text-[10px] uppercase tracking-widest text-portal" htmlFor="blueprint-story-title">
              Story Title
            </label>
            <input
              id="blueprint-story-title"
              type="text"
              value={blueprint.title || ''}
              onChange={(event) => updateTitle(event.target.value)}
              className="w-full rounded-md border border-neutral-900 bg-void px-4 py-2 text-center font-display text-2xl font-bold text-signal transition-all focus:border-portal focus:outline-none focus:ring-1 focus:ring-portal/20 sm:text-3xl"
              placeholder="Give your story a title"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
            <span className="rounded-full border border-portal/30 bg-portal/5 px-3 py-1 text-portal">
              {blueprint.blueprintVersion || 'v1.0'}
            </span>
            {blueprint.creator && <span>Creator: {blueprint.creator}</span>}
            {blueprint.status && <span>Status: {blueprint.status}</span>}
            {blueprint.createdAt && <span>Created: {formatDate(blueprint.createdAt)}</span>}
            {blueprint.updatedAt && <span>Updated: {formatDate(blueprint.updatedAt)}</span>}
          </div>
        </div>
      </header>

      <div className="relative space-y-10 rounded-lg border border-portal/30 bg-neutral-950/80 p-6 shadow-[0_0_30px_rgba(4,172,255,0.05)] sm:p-10">
        <section aria-labelledby="blueprint-origin-heading" className="space-y-5">
          <div>
            <SectionHeading id="blueprint-origin-heading">Origin Snapshot</SectionHeading>
            <p className="mt-2 font-sans text-xs leading-relaxed text-neutral-500">
              Creator-authored Origin inputs. Changes here update the same Story Seed values used for generation.
            </p>
          </div>

          <div>
            <EditableLabel htmlFor="blueprint-origin-premise">
              Core Premise / Secret Catalyst ({origin.premise.length} / {STORY_PREMISE_MAX_LENGTH})
            </EditableLabel>
            <textarea
              id="blueprint-origin-premise"
              value={origin.premise}
              onChange={(event) => updateOrigin({ premise: event.target.value })}
              maxLength={STORY_PREMISE_MAX_LENGTH}
              rows={4}
              className={`${fieldClassName} resize-y font-serif leading-relaxed text-[#dfd8cf]`}
              placeholder="The premise written in Origin..."
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <EditableLabel htmlFor="blueprint-origin-genre">Genre</EditableLabel>
              <input
                id="blueprint-origin-genre"
                type="text"
                value={origin.genre}
                onChange={(event) => updateOrigin({ genre: event.target.value })}
                className={compactFieldClassName}
                placeholder="e.g. Xianxia, LitRPG / System"
              />
            </div>

            <div>
              <EditableLabel htmlFor="blueprint-origin-style">Style / Novel Tradition</EditableLabel>
              <select
                id="blueprint-origin-style"
                value={origin.style}
                onChange={(event) => updateOrigin({ style: event.target.value as StoryStyle | '' })}
                className={compactFieldClassName}
              >
                <option value="">Choose a novel tradition</option>
                {STORY_STYLE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <EditableLabel htmlFor="blueprint-origin-tags">
              Story Tags ({storyTagCount} / {STORY_TAG_LIMIT})
            </EditableLabel>
            <textarea
              id="blueprint-origin-tags"
              value={origin.storyTags.join('\n')}
              onChange={(event) => updateStoryTags(event.target.value)}
              rows={3}
              className={`${compactFieldClassName} font-mono`}
              placeholder="One Story Tag per line"
            />
            {tagLimitError && (
              <p className="mt-2 font-sans text-xs text-red-300" role="alert">{tagLimitError}</p>
            )}
          </div>
        </section>

        <section aria-labelledby="blueprint-main-character-heading" className="space-y-5">
          <SectionHeading id="blueprint-main-character-heading">Main Character</SectionHeading>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <EditableLabel htmlFor="blueprint-mc-name" icon={Users}>Name</EditableLabel>
              <input
                id="blueprint-mc-name"
                type="text"
                value={mainCharacter.name}
                onChange={(event) => updateMainCharacter({ name: event.target.value })}
                className={compactFieldClassName}
                placeholder="Main character name"
              />
            </div>
            <div>
              <EditableLabel htmlFor="blueprint-mc-age">Age</EditableLabel>
              <input
                id="blueprint-mc-age"
                type="text"
                value={mainCharacter.age}
                onChange={(event) => updateMainCharacter({ age: event.target.value })}
                className={compactFieldClassName}
                placeholder="e.g. 18, Ancient, Unknown"
              />
            </div>
            <div>
              <EditableLabel htmlFor="blueprint-mc-personality">Personality</EditableLabel>
              <textarea
                id="blueprint-mc-personality"
                value={mainCharacter.personality}
                onChange={(event) => updateMainCharacter({ personality: event.target.value })}
                rows={4}
                className={fieldClassName}
                placeholder="Core temperament, values, contradictions..."
              />
            </div>
            <div>
              <EditableLabel htmlFor="blueprint-mc-appearance">Appearance</EditableLabel>
              <textarea
                id="blueprint-mc-appearance"
                value={mainCharacter.appearance}
                onChange={(event) => updateMainCharacter({ appearance: event.target.value })}
                rows={4}
                className={fieldClassName}
                placeholder="Physical appearance, clothing, distinctive features..."
              />
            </div>
          </div>
          <div>
            <EditableLabel htmlFor="blueprint-mc-profile" icon={FileText}>Background / Profile</EditableLabel>
            <textarea
              id="blueprint-mc-profile"
              value={mainCharacter.backgroundProfile}
              onChange={(event) => updateMainCharacter({ backgroundProfile: event.target.value })}
              rows={5}
              className={`${fieldClassName} leading-relaxed`}
              placeholder="Background, starting identity, flaws, gifts, and relevant history..."
            />
          </div>
        </section>

        <section aria-labelledby="blueprint-world-setting-heading" className="space-y-5">
          <SectionHeading id="blueprint-world-setting-heading">World Setting</SectionHeading>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <EditableLabel htmlFor="blueprint-world-overview">World Overview</EditableLabel>
              <textarea
                id="blueprint-world-overview"
                value={blueprint.worldOverview || ''}
                onChange={(event) => setBlueprint(current => ({ ...current, worldOverview: event.target.value }))}
                rows={6}
                className={`${fieldClassName} resize-y font-serif leading-relaxed text-[#dfd8cf]`}
                placeholder="The setting, lore, and physical characteristics of this universe..."
              />
            </div>
            <div>
              <EditableLabel htmlFor="blueprint-opening-location" icon={MapPin}>Opening Location</EditableLabel>
              <textarea
                id="blueprint-opening-location"
                value={blueprint.startingLocation || ''}
                onChange={(event) => setBlueprint(current => ({ ...current, startingLocation: event.target.value }))}
                rows={6}
                className={`${compactFieldClassName} resize-y leading-relaxed`}
                placeholder="Where the story begins..."
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <EditableLabel htmlFor="blueprint-world-order" icon={Layers}>World Order</EditableLabel>
              <textarea
                id="blueprint-world-order"
                value={blueprint.societyStructure || ''}
                onChange={(event) => setBlueprint(current => ({ ...current, societyStructure: event.target.value }))}
                rows={6}
                className={compactFieldClassName}
                placeholder="Feudal, corporate, sect-based, military rule..."
              />
            </div>
            <div>
              <EditableLabel htmlFor="blueprint-power-outline" icon={Zap}>Power System Outline</EditableLabel>
              <textarea
                id="blueprint-power-outline"
                value={blueprint.powerSystemOutline || ''}
                onChange={(event) => setBlueprint(current => ({ ...current, powerSystemOutline: event.target.value }))}
                rows={6}
                className={`${compactFieldClassName} font-mono leading-relaxed`}
                placeholder="Power scaling, ranks, costs, limits, magical energy..."
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="blueprint-direction-heading" className="space-y-5">
          <SectionHeading id="blueprint-direction-heading">Overall Story Direction</SectionHeading>
          <div>
            <EditableLabel htmlFor="blueprint-core-direction" icon={Target}>Overall / Core Story Direction</EditableLabel>
            <textarea
              id="blueprint-core-direction"
              value={blueprint.logline || ''}
              onChange={(event) => setBlueprint(current => ({ ...current, logline: event.target.value }))}
              rows={4}
              className={`${fieldClassName} leading-relaxed`}
              placeholder="The generated high-level direction for the complete story..."
            />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <EditableLabel htmlFor="blueprint-first-arc">First Arc Promise</EditableLabel>
              <textarea
                id="blueprint-first-arc"
                value={blueprint.firstArcPromise || ''}
                onChange={(event) => setBlueprint(current => ({ ...current, firstArcPromise: event.target.value }))}
                rows={5}
                className={`${fieldClassName} leading-relaxed`}
                placeholder="The opening conflict, stakes, and payoff promised by Arc One..."
              />
            </div>
            <div>
              <EditableLabel htmlFor="blueprint-destined-ending">Destined Ending</EditableLabel>
              <textarea
                id="blueprint-destined-ending"
                value={blueprint.destinedEnding || ''}
                onChange={(event) => setBlueprint(current => ({ ...current, destinedEnding: event.target.value }))}
                rows={5}
                className={`${fieldClassName} leading-relaxed`}
                placeholder="The intended fated destination of the story..."
              />
            </div>
            <div>
              <EditableLabel htmlFor="blueprint-trope-guidance" icon={Wand2}>Trope Guidance / Story Direction</EditableLabel>
              <textarea
                id="blueprint-trope-guidance"
                value={blueprint.tropeRules || ''}
                onChange={(event) => setBlueprint(current => ({ ...current, tropeRules: event.target.value }))}
                rows={5}
                className={compactFieldClassName}
                placeholder="Tropes to use or subvert, tone rules, and directional guardrails..."
              />
            </div>
            <div>
              <EditableLabel htmlFor="blueprint-style-bible" icon={FileText}>Generated Style Bible</EditableLabel>
              <textarea
                id="blueprint-style-bible"
                value={blueprint.styleBible || ''}
                onChange={(event) => setBlueprint(current => ({ ...current, styleBible: event.target.value }))}
                rows={5}
                className={`${compactFieldClassName} font-mono`}
                placeholder="Generated prose rules, forbidden phrasing, and tone requirements..."
              />
            </div>
          </div>
          <div className="max-w-xs">
            <EditableLabel htmlFor="blueprint-estimated-arcs">Estimated Arcs</EditableLabel>
            <input
              id="blueprint-estimated-arcs"
              type="number"
              value={blueprint.estimatedArcs || ''}
              onChange={(event) => {
                const rawValue = event.target.value.trim();
                const parsedValue = Number.parseInt(rawValue, 10);
                setBlueprint(current => ({
                  ...current,
                  estimatedArcs: rawValue === '' || Number.isNaN(parsedValue)
                    ? 0
                    : Math.min(100, Math.max(1, parsedValue)),
                }));
              }}
              className={`${compactFieldClassName} text-center font-mono`}
              placeholder="e.g. 5"
              min="1"
              max="100"
            />
          </div>
        </section>

        <section aria-labelledby="blueprint-side-characters-heading" className="space-y-4">
          <SectionHeading id="blueprint-side-characters-heading">Side Characters</SectionHeading>
          <EditableLabel htmlFor="blueprint-side-characters" icon={Users}>Side Characters (One per line)</EditableLabel>
          <textarea
            id="blueprint-side-characters"
            value={blueprint.initialCharacters?.join('\n') || ''}
            onChange={(event) => setBlueprint(current => ({ ...current, initialCharacters: event.target.value.split('\n') }))}
            rows={6}
            className={`${compactFieldClassName} font-mono`}
            placeholder="Elder Qin (Protector)&#10;Junior Sister Han (Ally)&#10;Young Master Ye (Rival)"
          />
        </section>

        <section aria-labelledby="blueprint-factions-heading" className="space-y-4">
          <SectionHeading id="blueprint-factions-heading">Factions</SectionHeading>
          <EditableLabel htmlFor="blueprint-factions" icon={Layers}>Major Factions (One per line)</EditableLabel>
          <textarea
            id="blueprint-factions"
            value={blueprint.majorFactions?.join('\n') || ''}
            onChange={(event) => setBlueprint(current => ({ ...current, majorFactions: event.target.value.split('\n') }))}
            rows={6}
            className={`${compactFieldClassName} font-mono`}
            placeholder="Heavenly Sword Sect&#10;Deep Sea Alliance&#10;Abyssal Cult"
          />
        </section>

        <section aria-labelledby="blueprint-mysteries-heading" className="space-y-5">
          <SectionHeading id="blueprint-mysteries-heading">Major Mysteries / Unresolved Plot Threads</SectionHeading>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <EditableLabel htmlFor="blueprint-major-mysteries" icon={HelpCircle}>Major Mysteries (One per line)</EditableLabel>
              <textarea
                id="blueprint-major-mysteries"
                value={blueprint.majorMysteries?.join('\n') || ''}
                onChange={(event) => setBlueprint(current => ({ ...current, majorMysteries: event.target.value.split('\n') }))}
                rows={6}
                className={`${compactFieldClassName} font-mono`}
                placeholder="True origin of the Sovereign Ring&#10;Why was the Sect Leader poisoned?"
              />
            </div>
            <div>
              <EditableLabel htmlFor="blueprint-unresolved-threads" icon={GitBranch}>Unresolved Plot Threads (One per line)</EditableLabel>
              <textarea
                id="blueprint-unresolved-threads"
                value={blueprint.unresolvedPlotThreads?.join('\n') || ''}
                onChange={(event) => setBlueprint(current => ({ ...current, unresolvedPlotThreads: event.target.value.split('\n') }))}
                rows={6}
                className={`${compactFieldClassName} font-mono`}
                placeholder="Sever the engagement with Chu family&#10;Win the Inner Sect tournament"
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-neutral-900 pt-6 xl:flex-row">
          <button
            type="button"
            onClick={onBack}
            disabled={isGenerating}
            className="font-sc text-xs uppercase tracking-widest text-neutral-400 hover:text-signal"
          >
            ← Refine Details
          </button>

          <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
            <button
              type="button"
              onClick={onStartStory}
              disabled={isGenerating}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded border border-human bg-human px-6 py-3 font-sc text-sm font-bold uppercase tracking-widest text-signal shadow-[0_0_15px_rgba(139,0,0,0.3)] transition-all hover:border-human hover:bg-void hover:text-human sm:w-auto"
            >
              {isGenerating ? (
                <>
                  {activeAgentId === 'versa' ? (
                    <img src={AGENTS.VERSA.logoUrl} className="size-5 animate-pulse object-contain" alt="VERSA" />
                  ) : (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                      className="size-4 rounded-full border-2 border-neutral-400 border-t-transparent"
                    />
                  )}
                  <span>{activeAgentId === 'versa' ? 'VERSA is writing...' : 'Generating...'}</span>
                </>
              ) : (
                <><span>Accept Blueprint & Start Matrix</span><ArrowRight size={16} /></>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyBlueprint}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded border border-neutral-800 bg-neutral-950 px-5 py-3 font-sc text-sm font-bold uppercase tracking-widest text-portal shadow-[0_0_15px_rgba(4,172,255,0.1)] transition-all hover:border-portal hover:text-signal sm:w-auto"
            >
              {copied ? <><Check size={16} /><span>Copied Blueprint</span></> : <><Copy size={16} /><span>Copy Blueprint</span></>}
            </button>

            <button
              type="button"
              onClick={onExportSeed}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded border border-neutral-850 bg-neutral-950 px-5 py-3 font-sc text-sm font-bold uppercase tracking-widest text-neutral-400 transition-all hover:border-neutral-700 hover:text-signal sm:w-auto"
            >
              <Download size={16} />
              <span>Export Seed + Blueprint</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
