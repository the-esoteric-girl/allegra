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

- Move notes are stored in the move_notes table
  (id, move_id, text, session_id, created_at)
- Never write to moves.notes — that column is dropped
- To add a note: addMoveNote(moveId, text, sessionId)
- To read notes: fetchMoveNotes(moveId) — returns
  array ordered newest first
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
Font: Plus Jakarta Sans (Google Fonts)
Import: @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap')

Colours:
--color-bg: #F4F5FA (page background)
--color-surface: #FFFFFF (card background)
--color-surface-blue: #E8EEFF (airy blue surface, search bars, selected states)
--color-blue: #6B7AE8 (primary accent — active nav, status dots, decorative)
--color-blue-btn: #4D5EC7 (buttons with white text — AA contrast ~4.8:1)
--color-pink: #EE90CC (secondary accent — want to try, subtle highlights)
--color-green: #5DC48A (achieved status only)
--color-text-primary: #1A1B2E
--color-text-secondary: #6E708E (AA compliant ~4.6:1 on light bg)
--color-text-muted: #B8BAD0

Dark mode: handled via @media (prefers-color-scheme: dark) in index.css
Dark mode text-secondary: #8B8DAA (AA compliant on dark bg)

Status colours:
achieved → --color-green
working on → --color-blue
want to try → --color-pink

Buttons with white text → use --color-blue-btn (not --color-blue)
Decorative/surface uses (dots, pills, active state rings) → use --color-blue

Cards: white surface, var(--shadow-card), no border, border-radius var(--radius-lg)

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
