import { Copy } from "lucide-react";
import { useState } from "react";
import type { GenerationStage } from "../shared/stageTypes";
import type { ChapterContent } from "../shared/types";

export interface ChapterGenerationInspectorProps {
  stages: GenerationStage[];
  finalOutput: ChapterContent;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="flex shrink-0 items-center gap-1 rounded border border-white/10 px-2 py-1 text-[10px] uppercase tracking-widest text-white/50 transition-colors hover:border-white/30 hover:text-white/80"
    >
      <Copy size={11} />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function ChapterGenerationInspector({ stages, finalOutput }: ChapterGenerationInspectorProps) {
  const [selectedKey, setSelectedKey] = useState(stages[0]?.key);
  const selected = stages.find(s => s.key === selectedKey) ?? stages[0];
  const finalOutputJson = JSON.stringify(finalOutput, null, 2);

  if (!selected) return null;

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 overflow-x-hidden px-3 py-6 sm:px-4 lg:grid-cols-[300px_1fr]">
      {/* 1. Generation Order */}
      <aside className="h-fit min-w-0 overflow-hidden rounded-lg border border-white/10 bg-black/30 lg:sticky lg:top-4">
        <h2 className="border-b border-white/10 px-3 py-2 text-[11px] uppercase tracking-widest text-white/60">
          Generation Order
        </h2>
        <ol className="max-h-[70vh] divide-y divide-white/5 overflow-y-auto">
          {stages.map((stage, index) => (
            <li key={stage.key}>
              <button
                type="button"
                onClick={() => setSelectedKey(stage.key)}
                aria-current={stage.key === selected.key}
                className={`flex w-full min-w-0 flex-col items-stretch gap-2 px-3 py-2.5 text-left text-xs transition-colors sm:flex-row sm:items-start sm:justify-between ${
                  stage.key === selected.key ? "bg-cyan-500/10 text-cyan-100" : "text-white/70 hover:bg-white/5"
                }`}
              >
                <span className="flex min-w-0 items-start gap-2">
                  <span className="mt-0.5 shrink-0 font-mono text-[10px] text-white/30">{index + 1}</span>
                  <span className="min-w-0">
                    <span className="block font-medium">{stage.name}</span>
                    <span className="mt-0.5 block text-[10px] leading-snug text-white/40">{stage.description}</span>
                  </span>
                </span>
                <span className="flex shrink-0 flex-row items-center justify-between gap-2 sm:flex-col sm:items-end">
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-wide ${
                      stage.included ? "bg-jade-accent/10 text-jade-accent" : "bg-white/5 text-white/30"
                    }`}
                  >
                    {stage.included ? "Included" : "Not included"}
                  </span>
                  {stage.tokenEstimate > 0 && (
                    <span className="font-mono text-[9px] text-white/30">~{stage.tokenEstimate.toLocaleString()} tok</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </aside>

      <div className="flex min-w-0 flex-col gap-4">
        {/* 2. Selected Step */}
        <section className="rounded-lg border border-white/10 bg-black/30">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
            <h2 className="text-[11px] uppercase tracking-widest text-white/60">
              Selected Step — <span className="text-white/90">{selected.name}</span>
            </h2>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-white/40">
                {selected.sizeChars.toLocaleString()} chars · ~{selected.tokenEstimate.toLocaleString()} tokens
              </span>
              {selected.content.trim() && <CopyButton text={selected.content} />}
            </div>
          </div>
          <div className="max-h-[52vh] max-w-full overflow-auto overscroll-contain p-3">
            {selected.content.trim() ? (
              <pre className={`max-w-full whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed [overflow-wrap:anywhere] ${selected.format === "json" ? "text-jade-accent/90" : "text-white/80"}`}>
                {selected.content}
              </pre>
            ) : (
              <p className="text-xs text-white/30">
                Nothing was assembled for this stage in the current scenario — it renders empty and is marked "Not included".
              </p>
            )}
          </div>
        </section>

        {/* 3. Final Output */}
        <section className="rounded-lg border border-white/10 bg-black/30">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
            <h2 className="text-[11px] uppercase tracking-widest text-white/60">
              Final Output — <span className="text-white/90">Generated Chapter (ChapterContent)</span>
            </h2>
            <CopyButton text={finalOutputJson} />
          </div>
          <div className="max-h-[40vh] overflow-auto p-3">
            <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-jade-accent/90">
              {finalOutputJson}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ChapterGenerationInspector;
