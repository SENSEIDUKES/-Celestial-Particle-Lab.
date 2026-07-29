import React, { useEffect, useRef } from 'react';

type Rgb = readonly [number, number, number];

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  fadeSpeed: number;
  color: Rgb;
  glyph?: HTMLImageElement;
  rotation?: number;
  rotationSpeed?: number;
}

interface AccentPalette {
  /** The accent itself. */
  base: Rgb;
  /** Lightened — hot cores, bright rims. */
  bright: Rgb;
  /** Near-white tint of the accent — the hottest points. */
  pale: Rgb;
  /** Darkened — scroll body, roller silhouettes. */
  deep: Rgb;
  /** Mid-dark — parchment gradient stops. */
  dim: Rgb;
}

const DEFAULT_ACCENT: Rgb = [245, 185, 66];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const clampChannel = (value: number) => Math.min(255, Math.max(0, Math.round(value)));

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  clampChannel(a[0] + (b[0] - a[0]) * t),
  clampChannel(a[1] + (b[1] - a[1]) * t),
  clampChannel(a[2] + (b[2] - a[2]) * t),
];

const WHITE: Rgb = [255, 255, 255];
const BLACK: Rgb = [0, 0, 0];

const buildPalette = (accent: Rgb): AccentPalette => ({
  base: accent,
  bright: mix(accent, WHITE, 0.35),
  pale: mix(accent, WHITE, 0.72),
  deep: mix(accent, BLACK, 0.82),
  dim: mix(accent, BLACK, 0.55),
});

const hexToRgb = (value: string): Rgb | null => {
  const hex = value.trim().replace(/^#/, '');
  const full =
    hex.length === 3
      ? hex.split('').map((c) => c + c).join('')
      : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
};

const toRgba = ([red, green, blue]: Rgb, alpha: number) =>
  `rgba(${red}, ${green}, ${blue}, ${alpha})`;

export interface CelestialParticleShowerProps {
  /**
   * Accent color for the whole effect — scroll glow, beam, absorption point,
   * particle bloom, and glyph halos all derive from it. Accepts a hex string
   * (e.g. "#a855f7"). When omitted, the component reads the
   * `--celestial-accent` CSS variable from its ancestors, falling back to
   * celestial gold.
   */
  accent?: string;
}

export const CelestialParticleShower: React.FC<CelestialParticleShowerProps> = React.memo(
  ({ accent }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Resolve the accent: prop → CSS variable → default gold.
      const cssAccent = getComputedStyle(canvas).getPropertyValue('--celestial-accent');
      const accentRgb =
        (accent && hexToRgb(accent)) || (cssAccent && hexToRgb(cssAccent)) || DEFAULT_ACCENT;
      const palette = buildPalette(accentRgb);

      let animationId: number;
      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);

      const handleResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', handleResize);

      const particles: Particle[] = [];
      const glyphs = [
        '/icons/yin-yang.svg',
        '/icons/shen-long-dragon.svg',
        '/icons/sacred-tree.svg',
        '/icons/thunder-cloud.svg',
        '/icons/book-scroll.svg',
        '/icons/cultivator.svg',
      ].map((source) => {
        const glyph = new Image();
        glyph.decoding = 'async';
        glyph.src = source;
        return glyph;
      });

      // Mostly accent-derived tones; a neutral minority keeps depth.
      const colors: Rgb[] = [
        palette.base,
        palette.bright,
        palette.pale,
        mix(palette.base, WHITE, 0.15),
        WHITE,
        mix(WHITE, palette.base, 0.15), // cool white with a whisper of accent
      ];

      const createParticle = (isInitial = false): Particle => {
        const size = Math.random() * 3 + (Math.random() < 0.15 ? Math.random() * 8 + 4 : 1);
        const isGlyph = size > 4 && Math.random() < 0.42;

        return {
          x: Math.random() * width,
          y: isInitial ? Math.random() * height : height + 20,
          size,
          speedY: -(Math.random() * 1.5 + 0.5),
          speedX: (Math.random() - 0.5) * 0.8,
          opacity: Math.random() * 0.7 + 0.3,
          fadeSpeed: Math.random() * 0.003 + 0.001,
          color: colors[Math.floor(Math.random() * colors.length)],
          glyph: isGlyph ? glyphs[Math.floor(Math.random() * glyphs.length)] : undefined,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
        };
      };

      for (let i = 0; i < 110; i++) {
        particles.push(createParticle(true));
      }

      // Fill an elliptical radial gradient (canvas gradients are circular, so
      // we draw in a scaled space).
      const fillEllipticalGlow = (
        x: number,
        y: number,
        rx: number,
        ry: number,
        stops: readonly (readonly [number, string])[],
      ) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(rx, ry);
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        for (const [offset, color] of stops) gradient.addColorStop(offset, color);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      // --- The celestial scroll: massive, mostly above the viewport ----------
      // Only its lower rim, two rolled edges, and the light pouring from the
      // center dip are ever visible.
      const drawScroll = (time: number) => {
        const cx = width / 2;
        const rimY = height * 0.018; // rim height at the left/right edges
        const dipY = height * 0.062; // the rim dips at center — the absorption point
        const pulse = 0.9 + 0.1 * Math.sin(time * 1.3);
        const flicker = 0.92 + 0.08 * Math.sin(time * 2.1);

        // Scroll body: a dark mass hanging above the rim, tinted by the accent.
        const rimControlY = 2 * dipY - rimY;
        const sheetGrad = ctx.createLinearGradient(0, -height * 0.5, 0, dipY);
        sheetGrad.addColorStop(0, toRgba(palette.deep, 0));
        sheetGrad.addColorStop(0.55, toRgba(palette.deep, 0.35));
        sheetGrad.addColorStop(1, toRgba(palette.dim, 0.5));
        ctx.beginPath();
        ctx.moveTo(-10, rimY);
        ctx.quadraticCurveTo(cx, rimControlY, width + 10, rimY);
        ctx.lineTo(width + 10, -height);
        ctx.lineTo(-10, -height);
        ctx.closePath();
        ctx.fillStyle = sheetGrad;
        ctx.fill();

        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // Rolled edges: dark cylinders with glowing rims, half offscreen.
        const rollerR = Math.min(width, height) * 0.055;
        for (const side of [-1, 1]) {
          const rx = side < 0 ? -rollerR * 0.35 : width + rollerR * 0.35;
          const ry = rimY - rollerR * 0.35;
          const bodyGrad = ctx.createRadialGradient(rx, ry, rollerR * 0.1, rx, ry, rollerR);
          bodyGrad.addColorStop(0, toRgba(palette.deep, 0.9));
          bodyGrad.addColorStop(0.75, toRgba(palette.deep, 0.75));
          bodyGrad.addColorStop(1, toRgba(palette.dim, 0.4));
          ctx.beginPath();
          ctx.arc(rx, ry, rollerR, 0, Math.PI * 2);
          ctx.fillStyle = bodyGrad;
          ctx.fill();
          ctx.shadowBlur = 18;
          ctx.shadowColor = toRgba(palette.bright, 0.8);
          for (const [radius, alpha] of [
            [rollerR, 0.7],
            [rollerR * 0.66, 0.5],
            [rollerR * 0.34, 0.35],
          ] as const) {
            ctx.beginPath();
            ctx.arc(rx, ry, radius, 0, Math.PI * 2);
            ctx.strokeStyle = toRgba(palette.bright, alpha * flicker);
            ctx.lineWidth = 1.6;
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
        }

        // The glowing lower rim — long and shallow, like the edge of an open
        // scroll — with a second faint line above it for edge thickness.
        const edgeThickness = Math.max(6, height * 0.009);
        ctx.beginPath();
        ctx.moveTo(-10, rimY - edgeThickness);
        ctx.quadraticCurveTo(cx, rimControlY - edgeThickness * 2.4, width + 10, rimY - edgeThickness);
        ctx.strokeStyle = toRgba(palette.bright, 0.14 * flicker);
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-10, rimY);
        ctx.quadraticCurveTo(cx, rimControlY, width + 10, rimY);
        ctx.strokeStyle = toRgba(palette.base, 0.2 * flicker);
        ctx.lineWidth = 6;
        ctx.shadowBlur = 22;
        ctx.shadowColor = toRgba(palette.bright, 0.85);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-10, rimY);
        ctx.quadraticCurveTo(cx, rimControlY, width + 10, rimY);
        ctx.strokeStyle = toRgba(palette.pale, 0.8 * flicker);
        ctx.lineWidth = 1.6;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // The light at the absorption point: stretched wide along the scroll
        // edge so it reads as part of the scroll, not a floating orb.
        fillEllipticalGlow(cx, dipY, width * 0.46, height * 0.115, [
          [0, toRgba(palette.pale, 0.5 * pulse)],
          [0.35, toRgba(palette.bright, 0.28 * pulse)],
          [0.7, toRgba(palette.base, 0.1 * pulse)],
          [1, toRgba(palette.base, 0)],
        ]);
        // Bright elongated core hugging the rim.
        fillEllipticalGlow(cx, dipY, width * 0.2, height * 0.042, [
          [0, toRgba(mix(palette.pale, WHITE, 0.5), 0.85 * pulse)],
          [0.5, toRgba(palette.pale, 0.35 * pulse)],
          [1, toRgba(palette.bright, 0)],
        ]);

        // The heavenly beam: washed-out layers of soft light — no hard edges.
        const beamLen = height * 0.5;
        // Broad ambient wash hanging under the scroll.
        fillEllipticalGlow(cx, dipY + beamLen * 0.32, width * 0.3, beamLen * 0.62, [
          [0, toRgba(palette.pale, 0.1 * pulse)],
          [0.55, toRgba(palette.bright, 0.045 * pulse)],
          [1, toRgba(palette.bright, 0)],
        ]);
        // Nested wedges, each wider and fainter — the layered falloff washes
        // the beam out instead of drawing a hard cone.
        for (let layer = 0; layer < 5; layer++) {
          const spread = 0.018 + layer * 0.045;
          const bottomSpread = 0.05 + layer * 0.075;
          const alpha = (0.085 - layer * 0.016) * pulse;
          const beamGrad = ctx.createLinearGradient(0, dipY, 0, dipY + beamLen);
          beamGrad.addColorStop(0, toRgba(palette.pale, alpha));
          beamGrad.addColorStop(0.5, toRgba(palette.bright, alpha * 0.45));
          beamGrad.addColorStop(1, toRgba(palette.bright, 0));
          ctx.beginPath();
          ctx.moveTo(cx - width * spread, dipY);
          ctx.lineTo(cx + width * spread, dipY);
          ctx.lineTo(cx + width * bottomSpread, dipY + beamLen);
          ctx.lineTo(cx - width * bottomSpread, dipY + beamLen);
          ctx.closePath();
          ctx.fillStyle = beamGrad;
          ctx.fill();
        }

        ctx.restore();
      };

      const animate = () => {
        const time = performance.now() / 1000;
        ctx.clearRect(0, 0, width, height);

        drawScroll(time);

        // One absorption point: the center dip of the scroll's lower rim.
        const absorbX = width / 2;
        const absorbY = height * 0.062;
        const funnelSpan = height * 0.85; // the funnel reaches almost the full screen
        const killRadius = Math.max(10, height * 0.014);

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];

          const dx = absorbX - p.x;
          const dy = p.y - absorbY;
          const dist = Math.hypot(dx, dy);

          // Funnel: gentle convergence low on screen, strong near the rim.
          const funnelT = clamp01(1 - p.y / funnelSpan);
          // Absorption: final shrink/fade in the last stretch to the point.
          const absorbT = clamp01(1 - dist / (height * 0.3));

          // Curve toward the center line, with a faint swirl so paths arc
          // instead of beelining. Kept loose so the stream stays spread out.
          p.speedX += dx * (0.00033 + funnelT * funnelT * 0.0037);
          p.speedX += -dy * 0.00001 * funnelT;
          p.speedX *= 0.99;

          // Slight acceleration as the particle is drawn upward.
          p.y += p.speedY * (1 + funnelT * 0.55);
          p.x += p.speedX;

          p.opacity -= p.fadeSpeed * (1 + absorbT * 1.5);

          if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
            p.rotation += p.rotationSpeed * (1 + absorbT);
          }

          // Shrink and dissolve into the light.
          const scale = 1 - Math.pow(absorbT, 1.5) * 0.92;
          const alpha = p.opacity * (1 - Math.pow(absorbT, 2) * 0.85);
          // Dust caught in the beam takes on the accent as it nears the scroll.
          const color = mix(p.color, palette.bright, absorbT * 0.85);

          if (p.opacity <= 0 || dist < killRadius || scale <= 0.06 || p.y < -20) {
            particles[i] = createParticle(false);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = clamp01(alpha);

          if (p.glyph?.complete && p.glyph.naturalWidth > 0) {
            ctx.translate(p.x, p.y);
            if (p.rotation !== undefined) ctx.rotate(p.rotation);
            const glyphSize = Math.max(22, p.size * 2.4) * scale;
            ctx.shadowBlur = glyphSize * (0.75 + absorbT);
            ctx.shadowColor = toRgba(palette.base, 0.78);
            ctx.drawImage(p.glyph, -glyphSize / 2, -glyphSize / 2, glyphSize, glyphSize);
          } else {
            const radius = p.size * 2 * scale;
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
            gradient.addColorStop(0, toRgba(color, 1));
            gradient.addColorStop(0.4, toRgba(color, 0.4));
            gradient.addColorStop(1, toRgba(color, 0));
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(radius, 0.1), 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }

        animationId = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
      };
    }, [accent]);

    return <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />;
  },
);
