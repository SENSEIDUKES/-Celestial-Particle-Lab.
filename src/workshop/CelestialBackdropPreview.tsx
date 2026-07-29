import { CelestialParticleShower } from '../CelestialParticleShower';

export function CelestialBackdropPreview() {
  return (
    <main className="preview-stage">
      <div className="ambient-glow ambient-glow-gold" />
      <div className="ambient-glow ambient-glow-blue" />
      <CelestialParticleShower />
      <section className="preview-relic" data-celestial-foreground>
        <p className="preview-relic-eyebrow">Workshop Preview</p>
        <h1>Foreground Content</h1>
        <p className="preview-relic-copy">
          This placeholder proves the backdrop can remain active without competing with the real component placed above it.
        </p>
      </section>
    </main>
  );
}
