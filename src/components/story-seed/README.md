# Story Seed Intake

- **Source repository:** SENSEIDUKES/Light-Novels
- **Source location:** `src/components/CreationModal.tsx` (default export `CreationModal`, verified on `main`)
- **Workshop preview:** `?preview=story-seed`
- **Replica created:** 2026-08-01
- **Last Workshop update:** 2026-08-01
- **Last source comparison:** 2026-08-01
- **Replica status:** faithful replica

## Workshop history

- **2026-08-01:** Created faithful Workshop replica and local state simulator (9
  preview states across Intake / Blueprint / Library / Auth categories, in-memory
  seed storage, DOM-driven scenario scripting that fills the real form and clicks
  the real buttons rather than reaching into component internals).

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
development/                  — active Workshop version; started as an exact
                                 copy of reference/ (byte-identical at creation)
shared/                        — code genuinely identical between the two forks
  types.ts                     — IntakeCharacter, IntakeFaction, IntakeData,
                                  WorldBlueprint, StorySeedPayload, StorySeed,
                                  NamedCodexEntry (narrow local subset)
  storySeedFormat.ts            — verbatim: normalizeStorySeedPayload,
                                  downloadStorySeed, downloadStorySeedCollection,
                                  parseStorySeedJson, and their normalization
                                  helpers (pure, browser-only file download/parse)
  id.ts                         — verbatim: generateUUID, generateId (pure)
  dialect.ts                    — verbatim dictionary/logic: getDialectLabel,
                                  resolveDialect, DIALECT_DICTIONARY, useDialect
                                  (only the import of `useAppStore` was rewritten
                                  to point at ./stubs; PlotControlForm only calls
                                  getDialectLabel — useDialect is unused here but
                                  kept for parity with production's export surface)
  codexContext.ts               — normalizeCodexAliases, parseCodexAliases,
                                  normalizeCodexSurface, findCodexAliasCollisions
                                  (only the alias-normalization subset used by
                                  CustomCharactersForm/CustomFactionsForm; the
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
```

Both forks render inside
`src/workshop/previews/story-seed/StorySeedWorkspace.tsx`, which shares one mock
account/seed-library state and one categorized preview-control panel
(Intake / Blueprint / Library / Auth) between them via `FeatureWorkspace`.

## What was copied

The full Story Seed Intake presentation tree from `src/components/` and
`src/features/creation/` in Light-Novels: `CreationModal.tsx` (default export),
every file under `src/features/creation/components/` (`BlueprintReview.tsx`,
`CharacterSetupForm.tsx`, `CoreSeedForm.tsx`, `CustomCharactersForm.tsx`,
`CustomFactionsForm.tsx`, `FormSection.tsx`, `ImportPanel.tsx`,
`MakeItWorkForm.tsx`, `PlotControlForm.tsx`, `PowerSystemForm.tsx`,
`SeedLibraryPanel.tsx`, `WorldSettingForm.tsx`, `form-fields/FormInput.tsx`,
`form-fields/FormTextarea.tsx`, `form-fields/index.ts`),
`src/features/creation/constants.ts`, and `src/components/FateSurvivalExplanation.tsx`
(rendered inside `CoreSeedForm` for the Fate Survival genre). All markup, class
names, copy, and interaction logic are byte-identical except for import-path
rewrites and the two documented mocks below.

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
  state here (`auth-gated`), not permanently excluded. `handleLogin` calls a
  `mockLogin()` stub that flips the mock `currentUser` instead of opening a
  real Google OAuth popup.
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
- **`fetch('/api/suggest-tags', …)` inside `CoreSeedForm.tsx`** — this is
  the one line of business logic that could not stay byte-identical: the
  real `fetch` call was replaced with `suggestTagsStub(...)` from
  `shared/stubs.ts`, which resolves a canned, genre-aware `{ suggestedTags,
  reasoning }` object after a short simulated delay. No network call is ever
  made; the "Suggest Tags" button, its loading state, error banner, and
  "+ Add All Suggestions" flow are otherwise fully functional and
  interactive. Everything around the call (state, UI, error handling) is
  unchanged.
- **`onGenerateBlueprint` / `onStartStory` props** — mocked in
  `StorySeedWorkspace.tsx`: `onGenerateBlueprint` logs to console and
  resolves the canned `WorldBlueprint` from `previewData.ts` after a short
  delay; `onStartStory` logs its arguments. Neither triggers a real AI
  pipeline.

## Available preview states

The Workshop preview-control menu is split into four categories, selected
with a compact `Intake | Blueprint | Library | Auth` row. Category
membership lives on each scenario in
`src/workshop/previews/story-seed/previewStates.ts` (`category` field).
`CreationModal` owns `intake`, `stage`, and `showImportPanel` as internal
component state with no override props, so every scenario that needs
filled data or a different stage drives the **real rendered controls** —
typing into the actual inputs and clicking the actual buttons — the same
approach reader-chamber's `clickInChamber` uses, never a shortcut into
React internals.

**Intake** — the intake form (`stage === 'intake'`)

- `empty-intake` — default mount, nothing filled
- `filled-intake` — scripts a representative fill across every FormSection:
  types into Core Seed (title, MC name, premise, 2 preset tags), opens and
  fills World Setting, Main Character Setup, Power System, and Plot & Trope
  Control, adds one Custom Character and one Custom Faction via their real
  "+ Add" buttons, then reopens the Core Seed section
- `generating-blueprint` — `isGenerating` prop `true`, showing the "Forge
  World Blueprint" submit button's spinner state
- `import-panel-open` — clicks the real "Import World Seed / Blueprint"
  button to open `ImportPanel`

**Blueprint** — the blueprint review stage (`stage === 'blueprint'`)

- `blueprint-review` — signs in a mock account, populates the seed library,
  then clicks the real "Use Seed" button on the first saved seed
  (`handleUseSeed`'s genuine production code path — the only way to reach
  the blueprint stage without props), landing on `BlueprintReview` with the
  canned intake + blueprint
- `blueprint-generating-story` — same path, plus `isGenerating` and
  `activeAgentId: 'versa'`, showing the "VERSA is writing…" icon/label swap

**Library** — the account-only Seed Library panel (`LOCAL_ONLY_MODE = false`)

- `library-empty` — signed in, no saved seeds
- `library-populated` — signed in, 2 mock saved seeds ("Ashes of the Ninth
  Meridian", "The Grimoire That Talks Back")

**Auth** — the auth gate

- `auth-gated` — `currentUser: null` + `LOCAL_ONLY_MODE = false`, showing
  the real "Sync Spirit (Sign In)" screen

## Reusable Workshop dependencies

- `FeatureWorkspace` + one `manifest.ts` entry (`story-seed`, category `other`
  — no existing `WorkshopCategory` fits an intake/creation flow better; the
  union was not extended since `other` already covers `chapter-generation-flow`)
- `lucide-react`, `motion/react` (already installed; every icon this feature
  uses — `Copy`, `Cloud`, `ArrowRight`, `MapPin`, `Layers`, `Zap`, `Users`,
  `Target`, `Wand2`, `FileText`, `HelpCircle`, `GitBranch`, `Check`,
  `Download`, `BookOpen`, `Sparkles`, `Shield`, `ShieldAlert`, `Database`,
  `Play`, `Upload`, `ChevronDown`, `ChevronUp` — exists in this repo's
  `lucide-react@^1.27.0`, unlike reader-chamber no icon aliasing was needed)

## Production dependencies intentionally excluded

- Firebase (`lib/firebase`, `firebase/auth`) → `shared/stubs.ts`
  (`LOCAL_ONLY_MODE`, `mockLogin`)
- Postgres / `lib/persistence` via `lib/storySeedStorage` → in-memory mock
  in `shared/stubs.ts`
- `hooks/storyEngineHelpers.getApiHeaders` (`secureStorage` API-key reads) →
  inert stub
- `/api/suggest-tags` network call → `suggestTagsStub`
- `lib/agents` full `AGENTS` catalog → only the `VERSA` profile object
- Real AI blueprint generation / story creation pipelines
  (`onGenerateBlueprint`, `onStartStory`) → console-logging mocks in
  `StorySeedWorkspace.tsx`
- Test files (`CustomCharactersForm.test.tsx`, `CustomFactionsForm.test.tsx`,
  `storySeedFormat.test.ts`) were **not** copied — this Workshop repository
  has no `vitest`/testing-library setup (`package.json` has no `test`
  script and no `@testing-library/*` dependency), so a copied `.test.tsx`
  would not run and would just be dead weight. The three source test files
  remain useful references for future manual verification of the alias
  normalization and story-seed-format logic.

## Known visual/behavioral differences from the source

- **Tag suggestions are canned, not model-generated** — `suggestTagsStub`
  returns a fixed, genre-aware tag list instead of a real AI response; the
  `reasoning` text explicitly says "Workshop mock recommendation… No live
  model call was made."
- **`routingConfig.storyMaker`** is read from the mock store in
  `CoreSeedForm.tsx` exactly as production does, but is never actually sent
  anywhere (no `fetch` call exists to send it to).
- **VERSA logo is a live public URL** (`images.seihouse.org`) — kept for
  visual fidelity; same precedent as reader-chamber's R2 backdrop URLs.
- **Shared mock store/seed library is a module singleton** — in Compare
  mode, the account sign-in state and the saved-seed library are identical
  in both panes at all times (intended: same data on both sides). The
  intake form itself, however, is genuine **separate component state** per
  pane (`reference`/`development` are two independent `CreationModal`
  mounts) — the `filled-intake` scenario's DOM script deliberately targets
  every mounted `#creation-portal-root` so both panes fill identically even
  though their underlying React state is not shared.
- **`filled-intake` fills a representative sample, not every field** — it
  demonstrates one field or two per section plus one custom character and
  one custom faction; it does not attempt to fill all ~35 `IntakeData`
  fields, since the goal is a visually trustworthy "filled" state, not an
  exhaustive data-entry replay.
- **No focus trap / real file-share sheet differences** — `ImportPanel`'s
  native `<input type="file">` and `downloadStorySeed`'s mobile share-sheet
  path (`navigator.share`) run unmodified; behavior on a desktop Workshop
  browser matches production exactly, since neither depends on excluded
  infrastructure.

## Exact files needed for transfer (verified)

When a `development/` change is approved, transfer these to Light-Novels,
reversing the import rewrites (`../shared/X` → `../../lib/X` /
`../../store/X` / `../../hooks/X` / `../../types` as appropriate, `./X`
unchanged):

- `development/CreationModal.tsx` → `src/components/CreationModal.tsx`
- `development/BlueprintReview.tsx` → `src/features/creation/components/BlueprintReview.tsx`
- `development/CharacterSetupForm.tsx` → `src/features/creation/components/CharacterSetupForm.tsx`
- `development/CoreSeedForm.tsx` → `src/features/creation/components/CoreSeedForm.tsx`
  (restore the real `fetch('/api/suggest-tags', …)` call using
  `getApiHeaders` from `hooks/storyEngineHelpers` — see "What was mocked")
- `development/CustomCharactersForm.tsx` → `src/features/creation/components/CustomCharactersForm.tsx`
- `development/CustomFactionsForm.tsx` → `src/features/creation/components/CustomFactionsForm.tsx`
- `development/FormSection.tsx` → `src/features/creation/components/FormSection.tsx`
- `development/ImportPanel.tsx` → `src/features/creation/components/ImportPanel.tsx`
- `development/MakeItWorkForm.tsx` → `src/features/creation/components/MakeItWorkForm.tsx`
- `development/PlotControlForm.tsx` → `src/features/creation/components/PlotControlForm.tsx`
- `development/PowerSystemForm.tsx` → `src/features/creation/components/PowerSystemForm.tsx`
- `development/SeedLibraryPanel.tsx` → `src/features/creation/components/SeedLibraryPanel.tsx`
- `development/WorldSettingForm.tsx` → `src/features/creation/components/WorldSettingForm.tsx`
- `development/FateSurvivalExplanation.tsx` → `src/components/FateSurvivalExplanation.tsx`
  (compare against production first — this is story-seed's own fork, not
  reader-chamber's)
- `development/constants.ts` → `src/features/creation/constants.ts`
- `development/form-fields/*` → `src/features/creation/components/form-fields/*`

Workshop-only — never transfer: `shared/stubs.ts`, `shared/types.ts`
(production `src/types.ts` is authoritative), `shared/id.ts` and
`shared/storySeedFormat.ts` and `shared/dialect.ts` and
`shared/codexContext.ts` (production `src/lib/*` versions are authoritative
— these were copied *into* the Workshop, never *out of* it), everything
under `src/workshop/previews/story-seed/`, the manifest entry, and the
registry line.

## Transfer notes and cautions

- On transfer, `CoreSeedForm.tsx` must have its `handleSuggestTags` restored
  to call the real `fetch('/api/suggest-tags', …)` with `getApiHeaders()`
  from `hooks/storyEngineHelpers` — do not carry `suggestTagsStub` back.
- `CreationModal.tsx`'s `handleLogin` must be restored to call
  `signInWithPopup(auth, new GoogleAuthProvider())` — do not carry
  `mockLogin` back.
- The `useEffect` account-change guards (`auth.currentUser?.uid ===
  expectedUid`) were rewritten to `useAppStore.getState().currentUser?.uid
  === expectedUid` against the mock store; restore the `auth.currentUser`
  reads on transfer.
- `shared/dialect.ts`, `shared/codexContext.ts`, `shared/id.ts`, and
  `shared/storySeedFormat.ts` are portable/pure and match production's
  `src/lib/*` files closely enough that no changes should be needed beyond
  reversing the import paths back to `../lib/X`; diff before transfer in
  case production has moved on since `2026-08-01`.
- `shared/types.ts` is a manually-maintained mirror of `src/types.ts` lines
  ~1026–1143. If production's `IntakeData`/`WorldBlueprint`/`StorySeed`
  shapes changed since the last comparison date above, re-verify before
  trusting any Workshop-only type in a transfer.

## Lifecycle

1. **Import** — copy production's current implementation into `reference/`.
2. **Fork once** — `development/` starts as a copy of `reference/`.
3. **Refine** — every Workshop task modifies `development/` only.
4. **Approve** — once approved, transfer `development/` back to Light-Novels.
5. **Resynchronize** — refresh `reference/` from the newly integrated
   production code, record the new comparison date, and reset
   `development/` for the next redesign cycle.
