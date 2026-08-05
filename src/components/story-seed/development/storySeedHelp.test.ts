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
  it('prioritizes topics for the current page without removing general guidance', () => {
    expect(getLibraryHelpItems(topics, 'en', 'story-seed', '').map(item => item.id))
      .toEqual(['seed', 'general']);
  });

  it.each(['general', 'main guidance', 'quick tip', 'UNIVERSE'])(
    'searches titles, main tips, and supporting details for %s',
    query => {
      expect(getLibraryHelpItems(topics, 'en', 'library', query)).toHaveLength(1);
    },
  );
});
