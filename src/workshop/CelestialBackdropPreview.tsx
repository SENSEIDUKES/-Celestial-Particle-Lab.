import { useState, type CSSProperties } from 'react';
import { CelestialParticleShower } from '../CelestialParticleShower';

export function CelestialBackdropPreview() {
  const [accent, setAccent] = useState('#f5b942');
  const previewStyle = { '--celestial-accent': accent } as CSSProperties;

  return (
    <main className="preview-stage" style={previewStyle}>
      <div className="ambient-glow ambient-glow-gold" />
      <div className="ambient-glow ambient-glow-blue" />
      <CelestialParticleShower accent={accent} />
      <section className="preview-relic" data-celestial-foreground>
        <p className="preview-relic-eyebrow">Workshop Preview</p>
        <h1>Foreground Content</h1>
        <p className="preview-relic-copy">
          This placeholder proves the backdrop can remain active without competing with the real component placed above it.
        </p>
        <label className="preview-accent-control">
          <span>Backdrop accent</span>
          <input
            aria-label="Backdrop accent"
            type="color"
            value={accent}
            onInput={(event) => setAccent(event.currentTarget.value)}
            onChange={(event) => setAccent(event.target.value)}
          />
        </label>
      </section>
    </main>
  );
}
