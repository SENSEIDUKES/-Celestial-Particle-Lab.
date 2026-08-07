/**
 * Automatic Story Tag inference.
 *
 * Story Tags stay critical system data — they steer world, character, and
 * conflict generation — but they are no longer a required manual input. When
 * a creator leaves them empty, the Library derives them from the three
 * required Story inputs (Premise, Genre, Style) right before generation, and
 * the inferred set is saved into the Story Seed like any hand-picked tag.
 *
 * The vocabulary below is a deliberate subset of the Story Tag library
 * (`development/constants.ts`), kept here so the schema/generation boundary
 * never imports presentation code.
 */

/**
 * Tags every seed of a given genre can safely assume. `Fate Survival` is
 * deliberately absent — it is not a genre. Fate ingredients are inferred from
 * the keyword rules below instead, so a novel of any genre can carry them.
 */
const GENRE_TAGS: Record<string, string[]> = {
  Xianxia: ['cultivation realms', 'sect politics', 'dao comprehension', 'tribulation events'],
  Xuanhuan: ['bloodline awakening', 'martial techniques', 'tribulation events'],
  'LitRPG / System': ['game systems', 'level progression', 'system missions', 'skill trees'],
  'Academy Cultivation': ['academy cultivation', 'exam arcs', 'class rankings', 'rival schools'],
  'Kingdom Building': ['kingdom building', 'territory control', 'resource management', 'laws'],
  'Crafting / Alchemy': ['crafting/alchemy', 'pill refinement', 'artifact economy'],
  'Beast Taming': ['beast-taming / monster evolution', 'bonded beasts', 'bloodline awakenings'],
  'Tower Climb': ['dungeon/tower climb', 'floor bosses', 'trial rooms'],
  Regression: ['regression/reincarnation', 'future knowledge', 'second chances'],
  'Urban Cultivation': ['urban/modern cultivation', 'hidden sects in modern cities', 'social status growth'],
  'Apocalypse Cultivation': ['apocalypse cultivation', 'survival camps', 'mutated beasts'],
  'Cosmic Cultivation': ['cosmic cultivation', 'star realms', 'galactic inheritances'],
  'Political Intrigue': ['court intrigue', 'political pressure', 'faction memory'],
  'Cozy Slice-of-Life': ['cozy / slice-of-life cultivation', 'village bonds', 'low-stakes daily progress'],
  'Mystery Cultivation': ['mystery cultivation', 'forbidden cases', 'hidden murders'],
};

/** Keyword → tag rules scanned across Premise + Genre + Style. */
const KEYWORD_TAGS: { match: RegExp; tags: string[] }[] = [
  { match: /\brevenge|avenge|vengeance\b/i, tags: ['revenge spiral', 'revenge through preparation'] },
  { match: /\bbetray|traitor\b/i, tags: ['betrayal fallout', 'trust rupture'] },
  { match: /\bassassin|murder|killed?\b/i, tags: ['assassination plots', 'death flags'] },
  { match: /\bregress|reincarnat|reborn|time ?loop|timeline/i, tags: ['regression/reincarnation', 'time loops', 'future knowledge'] },
  // Fate ingredients — what kinds of fate mechanics the novel may contain.
  // Unrelated to the Fate Survival experience layer in Story Seed Settings.
  { match: /\bdoomed?|dies|death sentence|destined to\b/i, tags: ['destined death', 'doom timers'] },
  { match: /\bstolen (?:fate|destiny)|fate (?:theft|exchange|trade)\b/i, tags: ['stolen fate', 'fate exchange'] },
  { match: /\b(?:blood|life|karmic) debt|owes? (?:a life|blood)\b/i, tags: ['blood debt', 'life debt'] },
  { match: /\bkarma|karmic\b/i, tags: ['karmic bonds', 'moral debt'] },
  { match: /\b(?:broken|failed|false) prophec|prophecy (?:breaks|shatters)\b/i, tags: ['broken prophecy', 'prophecy tracking'] },
  { match: /\bheaven'?s? (?:punishment|wrath|judgment)|tribulation\b/i, tags: ["heaven's punishment", 'tribulation events'] },
  { match: /\bborrowed (?:life|lifespan|time)|lifespan\b/i, tags: ['borrowed lifespan', 'curse tracking'] },
  { match: /\bsystem\b|\binterface\b|\bstatus (?:screen|window)\b/i, tags: ['game systems', 'system missions'] },
  { match: /\bsect|clan\b/i, tags: ['sect politics', 'clan politics'] },
  { match: /\bacademy|school|exam|student\b/i, tags: ['academy cultivation', 'exam arcs'] },
  { match: /\bkingdom|empire|territory|city building\b/i, tags: ['kingdom building', 'territory control'] },
  { match: /\bwar|army|battlefield|siege\b/i, tags: ['military strategy', 'battlefield tactics'] },
  { match: /\bcourt|noble|throne|succession\b/i, tags: ['court intrigue', 'succession crisis'] },
  { match: /\bromance|lover|marriage|beloved\b/i, tags: ['slow-burn romance', 'romantic tension'] },
  { match: /\bharem\b/i, tags: ['harem harmony'] },
  { match: /\bcripple|weak|trash|discarded|abandoned\b/i, tags: ['rising from nothing', 'antihero rise'] },
  { match: /\bprophec|destin|fate\b/i, tags: ['fate bonds', 'fate intervention', 'foreknowledge'] },
  { match: /\bmystery|secret|hidden|buried truth\b/i, tags: ['mystery clues', 'hidden identities'] },
  { match: /\bdungeon|tower|floor\b/i, tags: ['dungeon/tower climb', 'floor bosses'] },
  { match: /\bbeast|monster|tame\b/i, tags: ['beast-taming / monster evolution', 'monster evolution'] },
  { match: /\balchemy|pill|forge|craft\b/i, tags: ['crafting/alchemy', 'pill refinement'] },
  { match: /\bapocalyp|ruin|survival\b/i, tags: ['apocalypse cultivation', 'survival camps'] },
  { match: /\bmerchant|trade|economy|auction\b/i, tags: ['trade routes', 'auction politics'] },
  { match: /\bgrim|dark|brutal|ruthless\b/i, tags: ['long-term consequences', 'stakes escalation'] },
  { match: /\bcozy|gentle|quiet|farming|village\b/i, tags: ['cozy / slice-of-life cultivation', 'village bonds'] },
  { match: /\bhumou?r|comed|wry|banter\b/i, tags: ['tone control'] },
  { match: /\bfamily|brotherhood|companion\b/i, tags: ['found family', 'sworn brotherhood'] },
];

/** Tags used only when premise, genre, and style yield nothing specific. */
const FALLBACK_TAGS = ['long-term consequences', 'emotional continuity', 'character status'];

/** How many tags inference is allowed to add. Manual tags are never capped here. */
export const INFERRED_TAG_LIMIT = 8;

export interface StoryTagInferenceInput {
  premise?: string;
  genre?: string;
  style?: string;
}

/**
 * Derives a Story Tag set from the three required Story inputs. Deterministic
 * (no model call), so the same seed always generates from the same tags.
 */
export const inferStoryTags = (input: StoryTagInferenceInput): string[] => {
  const genre = (input.genre || '').trim();
  const haystack = [input.premise, genre, input.style].filter(Boolean).join(' \n ');

  const inferred: string[] = [];
  const add = (tag: string) => {
    if (inferred.length >= INFERRED_TAG_LIMIT) return;
    if (!inferred.some(existing => existing.toLowerCase() === tag.toLowerCase())) inferred.push(tag);
  };

  const genreKey = Object.keys(GENRE_TAGS).find(key => key.toLowerCase() === genre.toLowerCase());
  if (genreKey) GENRE_TAGS[genreKey].forEach(add);

  for (const rule of KEYWORD_TAGS) {
    if (rule.match.test(haystack)) rule.tags.forEach(add);
  }

  if (inferred.length === 0) FALLBACK_TAGS.forEach(add);
  return inferred;
};
