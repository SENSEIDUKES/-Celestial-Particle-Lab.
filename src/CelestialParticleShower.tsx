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

const toRgba = ([red, green, blue]: Rgb, alpha: number) =>
  `rgba(${red}, ${green}, ${blue}, ${alpha})`;

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

    for (let i = 0; i < 75; i++) {
      particles.push(createParticle(true));
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;
        p.opacity -= p.fadeSpeed;

        if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
          p.rotation += p.rotationSpeed;
        }

        if (p.opacity <= 0 || p.y < -20) {
          particles[i] = createParticle(false);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;

        if (p.glyph?.complete && p.glyph.naturalWidth > 0) {
          ctx.translate(p.x, p.y);
          if (p.rotation !== undefined) ctx.rotate(p.rotation);
          const glyphSize = Math.max(22, p.size * 2.4);
          ctx.shadowBlur = glyphSize * 0.75;
          ctx.shadowColor = 'rgba(245, 185, 66, 0.78)';
          ctx.drawImage(p.glyph, -glyphSize / 2, -glyphSize / 2, glyphSize, glyphSize);
        } else {
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
          gradient.addColorStop(0, toRgba(p.color, 1));
          gradient.addColorStop(0.4, toRgba(p.color, 0.4));
          gradient.addColorStop(1, toRgba(p.color, 0));
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
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
