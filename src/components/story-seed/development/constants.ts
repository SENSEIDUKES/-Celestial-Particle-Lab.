import type { StoryStyle } from '../shared/storyStyle';

export const CATEGORIZED_TAGS: Record<string, string[]> = {
  'System & Progression': [
    'game systems', 'power scaling', 'cultivation realms', 'breakthrough pressure', 'bottleneck arcs', 
    'tribulation events', 'dao comprehension', 'martial techniques', 'bloodline awakening', 'artifact growth', 
    'weapon spirits', 'inheritance trials', 'class evolution', 'skill trees', 'job classes', 
    'level progression', 'stat growth', 'quest systems', 'achievement systems', 'reincarnation rules', 
    'regression rules', 'time loops', 'save points', 'death penalties', 'respawn logic', 
    'system corruption', 'system awakening', 'system missions', 'system rewards', 'system penalties', 
    'system shop', 'system diagnostics', 'hidden stats', 'karma points', 'influence points', 
    'admin points', 'military points', 'diplomacy points', 'logistics points'
  ],
  // Fate is not a genre — it is a set of narrative ingredients. These tags
  // tell the Library what kinds of fate mechanics, consequences, and
  // distortions the novel may contain. They are unrelated to the Fate
  // Survival experience layer, which lives in the Story Settings feature.
  'Fate & Destiny': [
    'death flags', 'doom timers', 'fate intervention', 'changing timelines', 'assassination plots',
    'survival games', 'foreknowledge', 'destined death', 'saving the doomed',
    'stolen fate', 'fate exchange', 'broken prophecy', "heaven's punishment",
    'borrowed lifespan', 'reincarnation debt', 'blood debt', 'karmic bonds'
  ],
  'Society & Economics': [
    'kingdom economy', 'resource management', 'territory control', 'trade routes', 'supply chains', 
    'infrastructure growth', 'settlement upgrades', 'city building', 'village growth', 'guild systems', 
    'tax reform', 'law reform', 'public order', 'famine pressure', 'refugee crisis', 'war economy', 
    'black market', 'scarcity economy', 'trade embargo', 'grain pricing', 'currency pressure', 
    'debt crisis', 'guild economy', 'artisan production', 'labor shortage', 'port economy', 
    'mining economy', 'rare materials', 'auction politics', 'tribute systems', 'foreign investment', 
    'smuggling routes', 'banking influence', 'land rights', 'market control', 'industrial growth', 
    'economic recovery', 'magical resources', 'contract enforcement', 'kingdom building', 
    'territory upgrades', 'laws', 'diplomacy', 'city expansion', 'master workshops'
  ],
  'Politics & War': [
    'faction memory', 'loyalty tracking', 'reputation tracking', 'political pressure', 'military strategy', 
    'court intrigue', 'border defense', 'warlord politics', 'noble resistance', 'imperial oversight', 
    'rebellion risk', 'succession crisis', 'spy networks', 'intelligence war', 'diplomatic leverage', 
    'treaty instability', 'alliance building', 'alliance decay', 'betrayal fallout', 'rival factions', 
    'proxy war', 'hostage diplomacy', 'merchant politics', 'clan politics', 'sect politics', 
    'council politics', 'propaganda war', 'public scandal', 'legitimacy crisis', 'hidden patrons', 
    'puppet ruler', 'rebel recruitment', 'vassal management', 'occupied territory', 'conquered loyalty', 
    'troop morale', 'unit progression', 'officer loyalty', 'siege warfare', 'guerrilla warfare', 
    'border raids', 'campaign planning', 'battlefield tactics', 'fortress defense', 'supply raids', 
    'mercenary contracts', 'military doctrine', 'weapon upgrades', 'elite units', 'special corps', 
    'war exhaustion', 'strategic retreat', 'city evacuation', 'prisoner politics', 'veteran trauma', 
    'enemy generals', 'battlefield reputation', 'political intrigue', 'court factions', 'succession battles', 
    'spy networks', 'marriage alliances', 'sect diplomacy'
  ],
  'Romance & Affection': [
    'romantic trust', 'slow-burn romance', 'memory romance', 'forbidden romance', 'political romance', 
    'arranged marriage', 'enemies to lovers', 'rivals to lovers', 'protector bond', 'grief to love', 
    'jealousy tracking', 'affection growth', 'confession timing', 'trust rupture', 'trust repair', 
    'romantic sacrifice', 'duty versus love', 'love versus ambition', 'harem harmony', 'harem jealousy', 
    'companion loyalty', 'companion arcs', 'companion growth', 'companion rivalry', 'companion betrayal', 
    'companion trauma', 'companion ambition', 'party chemistry', 'party conflict', 'mentor bond', 
    'disciple growth', 'cozy / slice-of-life cultivation', 'farming', 'food', 'healing', 'village bonds', 
    'low-stakes daily progress', 'spiritual bond cultivation', 'romantic tension', 'adult-only double cultivation politics'
  ],
  'Fate & Karmic Bonds': [
    'karmic bonds', 'soul bonds', 'fate bonds', 'destiny recovery', 'lost fate', 'stolen fate', 
    'fate theft', 'fate repair', 'prophecy tracking', 'chosen one pressure', 'antihero rise', 
    'villain redemption', 'revenge spiral', 'mercy consequences', 'moral debt', 'blood debt', 
    'favor debt', 'life debt', 'oath tracking', 'promise tracking', 'curse tracking', 'blessing systems', 
    'divine contracts', 'spirit contracts', 'found family', 'sworn brotherhood', 'regression/reincarnation', 
    'second chances', 'future knowledge', 'fate correction', 'revenge through preparation'
  ],
  'Exploration & Dungeons': [
    'map expansion', 'ancient ruins', 'secret realms', 'sect rankings', 'arena rankings', 'tower climbs', 
    'dungeon systems', 'loot economy', 'crafting systems', 'alchemy systems', 'forging systems', 
    'enchantment systems', 'summoning systems', 'monster evolution', 'pet evolution', 'party roles', 
    'raid mechanics', 'boss mechanics', 'player factions', 'NPC memory', 'NPC agendas', 'quest chains', 
    'hidden quests', 'world events', 'tutorial systems', 'safe zones', 'guild ranks', 'crafting/alchemy', 
    'pill refinement', 'weapon forging', 'talisman design', 'artifact economy', 'beast-taming / monster evolution', 
    'bonded beasts', 'bloodline awakenings', 'companion growth', 'beast sect politics', 'dungeon/tower climb', 
    'floor bosses', 'trial rooms', 'loot systems', 'ancient tower rankings'
  ],
  'Urban & Modern': [
    'urban cultivation', 'hidden society', 'corporate clans', 'district control', 'celebrity vessels', 
    'debt curses', 'apartment spirits', 'subway realms', 'convenience spirits', 'hunter rankings', 
    'gate outbreaks', 'tower gates', 'awakened citizens', 'association politics', 'media pressure', 
    'viral reputation', 'idol factions', 'chaebol clans', 'underworld sects', 'modern artifacts', 
    'phone talismans', 'contract rewriting', 'spiritual real estate', 'urban territory', 'revenge climb', 
    'social status growth', 'family pressure', 'urban/modern cultivation', 'hidden sects in modern cities', 
    'spiritual black markets', 'apocalypse cultivation', 'ruined worlds', 'survival camps', 'mutated beasts', 
    'broken heavenly laws', 'cosmic cultivation', 'star realms', 'planetary sects', 'void beasts', 'galactic inheritances'
  ],
  'Academy & Training': [
    'school hierarchy', 'academy rankings', 'exam arcs', 'tournament arcs', 'rival schools', 
    'student factions', 'teacher politics', 'discipline systems', 'training schedules', 'mission boards', 
    'campus secrets', 'forbidden libraries', 'trial grounds', 'academy cultivation', 'sect schools', 
    'class rankings', 'exams', 'rival dorms', 'hidden instructors'
  ],
  'Meta & Continuity': [
    'emotional continuity', 'long-term consequences', 'recap tracking', 'arc continuity', 'chapter memory', 
    'side plot tracking', 'recurring enemies', 'recurring allies', 'background wars', 'offscreen growth', 
    'offscreen schemes', 'delayed payoffs', 'mystery clues', 'foreshadowing', 'hidden identities', 
    'secret bloodlines', 'sealed memories', 'lost history', 'ancient grudges', 'regional politics', 
    'cultural tension', 'religious pressure', 'mythic history', 'living codex', 'dynamic portraits', 
    'relationship web', 'threat colors', 'faction colors', 'character status', 'world state', 
    'story momentum', 'reader hooks', 'arc escalation', 'plot persistence', 'continuity guardrails', 
    'trope control', 'tone control', 'pacing control', 'stakes escalation', 'chapter consequences',
    'mystery cultivation', 'forbidden cases', 'cursed relics', 'hidden murders', 'ancient sealed truths'
  ]
};

export const TAG_PRESETS = Array.from(new Set(Object.values(CATEGORIZED_TAGS).flat()));

// `Fate Survival` is deliberately absent: it is an experience layer owned by
// the Story Settings feature, not a genre a novel can be written in.
export const GENRE_PRESETS = [
  { id: 'Xianxia', name: 'Xianxia', icon: '⚔️' },
  { id: 'Xuanhuan', name: 'Xuanhuan', icon: '🔥' },
  { id: 'LitRPG / System', name: 'System', icon: '⚡' },
  { id: 'Academy Cultivation', name: 'Academy Cultivation', icon: '🏫' },
  { id: 'Kingdom Building', name: 'Kingdom Building', icon: '🏰' },
  { id: 'Crafting / Alchemy', name: 'Crafting/Alchemy', icon: '🧪' },
  { id: 'Beast Taming', name: 'Beast Taming', icon: '🐾' },
  { id: 'Tower Climb', name: 'Tower Climb', icon: '🗼' },
  { id: 'Regression', name: 'Regression', icon: '⏳' },
  { id: 'Urban Cultivation', name: 'Urban Cultivation', icon: '🌃' },
  { id: 'Apocalypse Cultivation', name: 'Apocalypse', icon: '☣️' },
  { id: 'Cosmic Cultivation', name: 'Cosmic', icon: '🌌' },
  { id: 'Political Intrigue', name: 'Political Intrigue', icon: '👑' },
  { id: 'Cozy Slice-of-Life', name: 'Cozy/Slice-of-Life', icon: '🏡' },
  { id: 'Mystery Cultivation', name: 'Mystery', icon: '🔍' }
];

export const PREMISE_SUGGESTIONS = [
  "In seven chapters, the prince will be assassinated. Every timeline says he dies. Can you change fate before it happens?",
  "Awakening a mysterious black tripod cauldron inside the family trash heap that grinds low-grade herbs into peerless tier-9 celestial elixirs.",
  "Dying in a grand sect betrayal only to regress 10 years to the moment of spiritual root measurement, choosing the forbidden Demonic Scripture.",
  "The world gets integrated into a cosmic tower system, but a bug grants me a hidden attribute: Infinite Comprehension Speed index.",
  "A quiet apprentice librarian finds a forgotten manual containing the diary of the first Primordial Creator, which talks back and demands snacks.",
  "Being the cripple son of a great General who finds out his 'broken' meridians are actually the legendary ancient Dragon-Phoenix Meridian body.",
  "Entering the lowest class ranking at the Grand Azure Sect Academy, only to unlock a hidden library containing direct instructions of the founder.",
  "Inheriting a ruined outer-city outpost with scarce resources, but the territory system displays interactive menus for automation.",
  "Born as an ordinary stable boy in the Beast Taming Sect, but awakening the ability to read hidden beast evolutionary bloodline trees.",
  "Failing the martial exam but discovering an ancient forge blueprint that allows infusing weapons with broken fragments of heavenly laws.",
  "Waking up on a barren moon as the sole survivor of a dying stellar sect with an cosmic stellar inheritance diagram in my soul."
];

/**
 * Curated system premise examples for the Origin page, keyed by novel
 * tradition (`shared/storyStyle.ts`). While the premise field is empty, one
 * example from the selected Style's bank is shown as ghost text inside the
 * field (the textarea placeholder) to teach the SEN premise style: short,
 * sharp, high-concept hooks with light-novel/webnovel energy — one strange
 * story engine, one escalation promise; never a full synopsis, a paragraph,
 * or a lore dump. Static list: no AI call, no storage. The example becomes
 * real text only when the user presses Tab in the empty field, so user-typed
 * text is never overwritten. (A future user-saved premise bank is a separate
 * feature and is not built from this list.)
 */
export const CURATED_PREMISE_EXAMPLES: Record<StoryStyle, string[]> = {
  chinese: [
    "I Bound the Ruined World's Divine Monsters and Raised Them into Calamities.",
    'I Accidentally Founded a Sect That Ruled the Nine Heaven Realms.',
    'My Broken Meridians Were Actually Seals on an Ancient Calamity God.',
    'I Failed My Heavenly Tribulation, So the Lightning Became My Master.',
    "A Nameless Herb Spirit Cultivated for Ten Thousand Years and Bloomed into Heaven's Cure.",
    "I Inherited a Dead Sect's Library, and the Forbidden Manuals Started Teaching Themselves.",
    'The Young Masters Mocked My Mortal Body Until My Bloodline Remembered the First Immortal.',
  ],
  korean: [
    "I Died as an F-Rank Porter and Regressed as the Tutorial Tower's Hidden Boss.",
    'The Constellations Abandoned Humanity, So the Weakest Hunter Started Sponsoring Monsters.',
    "I Cleared the World's Worst Dungeon by Refusing Every System Quest.",
    'After My Guild Betrayed Me, My Trash Skill Evolved Every Time I Was Killed.',
    'I Was the Last Ranker Alive, So the Tower Sent Me Back to Floor One.',
    'The Gods Streamed My Death for Entertainment, Until My Revenge Became the Main Scenario.',
    'I Bought a Failed Dungeon at Auction and Turned It into the Strongest Hunter Academy.',
  ],
  japanese: [
    "I Reincarnated as the Demon King's Weakest Familiar, but Everyone Thinks I'm the Ancient Hero.",
    'I Was Banished from the Hero Party, Then My Cooking Skill Started Evolving Monsters.',
    'The Weakest Slime in Dungeon Academy Accidentally Built a Monster Kingdom.',
    'I Wanted a Slow Life, but My Farm Keeps Producing Legendary Beasts.',
    'My Useless Support Magic Makes Everyone I Help Obsessed with Protecting Me.',
    'I Opened a Tiny Potion Shop, and the Demon Lord Became My First Regular Customer.',
  ],
};

// Style presets are no longer defined here: Style is the novel tradition
// (Chinese / Korean / Japanese), a closed set owned by `shared/storyStyle.ts`.
