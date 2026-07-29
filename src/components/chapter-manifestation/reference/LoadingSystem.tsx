import React from 'react';
import { AnimatePresence } from 'motion/react';
import type { LoadingTaskCard } from '../shared/taskCard';
import LoadingVeil from './LoadingVeil';
import CompactIndicator from '../shared/CompactIndicator';

export type LoadingSystemMode = 'auto' | 'primary' | 'compact';

export interface LoadingSystemProps {
  /** Whether the operation is currently running. */
  active: boolean;
  /** The normalized task card to present, or null when idle. */
  task: LoadingTaskCard | null;
  /**
   * 'auto' follows task.preferredMode; 'primary' and 'compact' force a mode.
   * Primary falls back to the compact indicator whenever minimized.
   */
  mode?: LoadingSystemMode;
  minimized: boolean;
  onMinimizedChange: (minimized: boolean) => void;
  /**
   * Delay before the compact indicator first paints. Operations that
   * finish inside this window never render anything — they complete too
   * quickly to communicate useful information.
   */
  compactGraceMs?: number;
  /** Optional cinematic backdrop rendered behind the primary veil's content. */
  backdrop?: React.ReactNode;
  /** Optional spacing override for the primary veil's agent emblem container. */
  emblemClassName?: string;
}

const DEFAULT_COMPACT_GRACE_MS = 1200;

/**
 * LoadingSystem — the single entry point for operation loading UI.
 * Owns mode routing (primary veil vs compact indicator) and the shared
 * presence wrapper; the presentations themselves are interchangeable
 * renderers of the same LoadingTaskCard.
 */
export default function LoadingSystem({
  active,
  task,
  mode = 'auto',
  minimized,
  onMinimizedChange,
  compactGraceMs = DEFAULT_COMPACT_GRACE_MS,
  backdrop,
  emblemClassName,
}: LoadingSystemProps) {
  const resolvedMode: Exclude<LoadingSystemMode, 'auto'> =
    mode === 'auto' ? (task?.preferredMode ?? 'primary') : mode;

  // Compact mode waits out a grace window so very short tasks stay hidden.
  const [compactReady, setCompactReady] = React.useState(false);
  React.useEffect(() => {
    setCompactReady(false);
    if (!active) return;
    const id = setTimeout(() => setCompactReady(true), compactGraceMs);
    return () => clearTimeout(id);
  }, [active, compactGraceMs]);

  if (!task) return null;

  const showPrimary = active && resolvedMode === 'primary' && !minimized;
  const showCompact =
    active &&
    !showPrimary &&
    compactReady &&
    (resolvedMode === 'compact' || minimized);

  return (
    <AnimatePresence>
      {showPrimary && (
        <LoadingVeil
          key="primary-veil"
          task={task}
          onMinimize={() => onMinimizedChange(true)}
          backdrop={backdrop}
          emblemClassName={emblemClassName}
        />
      )}
      {showCompact && (
        <CompactIndicator
          key="compact-indicator"
          task={task}
          onExpand={resolvedMode === 'primary' ? () => onMinimizedChange(false) : undefined}
        />
      )}
    </AnimatePresence>
  );
}
