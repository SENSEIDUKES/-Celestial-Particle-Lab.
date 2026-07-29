import { CelestialParticleShower } from './CelestialParticleShower';
import './styles.css';

export default function App() {
  return (
    <main className="preview-stage">
      <div className="ambient-glow ambient-glow-gold" />
      <div className="ambient-glow ambient-glow-blue" />
      <CelestialParticleShower />
      <section className="preview-relic" data-celestial-foreground>
        <p className="preview-relic-eyebrow">Celestial Library</p>
        <h1>Relic in Focus</h1>
        <p className="preview-relic-copy">
          The field softens here while the ascent stream remains visible above and below.
        </p>
      </section>
    </main>
  );
}
