import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Copy,
  Download,
  Drama,
  Feather,
  FileText,
  Flag,
  GitBranch,
  Globe,
  HelpCircle,
  Hourglass,
  Info,
  Landmark,
  MapPin,
  Pencil,
  Route,
  ScrollText,
  Shield,
  Sparkle,
  Tag,
  Target,
  UserRound,
  Users,
  Wand2,
  Zap,
  type LucideIcon,
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
import { LibraryButton, LibraryPanel, LibraryTextArea, LibraryTextBox } from '../../library';
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

/** Pencil + "Editable" chip pinned to the right of every dossier field label,
 *  so every blueprint box reads as editable before it is ever focused. */
const EditableChip = () => (
  <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(205,178,113,0.3)] bg-[rgba(205,178,113,0.05)] px-2 py-0.5 font-sc text-[9px] font-bold uppercase tracking-[0.18em] text-[#DDC58A]/80">
    <Pencil size={9} aria-hidden="true" />
    Editable
  </span>
);

/** Dossier section heading — gold medallion glyph, cream display title, an
 *  optional serif tagline, and the same gilded divider the Seed workspaces use. */
const BlueprintSectionHeading = ({
  id,
  icon: Icon,
  title,
  tagline,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  tagline?: string;
}) => (
  <div>
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(205,178,113,0.38)] bg-[radial-gradient(circle_at_32%_28%,rgba(205,178,113,0.14),rgba(11,14,30,0.55)_68%)] text-[#CDB271] shadow-[0_0_16px_rgba(205,178,113,0.12),inset_0_0_10px_rgba(205,178,113,0.08)]"
      >
        <Icon size={15} className="drop-shadow-[0_0_6px_rgba(205,178,113,0.35)]" />
      </span>
      <h2 id={id} className="font-display text-lg font-bold uppercase tracking-[0.12em] text-[#F3EDE0] sm:text-xl">
        {title}
      </h2>
    </div>
    {tagline && (
      <p className="mt-2 max-w-xl font-serif text-[13px] leading-relaxed text-[#B0A99B]">{tagline}</p>
    )}
    <div aria-hidden="true" className="mt-4 flex items-center gap-3">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(205,178,113,0.16)] to-[rgba(205,178,113,0.3)]" />
      <Sparkle size={9} className="shrink-0 text-[#CDB271]/60" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[rgba(205,178,113,0.16)] to-[rgba(205,178,113,0.3)]" />
    </div>
  </div>
);

/** Small dossier metadata chip for the header (version, creator, dates). */
const MetadataChip = ({
  icon: Icon,
  children,
  gold = false,
}: {
  icon?: LucideIcon;
  children: React.ReactNode;
  gold?: boolean;
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${
      gold
        ? 'border-[rgba(205,178,113,0.45)] bg-[rgba(205,178,113,0.07)] text-[#DDC58A] shadow-[0_0_14px_rgba(205,178,113,0.12)]'
        : 'border-[rgba(172,166,214,0.25)] bg-[rgba(11,14,30,0.5)] text-neutral-300'
    }`}
  >
    {Icon && <Icon size={11} aria-hidden="true" className={gold ? 'text-[#DDC58A]' : 'text-[#ACA6D6]'} />}
    {children}
  </span>
);

/** Shared label row for the one control without a Library wrapper (the Style
 *  select) so it matches LibraryTextBox / LibraryTextArea label rhythm. */
const FieldLabelRow = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <div className="mb-2 flex items-end justify-between gap-3">
    <label className="block font-sc text-xs uppercase tracking-widest text-neutral-400" htmlFor={htmlFor}>
      {children}
    </label>
    <EditableChip />
  </div>
);

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
    // The dossier speaks the Seed workspace dialect of the Library glass
    // language: `seed-workspace-shell` brings the parchment-gold / soft-purple
    // field polish, the ambience layer stays gradient-only behind the panels.
    <div className="seed-workspace-shell relative mx-auto max-w-4xl pb-20" id="creation-portal-root">
      <div aria-hidden="true" className="seed-workspace-ambience" />

      <div className="relative space-y-6">
        {/* 1 · Blueprint Header — the dossier cover: editable story title and
              every available artifact metadata chip. */}
        <LibraryPanel as="header" padding="lg" className="text-center">
          {/* Blueprint version pins to the cover's top-left corner; the
              remaining metadata chips stay centered under the title. */}
          <div className="flex justify-start">
            <MetadataChip gold>{blueprint.blueprintVersion || 'v1.0'}</MetadataChip>
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-transparent to-[rgba(205,178,113,0.4)]" />
            <span className="font-sc text-[11px] font-bold uppercase tracking-[0.34em] text-[#CDB271]">World Blueprint</span>
            <span aria-hidden="true" className="h-px w-8 bg-gradient-to-l from-transparent to-[rgba(205,178,113,0.4)]" />
          </div>

          <div className="blueprint-title-field mx-auto mt-5 max-w-2xl">
            <LibraryTextBox
              id="blueprint-story-title"
              label="Story Title"
              rightElement={<EditableChip />}
              value={blueprint.title || ''}
              onChange={updateTitle}
              placeholder="Give your story a title"
              autoComplete="off"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {blueprint.creator && <MetadataChip icon={UserRound}>Creator: {blueprint.creator}</MetadataChip>}
            {blueprint.status && <MetadataChip icon={Info}>Status: {blueprint.status}</MetadataChip>}
            {blueprint.createdAt && <MetadataChip icon={CalendarDays}>Created: {formatDate(blueprint.createdAt)}</MetadataChip>}
            {blueprint.updatedAt && <MetadataChip icon={CalendarDays}>Updated: {formatDate(blueprint.updatedAt)}</MetadataChip>}
          </div>
        </LibraryPanel>

        {/* 2 · Origin Snapshot — the creator-authored seed values; edits here
              keep updating the canonical Story Seed used for generation. */}
        <LibraryPanel as="section" aria-labelledby="blueprint-origin-heading" padding="md">
          <BlueprintSectionHeading
            id="blueprint-origin-heading"
            icon={Feather}
            title="Origin Snapshot"
            tagline="Creator-authored Origin inputs. Changes here update the same Story Seed values used for generation."
          />

          <div className="mt-5 space-y-5">
            <div className="blueprint-key-field">
              <LibraryTextArea
                id="blueprint-origin-premise"
                label="Core Premise / Secret Catalyst"
                rightElement={<EditableChip />}
                icon={Feather}
                value={origin.premise}
                onChange={premise => updateOrigin({ premise })}
                maxLength={STORY_PREMISE_MAX_LENGTH}
                rows={5}
                className="font-serif leading-relaxed text-[#dfd8cf]"
                placeholder="The premise written in Origin..."
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <LibraryTextBox
                id="blueprint-origin-genre"
                label="Genre"
                rightElement={<EditableChip />}
                icon={Drama}
                value={origin.genre}
                onChange={genre => updateOrigin({ genre })}
                placeholder="e.g. Xianxia, LitRPG / System"
              />

              <div>
                <FieldLabelRow htmlFor="blueprint-origin-style">Style / Novel Tradition</FieldLabelRow>
                <div className="glass-select">
                  <select
                    id="blueprint-origin-style"
                    value={origin.style}
                    onChange={(event) => updateOrigin({ style: event.target.value as StoryStyle | '' })}
                    className="glass-field min-h-[2.75rem] px-4 py-2.5 text-base"
                    data-complete={origin.style ? 'true' : undefined}
                  >
                    <option value="">Choose a novel tradition</option>
                    {STORY_STYLE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <LibraryTextArea
              id="blueprint-origin-tags"
              label={`Story Tags (${storyTagCount} / ${STORY_TAG_LIMIT})`}
              rightElement={<EditableChip />}
              icon={Tag}
              value={origin.storyTags.join('\n')}
              onChange={updateStoryTags}
              rows={3}
              className="font-mono"
              placeholder="One Story Tag per line"
              error={tagLimitError ?? undefined}
            />
          </div>
        </LibraryPanel>

        {/* 3 · Main Character — the protagonist the blueprint builds around. */}
        <LibraryPanel as="section" aria-labelledby="blueprint-main-character-heading" padding="md">
          <BlueprintSectionHeading
            id="blueprint-main-character-heading"
            icon={UserRound}
            title="Main Character"
            tagline="The protagonist this blueprint builds around."
          />

          <div className="mt-5 space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <LibraryTextBox
                id="blueprint-mc-name"
                label="Name"
                rightElement={<EditableChip />}
                icon={UserRound}
                value={mainCharacter.name}
                onChange={name => updateMainCharacter({ name })}
                placeholder="Main character name"
              />
              <LibraryTextBox
                id="blueprint-mc-age"
                label="Age"
                rightElement={<EditableChip />}
                value={mainCharacter.age}
                onChange={age => updateMainCharacter({ age })}
                placeholder="e.g. 18, Ancient, Unknown"
              />
              <LibraryTextArea
                id="blueprint-mc-personality"
                label="Personality"
                rightElement={<EditableChip />}
                value={mainCharacter.personality}
                onChange={personality => updateMainCharacter({ personality })}
                rows={4}
                placeholder="Core temperament, values, contradictions..."
              />
              <LibraryTextArea
                id="blueprint-mc-appearance"
                label="Appearance"
                rightElement={<EditableChip />}
                value={mainCharacter.appearance}
                onChange={appearance => updateMainCharacter({ appearance })}
                rows={4}
                placeholder="Physical appearance, clothing, distinctive features..."
              />
            </div>

            <div className="blueprint-key-field">
              <LibraryTextArea
                id="blueprint-mc-profile"
                label="Background / Profile"
                rightElement={<EditableChip />}
                icon={ScrollText}
                value={mainCharacter.backgroundProfile}
                onChange={backgroundProfile => updateMainCharacter({ backgroundProfile })}
                rows={5}
                className="leading-relaxed"
                placeholder="Background, starting identity, flaws, gifts, and relevant history..."
              />
            </div>
          </div>
        </LibraryPanel>

        {/* 4 · World Setting — overview leads as a key field; the remaining
              pillars follow in a scannable order. */}
        <LibraryPanel as="section" aria-labelledby="blueprint-world-setting-heading" padding="md">
          <BlueprintSectionHeading
            id="blueprint-world-setting-heading"
            icon={Globe}
            title="World Setting"
            tagline="The universe, its opening stage, and the rules that govern it."
          />

          <div className="mt-5 space-y-5">
            <div className="blueprint-key-field">
              <LibraryTextArea
                id="blueprint-world-overview"
                label="World Overview"
                rightElement={<EditableChip />}
                icon={Globe}
                value={blueprint.worldOverview || ''}
                onChange={worldOverview => setBlueprint(current => ({ ...current, worldOverview }))}
                rows={7}
                className="font-serif leading-relaxed text-[#dfd8cf]"
                placeholder="The setting, lore, and physical characteristics of this universe..."
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <LibraryTextArea
                id="blueprint-opening-location"
                label="Opening Location"
                rightElement={<EditableChip />}
                icon={MapPin}
                value={blueprint.startingLocation || ''}
                onChange={startingLocation => setBlueprint(current => ({ ...current, startingLocation }))}
                rows={5}
                className="leading-relaxed"
                placeholder="Where the story begins..."
              />
              <LibraryTextArea
                id="blueprint-world-order"
                label="World Order"
                rightElement={<EditableChip />}
                icon={Landmark}
                value={blueprint.societyStructure || ''}
                onChange={societyStructure => setBlueprint(current => ({ ...current, societyStructure }))}
                rows={5}
                placeholder="Feudal, corporate, sect-based, military rule..."
              />
            </div>

            <LibraryTextArea
              id="blueprint-power-outline"
              label="Power System Outline"
              rightElement={<EditableChip />}
              icon={Zap}
              value={blueprint.powerSystemOutline || ''}
              onChange={powerSystemOutline => setBlueprint(current => ({ ...current, powerSystemOutline }))}
              rows={4}
              className="font-mono leading-relaxed"
              placeholder="Power scaling, ranks, costs, limits, magical energy..."
            />
          </div>
        </LibraryPanel>

        {/* 5 · Overall Story Direction — generated guidance, with the Destined
              Ending carrying the key-field weight. */}
        <LibraryPanel as="section" aria-labelledby="blueprint-direction-heading" padding="md">
          <BlueprintSectionHeading
            id="blueprint-direction-heading"
            icon={Route}
            title="Overall Story Direction"
            tagline="The generated path from the opening promise to the destined ending."
          />

          <div className="mt-5 space-y-5">
            <LibraryTextArea
              id="blueprint-core-direction"
              label="Overall / Core Story Direction"
              rightElement={<EditableChip />}
              icon={Target}
              value={blueprint.logline || ''}
              onChange={logline => setBlueprint(current => ({ ...current, logline }))}
              rows={4}
              className="leading-relaxed"
              placeholder="The generated high-level direction for the complete story..."
            />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <LibraryTextArea
                id="blueprint-first-arc"
                label="First Arc Promise"
                rightElement={<EditableChip />}
                icon={Flag}
                value={blueprint.firstArcPromise || ''}
                onChange={firstArcPromise => setBlueprint(current => ({ ...current, firstArcPromise }))}
                rows={5}
                className="leading-relaxed"
                placeholder="The opening conflict, stakes, and payoff promised by Arc One..."
              />
              <div className="blueprint-key-field">
                <LibraryTextArea
                  id="blueprint-destined-ending"
                  label="Destined Ending"
                  rightElement={<EditableChip />}
                  icon={Hourglass}
                  value={blueprint.destinedEnding || ''}
                  onChange={destinedEnding => setBlueprint(current => ({ ...current, destinedEnding }))}
                  rows={5}
                  className="leading-relaxed"
                  placeholder="The intended fated destination of the story..."
                />
              </div>
              <LibraryTextArea
                id="blueprint-trope-guidance"
                label="Trope Guidance / Story Direction"
                rightElement={<EditableChip />}
                icon={Wand2}
                value={blueprint.tropeRules || ''}
                onChange={tropeRules => setBlueprint(current => ({ ...current, tropeRules }))}
                rows={5}
                placeholder="Tropes to use or subvert, tone rules, and directional guardrails..."
              />
              <LibraryTextArea
                id="blueprint-style-bible"
                label="Generated Style Bible"
                rightElement={<EditableChip />}
                icon={FileText}
                value={blueprint.styleBible || ''}
                onChange={styleBible => setBlueprint(current => ({ ...current, styleBible }))}
                rows={5}
                className="font-mono"
                placeholder="Generated prose rules, forbidden phrasing, and tone requirements..."
              />
            </div>

            <div className="sm:max-w-xs">
              <LibraryTextBox
                id="blueprint-estimated-arcs"
                label="Estimated Arcs"
                rightElement={<EditableChip />}
                type="number"
                value={blueprint.estimatedArcs || ''}
                onChange={(value) => {
                  const rawValue = value.trim();
                  const parsedValue = Number.parseInt(rawValue, 10);
                  setBlueprint(current => ({
                    ...current,
                    estimatedArcs: rawValue === '' || Number.isNaN(parsedValue)
                      ? 0
                      : Math.min(100, Math.max(1, parsedValue)),
                  }));
                }}
                className="text-center font-mono"
                placeholder="e.g. 5"
                min="1"
                max="100"
              />
            </div>
          </div>
        </LibraryPanel>

        {/* 6 · Side Characters — editable one-per-line cast list. */}
        <LibraryPanel as="section" aria-labelledby="blueprint-side-characters-heading" padding="md">
          <BlueprintSectionHeading
            id="blueprint-side-characters-heading"
            icon={Users}
            title="Side Characters"
            tagline="Cast members the story can draw on — one per line."
          />

          <div className="mt-5">
            <LibraryTextArea
              id="blueprint-side-characters"
              label="Side Characters (One per line)"
              rightElement={<EditableChip />}
              icon={Users}
              value={blueprint.initialCharacters?.join('\n') || ''}
              onChange={value => setBlueprint(current => ({ ...current, initialCharacters: value.split('\n') }))}
              rows={6}
              className="font-mono"
              placeholder="Elder Qin (Protector)&#10;Junior Sister Han (Ally)&#10;Young Master Ye (Rival)"
            />
          </div>
        </LibraryPanel>

        {/* 7 · Factions — editable one-per-line powers list. */}
        <LibraryPanel as="section" aria-labelledby="blueprint-factions-heading" padding="md">
          <BlueprintSectionHeading
            id="blueprint-factions-heading"
            icon={Shield}
            title="Factions"
            tagline="Sects, guilds, and powers that already shape the world — one per line."
          />

          <div className="mt-5">
            <LibraryTextArea
              id="blueprint-factions"
              label="Major Factions (One per line)"
              rightElement={<EditableChip />}
              icon={Shield}
              value={blueprint.majorFactions?.join('\n') || ''}
              onChange={value => setBlueprint(current => ({ ...current, majorFactions: value.split('\n') }))}
              rows={6}
              className="font-mono"
              placeholder="Heavenly Sword Sect&#10;Deep Sea Alliance&#10;Abyssal Cult"
            />
          </div>
        </LibraryPanel>

        {/* 8 · Major Mysteries / Unresolved Plot Threads — open questions the
              story must resolve. */}
        <LibraryPanel as="section" aria-labelledby="blueprint-mysteries-heading" padding="md">
          <BlueprintSectionHeading
            id="blueprint-mysteries-heading"
            icon={HelpCircle}
            title="Major Mysteries / Unresolved Plot Threads"
            tagline="Open questions and threads the story promises to resolve."
          />

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <LibraryTextArea
              id="blueprint-major-mysteries"
              label="Major Mysteries (One per line)"
              rightElement={<EditableChip />}
              icon={HelpCircle}
              value={blueprint.majorMysteries?.join('\n') || ''}
              onChange={value => setBlueprint(current => ({ ...current, majorMysteries: value.split('\n') }))}
              rows={6}
              className="font-mono"
              placeholder="True origin of the Sovereign Ring&#10;Why was the Sect Leader poisoned?"
            />
            <LibraryTextArea
              id="blueprint-unresolved-threads"
              label="Unresolved Plot Threads (One per line)"
              rightElement={<EditableChip />}
              icon={GitBranch}
              value={blueprint.unresolvedPlotThreads?.join('\n') || ''}
              onChange={value => setBlueprint(current => ({ ...current, unresolvedPlotThreads: value.split('\n') }))}
              rows={6}
              className="font-mono"
              placeholder="Sever the engagement with Chu family&#10;Win the Inner Sect tournament"
            />
          </div>
        </LibraryPanel>

        {/* Dossier footer — refine / manifest / copy / export actions. */}
        <LibraryPanel padding="sm" className="sm:p-5">
          <div className="flex flex-col items-stretch gap-4 xl:flex-row xl:items-center xl:justify-between">
            <LibraryButton
              variant="ghost"
              size="sm"
              icon={ArrowLeft}
              onClick={onBack}
              disabled={isGenerating}
              className="self-center xl:self-auto"
            >
              Refine Details
            </LibraryButton>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <LibraryButton
                variant="primary"
                size="lg"
                fullWidth
                className="sm:w-auto"
                onClick={onStartStory}
                loading={isGenerating}
                loadingIndicator={activeAgentId === 'versa' ? (
                  <img src={AGENTS.VERSA.logoUrl} className="size-5 animate-pulse object-contain" alt="VERSA" />
                ) : undefined}
                iconRight={!isGenerating ? <ArrowRight size={16} /> : undefined}
              >
                {isGenerating
                  ? (activeAgentId === 'versa' ? 'VERSA is writing...' : 'Generating...')
                  : 'Manifest'}
              </LibraryButton>

              <LibraryButton
                variant="secondary"
                size="lg"
                fullWidth
                className="sm:w-auto"
                icon={copied ? Check : Copy}
                onClick={handleCopyBlueprint}
              >
                {copied ? 'Copied Blueprint' : 'Copy Blueprint'}
              </LibraryButton>

              <LibraryButton
                variant="ghost"
                size="lg"
                fullWidth
                className="sm:w-auto"
                icon={Download}
                onClick={onExportSeed}
              >
                Export Seed + Blueprint
              </LibraryButton>
            </div>
          </div>
        </LibraryPanel>
      </div>
    </div>
  );
};
