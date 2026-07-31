/**
 * Static score catalog lifted verbatim from production
 * `src/lib/audio/musicResolver.ts` (`TRACK_LIBRARY`), kept so the Audio
 * Menu's track picker renders the real catalog. Playback is inert in the
 * Workshop — these URLs are display data only, never fetched.
 */

export interface SceneAudioTrack {
  id: string;
  mood: string;
  moods: string[];
  tags: string[];
  url: string;
  isPremium: boolean;
}

// The Celestial Library
const CDN = 'https://celestialaudio.seihouse.org/AUDIO';

export const TRACK_LIBRARY: SceneAudioTrack[] = [
  // --- Adventure (default bed) ---
  { id: 'ADVENTURE_4_BANISHED', mood: 'adventure', moods: ['adventure', 'tribulation'], tags: ['banished', 'exile', 'journey', 'wilderness'], url: `${CDN}/ADVENTURE/ADVENTURE_4_BANISHED.wav`, isPremium: false },
  { id: 'ADVENTURE_LEVELING_UP', mood: 'adventure', moods: ['adventure', 'excitement'], tags: ['training', 'growth', 'breakthrough', 'level-up', 'cultivation'], url: `${CDN}/ADVENTURE/ADVENTURE_LEVELING_UP.mp3`, isPremium: false },
  { id: 'ADVENTURE_MARKET', mood: 'adventure', moods: ['adventure', 'excitement'], tags: ['market', 'city', 'town', 'crowd', 'festival', 'trade'], url: `${CDN}/ADVENTURE/ADVENTURE_MARKET.mp3`, isPremium: false },
  { id: 'ADVENTURE_TRAVLING', mood: 'travel', moods: ['travel', 'adventure'], tags: ['travel', 'road', 'journey', 'caravan'], url: `${CDN}/ADVENTURE/ADVENTURE_TRAVLING.wav`, isPremium: false },
  { id: 'MYSTICAL_ELF', mood: 'mystical', moods: ['mystical', 'adventure', 'mystery'], tags: ['forest', 'elf', 'magic', 'spirit', 'ancient'], url: `${CDN}/ADVENTURE/MYSTICAL_ELF.wav`, isPremium: false },

  // --- Ambient (default bed) ---
  { id: 'AMBEINT_NIGHT', mood: 'ambient', moods: ['ambient', 'serenity'], tags: ['night', 'rest', 'camp', 'stars', 'quiet'], url: `${CDN}/AMBIENT/AMBEINT_NIGHT.wav`, isPremium: false },
  { id: 'AMBEINT_TRUIMPH', mood: 'triumph', moods: ['triumph', 'ambient'], tags: ['victory', 'celebration', 'aftermath'], url: `${CDN}/AMBIENT/AMBEINT_TRUIMPH.wav`, isPremium: false },
  { id: 'AMBIENT_GOOD_DAY', mood: 'serenity', moods: ['serenity', 'ambient'], tags: ['morning', 'peaceful', 'day', 'village', 'home'], url: `${CDN}/AMBIENT/AMBIENT_GOOD_DAY.wav`, isPremium: false },
  { id: 'AMBIENT_HISTORY', mood: 'mystery', moods: ['mystery', 'ambient', 'mystical'], tags: ['lore', 'history', 'flashback', 'library', 'ruins'], url: `${CDN}/AMBIENT/AMBIENT_HISTORY.mp3`, isPremium: false },
  { id: 'AMBIENT_STARTER', mood: 'ambient', moods: ['ambient', 'serenity'], tags: ['default', 'opening', 'beginning'], url: `${CDN}/AMBIENT/AMBIENT_STARTER.mp3`, isPremium: false },

  // --- Emotions (gated) ---
  { id: 'LIGHT_NOVEL_TENSION_1', mood: 'tension', moods: ['tension', 'dread', 'horror'], tags: ['suspense', 'stalking', 'threat'], url: `${CDN}/EMOTIONS/LIGHT_NOVEL_TENSION_1.mp3`, isPremium: false },
  { id: 'LIGHT_NOVEL_TENSION_2', mood: 'tension', moods: ['tension', 'dread', 'horror'], tags: ['suspense', 'confrontation', 'standoff'], url: `${CDN}/EMOTIONS/LIGHT_NOVEL_TENSION_2.mp3`, isPremium: false },
  { id: 'ROMANCE_LOVERS', mood: 'romance', moods: ['romance'], tags: ['love', 'confession', 'reunion'], url: `${CDN}/EMOTIONS/ROMANCE_LOVERS.wav`, isPremium: false },
  { id: 'SAD_LOST_OPPORUNIRTY', mood: 'sad', moods: ['sad'], tags: ['loss', 'regret', 'farewell', 'grief'], url: `${CDN}/EMOTIONS/SAD_LOST_OPPORUNIRTY.wav`, isPremium: false },
  { id: 'TIRED_DEFEATED', mood: 'tired', moods: ['tired', 'sad'], tags: ['defeat', 'exhaustion', 'low-point'], url: `${CDN}/EMOTIONS/TIRED_DEFEATED.mp3`, isPremium: false },
  { id: 'TRAGEDY_RECOVERY', mood: 'tragedy', moods: ['tragedy', 'sad'], tags: ['death', 'mourning', 'recovery', 'aftermath'], url: `${CDN}/EMOTIONS/TRAGEDY_RECOVERY.mp3`, isPremium: false },

  // --- Fighting (gated) ---
  { id: 'FIGHTING_DANGER', mood: 'fighting', moods: ['fighting'], tags: ['ambush', 'danger', 'beast', 'survival'], url: `${CDN}/FIGHTING/FIGHTING_DANGER.wav`, isPremium: false },
  { id: 'FIGHTING_RIVAL_Apperance', mood: 'duel', moods: ['duel', 'fighting'], tags: ['rival', 'challenge', 'face-off'], url: `${CDN}/FIGHTING/FIGHTING_RIVAL_Apperance.mp3`, isPremium: false },
  { id: 'FIGHTING_TOURNAMENT_BEGIN', mood: 'fighting', moods: ['fighting', 'duel'], tags: ['tournament', 'arena', 'crowd'], url: `${CDN}/FIGHTING/FIGHTING_TOURNAMENT_BEGIN.mp3`, isPremium: false },
  { id: 'FIGHTING_TOURNAMENT_FINAL', mood: 'fighting', moods: ['fighting', 'duel'], tags: ['tournament', 'final', 'arena', 'climax'], url: `${CDN}/FIGHTING/FIGHTING_TOURNAMENT_FINAL.mp3`, isPremium: false },
  { id: 'LIGHT_NOVEL_BOSS_FIGHT_1_FINAL_BOSS', mood: 'boss-fight', moods: ['boss-fight'], tags: ['boss', 'final', 'climax', 'desperate'], url: `${CDN}/FIGHTING/LIGHT_NOVEL_BOSS_FIGHT_1_FINAL_BOSS.mp3`, isPremium: false },

  // --- War (gated, strictest) ---
  { id: 'WAR_1', mood: 'war', moods: ['war'], tags: ['battlefield', 'army', 'siege', 'march'], url: `${CDN}/WAR/WAR_1.mp3`, isPremium: false },
  { id: 'WAR_LOSES', mood: 'war', moods: ['war', 'tragedy'], tags: ['defeat', 'retreat', 'loses', 'aftermath'], url: `${CDN}/WAR/WAR_LOSES.wav`, isPremium: false },
];
