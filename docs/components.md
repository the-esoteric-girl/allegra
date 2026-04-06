# Component Library

All shared UI components live in `src/components/ui/`.

## Import

```js
import { Button, Card, Input } from '../components/ui'
// or for default imports:
import BottomSheet from '../components/ui/BottomSheet'
```

## Components

---

### StatusDot

Coloured dot indicating move status.

```jsx
<StatusDot status="achieved" size={7} />
```

| Prop   | Type   | Default | Values                                    |
|--------|--------|---------|-------------------------------------------|
| status | string | —       | "achieved" \| "working on" \| "want to try" |
| size   | number | 7       | pixel size (width and height)             |

---

### StatusPill

Dot + label badge for move status.

```jsx
<StatusPill status="working on" size="default" />
```

| Prop   | Type   | Default   | Values                                    |
|--------|--------|-----------|-------------------------------------------|
| status | string | —         | "achieved" \| "working on" \| "want to try" |
| size   | string | "default" | "default" \| "sm"                         |

---

### Button

Primary action button.

```jsx
<Button variant="primary" onClick={handleSave}>Save</Button>
<Button variant="secondary" size="sm" leftIcon={<Plus />}>Add</Button>
<Button variant="ghost" fullWidth>Cancel</Button>
```

| Prop      | Type      | Default    | Values                                      |
|-----------|-----------|------------|---------------------------------------------|
| variant   | string    | "primary"  | "primary" \| "secondary" \| "subtle" \| "ghost" |
| size      | string    | "default"  | "default" \| "sm"                           |
| onClick   | function  | —          | —                                           |
| disabled  | boolean   | false      | —                                           |
| fullWidth | boolean   | false      | —                                           |
| leftIcon  | ReactNode | —          | Icon element                                |
| type      | string    | "button"   | "button" \| "submit" \| "reset"             |
| className | string    | —          | Additional CSS class                        |

Hover: uses `filter: brightness()`, not a separate colour variable.

---

### Pill

Filter pill for toggling active/inactive states.

```jsx
<Pill active={filter === 'All'} onClick={() => setFilter('All')}>All</Pill>
```

| Prop     | Type     | Default | Values |
|----------|----------|---------|--------|
| active   | boolean  | —       | —      |
| onClick  | function | —       | —      |
| children | node     | —       | label  |

---

### Card

White surface container with shadow.

```jsx
<Card onClick={() => navigate(`/move/${id}`)}>
  {children}
</Card>
<Card padding="sm">...</Card>
<Card padding="none">...</Card>
```

| Prop      | Type      | Default    | Values                        |
|-----------|-----------|------------|-------------------------------|
| padding   | string    | "default"  | "default" \| "sm" \| "none"  |
| onClick   | function  | —          | Makes card clickable          |
| className | string    | —          | Additional CSS class          |

---

### Input

Text input or textarea, renders on blue surface background.

```jsx
<Input
  id="move-name"
  name="move-name"
  placeholder="Move name"
  value={name}
  onChange={e => setName(e.target.value)}
  leftIcon={<Search size={16} />}
/>
<Input multiline rows={4} id="notes" name="notes" value={notes} onChange={...} />
```

| Prop        | Type      | Default | Values       |
|-------------|-----------|---------|--------------|
| id          | string    | —       | required     |
| name        | string    | —       | required     |
| value       | string    | —       | —            |
| onChange    | function  | —       | —            |
| placeholder | string    | —       | —            |
| multiline   | boolean   | false   | textarea     |
| rows        | number    | 3       | textarea rows|
| leftIcon    | ReactNode | —       | —            |
| rightIcon   | ReactNode | —       | —            |
| className   | string    | —       | wrapper class |
| inputClassName | string | —       | input/textarea class |
| inputRef    | ref       | —       | input/textarea ref |

Focus style: `box-shadow`, never border colour change.

---

### Select

Shared select/dropdown field rendered on blue surface background.

```jsx
<Select id="sort-order" name="sort-order" value={sortOrder} onChange={...}>
  <option value="newest">Newest first</option>
  <option value="oldest">Oldest first</option>
</Select>
```

| Prop      | Type     | Default | Values                |
|-----------|----------|---------|-----------------------|
| id        | string   | —       | required              |
| name      | string   | —       | required              |
| value     | string   | —       | selected option value |
| onChange  | function | —       | —                     |
| className | string   | —       | additional CSS class  |

---

### SearchField

Shared search input using `Input` with built-in search and clear affordances.

```jsx
<SearchField
  id="library-search"
  name="library-search"
  value={search}
  onChange={e => setSearch(e.target.value)}
  onClear={() => setSearch('')}
  placeholder="Search moves..."
/>
```

| Prop        | Type     | Default  | Values                         |
|-------------|----------|----------|--------------------------------|
| id          | string   | —        | required                       |
| name        | string   | —        | required                       |
| value       | string   | —        | controlled input value         |
| onChange    | function | —        | input change handler           |
| onClear     | function | —        | clear action handler           |
| placeholder | string   | "Search" | placeholder text               |
| inputRef    | ref      | —        | input ref (focus/select use)   |
| className   | string   | —        | wrapper class                  |
| inputClassName | string | —       | input element class            |

---

### MoveSelectRow

Reusable selectable row used in move pickers.

```jsx
<MoveSelectRow
  label={move.name}
  selected={selected}
  onClick={() => togglePending(move.id)}
/>
```

| Prop             | Type     | Default | Values                             |
|------------------|----------|---------|------------------------------------|
| label            | string   | —       | row label                          |
| selected         | boolean  | false   | checked state                      |
| onClick          | function | —       | click handler                      |
| disabled         | boolean  | false   | disables selection                 |
| className        | string   | —       | row class override                 |
| checkboxClassName| string   | —       | checkbox class override            |
| labelClassName   | string   | —       | label class override               |

---

### Field

Simple field wrapper for consistent label/hint/error layout.

```jsx
<Field label="Name" htmlFor="combo-name" error={nameError}>
  <Input id="combo-name" name="combo-name" value={name} onChange={...} />
</Field>
```

| Prop           | Type   | Default | Values                              |
|----------------|--------|---------|-------------------------------------|
| label          | string | —       | field label text                    |
| htmlFor        | string | —       | label target id                     |
| hint           | string | —       | helper text under label             |
| error          | string | —       | error text under input              |
| className      | string | —       | wrapper class override              |
| labelClassName | string | —       | label class override                |
| contentClassName | string | —     | class for children container        |

---

### StatusOptionButton

Reusable status option row with dot, label, and optional selected checkmark.

```jsx
<StatusOptionButton
  status="working on"
  label="Working on"
  selected={value === 'working on'}
  variant="menu"
  showCheck
  onClick={...}
/>
```

| Prop      | Type     | Default | Values                                  |
|-----------|----------|---------|-----------------------------------------|
| status    | string   | —       | status token used by `StatusDot`        |
| label     | string   | —       | visible label                           |
| selected  | boolean  | false   | selected visual state                   |
| onClick   | function | —       | click handler                           |
| variant   | string   | "menu"  | "menu" \| "list"                        |
| showCheck | boolean  | false   | renders check icon when selected        |
| className | string   | —       | additional class                        |

---

### SectionLabel

Uppercase muted section heading label.

```jsx
<SectionLabel>Recent sessions</SectionLabel>
```

No props beyond children.

---

### Divider

Horizontal rule.

```jsx
<Divider />
```

No props.

---

### IconButton

Circular icon button.

```jsx
<IconButton icon={<X size={20} />} onClick={onClose} label="Close" />
<IconButton icon={<Edit />} variant="ghost" size="sm" label="Edit" />
```

| Prop    | Type      | Default    | Values                  |
|---------|-----------|------------|-------------------------|
| icon    | ReactNode | —          | Icon element            |
| onClick | function  | —          | —                       |
| variant | string    | "default"  | "default" \| "ghost"   |
| size    | string    | "default"  | "default" \| "sm"      |
| label   | string    | —          | aria-label (required)   |

---

### BottomSheet

Modal sheet that slides up from the bottom of the screen.

```jsx
<BottomSheet
  isOpen={isOpen}
  onClose={handleClose}
  title="Log session"
  leftAction={<Button variant="ghost">Cancel</Button>}
  rightAction={<Button onClick={handleSave}>Save</Button>}
  bottomAction={<Button fullWidth>Done</Button>}
  height="92vh"
>
  {children}
</BottomSheet>
```

| Prop         | Type      | Default  | Values                       |
|--------------|-----------|----------|------------------------------|
| isOpen       | boolean   | —        | controls visibility          |
| onClose      | function  | —        | called on overlay click      |
| title        | string    | —        | header centre text           |
| leftAction   | ReactNode | —        | header left slot             |
| rightAction  | ReactNode | —        | header right slot            |
| bottomAction | ReactNode | —        | sticky bottom action area    |
| height       | string    | "92vh"   | CSS height value             |

Renders nothing when `isOpen` is false (no DOM).

---

## Rules

- Never hardcode colour values in component files
- Always use CSS variables from index.css
- All form fields must have `id` and `name` attributes
- Hover states: use `filter: brightness()` on buttons
- Input focus: use `box-shadow`, not border colour
