# Design System Specification: The Ethereal Workspace

## 1. Overview & Creative North Star

This design system is built upon the philosophy of **"The Ethereal Workspace."** In an industry often cluttered with dense data and rigid grids, we are pivoting toward a high-end editorial experience. We treat human management not as a logistical hurdle, but as a calm, curated journey.

The system breaks the "enterprise software" mold by prioritizing **Atmospheric Depth** over structural rigidity. We move away from traditional boxes and lines, opting instead for intentional asymmetry, generous breathing room, and a sophisticated interplay of light and shadow. The goal is to make the user feel as though they are interacting with a series of floating, light-infused planes rather than a static database.

---

## 2. Colors & Surface Philosophy

The palette is rooted in a monochromatic spectrum of light, punctuated by a singular, authoritative Deep Slate (`primary: #515f74`).

### The "No-Line" Rule

**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. Boundaries must be defined through background color shifts. Use the hierarchy of `surface` tokens to define zones:

- **Global Background:** `surface` (#f7f9fb)
- **Primary Work Areas:** `surface_container_lowest` (#ffffff)
- **Secondary Sidebars/Modules:** `surface_container_low` (#f0f4f7)

### Surface Hierarchy & Nesting

Think of the UI as physical layers of fine paper. To create depth without lines:

- Place a `surface_container_lowest` (Pure White) card on top of a `surface_container_low` section. The subtle contrast is the "border."
- For deep nesting, use `surface_container_high` (#e1e9ee) as a base to make inner `surface` elements pop.

### Glass & Gradient Rule

To add "soul" to the minimalism:

- **Glassmorphism:** For floating headers or navigation overlays, use `surface` colors at 80% opacity with a `24px` backdrop-blur.
- **Signature Gradients:** Main CTAs should utilize a subtle linear gradient from `primary` (#515f74) to `primary_dim` (#455367) at a 145-degree angle. This prevents the "flat" look and adds a premium, tactile weight.

---

## 3. Typography

We utilize a dual-font strategy to balance editorial authority with functional clarity.

- **Display & Headlines (Manrope):** Chosen for its modern, geometric construction. Use `display-lg` through `headline-sm` with a `-0.02em` letter-spacing to create a tight, professional "masthead" feel.
- **Body & Labels (Inter):** The workhorse of the system. For `body-md` and `body-sm`, increase tracking to `+0.01em` to ensure legibility against light-gray backgrounds.

**Hierarchy Note:** Always lead with high contrast. A `display-md` title should be paired with a significantly smaller `label-md` uppercase subheader to create a "Big-Small" rhythm typical of high-end magazines.

---

## 4. Elevation & Depth

Elevation is achieved through **Tonal Layering** and **Ambient Light**, never heavy drop shadows.

### The Layering Principle

Do not use shadows for every card. Most "lift" should be achieved by placing a White card on a Light Gray surface. Reserve shadows only for elements that physically move or float (e.g., Modals, Popovers).

### Ambient Shadows

When a floating effect is required:

- **Color:** Use a tinted shadow (`on_surface` @ 6% opacity) rather than pure black.
- **Blur:** Large values (e.g., `40px` blur for a `12px` offset) to mimic soft, natural room light.

### The "Ghost Border" Fallback

If a boundary is required for accessibility (e.g., in a high-density table), use a **Ghost Border**:

- Token: `outline_variant` (#a9b4b9)
- Opacity: **15% max**. It should be felt, not seen.

---

## 5. Components

### Buttons

- **Primary:** Gradient fill (Primary to Primary-Dim), `md` (0.75rem) corner radius, white text.
- **Secondary:** Surface-tinted background (`primary_container`) with `on_primary_container` text. No border.
- **Tertiary:** Ghost style. Pure text with `primary` color, shifting to a `surface_variant` background on hover.

### Input Fields

- **Styling:** Use `surface_container_low` as the background fill. No border.
- **Focus State:** Transition the background to `surface_container_lowest` and apply a 1px `primary` Ghost Border at 30% opacity.
- **Labels:** Use `label-md` in `on_surface_variant`, positioned strictly above the field with 8px spacing.

### Cards & Lists

- **The No-Divider Rule:** Forbid 1px horizontal lines in lists. Separate items using `16px` of vertical white space or by alternating background subtle tones (`surface_container_low` vs `surface`).
- **Cards:** Use `lg` (1rem) corner radius for large dashboard cards. Ensure internal padding is generous (minimum `32px` for desktop).

### Chips

- **Selection:** Pill-shaped (`full` radius). Use `primary_fixed_dim` for selected states to keep the vibe soft and ethereal.

### Progress Elements (New)

- **The "Pulse" Loader:** For an HMS, use a thin, 2px horizontal bar at the top of the container using a gradient from `primary` to `transparent`. Avoid heavy circular spinners.

---

## 6. Do’s and Don’ts

### Do

- **Do** prioritize white space over data density. If a screen feels full, increase the page height or use progressive disclosure.
- **Do** use `display` typography for welcome messages and high-level stats to create a human connection.
- **Do** use the `xl` (1.5rem) corner radius for top-level containers to soften the "tech" feel.

### Don't

- **Don't** use 100% black (#000000). Use `on_surface` (#2a3439) for all text to maintain the soft, charcoal-on-paper aesthetic.
- **Don't** use hard-edged tooltips. All overlays must follow the `md` or `lg` corner radius.
- **Don't** use "Alert Red" for everything. Use the `error` (#9f403d) and `error_container` tokens which are tuned to be legible but not aggressive, maintaining the "Calm" vibe.
