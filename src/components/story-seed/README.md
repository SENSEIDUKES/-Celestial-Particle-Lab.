# Story Seed

- **Source repository:** SENSEIDUKES/Light-Novels
- **Source location:** `src/components/CreationModal.tsx` (default export `CreationModal`, verified on `main`)
- **Workshop preview:** `?preview=story-seed` (add `&state=<scenario-id>` to deep-link a preview state)
- **Replica created:** 2026-08-01
- **Last Workshop update:** 2026-08-06
- **Last source comparison:** 2026-08-06
- **Replica status:** under refinement

## Workshop history

- **2026-08-06:** Completed World Blueprint Pass 2 — the editable review now wears the modern Library dossier skin instead of the old flat grid of black boxes. The Pass-1 hierarchy, data mapping, and generation/edit behavior are unchanged; every blueprint box remains editable. The page became a stack of `LibraryPanel` dossier sections (Blueprint Header cover, Origin Snapshot, Main Character, World Setting, Overall Story Direction, Side Characters, Factions, Mysteries / Plot Threads) inside `seed-workspace-shell` over the gradient-only ambience layer, with gold medallion section headings, serif taglines, gilded dividers, and dossier metadata chips (version, creator, status, dates) under an editable display-serif Story Title cover. All fields moved onto the official `LibraryTextBox` / `LibraryTextArea` (Style keeps a raw `glass-select`), gaining 16px phone text, the gilded focus ring, quiet completed accents, a live premise counter, and the tag-limit error through the component's `error` prop; every label row carries a pencil `Editable` chip. Key fields (creator Premise, main-character Background / Profile, World Overview, Destined Ending) carry a scoped parchment-gold rest edge in `story-seed.css` (`.blueprint-key-field`) without leaving the shared glass language, and the footer actions are `LibraryButton`s (the primary Start Matrix keeps the VERSA writing swap). Every DOM id the preview scripts and persistence flows rely on is verbatim. Verified in headless Chromium at 390px and 1280px: no horizontal overflow, no console errors, edits persist through the Export save path, and a reviewed Blueprint survives reopen and a real page reload.

- **2026-08-06:** Completed World Blueprint Pass 1 without applying the future glass redesign. Re-mapped the editable review into Blueprint Header, Origin Snapshot, Main Character, World Setting, Overall Story Direction, Side Characters, Factions, and Mysteries / Plot Threads. Origin now reads and edits the canonical Story Seed premise, Genre, Style / Novel Tradition, and Story Tags instead of reusing generated logline/style fields. Added safe `v1.0` Blueprint normalization, structured main-character support, complete Copy Blueprint output, optional sibling Blueprint persistence, and additive portable Blueprint import/export so older seed-only records still open while generated and creator-edited Blueprints can be reopened or remixed intact. The locked Reference replica is unchanged; production `CreationModal` and `BlueprintReview` were rechecked on `Light-Novels/main`.

- **2026-08-05:** Expanded Story Seed Help into a reusable, context-aware Library
  guidance menu without changing its established modal, accordion, icon, or listening
  design. Added full-text guidance search and optional written-only quick-tip details;
  Story Seed continues to supply its contextual title and keeps its existing topics.

- **2026-08-05:** Refined the Fate Survival mobile settings card after device review: the switch now reads **Fate Survival** instead of **Enable Fate Survival**, the card header stacks on narrow screens so the description no longer squeezes into a thin column, and the mobile Settings sheet scrolls within the viewport with extra bottom safe-area room for Survival Pressure and utility actions.

- **2026-08-05:** Added a dedicated Fate Survival card to the current Story Seed Settings menu in `development/CreationModal.tsx`. The card keeps the requested UI/state shell only: an Enable Fate Survival switch plus Fate Visibility and Survival Pressure choices when enabled. The selected values live in the canonical Story Seed optional settings so drafts, exports, and generation payloads can carry the creator's preference without adding Fate Events, Mind Palace, or deeper survival logic.

- **2026-08-05:** Polished the shared Story Seed sidebar/mobile section drawer into a Celestial Library glass drawer: darker blue-violet panel wash, luminous grouped dividers, medallion-framed navigation sigils, clearer active-row glow for Origin, refined section spacing, and a lightweight equipped-relic title bar. The title bar reads an optional `routingConfig.storyMaker.equippedRelicTitle` value and falls back to **Wandering Disciple** in Workshop/local states, keeping the surface reward-ready without adding profile behavior.

- **2026-08-05:** Hid the visible labels in Story Seed's mobile bottom navigation so the bar is icon-only on phones while keeping each tab's accessible label and existing active icon styling. Desktop/sidebar labels are unchanged.

- **2026-08-05:** Removed the duplicate Story Title control from World Identity;
  Origin remains its single editing surface while retaining the established
  `world.optional.worldIdentity.title` storage path. World Identity completion
  now reflects only world type, world order, and opening location. Added a
  **Rated 18+** switch to the navigation Settings UI with the natural-language
  label "Intended for mature audiences." It saves as the backward-compatible
  `story.optional.intendedForMatureAudiences` boolean, defaults off for older
  seeds, round-trips through draft storage and portable files, and reaches the
  existing generation payload as story metadata only; no explicit-content or
  moderation behavior was added. The locked Reference replica is unchanged.

- **2026-08-05:** The Help menu now shows when the system is speaking — while
  a guidance line plays, its info card and topic sigil breathe with a soft
  portal aura and the Listen button carries a live voice-bar indicator.
  Reduced-motion users keep the halo without the animation.
- **2026-08-05:** Added the Story Seed Help menu — a `?` destination in the
  mobile bottom navigation (with a matching Help button in the desktop
  header) that gathers guidance for Story Seed, Origin, Premise, Genre,
  Style, Story Tags, World, and ARC in one place. Each topic reveals its
  written line on hover (desktop) or tap (mobile), and every card can play
  the matching English Library line streamed from the SEIHouse lines CDN.
  Content lives in `storySeedHelp.ts`, keyed by language, so more languages
  and topics slot in without UI changes. The loose guidance notes formerly
  at the bottom of the Origin, ARC, and World Identity workspaces moved into
  the menu, so those surfaces stay cleaner; the Abilities vs. Power System
  note stays in place because no Help topic covers it yet.
- **2026-08-05:** Restored **Make It Work** as its own optional ARC textarea
  immediately before the guidance note. Its high-priority creative instruction
  now lives at `story.optional.makeItWorkInstruction`, stays empty when missing,
  round-trips through save and portable import/export, and reaches Blueprint
  and initial-story generation through the existing canonical Story Seed
  payload. The legacy importer now maps the old production field into this
  path instead of folding it into Story Direction. The ARC story-sauce
  controls, required Origin behavior, Story Settings, Fate Survival, and the
  locked Reference replica remain unchanged.
- **2026-08-05:** Added a compact Story Sauce group at the top of ARC with
  Face Slap, Plot Armor, and Recognition controls. Each uses stable
  `low | medium | high` values under
  `story.optional.plotAndTropeSettings`; missing or invalid values normalize
  to `medium`, including older saved/imported seeds. Save, portable
  export/import, Blueprint generation, and initial-story generation all keep
  the values through the existing canonical contract. Cleaned up the
  requested Story, World, Abilities, Power System, and Blueprint-review labels
  without changing their stored paths. Story Settings, Fate Survival, the
  locked Reference replica, and the existing workspace/page structure are
  unchanged. Reverified production source path and default export on
  `Light-Novels/main`.

- **2026-08-05:** Origin form-level polish pass (continues the header pass
  from the same day). The shared glass fields inside Story Seed workspaces
  now follow the header's parchment-gold / soft-purple direction via scoped
  overrides in `story-seed.css` (`.seed-workspace-shell .glass-field`):
  warmer rest edge, ghost-lavender placeholder, gilded focus ring with a
  violet halo, quiet violet completed accent, and leading field glyphs that
  rest muted and warm to gold on focus (invalid states keep their warning
  red on purpose). Required asterisks on field labels are gilded marks
  instead of warning red. The Style section's three tradition options are
  now one family of "tradition tablets": a shared soft-violet tablet accent
  (same family as the Story Path tiles) with each tradition keeping its
  personality through a muted sigil tint — silver-blue scroll (Chinese),
  dusty-rose mugunghwa bloom (Korean, replacing the generic gem), sage
  snow-peak (Japanese) — each set in a circular medallion. The "Novel
  tradition" caption is now small-caps with a gold sparkle so it reads as
  part of the card header. Leftover bright-cyan label icons (Story Tags,
  Suggested Tags, Pick a path) softened to the parchment-gold accent.

- **2026-08-05:** Origin header celestial polish pass. The workspace header
  (`WorkspaceShell`, shared by every seed section) now reads as sacred
  Library chrome instead of generic app UI: the family/section breadcrumb
  switched from mono type to small-caps serif with a muted parchment-gold
  family label, the section icon sits inside a soft gold ring medallion
  (Origin's pencil became a quill), the title keeps its size but gains
  parchment tone and wider tracking, the red error-style **Required** pill
  became a muted-gold badge with a four-point sparkle (Complete softened to
  silver-blue), the tagline moved to a softer serif with warmer color, and a
  thin sparkle-centered hairline now separates the header from the form.
  Workspace `.glass-panel` cards gained a scoped polish layer in
  `story-seed.css` (`.seed-workspace-shell .glass-panel`): warmer
  parchment-tinted border, faint inner gold glow, and a whisper of
  starlight in the upper corner — layered over the shared Library glass,
  not replacing it.

- **2026-08-05:** Story Paths polish pass. The genre search field was removed
  from the expanded picker (the preset list is still small enough to scan),
  and the collapsed Genre section no longer shows an input-looking field: it
  is now a real tappable **Choose Story Path** button ("Xianxia, System,
  Mystery, or your own") built on the same `glass-choice` tile surface as the
  picker, with a compass medallion and trailing chevron. Once a genre is set,
  the button shows the chosen path (violet sigil for presets, gold sparkle
  for custom) with a "tap to change" hint. The expanded structure is
  unchanged: STORY PATHS header → preset grid → Define My Own Path tile,
  with the custom input revealed only after that tile is tapped.

- **2026-08-05:** Genre section on the Origin page redesigned as **Story
  Paths**. The preset grid is now a set of dark-glass path tiles (the shared
  `glass-choice` surface) with refined Lucide sigils in circular medallions
  replacing the raw emojis, a soft violet glow on the selected path, and a
  "Search genres..." field that filters the presets. Custom genres moved out
  of the always-visible top input into an official gold-accented **Define My
  Own Path** tile ("Craft a genre that's uniquely yours.") that reveals the
  custom input (placeholder "Example: urban xianxia mystery"); with the
  picker closed, the section shows the chosen path as a quiet field-like
  summary that reopens it. Section language is now "STORY PATHS — Choose a
  path, or define your own." The genre value, storage path
  (`story.required.genre`), preset ids, and `GENRE_PRESETS` are unchanged;
  the isolated legacy `GenreWorkspace.tsx` transfer fork keeps its previous
  layout, and `constants.ts` keeps the emoji icons it still uses.

- **2026-08-05:** Story Tags selection limit updated. The hard maximum is now
  12 tags (was 20) — adding is blocked at 12 until one is removed, with the
  existing limit error unchanged. The "Your tags" counter now carries static
  helpful copy — "Recommended: 4–8 tags." — with no warnings for sitting at
  9–12 (or below 4). The catalog, generation behavior (inference still caps
  at its own 8), storage, and tag UI layout are unchanged; the same constant
  was updated in the unwired `StoryTagsWorkspace.tsx` transfer source so the
  two development forks do not drift.

- **2026-08-05:** Story Tags smart catalog UI (Step 3). The Origin page's
  Story Tags section now reads the Step 2 `STORY_TAG_CATALOG` metadata
  directly: (1) a real search bar matches tag labels, aliases, and category
  names across the whole catalog (replacing the per-family filter input) and
  caps visible results at 24 with a "+N more" note; (2) a style-aware
  "Suggested Tags" row leads with tradition-specific tags for the selected
  Style (Chinese / Korean / Japanese) and fills the rest with strong general
  (`styles` containing `all`) tags — an enhancement of the general pool, not
  a takeover — picked deterministically with round-robin variety across
  categories, no AI call; (3) tag chips and family pills carry their
  category's color accent (dot + soft border tint) straight from
  `CATEGORY_COLORS`, with Meta & Continuity rendered as a true black dot
  ringed for visibility on dark glass. Selected tags still save as plain
  string arrays; the 20-tag limit, custom tags, Clear All, family browsing,
  and all DOM ids are unchanged. The canned `suggestTagsStub` button was
  retired from the Origin page in favor of the always-on deterministic row
  (the stub itself remains in `shared/stubs.ts` for the `StoryTagsWorkspace.tsx`
  production-transfer path). No generation, storage, or contract changes.

- **2026-08-05:** Story Tags catalog metadata & color coding (Step 2). Enriched
  the Story Seed tag catalog in `development/constants.ts` with structured metadata.
  Each entry in `STORY_TAG_CATALOG` now supports: `label`, `category`, `styles`
  (`all` | `chinese` | `korean` | `japanese`), `aliases` (`string[]`), and `color`
  (`gray`, `red`, `green`, `purple`, `pink`, `gold`, `blue`, `teal`, `orange`, `black`).
  Simplified category names were established per product rules: `Fate Threats`
  (from Fate & Destiny), `Society & Economy` (from Society & Economics), `Destiny & Karma`
  (from Fate & Karmic Bonds), `Adventure` (from Exploration & Dungeons), and `Modern`
  (from Urban & Modern). `CATEGORIZED_TAGS` and `TAG_PRESETS` remain fully backward-compatible
  string mappings derived from `STORY_TAG_CATALOG`. Story Seed saved data contracts,
  UI presentation, search, and generation behavior are completely unchanged.

- **2026-08-05:** Story Tags catalog expansion (Step 1). Audited and expanded
  `CATEGORIZED_TAGS` in `development/constants.ts` to dramatically improve tag
  coverage for core universal themes (romance, revenge, betrayal, rivalry,
  survival, chosen one, underdog, antihero, mentor, redemption, war, academy,
  training arc, tournament, comedy, tragedy, mystery), Korean webnovel/hunter-system
  tropes (regression, returner, hunter society, dungeon gates, tower climbing,
  rank system, ranker, constellation sponsors, scenario system, streamed trials,
  guild politics, raid team, awakening, status window, player system, revenge returner,
  chaebol family, apocalypse survival, monopoly strategy), Japanese light novel
  tropes (isekai, party banishment, hero party, demon king, adventurer guild,
  slow life, monster companions, dungeon academy, school life, slice of life,
  childhood friend, senpai-kouhai, summoned hero, reincarnated monster, villainess,
  otome game, crafting skill, cooking skill, cheat skill, cozy fantasy), and
  Chinese cultivation tropes (young master rivalry, face slapping, heavenly
  tribulation, bloodline inheritance, ancient clan, immortal ascension,
  forbidden manual, master-disciple bond, spirit beast, alchemy, artifact refining,
  dual cultivation, karmic debt, heaven defiance, demonic path, righteous sect).
  All tags remain concise, high-signal story engine terms with no added metadata,
  color coding, UI redesign, search changes, or data contract mutations.

- **2026-08-04:** Origin page reordered so Style leads: Story Title → Style →
  Premise → Genre → Story Tags. Style now sits above Premise because the
  chosen novel tradition decides what kind of premise the creator should
  write and which system example the field shows. Style and Genre each
  render as their own full-width section instead of sharing a two-column row.
  `CURATED_PREMISE_EXAMPLES` became a per-Style bank
  (`development/constants.ts` — 7 Chinese / cultivation, 7 Korean /
  hunter-system, 6 Japanese / light-novel hooks), replacing the old mixed
  short-hook / full-premise list. Every example teaches the SEN premise
  style: short, sharp, high-concept, one strange story engine and one
  escalation promise — never a synopsis, paragraph, or lore dump. The
  ghost-text example, Tab-to-accept, and dragon cycle button now draw from
  the selected Style's bank (all traditions mixed until a Style is chosen,
  and the cycle restarts when the Style changes). No contract, generation,
  or storage changes.

- **2026-08-04:** Origin page layout refinement. The field order is now
  Story Title → Premise → Style → Genre → Story Tags — the optional Story
  Title moved from the bottom of the page to the top, and Premise stays the
  main creative field. The old #1–#11 premise shortcut row was replaced by
  system premise examples shown as ghost text: while the premise field is
  empty, one curated example from `CURATED_PREMISE_EXAMPLES`
  (`development/constants.ts` — three short hooks, three full premises)
  appears as the field's placeholder, pressing Tab in the empty field
  accepts the shown example, and a circular dragon button in the field's
  top-right corner (the new `LibraryDragonCycleIcon`, the Library's shared
  "Re-do / Re-try / shuffle" glyph) cycles the list. User-typed text is
  never overwritten, and the existing ghost-tag Tab path (premise filled)
  is untouched. No AI call, no storage, no contract or generation changes;
  Style, Genre, and Story Tags behavior is unchanged. (A future user-saved
  premise bank is a separate feature, not part of this work.)

- **2026-08-04:** Bottom navigation refinement pass. The bar is now a soft
  floating dock (rounded glass pill inset from the screen edges) instead of a
  full-bleed strip. The section drawer and desktop selector dropped the mock
  `SENSEI / Cultivator Profile` header — they are pure Story/World section
  navigation now, and profile access lives only in the bottom navigation's
  Profile tab (`STORY_SEED_DRAWER_PROFILE` is removed). The Forge footer
  strip lost its redundant mobile Sections button, leaving Forge as the
  single primary action alongside the required-input status. Save Draft /
  Import / My Seeds / Export All remain centralized in the Settings sheet
  with unchanged handlers.

- **2026-08-04:** Added the mobile bottom navigation through the new reusable
  `LibraryBottomNavigation` (`src/components/library/`), ported from the
  SEIHouse UI repo's `SEIBottomNavigation`. The bar carries three tabs —
  Sections (opens the existing section drawer), Settings (opens a new mobile
  utility sheet), and Profile (placeholder sheet, no account behavior). The
  header utility actions moved into the Settings sheet on mobile: Save Draft
  and Import reuse the exact existing handlers, joined by My Seeds and
  Export All when signed in; the desktop header is unchanged. The Forge
  action strip stays fully usable — on mobile it rests in flow at the panel
  bottom so it never overlaps the bar. `index.html` gained
  `viewport-fit=cover` so iPhone safe-area insets resolve.

- **2026-08-04:** Consolidated the reusable Celestial Library UI into
  `src/components/library/`. Story Seed now imports `LibraryTextBox`,
  `LibraryTextArea`, `LibraryHeaderBadge`, `LibraryButton`, `LibraryPanel`, and
  `LibraryNavigationDrawer` from the shared Library barrel. The shared
  glass-field and spectrum styles moved with those components; reusable
  `seed-*` names became `library-*` names with no compatibility aliases. Only
  the Story Seed workspace ambience remains local in `development/story-seed.css`.
  Form state, DOM IDs, navigation, generation, and visual behavior are unchanged.

- **2026-08-04:** `LibraryPanel` premium refinement pass (see
  `src/components/library/README.md`): crisper/brighter glass border, deeper
  body glass, stronger rim lighting, a thin spectral SEIHouse edge along the
  top and corners, and a polished action-bar divider. No Story Seed markup,
  layout, or logic changed — the shell picks up the new skin automatically.

- **2026-08-04:** Shelled the two-panel creation workspace in the new
  `LibraryPanel` (`src/components/library/LibraryPanel.tsx`), ported from the
  SEIHouse UI repo's `SEIPanel` and re-skinned as the Celestial Library glass
  (translucent black-blue depth, backdrop blur, thin luminous border, faint
  inner top highlight, gentle portal/gold rim glow). The main section
  container is now `LibraryPanel` and the action bar is its `footer` variant
  (luminous top divider, translucent blur) instead of ad-hoc neutral divs.
  Layout, grid columns, section switching, the selector, the ambience layer,
  and every form field are unchanged.

- **2026-08-04:** Replaced the Story Seed section menu shell with the new
  Library navigation drawer, ported from the SEIHouse UI repo's
  `SEINavigationDrawer` (`UI/packages/seihouse-ui/src/layout/sei-navigation-drawer.tsx`).
  The reusable shell lives at `src/components/library/LibraryNavigationDrawer.tsx`:
  a mock profile header (`SENSEI` / `Cultivator Profile` — placeholder only,
  no account behavior), grouped Story/World icon + label destinations, 44px
  rows, an 85vw mobile drawer capped at 20rem with scrim tap / Escape /
  close-button dismissal, body scroll lock, safe-area bottom padding, and a
  reduced-motion collapse. The desktop sidebar renders the same panel
  standalone. Selected-section state, click behavior, required/filled
  indicators, and per-family portal/gold accents are unchanged;
  `StorySeedSelector.tsx` now maps the Story/World section model onto the
  drawer for both surfaces.

- **2026-08-03:** Combined Plot & Tropes with Destined Ending in one optional,
  compact **ARC** workspace. The five existing controls and their canonical
  data paths are unchanged; only their presentation and navigation ownership
  moved. Destined Ending no longer appears under World, while every other
  Story Seed section remains in place.

- **2026-08-03:** Added the optional Story Title to the bottom of Origin while
  retaining its existing `world.optional.worldIdentity.title` storage path and
  the existing World Identity input.

- **2026-08-03:** Combined Premise, Genre, Style, and Story Tags into one
  compact **Origin** workspace. Premise leads the page, with Style and Genre
  as supporting choices. Story Tags keep custom entry, suggestions, selected
  chips, search, families, and the tag limit; catalog children remain hidden
  until a creator opens a parent family. Plot & Tropes remains separate and
  unchanged. The canonical `story.required` paths, validation checks,
  generation payload, saved data, and locked Reference replica are unchanged.

- **2026-08-03:** Extended the title plaque's animated blue-violet-gold
  spectrum into the Celestial Library `S` emblem. The development badge now
  uses that exact portal gradient as a soft outer aura and a crisp chromatic
  rim, while retaining a restrained gold core for legibility. Hover deepens
  the portal glow without changing the emblem size or header layout, and the
  existing reduced-motion rule keeps the spectrum static when requested.
- **2026-08-03:** Mobile refinement pass on the `LibraryHeaderBadge` title
  plaque — on phones the badge dominated the header and the subtitle wrapped
  onto two lines. Below `sm` the emblem is now 40px (was 48px), the title is
  `text-2xl` (was `text-3xl`), the plaque padding tightens to `px-4 py-2.5`,
  and the subtitle drops to 10px with 0.24em tracking and `whitespace-nowrap`
  so "Grow Your Universe" stays on one line; `sm` and up is unchanged. The
  title also gains a dark drop shadow behind the glyphs for depth
  (`drop-shadow`, since `text-shadow` bleeds through the transparent
  background-clip text), layered under the existing gold aura. Header
  viewport fit: the `CreationModal` header now wraps below `sm`-ish widths so
  Save Draft / Import / My Seeds fall to a second, right-aligned row instead
  of clipping off the right edge — their visual design is untouched pending
  the dedicated button pass.
- **2026-08-03:** LibraryTextArea — the textarea counterpart joins the family,
  and the old form-field generation is gone from the active fork. Same rules
  as `LibraryTextBox`: SEIHouse-ported behavior (forwardRef, useId fallback,
  described-by wiring with error precedence, `role="alert"` errors, required
  marker, controlled **or** uncontrolled), the glass skin, 16px text on
  phones at both sizes, a live `n / max` counter in the label row when
  `maxLength` is set, and `children` for in-field overlays. Migrated: all six
  `FormTextarea` call sites (World Identity, Plot & Tropes, Characters,
  Abilities, Power System, Destined Ending), the four raw compact card
  textareas (character/faction aliases — uncontrolled `defaultValue` +
  `onBlur` preserved — and biography/description), and the Premise field with
  its ghost-tag Tab overlay (now passed as `children`; its label gains the
  standard required `*`). `FormTextarea.tsx` is deleted, and the now-unused
  `workspaceCompactInputClass` / `workspaceLabelClass` / `workspaceHelpClass`
  constants went with it (`workspaceCompactLabelClass` stays — Story Tags
  still uses it). Out of scope and unchanged: `BlueprintReview`,
  `ImportPanel`, `StoryAuthGate`, and the locked `reference/` fork.
- **2026-08-03:** Mobile/tablet pass on the LibraryTextBox rollout — verified
  Genre, Characters, Factions, and Story Tags in the real preview (headless
  Chromium) at 375, 430, 768, and 1280px widths, including a focused-field
  shot at 375px. No horizontal overflow on any page/width. Component-level
  fixes: compact fields now use 16px text below the `sm` breakpoint (12px
  above it) so the character/faction grid inputs stop triggering iOS
  auto-zoom on phones, and compact labels do the same (12px → 10px at `sm`)
  for phone legibility. Shell-level fix: the sticky action bar's primary
  button read "Forge World Blueprint" with `shrink-0` and clipped ~65px at
  375px; it now collapses to "Forge" below `sm` (same responsive-label
  pattern Save Draft already used). Preview-harness fix (Workshop tooling
  only): the `filled-intake` scenario's genre click matched `/^Xianxia$/`
  against text that includes the preset's emoji, so it silently never
  selected a genre — loosened to `/Xianxia/`. Known follow-up, not in scope:
  the compact card **textareas** still use 12px text at phone width.
- **2026-08-03:** LibraryTextBox rollout — every single-line text input in the
  active workspaces now uses `LibraryTextBox`. The 15 remaining `FormInput`
  call sites (World Identity, Plot & Tropes, Characters, Abilities, Power
  System) were drop-in swaps; the 13 raw `<input>`s (Characters and Factions
  compact grid fields, the custom-tag input, the celestial tag search) moved
  onto `size="compact"` / the `icon` prop, keeping every DOM id verbatim and
  gaining `aria-label`s where placeholder text was the only label.
  `FormInput.tsx` is deleted — `FormTextarea` stays until a LibraryTextArea
  counterpart exists, and the compact raw **textareas** still use
  `workspaceCompactInputClass` (`workspaceInputClass`, now unused, was
  removed). One intended visual delta: comfortable fields render 16px text
  (was 14px) as part of the iOS anti-zoom fix. Out of scope and unchanged:
  all textareas, `BlueprintReview`, `ImportPanel`, `StoryAuthGate`, and the
  locked `reference/` fork.
- **2026-08-03:** `LibraryTextBox` — the first official Celestial Library text
  input, and the first proof of the SEIHouse-behavior / Library-skin
  component rule. Behavior was ported (not packaged) from the SEIHouse UI
  repo's `SEIInput` / `SEIField` (`packages/seihouse-ui/src/forms/sei-input.tsx`
  and `sei-field.tsx`, inspected 2026-08-03) — only the text-input behavior,
  so the Workshop gains no new dependency: `forwardRef` to the real `<input>`,
  a `useId` fallback id, `aria-describedby` wiring where the error message
  wins over the helper text, `aria-invalid` from `invalid` or a present
  `error`, a required marker (`*` plus sr-only "(required)"), and
  `comfortable` / `compact` sizes matching the existing workspace field
  classes. The skin stays entirely on the glass field system (dark glass
  surface, cool-blue focus glow, quiet completed accent, warning edge,
  small-caps serif label, helper text above the field). Architecture rule:
  workspaces import `LibraryTextBox`, never a raw `<input>` or a page-specific
  input; a different visual mood becomes a new `variant` value on
  `LibraryTextBox`, not a new component. First proof: the custom genre input
  in `GenreWorkspace` now uses it (id `genre-custom-input` unchanged, so
  preview scripts are unaffected). `FormInput` / `FormTextarea` remain for the
  other workspaces; they migrate to `LibraryTextBox` (and a future textarea
  counterpart) one at a time. Hardening pass later the same day, ahead of
  any wider rollout: controlled **or** uncontrolled usage (omitting `value`
  no longer freezes the field), 16px text at the comfortable size so iOS
  Safari stops auto-zooming on focus, `role="alert"` on the error message so
  screen readers announce it when it appears, the `type` prop restricted to
  text-like values, a `trailingElement` slot (clear button / password
  visibility toggle), caller-supplied `aria-describedby` merged instead of
  clobbered, and browser-autofill styling in `glass-field.css` so autofilled
  fields keep the dark glass instead of the browser's pale fill (that CSS fix
  benefits every glass field, not just LibraryTextBox).
- **2026-08-03:** Story Seed backend cleanup, phase 1 — the creator-controlled
  data contract now matches the approved product hierarchy exactly, and the
  old flat intake contract is out of the active system. No interface redesign,
  no Postgres, no new administrative metadata.
  - **One canonical shape** (`shared/storySeedSchema.ts`):
    `creator` · `story.required` (Story Tags, Premise, Genre, Style) ·
    `story.optional` (`plotAndTropeSettings`, `additionalStoryDirection`,
    `makeItWorkInstruction`) ·
    `world.required` (intentionally empty) ·
    `world.optional` (`worldIdentity`, `worldFoundations`). It is what the
    workspace edits, what is saved, what is exported, and what enters every
    generation payload.
  - **The flat `IntakeData` view model is gone from `development/`** — the
    creation workspace, selector, section metadata, and all eleven workspaces
    bind straight to the canonical seed through `development/seedState.ts`.
    The frozen Phase-1 contract (`IntakeData`, the old portable seed format)
    moved to `shared/referenceIntake.ts` and is read only by the locked
    `reference/` replica and its mocks.
  - **Removed from the seed:** Fate Survival controls (`hardcoreFateMode`,
    `fatePressure`), experience dials (`romanceLevel`, `faceSlappingLevel`,
    `comedyLevel`, `tournamentArcPreference`, `haremPreference`,
    `betrayalLevel`, `dangerLevel`, `generalAtmosphere`, `powerPace`), and
    generated Blueprint output that had been stored back into the seed
    (`logline`, `firstArcPromise`, `tropeRules`, `unresolvedPlotThreads`,
    `estimatedArcs`, `universe`, `majorMysteries`, `mainCharacter.profile`,
    `powerSystem.outline`).
  - **Consolidated at this phase:** `desiredPlotDirection`,
    `makeItWorkInstruction`, `mustIncludeElements`, and `thingsToAvoid`
    initially became the single `story.optional.additionalStoryDirection`.
    Make It Work was restored to its own canonical optional path on 2026-08-05;
    legacy general-direction fields remain consolidated.
  - **Story Tags stay required** in the contract and are still never a manual
    requirement: an empty set is inferred from Premise, Genre, and Style
    before the generation payload builders validate.
  - **Storage isolated** — `shared/storySeedRepository.ts` is now a port with a
    record envelope that holds the seed instead of merging with it, backed by
    the swappable `shared/workshopStorySeedStorage.ts` (localStorage, Workshop
    only). Reading pre-hierarchy JSON is the one narrow legacy adapter left,
    in `shared/legacySeedImport.ts`, used by file import and nothing else.
- **2026-08-02:** Glass touch-ups from review — the Style tradition buttons
  and the Story Tag library join the glass system.
  - **Style choices are now glass choice cards** (`.glass-choice` in
    `glass-field.css`) — the same glass surface as the fields, driven by a
    per-option `--choice-accent` custom property. Each tradition has a
    custom icon and its own color: Chinese blue (`Scroll`, `#04ACFF`),
    Korean red (`Gem`, `#FF4545`), Japanese green (`Flower2`, `#34D399`)
    — all verified against `lucide-react@^1.27.0`. Hover brightens, the
    selected card gets its accent edge and a restrained glow. The stored
    values remain the stable `'chinese' | 'korean' | 'japanese'` keys; the
    color/icon mapping is presentation-only and lives in the workspace.
  - **Story Tag families are unmistakable now** — the parent category
    buttons became pill-shaped small-caps serif filter tabs under a
    "Families" label, while the child tags keep their lowercase chip style
    inside their own labeled `.glass-panel` ("Tags"). Tags themselves are
    unchanged; only the visual hierarchy between parent and child.
- **2026-08-02:** Modern glass field system — replaced the flat black form
  controls across every active workspace with one shared glass language
  (translucent dark glass, blue-violet internal gradient, thin cool edge,
  inner highlight, restrained focus glow), matching the approved design
  reference. Layout, Story/World hierarchy, section order, data wiring, and
  navigation are unchanged. Details:
  - **`src/components/library/glass-field.css`** — the shared system, applied as
    one `glass-field` class plus Tailwind layout utilities. Pure gradients
    and box-shadows, no `backdrop-filter`, so mobile scrolling stays cheap.
    Covers text inputs, textareas, selects (`.glass-select` wrapper with a
    custom chevron — never native chrome), tag chips (`.glass-chip`), group
    panels (`.glass-panel`). Story Seed's workspace ambience remains local in
    `development/story-seed.css`. States: default, hover, focus (strongest
    cool-blue edge + glow), completed (`data-complete`, a quiet cool
    accent), invalid (`data-invalid`, the existing warning color on the
    same glass surface), and native disabled.
  - **`FormInput` / `FormTextarea` rebuilt on it** — optional leading
    `icon` resting inside the field's left edge (warms to the focus color
    via `.glass-field-wrap:focus-within`), touch-friendly
    `min-h-[2.75rem]`, entered text clearly brighter than placeholder, an
    automatic subtle completed accent when filled, and an `invalid` prop.
    Character counts, help text, right elements, overlay children, and
    every DOM id the preview scripts drive are unchanged.
  - **All 11 workspaces share it** — `workspaceInputClass` /
    `workspaceCompactInputClass` / `workspaceCompactLabelClass` in
    `WorkspaceShell`; contextual icons per field (`User`, `Shield`, `Star`,
    `Sparkles`, `ShieldAlert`, `HeartCrack`, `Scale`, `BookOpen`, `Globe`,
    `Landmark`, `MapPin`, `Compass`, `Target`, `Swords`, `Zap`, `Route`,
    `Flame`, `Layers`, `Hourglass`, `Feather`, `Drama`, `Tag` — all
    verified against `lucide-react@^1.27.0`); character/faction cards are
    `.glass-panel`; active Story Tags are `.glass-chip` with the Story
    accent kept restrained; Premise keeps its ghost-tag Tab overlay on the
    glass textarea.
  - **Ambient depth** — a restrained blue-violet radial light field behind
    the active workspace (gradients only) lets the glass read as floating
    over the celestial atmosphere; the Story Seed background itself is
    untouched.
  - **Deliberately out of scope** — `BlueprintReview`, `ImportPanel`,
    `SeedLibraryPanel`, and `StoryAuthGate` keep their existing styling
    (the gate already has its own glass language). No schema, validation,
    tag-inference, classification, selector, or generation changes.
- **2026-08-02:** Style became the novel tradition, and the Story order was
  fixed. Structure and the previous correction pass are unchanged.
  - **Style is now Chinese / Korean / Japanese** — a closed set of stable
    values (`'chinese' | 'korean' | 'japanese'`) owned by
    `shared/storyStyle.ts` and stored in the existing required `story.style`.
    The freeform prose textarea, the descriptive presets, `STYLE_SUGGESTIONS`,
    and `DEFAULT_STORY_STYLE` are gone. **This is the skeleton only** — no
    tradition-specific pacing, naming, prompting, or cultural rules exist yet;
    `shared/storyStyle.ts` documents where they attach.
  - **Required order is now Style → Genre → Premise** — Style is the first
    decision, so a new seed opens on it. Selector, mobile drawer, progress
    dots, missing-field messaging, validation error order, and preview
    scenarios all follow that order.
  - **Fate Survival removed as a genre** — dropped from `GENRE_PRESETS`, the
    tag-suggestion stub's genre hints, the tag-inference genre map, and the
    preview fixtures (now `Xianxia`). The locked `reference/` fork and the
    separate Story Settings feature still have it, correctly.
  - **Fate Story Tags preserved and extended** — the tag category was renamed
    `Fate & Destiny` and gained `stolen fate`, `fate exchange`,
    `broken prophecy`, `heaven's punishment`, `borrowed lifespan`,
    `reincarnation debt`, `blood debt`, and `karmic bonds`. Fate tags are
    narrative ingredients (what fate mechanics the novel may contain), not the
    Fate Survival experience layer. Inference reaches them through keyword
    rules now that no genre implies them.
- **2026-08-02:** Phase 2 correction — removed the product drift that had crept
  into the redesign and realigned it with the Story Seed philosophy. The
  architecture was **kept**: left selector / right workspace, Story and World
  as the two families, one active workspace, mobile drawer, optional World,
  Phase 1 schema wiring. Changes:
  - **Three required inputs, not four** — Premise, Genre, Style. Story Tags are
    now optional and inferred from those three when left empty
    (`shared/storyTagInference.ts`), saved into the seed, and passed into
    generation. Manual tags are always preserved.
  - **Story Settings removed from Story Seed** — the oversized catch-all
    workspace (plot, pacing, tone, romance, harem, comedy, Fate Pressure,
    conflict, antagonist pressure, Make It Work) is gone, not renamed. Only a
    curated **Plot & Tropes** branch remains: plot direction, long-term goal,
    first major conflict, antagonist pressure. Make It Work returned as its
    own optional ARC instruction on 2026-08-05 without restoring the removed
    catch-all settings workspace.
  - **Fate Survival removed from Story Seed** — Fate Pressure, the
    Relaxed/Balanced/Hardcore/Dao Master control, and `hardcoreFateMode`
    interaction logic no longer appear here. The underlying fields are
    untouched; they belong to the separate
    [Story Settings](../story-settings/README.md) feature.
  - **Draft saving fixed** — `validateStorySeedDraft` (structure only) gates
    saving; `validateStorySeedInput` (Premise/Genre/Style) gates generation.
    Save Draft is never disabled for incomplete creative data.
  - **Style completion is a real choice** — Style starts empty and the Library
    default is offered as an explicit, visible option instead of an invisible
    prefill.
  - **Speculative additions removed** — `creator.penName` and the Creator
    strip, Universe Overview / Major Mysteries (with the Other World Settings
    workspace), the Story Seed summary sheet, and the header overflow menu
    (import / library / export are now plain always-visible actions).
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
  CreationModal.tsx            — two-panel shell in `LibraryPanel` glass:
                                 header (Save Draft + plain Import / My Seeds /
                                 Export All actions), selector/workspace grid,
                                 sticky action bar (`LibraryPanel` footer
                                 variant), mobile Library navigation drawer
  seedSections.ts              — the Story/World section model: ids, labels,
                                 icons, required flags, per-section filled
                                 checks, missing-required helpers
  StorySeedSelector.tsx        — maps the Story/World section model onto the
                                 Library navigation drawer (mock profile header,
                                 required/filled indicators); the desktop
                                 sidebar and mobile drawer share it. The shell
                                 itself is `src/components/library/LibraryNavigationDrawer.tsx`
  workspaces/
    WorkspaceShell.tsx          — shared breadcrumb/title/chip shell, field
                                  classes, GuidanceNote, WorkspaceSubheading
    PremiseWorkspace.tsx        — required; premise + suggestions + ghost-tag Tab
    GenreWorkspace.tsx          — required; preset grid + custom genre input
                                  (first `LibraryTextBox` proof)
    StyleWorkspace.tsx          — required, first; the three novel traditions
                                  (Chinese / Korean / Japanese)
    StoryTagsWorkspace.tsx      — optional (inferred if empty); tag
                                  add/suggest/browse + limit
    PlotTropesWorkspace.tsx     — optional; the four seed-level plot direction
                                  fields (direction, goal, first conflict,
                                  antagonist pressure)
    WorldIdentityWorkspace.tsx  — optional; title, world type, society, location
    CharactersWorkspace.tsx     — optional; main character + additional cast
    FactionsWorkspace.tsx       — optional; faction/sect editor
    AbilitiesWorkspace.tsx      — optional; starting power concept + unique path
    PowerSystemWorkspace.tsx    — optional; power flavor + known ranks
    DestinedEndingWorkspace.tsx — optional; destined ending
  StoryAuthGate.tsx            — Foundation v2 cinematic auth gate (added
                                 2026-08-01); rendered by CreationModal's
                                 signed-out branch
  BlueprintReview.tsx          — Pass-2 editable Library dossier: `LibraryPanel`
                                 sections, gold medallion headings, dossier
                                 metadata chips, `LibraryTextBox` /
                                 `LibraryTextArea` fields with pencil `Editable`
                                 chips, gold-edged key fields, and LibraryButton
                                 footer actions; Pass-1 hierarchy and canonical
                                 Origin provenance mapping unchanged
  ImportPanel.tsx              — portable seed import with optional Blueprint
                                 sibling restoration and legacy support
  SeedLibraryPanel.tsx         — saved seed/Blueprint library; toggled from the
                                 header "My Seeds" action instead of always rendered
  constants.ts                  — STORY_TAG_CATALOG (label, category, styles,
                                   aliases, color per entry) plus derived
                                   CATEGORIZED_TAGS, TAG_PRESETS,
                                   CATEGORY_COLORS, and lookup helpers;
                                   GENRE_PRESETS, PREMISE_SUGGESTIONS,
                                   CURATED_PREMISE_EXAMPLES (static Origin
                                   example premises; no Fate Survival genre)
  story-seed.css               — Story Seed-only workspace ambience and glass
                                  polish, plus the World Blueprint dossier's
                                  title cover (`.blueprint-title-field`) and
                                  key-field edge (`.blueprint-key-field`);
                                  reusable field/header styles live in
                                  components/library
shared/                        — shared infrastructure plus fork-specific data boundaries
  types.ts                     — additive WorldBlueprint artifact fields plus
                                  the narrow shared NamedCodexEntry subset;
                                  legacy Reference intake types live separately
  storyTagInference.ts          — deterministic Story Tag inference from
                                  Premise / Genre / Style (genre map + keyword
                                  rules, including fate ingredients); used when
                                  tags are left empty
  storyStyle.ts                 — the novel traditions: StoryStyle values,
                                  labels, normalization. Skeleton only — the
                                  documented extension point for future
                                  tradition-specific generation behavior
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
  storySeedSerialization.ts     — portable schema-v3 seed export/import with
                                  an optional sibling Blueprint artifact;
                                  excludes operational IDs and narrowly
                                  migrates valid v1 intake/blueprint files
  storySeedRepository.ts        — account-scoped development save/load adapter
                                  backed by Workshop local storage
  storySeedSchema.test.ts       — focused validation, empty-World,
                                  classification, serialization, persistence,
                                  and generation-payload checks
                                  (`npm run test:story-seed`)
  storyAdministrativeMetadata.ts — minimal internal story identity, lifecycle,
                                   language, version, and durable-reference spine
```

## Creative-data structure (Phase 1 + Phase 2 corrections)

```ts
{
  creator: {},                // reserved; no creator-controlled fields yet
  story: {
    required: {
      storyTags: string[],
      premise: string,
      genre: string,
      style: string
    },
    optional: { /* ARC and Story Settings */ }
  },
  world: {
    required: {},
    optional: { worldIdentity, worldFoundations }
  }
}
```

The current workspace edits this canonical `StorySeedInput` directly, one
section at a time. The flat production `IntakeData` shape survives only in the
locked Reference replica and the narrow legacy import adapter.

- **Creator:** no user-facing fields. The family stays in the contract for
  future creator-controlled settings.
- **Story:** the required Premise / Style / Genre / Story Tags inputs (empty
  tags are inferred before generation) and optional Story Title share the
  compact Origin workspace. Story Title
  continues to use the canonical `world.optional.worldIdentity.title` path so
  the World Identity input stays synchronized. The optional ARC workspace
  combines Face Slap, Plot Armor, Recognition, story direction, long-term
  goal, first conflict, main opposition, Destined Ending, and a separate
  Make It Work instruction while preserving the established stored paths.
  Make It Work lives at `story.optional.makeItWorkInstruction` and is treated
  as high-priority creative intent by downstream generation. The three
  story-sauce values live under
  `story.optional.plotAndTropeSettings`, default to `medium`, and round-trip
  through save, export/import, and both generation payloads. Pacing, tone,
  romance, comedy, and other experience settings remain outside Story Seed; Fate Survival
  now has a UI/state shell in the current Story Seed Settings menu.
- **World:** title, world type, location, society, main character, additional
  characters, factions, abilities, and power-system definition — all optional;
  empty World stays valid. `universe` and
  `majorMysteries` are populated from the generated blueprint, not collected
  as intake.
- **Blueprint artifact:** generated direction remains separate from the Story
  Seed. `WorldBlueprint.originSnapshot` captures canonical Origin provenance;
  new fields normalize additively, so older Blueprints without them still open.
  A saved record may carry the Blueprint as an optional sibling of `seed`,
  preserving generated and creator-edited Blueprint data without putting it
  inside Creator / Story / World. Portable single and collection files use the
  same optional sibling boundary, so seed-only exports stay compatible while a
  reviewed Blueprint can round-trip without losing generated fields.
- **Internal metadata:** schema version, seed/account IDs, display title, and
  created/updated timestamps remain on `StorySeedRecord`, outside the creative
  intake families. Blueprint version is a distinct `v1.0` artifact value; seed
  schema version and later story content version are not displayed as it.

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

- `empty-intake` — default mount, Origin active, nothing filled
- `filled-intake` — scripts a representative fill across both forks: Origin
  (Premise, Chinese Style, Xianxia Genre, two Story Tags, and Story Title), World Identity,
  Characters (MC fields + 1 added character), Factions (+1), Abilities, Power
  System, and ARC (including Destined Ending), landing back on Origin
- `generating-blueprint` — `isGenerating` prop `true`, showing the Forge
  button's spinner state
- `import-panel-open` — clicks the real header "Import" action to open
  `ImportPanel`

**Blueprint Review** — the blueprint review stage (`stage === 'blueprint'`)

- `blueprint-review` — signs in a mock account, populates the seed library,
  opens it from the header "My Seeds" action, then clicks the real "Use Seed" button on
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

- `src/components/library/LibraryNavigationDrawer.tsx` — the Library
  navigation drawer/menu shell (ported from the SEIHouse UI repo's
  `SEINavigationDrawer`, no `@seihouse/ui` dependency); provides the mock
  profile header, section rows, and mobile drawer behavior for the selector
- `FeatureWorkspace` + one `manifest.ts` entry (`story-seed`, category `other`
  — no existing `WorkshopCategory` fits an intake/creation flow better; the
  union was not extended since `other` already covers `chapter-generation-flow`)
- `lucide-react`, `motion/react` (already installed; every icon the
  development fork uses — `Tag`, `Feather`, `Drama`, `PenLine`,
  `SlidersHorizontal`, `Landmark`, `Users`, `Shield`, `Sparkles`, `Zap`,
  `Hourglass`, `Ellipsis`, `BookOpen`, `Globe`, `Check`, `ChevronRight`,
  `Eye`, `X`, `List`, `Bookmark`, `Copy`, `Database`, `Download`,
  `RefreshCw`, `Search`, `Wand2`, `ShieldAlert`, plus the glass field
  icons `User`, `Star`, `HeartCrack`, `Scale`, `MapPin`, `Compass`,
  `Target`, `Swords`, `Route`, `Flame`, `Layers` — was verified against
  this repo's `lucide-react@^1.27.0` export surface)

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
  Workshop feature left `genrePath` unwired; the Genre workspace binds it
  directly (preset grid + custom input) because Genre is one of the three
  required Story inputs. The Story Settings feature remains separate and
  unchanged; coordinate any transfer so the two do not both own genre.
- **Style is the novel tradition, not a prose description** — a closed set
  of three values with no default, so the completion indicator always
  reflects a real choice. Adapter precedence is
  `proseStyle → blueprint.styleBible → ''`, and each source must already hold
  a valid tradition; the freeform prose text older seeds carried in
  `story.style` normalizes to `''` and reads as "not chosen yet".
- **`Fate Survival` is not a selectable genre here** — it is an experience
  layer (Story Settings), so it is absent from `GENRE_PRESETS`, the tag
  suggestion hints, and the inference genre map. The locked `reference/` fork
  still offers it, matching production; align them on transfer.
- **Fate Story Tags are narrative ingredients and stay** — `Fate & Destiny`
  (death flags, stolen fate, blood debt, borrowed lifespan, broken prophecy,
  heaven's punishment, reincarnation debt, …) plus `Fate & Karmic Bonds`
  remain selectable and inferable. They describe what fate mechanics a novel
  may contain; they do not turn Fate Survival back on.
- **Story Tags are optional and inferred** — an empty tag set is filled from
  Premise, Genre, and Style at generation time by
  `shared/storyTagInference.ts` (deterministic; no model call), written back
  into the workspace, saved into the seed, and sent to both generation
  payload builders. Manual tags are never modified. Production may swap the
  inference for the `/api/suggest-tags` model call on transfer — keep the
  save-into-seed and pass-into-pipeline behavior either way.
- **Defaults are intentionally empty** — fresh seeds start with empty Premise,
  Genre, Style, MC name, and tags (previously a random MC name, `Fate
  Survival`, and premise suggestion #1 were pre-filled) so the required-input
  tracking reflects reality.
- **Save Draft is a new explicit action** — no production equivalent exists
  today (persistence only happened implicitly on generate/export). It uses
  draft validation only, so it never requires Style, Genre, Premise, or Story
  Tags, and in the Workshop it saves locally under `local-workshop-creator`
  when signed out.
- **The mobile drawer renders at `z-[250]`** — above the Workshop
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
- **Origin Story Tags suggestions are deterministic** — the Origin page's
  "Suggested Tags" row and tag search read `STORY_TAG_CATALOG` metadata
  directly (Style filter, alias/category matching); no model call and no
  `suggestTagsStub` involvement (Step 3, 2026-08-05).
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
  (also exports `buildStorySeedDrawerSections`; depends on the drawer below
  transferring too)
- `src/components/library/*` → `src/components/library/*` (shared Library
  buttons, panels, drawer, bottom navigation, fields, header badge, styles,
  helpers, and barrel; self-contained ports — no `@seihouse/ui` dependency to
  install. The bottom navigation's Profile tab is a placeholder — wire it to
  the real profile menu entry when the Library profile tab lands)
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
  (still exports `GENRE_PRESETS`, used by
  `reference/CoreSeedForm.tsx` — keep it until production's Core Seed form
  is removed in this transfer)
- `shared/storySeedSchema.ts` draft/generation validation split, the Style
  correction, `applyInferredStoryTags`, Blueprint Origin projection, and
  Blueprint normalization → production's Phase 1 schema
  module (the `IntakeData` view-model field `proseStyle` belongs to
  production `src/types.ts`, and now holds a `StoryStyle` value)
- `shared/storyStyle.ts` → production's creation feature. Transfer before any
  tradition-specific generation work starts, so both sides key off the same
  three stable values
- `shared/storyTagInference.ts` → production's creation feature (or replace it
  there with the `/api/suggest-tags` model call, keeping the same contract:
  infer only when empty, save into the seed, pass into generation)
- `shared/types.ts` World Blueprint additions → production `src/types.ts`
- `shared/storySeedRepository.ts` optional sibling Blueprint contract → adapt
  into production's real seed persistence rather than copying the Workshop
  local-storage adapter

Workshop-only — never transfer: `shared/stubs.ts`, `shared/id.ts` and
`shared/storySeedFormat.ts` and `shared/dialect.ts` and
`shared/codexContext.ts` (production `src/lib/*` versions are authoritative
— these were copied *into* the Workshop, never *out of* it), everything
under `src/workshop/previews/story-seed/`, the manifest entry, and the
registry line.

## Transfer notes and cautions

- `src/components/library/LibraryTextBox.tsx` is self-contained: its
  SEIInput/SEIField behavior was ported into the file, so transferring the
  shared Library component folder carries it
  with **no `@seihouse/ui` dependency to install**. If Light-Novels later
  adopts the SEIHouse UI package directly, re-base `LibraryTextBox`'s behavior
  on the real `SEIInput`/`SEIField` instead of the port.

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
- Pass 1 adds nested `originSnapshot` and `mainCharacter` Blueprint fields.
  Production transfer must update its Blueprint response schema, server
  cleaner, generation prompt/output contract, and durable persistence mapping
  together; otherwise those additive fields will be dropped even though the
  Workshop review builds successfully.

## Lifecycle

1. **Import** — copy production's current implementation into `reference/`.
2. **Fork once** — `development/` starts as a copy of `reference/`.
3. **Refine** — every Workshop task modifies `development/` only.
4. **Approve** — once approved, transfer `development/` back to Light-Novels.
5. **Resynchronize** — refresh `reference/` from the newly integrated
   production code, record the new comparison date, and reset
   `development/` for the next redesign cycle.
