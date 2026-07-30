# SEIHouse Codebase Conventions Skill

A reusable orientation skill for coding agents working in SEIHouse repositories.

## Purpose

This skill defines what “use existing SEIHouse systems” means. It helps agents map requests involving the Library/SEN into the repository’s current architecture before editing, reducing duplicate systems, misplaced logic, accidental migration regressions, and repeated context discovery.

## Install

The skill is already installed in this repository under `skills/seihouse-codebase-conventions/` and exposed through `.agents/skills.json`.

## Required use

Read this skill before any implementation in this repository. It is especially important for unfamiliar SEIHouse implementation tasks, cross-layer bugs, architecture or persistence changes, and work involving Reader Chamber, Codex, generation, Library sync, media, rewards, themes, or profiles.

This skill complements performance, layout, design, translation, and communication skills. Those skills decide how to improve a surface; this one establishes where the change belongs and which existing contracts must be preserved.
