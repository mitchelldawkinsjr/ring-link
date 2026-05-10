---
name: Apex Combat Aesthetic
colors:
  surface: '#1d100d'
  surface-dim: '#1d100d'
  surface-bright: '#473532'
  surface-container-lowest: '#180b08'
  surface-container-low: '#271815'
  surface-container: '#2b1c19'
  surface-container-high: '#362623'
  surface-container-highest: '#42312e'
  on-surface: '#f8dcd7'
  on-surface-variant: '#e3beb8'
  inverse-surface: '#f8dcd7'
  inverse-on-surface: '#3d2c29'
  outline: '#aa8984'
  outline-variant: '#5a403c'
  surface-tint: '#ffb4a8'
  primary: '#ffb4a8'
  on-primary: '#690000'
  primary-container: '#d83f2e'
  on-primary-container: '#140000'
  inverse-primary: '#b52518'
  secondary: '#ffb4a8'
  on-secondary: '#5e170e'
  secondary-container: '#7f2f24'
  on-secondary-container: '#ff9f90'
  tertiary: '#ebc078'
  on-tertiary: '#422c00'
  tertiary-container: '#b18a48'
  on-tertiary-container: '#3a2600'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#920502'
  secondary-fixed: '#ffdad4'
  secondary-fixed-dim: '#ffb4a8'
  on-secondary-fixed: '#400201'
  on-secondary-fixed-variant: '#7c2d22'
  tertiary-fixed: '#ffdeab'
  tertiary-fixed-dim: '#ebc078'
  on-tertiary-fixed: '#281900'
  on-tertiary-fixed-variant: '#5f4103'
  background: '#1d100d'
  on-background: '#f8dcd7'
  surface-variant: '#42312e'
typography:
  display-lg:
    fontFamily: Anybody
    fontSize: 72px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-xl:
    fontFamily: Anybody
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Anybody
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md-mobile:
    fontFamily: Anybody
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: '8'
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  section-gap: 80px
---

## Brand & Style

The design system is engineered to evoke the high-stakes intensity of professional combat sports while maintaining the surgical precision of a high-end fintech platform. It balances **Athletic Aggression** with **Technical Authority**, positioning the marketplace as a premium venue for elite talent and promoters.

The visual style is a hybrid of **Glassmorphism** and **High-Contrast Modernism**. Moving from a legacy gold feel toward a visceral "Arena Intensity" aesthetic, it utilizes warm, blood-tinged stone tones and aggressive crimson accents to provide urgency and gravity. The aesthetic prioritizes power and impact, using generous whitespace to ensure that even the most data-heavy talent profiles feel curated and professional rather than cluttered.

## Colors

This design system is strictly **Dark Mode First**. The color palette is designed to create a "Main Event" atmosphere focused on adrenaline and tactical precision:

*   **Core Canvas**: A dark, warm-neutral foundation. The background utilizes deep obsidian with warm-taupe undertones (#88726e influenced neutrals) to define elevated surfaces and containers with a subtle organic heat.
*   **Crimson Peak**: The primary color (#d83f2e) is used for high-tier calls to action, active states, and elements denoting "In the Red" intensity or premium achievement. It is a bold, striking red that demands attention.
*   **Dust & Sand**: The secondary color (#b95b4d) provides a muted, terracotta-inspired contrast for secondary actions and UI accents, reinforcing the theme of grit and the desert-heat of the arena.
*   **Deep Ochre**: The tertiary color (#5b3e00) is reserved for specialized data points, technical metrics, and status indicators, providing a dark, earthy counterpoint to the vibrant primary red.

## Typography

The typography system pairs the high-energy, variable nature of **Anybody** for headlines with the utilitarian clarity of **Inter** for UI and body text.

*   **Headlines**: Use **Anybody** with a heavy weight (700-800). This typeface's athletic, slightly aggressive stance mirrors the power of the talent featured. For display text, use tight letter spacing to increase visual impact.
*   **Body & UI**: Use **Inter** for all functional text. It provides a clean, "SaaS-grade" readability that balances the loud headlines. 
*   **Labels**: Use uppercase Inter with increased letter spacing for small metadata, such as weight classes, win/loss records, or location tags, to create a technical, data-driven feel.

## Layout & Spacing

This design system utilizes a **12-column fixed grid** for desktop and a **4-column fluid grid** for mobile. The layout philosophy is centered around "Premium Breathing Room"—large margins and substantial vertical gaps between sections to prevent the dark UI from feeling claustrophobic.

*   **Rhythm**: All spacing follows an 8px base unit (Theme spacing: 2). 
*   **Sectioning**: Major content blocks are separated by 80px-120px gaps to ensure focus on one talent or metric at a time.
*   **Inner Padding**: Component internal padding is generous (minimum 24px for cards) to support the "Glassmorphism" effect and prevent content from crowding the rounded corners.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Glassmorphic semi-transparency** rather than traditional heavy shadows.

*   **Base (Level 0)**: The deepest neutral surface—used for the primary background.
*   **Surface (Level 1)**: Muted warm-stone—used for cards and main containers.
*   **Floating (Level 2)**: Glassmorphism effect. A background blur of 20px-40px applied to surfaces with a 60% opacity fill. This is used for navigation bars and hovering elements.
*   **Borders**: Instead of shadows, use 1px "inner-glow" borders. Use a subtle linear gradient on the border (Top-left to bottom-right) from the Dust & Sand secondary color (20% opacity) to Transparent to simulate light hitting a sharp edge.

## Shapes

The shape language is consistently **Rounded (0.5rem - 1.5rem)**. This softens the aggressive typography and reinforces the modern technology platform feel.

*   **Cards & Containers**: Use `rounded-lg` (16px) for major talent cards and dashboard widgets.
*   **Buttons & Tags**: Use `rounded-md` (8px) for buttons to maintain a structured, professional feel.
*   **Visual Interest**: Use perfect circles for reputation score rings and "Verified" badge backdrops.

## Components

### Visual Talent Cards
Large-format cards featuring high-contrast athlete photography. On hover, the card should scale slightly (1.02x) and the border-opacity should increase from 10% to 40% Crimson Peak. The bottom 30% of the card uses a dark neutral gradient overlay to ensure legibility of the talent name and stats.

### Reputation Rings
Circular progress indicators using the **Deep Ochre (#5b3e00)** tone. The ring uses a thick stroke (4px-8px) with a subtle glow. The center of the ring displays the numerical score in bold Anybody typeface.

### Action Buttons
*   **Primary**: Solid Crimson Peak (#d83f2e) with dark neutral text. High contrast, bold weight.
*   **Secondary/Ghost**: Transparent background with a 1px Dust & Sand border. Used for "View Profile" or "Message" actions.

### Verified Badges
A small, circular badge in Crimson Peak with a white checkmark. In high-tier profiles, this badge includes a subtle outer "pulsing" animation to denote elite status.

### Data Visualizations
Athletic progress indicators should use horizontal bars with a gradient fill from Dust & Sand to Crimson Peak, emphasizing heat, progression, and intensity.

### Input Fields
Deep neutral backgrounds with a 1px stone border that transitions to Crimson Peak on focus. Use Inter for placeholder text at 40% opacity.