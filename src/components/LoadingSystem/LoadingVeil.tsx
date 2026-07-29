import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Minimize2 } from 'lucide-react';
import type { LoadingTaskCard } from './taskCard';

const ACCENT = {
  versa: '#8B0000',
  scout: '#04ACFF',
} as const;

/**
 * Library Seal — the order's pen-nib sigil inside a circular seal ring.
 * The outer arc slowly fills as the chapter forms, so the emblem itself
 * is the loading indicator.
 */
const LibrarySeal: React.FC<{ progress: number | null; isVersa: boolean }> = ({ progress, isVersa }) => {
  const accent = isVersa ? ACCENT.versa : ACCENT.scout;
  const R = 26;
  const CIRCUMFERENCE = 2 * Math.PI * R;
  const filled = progress !== null ? (CIRCUMFERENCE * (1 - progress / 100)) : CIRCUMFERENCE * 0.72;

  return (
    <svg
      viewBox="0 0 64 64"
      className="w-16 h-16 shrink-0"
      style={{ filter: `drop-shadow(0 0 6px ${isVersa ? 'rgba(139,0,0,0.45)' : 'rgba(4,172,255,0.45)'})` }}
      aria-hidden="true"
    >
      {/* Cardinal seal ticks */}
      <g stroke={accent} strokeWidth="1" opacity="0.5">
        <line x1="32" y1="1" x2="32" y2="5" />
        <line x1="32" y1="59" x2="32" y2="63" />
        <line x1="1" y1="32" x2="5" y2="32" />
        <line x1="59" y1="32" x2="63" y2="32" />
      </g>

      {/* Track ring */}
      <circle cx="32" cy="32" r={R} fill="none" stroke="#262626" strokeWidth="2.5" />

      {/* Filling arc — indeterminate phases sweep a partial arc instead */}
      {progress !== null ? (
        <circle
          cx="32" cy="32" r={R} fill="none"
          stroke={accent} strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={filled}
          transform="rotate(-90 32 32)"
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      ) : (
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <circle
            cx="32" cy="32" r={R} fill="none"
            stroke={accent} strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={filled}
          />
        </motion.g>
      )}

      {/* Inner dashed ornament ring */}
      <circle cx="32" cy="32" r="19" fill="none" stroke={accent} strokeWidth="1" strokeDasharray="2 4" opacity="0.35" />

      {/* Pen-nib glyph */}
      <g stroke={accent} strokeWidth="1.5" fill="none" opacity="0.9">
        <path d="M32 19 L37 33 L32 45 L27 33 Z" />
        <line x1="32" y1="31" x2="32" y2="40" />
      </g>
      <circle cx="32" cy="29" r="1.2" fill={accent} opacity="0.9" />
    </svg>
  );
};

/**
 * Celestial matrix — faint concentric rings, star points, and cardinal sparks
 * drifting behind the agent emblem so the top section reads as a cosmic sigil.
 */
const CelestialSigil: React.FC<{ isVersa: boolean }> = ({ isVersa }) => {
  const accent = isVersa ? ACCENT.versa : ACCENT.scout;
  const stars = React.useMemo<Array<[number, number, number, number]>>(() => [
    // [cx, cy, r, opacity]
    [38, 52, 1.1, 0.5], [196, 64, 0.9, 0.4], [52, 178, 1.2, 0.45], [188, 186, 0.8, 0.35],
    [86, 30, 0.7, 0.4], [152, 34, 1.0, 0.45], [28, 118, 0.8, 0.35], [210, 122, 1.1, 0.4],
    [104, 208, 0.9, 0.4], [140, 204, 0.7, 0.3], [64, 96, 0.6, 0.3], [176, 100, 0.6, 0.3],
  ], []);
  const ticks = React.useMemo(() => Array.from({ length: 12 }, (_, i) => i * 30), []);

  return (
    <svg viewBox="0 0 240 240" className="absolute w-[280px] h-[280px] pointer-events-none" aria-hidden="true">
      {/* Slow-drifting outer dashed ring */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 80, ease: 'linear' }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        <circle cx="120" cy="120" r="110" fill="none" stroke={accent} strokeWidth="0.8" strokeDasharray="1 6" opacity="0.3" />
        {/* Cardinal diamond sparks riding the outer ring */}
        {[0, 90, 180, 270].map((deg) => (
          <path
            key={deg}
            d="M120 6 L123 10 L120 14 L117 10 Z"
            fill={accent}
            opacity="0.55"
            transform={`rotate(${deg} 120 120)`}
          />
        ))}
      </motion.g>

      {/* Counter-drifting mid ring with tick marks */}
      <motion.g
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 120, ease: 'linear' }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        <circle cx="120" cy="120" r="96" fill="none" stroke={accent} strokeWidth="0.6" opacity="0.18" />
        <circle cx="120" cy="120" r="70" fill="none" stroke={accent} strokeWidth="0.7" strokeDasharray="3 5" opacity="0.22" />
        {ticks.map((deg) => (
          <line
            key={deg}
            x1="120" y1="17" x2="120" y2="22"
            stroke={accent} strokeWidth="0.8" opacity="0.3"
            transform={`rotate(${deg} 120 120)`}
          />
        ))}
      </motion.g>

      {/* Fixed star field */}
      {stars.map(([cx, cy, r, opacity], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#E8E4F0" opacity={opacity} />
      ))}
    </svg>
  );
};

export interface LoadingVeilProps {
  task: LoadingTaskCard;
  onMinimize: () => void;
}

/**
 * Primary mode — the full-screen immersive veil for blocking operations.
 * Pure presentation: everything it shows comes from the LoadingTaskCard.
 */
export default function LoadingVeil({ task, onMinimize }: LoadingVeilProps) {
  const isVersa = task.agentId === 'versa';
  const progressWidth = task.progress;

  return (
    <motion.div
      key="fullscreen-veil"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.985, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 bg-void/95 backdrop-blur-md z-[9999] flex flex-col items-center justify-center p-6 text-center overflow-y-auto"
    >
      {/* Top-right icon-only minimize control */}
      <button
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}
        onClick={onMinimize}
        title="Minimize to Background"
        aria-label="Minimize to Background"
        className="absolute top-5 right-5 sm:top-6 sm:right-6 w-10 h-10 rounded-full border border-portal/35 bg-portal/10 hover:bg-portal/20 text-portal flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(4,172,255,0.1)] hover:shadow-[0_0_20px_rgba(4,172,255,0.3)] cursor-pointer"
      >
        <Minimize2 size={15} />
      </button>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[420px] h-[420px] rounded-full bg-radial-gradient from-portal/10 via-human/5 to-transparent blur-3xl pointer-events-none"></div>

      {/* Agent character — floating emblem inside a celestial matrix sigil */}
      <div className="relative w-36 h-36 sm:w-40 sm:h-40 mb-10 mt-4 flex items-center justify-center shrink-0">
        <CelestialSigil isVersa={isVersa} />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute inset-[-20%] rounded-full blur-2xl ${isVersa ? 'bg-human/20' : 'bg-portal/20'}`}
        />
        <motion.div
          className="relative z-10 w-full h-full flex items-center justify-center"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src={task.icon.src}
            alt={task.icon.alt}
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
            style={isVersa ? { filter: 'drop-shadow(0 0 15px rgba(139, 0, 0, 0.4))' } : { filter: 'drop-shadow(0 0 15px rgba(4, 172, 255, 0.4))' }}
          />
        </motion.div>
      </div>

      {/* Unified agent card — name, rotating status quote, seal progress, atmospheric phrase */}
      <div className={`w-full max-w-md bg-neutral-950/80 border ${isVersa ? 'border-human/25' : 'border-portal/25'} rounded-xl px-5 sm:px-6 py-6 shadow-[0_0_40px_rgba(0,0,0,0.6)]`}>
        {/* Card header — the agent's name alone carries the hierarchy */}
        <div className="mb-2">
          <span className={`font-display font-bold text-2xl tracking-[0.35em] ${task.colorClass}`}>
            {task.operationName}
          </span>
        </div>

        {/* Ornamented divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`h-px flex-1 ${isVersa ? 'bg-human/20' : 'bg-portal/20'}`} />
          <Sparkles size={10} className={isVersa ? 'text-human/60' : 'text-portal/60'} />
          <div className={`h-px flex-1 ${isVersa ? 'bg-human/20' : 'bg-portal/20'}`} />
        </div>

        {/* Rotating status quote — soft crossfade, the only text allowed to change */}
        <div className="min-h-[24px] flex items-center justify-center mb-6">
          <AnimatePresence mode="wait">
            <motion.span
              key={task.status}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="font-serif italic text-sm text-neutral-300 leading-snug"
            >
              {task.status}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Progress row — Library Seal left, persistent chapter tracker beside it */}
        <div className="flex items-center gap-4 mb-5">
          <LibrarySeal progress={progressWidth} isVersa={isVersa} />

          <div className="flex-1 text-left">
            {/* Persistent — never fades while Versa works */}
            <p className="font-display text-base text-signal tracking-wide mb-1">
              {task.trackerTitle}
            </p>
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <span className="font-sans text-[11px] text-neutral-400">
                {task.trackerDetail}
              </span>
              {task.estimatedSecondsRemaining !== null && (
                <span className="font-mono text-[10px] text-neutral-450 shrink-0">~{task.estimatedSecondsRemaining}s</span>
              )}
            </div>
            <div className="h-1 rounded-full bg-neutral-800/90 overflow-hidden">
              {progressWidth !== null ? (
                <motion.div
                  className={`h-full rounded-full ${isVersa ? 'bg-human shadow-[0_0_8px_rgba(139,0,0,0.6)]' : 'bg-portal shadow-[0_0_8px_rgba(4,172,255,0.6)]'}`}
                  initial={{ width: '6%' }}
                  animate={{ width: `${progressWidth}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              ) : (
                <motion.div
                  className={`h-full rounded-full ${isVersa ? 'bg-human shadow-[0_0_8px_rgba(139,0,0,0.6)]' : 'bg-portal shadow-[0_0_8px_rgba(4,172,255,0.6)]'}`}
                  animate={{ width: ['12%', '55%', '12%'] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </div>
            {task.trackerNote && (
              <p className="font-sans text-[10px] text-neutral-500 mt-2 leading-snug">
                {task.trackerNote}
              </p>
            )}
          </div>
        </div>

        {/* Ornamented divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-neutral-800" />
          <Sparkles size={10} className={isVersa ? 'text-human/60' : 'text-portal/60'} />
          <div className="h-px flex-1 bg-neutral-800" />
        </div>

        {/* Atmospheric phrase */}
        <p className="font-serif italic text-sm text-neutral-300 leading-relaxed max-w-sm mx-auto">
          {task.description}
        </p>
      </div>

      {/* Phase marker beneath the card — stable for the whole generation */}
      <div className="mt-8">
        <span className="font-sc text-[10px] tracking-[0.3em] font-bold uppercase text-portal/90 bg-portal/5 px-4 py-2 border border-portal/25 rounded-full shadow-[0_0_12px_rgba(4,172,255,0.1)]">
          {task.operationTitle}
        </span>
      </div>
    </motion.div>
  );
}
