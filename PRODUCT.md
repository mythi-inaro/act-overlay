# Product

## Register

product

## Users

Raid and static players in FFXIV who glance at combat meters mid-fight. They are in active combat or between pulls, attention split between mechanics and performance readouts. They need numbers and rankings at a glance without breaking focus on the encounter.

## Product Purpose

A live combat telemetry HUD overlay for FFXIV, fed by IINACT/OverlayPlugin WebSocket data. Surfaces DPS, HPS, damage taken, and healing received in draggable, configurable meter blocks. Success means instant legibility during combat, stable performance as an in-game overlay, and a visual identity that feels like precision instrumentation—not a web dashboard pasted on the screen.

## Brand Personality

Precise · Tactical · Understated

The overlay is an instrument panel: void-black glass, electric mint telemetry accent, role-colored bars, Figtree typography throughout. Confidence comes from clarity and restraint, not decoration.

## Anti-references

- Generic SaaS dashboards: Inter/system fonts, purple-to-blue gradients, card-in-card layouts, rounded-square icon tiles, gray muted text on tinted backgrounds
- Template "modern UI" patterns that read as AI-generated rather than purpose-built HUD chrome
- Visual noise that competes with game UI during combat (heavy glow, bounce easing, decorative gradients)

## Design Principles

1. **Glanceable under pressure** — hierarchy, contrast, and spacing optimized for split-second reads mid-fight.
2. **HUD, not website** — transparent background, dense type, performance-first live mode; effects dial back in-game.
3. **Preserve the lane** — Obsidian Telemetry identity (void glass, mint accent, role colors) is the anchor; refine, don't reinvent.
4. **Instrument over ornament** — every pixel earns its place; motion and glow serve state, not decoration.
5. **Combat-ready performance** — live overlay mode strips expensive GPU work; animations respect `prefers-reduced-motion`.

## Accessibility & Inclusion

- Target WCAG AA where feasible (contrast on primary text and meter labels).
- Respect `prefers-reduced-motion` (already enforced via CSS duration tokens).
- Config mode and context menus should remain usable with keyboard and clear focus states.
- Accept HUD density tradeoffs: small type is intentional for in-game overlay use, but primary values and labels must stay legible against void/glass surfaces.
