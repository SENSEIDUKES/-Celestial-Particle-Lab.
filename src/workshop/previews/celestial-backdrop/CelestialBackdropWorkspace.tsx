import { useState, type CSSProperties } from 'react';
import { CelestialParticleShower } from '../../../CelestialParticleShower';
import { FeatureWorkspace } from '../../FeatureWorkspace';
import { workshopEntries } from '../../manifest';

/**
 * No Development fork has diverged from the Original Reference yet — both
 * views render the same CelestialParticleShower. This is the expected
 * starting state for a feature workspace: Development begins as an exact
 * copy of Reference until a redesign task actually changes it.
 */
function BackdropDemo({ accent, setAccent }: { accent: string; setAccent: (value: string) => void }) {
  const previewStyle = { '--celestial-accent': accent } as CSSProperties;

  return (
    <main className="preview-stage-embedded" style={previewStyle}>
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

export function CelestialBackdropWorkspace() {
  const entry = workshopEntries.find((e) => e.id === 'celestial-backdrop')!;
  const [accent, setAccent] = useState('#f5b942');

  return (
    <FeatureWorkspace
      entry={entry}
      renderReference={() => <BackdropDemo accent={accent} setAccent={setAccent} />}
      renderDevelopment={() => <BackdropDemo accent={accent} setAccent={setAccent} />}
    />
  );
}

export default CelestialBackdropWorkspace;
