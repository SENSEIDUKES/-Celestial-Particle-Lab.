import React, { useEffect, useState } from 'react';
import { Feather, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { IntakeData } from '../../shared/types';
import { PREMISE_SUGGESTIONS, TAG_PRESETS } from '../constants';
import { getSeedSection } from '../seedSections';
import { GuidanceNote, WorkspaceShell } from './WorkspaceShell';

interface PremiseWorkspaceProps {
  intake: IntakeData;
  updateIntake: (field: keyof IntakeData, value: any) => void;
}

/**
 * Required Story workspace: the core premise. Keeps the Phase 1 ghost-tag
 * autocomplete (press Tab or click to weave a suggested tag into Story Tags)
 * and the numbered premise suggestions.
 */
export const PremiseWorkspace = ({ intake, updateIntake }: PremiseWorkspaceProps) => {
  const section = getSeedSection('premise');
  const [ghostSuggestion, setGhostSuggestion] = useState<string | null>(null);

  // Smart ghost-tag autocomplete suggestions
  useEffect(() => {
    const text = intake.corePremise || '';
    const activeTags = intake.storyTags || [];

    if (!text.trim() || activeTags.length >= 20) {
      setGhostSuggestion(null);
      return;
    }

    // 1. Try to find a tag being actively typed as a prefix at the end of the input
    const lastWordMatch = text.split(/[\s,.;!?]+/).filter(Boolean).pop();
    if (lastWordMatch && lastWordMatch.length >= 2) {
      const prefix = lastWordMatch.toLowerCase();
      const prefixMatch = TAG_PRESETS.find(tag =>
        tag.toLowerCase().startsWith(prefix) &&
        !activeTags.includes(tag)
      );
      if (prefixMatch) {
        setGhostSuggestion(prefixMatch);
        return;
      }
    }

    // 2. Try semantic mapping of keywords in the entire prompt text
    const lowerText = text.toLowerCase();
    const SEMANTIC_KEYWORD_MAP = [
      { keywords: ['system', 'cheat', 'status', 'panel', 'attribute', 'litrpg'], tag: 'game systems' },
      { keywords: ['level', 'progression', 'exp', 'grow', 'ladder', 'rank'], tag: 'level progression' },
      { keywords: ['cultivat', 'meridian', 'dantian', 'qi ', 'immortal', 'spirit root'], tag: 'cultivation realms' },
      { keywords: ['regress', 'return', 'back in time', 'years ago', 'loop', 'timeline'], tag: 'regression/reincarnation' },
      { keywords: ['reincarnat', 'reborn', 'transmigrat', 'isekai', 'another world'], tag: 'reincarnation rules' },
      { keywords: ['academy', 'school', 'sect school', 'dorm', 'class', 'rankings', 'exam'], tag: 'academy cultivation' },
      { keywords: ['sect', 'clan', 'faction', 'disciple', 'elder', 'patriarch'], tag: 'sect politics' },
      { keywords: ['kingdom', 'build', 'territory', 'village', 'town', 'lord', 'ruler'], tag: 'kingdom building' },
      { keywords: ['alchem', 'pill', 'cauldron', 'elixir', 'herb', 'refine'], tag: 'pill refinement' },
      { keywords: ['forge', 'weapon', 'sword', 'artifact', 'hammer', 'craft'], tag: 'weapon forging' },
      { keywords: ['tame', 'beast', 'monster', 'pet', 'animal', 'dragon', 'phoenix'], tag: 'bonded beasts' },
      { keywords: ['tower', 'dungeon', 'floor', 'boss', 'raid', 'climb'], tag: 'dungeon/tower climb' },
      { keywords: ['intrigue', 'noble', 'politics', 'court', 'emperor', 'prince', 'king'], tag: 'political intrigue' },
      { keywords: ['marry', 'marriage', 'romance', 'love', 'wife', 'husband', 'bride', 'groom'], tag: 'arranged marriage' },
      { keywords: ['enemies', 'lovers', 'hate', 'rivals to lovers'], tag: 'enemies to lovers' },
      { keywords: ['death', 'die', 'assassinate', 'doom', 'kill', 'murder'], tag: 'death flags' },
      { keywords: ['curse', 'cursed', 'blessing', 'hex'], tag: 'curse tracking' },
      { keywords: ['fate', 'destiny', 'karma', 'karmic', 'fated'], tag: 'fate bonds' },
      { keywords: ['apocalypse', 'zombie', 'collapse', 'ruin', 'camp', 'survival'], tag: 'apocalypse cultivation' },
      { keywords: ['space', 'star', 'galaxy', 'cosmic', 'void', 'moon', 'stellar'], tag: 'cosmic cultivation' },
      { keywords: ['cozy', 'slice of life', 'slice-of-life', 'slow life', 'peaceful', 'farm'], tag: 'cozy / slice-of-life cultivation' },
      { keywords: ['betray', 'backstab', 'trust', 'allies', 'alliance'], tag: 'betrayal fallout' },
      { keywords: ['rebellion', 'rebel', 'war', 'army', 'battle', 'soldier', 'siege'], tag: 'military strategy' },
      { keywords: ['slow burn', 'slow-burn'], tag: 'slow-burn romance' }
    ];

    for (const mapping of SEMANTIC_KEYWORD_MAP) {
      if (!activeTags.includes(mapping.tag)) {
        if (mapping.keywords.some(keyword => lowerText.includes(keyword))) {
          if (TAG_PRESETS.includes(mapping.tag)) {
            setGhostSuggestion(mapping.tag);
            return;
          }
        }
      }
    }

    // 3. Fallback: check if any tag from TAG_PRESETS is directly mentioned in the premise text
    const mentionedTag = TAG_PRESETS.find(tag =>
      lowerText.includes(tag.toLowerCase()) &&
      !activeTags.includes(tag)
    );
    if (mentionedTag) {
      setGhostSuggestion(mentionedTag);
      return;
    }

    setGhostSuggestion(null);
  }, [intake.corePremise, intake.storyTags]);

  const handleAddGhostTag = (tag: string) => {
    if ((intake.storyTags || []).length >= 20) return;
    updateIntake('storyTags', (previous: string[] = []) =>
      previous.includes(tag) ? previous : [...previous, tag]);
    setGhostSuggestion(null);
  };

  return (
    <WorkspaceShell section={section} complete={Boolean(intake.corePremise?.trim())}>
      <div>
        <div className="mb-2 flex items-end justify-between">
          <label htmlFor="core-premise-input" className="block font-sc text-xs uppercase tracking-widest text-neutral-400">
            Core Premise / Secret Catalyst
          </label>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-neutral-500">{(intake.corePremise || '').length} / 3000</span>
          </div>
        </div>
        <div className="glass-field-wrap">
          <Feather size={15} aria-hidden="true" className="glass-field-icon top-[1rem]" />
          <textarea
            id="core-premise-input"
            required
            maxLength={3000}
            value={intake.corePremise || ''}
            onChange={(e) => updateIntake('corePremise', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Tab' && ghostSuggestion) {
                e.preventDefault();
                handleAddGhostTag(ghostSuggestion);
              }
            }}
            rows={5}
            placeholder="The main hook or cheat..."
            data-complete={Boolean(intake.corePremise?.trim()) || undefined}
            className="glass-field resize-none p-3 pb-10 pl-10 pr-10 text-sm"
          />
          <AnimatePresence>
            {ghostSuggestion && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.95, y: 2 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 2 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleAddGhostTag(ghostSuggestion)}
                className="absolute bottom-2.5 right-2.5 flex min-w-0 max-w-[80%] cursor-pointer items-center gap-1.5 rounded-lg border border-portal/40 bg-[#0b0e1e]/90 px-2.5 py-1 font-mono text-[10px] tracking-wider text-portal shadow-[0_0_12px_rgba(4,172,255,0.15)] transition-all hover:border-portal hover:text-signal hover:shadow-[0_0_18px_rgba(4,172,255,0.3)] sm:max-w-full"
                title="Click or press Tab to weave this tag into your Story Tags"
              >
                <Sparkles size={11} className="animate-pulse text-portal" />
                <span className="truncate">Tab: {ghostSuggestion}</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div>
        <p className="mb-2 block font-sc text-xs uppercase tracking-widest text-neutral-400">
          Need a spark? Start from a proven hook
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PREMISE_SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => updateIntake('corePremise', suggestion)}
              title={suggestion}
              className="rounded border border-neutral-900 bg-neutral-950 px-2 py-1 font-mono text-[10px] text-neutral-400 transition-colors hover:border-portal/50 hover:text-portal"
            >
              #{idx + 1}
            </button>
          ))}
        </div>
        <p className="mt-2 font-sans text-[11px] leading-relaxed text-neutral-600">
          Hover a number to preview the hook; select one to make it your premise, then reshape it freely.
        </p>
      </div>

      <GuidanceNote title="How the premise helps">
        The premise is the single promise the Library builds the universe around — the cheat, secret, or
        countdown every arc bends back to. A sharp premise produces a sharper world, antagonist, and first arc.
      </GuidanceNote>
    </WorkspaceShell>
  );
};
