/**
 * Verbatim port of Light-Novels `src/lib/glossary/formatter.ts` (verified
 * against `main`), narrowed to the "generation" projection this flow uses.
 * The full retrieval engine (`src/lib/glossary/retrieve.ts` + the 396-entry
 * registry) is intentionally NOT ported — the Workshop fixture supplies a
 * small, already-ranked set of entries instead of re-running retrieval
 * against the full glossary database. See fixtures/mockGenerationData.ts.
 */

export interface GlossaryGenerationResult {
  mode: "generation";
  term: string;
  category: string;
  priority: "high" | "medium" | "low";
  canonicalTerm: string;
  rule: string;
  surfaceForms: string[];
}

export function formatGlossaryForPrompt(
  entries: GlossaryGenerationResult[],
  maxTerms: number = 8,
): string {
  if (!entries || entries.length === 0) {
    return "";
  }

  const uniqueEntries = Array.from(new Map(entries.map(e => [e.term, e])).values());
  const cappedEntries = uniqueEntries.slice(0, maxTerms);

  const lines = cappedEntries.map(e => {
    return `- "${e.term}" (${e.category}): ${e.rule}`;
  });

  return `
=========================================
REFERENCE GLOSSARY GUIDANCE
=========================================
Use these notes only when the term or concept naturally appears in the scene.
Do not introduce, mention, or force any listed term just because it appears here.
Do not add new systems, ranks, powers, factions, or mechanics from this glossary unless the chapter context already calls for them.
${lines.join("\n")}
=========================================
`;
}
