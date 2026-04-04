# Key Decisions & Deferrals

## Design decisions

### Status colour mapping

achieved = blue, working on = pink, want to try = coral.

Rationale: Blue feels like completion/achievement. Pink reflects active
energy and effort. Coral is warm but lower-stakes — appropriate for
aspirational moves. This mapping is intentional and must be consistent
across all components via semantic status variables.

### Single blue brand variable

`--color-blue` is a flat brand value. The `--blue-*` ramp is used only
for surfaces and status semantics. This avoids colour conflicts between
the blue brand colour and the "achieved" status colour family.

### rem vs px

Spacing variables use px values defined in index.css as CSS custom
properties. All component layout uses these variables via `var()`.
Arbitrary px values in components are avoided.

### Input focus via box-shadow

Input focus state uses `box-shadow` rather than changing `border-color`.
Reason: cleaner animation, avoids layout shift, consistent with iOS
native feel.

### Button hover via filter: brightness()

Rather than defining a separate hover colour variable for each button
variant, hover states use `filter: brightness(0.92)` or similar.
Reason: single rule works across all variants and themes.

### No images in v1

Cards carry content without images. Well-designed typography and status
colour coding creates visual hierarchy. Images deferred to v2.

### Modals not routes

LogModal and ComboModal are not routes. They are bottom sheets
controlled by boolean state. This keeps the URL clean and avoids
complicating back navigation.

### CSS Modules for components, global tokens in index.css

Component styles use CSS Modules for scoping. Design tokens (colours,
spacing, radius, shadows) live in `index.css` as global CSS custom
properties. Components reference tokens via `var()`.

---

## Technical decisions

### All Supabase calls in AppContext

No component or page calls Supabase directly. All data operations go
through AppContext functions. This centralises error handling and makes
the data layer easy to audit and replace.

### useApp imported from hooks/useApp.js

The context hook is re-exported from `src/hooks/useApp.js` to keep the
import path stable if the context structure changes. Never import it
directly from AppContext.

### Library search/filter state in AppContext

`librarySearch` and `libraryFilter` live in AppContext (not local state)
to survive navigation. This is a known bug fix — search would reset on
back navigation without this.

### Transitions bidirectional by default

The `bidirectional` field on transitions defaults to `true`. Validate
in user interviews whether this assumption holds before building
direction-specific UI.

---

## Known issues / deferred decisions

### Library search resets on back navigation
Partially addressed by storing state in AppContext. May still need
URL search params for deep-link support.

### True/twisted grip
Treated as grip types in v1. May need a separate modifier field in v2
if grip-specific filtering is needed.

### Difficulty and category fields
Not in v1. Planned for v2. Do not add these fields to the schema
without a v2 design pass.

### PSO levels
Not in v1.

### User accounts / auth
Not in v1. `user_id` field on moves is reserved but always null.
Future: custom moves visible only to their creator.

### Floorwork as a category
Explicitly out of scope for v1.

### Recommendations engine
Out of scope for v1.

---

## What is NOT in v1

- User accounts / auth
- Images or video on moves
- Recommendations engine
- PSO levels
- Difficulty and category fields on moves
- Floorwork as a category

---

## Case study context

This app was built after competitive analysis showed:

- Existing pole move sites are outdated and reference-only
  (Pole Move Book, PolePedia)
- The only tracking app (Pole Moves App) has fragmented UX and
  generic design
- No well-designed tool combines community depth with personal
  progress tracking

The app name Allegra is named after an advanced pole move —
recognisable to the community, beautiful to everyone else.
