import React, { useState } from 'react';
import { ClosedDoorCultivationModal as ReferenceClosedDoorCultivationModal } from '../../../components/closed-door-cultivation/reference/ClosedDoorCultivationModal';
import { ClosedDoorCultivationModal as DevelopmentClosedDoorCultivationModal } from '../../../components/closed-door-cultivation/development/ClosedDoorCultivationModal';
import type { ClosedDoorCultivationModalProps } from '../../../components/closed-door-cultivation/development/ClosedDoorCultivationModal';
import { FeatureWorkspace } from '../../FeatureWorkspace';
import { workshopEntries } from '../../manifest';
import { scenarios, PreviewState } from './previewStates';

/**
 * Workshop-only mock of the production library grid so both versions can be
 * judged against realistic content — the same collision scenario seen on
 * library.seaportal.world. Not part of either component.
 */
const mockLibrary = [
  { title: 'Volume 1: The Fallen Star of Dusthaven', genre: 'KINGDOM BUILDING', chapters: '7/10 CH', progress: 70, tint: 'from-amber-950/80 via-slate-900 to-slate-950' },
  { title: 'Volume 1: The Tyranny of Petty...', genre: 'LITRPG / SYSTEM', chapters: '5/10 CH', progress: 50, tint: 'from-indigo-950/80 via-slate-900 to-slate-950' },
  { title: 'Volume 1: Echoes of the Crimson Scar', genre: 'APOCALYPSE CULTIVATION', chapters: '11/20 CH', progress: 55, tint: 'from-rose-950/80 via-slate-900 to-slate-950' },
  { title: 'Volume 1: The Foundation of...', genre: 'KINGDOM BUILDING', chapters: '1/10 CH', progress: 10, tint: 'from-emerald-950/80 via-slate-900 to-slate-950' },
  { title: 'Volume 2: Ashes of the Ninth Meridian', genre: 'WUXIA / ROMANCE', chapters: '3/14 CH', progress: 21, tint: 'from-sky-950/80 via-slate-900 to-slate-950' },
  { title: 'Volume 1: A Baleful Omen of Silk', genre: 'DARK FANTASY', chapters: '8/12 CH', progress: 66, tint: 'from-violet-950/80 via-slate-900 to-slate-950' },
];

function MockBookCard({ book }: { book: (typeof mockLibrary)[number] }) {
  return (
    <div aria-hidden="true">
      <div className={`relative aspect-[3/4] rounded-lg border border-white/10 bg-gradient-to-br ${book.tint} overflow-hidden`}>
        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-[9px] font-semibold text-white/80">{book.chapters}</span>
        <span className="absolute bottom-3 inset-x-2 text-center px-1.5 py-1 rounded bg-black/70 text-[9px] font-bold tracking-widest text-white/85">{book.genre}</span>
      </div>
      <p className="mt-2 font-display text-sm text-white/90 leading-snug">{book.title}</p>
      <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full bg-cyan-400/80" style={{ width: `${book.progress}%` }} />
      </div>
    </div>
  );
}

function PreviewCanvas({ Modal, emblemId, daysCultivating }: { Modal: React.ComponentType<ClosedDoorCultivationModalProps>; emblemId: string; daysCultivating?: number }) {
  const [activeState, setActiveState] = useState<PreviewState>('idle');
  const [qiEarned, setQiEarned] = useState<number | null>(null);

  const handleStateChange = (stateId: PreviewState) => {
    setActiveState(stateId);
    const scenario = scenarios.find((s) => s.id === stateId);
    setQiEarned(scenario?.qiEarned ?? null);
  };

  const handleClaim = async (qi: number) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log(`[Preview] Claimed ${qi} Qi`);
  };

  return (
    <div className="relative min-h-[calc(100vh-11rem)]">
      <div className="p-6 max-w-md">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md">
          <h2 className="text-sm font-semibold text-white/90 mb-4 uppercase tracking-widest opacity-80">Preview States</h2>
          <div className="flex flex-col gap-3">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleStateChange(scenario.id)}
                className={`text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 border ${
                  activeState === scenario.id
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-100'
                    : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'
                }`}
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="px-4 pb-64">
        <div className="grid grid-cols-2 gap-4">
          {mockLibrary.map((book) => (
            <MockBookCard key={book.title} book={book} />
          ))}
        </div>
      </main>

      <div
        id={emblemId}
        className="fixed top-6 right-6 z-[90] w-12 h-12 rounded-full border border-cyan-500/30 bg-[#081020] flex items-center justify-center text-cyan-200/50 text-xs shadow-[0_0_15px_rgba(4,172,255,0.15)]"
      >
        Target
      </div>

      <Modal qiEarned={qiEarned} onClose={() => handleStateChange('idle')} onClaim={handleClaim} targetElementId={emblemId} daysCultivating={daysCultivating} />
    </div>
  );
}

export function ClosedDoorCultivationWorkspace() {
  const entry = workshopEntries.find((e) => e.id === 'idle-cultivation')!;
  return (
    <FeatureWorkspace
      entry={entry}
      renderReference={() => <PreviewCanvas Modal={ReferenceClosedDoorCultivationModal} emblemId="cdc-emblem-reference" />}
      renderDevelopment={() => <PreviewCanvas Modal={DevelopmentClosedDoorCultivationModal} emblemId="cdc-emblem-development" daysCultivating={7} />}
    />
  );
}

export default ClosedDoorCultivationWorkspace;
