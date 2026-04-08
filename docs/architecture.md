# Architecture

## File structure

```
src/
  components/     shared UI components
    ui/           atomic component library (Button, Card, etc.)
  context/        AppContext.jsx — global state and Supabase calls
                  appContextInstance.js — context object
                  useApp.js — re-exported hook (import from here)
  hooks/          custom hooks (useApp.js lives here)
  pages/          Library.jsx, MoveDetail.jsx, Combos.jsx, You.jsx
  lib/            supabase.js — Supabase client
```

## Component-first principles

- Shared UI lives in `src/components/ui/` — never inline one-off
  styled elements that will be reused
- Before building a new component, check if an existing one can
  be extended via props
- Flag when something should be a shared component before building
  a page-specific version

## Modal architecture — BottomSheet pattern

All modals use the `BottomSheet` component from `src/components/ui/`.
BottomSheet slides up from the bottom of the screen.

- LogModal — triggered from bottom nav bar, not a route
- ComboModal — triggered from Combos page

Modals are NOT routes. They are controlled by boolean state in the
parent component or AppContext.

## Route state convention

For detail-to-detail navigation where Back should return to the source
detail page, pass route state:

- navigate to target with `state: { backTo: <sourcePath> }`
- target page back action uses `navigate(location.state?.backTo || <fallback>)`

Example: MoveDetail -> ComboDetail should return to the originating
MoveDetail, not always `/combos`.

## Plan before building

Before writing any code, plan with the user:
- Consider component architecture and shared patterns
- Consider future scalability and edge cases
- Flag shortcuts that will create technical debt
- Confirm the approach before implementation

## Tech stack

- React (Vite)
- React Router DOM for navigation
- Supabase for database (PostgreSQL)
- Lucide React for icons
- CSS Modules for component styles, global tokens in index.css

## Before building any UI element

Before writing any new UI code, always:

1. Search src/components/ui/ for an existing component
   that handles this use case
2. Search the codebase for existing implementations
   of similar UI patterns
3. If a component exists — use it, extend it if needed
4. If similar UI exists in 2+ places — extract it 
   into a shared component before adding a third
5. Never implement inline what should be a component

Common components that MUST be used (never inline):
  Filter pills     → Pill from ui/
  Search inputs    → Input from ui/
  Section labels   → SectionLabel from ui/
  Cards            → Card from ui/
  Status dots      → StatusDot from ui/
  Status pills     → StatusPill from ui/
  Buttons          → Button from ui/
  Modals/sheets    → BottomSheet from ui/
  Move lists       → MoveList from ui/
  Move cards       → MoveCard from ui/

If you find yourself writing CSS for something that 
should use a CSS variable, stop and use the variable.
If you find yourself copying styles from another 
component, stop and extract a shared component.