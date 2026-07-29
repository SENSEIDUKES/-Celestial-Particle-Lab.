---
name: workshop-replica
description: Create a faithful, isolated Workshop replica of a real application page, component, or flow using local mock state while preserving portability back to the source app.
version: 1.0.0
last_updated: 2026-07-28
---

# Workshop Replica Skill

Use this skill whenever the user asks to bring a real page, component, animation, or flow from another application into the SEN Visual Development space for safe visual refinement.

## Required input

Resolve or ask for only the information that cannot be discovered from the repositories:

- **Target:** exact page, screen, component, animation, or flow.
- **Source repository:** repository containing the production implementation.
- **Workshop repository:** destination visual-development repository.

The user may provide the target directly above the request, for example:

```text
Target: Versa writing page
Source: Light-Novels
Use the Workshop Replica skill.
```

Do not require the user to describe implementation details they would not reasonably know.

## Mission

Create a visually faithful Workshop replica of the target so it can be inspected, animated, and redesigned without relying on the source application's production systems.

The Workshop replica must preserve the real presentation while replacing production behavior with lightweight local state.

Do not modify the source application's production page unless the user explicitly requests a separate integration task.

## Phase 1: Inspect before editing

Inspect both repositories before making changes.

Identify:

1. The real source page and its route or entry point.
2. Presentation files that directly shape the visible experience.
3. Visual dependencies that can be safely reused or copied.
4. Production dependencies that must not enter the Workshop.
5. Existing Workshop systems that should be reused instead of duplicated.
6. The correct Workshop preview route, registry entry, and folder placement.

Present a brief file plan before implementation. Keep it practical and concise.

## Phase 2: Preserve the real presentation

Copy or reconstruct the target as faithfully as practical.

Preserve all presentation details that materially affect visual judgment:

- layout and responsive behavior
- mobile proportions
- typography
- spacing
- colors and borders
- icons and imagery
- visible animation structure
- buttons and interaction hierarchy
- progress indicators
- loading, success, and failure presentation
- surrounding UI that changes how the target feels

Do not simplify or redesign during extraction unless the user specifically asks for redesign work in the same task.

First create a trustworthy replica. Refinement comes afterward.

## Phase 3: Enforce the production boundary

The Workshop replica must not require:

- authentication
- Firebase
- Postgres
- Cloudflare R2
- production APIs
- AI generation calls
- payments
- account data
- real story persistence
- real user records
- secrets or production environment variables
- production routing assumptions

Do not copy large chains of business logic merely to make the replica run.

Replace production behavior with local mock data, timers, and explicit preview state.

## Phase 4: Build a state simulator

Create a small state simulator covering every meaningful visual state of the target.

Use names that match the real flow. Examples include:

```ts
type PreviewState =
  | 'idle'
  | 'opening'
  | 'loading'
  | 'generating'
  | 'charging'
  | 'progressing'
  | 'verifying'
  | 'nearly-complete'
  | 'completed'
  | 'revealed'
  | 'insufficient-resources'
  | 'error';
```

Only include states that are meaningful for the target.

Preview controls must remain clearly separated from the reusable UI. They are Workshop tools, not SEN product UI.

## Phase 5: Keep the result portable

Prefer a structure similar to:

```text
src/
  components/
    <target-name>/
      <TargetComponent>.tsx
      <TargetComponent>.css
      assets/
      README.md

  workshop/
    previews/
      <target-name>/
        <TargetPreview>.tsx
        previewData.ts
        previewStates.ts
```

Adapt to the repository's existing structure rather than forcing unnecessary reorganization.

Separate these concerns:

- reusable UI
- preview-only wrapper
- mock data
- state simulator
- Workshop navigation and controls

Never embed Workshop-only controls or mock behavior into the reusable production component.

## Phase 6: Reuse approved Workshop systems

Reuse existing Workshop systems when they genuinely fit the target:

- Library glyphs and icon assets
- shared typography and visual tokens
- celestial backdrop
- seals, glows, particles, and animation utilities
- reduced-motion handling
- foreground-safe behavior
- reusable reward and presentation components

Do not force an existing effect onto a target that needs its own visual identity.

## Phase 7: Register the replica

Add the replica to the Workshop's existing discovery system.

At minimum:

- add or update the Workshop manifest/registry
- give it a stable preview ID
- make it reachable by direct URL
- keep the Workshop home page intact
- do not break existing previews

## Required dating and history metadata

Every replicated component or page must include a local README with the following metadata near the top:

```markdown
# <Component or Page Name>

- **Source repository:** <owner/repository>
- **Source location:** <route or file path>
- **Workshop preview:** `?preview=<id>`
- **Replica created:** YYYY-MM-DD
- **Last Workshop update:** YYYY-MM-DD
- **Last source comparison:** YYYY-MM-DD
- **Replica status:** faithful replica | under refinement | approved | transferred back
```

Use the real current calendar date. Never invent or reuse an old date.

Whenever an agent materially changes the replica, it must:

1. Update **Last Workshop update** to the current date.
2. Add a concise entry under `## Workshop history`.
3. Update **Last source comparison** only when the source implementation was actually inspected again.
4. Update status when the lifecycle changes.

Use this format:

```markdown
## Workshop history

- **YYYY-MM-DD:** Created faithful Workshop replica and local state simulator.
- **YYYY-MM-DD:** Refined portal animation and reduced-motion behavior.
```

Do not create noisy history entries for formatting-only edits.

## Component README requirements

Document:

- what was copied or faithfully reconstructed
- what was mocked
- available preview states
- reusable Workshop dependencies
- production dependencies intentionally excluded
- known visual differences from the source
- exact files needed for later transfer
- transfer notes or cautions

## Accuracy checks

Test at minimum:

- narrow mobile width
- larger mobile width
- desktop width
- short text
- long text
- empty or missing optional content
- all meaningful preview states
- reduced-motion preference

The replica should be accurate enough that decisions made in the Workshop remain trustworthy when transferred back.

## Final verification

Before finishing:

1. Confirm the Workshop builds successfully.
2. Confirm the preview opens directly.
3. Confirm every mock state renders.
4. Confirm no production API calls occur.
5. Confirm no secrets or environment-specific assumptions were copied.
6. Confirm the mobile layout closely matches the source.
7. Confirm existing Workshop previews still work.
8. Confirm the component README dates and history are current.
9. List every file added or changed.
10. State any remaining visual differences honestly.

## Final response format

Report:

- what was replicated
- direct preview route
- states available
- production systems intentionally excluded
- build/test result
- files changed
- current README dates
- remaining differences or risks

Do not claim successful compilation or visual parity unless actually verified.
