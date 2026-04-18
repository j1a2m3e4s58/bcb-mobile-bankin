# Design Brief

## Direction

**BCB Banking System** — Premium fintech platform for Bawjiase Community Bank, Ghana. Trust-forward, modern, mobile-first with strong green brand authority and gold prosperity accents.

## Tone

Refined fintech minimalism with confident color authority — not corporate blue, but Ghana-rooted forest green that signals banking security and African prosperity through gold highlights.

## Differentiation

Green-dominant banking UI (vs. industry blue) with card-based elevation hierarchy, Ghana-specific color psychology, and subtle motion choreography that builds micro-interactions into confidence markers.

## Color Palette

| Token | OKLCH | Role |
| --- | --- | --- |
| background | 0.97 0.008 145 | Light cream (L-mode); elevated card surfaces on clean canvas |
| foreground | 0.18 0.012 148 | Deep green text; maintains 14+ contrast on backgrounds |
| card | 0.99 0.005 0 | Pure white elevated surfaces; float above background with shadows |
| primary | 0.45 0.18 148 | Forest green #1B7A3E; buttons, headers, active states, brand anchor |
| secondary | 0.32 0.12 148 | Dark green #145C2E; depth, secondary nav, muted interactions |
| accent | 0.65 0.18 63 | Gold #F5A623; success confirmations, transaction highlights, prosperity markers |
| muted | 0.93 0.008 145 | Light gray; disabled states, secondary text, section dividers |
| destructive | 0.55 0.22 25 | Red alert; errors, fraud warnings, delete actions |

## Typography

- **Display**: Space Grotesk — geometric, confident headers for dashboard balances and transaction titles (5xl bold)
- **Body**: General Sans — clean UI labels, transaction lists, form inputs, account details (base/lg)
- **Mono**: Geist Mono — account numbers, transaction IDs, amounts for precision (sm/md)
- **Scale**: Hero `text-5xl font-bold tracking-tight`, h2 `text-3xl font-bold`, label `text-xs font-semibold uppercase tracking-widest`, body `text-base`

## Elevation & Depth

Surface hierarchy via shadow escalation: card containers use subtle elevation shadow, modals/popovers use elevated shadow. No gradients or blur; clean layering via OKLCH lightness variance and precise shadows.

## Structural Zones

| Zone | Background | Border | Notes |
| --- | --- | --- | --- |
| Header | card (white L-mode, dark L-mode) | border bottom (0.5px) | BCB logo + greeting + balance peek |
| Nav Bottom | card with elevation | border top (1px) | Fixed bottom navigation; 5 icons (Dashboard, Transfers, Payments, Cards, Profile) |
| Content Section | background (cream L-mode) | — | Spacious 24px padding; card-based grouping |
| Card (balance) | card + shadow-card | — | 12px radius; green tint header zone with white text |
| Card (transaction) | card + shadow-card | border bottom subtle | 12px radius; list-type layout |
| Footer | muted/20 | border top (1px) | Support links, version info |

## Spacing & Rhythm

Mobile-first 24px base grid; sections gap 16px within content area, 24px between major sections. Micro-spacing: button padding 12px/16px, form spacing 16px, card padding 16px. Bottom nav reserve 80px on mobile.

## Component Patterns

- **Buttons**: Primary (bg-primary text-white 12px radius), Secondary (border-2 border-primary), Ghost (text-primary underline on hover)
- **Cards**: bg-card shadow-card 12px radius 16px padding; alt: 8px radius for list items
- **Badges**: Accent gold for success; red for errors; secondary green for pending
- **Forms**: 12px radius inputs, label above with `text-xs font-semibold uppercase`, focus state green ring
- **Bottom nav**: 5 equal-width icons; active item primary green with 3px top border accent

## Motion

- **Entrance**: Fade-in 0.4s on page load; staggered slide-in-up 0.3s per card list item
- **Hover**: Color transition-smooth (0.3s) on buttons/cards; scale 1.02 on interactive elements
- **Decorative**: Logo entrance animation (2s scale + fade) on splash screen; loading pulse on pending states

## Constraints

- Mobile-first responsive; bottom nav fixed, content scrollable
- AA+ contrast maintained; never exceed 2 font families
- Card-only elevation; no full-page gradients
- Max 5 semantic colors; use only OKLCH CSS vars, no hex/rgb in components
- BCB logo must appear on splash, login, dashboard header

## Signature Detail

**Animated splash logo entrance** — BCB circular eagle emblem scales from 0.8 opacity + 80% scale into full prominence over 2 seconds with ease-out, establishing brand trust and motion confidence before dashboard load.

