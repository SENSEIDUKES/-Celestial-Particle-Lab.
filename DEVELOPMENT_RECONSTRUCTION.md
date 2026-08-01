# Development Reconstruction Policy

This repository is allowed to become the place where major SEN systems are rebuilt properly—not only visually rearranged.

## Core decision

When a feature is receiving a major structural rework, build the new version correctly inside this repository.

Do **not** bulk-copy the entire old backend from `SENSEIDUKES/Light-Novels` merely to preserve and rearrange the old architecture.

Production remains the working reference. Coding agents are responsible for inspecting it and reusing or adapting whatever proven wiring is needed to make the new system work.

The owner defines the intended product behavior. The owner is **not** responsible for identifying backend files, services, keys, routes, schemas, helpers, or connection logic for the agent.

## What agents may change

Agents may freely reshape development-only application architecture, including:

- product flows and feature boundaries
- frontend and backend logic
- API contracts and generation pipelines
- state management and persistence models
- Postgres schemas, tables, migrations, and development data
- old compatibility code that no longer serves the redesigned system

Temporary breakage inside development is acceptable while a major system is actively being reconstructed.

## What agents must protect

Major reconstruction must not carelessly destroy the difficult infrastructure that already works.

Agents must preserve or correctly reuse the existing ability to:

- authenticate through the configured authentication system
- connect to Postgres
- upload generated media to Cloudflare R2
- retrieve persisted media after reload
- store and reload generated stories, chapters, images, and other real application content
- use the repository's existing environment configuration, secrets, and service bindings

Agents must not require the owner to hunt down, recreate, or manually reconnect credentials and infrastructure that already exist.

Production data and production infrastructure must not be modified unless the task explicitly authorizes production changes.

## How to rebuild a feature

For a major redesign:

1. Follow the newly approved product flow rather than preserving the old architecture by default.
2. Inspect `SENSEIDUKES/Light-Novels` for any working authentication, Postgres, R2, persistence, authorization, or generation behavior the feature needs.
3. Reuse or adapt only the useful working pieces required by the new system.
4. Build the new wiring inside development and make the feature work end to end.
5. Verify the protected capability actually works when the task is complete.

Do not make the owner map the old backend before implementation. Discovering and adapting the necessary wiring is part of the coding task.

## Simple rule

**Rebuild the product workflow. Reuse the hard working connections. Do not blindly reproduce the old backend.**
