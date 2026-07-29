import React from 'react';
import LoadingSystem from '../LoadingSystem/LoadingSystem';
import { buildAILoadingTaskCard } from '../LoadingSystem/taskCard';
import { CelestialParticleShower } from '../../CelestialParticleShower';
import type { AILoadingVeilProps } from './AILoadingVeil';

// Short atmospheric status lines Versa cycles through while a chapter is forged.
const VERSA_QUOTES = [
  'Cooking the chapter...',
  'Forging continuity...',
  'Weaving celestial threads...',
  'Condensing spiritual essence...',
  'Consulting the Codex...',
  'Binding narrative threads...',
];

/**
 * DEV copy of AILoadingVeil — the experimental veil under active iteration.
 * Starts identical to the reference (AILoadingVeil) so visual changes can be
 * compared side by side in the Workshop preview. Workshop-only: do not wire
 * this into production flows.
 */
export default function DevLoadingVeil({
  isGenerating,
  generationPhase,
  generationProgressMessage,
  estimatedSecondsRemaining,
  activeAgentId,
  streamingBlocksCount,
  isVeilMinimized,
  setIsVeilMinimized,
  generatingChapterNum
}: AILoadingVeilProps) {
  const [quoteIndex, setQuoteIndex] = React.useState(0);

  const isChapterPhase = generationPhase === 'chapter';

  const shouldShowFullScreen = isGenerating && !isVeilMinimized;

  const passagesWoven = streamingBlocksCount;
  const progressWidth = isChapterPhase
    ? Math.min(6 + passagesWoven * 4.5, 96)
    : null;

  React.useEffect(() => {
    if (!shouldShowFullScreen || !isChapterPhase) {
      setQuoteIndex(0);
      return;
    }
    const id = setInterval(() => {
      setQuoteIndex(i => (i + 1) % VERSA_QUOTES.length);
    }, 3500);
    return () => clearInterval(id);
  }, [shouldShowFullScreen, isChapterPhase, generatingChapterNum]);

  const statusQuote = isChapterPhase
    ? VERSA_QUOTES[quoteIndex]
    : (generationProgressMessage || 'Manifesting spiritual matrices...');

  const task = buildAILoadingTaskCard({
    generationPhase,
    generationProgressMessage,
    estimatedSecondsRemaining,
    activeAgentId,
    streamingBlocksCount,
    generatingChapterNum,
    statusQuote,
    progress: progressWidth,
  });

  return (
    <LoadingSystem
      active={isGenerating}
      task={task}
      mode="auto"
      minimized={isVeilMinimized}
      onMinimizedChange={setIsVeilMinimized}
      backdrop={
        <CelestialParticleShower
          accent={activeAgentId === 'scout' ? '#04ACFF' : '#c22e1f'}
        />
      }
    />
  );
}
