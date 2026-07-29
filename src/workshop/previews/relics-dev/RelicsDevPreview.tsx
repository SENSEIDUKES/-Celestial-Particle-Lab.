import React, { useState } from 'react';
import { RelicCard } from '../../../components/relics/RelicCard';
import { RelicModal } from '../../../components/relics/RelicModal';
import { RelicRevealDev } from '../../../components/relic-reveal-DEV/RelicRevealDev';
import { CosmicArtifact } from '../../../components/relics/types';
import { mockRelics } from '../relics/mockData';
import { Library, Sparkles, RotateCcw } from 'lucide-react';

export default function RelicsDevPreview() {
  const [inspectArtifact, setInspectArtifact] = useState<CosmicArtifact | null>(null);
  const [revealArtifact, setRevealArtifact] = useState<CosmicArtifact | null>(null);
  const [replayKey, setReplayKey] = useState(0);

  const getRelicsByRarity = (rarity: string) => mockRelics.filter(r => r.rarity === rarity);

  const rarityRanks = ['Transcendent', 'Mythic', 'Legendary', 'Epic', 'Rare', 'Common'];

  const openReveal = (relic: CosmicArtifact) => {
    setInspectArtifact(null);
    setReplayKey(0);
    setRevealArtifact(relic);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6 md:p-12 pb-24 max-w-7xl mx-auto">
      <div className="mb-10 border-b border-neutral-900 pb-6">
        <h1 className="text-3xl font-display text-signal flex items-center gap-3">
          <Library className="text-portal" />
          Relics Gallery — DEV
        </h1>
        <p className="text-sm text-neutral-400 font-mono mt-2 max-w-2xl">
          DEV copy of the Relic Reveal sequence for active UI work. The reference gallery lives at ?preview=relics-gallery.
          Use the Reveal button under any relic to open its full-screen celebration flow.
        </p>
      </div>

      <div className="space-y-16">
        {rarityRanks.map(rarity => {
          const relics = getRelicsByRarity(rarity);
          if (relics.length === 0) return null;

          return (
            <div key={rarity} className="space-y-4">
              <h2 className={`text-lg font-bold uppercase tracking-widest font-sc pb-2 border-b border-neutral-900/50
                ${rarity === 'Transcendent' ? 'text-cyan-400' : 
                  rarity === 'Mythic' ? 'text-red-500' : 
                  rarity === 'Legendary' ? 'text-amber-500' : 
                  rarity === 'Epic' ? 'text-purple-400' : 
                  rarity === 'Rare' ? 'text-emerald-400' : 'text-neutral-500'
                }
              `}>
                {rarity} Rank
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {relics.map(relic => (
                  <div key={relic.id} className="flex flex-col gap-2">
                    <RelicCard 
                      artifact={relic} 
                      onClick={setInspectArtifact} 
                    />
                    <button
                      type="button"
                      onClick={() => openReveal(relic)}
                      className="flex items-center justify-center gap-1.5 py-1.5 rounded-full border border-portal/40 text-portal text-[10px] uppercase tracking-widest font-mono hover:bg-portal/10 hover:border-portal/70 transition-colors"
                    >
                      <Sparkles size={10} />
                      Reveal
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <RelicModal 
        inspectArtifact={inspectArtifact} 
        onClose={() => setInspectArtifact(null)} 
      />

      {revealArtifact && (
        <>
          <RelicRevealDev
            key={revealArtifact.id}
            artifact={revealArtifact}
            replayKey={replayKey}
            onClaim={() => setRevealArtifact(null)}
            onDismiss={() => setRevealArtifact(null)}
          />
          {/* Workshop tool — not part of the product UI */}
          <button
            type="button"
            onClick={() => setReplayKey(k => k + 1)}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[130] flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900/90 border border-neutral-600 text-neutral-200 text-[11px] uppercase tracking-widest font-mono hover:bg-neutral-800 hover:text-white hover:border-neutral-400 transition-colors shadow-lg backdrop-blur"
          >
            <RotateCcw size={12} />
            Replay Effects
          </button>
        </>
      )}
    </div>
  );
}
