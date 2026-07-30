---
name: seihouse-codebase-conventions
description: >
  Orient coding agents inside SEIHouse repositories before implementation. Use when
  a task refers to existing SEIHouse systems, Library architecture, SEN, Reader
  Chamber, Living Codex, story generation, media storage, themes, cultivation,
  relics, profiles, persistence, synchronization, or shared components without
  defining how those systems fit together. Also use when adding, refactoring, or
  reviewing code that must follow repository structure, naming, state, data-flow,
  persistence, compatibility, and ownership conventions. This skill maps stable
  SEIHouse product concepts onto the repository's current implementation, prevents
  duplicate systems and architectural drift, and favors the smallest coherent
  change that preserves existing behavior.
---

# SEIHouse Codebase Conventions

Act as the repository orientation and architectural-consistency layer for SEIHouse.

Your job is not to redesign the codebase from memory. Your job is to understand the
task in SEIHouse terms, inspect the current repository, identify the existing system
that owns the behavior, and make the change through that system rather than creating
a parallel implementation.

## Core Rule

**The repository is the implementation source of truth. The references in this skill
define stable product boundaries, intentions, and decision rules—not permanent file
paths or exact APIs.**

Never assume a remembered folder, component, hook, service, schema, or state store
still exists. Locate and verify it before editing.

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

1. Read repository guidance files such as `AGENTS.md`, `CLAUDE.md`, `README`, local
   package documentation, or equivalent instructions.
2. Inspect the relevant route, component, hook/store, service, API boundary, schema,
   tests, and nearby imports.
3. Search for the existing implementation by behavior and domain terms—not only the
   label used in the prompt.
4. Trace one representative flow from entry point to state, persistence, and rendered
   output when the task crosses those layers.
5. Identify the current canonical owner of the behavior.

#### Focused trace pattern

Use the shortest trace that proves ownership:

1. **Visible entry point:** find the route, screen, rendered copy, event handler, or
   component where the behavior appears.
2. **State connection:** follow imported hooks, selectors, context, props, actions, or
   query keys to the state owner.
3. **Domain operation:** follow the action into the service, adapter, generation
   pipeline, repository, API handler, or shared engine that performs the work.
4. **Persistence or media boundary:** identify the database access, synchronization
   path, storage adapter, object key, or durable record involved.
5. **Return path:** confirm how the result reaches downstream state and renders after
   refresh or reload.

Search with concrete evidence from the task. Useful search anchors include:

- exact visible copy or error text;
- component, type, action, event, field, or query-key names;
- persisted table/field names and media metadata;
- imports and callers of the first relevant symbol;
- tests describing the expected behavior;
- paired domain terms such as `story + cover`, `codex + portrait`, `reward + claim`,
  or `chapter + persist`.

When the first search is noisy, narrow by directory, file type, caller, or a second
co-occurring term. When it returns nothing, search the rendered copy, stored field, or
consumer instead of inventing a new implementation.

Example traces:

- **Missing Codex portrait:** card/rendered entity → portrait selector/hook → entity
  registration or image-resolution service → Postgres media reference → R2 object →
  reload rendering.
- **Relic reward mismatch:** claim interaction → reward action/store → cultivation or
  relic calculation → persistence → reveal-card presentation.
- **Slow Library story load:** Library screen → hydration/sync action → query/repository
  → reconciliation and cover-media resolution → rendered story entry.

Stop once the owner and affected contract are clear. Do not perform broad repository
archaeology when a focused trace establishes ownership.

### 3. State the change boundary

Before editing, form a concise internal change map:

- **Owner:** existing system that should contain the change.
- **Inputs:** data or events entering it.
- **Outputs:** state, UI, persisted data, media, or side effects it produces.
- **Consumers:** code relying on its current contract.
- **Invariants:** behavior that must remain intact.
- **Validation:** smallest checks proving the change works.

If ownership remains unclear, prefer further inspection over inventing a new layer.

### 4. Implement through existing patterns

Follow `references/conventions.md`.

Prefer:

- extending an existing component, service, adapter, type, store, or schema;
- reusing established loading, error, retry, caching, media, and persistence paths;
- preserving public contracts unless the task requires changing them;
- compatibility shims or migrations when stored data already exists;
- one authoritative state owner for each piece of domain state;
- explicit boundaries between UI state, domain state, persisted state, and remote data.

### 5. Validate the affected path

Follow `references/change_protocol.md`.

Run targeted checks appropriate to the changed surface. Verify both the requested
behavior and the nearest likely regression. Do not substitute a green typecheck for
behavioral validation when the change affects runtime data flow.

## Repository Conventions

### Existing systems first

When the prompt says “use existing SEIHouse systems,” it means:

- find the current owner;
- reuse its contracts and lifecycle;
- avoid a second state path, persistence path, media path, or visual primitive;
- consolidate obvious duplication only when it is directly blocking the task;
- leave unrelated cleanup alone.

### Naming

Use names that reflect the domain concept and its real responsibility.

- Prefer stable domain language already present in the repository.
- Do not rename established user-facing product terms casually.
- Do not create a new synonym for an existing system.
- Name adapters by boundary, services by capability, and components by rendered role.
- Avoid vague containers such as `utils`, `helpers`, `manager`, or `system` when a
  narrower domain name is available.
- Keep temporary migration names from becoming permanent architecture.

### State ownership

For each state value, determine whether it is:

- transient local UI state;
- shared client state;
- server or database state;
- generated domain data;
- cached or derived data;
- persisted user preference;
- media metadata or asset state.

Do not copy authoritative state into multiple stores without a deliberate synchronization
contract. Derive values when practical instead of persisting redundant truth.

### Data and persistence

- Preserve the current Firebase/Postgres/R2 responsibility split found in the repo.
- Never add a second write path merely because it is convenient.
- Treat persistence success, local optimism, synchronization, retries, and media
  availability as separate concerns.
- Existing stored stories and user data must remain readable after changes.
- Schema changes require compatibility, migration, backfill, or safe defaults.
- Media records and visible assets must agree; a database row alone is not a complete
  user-visible success.

### Components and UX behavior

- Reuse shared SEIHouse primitives and theme tokens before adding local variants.
- Keep components focused; extract only when reuse or clarity is real.
- Preserve responsive behavior across mobile, tablet, and desktop.
- Preserve loading, empty, error, offline, reduced-motion, and degraded-network behavior
  when the affected surface already supports them.
- Visual refinement must not bypass the system that owns the underlying behavior.

### Generated content and canon

Generated chapters, Codex records, manifestations, summaries, audio cues, and other
derived artifacts must maintain a traceable relationship to their story and canonical
source data. Do not create isolated generated records that cannot be reconciled with
the story, chapter, entity, media expression, or version that produced them.

### Cross-media readiness

Do not hard-code story architecture around novels alone when touching shared story
identity, canon, ownership, world entities, publication, permissions, progress, or
media relationships. Current UI may expose only novels, but shared backend contracts
should not block future audio, manga, game, animation, or other media expressions.

Avoid speculative implementation: preserve extensibility without building unused
product surfaces.

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
- Trust a remembered architecture over the current repository.
- Treat Reader Chamber, Living Codex, Library/Hub, generation, and persistence as one
  undifferentiated feature.
- Reintroduce Firebase application-data ownership where the repository has migrated it
  to Postgres, except where current code explicitly retains Firebase responsibility.
- Store durable media blobs in application state or database fields when the media
  architecture uses object storage.
- Fix a UI symptom while ignoring a verified upstream data-contract failure.
- Perform broad renames, reorganizations, or cleanup during a focused task.
- Replace working domain language with generic SaaS terminology.
- Claim architectural compliance without tracing the affected data flow.

## Completion Standard

A successful use of this skill leaves the repository with:

- one clear owner for the changed behavior;
- no unnecessary duplicate path;
- existing contracts preserved or deliberately migrated;
- affected loading, failure, and persistence states considered;
- targeted validation completed;
- a concise explanation of what system was changed and why it was the correct owner;
- any discovered mismatch between this skill's system map and the current repository
  called out so the reference can be corrected instead of silently drifting.
