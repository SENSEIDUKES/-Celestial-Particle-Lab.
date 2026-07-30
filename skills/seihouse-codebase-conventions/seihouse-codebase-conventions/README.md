# SEIHouse Codebase Conventions Skill

A reusable orientation skill for coding agents working in SEIHouse repositories.

## Purpose

This skill defines what “use existing SEIHouse systems” means. It helps agents map
requests involving the Library/SEN into the repository’s current architecture before
editing, reducing duplicate systems, misplaced logic, accidental migration regressions,
and repeated context discovery.

## Install

Copy the `seihouse-codebase-conventions` folder into the skills directory supported by
your coding tool. Keep `SKILL.md` beside the `references` folder.

## Recommended use

Allow automatic activation from the skill description, or invoke it explicitly before:

- unfamiliar SEIHouse implementation tasks;
- cross-layer bugs;
- architecture or persistence changes;
- work involving Reader Chamber, Codex, generation, Library sync, media, rewards, themes,
  or profiles;
- tasks that say to reuse existing SEIHouse components or systems.

This skill complements performance, layout, design, translation, and communication
skills. Those skills decide how to improve a surface; this one establishes where the
change belongs and which existing contracts must be preserved.
