```markdown
# Design System Strategy: Premium Black Evolution

## 1. Overview & Creative North Star: "The Stealth Architect"
This design system moves away from the "standard dark mode" into a realm of high-end, luxury tech. Our Creative North Star is **"The Stealth Architect."** Like a high-performance supercar or a bespoke timepiece, the UI does not scream for attention; it commands it through precision, deep tonality, and intentional negative space.

We reject the "boxed-in" layout of traditional SaaS. Instead, we utilize **Asymmetric Weighting**—placing high-contrast typography against vast expanses of pure `#000000` to create an editorial feel. Elements should feel like they are floating in a void, held together by gravitational pull rather than rigid grid lines.

---

## 2. Color Mastery & The Tonal Void
The palette is rooted in absolute darkness to take full advantage of OLED hardware, creating infinite contrast.

### The Palette
- **Deep Core:** `surface` (#131313) and `surface_container_lowest` (#0E0E0E) serve as our primary canvas.
- **The Lumina Accent:** Our signature purple (`inverse_primary`: #4F44E2) is no longer a utility color. Use it as a "laser-sight"—sparingly, for critical calls to action or a single high-end data point.
- **On-Surface:** Use `on_surface` (#E2E2E2) for primary headers to ensure a crisp, high-end "paper-on-ink" contrast.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined through:
1. **Background Shifts:** Placing a `surface_container_low` (#1B1B1B) card against the `surface` (#131313) background.
2. **Negative Space:** Using the `12` (4rem) or `16` (5.5rem) spacing tokens to create mental boundaries without visual clutter.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, obsidian-like sheets. 
- **Base Level:** `surface` (#131313).
- **Secondary Level:** `surface_container` (#1F1F1F) for global navigation or sidebars.
- **Primary Content:** `surface_container_low` (#1B1B1B) for main cards.
- **Glass & Gradient:** For high-end floating elements (e.g., Modals), use `surface_bright` at 60% opacity with a `20px` backdrop-blur.

---

## 3. Typography: Editorial Authority
We use **Plus Jakarta Sans** not as a functional font, but as a brand anchor.

- **Display Scales:** Use `display-lg` (3.5rem) with `tight` letter-spacing (-0.02em) for hero moments. The high-contrast white against pure black should feel like a premium magazine spread.
- **The Hierarchy of Truth:**
    - **Headlines:** Always `on_surface` (#E2E2E2) for maximum readability.
    - **Body:** Use `on_surface_variant` (#C7C4D8) to create a sophisticated, slightly dimmed secondary layer that reduces eye strain.
    - **Labels:** Use `label-sm` in all-caps with `0.1rem` tracking for a "technical readout" aesthetic.

---

## 4. Elevation & Depth: Tonal Layering
In a "Premium Black" system, shadows are often invisible. We replace them with **Tonal Layering**.

- **The Layering Principle:** Depth is achieved by "stacking." A `surface_container_highest` (#353535) element should only be used for the smallest, most interactive components (like toggles) to make them "pop" against the darker base.
- **Ambient Shadows:** For floating modals, use a shadow with a `40px` blur, 4% opacity, using the `primary` (#C4C0FF) hue. This creates a subtle purple "aura" rather than a grey smudge.
- **The Ghost Border:** If a containment line is required for accessibility, use `outline_variant` (#464555) at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Precision Engineered

### Buttons
- **Primary:** Gradient from `primary` (#C4C0FF) to `inverse_primary` (#4F44E2). Use `full` (9999px) roundedness for a sleek, aero-dynamic look.
- **Secondary:** Transparent background with a "Ghost Border" and `on_surface` text.
- **Tertiary:** Pure text using `label-md` with an underline that only appears on hover.

### Input Fields
- **State:** No background fill. Use a bottom-only `outline_variant` (#464555) line. 
- **Focus State:** The line transitions to `primary` (#C4C0FF) with a subtle outer glow (0px 0px 8px).

### Cards
- **Construction:** Strictly forbid divider lines within cards. Use `spacing-4` (1.4rem) to separate internal headers from body text.
- **Surface:** Use `surface_container_lowest` (#0E0E0E) to create a "sunken" effect or `surface_container_high` (#2A2A2A) for a "raised" effect.

### Interactive "Stealth" Chips
- Used for filtering. Instead of a solid background, use a `surface_variant` (#353535) subtle background with `0.25rem` (DEFAULT) corner radius. When active, the text flips to `primary`.

---

## 6. Do’s and Don’ts

### Do:
- **Embrace the Dark:** Allow large areas of the screen to remain `#000000`. This is luxury.
- **Use Subtlety:** A change from `#131313` to `#1B1B1B` is enough to signify a new section.
- **Type as Art:** Use `display-md` for numbers and data to make them feel like architectural features.

### Don't:
- **No Pure White Backgrounds:** Never use white for surfaces. It breaks the "Stealth" immersion.
- **Avoid Heavy Borders:** Standard 1px solid borders at 100% opacity are strictly forbidden.
- **Don't Over-Purple:** If the screen feels "Purple," you've used too much. The purple is a spark in the dark, not a wash.
- **No Harsh Shadows:** Avoid default `black` drop shadows; they are invisible on our background and create "muddy" edges. Use Tonal Layering instead.```