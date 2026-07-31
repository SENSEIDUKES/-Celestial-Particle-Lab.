import React from 'react';
import { motion } from 'motion/react';

const ACCENT = {
  versa: '#8B0000',
  scout: '#04ACFF',
} as const;

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

/**
 * The hard cap on scene-specific foreground particles. Layer 2 exists so a
 * scene can sprinkle a few sparks above itself for depth — never enough to
 * compete with the scene. Keep this number small; if a scene wants more,
 * the extra particles belong inside the scene (Layer 1), not here.
 */
export const CHAMBER_FOREGROUND_MOTE_LIMIT = 6;

/** [left%, top%, size, duration, delay, driftX] — a restrained spread. */
const FOREGROUND_MOTES: Array<[number, number, number, number, number, number]> = [
  [18, 62, 2.5, 5.2, 0.0, 6],
  [30, 30, 2.0, 6.1, 0.9, -5],
  [50, 76, 2.8, 4.6, 1.7, 4],
  [66, 26, 2.0, 5.7, 0.5, -6],
  [80, 58, 2.5, 5.0, 1.2, 5],
  [44, 14, 1.8, 6.4, 2.1, -4],
];

/**
 * ChamberForegroundMotes — the standard, capped foreground particle set for
 * the chamber's top layer. Slow, soft, and sparse: they add depth over the
 * scene without ever obscuring it.
 */
export const ChamberForegroundMotes: React.FC<{ isVersa: boolean }> = ({ isVersa }) => {
  const colors = isVersa
    ? ['rgba(233,213,255,0.9)', 'rgba(192,132,252,0.85)', 'rgba(252,165,165,0.8)']
    : ['rgba(224,242,255,0.9)', 'rgba(4,172,255,0.8)', 'rgba(148,210,255,0.8)'];
  return (
    <>
      {FOREGROUND_MOTES.slice(0, CHAMBER_FOREGROUND_MOTE_LIMIT).map(([left, top, size, dur, delay, driftX], i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: size,
            height: size,
            background: colors[i % colors.length],
            boxShadow: `0 0 6px ${colors[i % colors.length]}`,
          }}
          animate={{ y: [0, -14, 0], x: [0, driftX, 0], opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  );
};

export interface ManifestationChamberProps {
  isVersa: boolean;
  /** The manifestation scene itself (e.g. <SwordCultivatorClash />). */
  scene: React.ReactNode;
  /**
   * Shared background effects — ambient particles, bubbles, symbols — always
   * rendered behind the scene (Layer 0). Non-interactive by contract.
   */
  ambient?: React.ReactNode;
  /**
   * Scene-specific foreground effects — the only layer allowed above the
   * scene (Layer 2). Keep it capped and sparse; ChamberForegroundMotes is
   * the standard set and CHAMBER_FOREGROUND_MOTE_LIMIT the ceiling.
   */
  foreground?: React.ReactNode;
}

/**
 * ManifestationChamber — the circular portal every manifestation scene lives
 * inside. It owns the stacking contract so individual scenes never have to:
 *
 *   Layer 0 (z-0)  · occlusion disc, inner glow, portal rings, and shared
 *                    `ambient` effects — always behind the scene
 *   Layer 1 (z-10) · the `scene` itself — characters, trails, core effects;
 *                    visually clear in the foreground
 *   Layer 2 (z-20) · a small, controlled amount of scene-specific
 *                    `foreground` particles (see CHAMBER_FOREGROUND_MOTE_LIMIT)
 *
 * Two guarantees keep shared background effects (the celestial particle
 * shower, bubbles, glyphs) from ever washing over the scene:
 *
 *   1. `data-celestial-foreground` on the chamber root — the shared
 *      ParticleEffect treats marked regions as calm zones and
 *      dims its particles to a whisper inside them (+padding). Because the
 *      marker lives on the chamber, every scene placed here inherits it.
 *   2. A soft occlusion disc in Layer 0 — a dark radial that sits behind the
 *      scene and quietly absorbs any backdrop glow bleeding through the
 *      veil's translucent wash, so the scene reads on a clean dark field.
 *
 * `isolate` gives the chamber its own stacking context: nothing inside can
 * escape above or below these layers, and nothing outside (the veil's
 * cinematic backdrop, hero aura, status UI) can slip between them. Future
 * scenes are dropped in as `scene` and inherit the same behavior with no
 * per-scene layering fixes.
 *
 * Sizing contract: the chamber is a square sized to 88% of its host zone's
 * smaller dimension (`w-[88cqmin]`, container query units). The host — the
 * veil's active manifestation zone — provides `container-type: size`, so the
 * chamber always fits inside the zone on any viewport instead of guessing
 * from viewport units and getting hard-clipped by the zone's overflow.
 */
export default function ManifestationChamber({ isVersa, scene, ambient, foreground }: ManifestationChamberProps) {
  return (
    <div
      data-celestial-foreground
      className="relative aspect-square w-[88cqmin] isolate"
    >
      {/* ── Layer 0 · chamber frame + shared ambient effects (behind) ── */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        {/* Occlusion disc — absorbs backdrop particles/glow behind the scene
            so the battle reads on a clean dark field */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 50% 52%, rgba(2,0,8,0.72) 0%, rgba(2,0,8,0.55) 55%, rgba(2,0,8,0.25) 78%, transparent 96%)',
          }}
        />
        {/* Inner violet glow pooling inside the ring */}
        <div
          className="absolute inset-[6%] rounded-full"
          style={{
            background:
              'radial-gradient(circle at 50% 55%, rgba(147,51,234,0.14) 0%, rgba(88,28,135,0.08) 45%, transparent 72%)',
          }}
        />
        <ChamberRings isVersa={isVersa} />
        {ambient}
      </div>

      {/* ── Layer 1 · the manifestation scene (clear foreground) ── */}
      <div className="absolute inset-[9%] z-10 flex items-center justify-center">
        {scene}
      </div>

      {/* ── Layer 2 · capped scene-specific foreground particles (above) ── */}
      {foreground && (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-full" aria-hidden="true">
          {foreground}
        </div>
      )}
    </div>
  );
}
