import React, { useState, useEffect } from 'react';
import AILoadingVeil from '../../../components/AILoadingVeil/AILoadingVeil';
import { Play, Square, Settings2, SkipForward } from 'lucide-react';

type GenerationPhase = 'blueprint' | 'initial-arc' | 'steer' | 'cover' | 'chapter' | null;

export default function AILoadingVeilPreview() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [phase, setPhase] = useState<GenerationPhase>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [estimatedSecondsRemaining, setEstimatedSecondsRemaining] = useState<number | null>(null);
  const [activeAgentId, setActiveAgentId] = useState<'versa' | 'scout'>('versa');
  const [streamingBlocksCount, setStreamingBlocksCount] = useState(0);
  const [isVeilMinimized, setIsVeilMinimized] = useState(false);
  const [generatingChapterNum, setGeneratingChapterNum] = useState<number | null>(1);

  // Simulation loop for chapter phase progress
  useEffect(() => {
    if (isGenerating && phase === 'chapter' && !isVeilMinimized) {
      const timer = setInterval(() => {
        setStreamingBlocksCount(prev => (prev >= 20 ? 0 : prev + 1));
        setEstimatedSecondsRemaining(prev => prev && prev > 0 ? prev - 1 : 45);
      }, 1500);
      return () => clearInterval(timer);
    }
  }, [isGenerating, phase, isVeilMinimized]);

  const startSimulation = (selectedPhase: GenerationPhase) => {
    setIsGenerating(true);
    setPhase(selectedPhase);
    setStreamingBlocksCount(0);
    setEstimatedSecondsRemaining(selectedPhase === 'chapter' ? 45 : null);
    setIsVeilMinimized(false);
  };

  const stopSimulation = () => {
    setIsGenerating(false);
    setPhase(null);
    setStreamingBlocksCount(0);
    setEstimatedSecondsRemaining(null);
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 p-8 font-sans text-neutral-200">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold font-display text-signal tracking-wide mb-2">Manifestation UI Simulator</h1>
          <p className="text-sm text-neutral-400">
            Controls for testing the AILoadingVeil component in isolation.
          </p>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-lg space-y-6">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-neutral-300 flex items-center gap-2 uppercase tracking-widest">
              <Settings2 size={16} /> Agent & Context
            </h2>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="agent"
                  checked={activeAgentId === 'versa'}
                  onChange={() => setActiveAgentId('versa')}
                  className="accent-human"
                />
                VERSA (Writer)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="agent"
                  checked={activeAgentId === 'scout'}
                  onChange={() => setActiveAgentId('scout')}
                  className="accent-portal"
                />
                SCOUT (Retriever)
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-neutral-300 flex items-center gap-2 uppercase tracking-widest">
              <Play size={16} /> Trigger States
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => startSimulation('blueprint')}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs rounded transition-colors"
              >
                World Blueprint
              </button>
              <button
                onClick={() => startSimulation('initial-arc')}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs rounded transition-colors"
              >
                Initial Arc
              </button>
              <button
                onClick={() => startSimulation('steer')}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs rounded transition-colors"
              >
                Steering
              </button>
              <button
                onClick={() => startSimulation('cover')}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs rounded transition-colors"
              >
                Cover Art
              </button>
              <button
                onClick={() => startSimulation('chapter')}
                className="px-4 py-2 bg-human/20 border border-human/30 hover:bg-human/30 text-human text-xs rounded transition-colors"
              >
                Chapter Manifestation
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800 flex justify-between items-center">
            <button
              onClick={stopSimulation}
              disabled={!isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 text-xs rounded disabled:opacity-50 transition-colors"
            >
              <Square size={14} /> Stop Simulation
            </button>
          </div>
        </div>
        
        {/* Helper content to verify background stays visible when minimized */}
        <div className="p-8 border border-neutral-800/50 rounded-lg text-neutral-500 text-sm">
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
