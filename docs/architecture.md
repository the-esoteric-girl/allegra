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
