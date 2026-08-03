import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import type { StorySeedInput } from '../shared/storySeedSchema';
import {
  FAMILY_ICONS,
  FAMILY_SECTIONS,
  SEED_FAMILIES,
  type SeedFamily,
  type SeedSection,
  type SeedSectionId,
} from './seedSections';

interface StorySeedSelectorProps {
  seed: StorySeedInput;
  activeSection: SeedSectionId;
  onSelect: (id: SeedSectionId) => void;
}

const SelectorItem = ({
  section,
  filled,
  active,
  onSelect,
}: {
  section: SeedSection;
  filled: boolean;
  active: boolean;
  onSelect: () => void;
}) => {
  const Icon = section.icon;
  const familyAccent = section.family === 'story' ? 'text-portal' : 'text-gold-accent';
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? 'true' : undefined}
      className={`group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-150 ${
        active
          ? section.family === 'story'
            ? 'border-portal/50 bg-portal/10 text-signal shadow-[0_0_14px_rgba(4,172,255,0.08)]'
            : 'border-gold-accent/40 bg-gold-accent/10 text-signal'
          : 'border-transparent text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
      }`}
    >
      <Icon
        size={15}
        aria-hidden="true"
        className={active ? familyAccent : 'text-neutral-500 group-hover:text-neutral-400'}
      />
      <span className="flex-1 font-sc text-xs font-bold uppercase tracking-widest">
        {section.label}
        {section.required && (
          <span className="ml-1 text-human" aria-label="required">*</span>
        )}
      </span>
      {section.required ? (
        filled ? (
          <Check size={13} className="text-portal" aria-label="complete" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-human/90" aria-label="missing" />
        )
      ) : (
        filled && <span className="h-1.5 w-1.5 rounded-full bg-portal/70" aria-label="has content" />
      )}
      <ChevronRight
        size={13}
        aria-hidden="true"
        className={`transition-opacity ${active ? 'opacity-70' : 'opacity-25 group-hover:opacity-50'}`}
      />
    </button>
  );
};

const FamilyBlock = ({
  family,
  seed,
  activeSection,
  onSelect,
}: {
  family: SeedFamily;
  seed: StorySeedInput;
  activeSection: SeedSectionId;
  onSelect: (id: SeedSectionId) => void;
}) => {
  const meta = SEED_FAMILIES[family];
  const FamilyIcon = FAMILY_ICONS[family];
  const accent = family === 'story' ? 'text-portal' : 'text-gold-accent';
  return (
    <div>
      <div className="mb-2 flex items-center gap-2.5 px-1">
        <FamilyIcon size={15} aria-hidden="true" className={accent} />
        <div>
          <p className={`font-sc text-xs font-bold uppercase tracking-[0.2em] ${accent}`}>{meta.label}</p>
          <p className="font-sans text-[10px] text-neutral-500">{meta.tagline}</p>
        </div>
      </div>
      <div className="space-y-1">
        {FAMILY_SECTIONS[family].map(section => (
          <SelectorItem
            key={section.id}
            section={section}
            filled={section.isFilled(seed)}
            active={activeSection === section.id}
            onSelect={() => onSelect(section.id)}
          />
        ))}
      </div>
      <p className="mt-2 px-1 font-sans text-[10px] leading-relaxed text-neutral-600">
        {family === 'story'
          ? 'Style, Genre, and Premise are required. Everything below them is optional.'
          : 'Optional — the Library can generate the complete world automatically.'}
      </p>
    </div>
  );
};

/**
 * The left-panel navigation hierarchy (Story → World) for the creation
 * workspace. Rendered in the desktop sidebar and inside the mobile drawer.
 */
export const StorySeedSelector = ({ seed, activeSection, onSelect }: StorySeedSelectorProps) => (
  <div className="flex h-full flex-col gap-7">
    <p className="px-1 font-sc text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-500">
      Build Your Novel
    </p>

    <FamilyBlock family="story" seed={seed} activeSection={activeSection} onSelect={onSelect} />
    <FamilyBlock family="world" seed={seed} activeSection={activeSection} onSelect={onSelect} />
  </div>
);
