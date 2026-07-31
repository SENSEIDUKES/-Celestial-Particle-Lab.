# SEIHouse Stable System Map

This map describes product responsibilities. Repository names and folder locations may
change. Always verify the current implementation.

## Naming Authority

For shared production concepts, the main `Light-Novels` repository is the naming source
of truth. The `development` repository mirrors approved production names where the same
component exists, while retaining Workshop-specific `reference/`, `development/`,
preview, simulator, and manifest structure.

Current developer-facing terminology includes `ReaderCodex`, `CreationModal`,
`StorySteeringModal`, `ClosedDoorCultivationModal`, `ParticleEffect`,
`ManifestationImage`, and `profilePicture`.

Developer-facing names are not the same as persisted compatibility identifiers. Values
such as `CELESTIAL_PORTRAIT`, legacy API route strings, navigation-state values, and
schema-level historical type names may remain intentionally unchanged. Verify the
contract before renaming them.

## SEIHouse

SEIHouse is the broader creator-infrastructure company and product family. Its systems
should translate artistic intent into richer experiences without permanently binding
the product to one model provider, one medium, or one implementation detail.

## The Library / Celestial Library

The Library is the story-facing product environment. Depending on the product stage,
“Library” may refer to the personal story collection, the broader application, or the
future discovery/community layer.

When a task mentions Library behavior, determine whether it concerns personal story
loading, story identity and metadata, discovery/publication, media-expression
navigation, the shared UI shell, or synchronization and persistence. Do not assume all
of these belong to one component or service.

## Story

A story is the primary shared canon/world object. Stable responsibilities include
identity and ownership, story seed and creation metadata, world and character
relationships, canonical continuity, publication and permissions, progress and
versioning, and relationships to media expressions.

A story may support novel, Reader Codex, audio, manga, game, animation, and future media
expressions. Each expression should be able to declare whether it is canonical, adapted,
alternate, or promotional. Current UI may expose fewer media types than the backend can
represent.

## Story Generation

Generation produces chapters and supporting structured outputs. It is a source of
chapter content, not the permanent owner of the entire reading experience.

Potential responsibilities include prompt/context assembly, model/provider
orchestration, chapter generation, continuity inputs and outputs, structured entity
registration, summaries, progression metadata, retries, failure handling, and cost
observability.

Generated data should flow into durable story systems through explicit contracts.
Rendered chapter text alone does not prove generation completed successfully.

## Reader Chamber

Reader Chamber is the user-facing reading experience and internally the SEN experience
engine. It composes story content with chapter rendering, navigation, name/system
highlighting, immersive effects, manifestations, narration/TTS, music, sound cues,
reading preferences, and progress/resume behavior.

Reader Chamber should consume generation outputs and story/Reader Codex data through
clear contracts. It should not be permanently fused to a particular model provider or
chapter-generation process. Keep the current product name unless a task explicitly
changes product naming.

## Reader Codex

Reader Codex is the structured, evolving representation of the story world. It may
include characters and portraits, factions, locations, artifacts, relics, beasts,
weapons, relationships and Karma Web, power rankings, arc timelines, mysteries,
summaries, entity colors, and visual identity.

Reader Codex entities must remain tied to the correct story and source context. Visual
cards, portraits, highlights, and manifestations are downstream consumers of correct
entity registration and metadata. When several visible symptoms fail together, inspect
the shared registration or persistence contract before patching each UI separately.

## Media and R2

Object storage owns durable media assets when the current repository uses R2. Media
concerns include upload/generation, stable object keys, access, metadata,
story/chapter/entity association, availability, fallback, cleanup, and replacement.

A database record without an available object is not complete user-visible success. An
uploaded object without a durable relational record is also incomplete.

## Postgres and Firebase

Postgres owns application data migrated away from Firestore, subject to the repository’s
current implementation. Typical concerns include stories, chapters, user-owned records,
Reader Codex metadata, progression, preferences, synchronization state, media
references, publication, and permissions.

The intended stable direction is Firebase Auth, Postgres application data, and R2 media.
Code inspection determines the actual active responsibility. Do not expand Firebase
application-data ownership by default.

## Harmony / Library Synchronization

Harmony refers to synchronization and retrieval behavior that keeps a user’s Library
current and usable. A successful Library load means more than placeholder story rows:
stories should become available promptly with expected metadata and cover art.

Distinguish initial local render, remote refresh, reconciliation, media availability,
stale data, retries, duplicate writes, and queued work. Avoid write amplification and
repeated full refreshes.

## Profiles and Profile Pictures

Profile systems include authentication identity presentation, application profile data,
preferences, progression identity, and selected/generated profile pictures.

A provider avatar, generated profile picture, media asset, and persisted profile
selection may have different owners and lifecycles. Developer-facing profile-picture
code should use the current `profilePicture` vocabulary while persisted media-purpose
and schema contracts remain compatible.

## Cultivation, Qi, Relics, and Rewards

These are product-domain systems, not generic gamification labels. They may include
closed-door cultivation, Qi/energy economy, ranks, relic acquisition and rarity,
cosmetic unlocks, claim/reveal flows, offering, and conversion mechanics.

Keep economy state and reward truth authoritative. Animations and reveal cards present
the result; they should not independently decide or persist rewards.

## Workshop and Themes

The `development` repository is the isolated visual-development Workshop. A feature has
one canonical folder with a locked `reference/` copy, an active `development/` copy,
optional shared code, one workspace preview, and one manifest entry.

Workshop controls Reader/Reader Codex presentation and theme packages. Themes should
use shared tokens, primitives, and package contracts rather than scattered one-off
values. Reader and Reader Codex may be themed together while remaining distinct systems.

Every manifest `source.path` and transfer instruction must point to a verified current
file in the named source repository. Production renames require synchronized Workshop
imports, filenames, feature READMEs, manifests, and transfer notes without silently
changing visual behavior.

## SAP and Audio

The shared audio player/orchestration layer owns coordinated playback for narration,
World Card clips, music/scene scoring, ambient loops, and discrete sound cues. Avoid
competing audio lifecycles inside individual components. Respect user controls, autoplay
restrictions, persistence, interruption, and mobile/lock-screen behavior where
supported.

## SEN Hub and Future Media

The Hub is the eventual discovery/community and cross-media entry layer. Reader Chamber
remains the SEN experience engine. Shared story architecture should allow one Library
entry to lead to multiple media expressions without each medium reinventing story
identity, world ownership, canon, or permissions.
