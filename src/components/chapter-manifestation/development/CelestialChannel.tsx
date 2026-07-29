import React from 'react';
import { motion } from 'motion/react';

/**
 * Celestial Channel — a calm counterpoint scene for the manifestation
 * carousel: a breathing violet core ringed by slowly counter-rotating
 * crimson and violet qi orbits, with motes rising through the channel.
 * Reads as Versa gathering power between clashes.
 *
 * Stage-only component — caption and dots live in the veil card. SVG scales
 * with contain into whatever space it is given.
 */

/** Rising motes: [cx, cy, r, color, duration, delay] */
const MOTES: Array<[number, number, number, string, number, number]> = [
  [150, 190, 1.3, '#c084fc', 4.6, 0],
  [185, 205, 1.1, '#e8e4f0', 5.2, 0.9],
  [215, 200, 1.2, '#d8b4fe', 4.9, 1.7],
  [250, 185, 1.1, '#fca5a5', 5.5, 0.5],
  [120, 160, 1.0, '#a855f7', 5.0, 2.2],
  [280, 160, 1.0, '#f87171', 4.4, 1.2],
];

export default function CelestialChannel() {
  return (
    <svg viewBox="0 0 400 250" className="h-full w-full block" aria-hidden="true">
      <defs>
        <filter id="scc-channel-soft" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <radialGradient id="scc-channel-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f5f0ff" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#c084fc" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#7e22ce" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#7e22ce" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Breathing core */}
      <motion.circle
        cx="200" cy="115" r="52" fill="url(#scc-channel-core)"
        animate={{ scale: [0.92, 1.06, 0.92], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
      <circle cx="200" cy="115" r="6" fill="#f5f0ff" filter="url(#scc-channel-soft)" />

      {/* Outer crimson orbit — slow drift */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        <ellipse cx="200" cy="115" rx="130" ry="56" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 9" opacity="0.4" />
        <circle cx="330" cy="115" r="2.4" fill="#fca5a5" opacity="0.8" />
      </motion.g>

      {/* Mid violet orbit — counter-drift */}
      <motion.g
        animate={{ rotate: -360 }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        <ellipse cx="200" cy="115" rx="96" ry="40" fill="none" stroke="#a855f7" strokeWidth="1.1" strokeDasharray="4 7" opacity="0.5" />
        <circle cx="296" cy="115" r="2.2" fill="#d8b4fe" opacity="0.85" />
      </motion.g>

      {/* Inner bright ring holding the core */}
      <ellipse cx="200" cy="115" rx="62" ry="26" fill="none" stroke="#e8e4f0" strokeWidth="0.8" opacity="0.3" />

      {/* Rising motes */}
      {MOTES.map(([cx, cy, r, color, dur, delay], i) => (
        <motion.circle
          key={i}
          cx={cx} cy={cy} r={r} fill={color}
          animate={{ y: [0, -34], opacity: [0, 0.8, 0] }}
          transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  );
}
