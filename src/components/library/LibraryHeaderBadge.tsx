/**
 * LibraryHeaderBadge — the reusable Library header identity block.
 *
 * Frosted-glass title plaque with the cool fluid glow behind it
 * (`library-spectrum-glow`), luminous ivory-to-gold title
 * (`library-title-presence`), and an optional gold-shimmer subtitle
 * (`library-subtitle-shimmer`). An optional emblem can sit to the left inside
 * the same animated portal spectrum as the plaque; pass `emblemHref` to
 * make it a home link.
 *
 * The Library spectrum styles live globally in `src/styles.css`.
 *
 * Usage:
 *   <LibraryHeaderBadge
 *     title="Story Seed"
 *     subtitle="Grow Your Universe"
 *     emblemSrc={EMBLEM_URL}
 *     emblemAlt="Celestial Library"
 *     emblemHref="/"
 *     emblemLinkLabel="Return to Workshop home"
 *   />
 */
export interface LibraryHeaderBadgeProps {
  title: string;
  subtitle?: string;
  emblemSrc?: string;
  emblemAlt?: string;
  /** When set, the emblem becomes a link (e.g. "/" for home). */
  emblemHref?: string;
  /** Accessible destination name for the emblem link. */
  emblemLinkLabel?: string;
}

export function LibraryHeaderBadge({
  title,
  subtitle,
  emblemSrc,
  emblemAlt = '',
  emblemHref,
  emblemLinkLabel,
}: LibraryHeaderBadgeProps) {
  const emblem = emblemSrc ? (
    <span className="group/emblem relative isolate inline-flex h-10 w-10 shrink-0 items-center justify-center sm:h-12 sm:w-12">
      {/* Reuse the plaque spectrum as both a soft portal aura and a crisp
          chromatic rim. The emblem remains gold at its core for contrast. */}
      <span
        aria-hidden="true"
        className="library-spectrum-glow absolute -inset-2 rounded-full opacity-60 blur-[10px] transition-all duration-500 group-hover/emblem:scale-110 group-hover/emblem:opacity-90 group-hover/emblem:blur-[13px]"
      />
      <span
        aria-hidden="true"
        className="library-spectrum-glow absolute -inset-[2px] rounded-full opacity-90 shadow-[0_0_14px_rgba(124,92,255,0.35)] transition-opacity duration-300 group-hover/emblem:opacity-100"
      />
      <img
        src={emblemSrc}
        alt={emblemAlt}
        width={48}
        height={48}
        decoding="async"
        referrerPolicy="no-referrer"
        className="relative z-10 h-full w-full rounded-full object-cover ring-1 ring-gold-accent/60 shadow-[0_0_14px_rgba(212,175,55,0.45),0_0_34px_rgba(4,172,255,0.18)] transition-shadow duration-300 group-hover/emblem:shadow-[0_0_20px_rgba(212,175,55,0.65),0_0_52px_rgba(124,92,255,0.34)]"
      />
    </span>
  ) : null;

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {emblem && (emblemHref ? (
        <a
          href={emblemHref}
          title={emblemLinkLabel ?? `${title} home`}
          aria-label={emblemLinkLabel ?? `${title} home`}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full"
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
          className="library-spectrum-glow absolute -inset-0.5 rounded-2xl opacity-25 blur-lg"
        />
        <div className="relative rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5 sm:px-5 sm:py-3 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(255,255,255,0.05)]">
          <h1 className="library-title-presence font-display font-bold text-2xl sm:text-4xl uppercase tracking-[0.08em]">
            {title}
          </h1>
          {subtitle ? (
            <p className="library-subtitle-shimmer mt-1 font-sc text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.24em] sm:tracking-[0.3em] whitespace-nowrap">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default LibraryHeaderBadge;
