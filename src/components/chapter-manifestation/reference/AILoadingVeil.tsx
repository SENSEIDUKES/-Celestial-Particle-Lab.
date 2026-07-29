import React from 'react';
import LoadingSystem from './LoadingSystem';
import { buildAILoadingTaskCard } from '../shared/taskCard';

export interface AILoadingVeilProps {
  isGenerating: boolean;
  generationPhase: string | null;
  generationProgressMessage: string | null;
  estimatedSecondsRemaining: number | null;
  activeAgentId: 'versa' | 'scout' | null;
  streamingBlocksCount: number;
  isVeilMinimized: boolean;
  setIsVeilMinimized: (minimized: boolean) => void;
  generatingChapterNum: number | null;
}

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
 * Adapter between the generation flow and the shared LoadingSystem.
 * Keeps the original props, quote rotation, and progress derivation
 * untouched; all presentation now lives in the LoadingSystem's two
 * interchangeable modes (primary veil / compact indicator).
 */
export default function AILoadingVeil({
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

  // Determine if we should show the full-screen immersive veil or the minimized floating widget.
  const shouldShowFullScreen = isGenerating && !isVeilMinimized;

  // Live progress signal
  const passagesWoven = streamingBlocksCount;
  const progressWidth = isChapterPhase
    ? Math.min(6 + passagesWoven * 4.5, 96)
    : null;

  // Rotate Versa's status quotes every few seconds while she works.
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
    />
  );
}
