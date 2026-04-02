# Allegra — Claude Code Guide

## What this app is

Allegra is a pole dancing move tracker app built
by a pole dancer for pole dancers. Users can log
moves, track progress, build combos, and add notes.
It is designed as a portfolio project with a
real-world use case.

## Tech stack

- React (Vite)
- React Router DOM for navigation
- Supabase for database (PostgreSQL)
- Lucide React for icons
- Plain CSS for styling (no Tailwind yet)

## File structure

src/
components/ shared UI components
context/ AppContext.jsx — global state and Supabase calls
hooks/ custom hooks (useApp.js lives here)
pages/ Library.jsx, MoveDetail.jsx, Combos.jsx, You.jsx
lib/ supabase.js — Supabase client

## Database tables (Supabase)

moves

- id: uuid (primary key)
- name: text
- aliases: text[] (array of alternate names)
- status: text — "want to try" | "working on" | "achieved"
- parent_move_id: uuid (self-referencing, for variations)
- note: text (single note field per move, default empty string)

combos

- id: uuid (primary key)
- name: text
- move_ids: uuid[] (ordered array of move ids)
- notes: text

transitions

- id: uuid (primary key)
- from_move_id: uuid
- to_move_id: uuid
- notes: text
- bidirectional: boolean (default true)

## Key conventions

- Always import useApp from src/context/useApp.js
  not from AppContext.jsx
- All Supabase calls live in AppContext.jsx only —
  never call Supabase directly from components or pages
- Use React Router NavLink for navigation items
  that need active states
- Use useNavigate for programmatic navigation
- Move status values are always lowercase strings:
  "want to try", "working on", "achieved"
- Note datestamp format: [Mar 25] for current year,
  [Mar 25, 2025] for previous years
- Aliases are always stored in title case
- IDs are uuids from Supabase, never integers

## Navigation structure

/ — Library page (Move list, search, filter)
/move/:id — Move Detail page
/combos — Combos page
/you — You page
Log — bottom sheet modal triggered from nav bar,
not a route

## Bottom navigation

Library (BookOpen icon) → /
Log (PlusCircle icon) → opens LogModal
Combos (Layers icon) → /combos
You (User icon) → /you

## Move status system

want to try — move is on the wishlist
working on — actively drilling this move
achieved — can do this move

## Notes system

- Move notes are a single text field on the moves table
- Read: move.note
- Write: updateMove(moveId, { note: text }) or
  updateMove(moveId, { note: null }) to clear
- Session notes are a separate field on the sessions
  table and are unrelated to move notes

## Known issues / deferred decisions

- Library search resets on back navigation
  Fix: store filter state in AppContext or use
  URL search params
- True/twisted grip treated as grip types in v1,
  may need modifier field in v2
- No images in v1 — well designed cards carry
  content without them
- Transitions bidirectional by default —
  validate in user interviews

## Design principles

- Athletic and artistic — the aesthetic should
  reflect pole dancing, not generic fitness
- Low friction — logging after class should be fast
- Community accurate — uses real pole terminology
  and move names
- Encouraging — language should feel positive
  (working on not attempted)

## Design system

Font: Plus Jakarta Sans
Import: Google Fonts (already in index.css)

Colour variables (all in index.css):
  Surfaces: --color-surface, --color-bg,
            --color-surface-blue, --color-light-blue,
            --color-light-pink
  Brand: --color-blue, --color-blue-btn,
         --color-pink, --color-orange
  Borders: --color-border-subtle, --color-border
  Text: --color-text-primary, --color-text-secondary,
        --color-text-muted, --color-text-placeholder

Status colours (IMPORTANT):
  achieved   = blue  → --color-achieved: var(--color-blue)
  working on = orange → --color-working: var(--color-orange)
  want to try = pink  → --color-want: var(--color-pink)
  Each status has -bg and -text variants

Spacing: --space-1 (4px) through --space-6 (24px)
Radius: --radius-sm (8px), --radius-md (10px),
        --radius-lg (14px), --radius-xl (20px),
        --radius-pill (999px)
Shadows: --shadow-card, --shadow-card-hover,
         --shadow-sheet

## UI component library

All shared UI components live in src/components/ui/
Import from: import { Button, Card, Input } from '../components/ui'

Components:
  StatusDot    — coloured dot for move status
  StatusPill   — dot + label for move status
  Button       — primary | secondary | subtle | ghost
  Pill         — filter pill, active/inactive states
  Card         — white surface card with shadow
  Input        — text input or textarea, blue surface bg
  SectionLabel — uppercase muted label
  Divider      — horizontal rule
  IconButton   — circular icon button
  BottomSheet  — modal sheet that slides up from bottom

Never hardcode colour values in component files.
Always use CSS variables from index.css.
Always add id and name to form elements.

## What is NOT in v1

- User accounts / auth
- Images or video on moves
- Recommendations engine
- PSO levels
- Difficulty and category fields on moves
  (planned for v2)
- Floorwork as a category

## Case study context

This app was built after competitive analysis showed:

- Existing pole move sites are outdated and
  reference-only (Pole Move Book, PolePedia)
- The only tracking app (Pole Moves App) has
  fragmented UX and generic design
- No well-designed tool combines community depth
  with personal progress tracking
  The app name Allegra is named after an advanced
  pole move — recognisable to the community,
  beautiful to everyone else.
