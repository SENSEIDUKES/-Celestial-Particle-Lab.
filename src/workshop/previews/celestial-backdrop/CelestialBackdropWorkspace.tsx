import { useState, type CSSProperties } from 'react';
import { ParticleEffect } from '../../../ParticleEffect';
import { FeatureWorkspace } from '../../FeatureWorkspace';
import { workshopEntries } from '../../manifest';

/**
 * No Development fork has diverged from the Original Reference yet — both
 * views render the same ParticleEffect. This is the expected
 * starting state for a feature workspace: Development begins as an exact
 * copy of Reference until a redesign task actually changes it.
 */
interface BackdropDemoProps {
  accent: string;
  speedScale: number;
  dispersion: number;
  onAccentChange: (value: string) => void;
  onSpeedScaleChange: (value: number) => void;
  onDispersionChange: (value: number) => void;
}

function BackdropDemo({ accent, speedScale, dispersion, onAccentChange, onSpeedScaleChange, onDispersionChange }: BackdropDemoProps) {
  const previewStyle = { '--celestial-accent': accent } as CSSProperties;

  return (
    <main className="preview-stage-embedded" style={previewStyle}>
      <div className="ambient-glow ambient-glow-gold" />
      <div className="ambient-glow ambient-glow-blue" />
      <ParticleEffect accent={accent} speedScale={speedScale} dispersion={dispersion} />
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
            onInput={(event) => onAccentChange(event.currentTarget.value)}
            onChange={(event) => onAccentChange(event.target.value)}
          />
        </label>
        <label className="preview-accent-control">
          <span>Speed ×{speedScale.toFixed(2)}</span>
          <input
            aria-label="Backdrop speed scale"
            type="range"
            min={0.2}
            max={2}
            step={0.01}
            value={speedScale}
            onInput={(event) => onSpeedScaleChange(Number(event.currentTarget.value))}
            onChange={(event) => onSpeedScaleChange(Number(event.target.value))}
          />
        </label>
        <label className="preview-accent-control">
          <span>Dispersion ×{dispersion.toFixed(2)}</span>
          <input
            aria-label="Backdrop dispersion"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={dispersion}
            onInput={(event) => onDispersionChange(Number(event.currentTarget.value))}
            onChange={(event) => onDispersionChange(Number(event.target.value))}
          />
        </label>
      </section>
    </main>
  );
}

export function CelestialBackdropWorkspace() {
  const entry = workshopEntries.find((e) => e.id === 'celestial-backdrop')!;
  const [accent, setAccent] = useState('#f5b942');
  // Veil tuning from the Chapter Generation Manifestation dev
  // (AILoadingVeil passes speedScale 0.47 / dispersion 0.96).
  const [speedScale, setSpeedScale] = useState(0.47);
  const [dispersion, setDispersion] = useState(0.96);

  const demoProps = {
    accent,
    speedScale,
    dispersion,
    onAccentChange: setAccent,
    onSpeedScaleChange: setSpeedScale,
    onDispersionChange: setDispersion,
  };

  return (
    <FeatureWorkspace
      entry={entry}
      renderReference={() => <BackdropDemo {...demoProps} />}
      renderDevelopment={() => <BackdropDemo {...demoProps} />}
    />
  );
}

export default CelestialBackdropWorkspace;
