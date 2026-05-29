# Diagravix AI UI/UX

## Design Direction

Diagravix AI should feel like a premium modern SaaS product: fast, calm, technical, and polished. Visual references are Linear, Vercel, Framer, Figma, and Notion.

Avoid flashy RGB gamer styling, excessive glow, chaotic gradients, and noisy animation.

## Visual Style

- Dark futuristic SaaS.
- Clean spacing and strong hierarchy.
- Subtle glass surfaces.
- Thin borders and soft shadows.
- Premium typography.
- Smooth but restrained motion.

## Color Tokens

- `--bg-base`: `#07080d`
- `--bg-surface`: `#0d1018`
- `--bg-elevated`: `#121622`
- `--bg-glass`: `rgba(255,255,255,0.04)`
- `--border-subtle`: `rgba(255,255,255,0.08)`
- `--border-strong`: `rgba(255,255,255,0.14)`
- `--text-primary`: `#f7f8ff`
- `--text-secondary`: `#a5adc2`
- `--text-muted`: `#677086`
- `--accent-primary`: `#7c5cff`
- `--accent-cyan`: `#22d3ee`
- `--accent-green`: `#22c55e`
- `--danger`: `#ef4444`

## Typography

- Sans: Inter or Geist.
- Mono: JetBrains Mono or Geist Mono.
- Hero headings: strong, clean, not decorative.
- Editor UI text: compact and scannable.

## Landing Page Structure

1. Navbar.
2. Hero with real product preview.
3. Interactive generation demo.
4. Feature showcase.
5. Diagram examples.
6. Templates showcase.
7. Workflow section.
8. CTA section.
9. Footer.

## Editor Layout

- Top navigation: product, save status, export, share, account.
- Left sidebar: templates, tools, diagram type.
- Center: React Flow canvas.
- Right sidebar: selected node/edge properties.
- Bottom bar: zoom, minimap toggle, status, shortcuts.

## Motion Rules

- Use Framer Motion for page transitions, modals, and hero animations.
- Canvas interactions must prioritize performance over decoration.
- Loading states should feel intelligent: progress, shimmer, or structured build animation.
- Avoid long blocking animations.

## Accessibility

- Keyboard accessible controls.
- Visible focus states.
- Tooltips for icon-only buttons.
- Sufficient contrast.
- Responsive behavior from mobile to wide desktop.
