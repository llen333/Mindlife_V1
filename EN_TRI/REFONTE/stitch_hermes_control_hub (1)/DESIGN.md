---
name: Heritage Digital
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#20201f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e5e2e1'
  on-surface-variant: '#e2bfb5'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#a98a81'
  outline-variant: '#5a413a'
  surface-tint: '#ffb5a0'
  primary: '#ffb5a0'
  on-primary: '#5f1500'
  primary-container: '#f65f32'
  on-primary-container: '#531100'
  inverse-primary: '#b02f00'
  secondary: '#e9c176'
  on-secondary: '#412d00'
  secondary-container: '#604403'
  on-secondary-container: '#dab36a'
  tertiary: '#c9c6c2'
  on-tertiary: '#31302d'
  tertiary-container: '#92918c'
  on-tertiary-container: '#2a2a27'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb5a0'
  on-primary-fixed: '#3b0a00'
  on-primary-fixed-variant: '#862200'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#e5e2dd'
  tertiary-fixed-dim: '#c9c6c2'
  on-tertiary-fixed: '#1c1c19'
  on-tertiary-fixed-variant: '#474743'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353535'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  card-gap: 16px
  section-margin: 40px
---

## Brand & Style

The design system embodies the essence of "Tactile Luxury"—a fusion of heritage craftsmanship and modern digital precision. Targeted at high-net-worth users, the UI should evoke the sensation of interacting with a bespoke leather accessory or a precision timepiece. 

The aesthetic is a hybrid of **New Minimalism** and **Skeuomorphic-lite**. It moves away from flat design in favor of subtle depth, physical metaphors, and high-fidelity materials. Every interaction should feel intentional, weighted, and premium. The interface prioritizes quiet confidence over loud patterns, utilizing generous whitespace and obsessive attention to detail to define its high-end positioning.

## Colors

The palette is anchored in deep, cinematic tones to create a sense of exclusivity and focus.

- **Primary (Hermès Orange):** Used sparingly for critical calls to action, active states, and brand moments. It represents energy and heritage.
- **Secondary (Brushed Gold):** Reserved for rewards, premium status indicators, and subtle decorative accents.
- **Backgrounds (Obsidian & Charcoal):** The foundation of the UI is `#0D0D0D` (Deep Obsidian) for the base layer and `#1A1A1A` (Charcoal) for interactive containers.
- **Typography (Cream):** To avoid the harshness of pure white, `#F5F2ED` (Soft Cream) is used for primary text, providing a warmer, more sophisticated legibility.
- **Status Colors:** Use muted versions of standard status colors (e.g., a sage green for success) to maintain the refined atmosphere.

## Typography

Typography is used as a structural element. **Playfair Display** provides the editorial, high-end character required for headings and prominent data points. It should be typeset with slightly tighter tracking in large sizes to feel more cohesive.

**Inter** handles all functional data. It is chosen for its utilitarian clarity, ensuring that complex dashboard controls remain accessible and professional. Use the "Label" styles for UI metadata and buttons, often employing uppercase styling with increased letter spacing to mimic the engraving found on luxury watches.

## Layout & Spacing

The layout follows a **Structured Grid** model optimized for a mobile control center. 

- **Control Tiles:** Instead of lists, the UI is built on a 2-column grid of "tiles." These tiles are square or rectangular (spanning 1 or 2 columns) and act as the primary touch targets.
- **Whitespace:** Use generous vertical margins (40px+) between major sections to allow the design to "breathe," reinforcing the premium feel.
- **Safe Areas:** Maintain a 24px horizontal margin from the screen edges to ensure content does not feel cramped. 
- **Reflow:** On larger devices (tablets), the 2-column grid expands to a 4-column layout, while keeping the tile aspect ratios consistent to maintain the "control center" hierarchy.

## Elevation & Depth

Depth is the primary differentiator of this design system. It is achieved through three specific techniques:

1.  **Glassmorphism:** Secondary controls and overlays use a "Frosted Obsidian" effect—a 20% opacity charcoal fill with a 20px backdrop blur and a 1px inner border (0.1 opacity cream) to simulate light catching the edge of the glass.
2.  **Soft Ambient Shadows:** Elevated cards use dual shadows. A tight, dark shadow for definition and a wide, soft, low-opacity shadow to simulate the card floating above the obsidian base.
3.  **Tonal Recess:** Instead of traditional shadows, some buttons may use a subtle inner shadow to appear "pressed" or "carved" into the surface, emphasizing the skeuomorphic-lite influence.

## Shapes

The shape language is refined and consistent. A **radius of 16px (rounded-lg)** is the standard for all control tiles and cards. This provides a soft, approachable feel without becoming overly "bubbly" or juvenile. 

Interactive elements like input fields and smaller buttons follow a 8px radius. Circular shapes are reserved strictly for progress indicators, profile avatars, and specific toggle handles to provide visual contrast against the predominantly rectangular grid.

## Components

- **Elevated Glass Cards:** The primary container. Features a subtle gradient fill, a 1px stroke for "edge-lighting," and a soft drop shadow.
- **Custom Toggles:** Eschew standard iOS/Android switches. Use a sliding "pill" track in charcoal with a metallic (Secondary color) handle.
- **Elegant Sliders:** Thin tracks with a custom "knurled" handle texture visual. The active portion of the track should be Hermes Orange.
- **Circular Progress:** Use high-contrast strokes. The background track is a faint charcoal, and the progress is a tapered stroke in Gold or Orange.
- **Iconography:** Icons must be 1.5pt or 2pt stroke weight, using a "Premium Line" style. Avoid filled icons unless in an active state.
- **Input Fields:** Use "Floating Label" mechanics with a bottom-border only (1px Cream) to maintain a minimalist, architectural look.
- **Control Tiles:** These are interactive squares containing an icon (top-left), a label (bottom-left), and a status indicator (top-right).