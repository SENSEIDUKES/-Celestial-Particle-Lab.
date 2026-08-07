import {
  Drama,
  Feather,
  Globe,
  Lightbulb,
  PenLine,
  Route,
  Sprout,
  Tag,
  type LucideIcon,
} from 'lucide-react';

/**
 * Library Help content — the single home for guidance that used to live
 * in loose tip boxes scattered across the creation sections.
 *
 * The data is deliberately content-first so the feature grows without UI
 * changes:
 *
 * - **New help item:** add one entry to `STORY_SEED_HELP_ITEMS`; the menu
 *   renders it automatically.
 * - **New language:** extend `StorySeedHelpLanguage` and add that language's
 *   `line` and optional `audioUrl` under every item's `translations`. The menu reads
 *   whichever language it is given and falls back to English.
 */

/** Languages the Help menu can speak. English is the launch language. */
export type StorySeedHelpLanguage = 'en';

export const DEFAULT_HELP_LANGUAGE: StorySeedHelpLanguage = 'en';

export interface StorySeedHelpTranslation {
  /** Written guidance line shown on the item's info card. */
  line: string;
  /** Optional supporting copy. This is written guidance only, never TTS. */
  detail?: string;
  /** Optional spoken version of the same line. Details are never included. */
  audioUrl?: string;
}

export interface StorySeedHelpItem {
  /** Stable id — used as the menu row key and for playback state. */
  id: string;
  /** Short topic label shown in the menu list. */
  label: string;
  icon: LucideIcon;
  /** Library pages where this topic should be prioritized. */
  contexts?: string[];
  /** Guidance per language. */
  translations: Partial<Record<StorySeedHelpLanguage, StorySeedHelpTranslation>>;
}

/** Prioritize the current page, then filter against every visible text field. */
export const getLibraryHelpItems = (
  items: readonly StorySeedHelpItem[],
  language: StorySeedHelpLanguage,
  page: string,
  query: string,
): StorySeedHelpItem[] => {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      if (!normalizedQuery) return true;
      const translation = getHelpTranslation(item, language);
      return [item.label, translation?.line, translation?.detail]
        .some(value => value?.toLocaleLowerCase().includes(normalizedQuery));
    })
    .sort((a, b) => {
      const aRelevant = a.item.contexts?.includes(page) ? 1 : 0;
      const bRelevant = b.item.contexts?.includes(page) ? 1 : 0;
      return bRelevant - aRelevant || a.index - b.index;
    })
    .map(({ item }) => item);
};

/** Resolve an item's guidance for a language, falling back to English. */
export const getHelpTranslation = (
  item: StorySeedHelpItem,
  language: StorySeedHelpLanguage,
): StorySeedHelpTranslation | undefined =>
  item.translations[language] ?? item.translations[DEFAULT_HELP_LANGUAGE];

/** The SEIHouse lines CDN folder holding the Story Seed system lines. */
const STORY_SEED_LINES_CDN =
  'https://lines.seihouse.org/LIBRARY/Lines/SYSTEM/SYSTEM/STORY%20SEED';

export const STORY_SEED_HELP_ITEMS: StorySeedHelpItem[] = [
  {
    id: 'story-seed',
    label: 'Story Seed',
    icon: Sprout,
    contexts: ['story-seed'],
    translations: {
      en: {
        line: 'Your Story Seed is the first spark of the novel. Give the Library enough information for it to create your universe.',
        detail: 'Quick tip: Start with the clearest version of your idea. You can deepen the world as the seed grows.',
        audioUrl: `${STORY_SEED_LINES_CDN}/STORY%20SEED%20ENG.mp3`,
      },
    },
  },
  {
    id: 'origin',
    label: 'Origin',
    icon: Feather,
    contexts: ['story-seed'],
    translations: {
      en: {
        line: 'Origin holds the required heart of your story, the title, premise, genre, style and tags.',
        audioUrl: `${STORY_SEED_LINES_CDN}/ORIGIN%20ENG.mp3`,
      },
    },
  },
  {
    id: 'premise',
    label: 'Premise',
    icon: Lightbulb,
    contexts: ['story-seed'],
    translations: {
      en: {
        line: 'The premise tells the Library what your story is really about, scholar.',
        audioUrl: `${STORY_SEED_LINES_CDN}/PREMISE%20ENG.mp3`,
      },
    },
  },
  {
    id: 'genre',
    label: 'Genre',
    icon: Drama,
    contexts: ['story-seed'],
    translations: {
      en: {
        line: 'Genre tells the Library what kind of story this should feel like.',
        audioUrl: `${STORY_SEED_LINES_CDN}/GENRE%20ENG.mp3`,
      },
    },
  },
  {
    id: 'style',
    label: 'Style',
    icon: PenLine,
    contexts: ['story-seed'],
    translations: {
      en: {
        line: 'Style controls the flavor of the writing, not the plot itself, cultivator',
        audioUrl: `${STORY_SEED_LINES_CDN}/STYLE%20ENG.mp3`,
      },
    },
  },
  {
    id: 'story-tags',
    label: 'Story Tags',
    icon: Tag,
    contexts: ['story-seed'],
    translations: {
      en: {
        line: 'Story Tags are powerful signals. For the best results, use a few strong ones instead of flooding the story.',
        detail: 'Quick tip: Choose the tags that most strongly define the experience you want the reader to have.',
        audioUrl: `${STORY_SEED_LINES_CDN}/STORY%20TAGS%20ENG.mp3`,
      },
    },
  },
  {
    id: 'world',
    label: 'World',
    icon: Globe,
    contexts: ['story-seed'],
    translations: {
      en: {
        line: 'World details shape the setting, powers, factions, and rules around your story, Choose wisely disciple.',
        audioUrl: `${STORY_SEED_LINES_CDN}/WORLD%20ENG.mp3`,
      },
    },
  },
  {
    id: 'arc',
    label: 'ARC',
    icon: Route,
    contexts: ['story-seed'],
    translations: {
      en: {
        line: 'ARC guides the path of the story, including plot, tropes, even Face-Slaps, Use ARC to shape the Novels Destiny.',
        audioUrl: `${STORY_SEED_LINES_CDN}/ARC%20ENG.mp3`,
      },
    },
  },
];
