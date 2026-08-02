import {
  BookOpen,
  Drama,
  Feather,
  Globe,
  Hourglass,
  Landmark,
  PenLine,
  Route,
  Shield,
  Sparkles,
  Tag,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { IntakeData } from '../shared/types';

/**
 * The navigation hierarchy of the creation workspace.
 *
 * Story is the novel's direction — three required inputs (Premise, Genre,
 * Style) followed by seed-level optional direction. World is the novel's
 * history, fully optional: the Library can generate all of it.
 *
 * A section earns its place here only if it helps *define or recreate the
 * novel*. Anything that changes how the finished novel is experienced —
 * pacing, tone dials, romance/harem levels, Fate Survival — belongs to the
 * separate Story Settings feature, not to the seed.
 *
 * The flat IntakeData view model is what the workspaces edit; the schema
 * boundary in `shared/storySeedSchema.ts` classifies it on save / export /
 * generation.
 */

export type SeedFamily = 'story' | 'world';

export type SeedSectionId =
  | 'premise'
  | 'genre'
  | 'style'
  | 'story-tags'
  | 'plot-tropes'
  | 'world-identity'
  | 'characters'
  | 'factions'
  | 'abilities'
  | 'power-system'
  | 'destined-ending';

export interface SeedSection {
  id: SeedSectionId;
  family: SeedFamily;
  label: string;
  icon: LucideIcon;
  /** One of the three required Story inputs (Premise, Genre, Style). */
  required?: boolean;
  /** One-line guidance shown under the workspace title. */
  tagline: string;
  /** Whether the section currently holds user-entered content. */
  isFilled: (intake: IntakeData) => boolean;
}

export const SEED_FAMILIES: Record<SeedFamily, { label: string; tagline: string }> = {
  story: { label: 'Story', tagline: "The novel's direction" },
  world: { label: 'World', tagline: "The novel's history" },
};

const hasText = (value?: string): boolean => Boolean(value?.trim());

/** The curated seed-level plot direction — narrative shape, not experience dials. */
export const PLOT_TROPE_FIELDS = [
  'desiredPlotDirection',
  'longTermGoal',
  'firstMajorConflict',
  'mainAntagonistPressure',
] as const;

export const SEED_SECTIONS: SeedSection[] = [
  {
    id: 'premise',
    family: 'story',
    label: 'Premise',
    icon: Feather,
    required: true,
    tagline: 'The hook or secret catalyst the whole novel bends around.',
    isFilled: intake => hasText(intake.corePremise),
  },
  {
    id: 'genre',
    family: 'story',
    label: 'Genre',
    icon: Drama,
    required: true,
    tagline: 'The shelf your novel lives on — its logic, dialect, and promises.',
    isFilled: intake => hasText(intake.genrePath),
  },
  {
    id: 'style',
    family: 'story',
    label: 'Style',
    icon: PenLine,
    required: true,
    tagline: 'The prose voice the Library writes in.',
    isFilled: intake => hasText(intake.proseStyle),
  },
  {
    id: 'story-tags',
    family: 'story',
    label: 'Story Tags',
    icon: Tag,
    tagline: 'Themes, tones, and elements that shape your story. Generated automatically if left empty.',
    isFilled: intake => (intake.storyTags || []).length > 0,
  },
  {
    id: 'plot-tropes',
    family: 'story',
    label: 'Plot & Tropes',
    icon: Route,
    tagline: 'The narrative shape of the novel — where it is headed and what pushes back.',
    isFilled: intake => PLOT_TROPE_FIELDS.some(field => hasText(intake[field])),
  },
  {
    id: 'world-identity',
    family: 'world',
    label: 'World Identity',
    icon: Landmark,
    tagline: 'Name, world type, society, and the place the story opens in.',
    isFilled: intake =>
      hasText(intake.novelTitle)
      || hasText(intake.worldType)
      || hasText(intake.startingLocation)
      || hasText(intake.societyStructure),
  },
  {
    id: 'characters',
    family: 'world',
    label: 'Characters',
    icon: Users,
    tagline: 'The main character and any cast you want defined before generation.',
    isFilled: intake =>
      (intake.customCharacters || []).some(character => hasText(character.name))
      || [
        intake.mcName,
        intake.startingIdentity,
        intake.personality,
        intake.mainFlaw,
        intake.secretAdvantage,
        intake.startingWeakness,
        intake.moralAlignment,
        intake.mcBio,
      ].some(hasText),
  },
  {
    id: 'factions',
    family: 'world',
    label: 'Factions',
    icon: Shield,
    tagline: 'Sects, guilds, and powers that already shape the world.',
    isFilled: intake => (intake.customFactions || []).some(faction => hasText(faction.name)),
  },
  {
    id: 'abilities',
    family: 'world',
    label: 'Abilities',
    icon: Sparkles,
    tagline: "The main character's starting power and the path only they can walk.",
    isFilled: intake => hasText(intake.startingPowerConcept) || hasText(intake.uniquePath),
  },
  {
    id: 'power-system',
    family: 'world',
    label: 'Power System',
    icon: Zap,
    tagline: "The flavor and known ranks of the world's power ladder.",
    isFilled: intake => hasText(intake.powerFlavor) || hasText(intake.knownRanks),
  },
  {
    id: 'destined-ending',
    family: 'world',
    label: 'Destined Ending',
    icon: Hourglass,
    tagline: 'The final destination this story is fated to reach.',
    isFilled: intake => hasText(intake.destinedEnding),
  },
];

export const FAMILY_SECTIONS: Record<SeedFamily, SeedSection[]> = {
  story: SEED_SECTIONS.filter(section => section.family === 'story'),
  world: SEED_SECTIONS.filter(section => section.family === 'world'),
};

export const REQUIRED_STORY_SECTIONS = SEED_SECTIONS.filter(section => section.required);

export const getSeedSection = (id: SeedSectionId): SeedSection =>
  SEED_SECTIONS.find(section => section.id === id)!;

export const missingRequiredSections = (intake: IntakeData): SeedSection[] =>
  REQUIRED_STORY_SECTIONS.filter(section => !section.isFilled(intake));

export const FAMILY_ICONS: Record<SeedFamily, LucideIcon> = {
  story: BookOpen,
  world: Globe,
};
