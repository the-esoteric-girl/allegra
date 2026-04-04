# Design System

## Typography

Font: Plus Jakarta Sans
Import: Google Fonts (already in index.css)

## Colour ramps

Defined in index.css. Never use ramp variables directly in
components — always use semantic variables.

```
--neutral-10 … --neutral-100   (cool blue-gray)
--pink-10    … --pink-100
--blue-10    … --blue-100
--coral-10   … --coral-100
```

## Semantic colour variables

### Surfaces
```
--color-bg              neutral-100 (page background)
--color-surface         #fff (card background)
--color-surface-blue    blue-100
--color-light-blue      blue-90
--color-light-pink      pink-100
```

### Brand (flat)
```
--color-blue
--color-pink
--color-coral
```

### Borders
```
--color-border-subtle   neutral-90
--color-border          blue-tinted rgba
```

### Text
```
--color-text-primary      neutral-20
--color-text-secondary    neutral-60
--color-text-muted        neutral-70
--color-text-placeholder  neutral-80
```

## Status colours (IMPORTANT)

Each status maps to a specific colour family. Always use the
semantic status variables — never use ramp variables for status.

| Status       | Colour | Base variable         |
|------------- |--------|-----------------------|
| achieved     | blue   | --color-achieved      |
| working on   | pink   | --color-working       |
| want to try  | coral  | --color-want          |

Each status has three variants:
```
--color-achieved-bg    --color-achieved-text    --color-achieved-dot
--color-working-bg     --color-working-text     --color-working-dot
--color-want-bg        --color-want-text        --color-want-dot
```

**Rationale:** Colour-coding is a core UX signal throughout the app.
Consistent use of semantic vars makes it easy to retheme and ensures
status colours never diverge between components.

## Spacing

```
--space-1   4px
--space-2   8px
--space-3   12px
--space-4   16px
--space-5   20px
--space-6   24px
--space-8   32px
--space-10  40px
--space-12  48px
```

## Layout variables

```
--page-padding          20px
--page-padding-bottom   100px
--section-gap           24px
--card-padding          16px
--card-gap              10px
--input-padding         14px 16px
```

## Border radius

```
--radius-sm    8px
--radius-md    10px
--radius-lg    14px
--radius-xl    20px
--radius-pill  999px
```

## Shadows

```
--shadow-card
--shadow-card-hover
--shadow-sheet
```

## Interaction

- Button hover: use `filter: brightness()`, not a separate colour variable
- Input focus: use `box-shadow`, never change the border colour

## Dark mode

Not implemented in v1.

## Rules

- Never hardcode colour hex values in component files
- Always use CSS variables from index.css
- Spacing should use --space-* variables, not arbitrary px values
