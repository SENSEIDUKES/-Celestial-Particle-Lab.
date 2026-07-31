---
name: seihouse-codebase-conventions
description: >
  Orient coding agents inside SEIHouse repositories before implementation. Use when
  a task refers to existing SEIHouse systems, Library architecture, SEN, Reader
  Chamber, Reader Codex, story generation, media storage, themes, cultivation,
  relics, profiles, persistence, synchronization, Workshop replicas, or shared
  components without defining how those systems fit together. Also use when adding,
  refactoring, renaming, or reviewing code that must follow repository structure,
  naming, state, data-flow, persistence, compatibility, and ownership conventions.
  This skill maps stable SEIHouse product concepts onto the repository's current
  implementation, prevents duplicate systems and architectural drift, and favors
  the smallest coherent change that preserves existing behavior.
version: 1.1.0
last_updated: 2026-07-31
---

# SEIHouse Codebase Conventions

Act as the repository orientation and architectural-consistency layer for SEIHouse.

Your job is not to redesign the codebase from memory. Understand the task in SEIHouse
terms, inspect the current repository, identify the system that owns the behavior, and
make the change through that system rather than creating a parallel implementation.

## Core Rule

**The repository is the implementation source of truth. The references in this skill
define stable product boundaries, intentions, and decision rules—not permanent file
paths or exact APIs.**

Never assume a remembered folder, component, hook, service, schema, route, or state
store still exists. Locate and verify it before editing.

For shared production naming, the main `Light-Novels` repository is the naming source
of truth. The `development` repository mirrors approved production names where the same
component or concept exists, while retaining Workshop-only folder and preview structure.
Inspect both repositories independently because their files may legitimately differ.

## Current Canonical Developer Vocabulary

Use the current names when referring to developer-facing code:

- `AdminPage`
- `ReaderCodex`
- `CreationModal`
- `SectPage`
- `SystemColorLegend`
- `StorySteeringModal`
- `ClosedDoorCultivationModal`
- `ParticleEffect`
- `DestinedEndingCard`
- `ManifestationImage`
- `relicDropEngine`
- `alterFateLock`
- `closedDoorCultivation`
- `profilePicture`
- `profilePicturePersistence`
- `useStorySteering`
- `useChapterLock`
- `useClosedDoorCultivation`

Do not reintroduce retired developer-facing synonyms for these systems.

### Compatibility identifiers are different from developer names

A cleanup of files, functions, components, or hooks does not automatically authorize a
change to persisted or externally addressed values. Preserve verified compatibility
identifiers unless the task explicitly includes a migration or alias plan.

Known intentional examples include:

- `CELESTIAL_PORTRAIT`
- `/api/generate-cultivator-portrait`
- `/api/steer-arc`
- `currentScreen: 'sects'`
- schema-level `CultivatorPortraitAsset`

Treat database tables and fields, storage keys, R2 object paths, environment variables,
localStorage keys, saved user data, historical records, route strings, and persisted
enum values as contracts—not cosmetic names.

## Required Workflow

### 1. Translate the request into SEIHouse systems

Read `references/system_map.md` and identify which product systems are involved.

Distinguish:

- the user-facing surface;
- the engine or domain behavior beneath it;
- the state owner;
- the persistence owner;
- the media owner;
- any shared component or contract;
- downstream consumers that could regress.

### 2. Map concepts to the current repository

Before implementing:

1. Read repository guidance such as `AGENTS.md`, `CLAUDE.md`, `README`, package
   documentation, feature READMEs, and local skill requirements.
2. Inspect the relevant route, component, hook/store, service, API boundary, schema,
   tests, and nearby imports.
3. Search by behavior and domain terms—not only the label used in the prompt.
4. Trace one representative flow from entry point to state, persistence, and rendered
   output when the task crosses those layers.
5. Identify the current canonical owner of the behavior.
6. When work spans `Light-Novels` and `development`, verify source paths and names in
   each repository rather than assuming they match.

#### Focused trace pattern

Use the shortest trace that proves ownership:

1. **Visible entry point:** route, screen, rendered copy, event handler, or component.
2. **State connection:** hooks, selectors, context, props, actions, or query keys.
3. **Domain operation:** service, adapter, generation pipeline, repository, API handler,
   or shared engine.
4. **Persistence or media boundary:** database access, synchronization path, storage
   adapter, object key, or durable record.
5. **Return path:** how the result reaches downstream state and renders after reload.

Useful search anchors include exact visible copy, component/type/action names, persisted
fields, API routes, imports, callers, tests, and paired domain terms such as
`story + cover`, `codex + portrait`, `reward + claim`, or `chapter + persist`.

Stop once the owner and affected contract are clear. Do not perform broad repository
archaeology when a focused trace proves ownership.

### 3. State the change boundary

Before editing, form a concise internal change map:

- **Owner:** existing system that should contain the change.
- **Inputs:** data or events entering it.
- **Outputs:** state, UI, persisted data, media, or side effects it produces.
- **Consumers:** code relying on its current contract.
- **Invariants:** behavior and compatibility values that must remain intact.
- **Validation:** smallest checks proving the change works.

If ownership remains unclear, inspect further instead of inventing a new layer.

### 4. Implement through existing patterns

Follow `references/conventions.md`.

Prefer:

- extending an existing component, service, adapter, type, store, or schema;
- reusing established loading, error, retry, caching, media, and persistence paths;
- preserving public and persisted contracts unless the task requires changing them;
- compatibility shims, route aliases, dual reads, or migrations when stored data exists;
- one authoritative state owner for each piece of domain state;
- explicit boundaries between UI state, domain state, persisted state, and remote data.

### 5. Validate the affected path

Follow `references/change_protocol.md`.

Run targeted checks appropriate to the changed surface. Verify the requested behavior
and the nearest likely regression. Do not substitute a green typecheck for runtime or
data-flow validation.

For naming changes, also:

1. Search the full repository case-insensitively for every retired name.
2. Separate unintended stale references from intentional compatibility identifiers.
3. Update imports, exports, tests, mocks, dynamic imports, lazy loaders, docs, manifests,
   transfer instructions, and cross-repository references together.
4. Report every retained old string with the exact reason it remains.

## Repository Conventions

### Existing systems first

When the prompt says “use existing SEIHouse systems,” it means:

- find the current owner;
- reuse its contracts and lifecycle;
- avoid a second state path, persistence path, media path, or visual primitive;
- consolidate obvious duplication only when it directly blocks the task;
- leave unrelated cleanup alone.

### Naming

Use names that reflect the domain concept and real responsibility.

- Prefer canonical vocabulary already approved in the repositories.
- Do not create a new synonym for an existing system.
- Name adapters by boundary, services by capability, and components by rendered role.
- Avoid vague containers such as `utils`, `helpers`, `manager`, or `system` when a
  narrower domain name is available.
- Keep temporary migration names from becoming permanent architecture.
- Distinguish code-symbol cleanup from stored-contract migration.
- Do not rename established user-facing product terms casually.
- When a production component is renamed, update the corresponding Workshop manifest,
  feature README, transfer path, imports, and replica filenames where applicable.

### State ownership

For each state value, determine whether it is transient local UI state, shared client
state, server/database state, generated domain data, cached/derived data, a persisted
preference, or media metadata.

Do not copy authoritative state into multiple stores without a deliberate synchronization
contract. Derive values when practical instead of persisting redundant truth.

### Data and persistence

- Preserve the current Firebase/Postgres/R2 responsibility split found in the repo.
- Never add a second write path merely because it is convenient.
- Treat persistence success, local optimism, synchronization, retries, and media
  availability as separate concerns.
- Existing stored stories and user data must remain readable after changes.
- Schema changes require compatibility, migration, backfill, or safe defaults.
- Media records and visible assets must agree; a database row alone is not complete
  user-visible success.

### Components and UX behavior

- Reuse shared SEIHouse primitives and theme tokens before adding local variants.
- Keep components focused; extract only when reuse or clarity is real.
- Preserve responsive behavior across mobile, tablet, and desktop.
- Preserve loading, empty, error, offline, reduced-motion, and degraded-network behavior
  when the affected surface supports them.
- Visual refinement must not bypass the system that owns the underlying behavior.

### Generated content and canon

Generated chapters, Reader Codex records, manifestations, summaries, audio cues, and
other derived artifacts must maintain a traceable relationship to their story and
canonical source data. Do not create isolated generated records that cannot be
reconciled with the story, chapter, entity, media expression, or version that produced
them.

### Cross-media readiness

Do not hard-code shared story identity, canon, ownership, publication, permissions,
progress, or media relationships around novels alone. Preserve extensibility without
building speculative unused surfaces.

## Decision Order

When several implementations are valid, prefer:

1. Correct ownership
2. Preservation of existing behavior and data
3. Reuse of existing systems
4. Simplicity
5. Maintainability
6. Performance and resilience
7. Visual or structural polish

## Never Do

- Create a parallel service, store, schema, or component family before locating the
  existing owner.
- Trust remembered architecture over the current repository.
- Treat Reader Chamber, Reader Codex, Library/Hub, generation, and persistence as one
  undifferentiated feature.
- Reintroduce Firebase application-data ownership where the repository has migrated it
  to Postgres, except where current code explicitly retains Firebase responsibility.
- Store durable media blobs in application state or database fields when object storage
  owns media.
- Rename persisted identifiers, route strings, database values, storage keys, or
  historical data as part of a cosmetic code cleanup.
- Fix a UI symptom while ignoring a verified upstream data-contract failure.
- Perform broad reorganizations or unrelated cleanup during a focused task.
- Replace working domain language with generic SaaS terminology.
- Claim architectural compliance without tracing the affected flow.

## Completion Standard

A successful use of this skill leaves the repository with:

- one clear owner for the changed behavior;
- no unnecessary duplicate path;
- canonical developer names used consistently;
- persisted contracts preserved or deliberately migrated;
- affected loading, failure, and persistence states considered;
- targeted validation completed;
- cross-repository paths and Workshop metadata synchronized where relevant;
- a concise explanation of what system changed and why it was the correct owner;
- any mismatch between this skill and the current repository called out so the skill can
  be corrected instead of silently drifting.
