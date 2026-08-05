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
import type { StorySeedInput } from '../shared/storySeedSchema';
import { normalizeStoryStyle } from '../shared/storyStyle';
import { plotAndTropeSettings, storyRequired, worldFoundations, worldIdentity } from './seedState';

/**
 * The navigation hierarchy of the creation workspace, and how each section
 * maps onto the canonical Story Seed contract:
 *
 * ```text
 * story.required   Story Tags · Premise · Genre · Style
 * story.optional   ARC → plotAndTropeSettings + additionalStoryDirection
 * world.required   (none)
 * world.optional   World Identity → worldIdentity
 *                  Characters / Factions / Abilities / Power System /
 *                  ARC also presents Destined Ending from worldFoundations
 * ```
 *
 * A section earns its place here only if it helps *define or recreate the
 * novel*. Anything that changes how the finished novel is experienced —
 * pacing, tone dials, romance/harem levels, Fate Survival — belongs to the
 * separate Story Settings feature and is not part of the Story Seed.
 */

export type SeedFamily = 'story' | 'world';

export type SeedSectionId =
  | 'origin'
  | 'arc'
  | 'style'
  | 'genre'
  | 'premise'
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
  /**
   * Whether the creator must fill this section by hand before generation.
   * Story Tags are a required *contract* field (`story.required.storyTags`)
   * but are not flagged here: an empty set is inferred from Premise, Genre,
   * and Style, so it can never block the flow.
   */
  required?: boolean;
  /** Whether the section belongs in the Story / World selector. */
  navigation?: boolean;
  /** One-line guidance shown under the workspace title. */
  tagline: string;
  /** Whether the section currently holds creator-entered content. */
  isFilled: (seed: StorySeedInput) => boolean;
}

export const SEED_FAMILIES: Record<SeedFamily, { label: string; tagline: string }> = {
  story: { label: 'Story', tagline: "The novel's direction" },
  world: { label: 'World', tagline: "The novel's history" },
};

const hasText = (value?: string): boolean => Boolean(value?.trim());

export const SEED_SECTIONS: SeedSection[] = [
  // Origin combines the four core Story ingredients into one creation flow.
  // The individual records below remain the validation authority.
  {
    id: 'origin',
    family: 'story',
    label: 'Origin',
    icon: Feather,
    required: true,
    tagline: 'The premise, tradition, genre, and story details that give this novel its first shape.',
    isFilled: seed => Boolean(
      normalizeStoryStyle(storyRequired(seed).style)
      && hasText(storyRequired(seed).genre)
      && hasText(storyRequired(seed).premise),
    ),
  },
  // These remain addressable for validation and the isolated legacy workspace
  // files, but Origin is their single visible editing surface.
  {
    id: 'style',
    family: 'story',
    label: 'Style',
    icon: PenLine,
    required: true,
    navigation: false,
    tagline: 'The storytelling tradition your novel belongs to.',
    isFilled: seed => Boolean(normalizeStoryStyle(storyRequired(seed).style)),
  },
  {
    id: 'genre',
    family: 'story',
    label: 'Genre',
    icon: Drama,
    required: true,
    navigation: false,
    tagline: 'The shelf your novel lives on — its logic, dialect, and promises.',
    isFilled: seed => hasText(storyRequired(seed).genre),
  },
  {
    id: 'premise',
    family: 'story',
    label: 'Premise',
    icon: Feather,
    required: true,
    navigation: false,
    tagline: 'The hook or secret catalyst the whole novel bends around.',
    isFilled: seed => hasText(storyRequired(seed).premise),
  },
  {
    id: 'story-tags',
    family: 'story',
    label: 'Story Tags',
    icon: Tag,
    navigation: false,
    tagline: 'Themes, tones, and elements that shape your story. Generated automatically if left empty.',
    isFilled: seed => storyRequired(seed).storyTags.length > 0,
  },
  {
    id: 'arc',
    family: 'story',
    label: 'ARC',
    icon: Route,
    tagline: 'The forces that shape the journey and the destination it ultimately reaches.',
    isFilled: seed => {
      const settings = plotAndTropeSettings(seed);
      return hasText(seed.story.optional.additionalStoryDirection)
        || hasText(settings.longTermGoal)
        || hasText(settings.firstMajorConflict)
        || hasText(settings.mainAntagonistPressure)
        || hasText(worldFoundations(seed).destinedEnding);
    },
  },
  {
    id: 'plot-tropes',
    family: 'story',
    label: 'Plot & Tropes',
    icon: Route,
    navigation: false,
    tagline: 'The narrative shape of the novel — where it is headed and what pushes back.',
    isFilled: seed => {
      const settings = plotAndTropeSettings(seed);
      return hasText(seed.story.optional.additionalStoryDirection)
        || hasText(settings.longTermGoal)
        || hasText(settings.firstMajorConflict)
        || hasText(settings.mainAntagonistPressure);
    },
  },
  {
    id: 'world-identity',
    family: 'world',
    label: 'World Identity',
    icon: Landmark,
    tagline: 'Name, world type, society, and the place the story opens in.',
    isFilled: seed => {
      const identity = worldIdentity(seed);
      return hasText(identity.title)
        || hasText(identity.worldType)
        || hasText(identity.startingLocation)
        || hasText(identity.societyStructure);
    },
  },
  {
    id: 'characters',
    family: 'world',
    label: 'Characters',
    icon: Users,
    tagline: 'The main character and any cast you want defined before generation.',
    isFilled: seed => {
      const foundations = worldFoundations(seed);
      return (foundations.additionalCharacters || []).some(character => hasText(character.name))
        || Object.values(foundations.mainCharacter || {}).some(hasText);
    },
  },
  {
    id: 'factions',
    family: 'world',
    label: 'Factions',
    icon: Shield,
    tagline: 'Sects, guilds, and powers that already shape the world.',
    isFilled: seed => (worldFoundations(seed).factions || []).some(faction => hasText(faction.name)),
  },
  {
    id: 'abilities',
    family: 'world',
    label: 'Abilities',
    icon: Sparkles,
    tagline: "The main character's starting power and the path only they can walk.",
    isFilled: seed => {
      const abilities = worldFoundations(seed).abilities || {};
      return hasText(abilities.startingPowerConcept) || hasText(abilities.uniquePath);
    },
  },
  {
    id: 'power-system',
    family: 'world',
    label: 'Power System',
    icon: Zap,
    tagline: "The style and rank ladder of the world's power system.",
    isFilled: seed => {
      const powerSystem = worldFoundations(seed).powerSystem || {};
      return hasText(powerSystem.flavor) || hasText(powerSystem.knownRanks);
    },
  },
  {
    id: 'destined-ending',
    family: 'world',
    label: 'Destined Ending',
    icon: Hourglass,
    navigation: false,
    tagline: 'The final destination this story is fated to reach.',
    isFilled: seed => hasText(worldFoundations(seed).destinedEnding),
  },
];

export const FAMILY_SECTIONS: Record<SeedFamily, SeedSection[]> = {
  story: SEED_SECTIONS.filter(section => section.family === 'story' && section.navigation !== false),
  world: SEED_SECTIONS.filter(section => section.family === 'world' && section.navigation !== false),
};

// Origin is presentation-only. The generation gate remains deliberately
// granular so validation messages still name the exact missing ingredient.
export const REQUIRED_STORY_SECTIONS = SEED_SECTIONS.filter(section =>
  section.id === 'style' || section.id === 'genre' || section.id === 'premise',
);

export const getSeedSection = (id: SeedSectionId): SeedSection =>
  SEED_SECTIONS.find(section => section.id === id)!;

export const missingRequiredSections = (seed: StorySeedInput): SeedSection[] =>
  REQUIRED_STORY_SECTIONS.filter(section => !section.isFilled(seed));

export const FAMILY_ICONS: Record<SeedFamily, LucideIcon> = {
  story: BookOpen,
  world: Globe,
};
