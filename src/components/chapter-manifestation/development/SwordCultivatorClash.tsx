import React from 'react';
import { motion } from 'motion/react';

/**
 * Sword Cultivator Clash — a looping manifestation diorama. Two flying sword
 * cultivators drift in from opposite sides, clash once at the center with a
 * spark, recoil, and glide back out on a clean 8-second loop. Circular qi
 * trails flow beneath them, a pulse ring breathes outward from each clash,
 * and faint motes keep the scene alive.
 *
 * Stage-only component: caption, carousel dots, and expand controls live in
 * the veil card so several animation scenes can share one footer. The SVG
 * scales with contain (xMidYMid meet) into whatever space the card gives it.
 * Pure SVG + motion — sharp and cheap on mobile.
 */

const LOOP = 8;

const RED = { glow: '#ef4444', core: '#fca5a5', hot: '#fff1f0' };
const VIOLET = { glow: '#a855f7', core: '#d8b4fe', hot: '#f5f0ff' };

interface RiderPalette {
  glow: string;
  core: string;
  hot: string;
}

/** One sword-rider, drawn facing right. Mirror with scale(-1,1) for the other side. */
const Rider: React.FC<{ p: RiderPalette; filterId: string; bladeId: string }> = ({ p, filterId, bladeId }) => (
  <g>
    {/* Tail streak trailing behind the blade */}
    <line x1="-44" y1="4" x2="-92" y2="7" stroke={p.glow} strokeWidth="2.4" strokeLinecap="round" opacity="0.35" />
    <line x1="-44" y1="4" x2="-72" y2="5" stroke={p.core} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />

    {/* Flying sword — elongated diamond blade, bright tip */}
    <path d="M -46 4 L 30 -4 L 66 0 L 30 7 Z" fill={`url(#${bladeId})`} filter={`url(#${filterId})`} />
    <line x1="-38" y1="3.4" x2="62" y2="0.6" stroke={p.hot} strokeWidth="1" strokeLinecap="round" opacity="0.85" />

    {/* Cultivator — hooded silhouette riding the blade */}
    <g filter={`url(#${filterId})`}>
      <path
        d="M -6 -34 C -14 -32 -18 -24 -16 -14 C -15 -8 -12 -4 -9 -2 L -1 -3 C 3 -10 2 -22 -2 -28 C -3 -31 -4 -33 -6 -34 Z"
        fill={p.glow}
      />
      <circle cx="-6" cy="-36" r="4.6" fill={p.core} />
      <circle cx="-6" cy="-36" r="1.8" fill={p.hot} />
    </g>

    {/* Flowing ribbons */}
    <path d="M -14 -16 C -28 -22 -40 -18 -54 -26" stroke={p.glow} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.7" />
    <path d="M -14 -9 C -26 -7 -36 -11 -48 -8" stroke={p.core} strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.5" />
  </g>
);

/** Ambient motes: [cx, cy, r, color, duration, delay] */
const SPARKS: Array<[number, number, number, string, number, number]> = [
  [70, 150, 1.4, '#fca5a5', 4.2, 0],
  [120, 192, 1.1, '#f87171', 5.1, 0.8],
  [180, 208, 1.3, '#e8e4f0', 4.6, 1.6],
  [230, 202, 1.1, '#d8b4fe', 5.4, 0.4],
  [285, 188, 1.4, '#c084fc', 4.4, 1.2],
  [335, 150, 1.2, '#a855f7', 5.0, 2.0],
  [95, 118, 1.0, '#fca5a5', 4.8, 2.4],
  [305, 118, 1.0, '#d8b4fe', 4.3, 0.6],
  [200, 56, 1.2, '#e8e4f0', 5.6, 1.0],
];

/** Shared rider drift keyframes — approach, clash, recoil, glide out. */
const riderTransition = {
  duration: LOOP,
  times: [0, 0.08, 0.4, 0.45, 0.52, 0.8, 0.94],
  repeat: Infinity,
  ease: 'easeInOut' as const,
};

export default function SwordCultivatorClash() {
  return (
    <svg viewBox="0 0 400 250" className="h-full w-full block" aria-hidden="true">
      <defs>
        <filter id="scc-glow-red" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="scc-glow-violet" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="scc-soft" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <linearGradient id="scc-blade-red" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.3" />
          <stop offset="55%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#fff1f0" />
        </linearGradient>
        <linearGradient id="scc-blade-violet" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.3" />
          <stop offset="55%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#f5f0ff" />
        </linearGradient>
        <linearGradient id="scc-arc-red" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="scc-arc-violet" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Faint orbit ellipse the trails ride on */}
      <ellipse cx="200" cy="130" rx="118" ry="52" fill="none" stroke="#8b8b9e" strokeWidth="0.7" opacity="0.14" />

      {/* Glow underlay for the circular energy trails */}
      <path d="M 84 116 A 118 52 0 0 0 200 182" fill="none" stroke="#ef4444" strokeWidth="4" opacity="0.12" filter="url(#scc-soft)" />
      <path d="M 316 116 A 118 52 0 0 1 200 182" fill="none" stroke="#a855f7" strokeWidth="4" opacity="0.12" filter="url(#scc-soft)" />

      {/* Flowing qi trails — energy streaming around the loop */}
      <motion.path
        d="M 84 116 A 118 52 0 0 0 200 182"
        fill="none" stroke="url(#scc-arc-red)" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 11"
        animate={{ strokeDashoffset: [0, -112] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />
      <motion.path
        d="M 316 116 A 118 52 0 0 1 200 182"
        fill="none" stroke="url(#scc-arc-violet)" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 11"
        animate={{ strokeDashoffset: [0, 112] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />

      {/* Pulse rings breathing outward from each clash */}
      <motion.g
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        animate={{ scale: [0.2, 0.2, 1.7], opacity: [0, 0.8, 0] }}
        transition={{ duration: LOOP, times: [0, 0.42, 0.72], repeat: Infinity, ease: 'easeOut' }}
      >
        <circle cx="200" cy="101" r="34" fill="none" stroke="#e8e4f0" strokeWidth="1.6" />
      </motion.g>
      <motion.g
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        animate={{ scale: [0.2, 0.2, 1.45], opacity: [0, 0.5, 0] }}
        transition={{ duration: LOOP, times: [0, 0.47, 0.8], repeat: Infinity, ease: 'easeOut' }}
      >
        <circle cx="200" cy="101" r="48" fill="none" stroke="#c084fc" strokeWidth="1.1" />
      </motion.g>

      {/* Crimson cultivator — rides in from the left */}
      <motion.g
        animate={{ x: [-56, -56, 0, 0, -9, -30, -56], opacity: [0, 1, 1, 1, 1, 0.85, 0] }}
        transition={riderTransition}
      >
        <g transform="translate(136 82) rotate(16)">
          <Rider p={RED} filterId="scc-glow-red" bladeId="scc-blade-red" />
        </g>
      </motion.g>

      {/* Violet cultivator — rides in from the right, mirrored */}
      <motion.g
        animate={{ x: [56, 56, 0, 0, 9, 30, 56], opacity: [0, 1, 1, 1, 1, 0.85, 0] }}
        transition={riderTransition}
      >
        <g transform="translate(264 82) scale(-1 1) rotate(16)">
          <Rider p={VIOLET} filterId="scc-glow-violet" bladeId="scc-blade-violet" />
        </g>
      </motion.g>

      {/* Clash spark — a single sharp flash at blade contact */}
      <motion.g
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        animate={{ scale: [0.15, 0.15, 1.4, 0.85, 0.3], opacity: [0, 0, 1, 0.65, 0] }}
        transition={{ duration: LOOP, times: [0, 0.385, 0.425, 0.5, 0.62], repeat: Infinity, ease: 'easeOut' }}
      >
        <g transform="translate(200 101)">
          {[0, 45, 90, 135].map((deg) => (
            <line key={deg} x1="0" y1="-7" x2="0" y2="-19" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" transform={`rotate(${deg})`} />
          ))}
          <path d="M0 -17 L3 -3 L17 0 L3 3 L0 17 L-3 3 L-17 0 L-3 -3 Z" fill="#ffffff" filter="url(#scc-soft)" />
          <circle r="4.5" fill="#ffffff" />
        </g>
      </motion.g>

      {/* Ambient motes keeping the scene alive between clashes */}
      {SPARKS.map(([cx, cy, r, color, dur, delay], i) => (
        <motion.circle
          key={i}
          cx={cx} cy={cy} r={r} fill={color}
          animate={{ y: [0, -26], opacity: [0, 0.75, 0] }}
          transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  );
}
