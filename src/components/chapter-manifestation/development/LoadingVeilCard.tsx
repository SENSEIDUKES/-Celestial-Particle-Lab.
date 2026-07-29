import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import type { LoadingTaskCard } from '../shared/taskCard';
import SwordCultivatorClash from './SwordCultivatorClash';
import CelestialChannel from './CelestialChannel';

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

export interface LoadingVeilCardProps {
  task: LoadingTaskCard;
  onMinimize: () => void;
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

/** Manifestation animation scenes available in the carousel. */
const SCENES = [
  { id: 'channel', title: 'Celestial Channel', node: <CelestialChannel /> },
  { id: 'clash', title: 'Sword Cultivator Clash', node: <SwordCultivatorClash /> },
] as const;

const sceneVariants = {
  enter: (dir: number) => ({ x: dir >= 0 ? 70 : -70, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? -70 : 70, opacity: 0 }),
};

/**
 * DEV copy of LoadingVeil — rebuilt 2026-07-30 as a single 100dvh mobile
 * composition with three zones, no vertical scrolling:
 * 1. Versa hero — emblem + refined violet aura, overlapping the card's top
 * 2. Compact chapter status — VERSA, rotating quote, Chapter · time row,
 *    Manifesting N/20, progress bar; collapses to one thin row when the
 *    animation is expanded
 * 3. Animation area — flex-grows into the remaining viewport, scenes scale
 *    with contain, swipe horizontally between manifestation animations
 *
 * Aura work (kept from the previous pass): saturated violet nebula with a
 * bright core, twin counter-rotating cloak wisps, grounded pool, six motes.
 * Workshop-only: do not wire this into production flows.
 */
export default function LoadingVeilCard({ task, onMinimize, backdrop, emblemClassName }: LoadingVeilCardProps) {
  const isVersa = task.agentId === 'versa';
  const progressWidth = task.progress;

  const [expanded, setExpanded] = React.useState(false);
  const [[sceneIndex, sceneDir], setScene] = React.useState<[number, number]>([1, 0]);

  const goScene = (dir: number) =>
    setScene(([i]) => [(i + dir + SCENES.length) % SCENES.length, dir]);

  const estimate =
    task.estimatedSecondsRemaining !== null ? `~${task.estimatedSecondsRemaining}s` : null;

  const compactStatusLine = [task.trackerTitle, task.trackerDetail, estimate]
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

      {/* Top-right icon-only minimize control */}
      <button
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}
        onClick={onMinimize}
        title="Minimize to Background"
        aria-label="Minimize to Background"
        className="absolute z-20 top-5 right-5 sm:top-6 sm:right-6 w-10 h-10 rounded-full border border-portal/35 bg-portal/10 hover:bg-portal/20 text-portal flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(4,172,255,0.1)] hover:shadow-[0_0_20px_rgba(4,172,255,0.3)] cursor-pointer"
      >
        <Minimize2 size={15} />
      </button>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[420px] h-[420px] rounded-full bg-radial-gradient from-portal/10 via-human/5 to-transparent blur-3xl pointer-events-none"></div>

      {/* ── Zone 1 · Versa hero ─────────────────────────────────────────────
          Emblem + aura. Sits low with a negative bottom margin so the aura
          spills over the card's top edge and the two zones feel connected. */}
      <div className="relative z-0 flex-none h-[26dvh] min-h-[148px] -mb-7 flex items-end justify-center pointer-events-none">
        <div className={`relative w-28 h-28 sm:w-32 sm:h-32 ${emblemClassName ?? ''} flex items-center justify-center shrink-0`}>
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

      {/* ── Zones 2 + 3 · Manifestation card ────────────────────────────────
          flex-1 + min-h-0: the card claims the remaining viewport and the
          animation grows into whatever is left after the compact status. */}
      <div className="relative z-10 flex-1 min-h-0 w-full max-w-md mx-auto px-4 pb-4 flex">
        <div
          data-celestial-foreground
          className={`flex-1 min-h-0 flex flex-col bg-neutral-950/80 border ${isVersa ? 'border-human/25' : 'border-portal/25'} rounded-xl px-5 pt-4 pb-3 shadow-[0_0_40px_rgba(0,0,0,0.6)]`}
        >
          {/* ── Zone 2 · Compact chapter status ── */}
          {expanded && isVersa ? (
            /* Collapsed thin row while the animation takes over */
            <div className="flex-none mb-2">
              <span className="font-sans text-[11px] text-neutral-300 tracking-wide">
                {compactStatusLine}
              </span>
            </div>
          ) : (
            <>
              {/* Card header — the agent's name alone carries the hierarchy */}
              <div className="flex-none mb-1.5">
                <span className={`font-display font-bold text-xl tracking-[0.35em] ${task.colorClass}`}>
                  {task.operationName}
                </span>
              </div>

              {/* Ornamented divider */}
              <div className="flex-none flex items-center gap-3 mb-2">
                <div className={`h-px flex-1 ${isVersa ? 'bg-human/20' : 'bg-portal/20'}`} />
                <Sparkles size={10} className={isVersa ? 'text-human/60' : 'text-portal/60'} />
                <div className={`h-px flex-1 ${isVersa ? 'bg-human/20' : 'bg-portal/20'}`} />
              </div>

              {/* Rotating status quote — soft crossfade, the only text allowed to change */}
              <div className="flex-none min-h-[20px] flex items-center justify-center mb-2.5">
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

              {/* Chapter data — tight rows: title + estimate, manifesting, bar */}
              <div className="flex-none text-left mb-2.5">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <span className="font-display text-sm text-signal tracking-wide">
                    {task.trackerTitle}
                  </span>
                  {estimate && (
                    <span className="font-mono text-[10px] text-neutral-400 shrink-0">{estimate}</span>
                  )}
                </div>
                <div className="mb-1.5">
                  <span className="font-sans text-[11px] text-neutral-400">
                    {task.trackerDetail}
                  </span>
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
              </div>

              {/* Divider above the animation */}
              {isVersa && (
                <div className="flex-none flex items-center gap-3 mb-1">
                  <div className="h-px flex-1 bg-human/20" />
                  <Sparkles size={10} className="text-human/60" />
                  <div className="h-px flex-1 bg-human/20" />
                </div>
              )}
            </>
          )}

          {/* ── Zone 3 · Animation area — grows into the remaining space ── */}
          {isVersa && (
            <>
              <div className="relative flex-1 min-h-0 overflow-hidden">
                <AnimatePresence custom={sceneDir} initial={false} mode="popLayout">
                  <motion.div
                    key={SCENES[sceneIndex].id}
                    custom={sceneDir}
                    variants={sceneVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.25}
                    onDragEnd={(_e, info) => {
                      if (info.offset.x < -60 || info.velocity.x < -400) goScene(1);
                      else if (info.offset.x > 60 || info.velocity.x > 400) goScene(-1);
                    }}
                    className="h-full w-full cursor-grab active:cursor-grabbing"
                    style={{ touchAction: 'pan-y' }}
                  >
                    {SCENES[sceneIndex].node}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer — compact scene title, dots, expand toggle */}
              <div className="flex-none relative flex items-center justify-center pt-2">
                <div className="text-center">
                  <p className="font-serif text-xs text-signal leading-tight mb-1">
                    {SCENES[sceneIndex].title}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    {SCENES.map((scene, i) => (
                      <button
                        key={scene.id}
                        onClick={() => setScene([i, i > sceneIndex ? 1 : -1])}
                        aria-label={`Show ${scene.title}`}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          i === sceneIndex
                            ? 'bg-human shadow-[0_0_6px_rgba(139,0,0,0.8)]'
                            : 'bg-neutral-700 hover:bg-neutral-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setExpanded((v) => !v)}
                  title={expanded ? 'Show chapter status' : 'Expand animation'}
                  aria-label={expanded ? 'Show chapter status' : 'Expand animation'}
                  className="absolute right-0 top-1/2 -translate-y-1/2 mt-1 w-7 h-7 rounded-full border border-human/30 bg-human/10 hover:bg-human/20 text-human/90 flex items-center justify-center transition-colors cursor-pointer"
                >
                  {expanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                </button>
              </div>
            </>
          )}

          {/* Atmospheric phrase — hidden entirely when the card has no description */}
          {task.description && (
            <>
              <div className="flex-none flex items-center gap-3 mb-3 mt-3">
                <div className="h-px flex-1 bg-neutral-800" />
                <Sparkles size={10} className={isVersa ? 'text-human/60' : 'text-portal/60'} />
                <div className="h-px flex-1 bg-neutral-800" />
              </div>
              <p className="flex-none font-serif italic text-sm text-neutral-300 leading-relaxed max-w-sm mx-auto">
                {task.description}
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
