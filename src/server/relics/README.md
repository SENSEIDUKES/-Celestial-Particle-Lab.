# Relic v3 backend foundation

Created: 2026-08-04

Relic v3 moves achievement truth out of the visual reveal flow and generic
profile-inventory arrays. The existing Relic Gallery and reveal UI are not
connected to this foundation yet and were not changed.

## Ownership

Postgres is the durable owner. The migration in
`database/migrations/20260804_001_relic_v3_foundation.sql` defines three record
families:

1. `relic_achievement_template` stores reusable, versioned achievement
   definitions.
2. `story_relic_assignment` stores one assignment per template and story, its
   independent progress, and an immutable definition/reward snapshot.
3. `earned_relic` stores the immutable earning, reward snapshot, and completion
   evidence.

Both the assignment and earned tables have a unique `(story_id,
achievement_template_id)` constraint. The earned constraint is the final
concurrency guard: retries or simultaneous workers cannot award the same
achievement twice for one story. The same reusable template can still be earned
once in each different story.

## Supported v3 contract

- Common through Transcendent rarity.
- Public or hidden condition definitions. Use `discloseRelicCondition` before
  returning a hidden condition to an unqualified client; it redacts the
  evaluator key and parameters until the achievement is earned.
- Optional title rewards.
- Optional cosmetic rewards with open JSON metadata, without choosing the
  future cosmetic catalog or fulfillment system.
- Qi rewards bounded to 0–250 so Relics remain a modest supplement rather than
  becoming a second Qi economy.
- Versioned evaluator keys and JSON parameters.
- Immutable completion evidence recording evaluator version, source identity,
  observation time, and supporting facts.
- Story ownership guards and immutable assignment snapshots so template edits
  cannot rewrite existing story achievements.

## Evaluation boundary

`RelicEvaluatorRegistry` and `RelicEvaluationService` accept injected,
versioned evaluators. No evaluator is registered by default. This foundation
does not decide how achievements are generated, which chapter/story signals are
trusted, how evidence is independently verified, or when rewards are fulfilled.
Those systems can be added later without changing the three storage contracts.

`InMemoryRelicRepository` is a deterministic local/test adapter for proving the
domain behavior. It is not the production persistence implementation. A later
integration should implement `RelicRepository` through the existing authenticated
Data Connect server boundary and apply the included relational schema there.
