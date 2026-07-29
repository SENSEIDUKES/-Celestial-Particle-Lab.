import React, { useState } from 'react';
import { RelicCard } from '../../../components/relics/RelicCard';
import { RelicModal } from '../../../components/relics/RelicModal';
import { CosmicArtifact } from '../../../components/relics/types';
import { mockRelics } from './mockData';
import { Library } from 'lucide-react';

export default function RelicsPreview() {
  const [inspectArtifact, setInspectArtifact] = useState<CosmicArtifact | null>(null);

  const getRelicsByRarity = (rarity: string) => mockRelics.filter(r => r.rarity === rarity);

  const rarityRanks = ['Transcendent', 'Mythic', 'Legendary', 'Epic', 'Rare', 'Common'];

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6 md:p-12 pb-24 max-w-7xl mx-auto">
      <div className="mb-10 border-b border-neutral-900 pb-6">
        <h1 className="text-3xl font-display text-signal flex items-center gap-3">
          <Library className="text-portal" />
          Relics Gallery
        </h1>
        <p className="text-sm text-neutral-400 font-mono mt-2 max-w-2xl">
          Visual development preview for Cosmic Artifacts (Relics). Showcasing all rarity tiers and their corresponding visual treatments.
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
                  <RelicCard 
                    key={relic.id} 
                    artifact={relic} 
                    onClick={setInspectArtifact} 
                  />
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
    </div>
  );
}
