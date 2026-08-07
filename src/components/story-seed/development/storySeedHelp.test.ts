import { describe, expect, it } from 'vitest';
import { Lightbulb } from 'lucide-react';
import { getLibraryHelpItems, type StorySeedHelpItem } from './storySeedHelp';

const topics: StorySeedHelpItem[] = [
  {
    id: 'general', label: 'General', icon: Lightbulb,
    translations: { en: { line: 'Main guidance', detail: 'A supporting quick tip', audioUrl: '/general.mp3' } },
  },
  {
    id: 'seed', label: 'Seed topic', icon: Lightbulb, contexts: ['story-seed'],
    translations: { en: { line: 'Shape your universe', audioUrl: '/seed.mp3' } },
  },
];

describe('Library guidance topics', () => {
  it('prioritizes topics for the current page without mutating the source order', () => {
    const originalOrder = topics.map(item => item.id);

    expect(getLibraryHelpItems(topics, 'en', 'story-seed', '').map(item => item.id))
      .toEqual(['seed', 'general']);
    expect(topics.map(item => item.id)).toEqual(originalOrder);
  });

  it.each([
    ['general', 'general'],
    ['main guidance', 'general'],
    ['quick tip', 'general'],
    ['UNIVERSE', 'seed'],
  ])(
    'searches labels, main lines, and supporting details for %s',
    (query, expectedId) => {
      expect(getLibraryHelpItems(topics, 'en', 'library', query).map(item => item.id))
        .toEqual([expectedId]);
    },
  );

  it('allows written-only topics without an audio URL', () => {
    const textOnlyTopic: StorySeedHelpItem = {
      id: 'text-only',
      label: 'Text only',
      icon: Lightbulb,
      translations: { en: { line: 'Written guidance without narration.' } },
    };

    expect(textOnlyTopic.translations.en?.audioUrl).toBeUndefined();
    expect(getLibraryHelpItems([textOnlyTopic], 'en', 'library', 'written'))
      .toEqual([textOnlyTopic]);
  });
});
