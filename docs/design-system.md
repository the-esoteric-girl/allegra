# Design System

## Typography

Font: Plus Jakarta Sans
Import: Google Fonts (already in index.css)

### Text style variables

Use `font: var(--text-*)` shorthand instead of individual `font-size`, `font-weight`, `line-height`, and `font-family` declarations.

```
--text-heading-2       700 1.75rem/1.5  — page titles
--text-heading-3       700 1.5rem/1.5   — section headings
--text-heading-4       700 1.25rem/1.5  — sheet titles, card headings
--text-body-semibold   600 1rem/1.5     — buttons, strong labels
--text-body            400 1rem/1.5     — body copy, inputs
--text-body-sm-medium  500 0.875rem/1.5 — pills, secondary actions
--text-body-sm         400 0.875rem/1.5 — secondary body text
--text-caption         400 0.75rem/1.5  — captions, meta text
--text-label           600 0.75rem/1.5  — section labels (uppercase)
```

When a weight differs from the shorthand (e.g. StatusPill uses 500 at 0.75rem), use `font: var(--text-caption)` then override `font-weight`.

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

## Accessibility

### Font size minimum
- **12px (0.75rem) is the minimum** for any text that carries meaning
- Placeholder text is exempt from this minimum
- Never use `0.625rem` (10px) or `0.6875rem` (11px) for meaningful text

### Text colour rules

| Variable                  | Use for                                              |
|---------------------------|------------------------------------------------------|
| `--color-text-primary`    | Body text, headings, interactive labels              |
| `--color-text-secondary`  | Metadata, dates, counts, captions, empty states, nav |
| `--color-text-muted`      | Decorative icons, placeholder text only              |
| `--color-text-placeholder`| Input placeholder text only                         |

**Rule:** `--color-text-muted` (#9B9DBB) fails WCAG AA on white for small text. Only use it for icons (drag handles, search icons, arrows) and placeholders. Any text that conveys information must use `--color-text-secondary` at minimum.

### Contrast requirements
- All meaningful text must meet WCAG AA: 4.5:1 contrast ratio
- Placeholder text is exempt
- Status pill colours (`--color-achieved-text`, `--color-working-text`, `--color-want-text`) are verified to pass AA on their respective backgrounds

## Rules

- Never hardcode colour hex values in component files
- Always use CSS variables from index.css
- Spacing should use --space-* variables, not arbitrary px values
- Typography should use `--text-*` shorthand variables, not individual font properties
