# Chapter Generation Manifestation

- **Source repository:** SENSEIDUKES/Light-Novels
- **Source location:** `src/components/AILoadingVeil.tsx`
- **Workshop preview:** `?preview=chapter-generation-manifestation`
- **Replica created:** 2026-07-29
- **Last Workshop update:** 2026-07-31
- **Last source comparison:** 2026-07-29
- **Replica status:** under refinement

## Workshop history

- **2026-07-29:** Created faithful Workshop replica and local state simulator.
- **2026-07-29:** Consolidated presentation into a shared `LoadingSystem` (primary veil + compact indicator driven by a normalized task card).
- **2026-07-29:** Refined the Development veil: dropped the atmospheric phase phrase and the phase marker pill for a more compact card, lowered Versa's emblem for more breathing room.
- **2026-07-29:** Reorganized into the standard feature workspace layout — `reference/` and `development/` folders (formerly `AILoadingVeil`/`LoadingSystem` mixed with `Dev*` file prefixes), with `shared/` holding the task-card format and compact indicator both versions reuse. Selected with the Original Reference / Development / Compare control instead of two labeled buttons on one page.
- **2026-07-30:** Added `development/SwordCultivatorClash.tsx` — two flying sword cultivators drift in, clash once at center with a spark, recoil, and glide out on an 8-second loop, with flowing circular qi trails, an outward pulse ring, and ambient motes. Deepened Versa's purple aura toward the reference image: saturated violet nebula with a bright core, twin counter-rotating cloak wisps, stronger ground pool, six brighter qi motes, violet-dominant cast on the figure.
- **2026-07-30:** Rebuilt the Development veil as a single 100dvh mobile composition — no vertical scrolling. Three zones: Versa hero (aura kept, tighter footprint, spills over the card's top edge), compact chapter status (Chapter · ~Ns row, Manifesting N/20, progress bar; library seal and continuity note removed from the default layout; workshop-only "Animation Concept 2" copy dropped), and an animation area that flex-grows into the remaining viewport with scenes scaled contain. The animation area is a swipeable carousel (`SwordCultivatorClash` + new `CelestialChannel` scene) with compact title, dot navigation, and an expand toggle that collapses chapter status to one thin row.
- **2026-07-30:** Rebuilt the Development veil as one continuous circular chamber — the rectangular card is gone. Four zones: Versa hero on top (aura unchanged, emblem sized up slightly to fill her zone with less dead space), a compact always-visible status line ("Chapter 1 · Manifesting 9/20 · ~23s") with a thin progress bar directly beneath it, a large concentric circular portal ring filling the remaining viewport with `SwordCultivatorClash` living inside it as the visual focus, and Versa's rotating evolving line at the bottom where the scene title used to be. Removed the VERSA heading, scene title, carousel dots, swipe, and both minimize/expand controls — the system chooses the scene, and minimization is now navigation-driven only (the caller flips `minimized`; `LoadingVeilCard`'s `onMinimize` prop is gone). `CelestialChannel` remains in the folder as a stage-only scene for future system-chosen selection.
- **2026-07-30:** Added `development/ManifestationChamber.tsx` — the chamber now owns an explicit three-layer stacking contract inside an `isolate`d stacking context: Layer 0 (z-0) holds the portal rings, inner glow, and any shared ambient effects (particles, bubbles, symbols) always behind the scene; Layer 1 (z-10) is the scene itself, kept visually clear; Layer 2 (z-20) allows only a capped set of scene-specific foreground particles (`CHAMBER_FOREGROUND_MOTE_LIMIT = 6`, standard set: `ChamberForegroundMotes`). Future scenes are passed as `scene` and inherit the behavior with no per-scene layering fixes. Veil-level stacking made explicit to match: root `isolate`, cinematic backdrop pinned to z-0, all content zones at z-10.
- **2026-07-30:** Layering cleanup — shared particles were visibly swarming the battle scene. Root cause: the old rectangular card carried `data-celestial-foreground`, the marker the shared `CelestialParticleShower` uses to dim its particles around foreground content; the circular-chamber rebuild dropped it. The marker now lives on the `ManifestationChamber` root so every current and future scene inherits the shower's calm-zone behavior, and a soft dark occlusion disc in the chamber's Layer 0 absorbs any remaining backdrop glow behind the scene. The scene stays clear in Layer 1; only the capped Layer 2 motes render above it.
- **2026-07-31:** Replaced the thin progress bar in the Development veil with `development/journey-scrubber/` — a journey-style scrubber: a subtly curved qi path, a tiny cultivator traveler whose looping run cycle is decoupled from its progress-driven position, an illuminated trail behind the traveler, milestone motes, and a celestial destination gate that glows on arrival (the traveler plays a small hop). Status text is layered (identity · state on one line, live detail beneath) instead of one hard-coded string. Progress is a normalized 0–1 prop — the veil maps the task card's 0–100 value onto it, so any passage count or flow works unchanged. Travelers come from a registry (`journey-scrubber/travelers.ts`) with the cultivator as default, so future skins (beasts, spirit pets, sword riders, avatars) swap in via a `travelerId` prop without touching path, trail, marker, or status layers. The task-card data contract is untouched; `progress: null` keeps an indeterminate drift, and reduced-motion users get static, calm presentation.
- **2026-07-30:** Expanded the journey scrubber's cosmetic slots. **Traveler roster grew to three** — the cultivator runner (unchanged default), a `sword-rider` (tiny figure gliding on a flying sword with a fluttering qi scarf; no leg cycle, it floats — cultivation power), and a `spirit-beast` (a small celestial fox with a bushy tail, light trot/bounding loop, happy hop on arrival — mystical companion). All three honor the same `TravelerRenderProps` contract and art bar: minimal silhouettes, accent + accentSoft only, readable at ~34px, calm decoupled loops. **The illuminated trail became a preset system** (`journey-scrubber/trails.tsx`): a new `trailStyle` prop picks `qi-glow` (default, the original clean violet trail), `mist-trail` (softer, wider, diffuse drifting energy with a slow shimmer), or `starlight-trail` (a subtler base line with tiny twinkling sparks along the lit portion). Geometry is identical across presets — same curve, viewBox, and dimensions; only the traveled-portion rendering changes, and unlit path, motes, gate, and status stay shared. Reduced-motion users get static, calm mist/sparkle presentation. `LoadingVeilCard` behavior is unchanged (default cultivator + qi-glow).
- **2026-07-30:** Added the third cosmetic slot and Workshop switching controls. **Destination families** (`journey-scrubber/destinations.tsx`): the single shared gate became a registry of three reusable families — `door` (Door / Gate: portals and thresholds; the original gate rendering, also the safe fallback), `sect` (Sect / Temple: temple arch with upturned roof and hanging lantern, for cultivators and humanoids), and `cave` (Cave: jagged den mouth with base crystals, for beasts and creatures). All honor one local-space contract (ground at (0,0), ~30px tall, geometry and spacing identical across families), react on arrival, and go static under reduced motion. Each traveler nominates a default family (cultivator → sect, sword-rider → door, spirit-beast → cave) but selection is independent — any traveler can arrive at any family via the scrubber's `destinationId` prop. **Workshop controls:** the Chapter Manifestation simulator gained a Development-only "Journey Scrubber" control section (traveler / aura trail / destination pill groups) that passes ids through the Development veil chain (`AILoadingVeil` → `LoadingSystem` → `LoadingVeilCard` → `JourneyScrubber`). Picking a traveler applies its recommended destination, while the destination control remains independently selectable. The reference veil and production callers are untouched — without the optional props everything renders the registry defaults.
- **2026-07-30:** Visibility fix for the aura trail presets. `mist-trail` and `starlight-trail` rendered but were nearly invisible on the dark veil — every mist layer went through the pure-blur soft filter (no crisp bright element survived), and starlight's base line was a 1.1px unfiltered stroke at 0.65 opacity with sparks twinkling from 0.25. Both presets now anchor the traveled portion with a crisp gradient core under the glow filter at qi-glow's visual weight (mist: 1.6px core at 0.85 under its diffuse bed and breathing veil; starlight: 1.3px core at 0.9 under its sparks), mist puffs use the glow filter at higher opacity, and starlight sparks are ~25% larger twinkling between 0.5 and 1. Geometry, ids, and the preset contract are unchanged; reduced-motion fallbacks kept in step.
- **2026-07-30:** Reworked the aura trail mechanic — presets no longer style the traveled line (per-preset trails read as visual noise); they now restyle the milestone markers along the path. The traveled portion remains as a single shared lit path behind the traveler (the qi-glow rendering, owned by the scrubber); what varies by preset is the marker art. The preset contract changed accordingly: a trail preset is now a `TrailMarkerProps` component that renders one milestone marker (lit + unlit states) in local space, and the scrubber keeps marker positions and lit state shared. Presets: `qi-glow` (default — the classic dots), `starlight-trail` (markers become twinkling four-point stars), and `scroll-trail` (markers become tiny rolled scrolls — replaces `mist-trail`, whose diffuse blobs belonged to the per-preset trail design). Workshop controls, reduced-motion fallbacks, and the `trailStyle` prop contract are unchanged.

## Folder layout

```
reference/AILoadingVeil.tsx    — untouched adapter, feeds a LoadingTaskCard into reference/LoadingSystem
reference/LoadingSystem.tsx    — orchestrator: routes primary veil vs compact indicator
reference/LoadingVeil.tsx      — full-screen immersive veil presentation

development/AILoadingVeil.tsx   — active Workshop adapter (formerly DevLoadingVeil)
development/LoadingSystem.tsx   — active orchestrator (formerly DevLoadingSystem)
development/LoadingVeilCard.tsx — active veil presentation: circular-chamber composition
development/ManifestationChamber.tsx — circular portal + three-layer stacking contract every scene inherits
development/SwordCultivatorClash.tsx — stage-only looping clash diorama (active scene)
development/CelestialChannel.tsx     — stage-only calm orbit diorama (held for system-chosen scenes)
development/journey-scrubber/JourneyScrubber.tsx     — journey progress presentation: curved qi path, trail slot, milestones, gate, status layers
development/journey-scrubber/CultivatorTraveler.tsx  — default traveler (running hooded cultivator)
development/journey-scrubber/SwordRiderTraveler.tsx  — sword-rider traveler (gliding on a flying sword)
development/journey-scrubber/SpiritBeastTraveler.tsx — spirit-beast traveler (trotting celestial fox)
development/journey-scrubber/travelers.ts            — traveler registry + swap contract
development/journey-scrubber/trails.tsx              — aura trail preset registry (qi-glow, starlight-trail, scroll-trail)
development/journey-scrubber/destinations.tsx        — destination family registry (door, sect, cave) + per-traveler defaults

shared/taskCard.ts          — LoadingTaskCard format + buildAILoadingTaskCard, used by both versions
shared/CompactIndicator.tsx — floating corner widget, identical in both versions
```

## What this is

A single reusable loading system for operation UI. Every operation normalizes its live information into one interchangeable **LoadingTaskCard** (`shared/taskCard.ts`): operation name, icon, status, description, progress, and phases — plus tracker detail, time estimate, and compact-mode copy.

Two visual modes render the same card:

- **Primary veil** — full-screen immersive presentation for blocking operations. Minimizes to compact mode through navigation (the caller flips `minimized`), never through a control on the veil itself.
- **Compact indicator** (`shared/CompactIndicator.tsx`) — floating corner widget for minimized, short, or background operations.

`LoadingSystem` is the orchestrator and only entry point: it routes between the modes and keeps very short tasks hidden. Compact mode waits out a grace window (`compactGraceMs`, default 1200ms); tasks that finish inside it never render, because they complete too quickly to communicate useful information.

### Chamber layering contract

Every manifestation scene renders inside `ManifestationChamber`, which enforces:

- **Layer 0 (z-0, behind):** occlusion disc, portal rings, inner glow, and shared ambient effects passed as `ambient`. Shared particles/bubbles/symbols never cover the scene.
- **Layer 1 (z-10, scene):** the scene itself — characters, trails, rings, core effects — always visually clear.
- **Layer 2 (z-20, above):** a small controlled amount of scene-specific foreground particles, capped by `CHAMBER_FOREGROUND_MOTE_LIMIT` (6). `ChamberForegroundMotes` is the standard set.

The chamber is `isolate`d, so no effect — inside or outside — can slip between layers. The chamber root carries `data-celestial-foreground`, so the shared `CelestialParticleShower` dims its particles around whatever scene is inside. New scenes inherit all of this by being passed as `scene`; do not add z-index or particle workarounds inside scene components.

### Journey scrubber contract

Progress in the Development veil renders as `journey-scrubber/JourneyScrubber`:

- **Progress:** one normalized 0–1 prop (`null` = indeterminate drift). Callers map their own units (passages, steps, bytes) onto the range; nothing in the scrubber knows about passage counts.
- **Layers:** status (`title` / `state` / `detail`), path, milestone markers, destination gate, and the traveler are separable — each can change without touching the others.
- **Travelers:** swappable through `travelerId` and the registry in `journey-scrubber/travelers.ts`. A traveler honors `TravelerRenderProps` (accents, `moving`, `arrived`, glow filter) and a local-space contract (feet/anchor at (0,0), ~30–40px tall, facing right). Registered options: `cultivator` (default and fallback — universal runner), `sword-rider` (glides on a flying sword, qi scarf flutter; no leg cycle — cultivation power), `spirit-beast` (trotting celestial fox, bushy tail, happy hop on arrival — mystical companion). Movement loops stay decoupled from position, and reduced-motion users get a static traveler.
- **Aura trails:** the milestone-marker rendering is a preset system in `journey-scrubber/trails.tsx`, selected with the `trailStyle` prop. Presets are picked by stable id — never free-form config. Registered presets: `qi-glow` (default — the classic glowing dots), `starlight-trail` (markers become twinkling four-point stars), `scroll-trail` (markers become tiny rolled scrolls). A preset honors `TrailMarkerProps` and renders one marker (lit + unlit states) in local space centered on (0,0); marker positions along the shared curve and the lit state (lit once the traveler passes) stay scrubber-owned. The lit path behind the traveler is a single shared rendering (the qi-glow trail), identical across presets. Path, gate, status text, and the indeterminate drift stay shared. Under reduced motion, star twinkle and scroll pulse become static and calm.
- **Destinations:** the endpoint marker is a family registry in `journey-scrubber/destinations.tsx`, selected with the `destinationId` prop. Registered families: `door` (Door / Gate — portals, thresholds, rifts; the fallback), `sect` (Sect / Temple — arches, pavilions; for cultivators and humanoids), `cave` (Cave — dens and caverns; for beasts and creatures). All share one local-space contract (ground at (0,0), ~30px tall) and identical geometry — only the marker art and arrival reaction differ. When `destinationId` is omitted, the selected traveler's recommendation applies (`DEFAULT_DESTINATION_BY_TRAVELER`: cultivator → sect, sword-rider → door, spirit-beast → cave); selection is otherwise independent, and future relic packages can re-theme a family without touching scrubber logic. Unknown ids fall back to `door`. The Workshop simulator exposes all three cosmetic slots as Development-only controls; production callers omit the props and get the defaults.
- **Motion:** the traveler loop is decoupled from position; position eases from progress. Reduced-motion users get a static traveler and calm, non-looping glows.

## What changed in Development vs Reference

- Compact card: no atmospheric phrase, no phase marker pill.
- Live "Manifesting N/20" tracker detail (was "N passages formed") while a chapter streams in.
- Versa's floating emblem inside a deepened violet aura (saturated nebula + bright core + counter-rotating wisps) and a `CelestialParticleShower` backdrop tinted to the active agent.
- The whole veil is a locked 100dvh circular-chamber composition: Versa hero on top, a journey scrubber (layered status + curved qi path with a swappable traveler, preset-driven lit trail, and destination gate) instead of the thin progress bar, a `ManifestationChamber` holding the manifestation scene with its enforced layering contract, and Versa's rotating evolving line at the bottom. No card, no carousel, no scene-selection UI, no manual minimize control.
- Scout's presentation stays a compact card without the animation zone.

## What was mocked

Nothing beyond the AILoadingVeil replica boundary — the system is presentation-only; the Workshop preview simulator drives it with local state.

### Preview states

- Primary veil — phase selector covering blueprint, initial-arc, steer, cover, and chapter, switched between Reference and Development via the workspace control.
- Versa compact — background chapter task; expandable back into the veil.
- Scout compact — retrieval task; always compact, never blocks the screen.

### Production dependencies intentionally excluded

No stores, auth, Firebase, or generation callbacks. Operation logic stays in the caller; the system only renders a task card.

### Files needed for transfer

- `shared/taskCard.ts`, `shared/CompactIndicator.tsx`
- `development/LoadingVeilCard.tsx`, `development/LoadingSystem.tsx`, `development/AILoadingVeil.tsx`, `development/ManifestationChamber.tsx`, `development/SwordCultivatorClash.tsx`, `development/CelestialChannel.tsx`, and the full `development/journey-scrubber/` folder (scrubber, three travelers, traveler registry, trail presets, destination families — once approved, transfer as the new reference implementation)
- Agent profiles from `src/lib/agents.ts` (already present in the source app)

### Transfer notes

- Requires `lucide-react` and `motion/react`.
- Callers keep their own operation state; they only build a `LoadingTaskCard` (or reuse `buildAILoadingTaskCard`) and pass `active`, `minimized`, and `onMinimizedChange`. Minimizing the veil is navigation-driven: flip `minimized` when the user leaves the generation page; the veil itself renders no minimize control.
- Route short/background tasks with `preferredMode: 'compact'` on the card.
- The veil assumes a `100dvh` viewport container and `overflow: hidden` at the root; host pages must not add their own vertical scroll inside the manifestation experience.
- Manifestation scenes go through `ManifestationChamber`'s `scene`/`ambient`/`foreground` slots; respect the Layer 2 particle cap instead of layering inside scenes. The chamber's `data-celestial-foreground` marker only works while the shared `CelestialParticleShower` keeps its foreground-zone behavior — do not strip that selector when transferring.
- The journey scrubber expects a normalized 0–1 `progress` prop; keep the caller-side normalization (`task.progress / 100`) when transferring. Pass `travelerId` / `trailStyle` / `destinationId` only with ids registered in `travelers.ts` / `trails.tsx` / `destinations.tsx` — unknown ids fall back to `cultivator` + `qi-glow` + `door`. A new traveler is one component honoring `TravelerRenderProps` plus one registry entry; a new trail preset is one component honoring `TrailMarkerProps` (one milestone marker, lit + unlit states, local space centered on (0,0)) plus one registry entry; a new destination family is one component honoring `DestinationRenderProps` (ground at (0,0), shared geometry) plus one registry entry. Reduced-motion fallbacks are each component's own responsibility.
