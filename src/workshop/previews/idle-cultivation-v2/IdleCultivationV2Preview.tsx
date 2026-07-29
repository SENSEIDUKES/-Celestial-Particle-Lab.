import React, { useState } from 'react';
import { IdleCultivationModalV2 } from '../../../components/IdleCultivationModalV2/IdleCultivationModalV2';
import { scenarios, PreviewState } from './previewStates';

/**
 * Workshop-only mock of the production library grid (book covers, genre chips,
 * progress rows) so the V2 vignette's ink aura, orb opacity, safe-area spacing,
 * and swipe pass-through can be judged against realistic content — the same
 * collision scenario seen on library.seaportal.world. Not part of the component.
 */
const mockLibrary = [
  { title: 'Volume 1: The Fallen Star of Dusthaven', genre: 'KINGDOM BUILDING', chapters: '7/10 CH', progress: 70, tint: 'from-amber-950/80 via-slate-900 to-slate-950' },
  { title: 'Volume 1: The Tyranny of Petty...', genre: 'LITRPG / SYSTEM', chapters: '5/10 CH', progress: 50, tint: 'from-indigo-950/80 via-slate-900 to-slate-950' },
  { title: 'Volume 1: Echoes of the Crimson Scar', genre: 'APOCALYPSE CULTIVATION', chapters: '11/20 CH', progress: 55, tint: 'from-rose-950/80 via-slate-900 to-slate-950' },
  { title: 'Volume 1: The Foundation of...', genre: 'KINGDOM BUILDING', chapters: '1/10 CH', progress: 10, tint: 'from-emerald-950/80 via-slate-900 to-slate-950' },
  { title: 'Volume 2: Ashes of the Ninth Meridian', genre: 'WUXIA / ROMANCE', chapters: '3/14 CH', progress: 21, tint: 'from-sky-950/80 via-slate-900 to-slate-950' },
  { title: 'Volume 1: A Baleful Omen of Silk', genre: 'DARK FANTASY', chapters: '8/12 CH', progress: 66, tint: 'from-violet-950/80 via-slate-900 to-slate-950' },
  { title: 'Volume 3: The Sect That Devoured Stars', genre: 'XIANXIA / SYSTEM', chapters: '2/18 CH', progress: 11, tint: 'from-orange-950/80 via-slate-900 to-slate-950' },
  { title: 'Volume 1: Reborn as a Low-Grade Spirit Stone', genre: 'LITRPG / COMEDY', chapters: '9/10 CH', progress: 90, tint: 'from-teal-950/80 via-slate-900 to-slate-950' },
];

function MockBookCard({ book }: { book: (typeof mockLibrary)[number] }) {
  return (
    <div aria-hidden="true">
      <div className={`relative aspect-[3/4] rounded-lg border border-white/10 bg-gradient-to-br ${book.tint} overflow-hidden`}>
        <span className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/60 border border-white/15 flex items-center justify-center text-[10px] text-white/50">🗑</span>
        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-[9px] font-semibold text-white/80">{book.chapters}</span>
        <span className="absolute bottom-10 inset-x-2 text-center px-1.5 py-1 rounded bg-black/70 text-[9px] font-bold tracking-widest text-white/85">{book.genre}</span>
        <span className="absolute bottom-3 left-2 px-1.5 py-0.5 rounded border border-red-500/60 text-[9px] font-bold text-red-400">✍ DRAFT</span>
      </div>
      <p className="mt-2 font-display text-sm text-white/90 leading-snug">{book.title}</p>
      <p className="mt-0.5 text-[10px] tracking-wide text-cyan-400/80">BY ◉ SEN · OUTER SECT</p>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full bg-cyan-400/80" style={{ width: `${book.progress}%` }} />
        </div>
        <span className="text-[9px] text-white/50">{book.progress}%</span>
      </div>
    </div>
  );
}

export function IdleCultivationV2Preview() {
  const [activeState, setActiveState] = useState<PreviewState>('idle');
  const [qiEarned, setQiEarned] = useState<number | null>(null);

  const activeScenario = scenarios.find((s) => s.id === activeState) || scenarios[0];

  const handleStateChange = (stateId: PreviewState) => {
    setActiveState(stateId);
    const scenario = scenarios.find((s) => s.id === stateId);
    setQiEarned(scenario?.qiEarned ?? null);
  };

  const handleClaim = async (qi: number) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log(`[Preview] Claimed ${qi} Qi`);
  };

  const handleClose = () => {
    handleStateChange('idle');
  };

  return (
    <div className="relative min-h-screen bg-[#04060d] text-slate-300 font-sans flex flex-col">
      {/*
        A mock target element for the Qi flight animation.
        In the real app, this is the "celestial-library-emblem".
      */}
      <header className="flex justify-between items-center p-6 border-b border-white/5">
        <h1 className="text-xl font-display font-medium tracking-wide text-white/80">
          SEN Workshop — Cultivation V2
        </h1>
        <div
          id="preview-emblem-target"
          className="w-12 h-12 rounded-full border border-cyan-500/30 bg-[#081020] flex items-center justify-center text-cyan-200/50 text-xs shadow-[0_0_15px_rgba(4,172,255,0.15)]"
        >
          Target
        </div>
      </header>

      {/* Workshop Controls - explicitly separated from presentation */}
      <div className="relative z-[200] p-6 max-w-md">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md">
          <h2 className="text-sm font-semibold text-white/90 mb-4 uppercase tracking-widest opacity-80">
            Preview Controls
          </h2>

          <div className="flex flex-col gap-3">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleStateChange(scenario.id)}
                className={`
                  text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 border
                  ${activeState === scenario.id
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-100'
                    : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'
                  }
                `}
              >
                {scenario.label}
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 text-xs text-white/40 leading-relaxed">
            <p>
              When a state is active, the vignette appears above the bottom safe area. Wait 7 seconds for it to collapse into a floating orb.
            </p>
            <p className="mt-2">
              Scroll the mock library beneath it — the vignette and orb stay anchored to the viewport, and swipes pass through everything except a deliberate tap on the cloud or orb.
            </p>
            <p className="mt-2">
              Compare against the untouched original at <code>?preview=idle-cultivation</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable mock library — the content the vignette must not collide with */}
      <main className="px-4 pb-64">
        <div className="grid grid-cols-2 gap-4">
          {mockLibrary.map((book) => (
            <MockBookCard key={book.title} book={book} />
          ))}
        </div>
        <p className="mt-10 text-center text-[10px] tracking-[0.35em] uppercase text-white/25">
          SEIHOUSE: A better time capsule and translator of artistic expression
        </p>
      </main>

      {/* The component under test */}
      <IdleCultivationModalV2
        qiEarned={qiEarned}
        onClose={handleClose}
        onClaim={handleClaim}
        targetElementId="preview-emblem-target"
      />
    </div>
  );
}
