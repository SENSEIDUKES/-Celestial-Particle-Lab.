import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { SEED_FAMILIES, type SeedSection } from '../seedSections';

/**
 * Shared field styling for the Phase 2 workspaces — the glass field system
 * from `src/components/library/glass-field.css` (imported via the Library
 * barrel), combined
 * with layout utilities. Text inputs and textareas use `LibraryTextBox` /
 * `LibraryTextArea` (which own these classes internally); only
 * `workspaceCompactLabelClass` remains, for the Story Tags picker headings.
 */
export const workspaceCompactLabelClass =
  'block font-sc text-[10px] text-neutral-400 uppercase tracking-widest mb-1';

const accentText = (section: SeedSection) =>
  section.family === 'story' ? 'text-portal' : 'text-gold-accent';

/** Family / section breadcrumb + title + tagline every workspace opens with. */
export const WorkspaceShell = ({
  section,
  complete,
  optionalNote,
  children,
}: {
  section: SeedSection;
  complete: boolean;
  /** Replaces the plain "Optional" chip on optional sections (e.g. Story Tags). */
  optionalNote?: string;
  children: React.ReactNode;
}) => {
  const family = SEED_FAMILIES[section.family];
  const Icon = section.icon;
  return (
    <section aria-labelledby={`seed-workspace-${section.id}-title`} className="max-w-3xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        <span className={section.family === 'story' ? 'text-portal/80' : 'text-gold-accent/80'}>
          {family.label}
        </span>
        <span className="mx-2 text-neutral-700">/</span>
        <span className="text-neutral-300">{section.label}</span>
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2
          id={`seed-workspace-${section.id}-title`}
          className="flex items-center gap-3 font-display font-bold text-2xl sm:text-3xl uppercase tracking-wide text-signal"
        >
          <Icon size={22} className={accentText(section)} aria-hidden="true" />
          {section.label}
        </h2>
        {section.required && (
          complete ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-portal/40 bg-portal/10 px-2.5 py-0.5 font-sc text-[10px] font-bold uppercase tracking-widest text-portal">
              <Check size={11} aria-hidden="true" />
              Complete
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-human/40 bg-human/10 px-2.5 py-0.5 font-sc text-[10px] font-bold uppercase tracking-widest text-red-300">
              <span className="h-1.5 w-1.5 rounded-full bg-human animate-pulse" aria-hidden="true" />
              Required
            </span>
          )
        )}
        {!section.required && (
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/60 px-2.5 py-0.5 font-sc text-[10px] uppercase tracking-widest text-neutral-500">
            Optional
            {optionalNote && (
              <span className="border-l border-neutral-800 pl-2 normal-case tracking-normal text-neutral-500">
                {optionalNote}
              </span>
            )}
          </span>
        )}
      </div>
      <p className="mt-2 max-w-xl font-sans text-sm leading-relaxed text-neutral-400">
        {section.tagline}
      </p>
      <div className="mt-7 space-y-7">{children}</div>
    </section>
  );
};

/** Sub-group heading used inside larger workspaces (Story Settings, Characters). */
export const WorkspaceSubheading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="border-b border-neutral-900/70 pb-2 font-sc text-[11px] font-bold uppercase tracking-widest text-neutral-300">
    {children}
  </h3>
);

/** The "how this section helps generation" note from the design reference. */
export const GuidanceNote = ({
  title,
  tone = 'story',
  children,
}: {
  title: string;
  tone?: SeedSection['family'];
  children: React.ReactNode;
}) => (
  <div
    className={`flex gap-3 rounded-xl border p-4 ${
      tone === 'story'
        ? 'border-portal/15 bg-portal/5'
        : 'border-gold-accent/15 bg-gold-accent/5'
    }`}
  >
    <Sparkles
      size={15}
      aria-hidden="true"
      className={`mt-0.5 shrink-0 ${tone === 'story' ? 'text-portal' : 'text-gold-accent'}`}
    />
    <div>
      <p
        className={`font-sc text-[10px] font-bold uppercase tracking-widest ${
          tone === 'story' ? 'text-portal' : 'text-gold-accent'
        }`}
      >
        {title}
      </p>
      <div className="mt-1 font-sans text-xs leading-relaxed text-neutral-400">{children}</div>
    </div>
  </div>
);
