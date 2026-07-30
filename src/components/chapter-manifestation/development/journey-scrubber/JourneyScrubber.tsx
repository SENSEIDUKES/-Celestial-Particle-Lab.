import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { resolveTraveler } from './travelers';

export interface JourneyScrubberStatus {
  /** Stable identity of the operation, e.g. 'Chapter 1'. */
  title: string;
  /** Current state of the work, e.g. 'Manifesting 9/20' or 'Weaving'. Omitted when empty. */
  state?: string;
  /** Live detail, e.g. '~15s' or '12 passages woven'. Rendered as a smaller second line. */
  detail?: string;
}

export interface JourneyScrubberProps {
  /**
   * Normalized journey progress, 0–1. Any caller maps its own units
   * (passages, bytes, steps) onto this range, so the scrubber works for any
   * passage count or flow. Null renders an indeterminate drift.
   */
  progress: number | null;
  /** Layered status text rendered above the path. */
  status: JourneyScrubberStatus;
  /** Traveler skin id — see travelers.ts registry. Defaults to the cultivator. */
  travelerId?: string;
  /** Primary accent (trail, traveler). Violet for Versa, azure for Scout. */
  accent?: string;
  /** Softer accent for glows and highlights. */
  accentSoft?: string;
  /** Destination accent — crimson by default, echoing the manifestation palette. */
  destinationAccent?: string;
  className?: string;
}

/**
 * Journey Scrubber — the manifestation progress presentation as a small
 * celestial journey: a curved qi path, an illuminated trail, milestone
 * motes, a traveler walking the arc, and a destination gate that glows on
 * arrival.
 *
 * Progress is a normalized 0–1 prop; the run loop is decoupled from path
 * position (the cycle loops continuously, position is eased from progress).
 * Every layer is separable: path/trail/milestones/marker live here, the
 * traveler comes from the registry in travelers.ts, and the status layers
 * are plain props — future skins or text layouts touch only their own layer.
 */

// Curved qi path — one subtle quadratic arc, start left, gate right.
const P0 = { x: 18, y: 88 };
const P1 = { x: 200, y: 16 };
const P2 = { x: 382, y: 80 };
const PATH_D = `M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}`;

/** Point on the quadratic bezier at t ∈ [0,1] — exact, cheap, no DOM reads. */
function pointAt(t: number) {
  const u = 1 - t;
  return {
    x: u * u * P0.x + 2 * u * t * P1.x + t * t * P2.x,
    y: u * u * P0.y + 2 * u * t * P1.y + t * t * P2.y,
  };
}

/** Faint milestone motes along the path; each lights as the traveler passes. */
const MILESTONES = [0.15, 0.3, 0.45, 0.6, 0.75, 0.9];

/** The traveler stops just before the gate so the figure stands beside it. */
const TRAVELER_MAX_T = 0.95;

export default function JourneyScrubber({
  progress,
  status,
  travelerId,
  accent = '#a855f7',
  accentSoft = '#d8b4fe',
  destinationAccent = '#ef4444',
  className,
}: JourneyScrubberProps) {
  const reduceMotion = useReducedMotion();
  const clamped = progress === null ? null : Math.min(1, Math.max(0, progress));
  const arrived = clamped !== null && clamped >= 1;

  const Traveler = resolveTraveler(travelerId);

  // Determinate: eased to the progress point. Indeterminate: a calm drift
  // over the first stretch of the path so the veil still breathes.
  const travelerT = clamped === null ? null : Math.min(clamped, TRAVELER_MAX_T);
  const travelerPoint = travelerT === null ? null : pointAt(travelerT);
  const drift = React.useMemo(() => [pointAt(0.05), pointAt(0.32), pointAt(0.05)], []);

  const uid = React.useId().replace(/:/g, '');
  const glowId = `js-glow-${uid}`;
  const softId = `js-soft-${uid}`;
  const trailGradId = `js-trail-${uid}`;

  return (
    <div className={`flex flex-col items-center ${className ?? ''}`}>
      {/* Layered status — identity / current state / live detail.
          Wraps naturally; no fixed single-line contract to break. */}
      <p className="font-sans text-xs sm:text-sm tracking-wide text-center">
        <span className="text-neutral-100 font-medium">{status.title}</span>
        {status.state ? <span className="text-neutral-300"> · {status.state}</span> : null}
      </p>
      {status.detail ? (
        <p className="font-sans text-[11px] text-neutral-500 tracking-wide text-center">
          {status.detail}
        </p>
      ) : null}

      <svg
        viewBox="0 0 400 116"
        className="mt-1 w-full max-w-[300px] block overflow-visible"
        role="progressbar"
        aria-label={`${status.title}${status.state ? `, ${status.state}` : ''}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped === null ? undefined : Math.round(clamped * 100)}
      >
        <defs>
          <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={softId} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <linearGradient
            id={trailGradId}
            gradientUnits="userSpaceOnUse"
            x1={P0.x} y1={P0.y} x2={P2.x} y2={P2.y}
          >
            <stop offset="0%" stopColor={accentSoft} stopOpacity="0.55" />
            <stop offset="100%" stopColor={accent} />
          </linearGradient>
        </defs>

        {/* Resting path — faint, with a soft violet bed beneath */}
        <path d={PATH_D} fill="none" stroke={accent} strokeWidth="3.5" opacity="0.1" filter={`url(#${softId})`} />
        <path d={PATH_D} fill="none" stroke="#8b8b9e" strokeWidth="1" opacity="0.28" />

        {/* Illuminated trail — the completed portion lights up behind the traveler */}
        {clamped !== null ? (
          <>
            <path
              d={PATH_D} fill="none" pathLength={1}
              stroke={accent} strokeWidth="4" strokeLinecap="round"
              strokeDasharray={`${clamped} 1`} opacity="0.3" filter={`url(#${softId})`}
            />
            <path
              d={PATH_D} fill="none" pathLength={1}
              stroke={`url(#${trailGradId})`} strokeWidth="1.8" strokeLinecap="round"
              strokeDasharray={`${clamped} 1`} filter={`url(#${glowId})`}
            />
          </>
        ) : (
          <motion.path
            d={PATH_D} fill="none" pathLength={1}
            stroke={accent} strokeWidth="1.6" strokeLinecap="round"
            strokeDasharray="0.28 1" opacity="0.5"
            animate={reduceMotion ? { opacity: 0.5 } : { opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Milestone motes — light as the traveler passes */}
        {MILESTONES.map((t) => {
          const p = pointAt(t);
          const lit = clamped !== null && clamped >= t;
          return (
            <circle
              key={t}
              cx={p.x} cy={p.y} r={lit ? 2 : 1.4}
              fill={lit ? accentSoft : 'none'}
              stroke={lit ? 'none' : '#8b8b9e'}
              strokeWidth="0.8"
              opacity={lit ? 0.95 : 0.45}
              filter={lit ? `url(#${glowId})` : undefined}
            />
          );
        })}

        {/* Destination gate — twin pillars, arch, and a sealed orb */}
        <g transform={`translate(${P2.x} ${P2.y})`}>
          <ellipse cx="0" cy="1" rx="12" ry="2.2" fill={destinationAccent} opacity={arrived ? 0.3 : 0.12} filter={`url(#${softId})`} />
          <g
            stroke={destinationAccent} strokeWidth="1.6" strokeLinecap="round" fill="none"
            opacity={arrived ? 1 : 0.7}
            filter={arrived ? `url(#${glowId})` : undefined}
          >
            <line x1="-8" y1="0" x2="-8" y2="-22" />
            <line x1="8" y1="0" x2="8" y2="-22" />
            <path d="M -8 -22 Q 0 -31 8 -22" />
          </g>
          <motion.circle
            cx="0" cy="-13" r="3"
            fill={arrived ? accentSoft : destinationAccent}
            animate={
              reduceMotion
                ? { opacity: arrived ? 1 : 0.55 }
                : arrived
                  ? { opacity: [0.7, 1, 0.7], scale: [1, 1.25, 1] }
                  : { opacity: [0.4, 0.7, 0.4] }
            }
            transition={{ duration: arrived ? 1.4 : 3.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
          {/* Arrival ring — breathes outward from the gate once complete */}
          {arrived && !reduceMotion && (
            <motion.circle
              cx="0" cy="-13" r="9" fill="none"
              stroke={destinationAccent} strokeWidth="1"
              animate={{ scale: [0.4, 1.7], opacity: [0.8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
          )}
        </g>

        {/* Traveler — position driven by progress; body loop runs independently */}
        <motion.g
          initial={false}
          animate={
            travelerPoint
              ? { x: travelerPoint.x, y: travelerPoint.y }
              : { x: drift.map((p) => p.x), y: drift.map((p) => p.y) }
          }
          transition={
            travelerPoint
              ? { duration: reduceMotion ? 0 : 0.8, ease: 'easeOut' }
              : { duration: 4.4, times: [0, 0.5, 1], repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <Traveler
            accent={accent}
            accentSoft={accentSoft}
            moving={!arrived}
            arrived={arrived}
            filterId={glowId}
          />
        </motion.g>
      </svg>
    </div>
  );
}
