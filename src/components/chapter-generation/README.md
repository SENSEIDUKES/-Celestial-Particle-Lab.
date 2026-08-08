# Chapter Generation

- **Source repository:** `SENSEIDUKES/Light-Novels`
- **Source location:** `src/server/routes/storyRouter.ts` and its chapter-context, prompt, handoff, formatting, and glossary dependencies
- **Workshop preview:** `?preview=chapter-generation-flow`
- **Replica created:** 2026-07-31
- **Last Workshop update:** 2026-08-08
- **Last source comparison:** 2026-07-31
- **Replica status:** Pass 2 four-stage pipeline implemented; provider calls remain deterministic Workshop adapters

## Purpose

This Workshop entry exposes the Chapter Generation 1.0 backend flow against safe
local fixtures. It uses the ported context assembly, budgeting, prompt, contract,
and formatting logic while replacing live provider and persistence boundaries with
deterministic adapters. The inspector UI is intentionally unchanged.

Reference and Development now run the same shared pipeline foundation. Development
still owns its Cultural Prose override and rhythm/Fate-pressure preview controls,
but those controls feed packet assembly or planning rather than creating additional
generation steps.

## Four actual stages

### 1. Assemble Chapter Packet

`assembleChapterPacket()` is pure code assembly and makes no model call. It builds
one model-visible packet containing:

- Story Constitution, excluding the unresolved legacy Fate-pressure vocabulary bridge
- Living Story State
- Chapter Mission and contract
- Generation Rules and consolidated permanent writing/formatting instructions
- existing anchors and budgeted relevant context
- Cultural Prose, accessibility, glossary, world, narration, and effect rules
- the explicit arc/chapter position, for example `Arc 1 — Chapter 6/100`

Permanent Story Seed choices and story rules belong here automatically. They are
not independent generation stages or calls.

### 2. Plan Chapter

One structured planning call receives the complete Chapter Packet and decides all
chapter-specific direction together:

- response to recent scene rhythm
- interpretation and selection of an existing ending anchor
- Fate Survival application for this chapter
- appropriate chapter effects
- scene progression and pacing
- intended ending and next-chapter handoff target

The result is one `ChapterPlan`. The canonical Fate Survival configuration stays
in the packet; Development's preview pressure tier is an explicit planning signal.
No unapproved Story Seed pressure mapping is inferred.

### 3. Manifest Chapter

One writing call receives the complete Chapter Packet, the `ChapterPlan`, and the
consolidated permanent writing and formatting instructions. It returns only the
manifested `ChapterContent`. It does not generate anchors, mutate story state, or
advance the chapter counter.

### 4. Process Result

One structured processing call inspects the manifested chapter and returns:

- new anchors
- character and world-state changes
- completed, changed, and unresolved threads
- mission completion evidence
- continuity and repetition findings
- the next-chapter handoff
- a proposed next `LivingStoryState`

The proposed state is a cloned candidate for later approval. The input state and
chapter position remain unchanged across normal runs and retries. A separate repair
call is allowed only when processing reports a serious finding and recommends repair.

## Model-call boundaries

Normal path:

1. `planChapter`
2. `manifestChapter`
3. `processResult`

Conditional path:

4. `repairChapter`, only after a serious processing finding

Stage 1 and all permanent story rules make no model call. The Workshop adapters
implement these provider-shaped boundaries locally so previewing never consumes
credits, performs network requests, or writes story data.

## What the former steps became

| Former responsibility | Four-stage owner |
| --- | --- |
| Premise | Stage 1 relevant context and Chapter Mission |
| Story Seed and World Blueprint | Stage 1 Story Constitution |
| Genre rules | Stage 1 permanent Generation Rules; consumed directly by Stage 3 |
| Current arc | Stage 1 Living Story State and model-visible arc/chapter position |
| Recent chapter/history | Stage 1 budgeted relevant context |
| Character and Codex state | Stage 1 Living Story State |
| Chapter instructions | Permanent rules in Stage 1; chapter-specific pacing, Fate, effects, and direction in Stage 2 |
| System prompt | Stage 1 consolidated permanent instructions; consumed directly by Stage 3 |
| Final generation request | Stage 3 manifest call input |
| Generated chapter output | Stage 3 manifested chapter, then Stage 4 structured inspection/proposal |
| Development Cultural Prose | Stage 1 packet setting |
| Development rhythm and available anchors | Stage 1 state, interpreted in Stage 2 |
| Development selected path and effect direction | Stage 2 `ChapterPlan` |
| Development new anchors and next-scene behavior | Stage 4 processing result |

The former ten-step arrays no longer execute beneath these names. The generic
`GenerationStage[]` adapter exists only to display the four results in the existing
inspector.

## Layout

```text
shared/
  assembleGeneration.ts       Reference adapter
  assembleGenerationDev.ts    Development adapter and preview-only controls
  packets/                     Pass 1 contracts, trace, flags, and context assembly
  pipeline/
    assembleChapterPacket.ts   pure Stage 1 assembly
    chapterEffectRules.ts      permanent seven-category effect rules
    runChapterPipeline.ts      shared four-stage orchestration
    types.ts                   packet, plan, processing, and provider boundaries
    workshopModelCalls.ts      deterministic preview planning/processing adapters
  lib/                         ported context, prompt, handoff, and formatting helpers
reference/
  ChapterGenerationInspector.tsx
development/
  ChapterGenerationInspector.tsx
```

## Preserved and intentionally changed behavior

The ported context preparation, contract, prompt, accessibility, Cultural Prose,
glossary, and effect-formatting owners remain the packet's source of truth. Their
normalized text behavior is preserved when the same inputs reach them.

The old ten-stage normalized behavior hashes are intentionally not a compatibility
target: the stage topology, structured plan, processing result, and call boundaries
changed by design in Pass 2. No prompt content was rewritten to simulate the new
architecture.

## Workshop boundaries

- No live model, database, persistence, R2, credit, queue, or notification call runs.
- No real `LivingStoryState` update or chapter advancement is committed.
- No unresolved Story Seed world-rule, glossary, style, or Fate vocabulary mapping is inferred.
- No UI redesign or real chapter-testing section is included in this pass.
- Compatibility fields on final `ChapterContent` are attached only at the external
  inspector boundary from Stage 1 contracts and Stage 4 processing output.

## Validation

- `npm run test:chapter-generation`
- `npm run test:story-seed`
- `npx tsc --noEmit --pretty false`
- `npm run build`
- `npm run validate:chapter-effects`

Focused pipeline tests cover the four stage keys, Stage 1 purity, normal and repair
call counts, permanent-rule behavior, planning ownership of Fate/effects, processing
ownership of anchors/proposed state, retry immutability, and model-visible position.

## Workshop history

- **2026-07-31:** Created the Reference replica and Development fork from the inspected production flow.
- **2026-08-08:** Pass 1 introduced Story Constitution, Living Story State, Chapter Mission, and Generation Rules with a complete 65-ID trace and nine explicit unresolved flags.
- **2026-08-08:** Pass 1 centralized shared packet-backed context assembly across both generation adapters.
- **2026-08-08:** Pass 2 replaced both ten-step orchestrators with one real four-stage pipeline and three normal provider boundaries plus conditional repair.

## Transfer notes

Transfer the contracts and `shared/pipeline/` provider boundaries into the production
generation service, then wire actual structured model providers at
`ChapterGenerationModelCalls`. Keep `workshopModelCalls.ts`, fixtures, inspectors,
preview controls, and `GenerationStage` serialization in the Workshop.
