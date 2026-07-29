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

const GOLD: Rgb = [255, 214, 130];

const toRgba = ([red, green, blue]: Rgb, alpha: number) =>
  `rgba(${red}, ${green}, ${blue}, ${alpha})`;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const lerpToGold = ([r, g, b]: Rgb, t: number): Rgb => [
  Math.round(r + (GOLD[0] - r) * t),
  Math.round(g + (GOLD[1] - g) * t),
  Math.round(b + (GOLD[2] - b) * t),
];

export const CelestialParticleShower: React.FC = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
    const colors: Rgb[] = [
      [245, 158, 11],
      [4, 172, 255],
      [255, 215, 0],
      [255, 255, 255],
      [168, 85, 247],
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
      const dipY = height * 0.062; // the rim dips down at center — the absorption point
      const pulse = 0.9 + 0.1 * Math.sin(time * 1.3);
      const flicker = 0.92 + 0.08 * Math.sin(time * 2.1);

      // Scroll body: a dark parchment mass hanging above the rim.
      const rimControlY = 2 * dipY - rimY;
      const sheetGrad = ctx.createLinearGradient(0, -height * 0.5, 0, dipY);
      sheetGrad.addColorStop(0, 'rgba(46, 30, 8, 0)');
      sheetGrad.addColorStop(0.55, 'rgba(64, 42, 12, 0.35)');
      sheetGrad.addColorStop(1, 'rgba(110, 74, 20, 0.5)');
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

      // Rolled edges: dark cylinders with golden rims, half offscreen.
      const rollerR = Math.min(width, height) * 0.055;
      for (const side of [-1, 1]) {
        const rx = side < 0 ? -rollerR * 0.35 : width + rollerR * 0.35;
        const ry = rimY - rollerR * 0.35;
        const bodyGrad = ctx.createRadialGradient(rx, ry, rollerR * 0.1, rx, ry, rollerR);
        bodyGrad.addColorStop(0, 'rgba(24, 15, 4, 0.9)');
        bodyGrad.addColorStop(0.75, 'rgba(40, 26, 7, 0.75)');
        bodyGrad.addColorStop(1, 'rgba(90, 60, 16, 0.4)');
        ctx.beginPath();
        ctx.arc(rx, ry, rollerR, 0, Math.PI * 2);
        ctx.fillStyle = bodyGrad;
        ctx.fill();
        ctx.shadowBlur = 18;
        ctx.shadowColor = 'rgba(255, 200, 100, 0.8)';
        for (const [radius, alpha] of [
          [rollerR, 0.7],
          [rollerR * 0.66, 0.5],
          [rollerR * 0.34, 0.35],
        ] as const) {
          ctx.beginPath();
          ctx.arc(rx, ry, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 205, 110, ${alpha * flicker})`;
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
      ctx.strokeStyle = `rgba(255, 195, 100, ${0.14 * flicker})`;
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-10, rimY);
      ctx.quadraticCurveTo(cx, rimControlY, width + 10, rimY);
      ctx.strokeStyle = `rgba(255, 190, 90, ${0.2 * flicker})`;
      ctx.lineWidth = 6;
      ctx.shadowBlur = 22;
      ctx.shadowColor = 'rgba(255, 195, 95, 0.85)';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-10, rimY);
      ctx.quadraticCurveTo(cx, rimControlY, width + 10, rimY);
      ctx.strokeStyle = `rgba(255, 228, 165, ${0.8 * flicker})`;
      ctx.lineWidth = 1.6;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // The light at the absorption point: stretched wide along the scroll
      // edge so it reads as part of the scroll, not a floating orb.
      fillEllipticalGlow(cx, dipY, width * 0.46, height * 0.115, [
        [0, `rgba(255, 232, 175, ${0.5 * pulse})`],
        [0.35, `rgba(255, 212, 125, ${0.28 * pulse})`],
        [0.7, `rgba(245, 158, 11, ${0.1 * pulse})`],
        [1, 'rgba(245, 158, 11, 0)'],
      ]);
      // Bright elongated core hugging the rim.
      fillEllipticalGlow(cx, dipY, width * 0.2, height * 0.042, [
        [0, `rgba(255, 248, 225, ${0.85 * pulse})`],
        [0.5, `rgba(255, 222, 145, ${0.35 * pulse})`],
        [1, 'rgba(255, 214, 130, 0)'],
      ]);

      // The heavenly beam: washed-out layers of soft light — no hard edges.
      const beamLen = height * 0.5;
      // Broad ambient wash hanging under the scroll.
      fillEllipticalGlow(cx, dipY + beamLen * 0.32, width * 0.3, beamLen * 0.62, [
        [0, `rgba(255, 222, 150, ${0.1 * pulse})`],
        [0.55, `rgba(255, 210, 130, ${0.045 * pulse})`],
        [1, 'rgba(255, 205, 120, 0)'],
      ]);
      // Nested wedges, each wider and fainter — the layered falloff washes
      // the beam out instead of drawing a hard cone.
      for (let layer = 0; layer < 5; layer++) {
        const spread = 0.018 + layer * 0.045;
        const bottomSpread = 0.05 + layer * 0.075;
        const alpha = (0.085 - layer * 0.016) * pulse;
        const beamGrad = ctx.createLinearGradient(0, dipY, 0, dipY + beamLen);
        beamGrad.addColorStop(0, `rgba(255, 224, 155, ${alpha})`);
        beamGrad.addColorStop(0.5, `rgba(255, 212, 130, ${alpha * 0.45})`);
        beamGrad.addColorStop(1, 'rgba(255, 205, 120, 0)');
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
        // Dust caught in the beam turns golden as it nears the scroll.
        const color = lerpToGold(p.color, absorbT * 0.85);

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
          ctx.shadowColor = 'rgba(245, 185, 66, 0.78)';
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
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />;
});
