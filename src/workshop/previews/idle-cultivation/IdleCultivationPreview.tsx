import React, { useState } from 'react';
import { IdleCultivationModal } from '../../../components/IdleCultivationModal/IdleCultivationModal';
import { scenarios, PreviewState } from './previewStates';

export function IdleCultivationPreview() {
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
          SEN Workshop
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
              When a state is active, the vignette will appear at the bottom right. Wait 7 seconds for it to collapse into a floating action button. 
            </p>
            <p className="mt-2">
              Click the bubble to trigger the absorption animation, targeting the header element.
            </p>
          </div>
        </div>
      </div>

      {/* The component under test */}
      <IdleCultivationModal 
        qiEarned={qiEarned} 
        onClose={handleClose} 
        onClaim={handleClaim} 
        targetElementId="preview-emblem-target"
      />
    </div>
  );
}
