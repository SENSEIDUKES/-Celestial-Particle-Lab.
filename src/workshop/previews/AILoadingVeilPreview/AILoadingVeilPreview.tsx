import React, { useState, useEffect } from 'react';
import AILoadingVeil from '../../../components/AILoadingVeil/AILoadingVeil';
import { Square, Sparkles, Minimize2, Compass, Layers } from 'lucide-react';

type GenerationPhase = 'blueprint' | 'initial-arc' | 'steer' | 'cover' | 'chapter' | null;

const VEIL_PHASES: { id: Exclude<GenerationPhase, null>; label: string }[] = [
  { id: 'blueprint', label: 'World Blueprint' },
  { id: 'initial-arc', label: 'Initial Arc' },
  { id: 'steer', label: 'Steering' },
  { id: 'cover', label: 'Cover Art' },
  { id: 'chapter', label: 'Chapter' },
];

export default function AILoadingVeilPreview() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [phase, setPhase] = useState<GenerationPhase>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [estimatedSecondsRemaining, setEstimatedSecondsRemaining] = useState<number | null>(null);
  const [activeAgentId, setActiveAgentId] = useState<'versa' | 'scout'>('versa');
  const [streamingBlocksCount, setStreamingBlocksCount] = useState(0);
  const [isVeilMinimized, setIsVeilMinimized] = useState(false);
  const [generatingChapterNum, setGeneratingChapterNum] = useState<number | null>(1);
  const [veilPhase, setVeilPhase] = useState<Exclude<GenerationPhase, null>>('chapter');

  // Simulation loop for chapter phase progress
  useEffect(() => {
    if (isGenerating && phase === 'chapter') {
      const timer = setInterval(() => {
        setStreamingBlocksCount(prev => (prev >= 20 ? 0 : prev + 1));
        setEstimatedSecondsRemaining(prev => prev && prev > 0 ? prev - 1 : 45);
      }, 1500);
      return () => clearInterval(timer);
    }
  }, [isGenerating, phase]);

  const resetRun = () => {
    setStreamingBlocksCount(0);
    setProgressMessage(null);
    setEstimatedSecondsRemaining(null);
  };

  // The one primary veil — Versa, full-screen, blocking.
  const openVeil = () => {
    resetRun();
    setActiveAgentId('versa');
    setPhase(veilPhase);
    setEstimatedSecondsRemaining(veilPhase === 'chapter' ? 45 : null);
    setIsVeilMinimized(false);
    setIsGenerating(true);
  };

  // Versa working in the background — compact indicator with expand control.
  const openVersaCompact = () => {
    resetRun();
    setActiveAgentId('versa');
    setPhase('chapter');
    setEstimatedSecondsRemaining(45);
    setIsVeilMinimized(true);
    setIsGenerating(true);
  };

  // Scout retrieval — always compact, never blocks the screen.
  const openScoutCompact = () => {
    resetRun();
    setActiveAgentId('scout');
    setPhase(null);
    setProgressMessage('Scanning the archives...');
    setIsVeilMinimized(false);
    setIsGenerating(true);
  };

  const stopSimulation = () => {
    setIsGenerating(false);
    setPhase(null);
    resetRun();
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 p-4 sm:p-8 font-sans text-neutral-200">
      <div className="max-w-2xl mx-auto space-y-6 pt-14 sm:pt-8">
        <div>
          <h1 className="text-2xl font-bold font-display text-signal tracking-wide mb-2">Loading System Simulator</h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            One shared loading system, two visual modes. The primary veil blocks the screen for long
            operations; the compact indicator covers background and short tasks.
          </p>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl divide-y divide-neutral-800/80">
          {/* Primary veil */}
          <section className="p-5 sm:p-6 space-y-4">
            <h2 className="text-xs font-semibold text-neutral-300 flex items-center gap-2 uppercase tracking-widest">
              <Layers size={14} className="text-human" /> Primary Veil
            </h2>
            <p className="text-[11px] text-neutral-500 leading-snug">
              Full-screen immersive veil for blocking operations. Pick a phase, then open the veil.
            </p>
            <div className="flex flex-wrap gap-2">
              {VEIL_PHASES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setVeilPhase(p.id)}
                  className={`px-3 py-1.5 text-[11px] rounded-full border transition-colors ${
                    veilPhase === p.id
                      ? 'bg-human/15 border-human/40 text-human'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              onClick={openVeil}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-human/20 border border-human/40 hover:bg-human/30 text-human text-sm font-semibold tracking-wide rounded-lg transition-colors"
            >
              <Sparkles size={15} /> Open Veil — Versa
            </button>
          </section>

          {/* Compact indicators */}
          <section className="p-5 sm:p-6 space-y-4">
            <h2 className="text-xs font-semibold text-neutral-300 flex items-center gap-2 uppercase tracking-widest">
              <Minimize2 size={14} className="text-portal" /> Compact Indicators
            </h2>
            <p className="text-[11px] text-neutral-500 leading-snug">
              The floating corner indicator for background work. Versa can expand back into the veil;
              Scout is always compact and never blocks the screen.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={openVersaCompact}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-500 text-sm font-medium rounded-lg transition-colors"
              >
                <Minimize2 size={14} /> Versa — Background
              </button>
              <button
                onClick={openScoutCompact}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-portal/10 border border-portal/30 hover:bg-portal/20 text-portal text-sm font-medium rounded-lg transition-colors"
              >
                <Compass size={14} /> Scout — Retrieval
              </button>
            </div>
          </section>

          {/* Stop */}
          <section className="p-5 sm:p-6">
            <button
              onClick={stopSimulation}
              disabled={!isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Square size={13} /> Stop Simulation
            </button>
          </section>
        </div>

        {/* Helper content to verify background stays visible when minimized */}
        <div className="p-6 border border-neutral-800/50 rounded-lg text-neutral-500 text-sm">
          Background app content... (Testing minimize state visibility)
        </div>
      </div>

      <AILoadingVeil
        isGenerating={isGenerating}
        generationPhase={phase}
        generationProgressMessage={progressMessage}
        estimatedSecondsRemaining={estimatedSecondsRemaining}
        activeAgentId={activeAgentId}
        streamingBlocksCount={streamingBlocksCount}
        isVeilMinimized={isVeilMinimized}
        setIsVeilMinimized={setIsVeilMinimized}
        generatingChapterNum={generatingChapterNum}
      />
    </div>
  );
}
