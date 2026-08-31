---
name: Vibrant Marketplace
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#a43a3a'
  on-tertiary: '#ffffff'
  tertiary-container: '#fc7c78'
  on-tertiary-container: '#711419'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3af'
  on-tertiary-fixed: '#410005'
  on-tertiary-fixed-variant: '#842225'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
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
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  2xl: 3rem
  container-max: 1280px
  gutter: 1.5rem
---

## Brand & Style
The design system is built on a foundation of **Modern Professionalism** infused with **Vibrant Energy**. It targets a diverse community of buyers and sellers who value ease of use, security, and a contemporary aesthetic. 

The style utilizes a "Clean & Tonal" approach—combining the clarity of minimalism with the approachability of soft, rounded geometry. The visual narrative emphasizes transparency and growth, using a high-clarity white canvas to let product imagery and community interactions take center stage. The emotional response should be one of confidence, efficiency, and optimism.

## Colors
This design system employs a high-contrast palette against a sterile white background to ensure maximum legibility and brand recognition.

- **Primary Emerald (#10B981):** Represents trust, stability, and growth. Used for primary actions, success states, and brand-critical touchpoints.
- **Secondary Orange (#F59E0B):** Represents energy and urgency. Used sparingly for high-attention calls to action, price highlights, and promotional badges.
- **Neutrals:** A scale of cool grays (from #111827 for text to #F9FAFB for subtle backgrounds) maintains a sophisticated, systematic feel.
- **Semantic Colors:** Use emerald for success, orange for warnings, and standard red/blue for errors and info, ensuring they align with the primary palette's saturation levels.

## Typography
The system uses **Inter** exclusively to achieve a systematic, neutral, and highly readable interface. 

- **Headlines:** Use tighter letter spacing and heavier weights (700-800) to create a strong visual anchor for marketplace categories and product titles.
- **Body Text:** Standard weight (400) with generous line heights (1.5x) to ensure descriptions and reviews remain legible during long browsing sessions.
- **Labels:** Used for metadata, tags, and navigation elements. These should often use a medium or semi-bold weight to distinguish them from body copy.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a maximum container width to maintain readability on ultra-wide displays.

- **Desktop (1280px+):** 12-column grid, 24px gutters, 40px margins.
- **Tablet (768px - 1279px):** 8-column grid, 16px gutters, 24px margins.
- **Mobile (Below 768px):** 4-column grid, 16px gutters, 16px margins.

The spacing rhythm is based on a 4px baseline. Use `lg` (24px) or `xl` (32px) for spacing between major sections to emphasize the "generous whitespace" brand pillar. Use `sm` (8px) for internal component spacing (e.g., icon to text).

## Elevation & Depth
Depth is conveyed through **Ambient Shadows** and **Tonal Layers** rather than harsh lines.

- **Level 0 (Base):** Pure #FFFFFF background.
- **Level 1 (Cards/Surface):** Use a very soft, diffused shadow: `0 4px 20px rgba(0, 0, 0, 0.05)`. This creates a lifted effect without feeling heavy.
- **Level 2 (Interactive/Hover):** Increase shadow spread and slightly darken the shadow: `0 10px 30px rgba(0, 0, 0, 0.08)`.
- **Level 3 (Modals/Overlays):** High-diffusion shadow: `0 20px 50px rgba(0, 0, 0, 0.12)`.

Avoid solid black borders. Use a light neutral stroke (#F3F4F6) only when necessary to define boundaries on white-on-white surfaces.

## Shapes
The shape language is defined by a friendly, **Rounded** aesthetic. 

- **Components (Buttons, Inputs):** 0.5rem (8px) base radius.
- **Containers (Cards, Product Tiles):** 1rem (16px) for standard cards; use 1.5rem (24px) for featured hero sections.
- **Interactive Elements:** Buttons should feel tactile and approachable; avoid sharp 90-degree angles entirely to maintain the "community-focused" feel.

## Components
- **Buttons:** Primary buttons use Emerald Green with white text. Action-oriented or promotional buttons use Vibrant Orange. All buttons feature a 0.5rem radius and a subtle lift on hover.
- **Inputs:** Large, clear input fields with 16px internal padding. Focus states should use a 2px emerald ring.
- **Cards:** Product cards must use the `rounded-lg` (1rem) radius. Apply a soft Level 1 shadow and no border. On hover, the card should transition to Level 2 elevation and the product image may scale slightly (1.02x).
- **Chips/Badges:** Use "Pill" shapes (100px radius) with soft background tints of the primary/secondary colors (e.g., 10% opacity emerald with 100% opacity text).
- **Lists:** Use generous vertical padding (16px) between list items, separated by a light #F3F4F6 divider.
- **Marketplace Specifics:** 
    - **Price Tags:** Bold weights in Emerald Green. 
    - **Trust Badges:** Small icons with Emerald Green accents to reinforce security.
    - **Category Icons:** Encapsulated in soft-colored circles (e.g., a light orange circle for "Electronics").

