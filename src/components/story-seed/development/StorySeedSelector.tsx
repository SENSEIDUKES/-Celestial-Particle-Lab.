import React from 'react';
import { Check, ChevronRight, Eye } from 'lucide-react';
import type { IntakeData } from '../shared/types';
import {
  FAMILY_ICONS,
  FAMILY_SECTIONS,
  SEED_FAMILIES,
  type SeedFamily,
  type SeedSection,
  type SeedSectionId,
} from './seedSections';

interface StorySeedSelectorProps {
  intake: IntakeData;
  activeSection: SeedSectionId;
  onSelect: (id: SeedSectionId) => void;
  onPreview: () => void;
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
      } ${section.secondary ? 'opacity-80' : ''}`}
    >
      <Icon
        size={15}
        aria-hidden="true"
        className={active ? familyAccent : 'text-neutral-500 group-hover:text-neutral-400'}
      />
      <span
        className={`flex-1 font-sc text-xs font-bold uppercase tracking-widest ${
          section.secondary ? 'text-[11px]' : ''
        }`}
      >
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
  intake,
  activeSection,
  onSelect,
}: {
  family: SeedFamily;
  intake: IntakeData;
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
            filled={section.isFilled(intake)}
            active={activeSection === section.id}
            onSelect={() => onSelect(section.id)}
          />
        ))}
      </div>
      {family === 'world' && (
        <p className="mt-2 px-1 font-sans text-[10px] leading-relaxed text-neutral-600">
          Optional — the Library can generate the complete world automatically.
        </p>
      )}
    </div>
  );
};

/**
 * The left-panel navigation hierarchy (Story → World) for the creation
 * workspace. Rendered in the desktop sidebar and inside the mobile drawer.
 */
export const StorySeedSelector = ({ intake, activeSection, onSelect, onPreview }: StorySeedSelectorProps) => (
  <div className="flex h-full flex-col gap-6">
    <p className="px-1 font-sc text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-500">
      Build Your Novel
    </p>

    <FamilyBlock family="story" intake={intake} activeSection={activeSection} onSelect={onSelect} />
    <FamilyBlock family="world" intake={intake} activeSection={activeSection} onSelect={onSelect} />

    <div className="mt-auto pt-2">
      <button
        type="button"
        onClick={onPreview}
        className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 text-left transition-colors hover:border-portal/40"
      >
        <span className="flex items-center gap-2 font-sc text-xs font-bold uppercase tracking-widest text-signal">
          <Eye size={14} className="text-portal" aria-hidden="true" />
          Preview Story Seed
        </span>
        <span className="mt-1 block font-sans text-[11px] text-neutral-500">
          See a summary of your story seed.
        </span>
      </button>
    </div>
  </div>
);
