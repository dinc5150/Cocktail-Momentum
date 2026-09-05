#  Style Guide

The visual language of Cocktail Pantry is **"dimly lit cocktail bar"**: near-black
surfaces, warm brass accents, cream text, and a single serif flourish on the title.
Everything else is quiet, low-contrast chrome so the ingredient list and the generated
recipes are the only things that draw the eye.



---

## 1. Design principles

1. **Dark first, warm never cold.** No pure black in the foreground and no blue-grey
   neutrals. Every neutral in the palette is warmed toward brown/amber.
2. **One accent, used sparingly.** Brass (`#c8922a`) marks the primary action, focus,
   active state, and streaming state — nothing else. If two brass things sit next to each
   other, one of them is wrong.
3. **Cards, not chrome.** The app is a single column of bordered cards. There is no
   navigation, no toolbar, no modal.
4. **Labels whisper, content speaks.** Section labels are small, uppercase, tracked-out
   and muted; content is normal-weight cream at ~0.9rem.
5. **Motion confirms, never entertains.** Transitions are 150–200 ms, on colour and border
   only. The two looping animations (spinner, caret) both signal work in progress.

---

## 2. Colour

### 2.1 Tokens

All tokens are declared once, on the `:host` of `<pantry-app>`
([pantry-app.ts:22-38](src/components/pantry-app.ts#L22-L38)). CSS custom properties
inherit through shadow DOM, so every child component reads them without re-declaring.

| Token | Value | Use |
|---|---|---|
| `--bg-page` | `#0d0d0d` | Page background; also the "ink" colour of text on brass fills |
| `--bg-card` | `#161616` | Card background (the three main panels) |
| `--bg-surface` | `#1e1e1e` | Inputs, selects, list rows, result panes — one step up from card |
| `--bg-hover` | `#262626` | Hover fill for rows and secondary buttons |
| `--border` | `#2e2e2e` | Default 1px border for every card, input, row and pill |
| `--text-primary` | `#e8dcc8` | Body text, ingredient names, recipe bodies |
| `--text-secondary` | `#8a7d6e` | Section labels, secondary button text |
| `--text-muted` | `#5a5045` | Placeholders, counts, hints, timestamps, icon buttons at rest |
| `--accent` | `#c8922a` | Primary fill, focus ring, active filter, progress bar |
| `--accent-light` | `#f0b544` | App title, hover state of accent fills, links |
| `--accent-glow` | `rgba(200,146,42,0.25)` | Focus halo and hover glow only |

The brass accent is also the PWA `theme_color` and the icon stroke colour
([vite.config.ts](vite.config.ts), [public/icon.svg](public/icon.svg)); `--bg-page` is the
manifest `background_color` and the `<meta name="theme-color">` companion. Change one and
you must change all four.

### 2.2 Elevation by lightness

There is no shadow-based elevation. Depth is expressed purely as a four-step ramp:

```
#0d0d0d  page   →   #161616  card   →   #1e1e1e  surface   →   #262626  hover
```

Never skip a step (a surface-coloured element sitting directly on the page reads as a
bug), and never introduce a fifth level — nest a border instead.

### 2.3 Semantic colours

These are currently hardcoded at their use sites rather than tokenised. Use exactly these
values; do not invent new greens or reds.

| Meaning | Border / solid | Text | Fill |
|---|---|---|---|
| In stock (positive) | `#4a9e5c` | `#6bbf7a` | `rgba(74,158,92,0.15)` → `0.28` hover |
| Out of stock (neutral-off) | `#5a5045` | `#7a6e60` | `rgba(90,80,69,0.20)` → `0.35` hover |
| Error / destructive | `rgba(180,60,60,0.25–0.30)` | `#e06060` (icon) / `#e07070` (text) | `rgba(180,60,60,0.08–0.25)` |
| Warning / notice | `rgba(200,146,42,0.20)` | `--text-secondary` | `rgba(200,146,42,0.08)` |
| Olive (app icon only) | — | — | `#3a6645` |

The pattern to follow for any new status colour: **translucent fill at ~8–15%, solid
border, lightened text tint** — never a fully saturated block.

### 2.4 Contrast

Measured against the surface each colour actually sits on:

| Pair | Ratio | Verdict |
|---|---|---|
| `--text-primary` on card | 13.4:1 | AAA |
| `--accent-light` on page | 10.6:1 | AAA |
| `#0d0d0d` on `--accent` (primary button) | 7.0:1 | AAA |
| In-stock pill text on surface | 7.4:1 | AAA |
| `--accent` on card | 6.6:1 | AA |
| `--text-secondary` on card | 4.5:1 | AA — do not shrink below 0.72rem |
| Out-of-stock pill text on surface | 3.4:1 | AA large / UI components only |
| `--text-muted` on card | 2.3:1 | **Fails AA** — decorative and tertiary only |

`--text-muted` is a deliberate de-emphasis colour. It is acceptable for counts, hints,
timestamps and resting icon buttons (each of which has a duplicate affordance or a hover
state), but it must never carry information that exists nowhere else, and never be the
only description of a form field.

---

## 3. Typography

Two families, loaded from Google Fonts in [index.html](index.html) and runtime-cached by
the service worker.

| Role | Family | Size | Weight | Tracking | Transform |
|---|---|---|---|---|---|
| App title | `'Playfair Display', Georgia, serif` | `2.6rem` | 600 | `0.02em` | — |
| App subtitle | Inter | `0.72rem` | 400 | `0.14em` | uppercase |
| Section / card label | Inter | `0.72rem` | 500 | `0.09em` | uppercase |
| Badge (e.g. "Gemini Nano") | Inter | `0.62rem` | 500 | `0.07em` | uppercase |
| Body / ingredient name | Inter | `0.95rem` | 400 | — | — |
| Recipe & result body | Inter | `0.85rem` | 400 | — | line-height `1.65` |
| Card / recipe heading | Inter | `0.87–0.90rem` | 600 | — | — |
| Button | Inter | `0.75–0.875rem` | 500–600 | `0.04–0.07em` | — |
| Meta / hint / count | Inter | `0.72–0.75rem` | 400 | — | — |
| Pill | Inter | `0.68rem` | 500 | `0.05em` | uppercase |
| Empty state | Inter | `0.875rem` | 400 italic | — | line-height `1.6` |

**Rules**

- Playfair Display is reserved for the `<h1>`. Do not use the serif anywhere else — one
  serif line against an otherwise all-sans interface is the entire typographic idea.
- Uppercase means *label*. If text is uppercase it must also be ≥`0.05em` tracked and
  ≤`0.72rem`.
- Inter is requested at 300/400/500 only, so the `600` used on card headings and the Add
  button is synthesised. Acceptable at these sizes; add `600` to the font request if
  heavier headings spread further.
- Every control sets `font-family: inherit` — native form elements otherwise fall back to
  the UA font inside shadow DOM.
- Long user text truncates in rows (`overflow: hidden; text-overflow: ellipsis;
  white-space: nowrap`); generated text wraps and preserves newlines (`white-space:
  pre-wrap; word-break: break-word`).

---

## 4. Layout & spacing

- **Column:** `max-width: 680px`, centred, `padding: 48px 20px 80px`
  ([pantry-app.ts:40-44](src/components/pantry-app.ts#L40-L44)). The deep bottom padding
  keeps the last card clear of mobile browser chrome.
- **Header:** centred, `margin-bottom: 44px`, with a 48×1px gradient divider
  (`transparent → --accent → transparent`, `opacity: .7`) between title and subtitle.
- **Cards:** `20px` apart, `24px` internal padding.
- **Stacks:** ingredient rows `8px`; recipe cards `12px`; favourites `10px`; control rows
  `10px`; filter pills `8px`.
- **Label → content gap:** `14px` inside a card, `16px` under a section header.
- **Section break:** the Favourites block separates with `margin-top: 28px`, a `1px solid
  var(--border)` rule, and `padding-top: 20px`.

Spacing values in use: `2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 36, 44, 48, 80`. Pick from
this list rather than introducing odd values.

Responsiveness is fluid, not breakpoint-driven — the column simply narrows. Flex rows keep
`min-width: 0` on the growing child and `flex-shrink: 0` on buttons, selects and pills so
controls never collapse; filter pills `flex-wrap`.

---

## 5. Shape & border

| Radius | Applied to |
|---|---|
| `20px` (pill) | Stock pills, filter pills, install button |
| `12px` | Cards |
| `10px` | Result pane, recipe cards, favourite items |
| `8px` | Inputs, selects, primary/secondary buttons, notices, error box |
| `6px` | Icon buttons, small save/toggle buttons |
| `5px` | Inline edit input |
| `4px` | Badge |

Rule of thumb: **the smaller the element, the tighter the radius.** Every bordered element
uses `1px solid var(--border)` at rest. There are no 2px borders and no drop shadows —
the only `box-shadow` in the app is the accent glow.

---

## 6. Components

### 6.1 Card

```css
background: var(--bg-card);
border: 1px solid var(--border);
border-radius: 12px;
padding: 24px;
margin-bottom: 20px;
```

Each card opens with either a `.card-label` (uppercase micro-label) or a `.section-header`
row — label left, count or badge right, aligned to `baseline` for text pairs and `center`
when a badge or button is involved.

### 6.2 Buttons

| Variant | Rest | Hover | Notes |
|---|---|---|---|
| **Primary** (`.btn-add`, `.btn-generate`) | brass fill, `#0d0d0d` text, no border | `--accent-light` + `0 0 14px var(--accent-glow)` | The only filled button; one per card maximum |
| **Secondary** (`.btn-secondary`) | `--bg-surface`, `--text-secondary`, `1px --border` | `--bg-hover`, `--text-primary` | Sits to the left of a primary |
| **Outline** (`.btn-install`) | transparent, `1px --accent`, `--accent-light` text, pill | `--accent-glow` fill | Uppercase, `0.07em` tracked |
| **Ghost link** (`.btn-example`) | no border, `--text-muted` | `--accent-light` | Right-aligned, low commitment |
| **Icon** (`.icon-btn`) | 30×30, transparent, `--text-muted` | `rgba(255,255,255,.06)` fill, `--text-primary` | `.danger` variant hovers `rgba(160,48,48,.22)` / `#e06060` |
| **Destructive** (`.btn-stop`) | `rgba(180,60,60,.15)`, `#e07070`, red border | fill → `.25` | Interrupts work; never deletes data |

Disabled state is uniformly reduced `opacity` plus `cursor: not-allowed` — `0.35` for the
Add button, `0.4` for the AI buttons. Prefer disabling to hiding so the layout does not
jump.

### 6.3 Inputs

```css
background: var(--bg-surface);
border: 1px solid var(--border);
border-radius: 8px;
color: var(--text-primary);
padding: 10px 14px;
outline: none;
transition: border-color .2s, box-shadow .2s;
```

Focus is expressed two ways, and the choice is meaningful:

- **Primary inputs** (add ingredient, inline rename): `border-color: var(--accent)` **plus**
  `box-shadow: 0 0 0 3px var(--accent-glow)` — a full focus halo.
- **Secondary inputs** (search, sort select, mood input): border colour change only.

`outline: none` is only acceptable because one of those two treatments replaces it. Never
remove the outline without adding one.

The sort `<select>` strips native appearance and supplies an inline-SVG chevron stroked in
`--text-secondary`, right-aligned via `padding: 8px 32px 8px 12px`.

### 6.4 Ingredient row

Three zones: **status pill** (fixed) · **name** (flex, truncating) · **actions** (fixed).
Hover raises the row to `--bg-hover` and turns its border brass. Out-of-stock rows strike
through the name and drop it to `--text-muted`, while the row itself keeps full opacity so
the toggle stays legible — the `opacity: .55` rule is deliberately commented out in
[ingredient-item.ts:36-38](src/components/ingredient-item.ts#L36-L38); leave it that way.

The status pill is a *button*, not a badge: it states the current status and toggles on
click.

### 6.5 Feedback & progress

- **Spinner:** 14px ring, `2px solid var(--border)` with `border-top-color: var(--accent)`,
  `spin .8s linear infinite`.
- **Progress bar:** 3px track on `--bg-surface`, brass fill, `width` transitioned `.3s
  ease`, with a `0.72rem` muted label above.
- **Streaming:** the result pane takes the accent border plus `0 0 0 3px var(--accent-glow)`
  and appends a 2px brass caret blinking `0.9s step-end`.
- **Notices:** translucent tinted block with a matching border, `0.82rem`, `line-height
  1.5`. Amber for informational, red for unsupported/error.
- **Empty state:** centred, italic, `--text-muted`, `36px 0` padding, and always says what
  to do next ("Your pantry is empty. Add an ingredient above.").

### 6.6 Iconography

Text glyphs only — `⊕` install, `✎` edit, `✕` delete/close, `♡`/`♥` save. No icon font, no
SVG sprite. Anything new should be a single Unicode glyph of similar weight, or an inline
SVG stroked at `1.5px` in `--text-secondary`, matching the select chevron.

---

## 7. Motion

| Duration | Applied to |
|---|---|
| `0.15s` | Colour-only changes: icon buttons, ghost links, small buttons, mood-input border |
| `0.2s` | Border, background and box-shadow on inputs, rows, pills, filters |
| `0.3s ease` | Progress bar width |
| `0.8s` / `0.9s` loops | Spinner rotation, caret blink |

Only `color`, `background`, `border-color`, `box-shadow`, `opacity` and `width` animate.
Nothing moves position, scales, or fades in on mount. There is no `prefers-reduced-motion`
handling yet; if anything joins the spinner and caret, add a query that disables the loops.

---

## 8. Conventions for new code

1. **Styles live in the component.** Each component owns a `static styles = css` block;
   there is no shared stylesheet. Global reset and font loading stay in
   [index.html](index.html).
2. **Read tokens, never re-define them.** Only `<pantry-app>` declares custom properties. A
   child needing a new colour gets a new token at the root, not a literal.
3. **Class names are flat kebab-case, structural then variant:** `.btn` + `.btn-generate`,
   `.stock-pill` + `.pill-in`, `.item` + `.out-of-stock`. No BEM, no nesting beyond two
   levels.
4. **Cross-component communication is bubbling `CustomEvent`s** (`ingredient-add`,
   `ingredient-update`, `ingredient-remove`) with `bubbles: true, composed: true`, handled
   on the `.app` container. Styling never crosses a component boundary.
5. **State lives in `@state`, data arrives via `@property`.** Presentational components take
   a plain object in and emit an event out.

### Known inconsistencies (fix on touch, don't propagate)

- Several child components carry hardcoded fallbacks that no longer match the canonical
  tokens — `var(--bg-surface, #242424)` vs `#1e1e1e`, `var(--border, #333333)` vs
  `#2e2e2e`, `var(--bg-hover, #2a2a2a)` vs `#262626`. The fallbacks only apply if a
  component is used outside `<pantry-app>`, which never happens; prefer bare `var(--token)`
  as [cocktail-ai.ts](src/components/cocktail-ai.ts) already does.
- The status greens, reds and their translucent fills are literals repeated across files.
  They are the obvious candidates for `--positive-*`, `--danger-*` and `--warning-*` tokens.
- Radii and durations are literals everywhere. If the system grows, promote `--radius-*`
  and `--dur-*` into the token block alongside the colours.
