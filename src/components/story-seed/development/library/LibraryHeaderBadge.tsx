import React from 'react';

/**
 * LibraryHeaderBadge — the reusable Library header identity block.
 *
 * Frosted-glass title plaque with the cool fluid glow behind it
 * (.seed-rainbow-glow), luminous ivory-to-gold title
 * (.seed-title-presence), and an optional gold-shimmer subtitle
 * (.seed-subtitle-shimmer). An optional emblem can sit to the left;
 * pass `emblemHref` to make it a home button.
 *
 * The seed-* styles live globally in src/styles.css.
 *
 * Usage:
 *   <LibraryHeaderBadge
 *     title="Story Seed"
 *     subtitle="Grow Your Universe"
 *     emblemSrc={EMBLEM_URL}
 *     emblemAlt="Celestial Library"
 *     emblemHref="/"
 *   />
 */
export interface LibraryHeaderBadgeProps {
  title: string;
  subtitle?: string;
  emblemSrc?: string;
  emblemAlt?: string;
  /** When set, the emblem becomes a link (e.g. "/" for home). */
  emblemHref?: string;
}

export function LibraryHeaderBadge({
  title,
  subtitle,
  emblemSrc,
  emblemAlt = '',
  emblemHref,
}: LibraryHeaderBadgeProps) {
  const emblem = emblemSrc ? (
    <img
      src={emblemSrc}
      alt={emblemAlt}
      referrerPolicy="no-referrer"
      className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover ring-1 ring-gold-accent/60 shadow-[0_0_18px_rgba(212,175,55,0.5),0_0_48px_rgba(212,175,55,0.28)] transition-shadow duration-300 group-hover:shadow-[0_0_28px_rgba(212,175,55,0.75),0_0_72px_rgba(212,175,55,0.4)]"
    />
  ) : null;

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {emblem && (emblemHref ? (
        <a
          href={emblemHref}
          title={`${title} home`}
          aria-label={`${title} home`}
          className="group shrink-0 rounded-full"
        >
          {emblem}
        </a>
      ) : (
        emblem
      ))}

      <div className="relative">
        {/* Fluid glow bleeding out from behind the glass shell. */}
        <div
          aria-hidden="true"
          className="seed-rainbow-glow absolute -inset-0.5 rounded-2xl opacity-25 blur-lg"
        />
        <div className="relative rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5 sm:px-5 sm:py-3 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(255,255,255,0.05)]">
          <h1 className="seed-title-presence font-display font-bold text-2xl sm:text-4xl uppercase tracking-[0.08em]">
            {title}
          </h1>
          {subtitle ? (
            <p className="seed-subtitle-shimmer mt-1 font-sc text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.24em] sm:tracking-[0.3em] whitespace-nowrap">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default LibraryHeaderBadge;
