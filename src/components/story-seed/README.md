# Story Seed

- **Source repository:** SENSEIDUKES/Light-Novels
- **Source location:** `src/components/CreationModal.tsx` (default export `CreationModal`, verified on `main`)
- **Workshop preview:** `?preview=story-seed` (add `&state=<scenario-id>` to deep-link a preview state)
- **Replica created:** 2026-08-01
- **Last Workshop update:** 2026-08-01
- **Last source comparison:** 2026-08-01
- **Replica status:** under refinement

## Workshop history

- **2026-08-01:** Phase 2 — full user-facing redesign of the Story Seed
  interface around the Phase 1 Creator / Story / World contract. The numbered
  accordion intake was **replaced** (not polished) with a two-panel creation
  workspace: a Story/World selector on the left, one focused editing surface
  on the right, a Creator strip under the header, an explicit Save Draft
  action, a sticky action bar that tracks the four required Story inputs and
  hosts Forge World Blueprint, and a read-only Story Seed summary sheet. On
  mobile the selector becomes a slide-over drawer opened from the action bar;
  the active family/section stays visible through the workspace breadcrumb.
  Small schema corrections connecting the interface: `creator.penName` added
  to the Creator family, and intake paths added for the previously unreachable
  schema fields `story.style` (`proseStyle`), `world.optional.universe`
  (`universeOverview`), and `world.optional.majorMysteries` (newline list).
  The Phase 1 form files (`CoreSeedForm`, `WorldSettingForm`,
  `CharacterSetupForm`, `CustomCharactersForm`, `CustomFactionsForm`,
  `PowerSystemForm`, `PlotControlForm`, `MakeItWorkForm`, `FormSection`) were
  deleted from `development/` — git history preserves them; `reference/` is
  untouched and still renders the production accordion for Compare.
- **2026-08-01:** Added a separate minimal `StoryAdministrativeMetadata`
  spine at the initial-story generation boundary. It contains only story and
  creator identity, timestamps, schema/content versions, story/generation/
  visibility/publishing states, original/current language, and durable
  references to the source seed, current chapter, and cover asset. It is not
  serialized into the user-facing Creator / Story / World seed.
- **2026-08-01:** Completed Story Seed Phase 1 data reconstruction for the
  development fork without redesigning its form. The active record is now
  schema version 2 with explicit `creator`, `story`, and `world` families;
  Story Tags, Premise, Genre, and Style are required; World accepts an empty
  `optional` object. Added strict normalization/validation, portable v2 JSON,
  a development repository with save/load support, generation request
  builders, a narrow v1 intake/blueprint import adapter, and focused contract
  tests. The locked reference fork still uses the production v1 replica.
- **2026-08-01:** Created faithful Workshop replica and local state simulator (9
  preview states across Intake / Blueprint / Library / Auth categories, in-memory
  seed storage, DOM-driven scenario scripting that fills the real form and clicks
  the real buttons rather than reaching into component internals).
- **2026-08-01:** Redesigned the auth gate (Foundation v2): replaced the "Sync
  Spirit" panel with `development/StoryAuthGate.tsx` — a cinematic full-canvas
  takeover with a video backdrop (poster fallback + soft crossfade, no video
  under reduced motion), a nearly-invisible glass shell, exact new copy
  ("Your Destiny Awaits" / "Your Story Seed will not be lost."), three mock
  provider actions (Google / Apple / Email with an inline email form), and a
  post-sign-in dissolve that keeps the world visible before the intake is
  revealed.
- **2026-08-01:** Renamed the Workshop-facing feature from "Story Seed Intake"
  to "Story Seed" (manifest title, `development/CreationModal.tsx` heading,
  this README) — `reference/CreationModal.tsx` was left untouched since
  production still uses the old heading. Extracted the Genre Path selector
  and `FateSurvivalExplanation` out of `development/CoreSeedForm.tsx`
  entirely into a brand-new standalone Workshop feature,
  [Story Settings](../story-settings/README.md), with its own manifest
  entry, Development tab, and preview route (`?preview=story-settings`) —
  not a section nested inside Story Seed. `development/FateSurvivalExplanation.tsx`
  was deleted here since it moved to `story-settings/`;
  `reference/CoreSeedForm.tsx` and `reference/FateSurvivalExplanation.tsx`
  are untouched, matching production, which still has Fate Survival inside
  Core Seed. Also relabeled the Workshop's own Preview-State category tabs
  (Intake → "Intake Form", Blueprint → "Blueprint Review", Library → "Seed
  Library", Auth → "Sign In") and strengthened their active-tab contrast and
  touch target size (`min-h-[2.75rem]`) for mobile clarity.

## Folder layout

```
reference/                    — untouched replica of production, locked
  CreationModal.tsx            — default export, `CreationModalProps`
  BlueprintReview.tsx
  CharacterSetupForm.tsx
  CoreSeedForm.tsx              — one deliberate mock: tag suggestions (see below)
  CustomCharactersForm.tsx
  CustomFactionsForm.tsx
  FormSection.tsx
  ImportPanel.tsx
  MakeItWorkForm.tsx
  PlotControlForm.tsx
  PowerSystemForm.tsx
  SeedLibraryPanel.tsx
  WorldSettingForm.tsx
  FateSurvivalExplanation.tsx   — story-seed's own copy (reader-chamber has its
                                   own separate fork; the two production source
                                   files differ, confirmed via diff)
  constants.ts                  — GENRE_PRESETS, PREMISE_SUGGESTIONS, TAG_PRESETS,
                                   CATEGORIZED_TAGS
  form-fields/
    FormInput.tsx
    FormTextarea.tsx
    index.ts
development/                  — active Workshop version (Phase 2 creation workspace)
  CreationModal.tsx            — two-panel shell: header (Save Draft + actions
                                 menu), Creator strip, selector/workspace grid,
                                 sticky action bar, mobile section drawer
  seedSections.ts              — the Story/World section model: ids, labels,
                                 icons, required/secondary flags, per-section
                                 filled checks, missing-required helpers
  StorySeedSelector.tsx        — left-panel navigation (desktop sidebar and
                                 mobile drawer share it) + Preview Story Seed card
  StorySeedSummary.tsx         — read-only summary sheet (required checklist,
                                 Creator/Story data, World filled-or-generate rows)
  workspaces/
    WorkspaceShell.tsx          — shared breadcrumb/title/chip shell, field
                                  classes, GuidanceNote, WorkspaceSubheading
    StoryTagsWorkspace.tsx      — required; tag add/suggest/browse + limit
    PremiseWorkspace.tsx        — required; premise + suggestions + ghost-tag Tab
    GenreWorkspace.tsx          — required; preset grid + custom genre input
    StyleWorkspace.tsx          — required; prose style + presets
    StorySettingsWorkspace.tsx  — optional catch-all (plot, trope, tone,
                                  pacing, fate pressure, custom rules)
    WorldIdentityWorkspace.tsx  — optional; title, world type, society, location
    CharactersWorkspace.tsx     — optional; main character + additional cast
    FactionsWorkspace.tsx       — optional; faction/sect editor
    AbilitiesWorkspace.tsx      — optional; starting power concept + unique path
    PowerSystemWorkspace.tsx    — optional; power flavor + known ranks
    DestinedEndingWorkspace.tsx — optional; destined ending
    OtherWorldSettingsWorkspace.tsx — optional; universe overview + major mysteries
  StoryAuthGate.tsx            — Foundation v2 cinematic auth gate (added
                                 2026-08-01); rendered by CreationModal's
                                 signed-out branch
  BlueprintReview.tsx          — blueprint review stage (unchanged from Phase 1)
  ImportPanel.tsx              — seed/blueprint JSON import (unchanged)
  SeedLibraryPanel.tsx         — account seed library; now toggled from the
                                 header actions menu instead of always rendered
  constants.ts                  — GENRE_PRESETS, PREMISE_SUGGESTIONS, TAG_PRESETS,
                                   CATEGORIZED_TAGS, STYLE_SUGGESTIONS (Phase 2)
  form-fields/                 — shared FormInput/FormTextarea used by workspaces
shared/                        — shared infrastructure plus fork-specific data boundaries
  types.ts                     — IntakeCharacter, IntakeFaction, IntakeData,
                                  WorldBlueprint, StorySeedPayload, StorySeed,
                                  NamedCodexEntry (narrow local subset). Phase 2
                                  added view-model fields: creatorPenName,
                                  proseStyle, universeOverview, majorMysteries.
  storySeedFormat.ts            — verbatim: normalizeStorySeedPayload,
                                  downloadStorySeed, downloadStorySeedCollection,
                                  parseStorySeedJson, and their normalization
                                  helpers (pure, browser-only file download/parse)
  id.ts                         — verbatim: generateUUID, generateId (pure)
  dialect.ts                    — verbatim dictionary/logic: getDialectLabel,
                                  resolveDialect, DIALECT_DICTIONARY, useDialect
                                  (only the import of `useAppStore` was rewritten
                                  to point at ./stubs; StorySettingsWorkspace only
                                  calls getDialectLabel — useDialect is unused here
                                  but kept for parity with production's export surface)
  codexContext.ts               — normalizeCodexAliases, parseCodexAliases,
                                  normalizeCodexSurface, findCodexAliasCollisions
                                  (only the alias-normalization subset used by
                                  CharactersWorkspace/FactionsWorkspace; the
                                  legacy-field-stripping helpers that operate on
                                  the full Codex entry shape were not copied,
                                  since the Codex system itself is excluded)
  stubs.ts                      — mock external store (useAppStore +
                                  selectIsGenerating, no zustand), mutable
                                  LOCAL_ONLY_MODE + setMockLocalOnlyMode,
                                  AGENTS.VERSA, mockLogin, in-memory
                                  storySeedStorage (createStorySeed/
                                  updateStorySeed/listStorySeeds/importStorySeeds),
                                  getApiHeaders, suggestTagsStub
  storySeedSchema.ts            — development's authoritative creative intake
                                  contract, field classification, validation,
                                  form adapters, and generation payload builders
  storySeedSerialization.ts     — portable schema-v2 export/import; excludes
                                  operational IDs and narrowly migrates valid
                                  v1 intake/blueprint files
  storySeedRepository.ts        — account-scoped development save/load adapter
                                  backed by Workshop local storage
  storySeedSchema.test.ts       — focused validation, empty-World,
                                  classification, serialization, persistence,
                                  and generation-payload checks (8 tests;
                                  `npm run test:story-seed`)
  storyAdministrativeMetadata.ts — minimal internal story identity, lifecycle,
                                   language, version, and durable-reference spine
```

## Creative-data structure (Phase 1 + Phase 2 corrections)

```ts
{
  creator: {
    penName?: string          // Phase 2 — the Creator family's first field
  },
  story: {
    storyTags: string[],
    premise: string,
    genre: string,
    style: string,
    optional: {}
  },
  world: {
    optional: {}
  }
}
```

The Phase 2 workspace edits a flat `IntakeData` view model section by section
(one section visible at a time). A single boundary adapter classifies it before
save, export, or generation, so the flat prototype shape is never durable data.

- **Creator:** pen name only, collected in a quiet strip under the header so it
  never competes with the required Story inputs.
- **Story:** required Story Tags / Premise / Genre / Style first (Genre is an
  explicit preset-or-custom input again; Style is an explicit `proseStyle`
  input pre-filled with the Library default), then the optional plot
  direction, length, atmosphere, danger/tension, power pacing,
  goals/conflicts/antagonist pressure, romance/comedy/trope controls,
  exclusions/inclusions, Fate settings, absolute custom rules, generated
  logline/first-arc promise/trope rules, and unresolved plot threads under
  the secondary Story Settings surface.
- **World:** title, world type and overview (`universeOverview`), location,
  society, main character, additional characters, factions, abilities,
  power-system definition, destined ending, and major mysteries
  (newline-separated `majorMysteries`) — all optional; empty World stays valid.
- **Internal metadata:** schema version, seed/account IDs, display title, and
  created/updated timestamps remain on `StorySeedRecord`, outside the creative
  intake families.

## Internal story administration

Story creation carries a separate administrative record alongside the Story
Seed generation payload:

```ts
{
  storyId,
  creatorId,
  createdAt,
  updatedAt,
  schemaVersion,
  contentVersion,
  storyStatus,
  generationStatus,
  visibility,
  publishingState,
  originalLanguage,
  currentLanguage,
  sourceSeedId,
  currentChapterId,
  coverAssetId
}
```

New records begin as `DRAFT`, `QUEUED`, `PRIVATE`, and `UNPUBLISHED`.
Current-chapter and cover references begin as `null`; the source Story Seed
reference is required. No administrative field is included in portable Story
Seed JSON, and no administrative field is rendered anywhere in the Phase 2 UI.

Both forks render inside
`src/workshop/previews/story-seed/StorySeedWorkspace.tsx`, which shares one mock
account/seed-library state and one categorized preview-control panel (Creation
Workspace / Blueprint Review / Seed Library / Sign In) between them via
`FeatureWorkspace`.

## What was copied

The full Story Seed presentation tree from `src/components/` and
`src/features/creation/` in Light-Novels: `CreationModal.tsx` (default export),
every file under `src/features/creation/components/`, `src/features/creation/constants.ts`,
and `src/components/FateSurvivalExplanation.tsx` (rendered inside `CoreSeedForm`
for the Fate Survival genre). All `reference/` markup, class names, copy, and
interaction logic are byte-identical except for import-path rewrites and the two
documented mocks below. The `development/` fork was then rebuilt for Phase 2:
same persistence/generation logic and field contracts, completely new layout.

## What was mocked

Per the Workshop Replica skill's production boundary (no Firebase, no
Postgres/persistence, no real network calls):

- **`useAppStore` / `selectIsGenerating`** (`store/useAppStore`,
  `store/useGenerationStore`) — a tiny external store on
  `useSyncExternalStore` (no zustand) in `shared/stubs.ts`, exposing
  `currentUser`, `activeAgentId`, `stories`, `routingConfig`, `isGenerating`
  with the same call signatures (`useAppStore(selector)` + `.getState()`).
- **`auth` / `LOCAL_ONLY_MODE`** (`lib/firebase`) and `firebase/auth`
  (`signInWithPopup`, `GoogleAuthProvider`) — `LOCAL_ONLY_MODE` is a mutable
  `let` (default `true`) with a `setMockLocalOnlyMode` setter, unlike
  reader-chamber's frozen `true` constant: `CreationModal`'s auth-gated
  screen (`!currentUser && !LOCAL_ONLY_MODE`) is a real, reachable preview
  state here (`auth-gated`), not permanently excluded. `StoryAuthGate`'s
  three provider actions (Google / Apple / Email, including the inline
  email/password form) all resolve through the same `mockLogin()` stub after
  a short simulated delay so their loading states are inspectable; the
  mock never fails, so the gate's Firebase-code error mapping is dormant
  here. `CreationModal` keeps the gate mounted for
  `STORY_AUTH_DISSOLVE_MS` (900ms) after sign-in so the shell dissolves
  over the still-visible backdrop before the intake is revealed.
- **`lib/storySeedStorage`** (`createStorySeed`, `updateStorySeed`,
  `listStorySeeds`, `importStorySeeds`) — replaced with an in-memory
  module-level array in `shared/stubs.ts` implementing the exact same call
  signatures. Save / Import / "Use Seed" from the Library panel all mutate
  real local state, so those interactions genuinely work.
- **`lib/agents` `AGENTS.VERSA`** — only the small VERSA profile object
  (`id`/`name`/`logoUrl`/`colorClass`) was copied into `shared/stubs.ts`,
  not the whole agents catalog (`AGENTS.SCOUT` is unused by this feature).
  `logoUrl` is still the real public `images.seihouse.org` asset URL — kept
  for visual fidelity, same precedent as reader-chamber's R2 backdrop URLs.
- **`hooks/storyEngineHelpers.getApiHeaders`** — inert stub in
  `shared/stubs.ts` returning a plain JSON content-type header (production
  reads API keys out of `secureStorage`, which was not copied).
- **`fetch('/api/suggest-tags', …)` inside `StoryTagsWorkspace.tsx`** — this is
  the one line of business logic that could not stay faithful: the real
  `fetch` call was replaced with `suggestTagsStub(...)` from
  `shared/stubs.ts`, which resolves a canned, genre-aware `{ suggestedTags,
  reasoning }` object after a short simulated delay. No network call is ever
  made; the Suggest/Refresh button, its loading state, error banner, and
  per-tag add flow are otherwise fully functional and interactive.
- **`onGenerateBlueprint` / `onStartStory` props** — mocked in
  `StorySeedWorkspace.tsx`: `onGenerateBlueprint` logs to console and
  resolves the canned `WorldBlueprint` from `previewData.ts` after a short
  delay; `onStartStory` logs its arguments. Neither triggers a real AI
  pipeline.
- **Save Draft in local-only mode** — the Workshop repository
  (`shared/storySeedRepository.ts`) is local-storage backed, so the new Save
  Draft action writes under a stable `local-workshop-creator` namespace when
  no account is signed in, keeping the action real and inspectable in every
  preview state. On transfer, gate draft saving on real auth exactly like
  `persistSeed` does (see Transfer notes).

## Available preview states

The Workshop preview-control menu is split into four categories, selected
with a compact `Creation Workspace | Blueprint Review | Seed Library | Sign In`
row. Category membership lives on each scenario in
`src/workshop/previews/story-seed/previewStates.ts` (`category` field), and any
scenario can be deep-linked with `?preview=story-seed&state=<scenario-id>`.
`CreationModal` owns `intake`, `stage`, and panel visibility as internal
component state with no override props, so every scenario that needs filled
data or a different stage drives the **real rendered controls** — typing into
the actual inputs and clicking the actual buttons — the same approach
reader-chamber's `clickInChamber` uses, never a shortcut into React internals.
Since Phase 2 the two panes are structurally different UIs, so pane wrappers
carry `data-story-seed-pane="reference|development"` and each scenario script
drives each fork through its own real controls (the reference accordion steps
are unchanged; the development script walks the new selector).

**Creation Workspace** — the intake stage (`stage === 'intake'`)

- `empty-intake` — default mount, Story Tags active, nothing filled
- `filled-intake` — scripts a representative fill across both forks: Story
  Tags (2 preset tags), Premise, Genre (Fate Survival), World Identity,
  Characters (MC fields + 1 added character), Factions (+1), Abilities, Power
  System, and Story Settings, landing back on Story Tags
- `generating-blueprint` — `isGenerating` prop `true`, showing the Forge
  button's spinner state
- `import-panel-open` — opens the actions menu and clicks the real "Import
  Story Seed" item to open `ImportPanel`
- `summary-open` — clicks the real "Preview Story Seed" card to open the
  summary sheet

**Blueprint Review** — the blueprint review stage (`stage === 'blueprint'`)

- `blueprint-review` — signs in a mock account, populates the seed library,
  opens it from the actions menu, then clicks the real "Use Seed" button on
  the first saved seed (`handleUseSeed`'s genuine production code path),
  landing on `BlueprintReview` with the canned intake + blueprint
- `blueprint-generating-story` — same path, plus `isGenerating` and
  `activeAgentId: 'versa'`, showing the "VERSA is writing…" icon/label swap

**Seed Library** — the account-only Seed Library panel (`LOCAL_ONLY_MODE = false`)

- `library-empty` — signed in, no saved seeds, library opened via the menu
- `library-populated` — signed in, 2 mock saved seeds ("Ashes of the Ninth
  Meridian", "The Grimoire That Talks Back")

**Sign In** — the auth gate

- `auth-gated` — `currentUser: null` + `LOCAL_ONLY_MODE = false`, showing
  the redesigned `StoryAuthGate` screen ("Your Destiny Awaits"). Clicking
  any provider mock-signs-in and plays the post-auth dissolve into the
  workspace.

## Reusable Workshop dependencies

- `FeatureWorkspace` + one `manifest.ts` entry (`story-seed`, category `other`
  — no existing `WorkshopCategory` fits an intake/creation flow better; the
  union was not extended since `other` already covers `chapter-generation-flow`)
- `lucide-react`, `motion/react` (already installed; every icon Phase 2 uses —
  `Tag`, `Feather`, `Drama`, `PenLine`, `SlidersHorizontal`, `Landmark`,
  `Users`, `Shield`, `Sparkles`, `Zap`, `Hourglass`, `Ellipsis`, `BookOpen`,
  `Globe`, `Check`, `ChevronRight`, `Eye`, `X`, `List`, `Bookmark`, `Copy`,
  `Database`, `Download`, `RefreshCw`, `Search`, `Wand2`, `ShieldAlert` —
  was verified against this repo's `lucide-react@^1.27.0` export surface)

## Production dependencies intentionally excluded

- Firebase (`lib/firebase`, `firebase/auth`) → `shared/stubs.ts`
  (`LOCAL_ONLY_MODE`, `mockLogin`)
- Postgres / `lib/persistence` via `lib/storySeedStorage` → in-memory mock
  in `shared/stubs.ts` + local-storage `shared/storySeedRepository.ts`
- `hooks/storyEngineHelpers.getApiHeaders` (`secureStorage` API-key reads) →
  inert stub
- `/api/suggest-tags` network call → `suggestTagsStub`
- `lib/agents` full `AGENTS` catalog → only the `VERSA` profile object
- Real AI blueprint generation / story creation pipelines
  (`onGenerateBlueprint`, `onStartStory`) → console-logging mocks in
  `StorySeedWorkspace.tsx`
- Test files (`CustomCharactersForm.test.tsx`, `CustomFactionsForm.test.tsx`,
  `storySeedFormat.test.ts`) were **not** copied — the schema contract tests
  added in Phase 1 (`shared/storySeedSchema.test.ts`) run with
  `npm run test:story-seed`; the production intake-form tests have no runner
  here and would be dead weight.

## Known visual/behavioral differences from the source

- **`development/` is a completely different intake UI from production** —
  that is the point of Phase 2. `reference/` (and production) still render
  the numbered accordion; Compare mode shows old vs new side by side.
- **Genre is a required explicit input again** — the Phase 1 extraction of
  the Genre Path selector into the separate [Story Settings](../story-settings/README.md)
  Workshop feature left `genrePath` unwired; the Phase 2 Genre workspace binds
  it directly (preset grid + custom input) because Genre is one of the four
  required Story inputs. The Story Settings feature remains separate and
  unchanged; coordinate any transfer so the two do not both own genre.
- **Style is an explicit required input** — pre-filled with the Library
  default (`DEFAULT_STORY_STYLE`) and editable; previously `story.style` was
  only inferred from the blueprint or atmosphere at the boundary. The adapter
  precedence is now `proseStyle → blueprint.styleBible → generalAtmosphere →
  DEFAULT_STORY_STYLE`.
- **Defaults are intentionally emptier** — fresh seeds start with empty
  Premise, Genre, MC name, and tags (previously a random MC name, `Fate
  Survival`, and premise suggestion #1 were pre-filled) so the required-input
  tracking reflects reality. Style keeps its Library default.
- **Save Draft is a new explicit action** — no production equivalent exists
  today (persistence only happened implicitly on generate/export). It
  requires the four required Story inputs (a draft is a valid minimal seed)
  and, in the Workshop, saves locally under `local-workshop-creator` when
  signed out.
- **Drawer and summary sheet render at `z-[250]`** — above the Workshop
  preview controls that float at `z-[200]` (a modal cannot sit under them).
  Production has no Workshop controls, so the value is unconstrained there;
  keep `z-[250]` or drop to the app's modal layer on transfer.
- **`StoryAuthGate` is scoped to the preview canvas, not the viewport** — its
  root is `absolute inset-0` so the takeover fills FeatureWorkspace's
  positioned pane; production should use `fixed inset-0` (transfer note above).
- **All three auth providers are mock sign-ins** — Google, Apple, and Email
  (including the inline email/password form) resolve through `mockLogin()`
  after a 650ms simulated delay; no provider choice is recorded and the
  email address is discarded. The Firebase-code error mapping in the gate
  never fires here because the mock cannot fail.
- **Backdrop media is live public R2 URLs** (video + poster + emblem) —
  kept for visual fidelity; same precedent as reader-chamber's R2 backdrop
  URLs and the VERSA logo. The poster is a still, not the video's first
  frame; the crossfade layer handles the difference.
- **Tag suggestions are canned, not model-generated** — `suggestTagsStub`
  returns a fixed, genre-aware tag list instead of a real AI response; the
  `reasoning` text explicitly says "Workshop mock recommendation… No live
  model call was made."
- **`routingConfig.storyMaker`** is read from the mock store in
  `StoryTagsWorkspace.tsx` exactly as production does, but is never actually
  sent anywhere (no `fetch` call exists to send it to).
- **VERSA logo is a live public URL** (`images.seihouse.org`) — kept for
  visual fidelity; same precedent as reader-chamber's R2 backdrop URLs.
- **Shared mock store/seed library is a module singleton** — in Compare
  mode, the account sign-in state and the saved-seed library are identical
  in both panes at all times (intended: same data on both sides). The
  intake form itself, however, is genuine **separate component state** per
  pane (`reference`/`development` are two independent `CreationModal`
  mounts), so the `filled-intake` scenario drives each pane through its own
  DOM script.
- **`filled-intake` fills a representative sample, not every field** — it
  demonstrates one field or two per section plus one custom character and
  one custom faction; it does not attempt to fill all ~40 `IntakeData`
  fields, since the goal is a visually trustworthy "filled" state, not an
  exhaustive data-entry replay.
- **No focus trap / real file-share sheet differences** — `ImportPanel`'s
  native `<input type="file">` and `downloadStorySeed`'s mobile share-sheet
  path (`navigator.share`) run unmodified; behavior on a desktop Workshop
  browser matches production exactly, since neither depends on excluded
  infrastructure.

## Exact files needed for transfer (verified)

When the Phase 2 redesign is approved, transfer these to Light-Novels,
reversing the import rewrites (`../shared/X` → `../../lib/X` /
`../../store/X` / `../../hooks/X` / `../../types` as appropriate, `./X`
unchanged). The Phase 1 production form files under
`src/features/creation/components/` (`CoreSeedForm.tsx`,
`WorldSettingForm.tsx`, `CharacterSetupForm.tsx`, `CustomCharactersForm.tsx`,
`CustomFactionsForm.tsx`, `PowerSystemForm.tsx`, `PlotControlForm.tsx`,
`MakeItWorkForm.tsx`, `FormSection.tsx`) are **replaced** by the workspace
tree below and should be removed in the same transfer, with one caution
(`CoreSeedForm.tsx` — see Transfer notes):

- `development/CreationModal.tsx` → `src/components/CreationModal.tsx`
- `development/seedSections.ts` → `src/features/creation/seedSections.ts`
- `development/StorySeedSelector.tsx` → `src/features/creation/components/StorySeedSelector.tsx`
- `development/StorySeedSummary.tsx` → `src/features/creation/components/StorySeedSummary.tsx`
- `development/workspaces/*` → `src/features/creation/components/workspaces/*`
- `development/StoryAuthGate.tsx` → `src/components/StoryAuthGate.tsx`
  (swap the `../shared/stubs` import for `firebase/auth` + `lib/firebase`,
  replace each `mockLogin()` call with the real provider action — Google
  `signInWithPopup(auth, new GoogleAuthProvider())`, Apple
  `signInWithPopup(auth, new OAuthProvider('apple.com'))`, email/password
  `signInWithEmailAndPassword` / `createUserWithEmailAndPassword` — drop the
  simulated delay, and change the root `absolute inset-0` to `fixed inset-0`;
  `useAppStore` swaps back to `store/useAppStore`)
- `development/BlueprintReview.tsx` → `src/features/creation/components/BlueprintReview.tsx`
- `development/ImportPanel.tsx` → `src/features/creation/components/ImportPanel.tsx`
- `development/SeedLibraryPanel.tsx` → `src/features/creation/components/SeedLibraryPanel.tsx`
- `development/constants.ts` → `src/features/creation/constants.ts`
  (adds `STYLE_SUGGESTIONS`; still exports `GENRE_PRESETS`, used by
  `reference/CoreSeedForm.tsx` — keep it until production's Core Seed form
  is removed in this transfer)
- `development/form-fields/*` → `src/features/creation/components/form-fields/*`
- `shared/storySeedSchema.ts` creator/style/universe/mysteries corrections →
  production's Phase 1 schema module (the `IntakeData` view-model fields
  `creatorPenName`, `proseStyle`, `universeOverview`, `majorMysteries` belong
  to production `src/types.ts`)

Workshop-only — never transfer: `shared/stubs.ts`, `shared/id.ts` and
`shared/storySeedFormat.ts` and `shared/dialect.ts` and
`shared/codexContext.ts` (production `src/lib/*` versions are authoritative
— these were copied *into* the Workshop, never *out of* it), everything
under `src/workshop/previews/story-seed/`, the manifest entry, and the
registry line.

## Transfer notes and cautions

- On transfer, `StoryTagsWorkspace.tsx` must have its `handleSuggestTags`
  restored to call the real `fetch('/api/suggest-tags', …)` with
  `getApiHeaders()` from `hooks/storyEngineHelpers` — do not carry
  `suggestTagsStub` back.
- Gate Save Draft on real auth on transfer (mirror `persistSeed`): in
  `LOCAL_ONLY_MODE` hide or disable it; the Workshop's
  `local-workshop-creator` namespace exists only because the Workshop
  repository is local-storage backed.
- `CreationModal.tsx` no longer has a `handleLogin` — sign-in lives in
  `StoryAuthGate.tsx`. On transfer, wire the gate's provider actions to real
  Firebase Auth as described above — do not carry `mockLogin` or the
  simulated provider delay back.
- The `useEffect` account-change guards (`auth.currentUser?.uid ===
  expectedUid`) were rewritten to `useAppStore.getState().currentUser?.uid
  === expectedUid` against the mock store; restore the `auth.currentUser`
  reads on transfer.
- `updateIntake` accepts updater functions (`updateIntake('storyTags', prev =>
  …)`) — keep that signature; the tag and ghost-tag handlers rely on it to
  avoid lost writes on rapid successive edits.
- The old `CoreSeedForm.tsx` carries one production-only behavior with no
  Phase 2 home: the Genre Path selector lives in the Genre workspace now, but
  `FateSurvivalExplanation` (the Fate Survival genre explainer) was extracted
  to the separate [Story Settings](../story-settings/README.md) Workshop
  feature, which has **not** been approved yet. Do not delete production's
  `CoreSeedForm.tsx` block until that feature's fate is decided.
- `shared/dialect.ts`, `shared/codexContext.ts`, `shared/id.ts`, and
  `shared/storySeedFormat.ts` are portable/pure and match production's
  `src/lib/*` files closely enough that no changes should be needed beyond
  reversing the import paths back to `../lib/X`; diff before transfer in
  case production has moved on since `2026-08-01`.
- `shared/types.ts` is a manually-maintained mirror of `src/types.ts` lines
  ~1026–1143 plus Phase 2 view-model additions. If production's
  `IntakeData`/`WorldBlueprint`/`StorySeed` shapes changed since the last
  comparison date above, re-verify before trusting any Workshop-only type in
  a transfer.

## Lifecycle

1. **Import** — copy production's current implementation into `reference/`.
2. **Fork once** — `development/` starts as a copy of `reference/`.
3. **Refine** — every Workshop task modifies `development/` only.
4. **Approve** — once approved, transfer `development/` back to Light-Novels.
5. **Resynchronize** — refresh `reference/` from the newly integrated
   production code, record the new comparison date, and reset
   `development/` for the next redesign cycle.
