# Claros: Project Instructions for All Models

These rules apply to every model working in this workspace, on every UI task, without exception. They sit alongside `AGENTS.md` (Next.js version notes).

## Before any UI work

**Always read `design-system/claros/MASTER.md` before creating or editing any component, page or style.** If `design-system/claros/pages/<page>.md` exists, its rules override MASTER for that page. Tokens live in `src/app/globals.css`. Do not edit tokens to suit a single component; change the design system deliberately and update MASTER.md in the same change.

## Visual rules

1. **No rainbow cards, multi-colored badges or tinted gradient boxes.** Every card uses the same neutral surface (`bg-card`) and a 1px hairline border (`border border-border`). No colored backgrounds, colored borders, gradients, or per-category colors. Badges are neutral and used for status only.
2. **No gratuitous icons.** Use an icon only when it serves a clear function: play/pause, copy, export, check, close, step/expand chevrons. Never place a decorative icon next to a heading, a feature card, a button label or a link. When unsure, leave it out.
3. **Whitespace, type hierarchy and crisp borders, not shadows or heavy boxes.** No drop shadows, glassmorphism, blur or gradients. Prefer hairline-divided lists to grids of boxes. Never nest cards.
4. **One brand color.** Electric Indigo (`bg-primary`) is for primary buttons, the active tab indicator and focus rings only. Emerald (`bg-success`) is for completed checklist items and correct quiz answers only, always with a check glyph.
5. **Two fonts only.** Plus Jakarta Sans for headings and UI; JetBrains Mono strictly for timestamps and code/tool snippets.
6. **Semantic tokens only.** Use `bg-background`, `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `bg-success`. No raw hex values and no one-off Tailwind palette colors (`bg-emerald-500/10`, `text-blue-600`, etc.).
7. **Copy is plain.** No eyebrow labels above headings, no filler marketing claims. Buttons name their action.

## Quality bar

- Support light and dark mode; check both.
- Text contrast ≥ 4.5:1; visible keyboard focus; every control labeled.
- Check layouts at 375px, 768px and 1280px.
- After changing UI files, run `.agent/skills/impeccable/scripts/impeccable.cmd detect --json <changed files>` and fix findings.
- When a request conflicts with these rules, say so and ask rather than silently breaking them.
