import { Component, Suspense, type ErrorInfo, type ReactNode } from 'react';

interface DeferredWorkspaceProps {
  children: ReactNode;
  loadingLabel?: string;
  className?: string;
}

interface DeferredWorkspaceErrorBoundaryProps {
  children: ReactNode;
  className?: string;
}

interface DeferredWorkspaceErrorBoundaryState {
  failed: boolean;
}

const fallbackShell = (className?: string) => [
  'grid min-h-[18rem] place-items-center bg-[#04060d] px-6 py-16 text-center',
  className,
].filter(Boolean).join(' ');

class DeferredWorkspaceErrorBoundary extends Component<
  DeferredWorkspaceErrorBoundaryProps,
  DeferredWorkspaceErrorBoundaryState
> {
  state: DeferredWorkspaceErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): DeferredWorkspaceErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Deferred Workshop preview failed to load:', error, info);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className={fallbackShell(this.props.className)} role="alert">
          <div className="max-w-sm rounded-xl border border-red-900/70 bg-red-950/20 px-5 py-4">
            <p className="font-sans text-sm text-red-100">
              This Workshop preview could not be loaded.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 min-h-11 rounded-lg border border-white/15 bg-white/5 px-4 py-2 font-sans text-xs font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            >
              Reload preview
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function DeferredWorkspaceLoading({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div className={fallbackShell(className)} role="status" aria-live="polite">
      <span className="inline-flex items-center gap-3 font-sans text-xs uppercase tracking-[0.18em] text-white/55">
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border border-white/20 border-t-cyan-300 motion-reduce:animate-none"
        />
        {label}
      </span>
    </div>
  );
}

/** Keeps lazy Workshop routes and panes visually stable while their chunks load. */
export function DeferredWorkspace({
  children,
  loadingLabel = 'Loading preview',
  className,
}: DeferredWorkspaceProps) {
  return (
    <DeferredWorkspaceErrorBoundary className={className}>
      <Suspense fallback={<DeferredWorkspaceLoading label={loadingLabel} className={className} />}>
        {children}
      </Suspense>
    </DeferredWorkspaceErrorBoundary>
  );
}
