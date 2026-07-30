import React, { useState, useEffect } from 'react';
import ReferenceAILoadingVeil from '../../../components/chapter-manifestation/reference/AILoadingVeil';
import DevelopmentAILoadingVeil from '../../../components/chapter-manifestation/development/AILoadingVeil';
import { defaultDestinationFor } from '../../../components/chapter-manifestation/development/journey-scrubber/destinations';
import { FeatureWorkspace } from '../../FeatureWorkspace';
import { workshopEntries } from '../../manifest';
import { Square, Sparkles, Minimize2, Compass, Layers, ChevronUp, Wand2 } from 'lucide-react';

type GenerationPhase = 'blueprint' | 'initial-arc' | 'steer' | 'cover' | 'chapter' | null;

const VEIL_PHASES: { id: Exclude<GenerationPhase, null>; label: string }[] = [
  { id: 'blueprint', label: 'World Blueprint' },
  { id: 'initial-arc', label: 'Initial Arc' },
  { id: 'steer', label: 'Steering' },
  { id: 'cover', label: 'Cover Art' },
  { id: 'chapter', label: 'Chapter' },
];

/**
 * Journey scrubber cosmetics — Workshop-only preview state for the
 * Development veil's cosmetic slots. Picking a traveler also applies its
 * recommended destination family, but the destination stays independently
 * selectable so every traveler can be tested with every family.
 */
interface ScrubberCosmetics {
  travelerId: string;
  trailStyle: string;
  destinationId: string;
}

const TRAVELER_OPTIONS = [
  { id: 'cultivator', label: 'Cultivator' },
  { id: 'sword-rider', label: 'Sword Rider' },
  { id: 'spirit-beast', label: 'Spirit Beast' },
];

const TRAIL_OPTIONS = [
  { id: 'qi-glow', label: 'Qi Glow' },
  { id: 'scroll-trail', label: 'Scroll Trail' },
  { id: 'starlight-trail', label: 'Starlight Trail' },
];

const DESTINATION_OPTIONS = [
  { id: 'door', label: 'Door / Gate' },
  { id: 'sect', label: 'Sect / Temple' },
  { id: 'cave', label: 'Cave' },
];

function useScrubberCosmetics() {
  const [travelerId, setTravelerId] = useState('cultivator');
  const [trailStyle, setTrailStyle] = useState('qi-glow');
  const [destinationId, setDestinationId] = useState(() => defaultDestinationFor('cultivator'));

  // A traveler switch nominates its recommended destination; the
  // destination control itself remains free, so any combination is testable.
  const pickTraveler = (id: string) => {
    setTravelerId(id);
    setDestinationId(defaultDestinationFor(id));
  };

  return { travelerId, trailStyle, destinationId, pickTraveler, setTrailStyle, setDestinationId };
}

/**
 * One simulated generation run, shared by whichever veil implementation
 * (reference or development, or both in Compare) is currently mounted — so
 * comparisons are judged against identical live state, not two independent
 * simulations.
 */
function useGenerationSimulation() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [phase, setPhase] = useState<GenerationPhase>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [estimatedSecondsRemaining, setEstimatedSecondsRemaining] = useState<number | null>(null);
  const [activeAgentId, setActiveAgentId] = useState<'versa' | 'scout'>('versa');
  const [streamingBlocksCount, setStreamingBlocksCount] = useState(0);
  const [isVeilMinimized, setIsVeilMinimized] = useState(false);
  const [generatingChapterNum] = useState<number | null>(1);
  const [veilPhase, setVeilPhase] = useState<Exclude<GenerationPhase, null>>('chapter');

  useEffect(() => {
    if (isGenerating && phase === 'chapter') {
      const timer = setInterval(() => {
        setStreamingBlocksCount((prev) => (prev >= 20 ? 0 : prev + 1));
        setEstimatedSecondsRemaining((prev) => (prev && prev > 0 ? prev - 1 : 45));
      }, 1500);
      return () => clearInterval(timer);
    }
  }, [isGenerating, phase]);

  const resetRun = () => {
    setStreamingBlocksCount(0);
    setProgressMessage(null);
    setEstimatedSecondsRemaining(null);
  };

  const openVeil = () => {
    resetRun();
    setActiveAgentId('versa');
    setPhase(veilPhase);
    setEstimatedSecondsRemaining(veilPhase === 'chapter' ? 45 : null);
    setIsVeilMinimized(false);
    setIsGenerating(true);
  };

  const openVersaCompact = () => {
    resetRun();
    setActiveAgentId('versa');
    setPhase('chapter');
    setEstimatedSecondsRemaining(45);
    setIsVeilMinimized(true);
    setIsGenerating(true);
  };

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

  return {
    isGenerating,
    phase,
    progressMessage,
    estimatedSecondsRemaining,
    activeAgentId,
    streamingBlocksCount,
    isVeilMinimized,
    setIsVeilMinimized,
    generatingChapterNum,
    veilPhase,
    setVeilPhase,
    openVeil,
    openVersaCompact,
    openScoutCompact,
    stopSimulation,
  };
}

function SimulationControls({
  sim,
  cosmetics,
}: {
  sim: ReturnType<typeof useGenerationSimulation>;
  cosmetics: ReturnType<typeof useScrubberCosmetics>;
}) {
  const [showPhases, setShowPhases] = useState(false);

  const optionRow = (
    label: string,
    options: { id: string; label: string }[],
    selected: string,
    onPick: (id: string) => void,
  ) => (
    <div>
      <p className="text-[11px] text-neutral-500 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onPick(o.id)}
            className={`px-3 py-1.5 text-[11px] rounded-full border transition-colors ${
              selected === o.id
                ? 'bg-portal/15 border-portal/40 text-portal'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl bg-neutral-900/50 border border-neutral-800 rounded-xl divide-y divide-neutral-800/80">
      <section className="p-5 sm:p-6 space-y-4">
        <h2 className="text-xs font-semibold text-neutral-300 flex items-center gap-2 uppercase tracking-widest">
          <Wand2 size={14} className="text-portal" /> Journey Scrubber — Development only
        </h2>
        {optionRow('Traveler', TRAVELER_OPTIONS, cosmetics.travelerId, cosmetics.pickTraveler)}
        {optionRow('Aura Trail', TRAIL_OPTIONS, cosmetics.trailStyle, cosmetics.setTrailStyle)}
        {optionRow('Destination', DESTINATION_OPTIONS, cosmetics.destinationId, cosmetics.setDestinationId)}
      </section>

      <section className="p-5 sm:p-6 space-y-4">
        <h2 className="text-xs font-semibold text-neutral-300 flex items-center gap-2 uppercase tracking-widest">
          <Layers size={14} className="text-human" /> Primary Veil
        </h2>
        <div>
          <button
            onClick={() => setShowPhases((v) => !v)}
            className="flex items-center gap-1.5 text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
            aria-expanded={showPhases}
          >
            Phase · <span className="text-neutral-300">{VEIL_PHASES.find((p) => p.id === sim.veilPhase)?.label}</span>
            <ChevronUp size={12} className={`transition-transform ${showPhases ? '' : 'rotate-180'}`} />
          </button>
          {showPhases && (
            <div className="flex flex-wrap gap-2 mt-2.5">
              {VEIL_PHASES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => sim.setVeilPhase(p.id)}
                  className={`px-3 py-1.5 text-[11px] rounded-full border transition-colors ${
                    sim.veilPhase === p.id
                      ? 'bg-human/15 border-human/40 text-human'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={sim.openVeil}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-human/20 border border-human/40 hover:bg-human/30 text-human text-sm font-semibold tracking-wide rounded-lg transition-colors w-full sm:w-auto"
        >
          <Sparkles size={15} /> Open Veil
        </button>
      </section>

      <section className="p-5 sm:p-6 space-y-4">
        <h2 className="text-xs font-semibold text-neutral-300 flex items-center gap-2 uppercase tracking-widest">
          <Minimize2 size={14} className="text-portal" /> Compact Indicators
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={sim.openVersaCompact}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-500 text-sm font-medium rounded-lg transition-colors"
          >
            <Minimize2 size={14} /> Versa — Background
          </button>
          <button
            onClick={sim.openScoutCompact}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-portal/10 border border-portal/30 hover:bg-portal/20 text-portal text-sm font-medium rounded-lg transition-colors"
          >
            <Compass size={14} /> Scout — Retrieval
          </button>
        </div>
      </section>

      <section className="p-5 sm:p-6">
        <button
          onClick={sim.stopSimulation}
          disabled={!sim.isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Square size={13} /> Stop Simulation
        </button>
      </section>
    </div>
  );
}

function VeilCanvas({ Veil, sim }: { Veil: typeof ReferenceAILoadingVeil; sim: ReturnType<typeof useGenerationSimulation> }) {
  return (
    <div className="relative min-h-[calc(100vh-11rem)] bg-neutral-950 p-4 sm:p-8 font-sans text-neutral-200">
      <div className="p-6 border border-neutral-800/50 rounded-lg text-neutral-500 text-sm">
        Background app content... (Testing minimize state visibility)
      </div>
      <Veil
        isGenerating={sim.isGenerating}
        generationPhase={sim.phase}
        generationProgressMessage={sim.progressMessage}
        estimatedSecondsRemaining={sim.estimatedSecondsRemaining}
        activeAgentId={sim.activeAgentId}
        streamingBlocksCount={sim.streamingBlocksCount}
        isVeilMinimized={sim.isVeilMinimized}
        setIsVeilMinimized={sim.setIsVeilMinimized}
        generatingChapterNum={sim.generatingChapterNum}
      />
    </div>
  );
}

/**
 * Development-only canvas: identical simulation state, plus the scrubber
 * cosmetics from the Workshop controls forwarded into the Development veil.
 */
function DevelopmentVeilCanvas({
  sim,
  cosmetics,
}: {
  sim: ReturnType<typeof useGenerationSimulation>;
  cosmetics: ScrubberCosmetics;
}) {
  return (
    <div className="relative min-h-[calc(100vh-11rem)] bg-neutral-950 p-4 sm:p-8 font-sans text-neutral-200">
      <div className="p-6 border border-neutral-800/50 rounded-lg text-neutral-500 text-sm">
        Background app content... (Testing minimize state visibility)
      </div>
      <DevelopmentAILoadingVeil
        isGenerating={sim.isGenerating}
        generationPhase={sim.phase}
        generationProgressMessage={sim.progressMessage}
        estimatedSecondsRemaining={sim.estimatedSecondsRemaining}
        activeAgentId={sim.activeAgentId}
        streamingBlocksCount={sim.streamingBlocksCount}
        isVeilMinimized={sim.isVeilMinimized}
        setIsVeilMinimized={sim.setIsVeilMinimized}
        generatingChapterNum={sim.generatingChapterNum}
        travelerId={cosmetics.travelerId}
        trailStyle={cosmetics.trailStyle}
        destinationId={cosmetics.destinationId}
      />
    </div>
  );
}

export function ChapterManifestationWorkspace() {
  const entry = workshopEntries.find((e) => e.id === 'chapter-generation-manifestation')!;
  const sim = useGenerationSimulation();
  const cosmetics = useScrubberCosmetics();

  return (
    <FeatureWorkspace
      entry={entry}
      controls={<SimulationControls sim={sim} cosmetics={cosmetics} />}
      renderReference={() => <VeilCanvas Veil={ReferenceAILoadingVeil} sim={sim} />}
      renderDevelopment={() => <DevelopmentVeilCanvas sim={sim} cosmetics={cosmetics} />}
    />
  );
}

export default ChapterManifestationWorkspace;
