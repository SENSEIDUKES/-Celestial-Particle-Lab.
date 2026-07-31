/**
 * Verbatim port of all four Fate Pressure append-blocks from Light-Novels
 * `src/server/routes/storyRouter.ts` (`/api/generate-chapter-stream`, lines
 * ~353-434, verified against `main`). The Chapter Generation Workshop
 * replica's `reference/` assembly only ever exercised the "Balanced" branch
 * (its mock scenario is fixed to Balanced); the new `development/` Scene
 * Rhythm Tracker needs all four tiers, since Fate Pressure is one of its
 * inputs. Factored out into its own module so it's portable back to
 * Light-Novels rather than duplicated per Workshop file.
 */
import type { FatePressureTier } from "./sceneRhythm";

const RELAXED = `

=========================================
FATE PRESSURE: RELAXED
=========================================
The reader has set the story to RELAXED pressure.
- Keep the story flow supportive, comforting, and relatively smooth.
- Avoid introducing heavy setbacks, irreversible tragedies, severe material losses, or shock betrayals.
- Let the Main Character solve problems with cleverness, charm, or typical effort without suffering crushing psychological or physical consequences.
- Power gains and faction status increases should proceed without severe counter-attacks or lethal danger.
- Show positive milestones and lucky events through natural story action. When a milestone genuinely earns visible Celestial Library UI treatment (any genre — frequent in System/LitRPG stories, selective elsewhere), render it in this response's visible system-panel format described in the system instructions; never put a bracketed alert inside paragraph or dialogue text.
=========================================`;

const BALANCED = `

=========================================
FATE PRESSURE: BALANCED
=========================================
The story is operating under BALANCED fate pressure.
- Deliver standard webnovel stakes: normal progression setbacks, rival friction, and challenging but fully surmountable conflicts.
- Ensure setbacks feel organic and serve to build tension before the next breakthrough or training arc.
- Show new pressure, rivals, and consequences through natural story action. When a consequence genuinely earns visible Celestial Library UI treatment (any genre — frequent in System/LitRPG stories, selective elsewhere), render it in this response's visible system-panel format described in the system instructions; never put a bracketed alert inside paragraph or dialogue text.
=========================================`;

const hardcoreOrDaoMaster = (tier: "Hardcore" | "Dao Master") => `

=========================================
CRITICAL FATE PRESSURE IS ${tier.toUpperCase()}:
=========================================
This story is operating under highly rigorous, consequence-driven settings. You must actively push back against typical "overpowered MC always wins and avoids all consequences" patterns.

HOWEVER, to keep events from feeling "cheap" or "randomly chaotic," you must only trigger or escalate a major Hardcore Fate Event when the story has built up sufficient setup.

First, examine the previous chapters and current state of the world:
- Growth Pacing: Have there been 3-5 chapters of peaceful power-growth, safe exploration, or easy victories? If so, a setback is now earned!
- Ignored Threats: Has the user avoided or hand-waved past consequences, ignored a rising rival, neglected the faction economy/resources, or left high-pressure faction tensions bubbling?
- Relationship Instability: Are there high levels of jealousy or unstable alliances?
- Overpowered Cheats: Has the MC over-relied on an absolute cheat, heavenly treasure, or secret power?
- Codex Warnings: Are there many unresolved plot threads or active dangers?

If any of these setups are present, you are ORDERED to introduce or advance a major, tense Hardcore Fate Event. Choose ONE of the following event types that fits best with the narrative flow and integrate it seamlessly.
Death Flag, Betrayal Check, Fate Lock, Destiny Shift, Hidden Timer, and similar Fate labels are UI/control concepts, not normal prose. When a Fate event warrants a visible alert (any genre), render it in this response's visible system-panel format described in the system instructions, styled to the world; keep the surrounding narration natural — prose carries consequences, omens, pressure, and character choices. Never write a bracketed Fate alert inside paragraph or dialogue text.

1. Death risk: Place an important companion, mentor, or loved one at risk of death. Make their vulnerability clear through their vulnerability and the characters' response.
2. Betrayal pressure: Introduce clues or actions indicating a trusted ally might be secretly plotting, compromised, or forced to turn against the MC.
3. Calamity: Force a sudden macro-level crisis: a plague, a massive crop failure, an approaching army, a demonic rift, or an ancient curse that threatens the setting.
4. Moral choice: Force a high-stakes compromise or forced tradeoff where saving one thing means losing another.
5. Karma backlash: Cause past selfish or risky choices to return with heavy, complex consequences.
6. Rival ascension: Show an enemy gaining massive power, authority, or finding their own legendary cheat because they were left unchecked.
7. World fracture: Introduce a major, irreversible change in the laws of nature, sect structures, or the continent's geography.
8. Resource crisis: Put the MC's organization or faction under absolute physical stress (no food, depleted spiritual qi vein, empty treasury, or ruined defenses).
9. Deadline pressure: Establish a concrete approaching danger, such as poison reaching a heart or an invading sect approaching.
10. Irreversible loss: Seal a narrative branch so a past choice or loss has permanent consequences.

=========================================
FATE EVENT FREQUENCY DIRECTIVE (1-3 PER ARC):
To maintain proper narrative pacing, follow the Min/Max Rule for Fate Events:
- MINIMUM: At least 1 major Hardcore Fate Event should occur per story arc to ensure real stakes and character growth.
- MAXIMUM: Do NOT exceed 3 major Hardcore Fate Events in a single arc. If an arc is already oversaturated with crises, focus on the dramatic fallout, recovery, or training rather than piling on new unrelated disasters.
If a major event just occurred in the previous chapter, allow the characters time to react and breathe before triggering another!
=========================================

=========================================
TIMING & PLACEMENT DIRECTIVE FOR SYSTEM ALERTS:
When a Fate event genuinely needs visible UI treatment (any genre), place its standalone system panel — using this response's visible system-panel format described in the system instructions — at the end of the chapter or an active turning point. Never place a bracketed Fate alert inside normal paragraph or dialogue text. When no panel is warranted, build the cliffhanger through narrative consequences instead.
=========================================

${tier === "Dao Master" ? `
-----------------------------------------
SPECIAL DAO MASTER DIRECTIVE (PERMADEATH RULES):
-----------------------------------------
As a DAO MASTER story:
- Elevate stakes to the absolute maximum. Consequences are deadly and permanent.
- If the MC or an ally fails, there is no undo, no "Fate Alteration" backtracks. The run can end or key companions can die permanently.
- Infuse the narration with a solemn, brutal tone emphasizing the absolute weight of every single breath and action. Every choice is carved into eternity.
-----------------------------------------
` : ""}

PACING DIRECTIVE: Build real suspense and danger. Make sure characters face physical danger, psychological strain, or tough tradeoffs. Let the crisis feel fully earned from the story's setup!
=========================================`;

const FATE_PRESSURE_BLOCKS: Record<FatePressureTier, string> = {
  Relaxed: RELAXED,
  Balanced: BALANCED,
  Hardcore: hardcoreOrDaoMaster("Hardcore"),
  "Dao Master": hardcoreOrDaoMaster("Dao Master"),
};

export function getFatePressureBlock(tier: FatePressureTier): string {
  return FATE_PRESSURE_BLOCKS[tier];
}
