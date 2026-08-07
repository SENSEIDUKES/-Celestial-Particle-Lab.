import { useState, type Dispatch, type SetStateAction } from 'react';
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
  Globe,
  Hourglass,
  Info,
  Landmark,
  MapPin,
  Route,
  ScrollText,
  Tag,
  Target,
  UserRound,
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
import { STORY_STYLE_OPTIONS, type StoryStyle } from '../shared/storyStyle';
import { AGENTS, useAppStore } from '../shared/stubs';
import { LibraryButton, LibraryPanel, LibraryTextArea, LibraryTextBox, ManifestButton } from '../../library';
import { patchStoryRequired, patchWorldIdentity, type UpdateSeed } from './seedState';
import {
  BlueprintSectionHeading,
  EditableChip,
  FieldLabelRow,
  MetadataChip,
} from './blueprint/BlueprintDossierPrimitives';
import { BlueprintCollectionSections } from './blueprint/BlueprintCollectionSections';
import { createBlueprintMarkdown, formatBlueprintDate } from './blueprint/createBlueprintMarkdown';

interface BlueprintReviewProps {
  blueprint: WorldBlueprint;
  setBlueprint: Dispatch<SetStateAction<WorldBlueprint>>;
  seed: StorySeedInput;
  updateSeed: UpdateSeed;
  onBack: () => void;
  onStartStory: () => void;
  onExportSeed: () => void;
  isGenerating: boolean;
}

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
    navigator.clipboard.writeText(createBlueprintMarkdown(blueprint, origin, mainCharacter)).then(() => {
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
            {blueprint.createdAt && <MetadataChip icon={CalendarDays}>Created: {formatBlueprintDate(blueprint.createdAt)}</MetadataChip>}
            {blueprint.updatedAt && <MetadataChip icon={CalendarDays}>Updated: {formatBlueprintDate(blueprint.updatedAt)}</MetadataChip>}
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

        <BlueprintCollectionSections blueprint={blueprint} setBlueprint={setBlueprint} />

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
              <ManifestButton
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
                  ? (activeAgentId === 'versa' ? 'VERSA is writing...' : 'Manifesting...')
                  : 'Manifest Story'}
              </ManifestButton>

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
