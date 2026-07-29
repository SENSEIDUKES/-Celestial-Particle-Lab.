import React from 'react';
import { Award, Sparkles, HelpCircle, Shield, Zap, RefreshCw, Save, Sliders, Compass, Globe, Key } from 'lucide-react';
import { CosmicArtifact } from './types';

// Performance Optimization: Cache Intl.DateTimeFormat at module level
const dateFormatter = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
const safeFormatDate = (dateVal: any) => {
  if (!dateVal) return 'Unknown';
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? 'Unknown' : dateFormatter.format(d);
};

interface RelicModalProps {
  inspectArtifact: CosmicArtifact | null;
  onClose: () => void;
}

export function RelicModal({ inspectArtifact, onClose }: RelicModalProps) {
  if (!inspectArtifact) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" 
      role="button"
      tabIndex={0}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') onClose(); }}
    >
      <div 
        className="w-full max-w-md bg-void border border-neutral-900 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(4,172,255,0.1)] relative"
        role="dialog"
        aria-modal="true"
      >
        <div className={`absolute top-0 inset-x-0 h-[2px] ${
          inspectArtifact.rarity === 'Transcendent' 
            ? 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent' 
            : inspectArtifact.rarity === 'Mythic' 
            ? 'bg-gradient-to-r from-transparent via-red-500 to-transparent' 
            : inspectArtifact.rarity === 'Legendary' 
            ? 'bg-gradient-to-r from-transparent via-amber-500 to-transparent'
            : inspectArtifact.rarity === 'Epic'
            ? 'bg-gradient-to-r from-transparent via-purple-500 to-transparent'
            : inspectArtifact.rarity === 'Rare'
            ? 'bg-gradient-to-r from-transparent via-emerald-500 to-transparent'
            : 'bg-gradient-to-r from-transparent via-neutral-500 to-transparent'
        }`}></div>
        
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-black/60 border border-neutral-900 flex items-center justify-center relative shadow-inner overflow-hidden">
              {(() => {
                const lower = inspectArtifact.name.toLowerCase();
                const size = 28;
                let className = "";
                const rarity = inspectArtifact.rarity;
                
                if (rarity === 'Transcendent') className = "text-cyan-400 animate-pulse drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]";
                else if (rarity === 'Mythic') className = "text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]";
                else if (rarity === 'Legendary') className = "text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]";
                else if (rarity === 'Epic') className = "text-purple-400";
                else if (rarity === 'Rare') className = "text-emerald-400";
                else className = "text-neutral-500";

                if (lower.includes('medallion') || lower.includes('badge')) return <Award size={size} className={className} />;
                if (lower.includes('seal') || lower.includes('signet')) return <Shield size={size} className={className} />;
                if (lower.includes('gourd') || lower.includes('nectar') || lower.includes('cauldron') || lower.includes('potion')) return <Zap size={size} className={className} />;
                if (lower.includes('spindle') || lower.includes('thread') || lower.includes('matrix')) return <RefreshCw size={size} className={className} />;
                if (lower.includes('pen') || lower.includes('brush') || lower.includes('scribe')) return <Save size={size} className={className} />;
                if (lower.includes('crown') || lower.includes('circlet') || lower.includes('tiara')) return <Sliders size={size} className={className} />;
                if (lower.includes('compass')) return <Compass size={size} className={className} />;
                if (lower.includes('mirror')) return <Globe size={size} className={className} />;
                if (lower.includes('key')) return <Key size={size} className={className} />;
                return <Sparkles size={size} className={className} />;
              })()}
              <div className="absolute inset-0 bg-gradient-to-t from-portal/5 via-transparent to-transparent"></div>
            </div>
            
            <div className="space-y-1">
              <span className={`text-[10px] uppercase font-bold tracking-widest font-mono block px-3 py-1 rounded-full bg-neutral-900/50 border border-neutral-850 max-w-fit mx-auto ${
                inspectArtifact.rarity === 'Transcendent' 
                  ? 'text-cyan-400 border-cyan-950 bg-cyan-950/20' 
                  : inspectArtifact.rarity === 'Mythic' 
                  ? 'text-red-400 border-red-950 bg-red-950/20' 
                  : inspectArtifact.rarity === 'Legendary' 
                  ? 'text-amber-400 border-amber-950 bg-amber-950/20'
                  : inspectArtifact.rarity === 'Epic'
                  ? 'text-purple-400 border-purple-950 bg-purple-950/20'
                  : inspectArtifact.rarity === 'Rare'
                  ? 'text-emerald-400 border-emerald-950 bg-emerald-950/20'
                  : 'text-neutral-400'
              }`}>
                {inspectArtifact.rarity} Relic
              </span>
              <h3 className="font-display text-xl text-signal">{inspectArtifact.name}</h3>
              <p className="text-[10px] text-neutral-500 font-mono">
                Acquired on {safeFormatDate(inspectArtifact.unlockedAt)}
              </p>
              <p className="text-[10px] text-neutral-500 font-mono">
                Status: {inspectArtifact.status === 'submitted' || inspectArtifact.status === 'auto_submitted' ? 'Submitted to Library' : 'In Pouch'}
              </p>
            </div>
          </div>

          <div className="bg-[#030303] border border-neutral-900 p-4 rounded-xl space-y-2 shadow-inner">
            <h4 className="text-[9px] uppercase font-bold tracking-widest text-neutral-500 font-sc">Sacred Relic Lore</h4>
            <p className="text-xs font-serif text-neutral-300 leading-relaxed italic">
              "{inspectArtifact.description}"
            </p>
          </div>

          <div className="bg-[#030303] border border-neutral-900 p-4 rounded-xl flex items-center justify-between">
            <div>
              <h4 className="text-[9px] uppercase font-bold tracking-widest text-neutral-500 font-sc">Offering Rewards</h4>
              <p className="text-[10px] text-neutral-500 font-sans mt-0.5">Granted by the Celestial Library upon submission</p>
            </div>
            <div className="px-3 py-1.5 bg-portal/10 border border-portal/30 rounded-lg text-xs font-bold font-mono text-portal animate-pulse flex flex-col items-end gap-0.5 shadow-[0_0_10px_rgba(4,172,255,0.1)]">
              <div className="flex items-center gap-1.5"><Zap size={12} /><span>+{inspectArtifact.rewardValueQi || 0} Qi</span></div>
              <div className="flex items-center gap-1.5"><Award size={12} /><span>+{inspectArtifact.rewardValueSectMerit || 0} Sect Merit</span></div>
            </div>
          </div>

          <div className="text-[10px] text-neutral-500 font-mono flex justify-between items-center px-1">
            <span>Unlock Catalyst:</span>
            <span className="text-neutral-300 font-sans font-medium">{inspectArtifact.milestoneName}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-6 py-2.5 border border-neutral-800 text-neutral-400 hover:text-signal hover:border-neutral-700 rounded-full font-sc uppercase tracking-widest text-[11px] font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
