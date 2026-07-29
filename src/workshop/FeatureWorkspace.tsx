import React, { useState } from 'react';
import { Lock, FlaskConical, Columns2 } from 'lucide-react';
import type { WorkshopEntry } from './manifest';

export type WorkspaceView = 'reference' | 'development' | 'compare';

export interface FeatureWorkspaceProps {
  entry: WorkshopEntry;
  /** Renders the untouched, locked replica of production. Never edited during normal Workshop tweaking. */
  renderReference: () => React.ReactNode;
  /** Renders the active Workshop version. The only version agents are allowed to change. */
  renderDevelopment: () => React.ReactNode;
  /** Optional viewing-mode-independent controls (scene selectors, preview state buttons) rendered above the canvas. */
  controls?: React.ReactNode;
  /** Disable the Compare viewing mode for features where it doesn't make sense. Defaults to true. */
  allowCompare?: boolean;
}

const statusLabel: Record<WorkshopEntry['status'], string> = {
  draft: 'In Development',
  refining: 'Under Refinement',
  approved: 'Approved',
};

/**
 * The one shared shell every Workshop feature opens into: Original Reference,
 * Development, and an optional Compare viewing mode over the same preview
 * canvas. This is the structural guarantee that no feature can quietly grow
 * a second homepage card — a "V2" is just a Development version inside this
 * shell, never a new entry point.
 */
export function FeatureWorkspace({ entry, renderReference, renderDevelopment, controls, allowCompare = true }: FeatureWorkspaceProps) {
  const [view, setView] = useState<WorkspaceView>('development');
  const [mobilePane, setMobilePane] = useState<'reference' | 'development'>('development');

  return (
    <div className="relative min-h-screen bg-[#04060d] text-slate-300 font-sans flex flex-col">
      <header className="px-6 pt-16 pb-6 border-b border-white/5">
        <h1 className="text-xl sm:text-2xl font-display font-medium tracking-wide text-white/90 uppercase">
          {entry.title}
        </h1>
        <p className="mt-1 text-xs text-white/40 font-mono">
          {statusLabel[entry.status]}
          {entry.source?.lastCompared ? ` · Source checked ${entry.source.lastCompared}` : ''}
        </p>

        <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 p-1 gap-1">
          <button
            type="button"
            onClick={() => setView('reference')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              view === 'reference' ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <Lock size={12} /> Original Reference
          </button>
          <button
            type="button"
            onClick={() => setView('development')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              view === 'development' ? 'bg-cyan-500/20 text-cyan-100' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <FlaskConical size={12} /> Development
          </button>
          {allowCompare && (
            <button
              type="button"
              onClick={() => setView('compare')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                view === 'compare' ? 'bg-violet-500/20 text-violet-100' : 'text-white/50 hover:text-white/80'
              }`}
            >
              <Columns2 size={12} /> Compare
            </button>
          )}
        </div>
      </header>

      {controls && <div className="relative z-[200] px-6 pt-6">{controls}</div>}

      {view !== 'compare' ? (
        <div className="relative flex-1">
          {view === 'reference' ? renderReference() : renderDevelopment()}
        </div>
      ) : (
        <div className="relative flex-1">
          {/* Both panes stay mounted so state and scroll position survive switching — on
              desktop they sit side by side, on mobile only the selected pane is visible. */}
          <div className="hidden md:grid md:grid-cols-2 md:divide-x md:divide-white/10 min-h-full">
            <div className="relative">
              <span className="absolute top-3 left-3 z-[201] px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px] uppercase tracking-widest text-white/50">
                Original Reference
              </span>
              {renderReference()}
            </div>
            <div className="relative">
              <span className="absolute top-3 left-3 z-[201] px-2 py-0.5 rounded-full bg-black/60 border border-cyan-500/30 text-[10px] uppercase tracking-widest text-cyan-200/70">
                Development
              </span>
              {renderDevelopment()}
            </div>
          </div>

          <div className="md:hidden">
            <div className="sticky top-0 z-[201] flex justify-center gap-2 py-2 bg-[#04060d]/95 backdrop-blur border-b border-white/10">
              <button
                type="button"
                onClick={() => setMobilePane('reference')}
                className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-widest ${
                  mobilePane === 'reference' ? 'bg-white/15 text-white' : 'text-white/40'
                }`}
              >
                Reference
              </button>
              <button
                type="button"
                onClick={() => setMobilePane('development')}
                className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-widest ${
                  mobilePane === 'development' ? 'bg-cyan-500/20 text-cyan-100' : 'text-white/40'
                }`}
              >
                Development
              </button>
            </div>
            <div className={mobilePane === 'reference' ? 'relative' : 'hidden'}>{renderReference()}</div>
            <div className={mobilePane === 'development' ? 'relative' : 'hidden'}>{renderDevelopment()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
