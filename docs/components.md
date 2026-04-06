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
