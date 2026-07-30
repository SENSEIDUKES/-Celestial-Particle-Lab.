import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

/**
 * Trail preset registry — the cosmetic slot for the Journey Scrubber's
 * completed-trail rendering (the lit portion behind the traveler).
 *
 * A trail preset is any renderer for the traveled part of the path. All
 * presets share the exact same curve, viewBox, and dimensions — only the
 * traveled-portion styling changes, so a preset can never alter layout.
 * The unlit path, milestone motes, destination gate, status text, and the
 * indeterminate drift are owned by the scrubber and stay shared.
 *
 * Presets are picked by stable id via the scrubber's `trailStyle` prop —
 * not free-form config. Future presets add one entry here:
 *
 *   1. Create a component that honors `TrailRenderProps` and renders only
 *      the lit portion (clip with the `pathLength` dash trick).
 *   2. Register it in `TRAILS` under a stable id.
 *
 * Reduced-motion rule: shimmer, drift, and twinkle loops must fall back to
 * static, calm presentation via `useReducedMotion`.
 */

export interface TrailRenderProps {
  /** The shared curved qi path geometry (`d` attribute). Never redefine it. */
  pathD: string;
  /** Clamped normalized progress, 0–1 — the lit portion length. */
  progress: number;
  /** Primary accent. */
  accent: string;
  /** Softer accent for glows and sparks. */
  accentSoft: string;
  /** Scrubber-defined glow filter id. */
  glowId: string;
  /** Scrubber-defined soft-blur filter id. */
  softId: string;
  /** Scrubber-defined trail gradient id (accentSoft → accent along the path). */
  trailGradId: string;
  /** Exact point on the shared curve at t ∈ [0,1] — for effects placed along the path. */
  pointAt: (t: number) => { x: number; y: number };
}

export type TrailComponent = React.FC<TrailRenderProps>;

/** qi-glow (default) — the clean violet light trail, exactly the original rendering. */
const QiGlowTrail: TrailComponent = ({
  pathD, progress, accent, softId, glowId, trailGradId,
}) => (
  <>
    <path
      d={pathD} fill="none" pathLength={1}
      stroke={accent} strokeWidth="4" strokeLinecap="round"
      strokeDasharray={`${progress} 1`} opacity="0.3" filter={`url(#${softId})`}
    />
    <path
      d={pathD} fill="none" pathLength={1}
      stroke={`url(#${trailGradId})`} strokeWidth="1.8" strokeLinecap="round"
      strokeDasharray={`${progress} 1`} filter={`url(#${glowId})`}
    />
  </>
);

/**
 * mist-trail — softer, wider, more diffuse drifting energy: a thick blurred
 * bed with a slow opacity shimmer and a few calm mist puffs riding the lit
 * stretch.
 */
const MIST_PUFF_T = [0.2, 0.45, 0.7, 0.95];

const MistTrail: TrailComponent = ({
  pathD, progress, accent, accentSoft, softId, glowId, pointAt,
}) => {
  const reduceMotion = useReducedMotion();
  return (
    <>
      {/* Wide diffuse bed */}
      <path
        d={pathD} fill="none" pathLength={1}
        stroke={accent} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={`${progress} 1`} opacity="0.16" filter={`url(#${softId})`}
      />
      {/* Soft core with a slow breathing shimmer */}
      <motion.path
        d={pathD} fill="none" pathLength={1}
        stroke={accentSoft} strokeWidth="2.6" strokeLinecap="round"
        strokeDasharray={`${progress} 1`} filter={`url(#${softId})`}
        animate={reduceMotion ? { opacity: 0.4 } : { opacity: [0.28, 0.48, 0.28] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Mist puffs drifting along the lit stretch */}
      {MIST_PUFF_T.map((f, i) => {
        const t = progress * f;
        if (progress < 0.04) return null;
        const p = pointAt(t);
        return (
          <motion.circle
            key={f}
            cx={p.x} cy={p.y} r="3.2"
            fill={accentSoft} filter={`url(#${softId})`}
            animate={
              reduceMotion
                ? { opacity: 0.3 }
                : { opacity: [0.15, 0.4, 0.15], cy: [p.y, p.y - 1.6, p.y] }
            }
            transition={{ duration: 3.6 + i * 0.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.9 }}
          />
        );
      })}
    </>
  );
};

/**
 * starlight-trail — the completed path left with tiny celestial sparks: a
 * subtler base line with small twinkling star points sprinkled along the
 * lit portion.
 */
const SPARK_T = [
  0.06, 0.14, 0.23, 0.31, 0.4, 0.48, 0.57, 0.65, 0.74, 0.82, 0.9, 0.97,
];

const STAR_D = 'M 0 -2.1 L 0.55 -0.55 L 2.1 0 L 0.55 0.55 L 0 2.1 L -0.55 0.55 L -2.1 0 L -0.55 -0.55 Z';

const StarlightTrail: TrailComponent = ({
  pathD, progress, accent, accentSoft, softId, glowId, trailGradId, pointAt,
}) => {
  const reduceMotion = useReducedMotion();
  return (
    <>
      {/* Subtler base — a thin, quiet light under the sparks */}
      <path
        d={pathD} fill="none" pathLength={1}
        stroke={accent} strokeWidth="3" strokeLinecap="round"
        strokeDasharray={`${progress} 1`} opacity="0.14" filter={`url(#${softId})`}
      />
      <path
        d={pathD} fill="none" pathLength={1}
        stroke={`url(#${trailGradId})`} strokeWidth="1.1" strokeLinecap="round"
        strokeDasharray={`${progress} 1`} opacity="0.65"
      />
      {/* Celestial sparks along the lit portion — each twinkles on its own calm phase */}
      {SPARK_T.map((t, i) => {
        if (t > progress) return null;
        const p = pointAt(t);
        const scale = i % 3 === 0 ? 1 : 0.7;
        return (
          <motion.path
            key={t}
            d={STAR_D}
            transform={`translate(${p.x} ${p.y}) scale(${scale})`}
            fill={accentSoft} filter={`url(#${glowId})`}
            animate={
              reduceMotion
                ? { opacity: 0.8 }
                : { opacity: [0.25, 0.95, 0.25] }
            }
            transition={{ duration: 2.6 + (i % 4) * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }}
          />
        );
      })}
    </>
  );
};

export const DEFAULT_TRAIL_ID = 'qi-glow';

const TRAILS: Record<string, TrailComponent> = {
  [DEFAULT_TRAIL_ID]: QiGlowTrail,
  'mist-trail': MistTrail,
  'starlight-trail': StarlightTrail,
};

/** Resolve a trail preset id to its component, falling back to qi-glow. */
export function resolveTrail(id?: string): TrailComponent {
  return (id && TRAILS[id]) || TRAILS[DEFAULT_TRAIL_ID];
}
