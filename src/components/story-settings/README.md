# Story Settings

- **Source repository:** SENSEIDUKES/Light-Novels
- **Source location:** `src/components/CreationModal.tsx` → `src/features/creation/components/CoreSeedForm.tsx` (the Genre Path selector block, verified on `main`)
- **Workshop preview:** `?preview=story-settings`
- **Replica created:** 2026-08-01
- **Last Workshop update:** 2026-08-01
- **Last source comparison:** 2026-08-01
- **Replica status:** under refinement

## Workshop history

- **2026-08-01:** Created as a new, standalone Workshop feature by extracting
  the Genre Path selector and `FateSurvivalExplanation` out of the
  [Story Seed](../story-seed/README.md) intake flow, where they previously
  lived inside `CoreSeedForm`'s "1. Core Seed" section. Story Settings is a
  distinct mechanic — "how a story behaves and unfolds" — separate from
  Story Seed's "what the user wants the story to be", so it gets its own
  Workshop card and Development tab rather than a section nested inside
  Story Seed. Only Fate Survival has been migrated so far; other production
  settings (accessibility, output language) have not yet been brought into
  this feature.

## What this feature is

Story Settings is a reusable set of user choices that determines how a
specific story is generated and experienced from a Story Seed — Genre Path
(including Fate Survival), and eventually accessibility and output-language
preferences. Settings personalize the experience without changing the Seed
itself. Today this Workshop replica only contains the Genre Path / Fate
Survival piece; it has not yet absorbed every production setting.

## Folder layout

```text
reference/                    — untouched replica of the Genre Path block as
                                 it currently renders inside production's
                                 CoreSeedForm, locked
  StorySettingsPanel.tsx        — Genre Path selector + conditional Fate
                                   Survival explanation, using local
                                   `genrePath` state (default `'Fate
                                   Survival'`) since it is no longer wired to
                                   CreationModal's `intake` state here
  FateSurvivalExplanation.tsx   — story-settings' own copy (both story-seed
                                   and reader-chamber keep their own separate
                                   forks of this production file too)
  constants.ts                  — GENRE_PRESETS
development/                  — active Workshop version; started as an exact
                                 copy of reference/ (byte-identical at
                                 creation). Future settings (accessibility,
                                 output language) will be added here as they
                                 are migrated from production.
```

## What was copied

The Genre Path selector markup and interaction logic from
`src/features/creation/components/CoreSeedForm.tsx`, and
`src/components/FateSurvivalExplanation.tsx`, both in Light-Novels. All
markup, class names, copy, and interaction logic are byte-identical to what
currently renders in production, except that `intake.genrePath` /
`updateIntake('genrePath', …)` were replaced with local `useState` — this
panel is not connected to any `IntakeData` object here (see "Known
differences" below).

## What was mocked

Nothing beyond the state substitution above. `FateSurvivalExplanation` has no
network calls or production dependencies to mock — its interactive fate-type
grid is pure local UI state, unchanged from production.

## Available preview states

There is currently one scene: the Genre Path selector with all presets,
defaulting to `Fate Survival` (matching `CreationModal`'s
`createDefaultIntake` default in production), which reveals
`FateSurvivalExplanation` when selected. No Workshop preview-state simulator
was needed yet since there is only one meaningful configuration; add one via
`FeatureWorkspace`'s `controls` prop if future settings need scripted states.

## Reusable Workshop dependencies

- `FeatureWorkspace` + one `manifest.ts` entry (`story-settings`, category
  `other`, matching `story-seed`)
- `lucide-react` (`Cloud`, `Zap`, plus everything `FateSurvivalExplanation`
  uses — `Shield`, `Sparkles`, `AlertTriangle`, `Eye`, `HelpCircle`, `Heart`,
  `Flame`, `ShieldAlert`, `Award`, `RefreshCw`, `Star`, `Skull`),
  `motion/react` — already installed, same versions story-seed uses

## Production dependencies intentionally excluded

None — this piece of the source was already free of Firebase, persistence,
and network calls.

## Known visual/behavioral differences from the source

- **Not wired to a Story Seed's `IntakeData` here** — production's Genre Path
  selector reads/writes `intake.genrePath` on the enclosing `CreationModal`.
  This Workshop replica manages `genrePath` as local component state instead,
  since Story Settings does not yet have its own settings data model or a
  connection back to a Seed. The visual and interaction fidelity is exact;
  the data plumbing to a real Seed is intentionally not modeled yet.
- **Only Fate Survival has been migrated** — production likely has other
  "how the story behaves" settings (accessibility, output language) that
  have not been brought into this Workshop feature. Treat this replica as
  the first of several settings to arrive here, not a complete Story
  Settings surface.
- **No dedicated production `StorySettingsPanel`/`StorySettings` component
  exists yet** — this Workshop feature is a new aggregation point, not a
  1:1 replica of a single production file. `source.path` above points at
  `CreationModal.tsx` because that is where the Genre Path markup currently
  lives in production.

## Exact files needed for transfer (verified)

There is no approved production destination for this feature yet — Story
Settings is a Workshop-side proposal to extract Genre Path (and eventually
other settings) out of `CreationModal.tsx` into its own concept. Before
transferring:

1. Decide in Light-Novels where "Story Settings" should live (a new
   component, a new route, or a panel within an existing settings surface)
   and whether it gets its own data model or stays part of `IntakeData`.
2. Reconnect `development/StorySettingsPanel.tsx`'s local `genrePath` state
   to whatever that decision produces.
3. Remove the Genre Path block from `CoreSeedForm.tsx` in production to
   match [Story Seed](../story-seed/README.md)'s `development/CoreSeedForm.tsx`,
   which no longer renders it.

## Transfer notes and cautions

- `development/FateSurvivalExplanation.tsx` mirrors
  `src/components/FateSurvivalExplanation.tsx` in Light-Novels exactly — diff
  before transfer in case production has changed since `2026-08-01`.
- `development/constants.ts`'s `GENRE_PRESETS` must stay in sync with the
  copy still in `story-seed`'s `constants.ts` (kept there, unused, so that
  `reference/CoreSeedForm.tsx` — an untouched replica of current production —
  keeps compiling) until Story Seed's `CoreSeedForm.tsx` is also updated in
  production and that copy can be deleted.

## Lifecycle

1. **Import** — copy production's current Genre Path markup into `reference/`.
2. **Fork once** — `development/` starts as a copy of `reference/`.
3. **Refine** — every Workshop task modifies `development/` only; future
   settings (accessibility, output language) get added here.
4. **Approve** — once approved, transfer `development/` back to Light-Novels
   per the notes above.
5. **Resynchronize** — refresh `reference/` from the newly integrated
   production code, record the new comparison date, and reset
   `development/` for the next refinement cycle.
