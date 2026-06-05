# Design System — cert-trainer

> Source of truth for all visual decisions. Derived from `prototype/cert-trainer-web`.
> Updated: 2026-06-05 | Stack: React 18 + Vite + Tailwind v4 + Framer Motion

---

## 1. Identity & Language

**Character:** minimal utility tool. The user is studying — the interface must stay out of the way.

**Principles:**
- Monospace carries data; sans-serif carries narrative. Never mix within the same element.
- Indigo is the only accent. It means "interactive" or "active". Do not repurpose it for decoration.
- Motion is purposeful: entrance (conveys sequence), feedback (confirms action), progress (communicates state). No idle animation.
- Elevation is flat. `shadow-sm` on cards only. Nothing else has depth.
- Dark mode follows the same language — surface/text roles swap, accent shifts one step lighter.

---

## 2. Color Tokens

### 2.1 Brand (Indigo)

| Token | Tailwind | Hex | Use |
|---|---|---|---|
| `brand` | `indigo-500` | `#6366f1` | Primary button bg, XPBar fill, active nav indicator, focus ring |
| `brand-hover` | `indigo-600` | `#4f46e5` | Button hover, link hover |
| `brand-bg` | `indigo-50` | `#eef2ff` | Domain badge bg, active nav bg, option hover bg (light) |
| `brand-text` | `indigo-600` | `#4f46e5` | Badge text, nav active text, links |
| `brand-bg-dark` | `indigo-950` | `#1e1b4b` | Brand bg in dark mode |
| `brand-text-dark` | `indigo-400` | `#818cf8` | Brand text in dark mode |

### 2.2 Semantic

| State | bg | border | text | Use |
|---|---|---|---|---|
| Correct | `emerald-50` | `emerald-400` | `emerald-800` | Correct option |
| Correct label | `emerald-100` | — | `emerald-600` | XP chip (+20 XP) |
| Correct strong | — | — | `emerald-700` | "✓ Correto!" label |
| Passed | `emerald-50` | — | `emerald-700` | Status pill (passed) |
| Incorrect | `red-50` | `red-400` | `red-800` | Wrong option |
| Incorrect panel | `red-50` | `red-200` | `red-700` | Answer feedback (wrong) |
| Failed | `red-50` | — | `red-700` | Status pill (failed) |
| Warning | `amber-50` | — | `amber-600` | Weak domain chip, medium difficulty badge |

### 2.3 Neutral Scale

| Step | Tailwind | Hex | Role (light) | Dark mode |
|---|---|---|---|---|
| 50 | `gray-50` | `#f9fafb` | Page bg, disabled option bg | gray-950 `#030712` |
| 100 | `gray-100` | `#f3f4f6` | XPBar track, disabled bg | gray-700 `#374151` |
| 200 | `gray-200` | `#e5e7eb` | Card border, sidebar border, option default border | gray-700 `#374151` |
| 300 | `gray-300` | `#d1d5db` | Locked badge text | gray-600 `#4b5563` |
| 400 | `gray-400` | `#9ca3af` | Timestamps, meta, accuracy %, muted mono | gray-500 `#6b7280` |
| 500 | `gray-500` | `#6b7280` | Secondary text, subtitles, ghost button | gray-400 `#9ca3af` |
| 600 | `gray-600` | `#4b5563` | Option text after answer (dimmed correct) | gray-300 `#d1d5db` |
| 700 | `gray-700` | `#374151` | Section labels, list item primary text | gray-200 `#e5e7eb` |
| 900 | `gray-900` | `#111827` | Primary text, headings | gray-50 `#f9fafb` |
| white | `white` | `#ffffff` | Card bg, sidebar bg | gray-900 `#111827` |

### 2.4 Dark Mode CSS Variables

```css
:root {
  --bg-page:        theme('colors.gray.50');
  --bg-surface:     theme('colors.white');
  --bg-surface-alt: theme('colors.gray.50');
  --border:         theme('colors.gray.200');
  --border-subtle:  theme('colors.gray.100');
  --text-primary:   theme('colors.gray.900');
  --text-secondary: theme('colors.gray.500');
  --text-muted:     theme('colors.gray.400');
  --text-subtle:    theme('colors.gray.300');
  --brand:          theme('colors.indigo.500');
  --brand-bg:       theme('colors.indigo.50');
  --brand-text:     theme('colors.indigo.600');
  --track:          theme('colors.gray.100');
}

[data-theme="dark"] {
  --bg-page:        theme('colors.gray.950');
  --bg-surface:     theme('colors.gray.900');
  --bg-surface-alt: theme('colors.gray.800');
  --border:         theme('colors.gray.700');
  --border-subtle:  theme('colors.gray.800');
  --text-primary:   theme('colors.gray.50');
  --text-secondary: theme('colors.gray.400');
  --text-muted:     theme('colors.gray.500');
  --text-subtle:    theme('colors.gray.600');
  --brand:          theme('colors.indigo.400');
  --brand-bg:       color-mix(in srgb, theme('colors.indigo.950') 30%, transparent);
  --brand-text:     theme('colors.indigo.400');
  --track:          theme('colors.gray.700');
}
```

---

## 3. Typography

### 3.1 Fonts

```css
--font-sans: 'Inter', system-ui, sans-serif;    /* optical: 14..32, weights: 400/500/600/700 */
--font-mono: 'JetBrains Mono', monospace;        /* weights: 400/500 */
```

**Rule:** mono is reserved for: scores, XP values, domain codes, timestamps, option labels (A/B/C/D), stat numbers, level indicators. Everything else is sans.

### 3.2 Scale

| Class | Size | Line-height | Weight | Use |
|---|---|---|---|---|
| `text-xs font-mono uppercase tracking-wide` | 12px | — | 400/500 | Domain/difficulty badges, option prefix (A/B), XP chip |
| `text-xs text-gray-400 font-mono` | 12px | — | 400 | Timestamps, locked badge label, meta sub-text |
| `text-sm` | 14px | 1.5 | 400 | Body text, nav items, option text, card content |
| `text-sm font-medium` | 14px | — | 500 | Card labels, list item primary, minor h2 |
| `text-sm text-gray-500` | 14px | — | 400 | Subtitles under page headings |
| `text-base font-medium text-gray-900` | 16px | — | 500 | Section headings (h2) |
| `text-lg font-medium text-gray-900 leading-relaxed` | 18px | 1.625 | 500 | Question text |
| `text-xl font-semibold font-mono text-gray-900` | 20px | — | 600 | Exam result mini-stats |
| `text-2xl font-semibold text-gray-900` | 24px | — | 600 | Page titles (h1) — one per page |
| `text-3xl font-semibold font-mono text-gray-900` | 30px | — | 600 | Dashboard stat card values |
| `text-6xl font-bold font-mono text-gray-900` | 60px | — | 700 | Exam score hero |

### 3.3 Logo / wordmark

```
cert-trainer
```
`text-sm font-semibold text-gray-900 font-mono tracking-tight` — sidebar header only.

---

## 4. Spacing

Tailwind default scale. Key values actually used:

| Tailwind | px | Use |
|---|---|---|
| `0.5` | 2px | Badge `py-0.5` |
| `1` | 4px | Inline gaps |
| `1.5` | 6px | XPBar `h-1.5`, sm button `py-1.5` |
| `2` | 8px | md button `py-2`, mono meta `mt-0.5` gap |
| `3` | 12px | `space-y-3` (domain list, badge grid gap), button cluster `gap-3` |
| `4` | 16px | Card `p-4` (domain items, exam stats), sidebar footer `p-4` |
| `5` | 20px | Card `p-5` (practice domain), sidebar header `py-5` |
| `6` | 24px | Main content `px-6`, sidebar header `px-6` |
| `8` | 32px | Section gap `mt-8`, main content `py-8` |

---

## 5. Border Radius

| Value | Tailwind | Use |
|---|---|---|
| 4px | `rounded` | Inline badges (domain, difficulty, XP chip) |
| 8px | `rounded-lg` | Buttons, option buttons, answer feedback panel, nav items |
| 12px | `rounded-xl` | Cards — primary surfaces |
| 9999px | `rounded-full` | XPBar (track + fill), status pills (passed/failed) |

---

## 6. Shadows & Elevation

| Level | Value | Use |
|---|---|---|
| Flat | none | All surfaces except cards |
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Cards only |

No `shadow-md`, `shadow-lg`, or drop shadows anywhere else.

---

## 7. Grid & Layout

### 7.1 App Shell

```
┌──────────────────────────────────────────────────────────────────┐
│  Sidebar            │  Main (flex-1)                             │
│  w-60 = 240px       │  overflow-auto                             │
│  shrink-0           │                                            │
│  sticky top-0       │  Standard:   max-w-3xl (768px) mx-auto    │
│  h-screen           │              px-6 py-8                     │
│  bg-white           │                                            │
│  border-r gray-200  │  Immersive:  max-w-2xl (672px) mx-auto    │
│                     │              px-6 py-8 (no sidebar)        │
└──────────────────────────────────────────────────────────────────┘
```

### 7.2 Column Grids

| Context | Class | Gap | Items |
|---|---|---|---|
| Dashboard stats | `grid-cols-2` | `gap-4` | 2 stat cards |
| Exam result stats | `grid-cols-3` | `gap-4` | 3 summary cards |
| Profile badges | `grid-cols-3` | `gap-3` | Badge cards |

### 7.3 Sidebar Anatomy

```
┌─────────────────────────┐
│ px-6 py-5               │  ← logo header
│ "cert-trainer" (mono sm)│
│ border-b border-gray-100│
├─────────────────────────┤  flex-1 p-3
│  Dashboard              │  nav: space-y-0.5
│  Praticar               │  each: px-3 py-2 rounded-lg text-sm
│  Simulado               │
│  Revisar                │  inactive: text-gray-500
│  Perfil                 │            hover:text-gray-900 hover:bg-gray-50
│                         │  active:   bg-indigo-50 text-indigo-600 font-medium
├─────────────────────────┤
│ p-4 border-t gray-100   │  ← user footer
│ Name  text-sm medium    │
│ Nível N · X XP (mono xs)│
│ [═══════░░░] XPBar      │
└─────────────────────────┘
```

---

## 8. Dashboard — Tela Principal

```
max-w-3xl mx-auto px-6 py-8

┌──────────────────────────────────────────────────────────────────┐
│  Bom dia, {name}                    ← h1: text-2xl font-semibold │
│  Nível 3 · 480 XP · 🔥 7 dias      ← text-sm font-mono gray-500 │
│  [═══════════════════░░░░░] ← XPBar max-w-xs mt-3               │
│                                                                  │
│  mt-8 → grid-cols-2 gap-4                                        │
│  ┌──────────────────────┐   ┌──────────────────────┐            │
│  │       47             │   │       83%            │            │
│  │ text-3xl mono semibd │   │ text-3xl mono semibd │            │
│  │ questões hoje sm 500 │   │ precisão geral       │            │
│  │ Card p-6 rounded-xl  │   │ Card p-6 rounded-xl  │            │
│  └──────────────────────┘   └──────────────────────┘            │
│                                                                  │
│  mt-8                                                            │
│  Progresso por domínio  ← h2: text-base medium gray-900 mb-4    │
│                                                                  │
│  space-y-3  ← stagger anim (staggerChildren: 0.07s)             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Agentic Architecture              72% [mono gray-400]    │   │
│  │ [═══════════════════░░░░░░░░] XPBar                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│  (× 5 domains, Card p-4)                                        │
│                                                                  │
│  mt-8  gap-3                                                     │
│  [Praticar agora →]  [Ver simulado]                             │
│   Button primary md   Button secondary md                       │
└──────────────────────────────────────────────────────────────────┘
```

---

## 9. Component Patterns

### 9.1 Button

```
Base: inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors
Focus: focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
Disabled: opacity-50 cursor-not-allowed
Motion: whileHover scale(1.01) | whileTap scale(0.99) | duration 0.15s
```

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| `primary` | `indigo-500` | `white` | — | `indigo-600` |
| `secondary` | `white` | `gray-700` | `gray-200` | `bg-gray-50` |
| `ghost` | transparent | `gray-500` | — | `text-gray-900 bg-gray-100` |

| Size | Padding | Text |
|---|---|---|
| `sm` | `px-3 py-1.5` | `text-xs` |
| `md` | `px-4 py-2` | `text-sm` |
| `lg` | `px-6 py-3` | `text-base` |

```
┌────────────────────────────┐   ┌────────────────────────────┐   ┌──────────────┐
│  Praticar agora →          │   │  Ver simulado              │   │  ✕ Sair      │
│  primary md                │   │  secondary md              │   │  ghost sm    │
└────────────────────────────┘   └────────────────────────────┘   └──────────────┘
```

### 9.2 Card

```
bg-white border border-gray-200 rounded-xl shadow-sm
```

Padding variants (do not add without reason):
- `p-4` — domain list rows, exam result per-domain, answer feedback panel
- `p-5` — practice domain selection rows
- `p-6` — dashboard stat cards

```
┌─────────────────────────────────────────────────────┐
│                                                     │  rounded-xl, border-gray-200, shadow-sm
│  [children]                                         │  bg-white (or --bg-surface in dark)
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 9.3 Badges (inline chips)

All share: `text-xs font-mono uppercase tracking-wide px-2 py-0.5 rounded`

| Type | bg | text |
|---|---|---|
| Domain | `indigo-50` | `indigo-600` |
| Difficulty EASY | `emerald-50` | `emerald-600` |
| Difficulty MEDIUM | `amber-50` | `amber-600` |
| Difficulty HARD | `red-50` | `red-600` |
| XP chip | `emerald-100` | `emerald-600` — `px-1.5` (narrower) |
| Weak domain | `amber-50` | `amber-600` — `text-xs` no uppercase tracking |

```
[AGENTIC]   [MCP]   [EASY]   [MEDIUM]   [HARD]   [+20 XP]
```

### 9.4 XPBar (ProgressBar)

```
Track: bg-gray-100 (--track) rounded-full h-1.5 overflow-hidden
Fill:  bg-indigo-500 (--brand) rounded-full h-full
       motion: animate width 0→{pct}% | duration 0.8s easeOut | delay 0.15s
```

Context max-width:
- Sidebar footer: natural width (full aside width minus p-4)
- Dashboard subtitle: `max-w-xs`
- Domain progress rows: full card width
- In-question progress: full immersive header width

### 9.5 Option Button (QuestionView)

```
Base: w-full text-left p-4 rounded-lg border transition-all text-sm
```

| State | border | bg | text |
|---|---|---|---|
| Default | `gray-200` | transparent | `gray-700` |
| Hover (unanswered) | `indigo-300` | `indigo-50` | `gray-700` |
| Correct | `emerald-400` | `emerald-50` | `emerald-800` |
| Wrong (selected) | `red-400` | `red-50` | `red-800` |
| Dimmed (other after answer) | `gray-100` | `gray-50` | `gray-400` |

Prefix label: `font-mono text-xs text-gray-400 mr-2` (A, B, C, D)
Motion (unanswered only): `whileHover scale(1.005) | whileTap scale(0.995)`

```
┌────────────────────────────────────────────────────────────────┐
│  A  Coordena subagentes e delega tarefas especializadas  ✓     │  emerald state
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  B  Executa diretamente todas as ferramentas disponíveis       │  red state
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  C  Armazena o estado de longo prazo do sistema                │  dimmed state
└────────────────────────────────────────────────────────────────┘
```

### 9.6 Answer Feedback Panel

```
Outer: mt-6 p-4 rounded-lg border
       correct: border-emerald-200 bg-emerald-50
       wrong:   border-red-200    bg-red-50

Label: text-sm font-medium
       correct: text-emerald-700
       wrong:   text-red-700

XP chip (correct only): text-xs font-mono bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded ml-2

Explanation trigger: text-sm text-indigo-600 hover:text-indigo-700 mt-2 transition-colors
Explanation body:    text-sm text-gray-600 mt-2 leading-relaxed
```

```
┌──────────────────────────────────────────────────────────────┐
│ ✓ Correto!  [+20 XP]                                        │  emerald panel
│ [Ver explicação com IA ✦]  ← link-style button              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ ✗ Incorreto                                                  │  red panel
│ [Ver explicação com IA ✦]                                    │
└──────────────────────────────────────────────────────────────┘
```

### 9.7 Immersive Header (QuestionView / ExamView)

```
bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10
```

Internal layout (max-w-2xl mx-auto):
```
flex items-center gap-4

[✕ Sair]   N / TOTAL  [════════════════░░░░░░░░░░░]
ghost sm   xs mono     h-1.5 progress bar (flex-1)
           gray-400
```

### 9.8 Status Pill (ExamResult)

```
inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-sm font-medium
passed: bg-emerald-50 text-emerald-700
failed: bg-red-50    text-red-700
```

```
┌──────────────────┐   ┌──────────────────┐
│  ✓ Aprovado      │   │  ✗ Não aprovado  │
└──────────────────┘   └──────────────────┘
```

### 9.9 Session History Row (Profile)

Inside a Card with `divide-y divide-gray-100`:
```
px-4 py-3 flex items-center justify-between

Left:  label text-sm text-gray-700
       date  text-xs font-mono text-gray-400 mt-0.5

Right: [+280 XP]  text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded
```

Motion: `initial opacity-0 x:-8 | whileInView opacity-1 x:0 | delay i*0.05s viewport once:true`

---

## 10. Motion System

| Name | Properties | Duration | Ease | Delay | Use |
|---|---|---|---|---|---|
| `page-enter` | opacity 0→1, y 16→0 | 0.4s | easeOut | — | Page h1 + subtitle block |
| `card-enter` | opacity 0→1, y 16→0 | 0.35s | easeOut | stagger | Stat cards in dashboard |
| `list-item` | opacity 0→1, y 12→0 | 0.35s | easeOut | stagger | Domain/history list items |
| `stagger-container` | staggerChildren: 0.07s | — | — | — | ul/div wrapping staggered items |
| `badge-pop` | opacity 0→1, scale 0.88→1 | 0.25s | easeOut | stagger 0.06s | Badge grid |
| `question-enter` | opacity 0→1, y 12→0 | 0.25s | easeOut | — | Question card (AnimatePresence wait) |
| `question-exit` | opacity 0, y -8 | 0.25s | easeOut | — | Question card exit |
| `answer-panel` | opacity 0→1, y 12→0 | 0.3s | easeOut | — | Answer feedback panel |
| `history-row` | opacity 0→1, x -8→0 | 0.3s | easeOut | i*0.05s | Session history (whileInView) |
| `button` | scale 1.01 / 0.99 | 0.15s | — | — | All buttons (hover/tap) |
| `xpbar-fill` | width 0→{pct}% | 0.8s | easeOut | 0.15s | XPBar animated fill |

Rules:
- `AnimatePresence mode="wait"` on question container — fully exits before next enters.
- `viewport={{ once: true }}` on scroll-triggered items — no re-animation on scroll back.
- Never animate color, only transform + opacity.
