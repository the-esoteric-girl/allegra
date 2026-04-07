# Database & AppContext

## Import rule

Always import `useApp` from `src/hooks/useApp.js`, never from AppContext directly:

```js
import { useApp } from '../hooks/useApp'   // correct
import { useApp } from '../context/AppContext'  // wrong
```

All Supabase calls live in `AppContext.jsx` only — never call Supabase
directly from components or pages.

---

## Supabase tables

### moves

| Column         | Type      | Notes                                              |
|----------------|-----------|----------------------------------------------------|
| id             | uuid      | primary key                                        |
| name           | text      | —                                                  |
| aliases        | text[]    | array of alternate names, stored in title case     |
| status         | text      | "want to try" \| "working on" \| "achieved"        |
| parent_move_id | uuid      | self-referencing FK for variations (nullable)      |
| note           | text      | single note field, default empty string            |
| user_id        | uuid      | nullable; user-created/custom moves set owner id   |

### combos

| Column    | Type   | Notes                              |
|-----------|--------|------------------------------------|
| id        | uuid   | primary key                        |
| name      | text   | nullable                           |
| move_ids  | uuid[] | ordered array of move ids          |
| notes     | text   | nullable                           |
| created_at| timestamp | auto-set by Supabase            |

### sessions

| Column | Type   | Notes                     |
|--------|--------|---------------------------|
| id     | uuid   | primary key               |
| date   | date   | ISO date string YYYY-MM-DD|
| notes  | text   | session-level notes       |

### session_entries

| Column          | Type    | Notes                                           |
|-----------------|---------|-------------------------------------------------|
| id              | uuid    | primary key                                     |
| session_id      | uuid    | FK → sessions.id                                |
| move_id         | uuid    | FK → moves.id                                   |
| previous_status | text    | status before this session                      |
| new_status      | text    | status after this session                       |
| notes_added     | boolean | whether a note was written during the session   |

### transitions

| Column        | Type    | Notes                          |
|---------------|---------|--------------------------------|
| id            | uuid    | primary key                    |
| user_id       | uuid    | FK → auth.users.id             |
| from_move_id  | uuid    | FK → moves.id                  |
| to_move_id    | uuid    | FK → moves.id                  |
| created_at    | timestamp | auto-set by Supabase         |

---

## AppContext state

```js
const {
  user,               // Auth user | null

  // Moves
  moves,              // Move[]
  loading,            // boolean
  error,              // error | null
  addMove,            // ({ name, aliases, status, parent_move_id }) => Move | null
  updateMove,         // (id, updates) => boolean
  deleteMove,         // (id) => boolean

  // Sessions
  sessions,           // Session[] (each has .entries array)
  loadSessions,       // () => void
  createSession,      // (notes?) => Session | null
  addSessionEntry,    // (sessionId, moveId, previousStatus, newStatus, notesAdded) => Entry | null
  deleteSessionEntry, // (sessionId, moveId) => void
  deleteSession,      // (id) => void

  // Combos
  combos,             // Combo[]
  loadCombos,         // () => void
  createCombo,        // (name, moveIds, notes) => { data, error }

  // Transitions
  transitions,        // Transition[]
  loadTransitions,    // () => boolean
  addTransition,      // (fromMoveId, toMoveId) => { ok: boolean, error: Error | object | null }
  deleteTransition,   // (fromMoveId, toMoveId) => boolean

  // Library UI state
  librarySearch,      // string
  setLibrarySearch,   // (string) => void
  libraryFilter,      // string
  setLibraryFilter,   // (string) => void
} = useApp()
```

---

## Notes system

Move notes are a single text field on the `moves` table.

```js
// Read
move.note

// Write
updateMove(moveId, { note: text })

// Clear
updateMove(moveId, { note: null })
```

Session notes are a separate field on the `sessions` table and are
unrelated to move notes.

Note datestamp format:
- `[Mar 25]` — current year
- `[Mar 25, 2025]` — previous years

---

## Conventions

- IDs are UUIDs from Supabase, never integers
- Move status values are always lowercase strings:
  `"want to try"`, `"working on"`, `"achieved"`
- Aliases are always stored in title case
- `fetchMoves()` re-fetches the full moves list after any mutation
  (add, update, delete) to keep state fresh
- Exits are curated via `transitions`; they are not auto-derived from combos
