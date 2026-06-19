# Quanta Ops — UI/UX Design Guidelines
> Builder · Deployer · Client App | Angular 18 | April 2026

---

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [Design Principles](#2-design-principles)
3. [Typography](#3-typography)
4. [Color System](#4-color-system)
5. [Spacing and Layout](#5-spacing-and-layout)
6. [Component Sizing Standards](#6-component-sizing-standards)
7. [Interactive States](#7-interactive-states)
8. [Icons and Imagery](#8-icons-and-imagery)
9. [Motion and Animation](#9-motion-and-animation)
10. [Accessibility](#10-accessibility)
11. [Responsive Design](#11-responsive-design)
12. [Critical User Flows](#12-critical-user-flows)
13. [Builder-Specific UX Rules](#13-builder-specific-ux-rules)
14. [Error Handling and Feedback](#14-error-handling-and-feedback)
15. [Shared Component Library](#15-shared-component-library)
16. [Do's and Don'ts](#16-dos-and-donts)

---

## 1. Purpose and Scope

This document defines the **UI and UX standards** that all engineers and designers must follow when building or modifying any Quanta Ops interface — Builder, Deployer, or Client App.

It exists alongside the feature specs (`Frontend_Screen_Spec.md`, `Frontend_UI_Components_Guide.md`) and the architecture doc (`ARCHITECTURE.md`). Those docs define **what** to build and **how to build it technically**. This doc defines **how it must look and feel**.

### Three Apps, One Design System

| App | Users | Theme | Min Viewport |
|-----|-------|-------|-------------|
| **Builder** (`builder.quantaops.io`) | Developers building apps | Light | 1280px |
| **Deployer** (`admin.quantaops.io`) | Internal staff / operations | Dark chrome, light canvas | 1024px |
| **Client App** (`app.quantaops.io`) | End users of built apps | Light, fully responsive | 320px |

All three apps share the same design token system (`@qo/ui-components`) and the same shared component library. App-specific surfaces (Deployer dark chrome, Builder canvas, Client App page surface) extend the base token set — they do not replace it.

### What This Document Covers

- Typography scale, font sizes, weights, and line height
- Color tokens (with correct `--qo-color-*` naming) and usage rules
- Spacing system and layout grid
- Button, input, and control sizing
- Interactive states (hover, focus, active, disabled, error)
- Critical user flow UX rules
- Accessibility requirements
- Feedback, error, and empty state patterns
- Shared `qo-` component catalog and usage rules

### What This Document Does Not Cover

- Backend API contracts
- Angular component architecture patterns (see `ARCHITECTURE.md`)
- Widget-specific configuration logic

---

## 2. Design Principles

These five principles govern every design decision across Quanta Ops.

### 2.1 Clarity Over Cleverness

Every element on screen must earn its place. Avoid decorative UI that adds noise without purpose. Labels, placeholders, and helper text must be written in plain language — no jargon builders or end users would not immediately understand.

### 2.2 Low Cognitive Load

A builder working on forms and pages should focus on the task, not on figuring out the tool. Keep configuration panels predictable. Use consistent patterns for repeated interactions like drag, select, and configure. Never make the user hunt for an action.

### 2.3 Immediate Feedback

Every action must produce a visible response within 200ms. If an operation takes longer, show a loading indicator. Do not leave the user guessing whether their click registered.

### 2.4 Safe Defaults

Destructive actions — delete, publish, overwrite — must require at least one confirmation step. Default options in forms and settings should represent the safest and most common choice, not a blank state that forces manual setup.

### 2.5 Consistent Interaction Patterns

If dragging works one way in the chart picker, it works the same way in the form picker and the button showcase. Shared behaviors must look and behave identically across all widget types. Always use `qo-` shared components — never re-implement UI from scratch.

---

## 3. Typography

### 3.1 Font Families

| Role | Font | Fallback |
|------|------|----------|
| UI and body text | `Inter` | `system-ui`, `sans-serif` |
| Code editor, snippets, ZML | `JetBrains Mono` | `Fira Code`, `monospace` |

Load via Google Fonts or self-host for performance. Avoid system default fonts in any designed UI surface.

### 3.2 Type Scale

This scale applies across all three apps. Use the role name — not arbitrary pixel values — when writing styles.

| Role | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| `display-lg` | 28px | 700 | 1.2 | -0.02em | Page titles, modal headers |
| `display-sm` | 22px | 600 | 1.3 | -0.01em | Section headings, panel titles |
| `heading` | 18px | 600 | 1.3 | 0 | Card titles, widget labels |
| `subheading` | 15px | 600 | 1.4 | 0 | Config section labels, tab labels |
| `body-lg` | 15px | 400 | 1.5 | 0 | Primary readable body text |
| `body` | 13px | 400 | 1.5 | 0 | Default UI text, settings content |
| `body-sm` | 12px | 400 | 1.5 | 0 | Helper text, captions, status labels |
| `label` | 12px | 500 | 1.4 | 0.02em | Form field labels, input labels |
| `code` | 13px | 400 | 1.6 | 0 | ZML/HTML snippet editor |

### 3.3 Typography Rules

- **Minimum font size is 12px.** Never go below this, even for secondary labels or badges.
- **Never use more than two font weights in a single component.** Use 400 for body, 500 for labels, 600–700 for headings.
- **Truncate long text with an ellipsis (`…`)** rather than wrapping in constrained containers like sidebars, tabs, and chip labels. Always pair with a tooltip that shows the full string on hover.
- **Do not center-align body text.** Use center alignment only for empty states, modal headers, and short one-liners (under 60 characters).
- **Line length for readable body content should stay between 55–75 characters per line.** In wide containers, constrain paragraph width instead of letting text stretch edge to edge.

---

## 4. Color System

### 4.1 Token Naming Convention

All color tokens live in `libs/ui-components/src/styles/tokens.scss` and are prefixed `--qo-color-*`. **This prefix is mandatory.** Do not define `--color-*` (missing prefix) or raw hex values anywhere in component SCSS.

```scss
// ❌ Wrong — raw hex
background: #111827;

// ❌ Wrong — missing qo- prefix
background: var(--color-neutral-900);

// ✅ Correct
background: var(--qo-color-neutral-900);
```

### 4.2 Core Palette Tokens

```css
/* Brand */
--qo-color-brand-primary:     #2563EB;   /* Primary action color */
--qo-color-brand-hover:       #1D4ED8;   /* Hovered primary */
--qo-color-brand-active:      #1E40AF;   /* Active / pressed primary */
--qo-color-brand-subtle:      #DBEAFE;   /* Light brand tint (backgrounds, badges) */

/* Neutrals */
--qo-color-neutral-900:       #111827;   /* Headings, high-contrast text */
--qo-color-neutral-700:       #374151;   /* Body text */
--qo-color-neutral-500:       #6B7280;   /* Placeholder, secondary text */
--qo-color-neutral-300:       #D1D5DB;   /* Borders, dividers */
--qo-color-neutral-100:       #F3F4F6;   /* Surface backgrounds, hover states */
--qo-color-neutral-50:        #F9FAFB;   /* Page background */
--qo-color-white:             #FFFFFF;

/* Semantic — Status */
--qo-color-success:           #16A34A;
--qo-color-success-subtle:    #DCFCE7;
--qo-color-warning:           #D97706;
--qo-color-warning-subtle:    #FEF3C7;
--qo-color-danger:            #DC2626;
--qo-color-danger-subtle:     #FEE2E2;
--qo-color-info:              #0284C7;
--qo-color-info-subtle:       #E0F2FE;

/* Surfaces */
--qo-color-surface-base:      #FFFFFF;   /* Default component background */
--qo-color-surface-raised:    #F9FAFB;   /* Cards, raised panels */
--qo-color-surface-muted:     #F3F4F6;   /* Muted backgrounds, disabled fills */

/* Builder Canvas */
--qo-color-canvas-bg:         #F0F2F5;   /* Canvas outer area */
--qo-color-canvas-surface:    #FFFFFF;   /* Canvas editing surface */
--qo-color-canvas-border:     #E5E7EB;   /* Canvas frame border */
--qo-color-selection-border:  #2563EB;   /* Selected widget outline */
--qo-color-drop-zone-active:  #DBEAFE;   /* Drop target highlight */

/* Deployer Dark Chrome */
--qo-color-dark-surface:      #1F2937;   /* Dark panel background */
--qo-color-dark-surface-2:    #111827;   /* Darker layer (sidebar, topbar) */
--qo-color-dark-text:         #F9FAFB;   /* Text on dark backgrounds */
--qo-color-dark-text-muted:   #9CA3AF;   /* Secondary text on dark backgrounds */
--qo-color-dark-border:       #374151;   /* Borders on dark surfaces */
```

### 4.3 App-Specific Surface Usage

| App | Primary surface | Chrome (nav/sidebar) | Canvas |
|-----|----------------|---------------------|--------|
| Builder | `--qo-color-surface-base` | Light (`--qo-color-neutral-50`) | `--qo-color-canvas-bg` |
| Deployer | `--qo-color-surface-base` | **Dark** (`--qo-color-dark-surface-2`) | — |
| Client App | `--qo-color-surface-base` | Per-app theming | — |

> The Deployer's top navigation and sidebar use the dark chrome tokens. Component panels and content areas use the standard light surface tokens. Do not apply dark chrome tokens to content zones.

### 4.4 Color Usage Rules

- **Primary brand blue (`--qo-color-brand-primary`) is for one thing: the primary action.** Do not apply it to decorative elements, icons, or non-interactive surfaces.
- **Do not use color alone to convey meaning.** Pair color with an icon or label (e.g., a red border on a field must also show an error label below it).
- **The dark chrome (`--qo-color-dark-surface`) is for Deployer navigation and the Builder code editor only.** Do not introduce dark surfaces elsewhere without a design review.
- **Background colors in widget cards and panels must be from the surface or neutral scale.** Do not apply brand color as a card background.

---

## 5. Spacing and Layout

### 5.1 Spacing Scale

All spacing tokens are prefixed `--qo-space-*` and derive from an 8px base unit. Use multiples of 4px for small internal components and multiples of 8px everywhere else.

```scss
// ❌ Wrong — hard-coded value
padding: 16px;

// ✅ Correct
padding: var(--qo-space-4);
```

| Token | Value | Usage |
|-------|-------|-------|
| `--qo-space-1` | 4px | Icon padding, tiny internal gaps |
| `--qo-space-2` | 8px | Inline element gap, tight padding |
| `--qo-space-3` | 12px | Input internal padding, compact chip gap |
| `--qo-space-4` | 16px | Default card padding, standard gap |
| `--qo-space-5` | 20px | Section gap inside a panel |
| `--qo-space-6` | 24px | Panel header padding, modal padding |
| `--qo-space-8` | 32px | Gap between major layout sections |
| `--qo-space-10` | 40px | Empty state vertical padding |
| `--qo-space-12` | 48px | Top nav height, overlay header height |

### 5.2 Layout Zones

The Builder is divided into fixed layout zones. These widths are defaults and may be resized by the user where noted, but must not collapse below their minimums.

| Zone | Default Width | Min Width | Notes |
|------|--------------|-----------|-------|
| Primary left sidebar (page list) | 220px | 180px | Fixed, not resizable |
| Widget type panel (secondary left) | 240px | 200px | Fixed, not resizable |
| Right configuration overlay | 380px | 320px | Fixed |
| Canvas work area | Fluid (fills remaining space) | 480px | |
| Top navigation bar | 100% viewport width | — | Height: 48px |
| Status bar | 100% viewport width | — | Height: 28px |

### 5.3 Grid and Alignment

- All element placement on the Builder canvas uses an **8px grid snap** by default.
- Inside panels and configuration overlays, use a **consistent 16px internal padding** on all four sides.
- Form fields in settings panels stack vertically with **16px gap** between each field group.
- Related fields within a single group (e.g., X-axis label + selector) use **8px gap**.

### 5.4 Z-Index Layers

| Layer | Z-Index | Used for |
|-------|---------|----------|
| Base canvas content | 0 | Widget placement layer |
| Selected widget chrome | 10 | Selection border, resize handles |
| Selection action bar | 20 | Top bar shown on widget select |
| Left sidebar panels | 30 | Widget picker panels |
| Right config overlay | 40 | Panel configuration overlay |
| Modal dialogs | 50 | Confirmation dialogs, publish prompts |
| Toast / notification | 60 | Feedback toasts (top-right) |
| Tooltip | 70 | Always on top |

---

## 6. Component Sizing Standards

### 6.1 Buttons

Every button variant has a fixed height. Width adjusts to content unless placed in a full-width context. Use `qo-button` from `@qo/ui-components` — do not build custom button elements.

| Variant | Height | Padding (H) | Font Size | Font Weight | Border Radius | Usage |
|---------|--------|-------------|-----------|-------------|---------------|-------|
| `primary` | 36px | 16px | 14px | 600 | 6px | Main CTA (Save, Publish, Confirm) |
| `secondary` | 36px | 16px | 14px | 500 | 6px | Secondary actions (Cancel, Edit) |
| `ghost` | 32px | 12px | 13px | 500 | 6px | Low-emphasis actions in panels |
| `danger` | 36px | 16px | 14px | 600 | 6px | Destructive actions (Delete) |
| `icon-button` | 32px | 8px | — | — | 6px | Toolbar icons (copy, close, rename) |
| `small` | 28px | 10px | 12px | 500 | 4px | Compact contexts (chip actions, inline controls) |

**Button rules:**
- Every clickable button must have a visible focus ring of `2px solid var(--qo-color-brand-primary)` with `2px offset` for keyboard navigation.
- The minimum touch target for any button is **32 × 32px**, even if the visual element is smaller. Use padding to meet this requirement.
- Buttons that trigger destructive actions must use the `danger` variant. Never use the primary blue for delete actions.
- A primary button and a danger button must never appear side by side as the two main choices. Use `primary` + `secondary`, or `danger` + `ghost`.
- Never disable a button silently. If an action is unavailable, either show a tooltip explaining why, or remove the button entirely.

### 6.2 Form Inputs

Use `qo-input`, `qo-select`, `qo-toggle`, `qo-multi-select`, or `qo-aggregate-values-select` from `@qo/ui-components`. Do not use raw `<input>`, `<select>`, or `<textarea>` elements in UI surfaces.

| Type | Height | Font Size | Internal Padding | Border Radius |
|------|--------|-----------|-----------------|---------------|
| Text input (`qo-input`) | 36px | 14px | 10px 12px | 6px |
| Number input (`qo-input[type=number]`) | 36px | 14px | 10px 12px | 6px |
| Search input | 34px | 13px | 8px 12px | 20px (pill) |
| Select / dropdown (`qo-select`) | 36px | 14px | 10px 12px | 6px |
| Multi-select (`qo-multi-select`) | Auto (min 36px) | 14px | 10px 12px | 6px |
| Aggregate values select (`qo-aggregate-values-select`) | 36px | 14px | 10px 12px | 6px |
| Textarea | Auto (min 72px) | 14px | 10px 12px | 6px |
| Inline editable input | 28px | 13px | 4px 8px | 4px |

**Input rules:**
- Every input must have a visible label above it. Placeholder text is not a substitute for a label. Wrap with `qo-form-field` to get consistent label + helper text + error state layout automatically.
- Label font: `label` scale — 12px, weight 500, `var(--qo-color-neutral-700)`.
- Helper text below an input: 12px, `var(--qo-color-neutral-500)`, 4px margin from the input.
- Error state text below an input: 12px, `var(--qo-color-danger)`, paired with a red border on the input.
- Focused input border: `1.5px solid var(--qo-color-brand-primary)`.
- Default input border: `1px solid var(--qo-color-neutral-300)`.
- Disabled input: background `var(--qo-color-neutral-100)`, text `var(--qo-color-neutral-500)`, cursor `not-allowed`.

### 6.3 Segmented Controls

Used for binary or tri-state choices (e.g., `All Records / Selected Records`, `Desktop / Tablet / Mobile`).

| Property | Value |
|----------|-------|
| Height | 32px |
| Segment min-width | 72px |
| Font size | 13px |
| Font weight (active) | 600 |
| Font weight (inactive) | 400 |
| Border radius (outer) | 6px |
| Active segment background | `var(--qo-color-white)` with shadow |
| Inactive segment background | `var(--qo-color-neutral-100)` |

### 6.4 Toggles / Switches

Use `qo-toggle` from `@qo/ui-components`.

| Property | Value |
|----------|-------|
| Track width | 36px |
| Track height | 20px |
| Thumb diameter | 16px |
| On color | `var(--qo-color-brand-primary)` |
| Off color | `var(--qo-color-neutral-300)` |
| Transition | 150ms ease |

Toggles must always have a visible label to their left or right. Never use a toggle without an explanatory label.

### 6.5 Color Picker

Use `qo-color-picker` from `@qo/ui-components` (introduced in Builder — Page Builder feature). Do not build a custom color picker.

- The color picker is used in widget style configuration (search bar color, button color, text color, background color).
- It outputs a CSS color string (hex). Default values passed as `@Input` must still use design token references where the token maps to a known color — only use raw hex when the value is truly user-defined.
- Width: 240px (expanded), 36px (collapsed trigger).

### 6.6 Chips and Tags

| Property | Value |
|----------|-------|
| Height | 24px |
| Padding | 0 8px |
| Font size | 12px |
| Border radius | 12px (pill) |
| Remove icon size | 12px |
| Gap between chips | 4px |

### 6.7 Tabs

Use `qo-tabs` from `@qo/ui-components`.

| Property | Value |
|----------|-------|
| Height | 36px |
| Font size | 13px |
| Active font weight | 600 |
| Inactive font weight | 400 |
| Active indicator | 2px bottom border, `var(--qo-color-brand-primary)` |
| Padding per tab | 0 16px |

### 6.8 Drag Handles and Resize Handles

| Component | Size | Color | Cursor |
|-----------|------|-------|--------|
| Drag handle (sidebar items) | 16 × 16px icon | `var(--qo-color-neutral-400)` | `grab` / `grabbing` |
| Resize handle (canvas widget) | 8 × 8px square | `var(--qo-color-brand-primary)` | `nwse-resize`, `ew-resize`, etc. |
| Selected widget outline | 2px border | `var(--qo-color-selection-border)` | — |

---

## 7. Interactive States

Every interactive component must implement all five states listed below. Missing states are not optional.

### 7.1 State Definitions

| State | Visual Treatment |
|-------|-----------------|
| **Default** | Base design — no modifier classes applied |
| **Hover** | Background lightens or darkens by one neutral step; cursor changes to `pointer` |
| **Focus** | 2px solid `var(--qo-color-brand-primary)` ring with 2px offset; never remove the browser focus outline without a replacement |
| **Active / Pressed** | Background shifts one step darker than hover state; subtle scale transform (`scale(0.98)`) on buttons |
| **Disabled** | Opacity 0.4 or neutral fill; cursor `not-allowed`; no hover/focus styles; `aria-disabled="true"` |
| **Loading** | Spinner replaces label or overlays the component; button or input becomes non-interactive |
| **Error** | Red border on input, red helper text below, optional error icon to the left of helper text |
| **Selected** | Filled background using `var(--qo-color-brand-subtle)`; border or checkmark indicator |

### 7.2 Specific Component States

**Button:**
- Default: `var(--qo-color-brand-primary)` background
- Hover: `var(--qo-color-brand-hover)` background
- Active: `var(--qo-color-brand-active)` background
- Disabled: `var(--qo-color-neutral-300)` background, `var(--qo-color-neutral-500)` text
- Loading: Spinner (16px) inline before label, button non-interactive

**Widget on canvas (selected state):**
- Border: `2px solid var(--qo-color-selection-border)`
- Selection bar visible above the widget
- Resize handles appear at corners and edges
- Background overlay: none (widget content stays visible)

**Sidebar list item (widget type or page):**
- Default: transparent background
- Hover: `var(--qo-color-neutral-100)` background
- Active / selected: `var(--qo-color-brand-subtle)` background, `var(--qo-color-brand-primary)` left border (3px)
- Drag preview: Semi-transparent clone of the item, `cursor: grabbing`

---

## 8. Icons and Imagery

### 8.1 Icon Library

Use a single icon library across the entire product. Recommended: **Lucide Icons** (MIT license, consistent stroke weight, tree-shakeable). Access via `qo-icon` from `@qo/ui-components`.

- Do not mix icon libraries within a single context (e.g., half Lucide, half Material Icons in the same panel).
- Icon size must match its context. Use the sizes below:

| Context | Icon Size |
|---------|-----------|
| Toolbar and icon buttons | 16px |
| Inline with body text | 14px |
| Navigation icons (left sidebar) | 18px |
| Empty state illustration icons | 40–48px |
| Status badges and chips | 12px |

### 8.2 Icon Color Rules

- Icons that are standalone actions (icon buttons) must match the label color they would accompany.
- Decorative or structural icons use `var(--qo-color-neutral-500)`.
- Icons in danger/destructive contexts use `var(--qo-color-danger)`.
- Icons in success states use `var(--qo-color-success)`.
- Do not apply brand color to purely decorative icons.

### 8.3 Widget Preview Thumbnails

- Thumbnail images in the chart picker and widget picker must have a fixed aspect ratio. Use 4:3.
- Use `var(--qo-color-neutral-100)` placeholder background while a thumbnail loads.
- Never show broken image states. If the thumbnail fails, show the widget type icon centered on a neutral background.

---

## 9. Motion and Animation

### 9.1 Timing Tokens

| Token | Duration | Usage |
|-------|----------|-------|
| `duration-fast` | 100ms | Hover backgrounds, color state transitions |
| `duration-base` | 150ms | Toggle switches, button active states |
| `duration-moderate` | 200ms | Dropdown open/close, tooltip appear |
| `duration-slow` | 300ms | Panel slide-in (config overlay), modal open |
| `duration-emphasis` | 400ms | Empty state entrance, onboarding highlights |

### 9.2 Easing

| Usage | Easing |
|-------|--------|
| Entering elements (panels, dropdowns, overlays) | `cubic-bezier(0.16, 1, 0.3, 1)` — fast in, soft out |
| Exiting elements | `cubic-bezier(0.5, 0, 0.75, 0)` — quick exit |
| Color and background transitions | `ease` |
| Micro-interactions (button press, toggle) | `ease-in-out` |

### 9.3 Animation Rules

- The right configuration overlay **slides in from the right**, 300ms, with the fast-in easing.
- Widget drop onto canvas uses a **brief scale animation** (`scale(0.95)` → `scale(1)`) over 150ms to confirm placement.
- Toasts and notifications **slide in from the top-right** and auto-dismiss after 4 seconds.
- Never animate layout changes that shift the main canvas content unexpectedly. Opening the config overlay must not reflow canvas widget positions.
- **Respect `prefers-reduced-motion`.** Wrap all non-essential animations in a media query and substitute instant transitions for users who have enabled reduced motion.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Accessibility

### 10.1 Contrast Requirements

All text must meet WCAG 2.1 AA minimum contrast ratios.

| Text type | Minimum contrast ratio |
|-----------|----------------------|
| Normal body text (under 18px) | 4.5:1 |
| Large text (18px+ or 14px bold) | 3:1 |
| UI components (borders, icons used alone) | 3:1 |
| Disabled text | No minimum (must be visually distinct from active) |

With the defined color tokens:
- `--qo-color-neutral-700` on `--qo-color-white`: ✅ 7.4:1
- `--qo-color-neutral-500` on `--qo-color-white`: ✅ 4.6:1
- `--qo-color-brand-primary` on `--qo-color-white`: ✅ 4.5:1

### 10.2 Keyboard Navigation

- Every interactive element must be reachable by keyboard using Tab.
- Tab order must follow the visual reading order (top to bottom, left to right).
- Focus must never be trapped inside a component that does not intentionally create a focus trap (e.g., modal dialogs should trap focus; sidebars should not).
- Modal dialogs and configuration overlays must trap focus within themselves while open, and return focus to the triggering element on close.
- The Escape key must close: dropdowns, tooltips, modal dialogs, and the configuration overlay.

### 10.3 ARIA Requirements

| Component | Required ARIA |
|-----------|--------------|
| Icon-only buttons | `aria-label` with a descriptive action |
| Toggle / switch (`qo-toggle`) | `role="switch"`, `aria-checked` |
| Segmented control | `role="radiogroup"` with `role="radio"` on each option |
| Widget on canvas | `aria-label` describing widget type and name |
| Drag handle | `aria-label="Drag to reorder"`, `aria-grabbed` |
| Config overlay (`qo-drawer`) | `role="dialog"`, `aria-labelledby` pointing to panel title |
| Loading spinner (`qo-spinner`) | `role="status"`, `aria-live="polite"` |
| Error messages | `aria-live="assertive"`, linked to input via `aria-describedby` |
| Tab panel (`qo-tabs`) | `role="tablist"`, `role="tab"`, `role="tabpanel"` |
| Confirm dialog (`qo-confirm-dialog`) | `role="alertdialog"`, `aria-labelledby`, `aria-describedby` |

### 10.4 Form Accessibility

- Every input must have a `<label>` associated via `for`/`id`, or an `aria-label`. Use `qo-form-field` wrapper to handle this automatically.
- Error messages must be linked to the input using `aria-describedby`.
- Required fields must be marked with `aria-required="true"` (and optionally a visual asterisk with a legend).

---

## 11. Responsive Design

### 11.1 Target Environments

Quanta Ops Builder and Deployer are **desktop-first tools** — they are not intended to be used on mobile. The Client App is the only interface that must be fully responsive.

| App | Target Breakpoints |
|-----|--------------------|
| Deployer | Desktop only (min 1024px wide) |
| Builder | Desktop only (min 1280px wide) |
| Client App | Mobile 320px, Tablet 768px, Desktop 1024px+ |

### 11.2 Builder Minimum Viewport

The Builder must display a **blocking message** on viewports below 1024px wide, instructing the user to switch to a desktop browser. Do not attempt to make the Builder canvas layout work on narrow screens.

### 11.3 Client App Breakpoints

The Page Builder's viewport toggle (`Desktop / Tablet / Mobile`) in preview mode should reflect these widths:

| Preview Mode | Canvas Width |
|-------------|-------------|
| Desktop | 1280px |
| Tablet | 768px |
| Mobile | 375px |

The preview canvas itself remains inside the Builder at the same viewport size. It simulates the target dimensions using a fixed-width constrained canvas, not an actual device.

---

## 12. Critical User Flows

These flows represent the highest-priority interactions in the platform. Every step must meet the quality, feedback, and error handling standards defined in this document.

### 12.1 Builder Login and App Access

**Steps:**
1. User arrives at `builder.quantaops.io/login`.
2. Email and password inputs are visible. Both have associated labels (use `qo-form-field` + `qo-input`).
3. On submit: show a spinner on the login button. Disable the button immediately.
4. On failure: show an inline error message below the form — not an alert popup. Message: `"Incorrect email or password. Please try again."`
5. On success: redirect to the app list. Do not flash or show a blank screen.
6. If the session expires mid-session: intercept the next API call, redirect to login, and preserve the URL the user was on. After re-login, redirect back.

**UX rules:**
- The login form must be centered vertically and horizontally on the page.
- Never auto-focus the password field. Always auto-focus the email field.
- Do not show any Builder chrome (nav, sidebars) before the auth state is confirmed.

### 12.2 Creating and Opening a Page in Builder

**Steps:**
1. User is in the Page Builder module. The left panel shows the page list.
2. User clicks `+ New Page` at the top of the page list. A `qo-modal` or inline input is used — not a raw HTML dialog.
3. A text input appears inline in the list for the page name. It is pre-filled with `"Untitled Page"` and auto-selected so the user can type immediately.
4. On Enter or blur: create the page and navigate to its preview state.
5. The page card shows a `Draft` badge (`qo-badge`) in muted text.
6. User clicks `Edit`. The edit workspace opens — canvas, sidebars, and selection bar.

**UX rules:**
- The transition from page preview to edit workspace must not blank the screen. Use a smooth layout change.
- If the page list is empty, show a clear empty state (`qo-empty-state`) with an icon, a short message, and the `+ New Page` action — not just whitespace.
- Page names in the list must truncate with an ellipsis at the right edge and show the full name in a tooltip on hover.

### 12.3 Dropping a Widget onto the Canvas

**Steps:**
1. User opens the widget type panel (left sidebar).
2. User selects a widget type (e.g., Chart). The dependent panel opens showing available chart items.
3. User grabs a widget card by the drag handle (or the card itself).
4. Drag preview appears: a semi-transparent version of the card follows the cursor.
5. When over the canvas drop zone, the canvas highlights with `var(--qo-color-drop-zone-active)` background and a dashed border.
6. User releases. The widget appears at the drop position with a scale-in animation.
7. The widget becomes immediately selected: selection border appears, selection action bar shows.

**UX rules:**
- The drop zone highlight must appear as soon as the drag enters the canvas boundary — not only when hovering over an empty area.
- If the user drops the widget outside the canvas (onto a sidebar or outside the window), the drag action is cancelled silently. No error.
- After drop, the widget must stay inside the canvas boundaries. If dropped near an edge, snap it to a safe inset position.

### 12.4 Configuring a Widget

**Steps:**
1. User selects a widget on the canvas.
2. The selection action bar appears above the widget with three actions: `Configure`, `Copy`, `Delete`.
3. User clicks `Configure`. The right configuration overlay (`qo-drawer`) slides in from the right (300ms).
4. The overlay header shows the panel name with a rename icon. The `Design / Code` toggle is visible.
5. The right side shows the relevant settings tab (`qo-tabs`).
6. User changes a setting. The preview in the center updates immediately (within 200ms).
7. User closes the overlay with the `×` button or presses Escape. The overlay slides out. Focus returns to the widget on the canvas.

**UX rules:**
- The overlay must never cover the entire canvas. The canvas remains partially visible behind the overlay.
- Changes in the configuration overlay are applied live — they do not require a separate "Apply" button.
- If a setting requires a value that is missing (e.g., chart source not selected), highlight the empty field with an orange border and show an inline warning — do not prevent the overlay from staying open.

### 12.5 Saving and Publishing a Page

**Steps:**
1. User is in page edit mode.
2. User clicks `Save Draft` (secondary button, top right).
3. The button shows a spinner for the duration of the save request. On success: button returns to normal, status bar briefly shows `"Draft saved"` in success green.
4. User clicks `Save & Publish` (primary button, top right).
5. A `qo-confirm-dialog` appears: `"Publish this page? It will become live for all app users."` with `Cancel` and `Publish` buttons.
6. User confirms. Request is sent. Button shows spinner.
7. On success: the page badge changes from `Draft` to `Published`. Status bar shows `"Page published successfully"`.
8. On failure: show an error toast (top-right): `"Publish failed. Please try again."` with a retry link.

**UX rules:**
- `Save & Publish` must always show a confirmation dialog. Never publish immediately on a single click.
- During the publish request, disable both save buttons to prevent double-submit.
- The published/draft badge must be visible in both the page list and the page header at all times.

### 12.6 Deleting an Element

**Steps:**
1. User selects an element on the canvas.
2. User clicks `Delete` in the selection action bar, or presses the `Delete`/`Backspace` key.
3. A `qo-confirm-dialog` appears: `"Delete this [widget type]? This cannot be undone."` with `Cancel` and `Delete` buttons.
4. User confirms. Element is removed from the canvas. Focus moves to the canvas.
5. Status bar briefly shows `"[Widget type] removed"`.

**UX rules:**
- Always show a confirmation before deleting a placed widget. Never delete immediately on a keypress or click.
- Use the `danger` variant on the `qo-button` for the `Delete` action inside the confirmation dialog.
- The `Cancel` button must be the leftmost / default-focused button in the dialog. Delete should require a deliberate click.

---

## 13. Builder-Specific UX Rules

### 13.1 Canvas Behavior

- Widgets placed on the canvas must **snap to an 8px grid** by default during placement and movement.
- Resize handles must be visible only on the **selected** widget. If no widget is selected, no handles are shown.
- Multiple widgets must not overlap visually in a way that makes them impossible to select separately. If two widgets overlap, the one placed later (higher z-index) is selected first on click. Clicking again in the overlapping area cycles to the one below.
- The canvas outer area (`var(--qo-color-canvas-bg)`) is not interactive. Clicking the outer area deselects any selected widget.

### 13.2 Left Sidebar Navigation Hierarchy

The Builder's left sidebar follows a two-level hierarchy:

1. **Primary sidebar** (widget type list) — always visible in edit mode
2. **Secondary sidebar** (items within a type, e.g., chart picker) — opens when a type is selected

Selecting a type on the primary level must open the secondary panel without hiding the primary. Both panels are visible side by side. Deselecting the primary type collapses the secondary panel.

The sidebar is powered by `qo-sidebar` (from `@qo/ui-components`). Use the `sidebarMode` configuration to switch between `list`, `palette`, and `tabs` layouts. Do not build custom sidebar navigation.

### 13.3 Configuration Overlay Layout

The shared right configuration overlay always follows this internal layout (left to right):

1. **Left mini-panel** (collapsible): Text, Image, Button presets
2. **Center preview canvas** (`qo-builder-canvas-frame`): Live preview of the widget being configured
3. **Right settings panel** (`qo-tabs`): Tabs (Properties, Display, Style, Action) with scrollable content

All three zones must be present for every widget that uses the shared overlay. Widget-specific settings are injected only into the right settings panel — the overlay shell does not change.

### 13.4 Page List Panel Behavior

- The page list must show `Draft` or `Published` state clearly on each page card using `qo-badge`.
- The currently active page must have a visible selected state (brand-colored left border, brand-subtle background).
- The `+ New Page` action must be pinned to the top of the list, always visible, regardless of scroll position.

### 13.5 Design/Code Toggle

The `Design / Code` toggle in the configuration overlay header lets builders switch between the visual settings view and a raw code editor view (for ZML/HTML snippets). Follow these rules:

- The toggle must be clearly labeled — do not use icons only.
- Switching between Design and Code must preserve the current state without data loss.
- The Code mode activates the dark-themed code editor. The Design mode returns to the standard light settings panel.

### 13.6 Report Builder — Filter, Grouping, and Sort UI

The report builder's left panel (`report-left-panel`) contains three sub-panels: **Data Sources**, **Fields**, and **Filters**. Each panel follows these rules:

- **Filters panel** — uses `qo-multi-select` for field selection and `qo-select` for operators. Dynamic filter rules added by the user must display as chips with a remove (`×`) button. Use `qo-aggregate-values-select` for aggregate function selection.
- **Grouping panel** — drag-to-reorder list of grouped fields. Each field chip has a remove button. Use `qo-toggle` for enabling/disabling each group field.
- **Sort-by panel** — Ascending/Descending choice per field uses a segmented control or `qo-select`, not radio buttons.

---

## 14. Error Handling and Feedback

### 14.1 Feedback Hierarchy

Match the feedback method to the severity and context of the message.

| Situation | Feedback Method |
|-----------|----------------|
| Successful save or publish | Status bar inline message (3 seconds) + success badge update |
| Publish failure | Toast notification (top-right, 5 seconds, with retry action) |
| Form validation error | Inline field-level error below the input (via `qo-form-field`) |
| Missing required config (in overlay) | Inline warning on the empty field — do not block the overlay |
| Connection / network error | Toast notification + a retry button |
| Destructive action required | `qo-confirm-dialog` |
| Session expired | Redirect to login with a brief toast: `"Your session expired. Please log in again."` |

### 14.2 Toast Notifications

Use `QoToastService` (injected via `inject(QoToastService)`) to trigger toasts. Do not build custom toast components.

| Property | Value |
|----------|-------|
| Position | Top-right, 16px from edges |
| Width | 320px |
| Auto-dismiss | 4 seconds (success), 6 seconds (error) |
| Max visible at once | 3 (stack vertically, newest on top) |
| Manual dismiss | × button on every toast |
| Variants | Success (green left border), Error (red left border), Warning (amber left border), Info (blue left border) |

### 14.3 Empty States

Use `qo-empty-state` from `@qo/ui-components`. Every list or canvas surface that can be empty must show a proper empty state — not blank whitespace.

An empty state must include:
1. An icon (40–48px, `var(--qo-color-neutral-300)`)
2. A short heading in `subheading` scale: `"No pages yet"`, `"Nothing on the canvas"`, etc.
3. A secondary line in `body` scale explaining what the user can do: `"Create your first page to get started."`
4. An action `qo-button` if an action is directly available (e.g., `+ New Page`)

### 14.4 Loading States

- Use a **skeleton screen** (grey animated placeholder blocks) for initial content loads — not a spinner covering the whole panel.
- Use `qo-spinner` inside a `qo-button` during a triggered async action.
- Use a **full-panel overlay spinner** (`qo-spinner` with overlay wrapper) only when the entire panel is being reloaded (e.g., after switching app contexts).
- Loading states must never persist for more than 10 seconds without an error being shown. If the request exceeds 10 seconds, surface an error with a retry option.

---

## 15. Shared Component Library

All UI components are published in `libs/ui-components` and consumed via the `@qo/ui-components` barrel import. **Never import from a subpath** (e.g., `@qo/ui-components/button` or `@quanta-ops/ui-components/card`). Always use:

```ts
import { QoButtonComponent, QoInputComponent, QoModalComponent } from '@qo/ui-components';
```

### 15.1 Component Catalog

| Component | Selector | Import Name | Notes |
|-----------|----------|-------------|-------|
| Button | `qo-button` | `QoButtonComponent` | Variants: primary, secondary, ghost, danger, icon-button, small |
| Input | `qo-input` | `QoInputComponent` | Text, number, password types |
| Form field wrapper | `qo-form-field` | `QoFormFieldComponent` | Label + helper text + error layout |
| Select | `qo-select` | `QoSelectComponent` | Single-select dropdown |
| Multi-select | `qo-multi-select` | `QoMultiSelectComponent` | Multi-select with chips |
| Aggregate values select | `qo-aggregate-values-select` | `QoAggregateValuesSelectComponent` | Report builder aggregate selector |
| Toggle / switch | `qo-toggle` | `QoToggleComponent` | Binary on/off |
| Color picker | `qo-color-picker` | `QoColorPickerComponent` | Widget style color selection |
| Modal | `qo-modal` | `QoModalComponent` | Full modal dialog with backdrop |
| Confirm dialog | `qo-confirm-dialog` | `QoConfirmDialogComponent` | Confirmation pattern — always use for destructive actions |
| Drawer / overlay | `qo-drawer` | `QoDrawerComponent` | Slide-in config overlay (right side) |
| Card | `qo-card` | `QoCardComponent` | Surface card with optional header/footer |
| Badge | `qo-badge` | `QoBadgeComponent` | Status and label pills |
| Icon | `qo-icon` | `QoIconComponent` | Lucide icon wrapper |
| Tabs | `qo-tabs` | `QoTabsComponent` | Tab navigation |
| Stepper | `qo-stepper` | `QoStepperComponent` | Multi-step wizard indicator |
| Table | `qo-table` | `QoTableComponent` | Data table with sorting support |
| Pagination | `qo-pagination` | `QoPaginationComponent` | Page-based navigation |
| Search bar | `qo-search-bar` | `QoSearchBarComponent` | Search input with icon |
| Stat card | `qo-stat-card` | `QoStatCardComponent` | Metric display card |
| Metric strip | `qo-metric-strip` | `QoMetricStripComponent` | Inline metrics row |
| Empty state | `qo-empty-state` | `QoEmptyStateComponent` | Empty list / canvas placeholder |
| Spinner | `qo-spinner` | `QoSpinnerComponent` | Loading indicator |
| Status dot | `qo-status-dot` | `QoStatusDotComponent` | Online/offline/warning dot indicator |
| Connector icon | `qo-connector-icon` | `QoConnectorIconComponent` | Data source / integration icon |
| Drawer (overlay) | `qo-drawer` | `QoDrawerComponent` | Panel slide-in |
| Builder canvas frame | `qo-builder-canvas-frame` | `QoBuilderCanvasFrameComponent` | Constrained canvas preview wrapper |
| Toast (service) | — | `QoToastService` | `inject(QoToastService)` to show toasts |

### 15.2 Rules for Adding New Components to the Library

1. Add to `libs/ui-components/src/lib/` in an appropriately named folder.
2. Export from `libs/ui-components/src/index.ts`.
3. Use design tokens (`var(--qo-color-*)`, `var(--qo-space-*)`) — no raw hex or px values.
4. Set `standalone: true` and `ChangeDetectionStrategy.OnPush`.
5. Use `input()` / `output()` signal-based API — not `@Input()` / `@Output()` decorators.
6. Add the component to this catalog table.

---

## 16. Do's and Don'ts

### Do's

- Use `var(--qo-color-*)` and `var(--qo-space-*)` tokens consistently. Never hard-code hex values or pixel values.
- Use `qo-` shared components for every piece of UI — buttons, inputs, modals, drawers, tables, empty states.
- Import exclusively from `@qo/ui-components` barrel. Never use subpath imports.
- Test every interactive component in all five states: default, hover, focus, disabled, and error.
- Write component labels and error messages in plain English from the user's perspective.
- Use `qo-confirm-dialog` for all destructive and irreversible actions.
- Show feedback for every user-triggered operation — even if the operation succeeds instantly (use `QoToastService`).
- Pair every icon-only button with an `aria-label`.
- Respect the 8px grid on the canvas.
- Test color contrast before shipping any new UI surface.

### Don'ts

- Do not use raw hex values anywhere in component SCSS. Use `var(--qo-color-*)`.
- Do not import from `@quanta-ops/ui-components/*` subpaths — always use `@qo/ui-components`.
- Do not build custom versions of components that already exist in `@qo/ui-components`.
- Do not use `FormsModule` or `[(ngModel)]` — use Reactive Forms (`ReactiveFormsModule`, `FormBuilder`).
- Do not use color as the only indicator of state or meaning.
- Do not place a primary and a danger button side by side as the two main actions.
- Do not use font sizes below 12px.
- Do not remove the browser focus outline without replacing it with a custom focus ring.
- Do not auto-submit or auto-navigate without user confirmation in high-stakes flows (publish, delete).
- Do not show an alert popup for form validation errors — use inline field errors via `qo-form-field`.
- Do not create new spacing, font size, or color values outside the defined tokens without updating this document.
- Do not apply the dark chrome style (`--qo-color-dark-surface`) to non-navigation, non-code-editor surfaces.
- Do not mix icon libraries.
- Do not let a loading state persist indefinitely — always pair it with a timeout and an error fallback.

---

*Quanta Ops UI/UX Guidelines — v1.1 — April 2026*
*Maintainer: Engineering Lead / Design Lead*
*Review cycle: Quarterly or on any major feature addition*
*Updated: Aligned token naming to `--qo-color-*` / `--qo-space-*` convention; added shared component catalog (§15); added color-picker, multi-select, aggregate-values-select; added report builder filter UX rules (§13.6); updated all component references to `qo-` shared library; corrected import rule to `@qo/ui-components` barrel only.*
