# Allegra — Claude Code Guide

## What this app is

Allegra is a pole dancing move tracker app built
by a pole dancer for pole dancers. Users can log
moves, track progress, build combos, and add notes.
It is designed as a portfolio project with a
real-world use case.

## Quick reference
- Stack: React + Vite, Supabase, CSS Modules,
  Plus Jakarta Sans
- Import useApp from src/hooks/useApp.js always
- All Supabase calls in AppContext only
- Never hardcode colours — use CSS variables
- All form fields need id and name attributes
- Input focus: box-shadow not border

## Docs index
- Architecture & components: docs/architecture.md
- Design system & tokens: docs/design-system.md
- Component library: docs/components.md
- Database & AppContext: docs/database.md
- Navigation & routes: docs/navigation.md
- Key decisions: docs/decisions.md

## Plan before building
Before writing any code, plan with the user.
Consider component architecture, shared patterns,
future scalability, and edge cases first.
Flag when something should be a shared component.
Flag when a shortcut will create technical debt.
