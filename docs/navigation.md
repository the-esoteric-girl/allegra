# Navigation & Routes

## Routes

| Path       | Component      | Description                      |
|------------|----------------|----------------------------------|
| `/`        | Library.jsx    | Move list with search and filter |
| `/move/:id`| MoveDetail.jsx | Single move detail               |
| `/combos`  | Combos.jsx     | Combos list and creation         |
| `/you`     | You.jsx        | User profile and session history |

## Bottom navigation

Defined in `src/components/BottomNav.jsx`.

| Label   | Icon        | Destination             |
|---------|-------------|-------------------------|
| Library | BookOpen    | `/`                     |
| Log     | PlusCircle  | opens LogModal (modal)  |
| Combos  | Layers      | `/combos`               |
| You     | User        | `/you`                  |

## Modal triggers

Modals are not routes. They are controlled by boolean state.

- **LogModal** — opened from bottom nav Log button
- **ComboModal** — opened from Combos page

## Navigation conventions

- Use `NavLink` (React Router) for navigation items that need active states
- Use `useNavigate` for programmatic navigation (e.g. after saving a move)
