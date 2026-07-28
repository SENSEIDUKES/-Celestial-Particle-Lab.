import { CelestialParticleShower } from './CelestialParticleShower';
import './styles.css';

export default function App() {
  return (
    <main className="preview-stage">
      <div className="ambient-glow ambient-glow-gold" />
      <div className="ambient-glow ambient-glow-blue" />
      <CelestialParticleShower />
    </main>
  );
}
