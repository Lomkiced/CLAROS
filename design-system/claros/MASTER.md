# Claros Design System — MASTER

Single source of truth for every Claros surface. Read this before creating or editing any component. Page-specific deviations live in `design-system/claros/pages/<page>.md` and override this file only where they say so.

- **Style:** Flat, typographic minimalism. Hierarchy comes from type, whitespace and 1px hairlines. No shadows, no gradients, no glass.
- **Surface modes** (Impeccable): marketing pages are *Persuade*; dashboard, kit viewer and tools are *Operate* (scanability and consistency over expression).
- **Tokens:** every color, font and radius is a CSS variable in `src/app/globals.css`. Components use the semantic Tailwind classes below, never raw hex values.

---

## 1. Color

### Surfaces and text

| Role | Tailwind class | CSS variable | Light | Dark |
|---|---|---|---|---|
| Canvas (page background) | `bg-background` | `--background` | `#FAFAFA` | `#09090B` |
| Elevated surface (cards, inputs, popovers) | `bg-card` / `bg-popover` | `--surface` | `#FFFFFF` | `#18181B` |
| Hairline border | `border-border` | `--border` | `#E2E8F0` | `#27272A` |
| Form control border | `border-input` | `--input` | `#94A3B8` | `#71717A` |
| Primary text | `text-foreground` | `--foreground` | `#0F172A` | `#FAFAFA` |
| Secondary text | `text-muted-foreground` | `--muted-foreground` | `#475569` | `#A1A1AA` |
| Hover / selected neutral fill | `bg-secondary` `bg-muted` `bg-accent` | `--secondary` `--muted` `--accent` | `#F1F5F9` | `#27272A` |

### Brand and semantic accents

| Role | Tailwind class | CSS variable | Light | Dark | Allowed use |
|---|---|---|---|---|---|
| **Brand: Electric Indigo** | `bg-primary` `text-primary-foreground` | `--primary` | `#4F46E5` | `#4F46E5` | Primary buttons, the active-tab indicator, focus rings. Nothing else. |
| **Success: Emerald** | `bg-success` `text-success-foreground` | `--success` | `#10B981` | `#10B981` | Completed checklist items and correct quiz answers only. |
| Error | `text-destructive` | `--destructive` | `#DC2626` | `#F87171` | Validation and failure messages only. Not a brand color. |

**Rules**

1. Indigo is the only brand color. Do not introduce a second accent, a tint ramp or a gradient of it.
2. Emerald appears only on a completed state, and always with a check glyph. Never use it as decoration, as a category color or for text.
3. Links and body emphasis are `text-foreground` with an underline. Indigo is never used for running text, which keeps dark-mode contrast safe.
4. Badges, tags and mode labels are neutral (`border-border` outline or `bg-secondary`). One badge style, never several colors.
5. Dark mode follows the system by default (`next-themes`, `class` strategy). Check both themes independently.

### Contrast (WCAG, computed)

| Pair | Light | Dark |
|---|---|---|
| Primary text on canvas | 17.1:1 | 19.1:1 |
| Secondary text on canvas / surface | 7.3 / 7.6:1 | 7.8 / 6.9:1 |
| White on indigo (button label) | 6.3:1 | 6.3:1 |
| Indigo focus ring on canvas | 6.0:1 | 3.2:1 |
| `--success-foreground` (`#022C22`) on emerald | 6.0:1 | 6.0:1 |
| Hairline border on canvas (decorative) | 1.2:1 | 1.3:1 |
| Form control border on surface | 2.6:1 | 3.7:1 |
| Emerald on surface (indicator only) | 2.5:1 | 7.0:1 |

**Known deviations (accepted, mitigated):** the light-mode form control border (2.6:1) and the light-mode emerald indicator (2.5:1) sit below the 3:1 non-text target. Controls always have a visible placeholder or label and a 6:1 focus ring. Completion is always signaled by a check glyph and struck-through text, never by color alone.

---

## 2. Typography

Two fonts, loaded with `next/font/google` in `src/app/layout.tsx`.

| Font | Variable | Tailwind | Use |
|---|---|---|---|
| **Plus Jakarta Sans** | `--font-jakarta` | `font-sans` (default), `font-heading` | Headings, body, all UI |
| **JetBrains Mono** | `--font-jetbrains-mono` | `font-mono` | **Only** timestamps (`04:12`) and code or tool snippets |

Do not use mono for labels, badges, numbers in prose or "technical flavor".

### Scale

| Token | Class | Size / line-height | Weight | Tracking | Use |
|---|---|---|---|---|---|
| Display | `text-4xl sm:text-5xl` | 36–48 / 1.1 | 600 | `tracking-tight` | Landing H1 only |
| H2 | `text-2xl` | 24 / 1.25 | 600 | `tracking-tight` | Section headings |
| H3 | `text-base` | 16 / 1.4 | 600 | normal | Item and card titles |
| Lead | `text-base sm:text-lg` | 16–18 / 1.6 | 400 | normal | Hero supporting text |
| Body | `text-sm` | 14 / 1.6 | 400 | normal | Default UI and reading text |
| Caption | `text-xs` | 12 / 1.5 | 500 | normal | Metadata, helper text |

- Weights in use: **400, 500, 600**. No bold (700+), no light.
- Headings use `text-balance`. Reading text stays within 65–75ch (`max-w-prose` or narrower).
- Numerals in data and counts use `tabular-nums`.

---

## 3. Spacing, radius, borders

- **Base unit:** 4px. Prefer 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96.
- **Section rhythm (landing):** `py-16` between sections, `py-20 sm:py-28` for the hero. More space above a heading than below it.
- **Container:** `mx-auto max-w-6xl px-4 sm:px-6`. Text blocks cap at `max-w-2xl` or `max-w-3xl`.
- **Radius:** `--radius: 0.5rem`. Cards, inputs and buttons use `rounded-lg` (8px) or `rounded-md`. Pills only for the active-selection control.
- **Borders:** 1px `border-border`. Never thicker. No colored side-borders.
- **Elevation:** none. Popovers and menus are distinguished by `border` and `bg-popover`, not shadows.

---

## 4. Components

| Component | Rule |
|---|---|
| **Card** | `bg-card` + 1px `border-border`, `rounded-lg`. Identical everywhere: no tint, no colored border, no gradient, no shadow. Never nest cards. Prefer hairline-divided lists to grids of cards. |
| **Button** | One primary (`bg-primary`) per view. Secondary is `outline`; tertiary is plain text. Label names the action ("Generate action kit"). No leading decorative icon. |
| **Input** | `bg-card`, `border-input`, `rounded-lg`, focus ring `--ring`. Always has a label (visible or `sr-only`). |
| **Tabs** | `line` variant. Active tab: foreground text with a 2px indigo underline. No pill fill. |
| **Badge** | Neutral only. Used for status, never for decoration or category color. |
| **Checklist item** | Complete: emerald check, struck-through muted text. Incomplete: empty 1px circle. Timestamp in `font-mono`. |
| **Quiz option** | Correct answer: emerald check plus the word "Correct". Wrong: `destructive` text plus "Incorrect". |
| **Skeleton / progress** | Neutral `bg-muted`; progress fill is `bg-primary`. |
| **Toast** | Neutral surface, no rich colors. |

---

## 5. Icons

Library: `lucide-react`, 16px (`size-4`), default stroke. Decorative icons beside visible text get `aria-hidden`; icon-only buttons get an accessible name.

**Allowed (functional):** play / pause, copy, export / download, check (completion), close, chevrons for expand or step, external-link marker when leaving the site.

**Not allowed:** an icon beside every heading, an icon on every feature card, brand-mark tiles, sparkle or "AI" glyphs, decorative arrows on links and buttons, emoji or unicode glyphs as icons.

---

## 6. Motion and interaction

- Transitions: `150ms ease-out` on color, border and opacity. No layout-shifting hover effects.
- One purposeful animation per view at most. Respect `prefers-reduced-motion` (globally handled in `globals.css`).
- Every clickable element has `cursor-pointer`, a hover state and a visible `:focus-visible` indicator (2px indigo outline, 2px offset).
- Touch targets ≥ 44px tall for primary actions on mobile.

---

## 7. Anti-patterns (do not ship)

- Rainbow cards, multi-colored badges, tinted gradient boxes, gradient text.
- Eyebrow labels above headings; numbered sections without meaning.
- Grids of identical icon + heading + text cards as page structure.
- Drop shadows, glassmorphism, blur used as decoration.
- Raw hex values or one-off Tailwind palette colors (`bg-emerald-500/10`, `text-blue-600`) in components.
- A third font, or monospace used as a costume.

---

## 8. Pre-delivery checklist

- [ ] Only semantic token classes; no raw hex or palette colors
- [ ] One neutral card style with 1px hairline; no shadows
- [ ] Indigo only on primary buttons, active tab and focus ring; emerald only on completed states
- [ ] Icons only where functional
- [ ] Fonts: Jakarta everywhere, JetBrains Mono only for timestamps and code
- [ ] Light and dark both checked; contrast ≥ 4.5:1 for text
- [ ] Keyboard focus visible; labels on all controls
- [ ] Checked at 375px, 768px, 1280px
- [ ] `impeccable detect` run over changed UI files
