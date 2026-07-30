import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  MEDIA_KIND_LABEL,
  type MediaKind,
  type MediaRevealState,
  type RevealedMediaAsset,
} from '../shared/manifestation';

/**
 * MediaScrollReveal — the media active zone's celestial reveal: an agnostic
 * scroll that unseals to reveal whatever standalone asset was generated
 * (cover art, image, audio, visual/motion, future kinds). No narrative
 * characters or story scenes — the scroll is the media-agnostic vessel.
 *
 * Reveal progression (`MediaRevealState`):
 *   sealed    — rolled scroll, golden seal intact, breathing softly
 *   unsealing — seal broken: the scroll parts around a bright core burst,
 *               energy arcs and sparks while generation is in flight
 *   revealed  — the scroll hangs fully unrolled, the finished asset framed
 *               between its rods (a celestial vista placeholder stands in
 *               until the caller supplies `asset`)
 *
 * Stage-only component: it fills whatever space the ManifestationChamber's
 * scene layer gives it and owns no captions or controls. Reduced-motion
 * users get static, calm states. Visual refinement of the reveal comes in a
 * later pass — this establishes the state contract and internal structure
 * (sealed / unsealing / revealed sub-compositions).
 */

export interface MediaScrollRevealProps {
  mediaKind: MediaKind;
  reveal: MediaRevealState;
  asset?: RevealedMediaAsset | null;
}

/** Shared gradient/filter definitions for every scroll state. */
const ScrollDefs: React.FC = () => (
  <defs>
    <linearGradient id="msr-parchment" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#f2eaff" />
      <stop offset="45%" stopColor="#d7c6f0" />
      <stop offset="100%" stopColor="#a98fd1" />
    </linearGradient>
    <linearGradient id="msr-gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#ffe9b0" />
      <stop offset="40%" stopColor="#f5b942" />
      <stop offset="75%" stopColor="#b57e1e" />
      <stop offset="100%" stopColor="#8a5a12" />
    </linearGradient>
    <radialGradient id="msr-burst" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#fff7e0" stopOpacity="0.95" />
      <stop offset="45%" stopColor="#ffd977" stopOpacity="0.55" />
      <stop offset="100%" stopColor="#f5b942" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="msr-vista-sky" cx="50%" cy="38%" r="75%">
      <stop offset="0%" stopColor="#f5e9ff" />
      <stop offset="35%" stopColor="#c9a8ef" />
      <stop offset="70%" stopColor="#6d3fb0" />
      <stop offset="100%" stopColor="#2a1245" />
    </radialGradient>
    <filter id="msr-soft" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="3" />
    </filter>
    <clipPath id="msr-frame-clip">
      <rect x="80" y="62" width="240" height="176" rx="7" />
    </clipPath>
  </defs>
);

/** Left scroll rod with its outward finial (mirrored for the right rod). */
const ScrollRod: React.FC<{ x: number; y: number; flip?: boolean }> = ({ x, y, flip }) => (
  <g transform={flip ? `translate(${2 * x + 24}, 0) scale(-1, 1)` : undefined}>
    <rect x={x} y={y} width="24" height="76" rx="11" fill="url(#msr-gold)" />
    <rect x={x + 4} y={y + 4} width="5" height="68" rx="2.5" fill="#ffffff" opacity="0.35" />
    <path d={`M${x} ${y + 38} L${x - 16} ${y + 29} L${x - 16} ${y + 47} Z`} fill="url(#msr-gold)" />
    <circle cx={x - 2} cy={y + 38} r="3.5" fill="#f5b942" />
  </g>
);

/** ── sealed ──────────────────────────────────────────────────────────── */
const SealedScroll: React.FC<{ calm: boolean }> = ({ calm }) => (
  <g>
    {/* Ground shadow + breathing aura */}
    <ellipse cx="200" cy="206" rx="120" ry="12" fill="#000000" opacity="0.45" filter="url(#msr-soft)" />
    <motion.ellipse
      cx="200" cy="150" rx="150" ry="72" fill="url(#msr-burst)"
      animate={calm ? { opacity: 0.3 } : { opacity: [0.22, 0.4, 0.22] }}
      transition={calm ? { duration: 0 } : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* Rolled body */}
    <rect x="88" y="120" width="224" height="60" rx="30" fill="url(#msr-parchment)" />
    <rect x="96" y="126" width="208" height="12" rx="6" fill="#ffffff" opacity="0.28" />
    <rect x="96" y="162" width="208" height="12" rx="6" fill="#4c1d95" opacity="0.22" />

    {/* Binding bands + rods */}
    <rect x="104" y="120" width="7" height="60" fill="url(#msr-gold)" opacity="0.9" />
    <rect x="289" y="120" width="7" height="60" fill="url(#msr-gold)" opacity="0.9" />
    <ScrollRod x={64} y={112} />
    <ScrollRod x={312} y={112} flip />

    {/* The intact seal */}
    <motion.circle
      cx="200" cy="150" r="30" fill="url(#msr-burst)"
      animate={calm ? { opacity: 0.75 } : { opacity: [0.5, 0.9, 0.5] }}
      transition={calm ? { duration: 0 } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />
    <circle cx="200" cy="150" r="17" fill="#2a1245" stroke="#f5b942" strokeWidth="2.5" />
    <circle cx="200" cy="150" r="11.5" fill="none" stroke="#f5b942" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
    <path
      d="M200 138 L203.5 146.5 L212 150 L203.5 153.5 L200 162 L196.5 153.5 L188 150 L196.5 146.5 Z"
      fill="#ffd977"
    />
  </g>
);

/** ── unsealing ───────────────────────────────────────────────────────── */
const UNSPARKS: Array<[number, number, number]> = [
  // [dx, dy, delay]
  [52, -34, 0], [-46, -40, 0.35], [60, 22, 0.7], [-58, 30, 1.05], [24, -52, 1.4], [-20, 54, 1.75],
];

const UnsealingScroll: React.FC<{ calm: boolean }> = ({ calm }) => (
  <g>
    <ellipse cx="200" cy="206" rx="120" ry="12" fill="#000000" opacity="0.45" filter="url(#msr-soft)" />
    <ellipse cx="200" cy="150" rx="155" ry="80" fill="url(#msr-burst)" opacity="0.35" />

    {/* Parted halves — the scroll splits around the forming vision */}
    <motion.g
      animate={calm ? { x: -28 } : { x: [-26, -32, -26] }}
      transition={calm ? { duration: 0 } : { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <rect x="88" y="120" width="104" height="60" rx="30" fill="url(#msr-parchment)" />
      <rect x="104" y="120" width="7" height="60" fill="url(#msr-gold)" opacity="0.9" />
      <ScrollRod x={64} y={112} />
    </motion.g>
    <motion.g
      animate={calm ? { x: 28 } : { x: [26, 32, 26] }}
      transition={calm ? { duration: 0 } : { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <rect x="208" y="120" width="104" height="60" rx="30" fill="url(#msr-parchment)" />
      <rect x="289" y="120" width="7" height="60" fill="url(#msr-gold)" opacity="0.9" />
      <ScrollRod x={312} y={112} flip />
    </motion.g>

    {/* Core burst where the seal broke */}
    <motion.circle
      cx="200" cy="150" r="34" fill="url(#msr-burst)"
      animate={calm ? { opacity: 0.9 } : { opacity: [0.75, 1, 0.75], scale: [0.92, 1.12, 0.92] }}
      transition={calm ? { duration: 0 } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
    />
    <path
      d="M200 132 L204 146 L218 150 L204 154 L200 168 L196 154 L182 150 L196 146 Z"
      fill="#fff7e0" opacity="0.95"
    />

    {/* Energy arcs riding the broken seal */}
    <motion.g
      animate={calm ? {} : { rotate: 360 }}
      transition={{ repeat: Infinity, duration: 14, ease: 'linear' }}
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
    >
      <circle cx="200" cy="150" r="48" fill="none" stroke="#f5b942" strokeWidth="1.4" strokeDasharray="10 14" opacity="0.55" />
    </motion.g>
    <motion.g
      animate={calm ? {} : { rotate: -360 }}
      transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
    >
      <circle cx="200" cy="150" r="62" fill="none" stroke="#a855f7" strokeWidth="1.1" strokeDasharray="4 10" opacity="0.4" />
    </motion.g>

    {/* Sparks escaping the seam */}
    {!calm &&
      UNSPARKS.map(([dx, dy, delay], i) => (
        <motion.g
          key={i}
          animate={{ x: [0, dx], y: [0, dy], opacity: [0, 1, 0] }}
          transition={{ duration: 1.8, delay, repeat: Infinity, ease: 'easeOut' }}
        >
          <circle cx="200" cy="150" r={i % 2 === 0 ? 2.4 : 1.7} fill={i % 2 === 0 ? '#ffd977' : '#e9d5ff'} />
        </motion.g>
      ))}
  </g>
);

/** ── revealed ────────────────────────────────────────────────────────── */

/** Placeholder celestial vista inside the open scroll until an asset exists. */
const VistaPlaceholder: React.FC<{ mediaKind: MediaKind }> = ({ mediaKind }) => (
  <g clipPath="url(#msr-frame-clip)">
    <rect x="78" y="60" width="244" height="180" fill="url(#msr-vista-sky)" />
    {/* Stars */}
    {[[108, 88], [150, 76], [262, 84], [296, 104], [128, 112], [282, 130]].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r={i % 2 === 0 ? 1.4 : 1} fill="#ffffff" opacity="0.7" />
    ))}
    {/* Sun / moon orb */}
    <circle cx="200" cy="118" r="26" fill="url(#msr-burst)" />
    <circle cx="200" cy="118" r="15" fill="#ffe9b0" opacity="0.95" />
    {/* Mountain ridges */}
    <path
      d="M78 210 L110 172 L145 205 L180 168 L210 198 L245 170 L280 205 L322 178 L322 240 L78 240 Z"
      fill="#3b2066" opacity="0.6"
    />
    <path
      d="M78 200 L120 150 L150 185 L185 140 L215 178 L250 145 L285 190 L322 160 L322 240 L78 240 Z"
      fill="#1c0f33" opacity="0.85"
    />
    <text
      x="200" y="228" textAnchor="middle" fontSize="11" letterSpacing="2"
      fill="#e9d5ff" opacity="0.75" fontFamily="serif" fontStyle="italic"
    >
      {MEDIA_KIND_LABEL[mediaKind]}
    </text>
  </g>
);

const RevealedScroll: React.FC<{
  mediaKind: MediaKind;
  asset?: RevealedMediaAsset | null;
  calm: boolean;
}> = ({ mediaKind, asset, calm }) => (
  <g>
    {/* Suspension glow behind the open scroll */}
    <motion.ellipse
      cx="200" cy="152" rx="170" ry="118" fill="url(#msr-burst)"
      animate={calm ? { opacity: 0.28 } : { opacity: [0.22, 0.34, 0.22] }}
      transition={calm ? { duration: 0 } : { duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* Parchment viewport + framed content */}
    <rect x="78" y="60" width="244" height="180" rx="8" fill="url(#msr-vista-sky)" stroke="#f5b942" strokeWidth="2" opacity="0.98" />
    {asset ? (
      <image
        href={asset.src}
        x="78" y="60" width="244" height="180"
        preserveAspectRatio="xMidYMid slice"
        clipPath="url(#msr-frame-clip)"
        opacity="0.96"
      />
    ) : (
      <VistaPlaceholder mediaKind={mediaKind} />
    )}
    <rect x="84" y="66" width="232" height="168" rx="5" fill="none" stroke="#ffe9b0" strokeWidth="1" opacity="0.35" />

    {/* Golden shimmer sweeping the revealed surface */}
    {!calm && (
      <g clipPath="url(#msr-frame-clip)">
        <g transform="skewX(-14)">
          <motion.rect
            x="60" y="58" width="54" height="186" fill="#ffffff" opacity="0.1"
            animate={{ x: [0, 320] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
          />
        </g>
      </g>
    )}

    {/* Top + bottom rods with finials and center ornaments */}
    {[44, 232].map((y) => (
      <g key={y}>
        <rect x="60" y={y} width="280" height="24" rx="12" fill="url(#msr-gold)" />
        <rect x="66" y={y + 4} width="268" height="6" rx="3" fill="#ffffff" opacity="0.3" />
        <path d={`M60 ${y + 12} L44 ${y + 4} L44 ${y + 20} Z`} fill="url(#msr-gold)" />
        <path d={`M340 ${y + 12} L356 ${y + 4} L356 ${y + 20} Z`} fill="url(#msr-gold)" />
        <circle cx="58" cy={y + 12} r="3.5" fill="#f5b942" />
        <circle cx="342" cy={y + 12} r="3.5" fill="#f5b942" />
        <path
          d={`M200 ${y + 3} L202 ${y + 10} L209 ${y + 12} L202 ${y + 14} L200 ${y + 21} L198 ${y + 14} L191 ${y + 12} L198 ${y + 10} Z`}
          fill="#ffe9b0"
        />
      </g>
    ))}
  </g>
);

export default function MediaScrollReveal({ mediaKind, reveal, asset }: MediaScrollRevealProps) {
  const reduceMotion = useReducedMotion();
  const calm = !!reduceMotion;

  return (
    <div
      className="h-full w-full flex items-center justify-center"
      role="img"
      aria-label={asset?.alt ?? `${MEDIA_KIND_LABEL[mediaKind]} celestial scroll reveal`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={reveal}
          className="h-full w-full"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: calm ? 0 : 0.45, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 400 300" className="h-full w-full block" aria-hidden="true">
            <ScrollDefs />
            {reveal === 'sealed' && <SealedScroll calm={calm} />}
            {reveal === 'unsealing' && <UnsealingScroll calm={calm} />}
            {reveal === 'revealed' && <RevealedScroll mediaKind={mediaKind} asset={asset} calm={calm} />}
          </svg>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
