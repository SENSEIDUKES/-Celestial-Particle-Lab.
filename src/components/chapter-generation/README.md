# Chapter Generation

- **Source repository:** SENSEIDUKES/Light-Novels
- **Source location:** `src/server/routes/storyRouter.ts` (`POST /api/generate-chapter-stream`, verified on `main`), plus `src/server/generationContext.ts`, `src/server/contextBudgeter.ts`, `src/server/contextManifest.ts`, `src/server/entityCards.ts`, `src/server/helpers.ts`, `src/server/prompts.ts` (`PROMPTS.chapter`), `src/lib/codexContext.ts`, `src/lib/contextBlocks.ts`, `src/lib/chapterHandoff.ts`, `src/lib/chapterWritingStyle.ts`, `src/lib/glossary/formatter.ts`, `src/hooks/useChapterGeneration.ts`
- **Workshop preview:** `?preview=chapter-generation-flow`
- **Replica created:** 2026-07-31
- **Last Workshop update:** 2026-07-31
- **Last source comparison:** 2026-07-31
- **Replica status:** under refinement — Reference is a faithful replica of production; Development additionally prototypes two not-yet-in-production systems and a prompt-inspection stage (see below)

## What this is

Unlike every other Workshop entry, Chapter Generation isn't a visual page or
component — it's a backend pipeline (context assembly, token budgeting,
prompt construction, LLM call, structured output). This replica exposes that
*flow* rather than a screen: it runs the real (ported) assembly and budgeting
logic from Light-Novels against safe local mock story data, and lets you step
through exactly what generation receives, in what order, and what shape it
returns.

**Reference and Development now genuinely diverge**, unlike most Workshop
replicas where Development starts as an inert copy of Reference. Reference's
`ChapterGenerationInspector.tsx` is still a byte-for-byte copy of
Development's (the *component* is generic — it just renders whatever
`GenerationStage[]` + `ChapterContent` it's given), but the Workspace now
feeds each pane a **different orchestrator**: Reference always runs
`assembleGeneration.ts` (today's real 10-stage production flow, completely
unchanged from the first pass). Development runs the new
`assembleGenerationDev.ts`, which layers Cultural Prose Styles and Scene
Ending Anchors on top and exposes the 10-step flow described below.

## Folder layout

```
shared/
  types.ts                    — trimmed ChapterContent/StoryBlock/ContextManifest/etc.
                                 types needed by the ported lib/ modules
  stageTypes.ts                — Workshop-only GenerationStage inspection model
  lib/                          — verbatim-or-near-verbatim ports of the PURE
                                 (no network/DB) Light-Novels generation-flow modules:
    helpers.ts                  estimateTokens, rankRelevantEntityCandidates,
                                 formatAbilityLedgerForPrompt, cleanChapterResponse, ...
    codexContext.ts              normalizeCodexSurface/Aliases, strip*CodexFields
    contextBlocks.ts             ACTIVE_CONTEXT_ENGINE, contextBlocksToLegacyStrings
    entityCards.ts               renderEntityCard (full/brief Codex card rendering)
    chapterHandoff.ts            buildChapterContract, renderChapterContractLines
    contextBudgeter.ts           assembleContext (the 24k-token v2 section allocator)
    generationContext.ts         prepareGenerationContext, formatMainCharacterState
                                 (v2-only — the v1 legacy branch was dropped, see below)
    contextManifest.ts           buildContextManifestFromOutcomes (v2 only)
    chapterWritingStyle.ts       appendChapterWritingStyleInstruction
    glossaryFormatter.ts         formatGlossaryForPrompt (generation-mode projection only)
    chapterPrompts.ts            PROMPTS.chapter.system + .userPrompt, copied verbatim
    fatePressureBlocks.ts        NEW — all 4 Fate Pressure tiers, verbatim (assembleGeneration.ts
                                 only ever needed "Balanced"; the Scene Rhythm Tracker needs all 4)
    culturalProse.ts             NEW — Cultural Prose Style catalog + instruction renderer
                                 (not in production yet — see "Development-only additions" below)
    sceneRhythm.ts                NEW — Scene Ending Anchors + Scene Rhythm Tracker
                                  (not in production yet — see "Development-only additions" below)
    chapterEffectsDirection.ts    DEVELOPMENT-ONLY — groups existing Chapter prompt media/effects
                                  instructions for inspection; adds no new direction or media behavior
  fixtures/
    mockGenerationData.ts       two safe mock story scenarios (opening / established chapter),
                                 each now also carrying a `culturalProseStyleId` (or unset, to
                                 exercise the fallback) and a `worldBuildingSeed`; plus
                                 `RHYTHM_SCENARIOS` — 6 fixed Fate-Pressure/rhythm presets
  assembleGeneration.ts         REFERENCE orchestrator — orchestrates the above in
                                 storyRouter.ts's exact order, returns GenerationStage[] + a
                                 mock ChapterContent. Untouched by the Cultural Prose / Scene
                                 Rhythm work; still mirrors today's real production flow exactly.
  assembleGenerationDev.ts      NEW — DEVELOPMENT-ONLY orchestrator. Runs the same real context-
                                 assembly modules as assembleGeneration.ts, then layers Cultural
                                 Prose Style + Scene Ending Anchors on top and groups everything
                                  into the 10-step development flow (see below).

reference/
  ChapterGenerationInspector.tsx  — untouched, locked; fed by assembleGeneration.ts only
development/
  ChapterGenerationInspector.tsx  — identical component to reference/ (it's a generic
                                 GenerationStage[] + ChapterContent viewer); fed by
                                 assembleGenerationDev.ts, which is where the new systems live

workshop/previews/chapter-generation-flow/
  ChapterGenerationFlowWorkspace.tsx — story scenario, rhythm/Fate-Pressure scenario, and
                                 Cultural Prose Style override controls, feeding both
                                 orchestrators independently + the Reference/Development/Compare shell
```

## What was copied (real, running logic)

The context-assembly and prompt-construction pipeline is not reimplemented or
summarized — it is the actual production functions, copied into `shared/lib/`
and run against mock input, exactly like `storyRouter.ts` runs them against a
real Story document:

1. Thread aging + `baseMemory` construction (power system, current power
   stage, world rules, ability ledger, aged unresolved plot threads).
2. `buildChapterContract` (Context Engine 2.5 — deterministic, no LLM call).
3. `prepareGenerationContext` → entity ranking (`rankRelevantEntityCandidates`)
   → `renderEntityCard` (full + brief tiers) → `assembleContext` (the 24k-token
   v2 section budget allocator: premise/MC-state, chapter contract, anchor,
   most-recent chapter, pinned + relevance-ranked entity cards, active plot
   threads, older recent chapters, RAG memories, arc summaries — in that
   order, with real demote-to-brief / drop-when-over-budget behavior).
4. `PROMPTS.chapter.system` (fixed) and `PROMPTS.chapter.userPrompt(...)` (the
   real template function, fed the real assembled context blob).
5. Glossary rules (`formatGlossaryForPrompt`) prepended, chapter writing style
   (`appendChapterWritingStyleInstruction`) appended, AI Director pacing
   directive appended, Fate Pressure ("Balanced") block appended — in the
   exact order `storyRouter.ts` appends them.
6. `buildContextManifestFromOutcomes` — the same token-budget breakdown
   streamed to the client as the first SSE event in production.

`assembleGeneration.ts` groups this real output into the ten
"Generation Order" stages named in the design brief (Premise, Story Seed /
World Context, Genre Rules, Current Arc Context, Recent Chapter Context,
Character / Codex Context, Chapter Instructions, System Prompt Rules, Final
Generation Request, Generated Chapter Output) without rewriting or
summarizing any of the underlying text — each stage's content is a direct
slice or concatenation of the real assembled sections/prompt.

## Development-only additions: Cultural Prose Styles, Scene Ending Anchors, and Chapter Effects Direction

First (skeleton) implementations of two systems that do **not exist in
Light-Novels production yet**. They live only in `assembleGenerationDev.ts`
/ the Development pane; `assembleGeneration.ts` / Reference are completely
unaffected. Both are written as small, pure, portable modules specifically
so they're easy to lift into `src/server/` once approved — see "Exact files
needed for transfer" below.

### 1. Cultural Prose Styles (`lib/culturalProse.ts`)

A dedicated prose-voice input, ported **verbatim** from the approved
research at `LIBRARY CORE/LIBRARY/INFO/SEN - EAST ASIAN PROSE .docx`
(extracted 2026-07-31 — that file is a binary `.docx`, so it was unzipped
and its `word/document.xml` converted to plain text to read it; no style
names or trait wording were invented). The doc defines six leaf styles
under three traditions, each combining tradition-level traits with
style-specific traits:

| Tradition | Style | Catalog id |
| --- | --- | --- |
| Chinese cultivation | Classical worldbuilding | `chinese-classical-worldbuilding` |
| Chinese cultivation | Modern progression | `chinese-modern-progression` |
| Japanese light novels | Character comedy | `japanese-character-comedy` |
| Japanese light novels | Serious fantasy | `japanese-serious-fantasy` |
| Korean web novels | Dungeon power fantasy | `korean-dungeon-power-fantasy` |
| Korean web novels | Romantic drama | `korean-romantic-drama` |

`renderCulturalProseInstruction()` turns a style's trait bullets into its
own clearly-headed `CULTURAL PROSE STYLE: ...` block — appended to the final
prompt as a **dedicated, separate block** (right after the chapter-writing-
style append, before pacing/Fate Pressure), never merged into the STYLE
DIRECTIVE / genre wording, per the design brief. A story's
`culturalProseStyleId` is opt-in (`fixtures/mockGenerationData.ts`'s
"opening" scenario leaves it unset to exercise the fallback path — no block
is added, generation falls back to genre/style-bible alone — the
"established" scenario sets `chinese-classical-worldbuilding`). The
Workshop's "Cultural Prose Style override" control lets you force any
catalog style (or explicit "None") regardless of the story's own setting,
to test all six; `describeCulturalProseSelection()` is what the Workshop's
"Cultural Prose Style" step shows (chosen style, exact instruction text,
source, fallback behavior).

### 2. Scene Ending Anchors + Scene Rhythm Tracker (`lib/sceneRhythm.ts`)

At the end of each chapter, three concrete next-scene candidates
(`worldBuilding` / `conflict` / `progression`) are derived from that
chapter's real (ported) `ChapterHandoff` via `deriveSceneAnchors()` —
`conflict` reuses `handoff.endState.openTension` and `progression` reuses
`handoff.nextImmediateAction` (both already produced by Context Engine 2.5,
so two of the three anchors are structurally real, not invented text); only
`worldBuilding` needs a dedicated seed (`worldBuildingSeed` on the story
fixture — a concrete unexplored story element, e.g. "what the shrine
actually was before it was buried").

`selectNextScenePath()` then picks one anchor for the *next* chapter,
weighted by Fate Pressure tier and constrained by recent-scene-type
repetition rules — every tunable value lives in `SCENE_RHYTHM_CONFIG`
(base weights per tier, max-consecutive-repeats, max-occurrences-in-a-4-
scene-window, and a deterministic tie-break order), so retuning never
touches the selection algorithm itself. The selection is deliberately
deterministic (not randomized) — every choice is fully explainable from
`recentSceneTypes` + `fatePressure` alone, which is what makes it
inspectable: the "Selected Next-Scene Path" Workshop step shows the chosen
type, the winning anchor text, which types (if any) were repetition-
blocked, and a human-readable `reason` string.

The chosen anchor is injected into the real prompt as its own
`NEXT SCENE DIRECTION` block (appended last, after Fate Pressure), and
`sceneTypeUsed` on the mock output records which anchor "directed" this
(mocked) generation — that's what the *next* Workshop call's Scene Rhythm
Tracker input would read.

**Known skeleton-level simplification:** the mock chapter prose itself does
not yet dynamically rewrite per selected scene type — it's the same short
mock body per story scenario regardless of which anchor was chosen (the
mechanism — selection, injection into the prompt, and rhythm persistence —
is fully real and functional; only the actual prose *generation* is mocked,
consistent with the rest of this replica). Refining that is future work,
not part of this skeleton pass.

### 3. Chapter Effects Direction (`lib/chapterEffectsDirection.ts`)

The Development flow now inserts **Chapter Effects Direction** after
**Selected Next-Scene Path** and before **Final Chapter Instructions**. It
groups the exact, already-active chapter-prompt rules for narration and
dialogue metadata, beast sound cues, World Card audio and visual cues, system
panel visual cues, scene music, atmosphere, and narrative cue payloads.

This is an inspection projection only: it reads the ported production prompt
text at runtime and repeats that same output inside **Final Chapter
Instructions**. It does not add a director, select a track, sound, voice, or
asset, change Reader-side media behavior, or change the actual assembled
`finalUserPrompt`.

The Development order is now: Story and Chapter Context, Cultural Prose
Style, Fate Pressure, Recent Scene Rhythm, Available Scene Ending Anchors,
Selected Next-Scene Path, Chapter Effects Direction, Final Chapter
Instructions, Generated Chapter Output, and Newly Generated Anchors.

## What was mocked

- **Story data** — two hand-authored scenarios in `fixtures/mockGenerationData.ts`
  ("Chapter 1 — Story Opening", no prior chapters/contract-history, most
  context sections empty/"Not included"; "Chapter 6 — Established Arc", full
  memory/entities/threads/recent-chapter/RAG/arc-summary/handoff data, all
  sections populated).
- **Glossary retrieval** — `formatGlossaryForPrompt` (the real projection/
  formatting function) is copied verbatim, but its input is a small
  hand-picked list of glossary entries rather than the full 396-entry
  registry + `retrieveGlossaryEntries` scoring engine (`src/lib/glossary/
  retrieve.ts` + registry — not ported; out of scope for an inspection tool).
- **Fate Pressure** — the Reference flow (`assembleGeneration.ts`) only ever
  reproduces the "Balanced" branch's block text (its mock scenario is fixed
  to Balanced). All four tiers (Relaxed/Balanced/Hardcore/Dao Master) are now
  ported verbatim in `lib/fatePressureBlocks.ts`, since the Development
  flow's Scene Rhythm Tracker needs Fate Pressure as an input — see
  "Development-only additions" above.
- **Context Engine v1** — `generationContext.ts`/`contextManifest.ts` port only
  the "v2" branch, matching Light-Novels' `ACTIVE_CONTEXT_ENGINE = "v2"`
  (`contextBlocks.ts`) — production no longer routes new generation through v1.
- **The actual LLM call** — `routeTextGenerationStream(...)` is never invoked.
  The "Generated Chapter Output" stage and the Final Output panel show a
  hand-authored mock `ChapterContent` (blocks, system panels, cuePayload,
  handoff, contract, real contextManifest) matching the real production
  shape, clearly labeled "Mock — not a live model call."
- **Everything persistence/side-effect related** — story persistence
  (`storyStorage`), database writes, R2 uploads, credit deductions
  (`awardQi`), queues, and notifications are simply never called anywhere in
  this replica; there is no code path that could reach them.

## Preview states

- **Mock Story Scenario** — **Chapter 1 — Story Opening** / **Chapter 6 —
  Established Arc**. Feeds both Reference and Development.
- **Scene Rhythm / Fate Pressure Scenario** (Development only) — six fixed
  validation presets, one per case named in the design brief: *Low Fate
  Pressure*, *Balanced Fate Pressure*, *High Fate Pressure*, *Several Recent
  Conflict Scenes*, *Several Repeated Progression Scenes*, *No Previous
  Rhythm or Anchors*. Independent of the story scenario toggle — "No
  Previous Rhythm or Anchors" is most representative paired with "Chapter 1"
  (which also has no previous handoff to derive carried-over anchors from).
- **Cultural Prose Style override** (Development only) — "Story Default"
  (reads the active story scenario's own setting), "None (fallback)", or any
  of the six catalog styles, to exercise all of them regardless of which
  story is active.
- Reference / Development / Compare (via `FeatureWorkspace`, shared with
  every other Workshop entry) — Compare mode now visibly shows the two flows
  diverging (Reference's 10 stages vs. Development's 10 differently grouped
  stages), which is expected.

## Reusable Workshop dependencies

- `FeatureWorkspace` + the `chapter-generation-flow` manifest entry (category `other`)
- Existing `@theme` tokens in `src/styles.css` (`jade-accent`, etc.)
- `lucide-react` (already installed)

## Production dependencies intentionally excluded

- Firebase / Postgres / `storyStorage` persistence
- Cloudflare R2 uploads
- `awardQi` / `scanChapterForArtifacts` / `unlockCosmicArtifact` credit and
  artifact side effects
- `routeTextGenerationStream` / the AI router / any real model call
- `retrieveGlossaryEntries` + the full glossary registry (see "What was mocked")
- Context Engine v1 branch (`truncateContextIfNeeded`'s prose-memory path,
  `buildContextManifest` non-outcomes variant)
- `parseChapterStream`, `runContinuityPass`, `extractChapterMetadata`,
  `validateChapterHandoff`, `persistGeneratedChapter` (the post-stream client
  pipeline stages in `src/hooks/chapterPipeline/`) — this replica models the
  request-construction half of generation, not the post-processing half

## Known differences from the source

- Stage grouping ("Story Seed / World Context", "Recent Chapter Context",
  "Character / Codex Context", etc.) is a Workshop-only presentation layer —
  production has no such named stages; it has ordered prompt sections. The
  grouping is a direct, unmodified concatenation of the real assembled
  sections, chosen to match the names in the design brief.
- `WorldCardEvent.rarity` is typed as `string` here instead of production's
  `CosmicArtifact["rarity"]` reference — `CosmicArtifact` wasn't otherwise
  needed and porting it just for one field type wasn't worth the added surface.
- The mock scenarios are original (not pulled from a real story); they exist
  to exercise every section's included/omitted/demoted states realistically.
- **Cultural Prose Styles and Scene Ending Anchors do not exist in
  Light-Novels production at all yet.** They are a first (skeleton)
  implementation, Development-only, per the design brief. Reference is
  unaffected and continues to reflect exactly what production does today.

## Exact files needed for transfer

Most of this replica (the Reference-flow ports) exists purely for
inspection, as before — resynchronize those by re-copying the relevant
`shared/lib/` files from their verified source paths and updating **Last
source comparison** if the underlying Light-Novels logic changes.

The two Development-only systems are different: they were explicitly built
"compatible with later transfer back into Light-Novels" once approved.
When that happens:

- `shared/lib/culturalProse.ts` → new file, e.g. `src/server/culturalProse.ts`
  or `src/lib/culturalProse.ts` (pure, no Workshop-only concerns — transfers
  as-is). Wire `renderCulturalProseInstruction()`'s output into
  `storyRouter.ts`'s `finalUserPrompt` assembly, and add a
  `culturalProseStyleId` field to the story/request schema.
- `shared/lib/sceneRhythm.ts` → new file, e.g. `src/lib/sceneRhythm.ts`
  (pure, no Workshop-only concerns — transfers as-is). Wire
  `deriveSceneAnchors()` into the metadata-extraction pass (alongside
  `buildChapterContract`, which already runs there) to produce next-chapter
  anchors from each chapter's real `ChapterHandoff`; wire `selectNextScenePath()`
  into `storyRouter.ts` before prompt assembly; persist `recentSceneTypes`
  and the current `SceneAnchors` on the story record (see
  `ChapterGenerationDevOutput` in `assembleGenerationDev.ts` for the minimal
  field shape: `culturalProseStyle`, `sceneRhythm`, `selectedScenePath`,
  `nextSceneAnchors`, `sceneTypeUsed`).
- `shared/lib/fatePressureBlocks.ts` — not a new production file; it's a
  refactor-only extraction of text that already exists inline in
  `storyRouter.ts`. Transferring means replacing that inline text with a
  call to `getFatePressureBlock()` (or just leaving production as-is and
  treating this file as Workshop-only plumbing — either is fine).
- `shared/lib/chapterEffectsDirection.ts` is Workshop-only inspection
  plumbing. Do not transfer it into Light-Novels as a new media/director
  layer; it intentionally only groups instructions that already exist there.
- `shared/assembleGenerationDev.ts` and `shared/fixtures/mockGenerationData.ts`'s
  `RHYTHM_SCENARIOS` are Workshop-only orchestration/fixtures — never transfer.

## Lifecycle

Reference is a locked, faithful comparison point (untouched by this pass).
Development now has a real approval lifecycle for the two new systems:
prototype and refine here against safe mock data (current state) → once the
Cultural Prose Style and Scene Rhythm mechanisms are approved, transfer the
two `lib/` files per the section above and wire them into `storyRouter.ts`
→ resynchronize Reference from the newly-integrated production code,
record the new comparison date. Until then, Development also still absorbs
ordinary inspector-layout refinements, same as any other Workshop replica.

## Workshop history

- **2026-07-31:** Added Cultural Prose Styles (`lib/culturalProse.ts`,
  catalog ported verbatim from `LIBRARY CORE/LIBRARY/INFO/SEN - EAST ASIAN
  PROSE .docx`) and Scene Ending Anchors + Scene Rhythm Tracker
  (`lib/sceneRhythm.ts`) as first-pass, Development-only systems. New
  `assembleGenerationDev.ts` orchestrator exposes the 9-step development
  flow (Story and chapter context, Cultural Prose Style, Fate Pressure,
  Recent Scene Rhythm, Available Scene Ending Anchors, Selected Next-Scene
  Path, Final Chapter Instructions, Generated Chapter Output, Newly
  generated anchors for the following chapter). `assembleGeneration.ts` /
  Reference are unchanged. Added 6 fixed Scene Rhythm validation scenarios
  and a Cultural Prose Style override control to the Workspace.
- **2026-07-31:** Added the Development-only **Chapter Effects Direction**
  step between Selected Next-Scene Path and Final Chapter Instructions. It
  consolidates existing Chapter prompt instructions for music, atmosphere,
  audio cues, World Cards, narration/dialogue metadata, and visual cues, and
  repeats the same inspection output inside Final Chapter Instructions.
  Reference and the actual `finalUserPrompt` assembly remain unchanged.
