# Verbarium Design System · v1

Direção visual: **aprendizado leve, sem excesso de decoração**. Tipografia Fredoka para títulos e Nunito para textos. Fundo lavanda claro, superfícies off-white, ilustrações e ícones consistentes.

| Função | Token | Cor |
| --- | --- | --- |
| Navegação ativa | `--vb-violet` | #8055ed |
| Ação principal | `--vb-sky` | #2d9cf4 |
| Energia e desafios | `--vb-sun` | #ffb43c |
| Feedback positivo | `--vb-mint` | #e5f7e5 |
| Texto | `--vb-ink` | #282047 |
| Superfície | `--vb-paper` | #fbfaff |

**Motion**: duração de entrada 380ms, movimento de 6–12px e stagger de 45ms. Respeitar `prefers-reduced-motion`; transições não devem impedir respostas ou navegação.

**Responsividade**: sidebar ampla no desktop, compacta no tablet e barra de cinco ações no celular. O conteúdo rola, a navegação fica disponível. Os estados de acerto, erro e revisão são semânticos e acessíveis.

**Não fazer**: métricas inventadas, ranking falso, modais decorativos, gradientes indiscriminados, ícones sem padronização ou cores de pouco contraste.


## Verbarium Art Direction V9 · 2026-11-16

V9 unifies the main learning experience, Academy, onboarding and the component gallery around one original visual language. It borrows interaction principles from successful language-learning products without copying their branded artwork.

### Visual tokens
- Violet action: `#5B3EE6`; deep violet: `#452EAA`; lavender: `#D9C8FF`.
- Warm orange accent: `#FF8A3D`; achievement yellow: `#FFC942`.
- Cream surface: `#FFF8F0`; canvas: `#F8F6FB`; ink: `#352653`.
- 4 px spacing base; 12 / 14 / 17 / 21 / 28 px radii by component scale.
- Icons use 24 × 24 SVG viewBoxes with 2.2 px rounded strokes. Touch controls stay at least 44–48 px; primary actions use a 3–4 px pressed-depth cue.
- Shadows separate planes; they do not imitate inflated plastic or replace borders.

### Asset rules
- Section backgrounds live in `/ui-kit/backgrounds/` as standalone scalable SVGs: home, academy, lesson, practice, conversation, profile, onboarding, celebration, premium and neutral.
- Mascot and reward artwork remains a separate image layer. Never crop the fox into a button or bake interface copy into artwork.
- Buttons, cards, labels, progress and answer states remain native HTML/CSS. Raster artwork is reserved for illustration slots, not stretched control surfaces.
- Each background keeps open space for content and is used with `cover` only in decorative regions; important foreground assets use `contain` to avoid clipping.
- Reduced-motion preferences and visible keyboard focus remain supported.

### Learning flow
1. Resume the next unfinished lesson with one primary CTA.
2. Show actual streak, completed lessons and pending reviews.
3. Make the lesson path the central progression surface.
4. Present daily missions with progress and a direct route to the relevant activity.
5. Offer distinct practice modes (lessons, exercises, conversation, verbs, visual vocabulary and sentence building).
6. Keep Academy as a separate guided-learning destination, not a duplicate promo mixed into the path.

The V9 home removes duplicate teasers and repeated quick-action rows while keeping their routes accessible through the activity grid. Scoring, persisted progress, speech and lesson navigation are not replaced by the visual layer.
