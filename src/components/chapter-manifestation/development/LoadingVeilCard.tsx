import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import type { LoadingTaskCard } from '../shared/taskCard';
import SwordCultivatorClash from './SwordCultivatorClash';

const ACCENT = {
  versa: '#8B0000',
  scout: '#04ACFF',
} as const;

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
    <svg viewBox="0 0 240 240" className="absolute w-[240px] h-[240px] pointer-events-none" aria-hidden="true">
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

/**
 * Chamber rings — the large circular portal frame that turns the animation
 * area into one continuous magical chamber. Fills its square parent.
 */
const ChamberRings: React.FC<{ isVersa: boolean }> = ({ isVersa }) => {
  const accent = isVersa ? ACCENT.versa : ACCENT.scout;
  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
      {/* Outermost dashed ring, slow drift */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 140, ease: 'linear' }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        <circle cx="200" cy="200" r="194" fill="none" stroke={accent} strokeWidth="0.8" strokeDasharray="1 7" opacity="0.35" />
        {[0, 90, 180, 270].map((deg) => (
          <path
            key={deg}
            d="M200 0 L203.5 6 L200 12 L196.5 6 Z"
            fill={accent}
            opacity="0.6"
            transform={`rotate(${deg} 200 200)`}
          />
        ))}
      </motion.g>

      {/* Solid rim + inner arcs, counter drift */}
      <motion.g
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 200, ease: 'linear' }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        <circle cx="200" cy="200" r="180" fill="none" stroke={accent} strokeWidth="0.7" opacity="0.22" />
        <circle cx="200" cy="200" r="150" fill="none" stroke={accent} strokeWidth="0.6" strokeDasharray="4 8" opacity="0.2" />
      </motion.g>

      {/* Static mid rim that grounds the portal */}
      <circle cx="200" cy="200" r="166" fill="none" stroke={accent} strokeWidth="1" opacity="0.3" />
    </svg>
  );
};

export interface LoadingVeilCardProps {
  task: LoadingTaskCard;
  /**
   * Optional cinematic backdrop (e.g. the celestial particle field) rendered
   * behind the veil content. When present, the veil's dark wash lightens so
   * the backdrop stays visible.
   */
  backdrop?: React.ReactNode;
  /**
   * Optional spacing override for the agent emblem container (margins only).
   */
  emblemClassName?: string;
}

/**
 * DEV copy of LoadingVeil — rebuilt 2026-07-30 as one continuous circular
 * chamber, replacing the stacked rectangular card:
 * 1. Versa hero — emblem + refined violet aura at the top, sized to fill
 *    her zone naturally with less dead space around her
 * 2. Compact chapter status — one always-visible line
 *    ("Chapter 1 · Manifesting 9/20 · ~23s") with a thin progress bar
 *    directly beneath it
 * 3. Circular chamber — a large concentric portal ring filling the remaining
 *    viewport; the manifestation animation (Sword Cultivator Clash) lives
 *    inside the ring as the visual focus. No carousel, dots, scene titles,
 *    or expand controls — the system picks the scene.
 * 4. Versa's evolving line — the rotating quote rests at the bottom of the
 *    chamber, italic and atmospheric.
 *
 * There is deliberately no manual minimize control: while a chapter is
 * generating the veil stays immersive, and background minimization happens
 * through navigation (the caller flips `minimized`), not a button here.
 *
 * Aura work (kept from the previous pass): saturated violet nebula with a
 * bright core, twin counter-rotating cloak wisps, grounded pool, six motes.
 * Workshop-only: do not wire this into production flows.
 */
export default function LoadingVeilCard({ task, backdrop, emblemClassName }: LoadingVeilCardProps) {
  const isVersa = task.agentId === 'versa';
  const progressWidth = task.progress;

  const estimate =
    task.estimatedSecondsRemaining !== null ? `~${task.estimatedSecondsRemaining}s` : null;

  // "Chapter 1 · Manifesting 9/20 · ~23s" — one compact line, always visible.
  const statusLine = [task.trackerTitle, task.trackerDetail, estimate]
    .filter(Boolean)
    .join(' · ');

  return (
    <motion.div
      key="fullscreen-veil"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.985, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }}
      transition={{ duration: 0.25 }}
      className={`fixed inset-0 h-[100dvh] ${backdrop ? 'bg-void/70' : 'bg-void/95'} backdrop-blur-md z-[9999] flex flex-col overflow-hidden text-center select-none`}
    >
      {backdrop && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {backdrop}
        </div>
      )}

      {/* ── Zone 1 · Versa hero ─────────────────────────────────────────────
          Emblem + aura, sized up to fill her zone naturally. The aura layers
          are unchanged — only the footprint is tighter. */}
      <div className="relative z-0 flex-none h-[27dvh] min-h-[168px] flex items-end justify-center pointer-events-none">
        <div className={`relative w-32 h-32 sm:w-36 sm:h-36 ${emblemClassName ?? ''} flex items-center justify-center shrink-0`}>
          <CelestialSigil isVersa={isVersa} />

          {/* Ground pool — a grounded shadow that doesn't rise with her */}
          {isVersa && (
            <motion.div
              aria-hidden="true"
              className="absolute left-1/2 bottom-[8%] -translate-x-1/2 rounded-[50%]"
              style={{
                width: '72%',
                height: '15%',
                background: 'radial-gradient(ellipse at 50% 50%, rgba(168,85,247,0.5) 0%, rgba(76,29,149,0.3) 55%, transparent 80%)',
                filter: 'blur(5px)',
              }}
              animate={{ opacity: [0.65, 1, 0.65], scaleX: [0.92, 1, 0.92] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {isVersa ? (
            <>
              {/* Nebula heart — saturated violet mass, breathing slowly */}
              <motion.div
                aria-hidden="true"
                className="absolute inset-[-55%] rounded-full"
                style={{
                  background:
                    'radial-gradient(circle at 50% 52%, rgba(233,213,255,0.5) 0%, rgba(192,132,252,0.45) 22%, rgba(147,51,234,0.38) 45%, rgba(88,28,135,0.28) 66%, transparent 82%)',
                  filter: 'blur(26px)',
                  mixBlendMode: 'screen',
                }}
                animate={{ opacity: [0.75, 1, 0.75], scale: [0.96, 1.04, 0.96] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Bright core where her power gathers */}
              <motion.div
                aria-hidden="true"
                className="absolute inset-[-6%] rounded-full"
                style={{
                  background:
                    'radial-gradient(circle at 50% 58%, rgba(243,232,255,0.65) 0%, rgba(216,180,254,0.4) 40%, transparent 70%)',
                  filter: 'blur(12px)',
                  mixBlendMode: 'screen',
                }}
                animate={{ opacity: [0.6, 0.95, 0.6] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-[-20%] rounded-full blur-2xl bg-portal/20"
            />
          )}

          {/* Cloak energy — twin counter-rotating violet wisps */}
          {isVersa && (
            <>
              <motion.div
                aria-hidden="true"
                className="absolute inset-[-10%] rounded-full"
                style={{
                  background:
                    'conic-gradient(from 0deg, rgba(168,85,247,0) 0%, rgba(168,85,247,0.55) 18%, rgba(168,85,247,0) 40%, rgba(139,92,246,0.45) 65%, rgba(168,85,247,0) 88%, rgba(168,85,247,0) 100%)',
                  filter: 'blur(8px)',
                  mixBlendMode: 'screen',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                aria-hidden="true"
                className="absolute inset-[-22%] rounded-full"
                style={{
                  background:
                    'conic-gradient(from 180deg, rgba(216,180,254,0) 0%, rgba(216,180,254,0.35) 22%, rgba(216,180,254,0) 46%, rgba(147,51,234,0.3) 70%, rgba(216,180,254,0) 92%, rgba(216,180,254,0) 100%)',
                  filter: 'blur(14px)',
                  mixBlendMode: 'screen',
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
              />
            </>
          )}

          {/* Qi motes rising past her */}
          {isVersa &&
            [0, 1, 2, 3, 4, 5].map(i => (
              <motion.span
                key={i}
                aria-hidden="true"
                className="absolute rounded-full"
                style={{
                  left: `${22 + i * 12}%`,
                  bottom: '14%',
                  width: 3,
                  height: 3,
                  background: 'rgba(233,213,255,0.95)',
                  boxShadow: '0 0 7px rgba(192,132,252,0.95), 0 0 14px rgba(168,85,247,0.6)',
                }}
                animate={{ y: [0, -(48 + i * 8)], opacity: [0, 0.95, 0], x: [0, (i % 2 === 0 ? 1 : -1) * 6] }}
                transition={{ duration: 3 + i * 0.35, repeat: Infinity, delay: i * 0.55, ease: 'easeOut' }}
              />
            ))}

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
              style={isVersa ? { filter: 'drop-shadow(0 0 18px rgba(192,132,252,0.8)) drop-shadow(0 0 46px rgba(147,51,234,0.55))' } : { filter: 'drop-shadow(0 0 15px rgba(4, 172, 255, 0.4))' }}
            />
          </motion.div>
        </div>
      </div>

      {/* ── Zone 2 · Compact chapter status ─────────────────────────────────
          One line, always visible: Chapter 1 · Manifesting 9/20 · ~23s.
          A thin progress bar sits directly beneath it. */}
      <div className="relative z-10 flex-none px-6 pt-3">
        <p className="font-sans text-xs sm:text-sm text-neutral-200 tracking-wide">
          {statusLine}
        </p>
        <div className="mt-1.5 mx-auto w-full max-w-[260px] h-[3px] rounded-full bg-neutral-800/80 overflow-hidden">
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
      </div>

      {/* ── Zone 3 · Circular chamber ───────────────────────────────────────
          One continuous portal ring; the manifestation animation lives inside
          it as the visual focus. No scene-selection UI — the system chooses. */}
      {isVersa && (
        <div className="relative z-10 flex-1 min-h-0 flex items-center justify-center overflow-hidden">
          <div className="relative aspect-square w-[min(88vw,52dvh)] sm:w-[min(72vw,56dvh)]">
            {/* Inner violet glow pooling inside the ring */}
            <div
              aria-hidden="true"
              className="absolute inset-[6%] rounded-full"
              style={{
                background:
                  'radial-gradient(circle at 50% 55%, rgba(147,51,234,0.14) 0%, rgba(88,28,135,0.08) 45%, transparent 72%)',
              }}
            />
            <ChamberRings isVersa={isVersa} />
            {/* The scene, inset so it breathes inside the ring */}
            <div className="absolute inset-[9%] flex items-center justify-center">
              <SwordCultivatorClash />
            </div>
          </div>
        </div>
      )}

      {/* ── Zone 4 · Versa's evolving line ──────────────────────────────────
          The rotating quote rests at the bottom of the chamber where the
          scene title used to be — elegant, atmospheric, the only text that
          changes. */}
      <div className="relative z-10 flex-none px-6 pt-3 pb-7 flex items-center justify-center gap-3 min-h-[44px]">
        <Sparkles size={10} className={`${isVersa ? 'text-human/60' : 'text-portal/60'} shrink-0`} />
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
        <Sparkles size={10} className={`${isVersa ? 'text-human/60' : 'text-portal/60'} shrink-0`} />
      </div>
    </motion.div>
  );
}
