# Story Seed

- **Source repository:** `SENSEIDUKES/Light-Novels`
- **Source location:** `src/components/CreationModal.tsx` (default export `CreationModal`)
- **Workshop preview:** `?preview=story-seed` (`&state=<scenario-id>` deep-links a state)
- **Replica created:** 2026-08-01
- **Last Workshop update:** 2026-08-07
- **Last source comparison:** 2026-08-06
- **Lifecycle status:** finalized Workshop feature; foundation refactored and ready for the dedicated optimization pass

The source path still exists in the adjacent local Light-Novels checkout. It
was not compared again during the 2026-08-07 refactor, so `lastCompared`
remains 2026-08-06.

## Finalized product contract

Story Seed is one creation flow with these visible destinations:

- **Origin** owns Story Title, Style, Core Premise / Secret Catalyst, Genre,
  and Story Tags.
- **ARC** owns story-sauce controls, story direction, long-term goal, first
  major conflict, main opposition, Destined Ending, and Make It Work.
- **World** owns World Identity, Characters, Factions, Abilities, and Power
  System.
- **Story Seed Settings** owns mature-audience metadata and Fate Survival.
- **Help** owns searchable written guidance and translated audio playback.
- **Story Bank** is the only home for saved seeds, import/export, Blueprint
  access, seed reuse, and novel manifestation actions.
- **World Blueprint** is an editable sibling artifact. It is not nested inside
  the portable Creator / Story / World seed.

The canonical Story Seed shape is `creator / story / world`. Story Title has
one owner at `world.optional.worldIdentity.title`; Blueprint title editing
updates that same value. The Blueprint keeps creator-authored Origin
provenance separate from generated story direction.

## Current ownership

```text
development/
  CreationModal.tsx               flow controller and generation boundaries
  StorySeedHeader.tsx             desktop identity and utility actions
  StorySeedMobileNavigation.tsx   mobile drawer, navigation, and sheets
  StorySeedSettings.tsx           one Settings body for desktop and mobile
  StorySeedSelector.tsx           Story / World navigation model adapter
  StoryBank.tsx                   saved-seed states and actions
  useStoryBankRecords.ts          list, loading, error, cancellation, retry
  StorySeedHelpMenu.tsx           Help modal and audio lifecycle
  BlueprintReview.tsx             editable Blueprint dossier coordinator
  blueprint/                      dossier primitives, collections, copy format
  workspaces/                     Origin, ARC, and World editors
  workspaces/origin/              Style, Genre, and premise/tag responsibilities
  seedSections.ts                 visible navigation plus required-input gate
  seedState.ts                    immutable updates over canonical seed state
  constants.ts                    finalized catalog and premise data
  story-seed.css                  feature-scoped presentation

shared/
  storySeedSchema.ts              canonical contract and generation payloads
  storySeedRepository.ts          persistence port
  workshopStorySeedStorage.ts     Workshop-only localStorage adapter
  storySeedSerialization.ts       portable import/export
  legacySeedImport.ts             isolated compatibility adapter for old files
  storyAdministrativeMetadata.ts  separate minimal story metadata
  storyStyle.ts                   canonical Style values
  storyTagInference.ts            deterministic empty-tag inference
  types.ts                        Blueprint and shared domain types
  stubs.ts                        Workshop-only app/store boundary

reference/
  locked production comparison replica; do not refine in place
```

`reference/SeedLibraryPanel.tsx` and the old flat intake vocabulary remain
only inside the locked reference replica. They are comparison evidence, not
active development code. `legacySeedImport.ts` is also intentional: it is the
single compatibility boundary that lets previously exported seed files open
without leaking old field names into current state or UI.

Shared Library primitives live in `src/components/library/`. Story Seed uses
those components directly instead of maintaining local button, panel,
navigation, header, or field variants.

## Workshop and production boundaries

The Workshop provides local simulations for authentication, story records,
generation callbacks, and seed persistence. It does not provide or modify a
database, production authentication, chapter generation, or production
media/persistence infrastructure.

- `shared/stubs.ts` supplies the local app-store boundary.
- `shared/workshopStorySeedStorage.ts` is the only localStorage adapter.
- `storySeedRepository.ts` is the swappable persistence port.
- Preview fixtures are under `src/workshop/previews/story-seed/`.
- Help audio requests the finalized Library Lines endpoint; written guidance
  remains available when a topic intentionally has no audio.
- Mock generation returns a deterministic Blueprint and never starts chapter
  generation.

The persistence key `seihouse-workshop-story-seeds-v3` is retained so existing
Workshop drafts are not orphaned by this refactor.

## Preview states

Creation workspace:

- `empty-intake`
- `filled-intake`
- `generating-blueprint`
- `blueprint-generation-error`

World Blueprint:

- `blueprint-review`
- `blueprint-generating-story`

Story Bank:

- `story-bank-empty`
- `story-bank-populated`
- `story-bank-loading`
- `story-bank-load-error`
- `story-bank-import-open`

Authentication:

- `auth-gated`

Scenario scripts interact with rendered controls and DOM IDs. They do not
reach into React internals or bypass form state.

## Transfer notes

When this finalized feature is approved for production transfer:

1. Copy the required files from `development/`, including the `blueprint/`,
   `workspaces/`, and `workspaces/origin/` folders plus `story-seed.css`.
2. Reuse the supporting Library primitives already owned by
   `src/components/library/`.
3. Transfer only the shared domain modules needed by the production owner.
4. Replace `shared/stubs.ts` and `workshopStorySeedStorage.ts` with the real
   app store, auth, repository, and generation integrations.
5. Keep Workshop navigation, preview controls, fixtures, and scenario
   adapters behind.
6. After production integration, refresh `reference/`, update
   `source.lastCompared`, and begin the next Workshop cycle from the newly
   synchronized source.

## Validation

From the repository root:

```bash
npm run test:story-seed
npx tsc -b --pretty false
npm run build
```

There is no repository lint script. A strict unused-symbol TypeScript audit is
run separately for Story Seed scope; known unrelated warnings elsewhere in
the Workshop are not part of this feature.

Browser verification covers phone and desktop layouts plus Origin, ARC,
World, Settings persistence, Help audio, navigation, auth, Story Bank actions,
Blueprint editing, generation loading/error, and Story Bank loading, empty,
error, and populated states.

## Concise Workshop history

- **2026-08-07:** Refactored the finalized feature without changing its UI or
  generation contract. Removed the obsolete separate Story Settings preview,
  six superseded standalone seed workspaces, stale versioned preview records,
  dead constants/imports, and hidden legacy navigation records. Consolidated
  Settings, Story Bank loading ownership, desktop/mobile shell ownership,
  Origin responsibilities, Blueprint dossier primitives/collections/copy
  formatting, repository reset behavior, and error-state previews. Story Bank
  remained the finalized saved-seed home.
- **2026-08-07:** Finalized Story Bank, its actions, import/export ownership,
  manifested status, mobile navigation placement, and Library dossier skin.
- **2026-08-06:** Finalized the editable World Blueprint hierarchy and Library
  dossier presentation, Origin provenance, title synchronization, optional
  sibling persistence, copy/export coverage, and Blueprint reopening.
- **2026-08-06:** Standardized Manifest language and the shared Library shell;
  hardened Help audio lifecycle and translated audio routing.
- **2026-08-05:** Finalized Story Seed Settings placement, mature-audience
  metadata, Fate Survival controls, Help guidance, navigation drawer, and the
  compact ARC story-sauce controls.
- **2026-08-04:** Consolidated Story Title into Origin, compacted Origin/ARC,
  and preserved the Creator / Story / World state contract.
- **2026-08-03:** Added canonical schema, validation, tag inference,
  serialization, repository port, Workshop persistence, and generation
  boundaries while retaining compatibility imports.
- **2026-08-02:** Corrected the creation hierarchy around Origin, ARC, World,
  and Settings without changing the locked reference replica.
- **2026-08-01:** Created the production replica and initial development fork.
