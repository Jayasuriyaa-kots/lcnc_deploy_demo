# Quanta Ops — Frontend UI Components Guide

> Version 1.0 | Angular 18 | Nx Monorepo | April 2026
> This document is the single source of truth for how the frontend team builds UI across all three apps.

---

## Table of Contents

1. [Why This Document Exists](#1-why-this-document-exists)
2. [Where Components Live](#2-where-components-live)
3. [Design Tokens](#3-design-tokens)
4. [Component Catalog](#4-component-catalog)
5. [Shell Components](#5-shell-components)
6. [Angular 18 Coding Rules](#6-angular-18-coding-rules)
7. [Folder Structure Rules](#7-folder-structure-rules)
8. [Import Rules](#8-import-rules)
9. [State Management Rules](#9-state-management-rules)
10. [Styling Rules](#10-styling-rules)
11. [Do Not Do List](#11-do-not-do-list)

---

## 1. Why This Document Exists

Three teams are building three apps simultaneously:

- **Deployer** — internal staff control plane
- **Builder** — developer build and configuration plane
- **Client App** — end-user runtime

Without shared components and shared rules, each team will build different versions of the same button. This document prevents that.

**Rule: Every UI element used in more than one place belongs in `libs/ui-components`.**

---

## 2. Where Components Live

```
libs/
  ui-components/
    src/
      lib/
        primitives/        ← atoms: button, input, badge, spinner
        forms/             ← form controls: field, select, checkbox, date-picker
        feedback/          ← toast, alert, empty-state, skeleton
        layout/            ← card, divider, tabs, accordion
        overlay/           ← modal, drawer, popover, tooltip
        data-display/      ← table, pagination, stat-card, metric-strip
        navigation/        ← breadcrumb, stepper, context-menu
        shell/             ← header, sidebar, status-bar, tab-bar
      index.ts             ← public API — all exports
```

**One component per folder. Each folder has:**

```
button/
  button.component.ts
  button.component.html
  button.component.scss
  button.component.spec.ts
  index.ts
```

---

## 3. Design Tokens

All values below must be defined as CSS custom properties in `libs/ui-components/src/styles/tokens.scss`.
No team member may hardcode a color, font size, or spacing value anywhere.

### 3.1 Color Tokens

The current homepage references a **monochrome brand system** built around charcoal, off-white, and muted gray rather than a saturated blue palette. The UI library should align with that direction so the product experience matches the marketing site.

#### 3.1.1 Brand Color Reference (from homepage)

| Token Role | Hex | Usage |
|-----------|-----|-------|
| Brand Ink | `#111111` | Primary text, primary buttons on light surfaces |
| Brand Charcoal | `#232427` | Dark section backgrounds, nav/footer surfaces |
| Brand Charcoal Soft | `#2F3135` | Secondary dark surfaces, cards, overlays |
| Brand Line | `#3A3D42` | Grid lines, dividers, subtle borders on dark backgrounds |
| Brand Canvas | `#F5F5F2` | Light page background |
| Brand Surface | `#FFFFFF` | Cards and elevated light surfaces |
| Brand Muted | `#A7A8AC` | Secondary text/icons on dark sections |
| Brand Muted Light | `#D9DAD6` | Borders and muted elements on light sections |

```scss
// Brand — homepage-aligned monochrome palette
--qo-color-primary-50:  #f5f5f2;
--qo-color-primary-100: #e9e9e4;
--qo-color-primary-500: #232427;
--qo-color-primary-600: #1b1c1f;
--qo-color-primary-700: #111111;

// Neutral (used for text, borders, backgrounds)
--qo-color-neutral-0:   #ffffff;
--qo-color-neutral-50:  #f5f5f2;
--qo-color-neutral-100: #ecece8;
--qo-color-neutral-200: #d9dad6;
--qo-color-neutral-300: #c4c6c2;
--qo-color-neutral-400: #a7a8ac;
--qo-color-neutral-500: #7d8086;
--qo-color-neutral-600: #5a5d63;
--qo-color-neutral-700: #3a3d42;
--qo-color-neutral-800: #232427;
--qo-color-neutral-900: #111111;

// Semantic
--qo-color-success-500: #4f8a5b;
--qo-color-success-100: #e8f2ea;
--qo-color-warning-500: #b7862e;
--qo-color-warning-100: #f5ead1;
--qo-color-danger-500:  #b55252;
--qo-color-danger-100:  #f7e2e2;
--qo-color-info-500:    #5c748f;
--qo-color-info-100:    #e6edf5;
```

#### 3.1.2 Brand Usage Rules

- Use `--qo-color-primary-500` / `--qo-color-primary-700` for primary actions instead of bright accent colors.
- Default dark-theme sections should use `--qo-color-neutral-800` or `--qo-color-neutral-900`.
- Default light-theme sections should use `--qo-color-neutral-50` with `--qo-color-neutral-900` text.
- Grid lines, separators, and subtle rings in dark sections should use `--qo-color-neutral-700`.
- Secondary copy over dark backgrounds should use `--qo-color-neutral-400` rather than pure white.

### 3.2 Typography Tokens

```scss
--qo-font-family-sans:  'Plus Jakarta Sans', system-ui, sans-serif;
--qo-font-family-mono:  'JetBrains Mono', 'Fira Code', monospace;

--qo-text-xs:   0.75rem;   // 12px — labels, captions
--qo-text-sm:   0.875rem;  // 14px — body, table cells
--qo-text-base: 1rem;      // 16px — default
--qo-text-lg:   1.125rem;  // 18px — section headers
--qo-text-xl:   1.25rem;   // 20px — page titles
--qo-text-2xl:  1.5rem;    // 24px — module titles
--qo-text-3xl:  1.875rem;  // 30px — hero headings

--qo-font-normal:   400;
--qo-font-medium:   500;
--qo-font-semibold: 600;
--qo-font-bold:     700;

--qo-leading-tight:  1.25;
--qo-leading-normal: 1.5;
--qo-leading-loose:  1.75;
```

### 3.3 Spacing Tokens

```scss
--qo-space-1:  0.25rem;   // 4px
--qo-space-2:  0.5rem;    // 8px
--qo-space-3:  0.75rem;   // 12px
--qo-space-4:  1rem;      // 16px
--qo-space-5:  1.25rem;   // 20px
--qo-space-6:  1.5rem;    // 24px
--qo-space-8:  2rem;      // 32px
--qo-space-10: 2.5rem;    // 40px
--qo-space-12: 3rem;      // 48px
--qo-space-16: 4rem;      // 64px
```

### 3.4 Border and Radius Tokens

```scss
--qo-radius-sm:   4px;
--qo-radius-md:   6px;
--qo-radius-lg:   8px;
--qo-radius-xl:   12px;
--qo-radius-full: 9999px;

--qo-border-color:        var(--qo-color-neutral-200);
--qo-border-color-strong: var(--qo-color-neutral-300);
--qo-border-color-focus:  var(--qo-color-primary-500);
```

### 3.5 Shadow Tokens

```scss
--qo-shadow-sm:  0 1px 2px 0 rgba(0,0,0,0.05);
--qo-shadow-md:  0 4px 6px -1px rgba(0,0,0,0.10);
--qo-shadow-lg:  0 10px 15px -3px rgba(0,0,0,0.10);
--qo-shadow-xl:  0 20px 25px -5px rgba(0,0,0,0.10);
```

---

## 4. Component Catalog

Each component below defines:
- what it does
- what inputs it accepts
- what outputs it emits
- which apps use it

---

### 4.1 Primitives

---

#### `QoButtonComponent`
**Selector:** `qo-button`
**Path:** `libs/ui-components/src/lib/primitives/button/`

A standard action button. Used everywhere.

**Inputs:**

| Input | Type | Default | Notes |
|-------|------|---------|-------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'link'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | |
| `disabled` | `boolean` | `false` | |
| `loading` | `boolean` | `false` | Shows spinner, disables click |
| `iconLeft` | `string` | `undefined` | Icon name from icon set |
| `iconRight` | `string` | `undefined` | |
| `iconOnly` | `boolean` | `false` | Square button, icon only |
| `fullWidth` | `boolean` | `false` | |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | |

**Outputs:** None — use native `(click)`.

**Usage:**
```html
<qo-button variant="primary" (click)="save()">Save</qo-button>
<qo-button variant="ghost" size="sm" [loading]="isTesting">Test Connection</qo-button>
<qo-button variant="danger" [disabled]="!canDelete">Delete</qo-button>
```

---

#### `QoBadgeComponent`
**Selector:** `qo-badge`
**Path:** `libs/ui-components/src/lib/primitives/badge/`

Status chip, method label, type tag.

**Inputs:**

| Input | Type | Default | Notes |
|-------|------|---------|-------|
| `color` | `'default' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'blue' \| 'purple'` | `'default'` | |
| `size` | `'sm' \| 'md'` | `'sm'` | |
| `dot` | `boolean` | `false` | Shows colored dot before label |
| `outlined` | `boolean` | `false` | Border style instead of filled |

**Usage:**
```html
<qo-badge color="success" [dot]="true">Active</qo-badge>
<qo-badge color="danger">Error</qo-badge>
<qo-badge color="blue">GET</qo-badge>
<qo-badge color="warning">POST</qo-badge>
```

---

#### `QoSpinnerComponent`
**Selector:** `qo-spinner`
**Path:** `libs/ui-components/src/lib/primitives/spinner/`

Loading indicator. Used inline and as full-page overlay.

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `color` | `'primary' \| 'white' \| 'neutral'` | `'primary'` |
| `overlay` | `boolean` | `false` |

---

#### `QoIconComponent`
**Selector:** `qo-icon`
**Path:** `libs/ui-components/src/lib/primitives/icon/`

Renders SVG icons from the icon registry. Icon names follow kebab-case.

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `name` | `string` | required |
| `size` | `number \| 'sm' \| 'md' \| 'lg'` | `'md'` |
| `color` | `string` | `'currentColor'` |

**Usage:**
```html
<qo-icon name="database" size="md" />
<qo-icon name="chevron-right" size="sm" />
<qo-icon name="check-circle" color="var(--qo-color-success-500)" />
```

**Icon set:** Use Heroicons (outline style). Register all icons in `QoIconRegistryService`.

---

#### `QoStatusDotComponent`
**Selector:** `qo-status-dot`
**Path:** `libs/ui-components/src/lib/primitives/status-dot/`

Small colored indicator dot for connection health, system status.

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `status` | `'active' \| 'inactive' \| 'error' \| 'warning' \| 'unknown'` | `'unknown'` |
| `pulse` | `boolean` | `false` | Animated pulse for live status |

---

### 4.2 Form Controls

---

#### `QoFormFieldComponent`
**Selector:** `qo-form-field`
**Path:** `libs/ui-components/src/lib/forms/form-field/`

Wrapper for all form controls. Provides label, hint, and error message layout. Every input must be wrapped in this.

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `label` | `string` | required |
| `hint` | `string` | `undefined` |
| `error` | `string` | `undefined` |
| `required` | `boolean` | `false` |
| `id` | `string` | auto-generated |

**Usage:**
```html
<qo-form-field label="Database Host" hint="e.g. localhost or 10.0.0.1" [error]="form.get('host')?.errors?.['required'] ? 'Host is required' : ''">
  <qo-input formControlName="host" placeholder="localhost" />
</qo-form-field>
```

---

#### `QoInputComponent`
**Selector:** `qo-input`
**Path:** `libs/ui-components/src/lib/forms/input/`

Implements `ControlValueAccessor`. Always use inside `qo-form-field`.

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `type` | `'text' \| 'email' \| 'password' \| 'number' \| 'search' \| 'url'` | `'text'` |
| `placeholder` | `string` | `''` |
| `disabled` | `boolean` | `false` |
| `readonly` | `boolean` | `false` |
| `prefixIcon` | `string` | `undefined` |
| `suffixIcon` | `string` | `undefined` |
| `size` | `'sm' \| 'md'` | `'md'` |

---

#### `QoTextareaComponent`
**Selector:** `qo-textarea`
**Path:** `libs/ui-components/src/lib/forms/textarea/`

Implements `ControlValueAccessor`.

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `placeholder` | `string` | `''` |
| `rows` | `number` | `3` |
| `resize` | `'none' \| 'vertical' \| 'auto'` | `'vertical'` |
| `disabled` | `boolean` | `false` |

---

#### `QoSelectComponent`
**Selector:** `qo-select`
**Path:** `libs/ui-components/src/lib/forms/select/`

Implements `ControlValueAccessor`. Supports search and grouped options.

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `options` | `SelectOption[]` | `[]` |
| `placeholder` | `string` | `'Select...'` |
| `searchable` | `boolean` | `false` |
| `clearable` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `size` | `'sm' \| 'md'` | `'md'` |

**Model:**
```typescript
interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
  icon?: string;
}
```

---

#### `QoMultiSelectComponent`
**Selector:** `qo-multi-select`
**Path:** `libs/ui-components/src/lib/forms/multi-select/`

Same as `QoSelectComponent` but allows multiple values. Shows selected items as removable chips.

---

#### `QoCheckboxComponent`
**Selector:** `qo-checkbox`
**Path:** `libs/ui-components/src/lib/forms/checkbox/`

Implements `ControlValueAccessor`.

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `label` | `string` | required |
| `disabled` | `boolean` | `false` |
| `indeterminate` | `boolean` | `false` |

---

#### `QoToggleComponent`
**Selector:** `qo-toggle`
**Path:** `libs/ui-components/src/lib/forms/toggle/`

On/off switch. Used for SSL toggle, feature flags, environment toggles.

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `label` | `string` | `undefined` |
| `labelPosition` | `'left' \| 'right'` | `'right'` |
| `disabled` | `boolean` | `false` |
| `size` | `'sm' \| 'md'` | `'md'` |

---

#### `QoRadioGroupComponent`
**Selector:** `qo-radio-group`
**Path:** `libs/ui-components/src/lib/forms/radio-group/`

Implements `ControlValueAccessor`.

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `options` | `RadioOption[]` | `[]` |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` |
| `disabled` | `boolean` | `false` |

**Model:**
```typescript
interface RadioOption {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
}
```

---

#### `QoDatePickerComponent`
**Selector:** `qo-date-picker`
**Path:** `libs/ui-components/src/lib/forms/date-picker/`

Implements `ControlValueAccessor`. Outputs ISO 8601 string.

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `placeholder` | `string` | `'Select date'` |
| `minDate` | `string` | `undefined` |
| `maxDate` | `string` | `undefined` |
| `includeTime` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |

---

#### `QoFileUploadComponent`
**Selector:** `qo-file-upload`
**Path:** `libs/ui-components/src/lib/forms/file-upload/`

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `accept` | `string` | `'*'` |
| `multiple` | `boolean` | `false` |
| `maxSizeMb` | `number` | `10` |
| `dragDrop` | `boolean` | `true` |

**Outputs:**

| Output | Type |
|--------|------|
| `filesSelected` | `EventEmitter<File[]>` |
| `uploadError` | `EventEmitter<string>` |

---

### 4.3 Feedback Components

---

#### `QoToastService` + `QoToastComponent`
**Path:** `libs/ui-components/src/lib/feedback/toast/`

Service-driven toast notifications. Teams call the service, not the component directly.
The `QoToastComponent` is placed once in the app shell.

**Service API:**
```typescript
// Inject QoToastService wherever needed
toastService.success('Data source saved.');
toastService.error('Connection failed. Check your credentials.');
toastService.warning('SSL is disabled for this connection.');
toastService.info('Schema loaded — 12 tables found.');
```

**Config:**
```typescript
interface ToastConfig {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // ms, default 4000
  action?: { label: string; onClick: () => void };
}
```

---

#### `QoAlertComponent`
**Selector:** `qo-alert`
**Path:** `libs/ui-components/src/lib/feedback/alert/`

Inline alert banner. Used for page-level warnings and info messages.

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `type` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` |
| `title` | `string` | `undefined` |
| `message` | `string` | required |
| `dismissible` | `boolean` | `false` |
| `icon` | `boolean` | `true` |

**Outputs:**

| Output | Type |
|--------|------|
| `dismissed` | `EventEmitter<void>` |

---

#### `QoSkeletonComponent`
**Selector:** `qo-skeleton`
**Path:** `libs/ui-components/src/lib/feedback/skeleton/`

Animated placeholder for loading states. Use instead of spinners for content areas.

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `type` | `'text' \| 'rect' \| 'circle' \| 'table-row'` | `'rect'` |
| `width` | `string` | `'100%'` |
| `height` | `string` | `'1rem'` |
| `count` | `number` | `1` |

**Usage:**
```html
@if (isLoading) {
  <qo-skeleton type="table-row" [count]="5" />
} @else {
  <qo-table [data]="rows" />
}
```

---

#### `QoEmptyStateComponent`
**Selector:** `qo-empty-state`
**Path:** `libs/ui-components/src/lib/feedback/empty-state/`

Zero-state illustration with message and optional action.

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `icon` | `string` | `'inbox'` |
| `title` | `string` | required |
| `description` | `string` | `undefined` |
| `actionLabel` | `string` | `undefined` |

**Outputs:**

| Output | Type |
|--------|------|
| `actionClicked` | `EventEmitter<void>` |

**Usage:**
```html
<qo-empty-state
  icon="database"
  title="No data sources yet"
  description="Connect your first database or API to get started."
  actionLabel="+ Add Data Source"
  (actionClicked)="openAddFlow()" />
```

---

#### `QoProgressBarComponent`
**Selector:** `qo-progress-bar`
**Path:** `libs/ui-components/src/lib/feedback/progress-bar/`

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `value` | `number` | `0` |
| `max` | `number` | `100` |
| `color` | `'primary' \| 'success' \| 'warning' \| 'danger'` | `'primary'` |
| `showLabel` | `boolean` | `false` |
| `size` | `'sm' \| 'md'` | `'sm'` |

---

### 4.4 Layout Components

---

#### `QoCardComponent`
**Selector:** `qo-card`
**Path:** `libs/ui-components/src/lib/layout/card/`

Container with consistent background, border, and shadow.

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` |
| `shadow` | `'none' \| 'sm' \| 'md'` | `'sm'` |
| `bordered` | `boolean` | `true` |
| `hoverable` | `boolean` | `false` |

---

#### `QoTabsComponent` + `QoTabComponent`
**Selector:** `qo-tabs`, `qo-tab`
**Path:** `libs/ui-components/src/lib/layout/tabs/`

**`QoTabsComponent` Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `activeTab` | `string` | first tab |
| `variant` | `'line' \| 'pill'` | `'line'` |
| `size` | `'sm' \| 'md'` | `'md'` |

**Outputs:**

| Output | Type |
|--------|------|
| `tabChange` | `EventEmitter<string>` |

**`QoTabComponent` Inputs:**

| Input | Type |
|-------|------|
| `id` | `string` |
| `label` | `string` |
| `disabled` | `boolean` |
| `badge` | `string` |

**Usage:**
```html
<qo-tabs [activeTab]="activeTab" (tabChange)="activeTab = $event">
  <qo-tab id="connection" label="Connection" />
  <qo-tab id="schema" label="Schema" />
  <qo-tab id="metrics" label="Metrics" />
</qo-tabs>
```

---

#### `QoAccordionComponent` + `QoAccordionItemComponent`
**Selector:** `qo-accordion`, `qo-accordion-item`
**Path:** `libs/ui-components/src/lib/layout/accordion/`

Used for expandable data source rows, FAQ, collapsible sections.

**`QoAccordionItemComponent` Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `id` | `string` | required |
| `expanded` | `boolean` | `false` |

**Outputs:**

| Output | Type |
|--------|------|
| `expandedChange` | `EventEmitter<boolean>` |

---

#### `QoDividerComponent`
**Selector:** `qo-divider`
**Path:** `libs/ui-components/src/lib/layout/divider/`

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` |
| `label` | `string` | `undefined` |

---

### 4.5 Overlay Components

---

#### `QoModalComponent` + `QoModalService`
**Path:** `libs/ui-components/src/lib/overlay/modal/`

Service-driven. Teams call the service to open/close, not the component directly.
`QoModalComponent` is placed once in the app shell.

**Service API:**
```typescript
// Open a modal with a dynamic component
modalService.open(AddDataSourceComponent, {
  title: 'Add Data Source',
  size: 'lg',
  data: { appId: this.appId }
});

modalService.close();
```

**Config:**
```typescript
interface ModalConfig {
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;        // default true
  data?: Record<string, unknown>;
}
```

---

#### `QoDrawerComponent` + `QoDrawerService`
**Path:** `libs/ui-components/src/lib/overlay/drawer/`

Right-side sliding panel. Used for schema browser, detail panels.

**Service API:**
```typescript
drawerService.open(SchemaBrowserComponent, {
  title: 'Schema Browser',
  width: '480px',
  data: { dataSourceId }
});
```

---

#### `QoTooltipDirective`
**Selector:** `[qoTooltip]`
**Path:** `libs/ui-components/src/lib/overlay/tooltip/`

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `qoTooltip` | `string` | required |
| `qoTooltipPosition` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` |
| `qoTooltipDelay` | `number` | `300` |

**Usage:**
```html
<qo-icon name="info" [qoTooltip]="'Available metrics updated every 60 seconds'" />
```

---

#### `QoPopoverComponent`
**Selector:** `qo-popover`
**Path:** `libs/ui-components/src/lib/overlay/popover/`

Floating panel anchored to a trigger element. Used for context menus, filter dropdowns.

---

#### `QoConfirmDialogService`
**Path:** `libs/ui-components/src/lib/overlay/confirm-dialog/`

Shortcut for delete confirmations.

```typescript
const confirmed = await confirmDialogService.confirm({
  title: 'Delete data source?',
  message: 'This will remove the connection and all associated schema mappings. This cannot be undone.',
  confirmLabel: 'Delete',
  confirmVariant: 'danger'
});

if (confirmed) {
  await this.dataSourcesService.delete(id);
}
```

---

### 4.6 Data Display Components

---

#### `QoTableComponent`
**Selector:** `qo-table`
**Path:** `libs/ui-components/src/lib/data-display/table/`

General purpose sortable, selectable table. Supports column definitions, custom cell templates, and row expansion.

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `columns` | `TableColumn[]` | required |
| `data` | `unknown[]` | `[]` |
| `loading` | `boolean` | `false` |
| `selectable` | `boolean` | `false` |
| `selectedRows` | `unknown[]` | `[]` |
| `expandable` | `boolean` | `false` |
| `trackBy` | `string` | `'id'` |
| `emptyMessage` | `string` | `'No results found'` |

**Outputs:**

| Output | Type |
|--------|------|
| `rowClick` | `EventEmitter<unknown>` |
| `selectionChange` | `EventEmitter<unknown[]>` |
| `sortChange` | `EventEmitter<TableSort>` |
| `rowExpand` | `EventEmitter<unknown>` |

**Models:**
```typescript
interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  cellTemplate?: TemplateRef<unknown>;   // custom cell rendering
}

interface TableSort {
  key: string;
  direction: 'asc' | 'desc';
}
```

---

#### `QoPaginationComponent`
**Selector:** `qo-pagination`
**Path:** `libs/ui-components/src/lib/data-display/pagination/`

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `total` | `number` | required |
| `page` | `number` | `1` |
| `pageSize` | `number` | `20` |
| `pageSizeOptions` | `number[]` | `[10, 20, 50]` |

**Outputs:**

| Output | Type |
|--------|------|
| `pageChange` | `EventEmitter<number>` |
| `pageSizeChange` | `EventEmitter<number>` |

---

#### `QoStatCardComponent`
**Selector:** `qo-stat-card`
**Path:** `libs/ui-components/src/lib/data-display/stat-card/`

KPI/metric card. Used in Deployer dashboard and Builder monitoring views.

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `label` | `string` | required |
| `value` | `string \| number` | required |
| `unit` | `string` | `undefined` |
| `trend` | `'up' \| 'down' \| 'neutral'` | `undefined` |
| `trendValue` | `string` | `undefined` |
| `icon` | `string` | `undefined` |
| `color` | `'default' \| 'success' \| 'warning' \| 'danger'` | `'default'` |

**Usage:**
```html
<qo-stat-card label="Availability" value="99.8" unit="%" trend="up" trendValue="+0.2%" />
<qo-stat-card label="Error Rate" value="0.4" unit="%" color="danger" />
<qo-stat-card label="P95 Latency" value="142" unit="ms" />
```

---

#### `QoMetricStripComponent`
**Selector:** `qo-metric-strip`
**Path:** `libs/ui-components/src/lib/data-display/metric-strip/`

Condensed horizontal metrics row used inside data source list items.

**Inputs:**

| Input | Type |
|-------|------|
| `metrics` | `MetricItem[]` |

**Model:**
```typescript
interface MetricItem {
  label: string;
  value: string;
  status?: 'ok' | 'warn' | 'error';
}
```

---

#### `QoKeyValueComponent`
**Selector:** `qo-key-value`
**Path:** `libs/ui-components/src/lib/data-display/key-value/`

Row showing a label and value. Used in detail panels and schema browsers.

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `label` | `string` | required |
| `value` | `string` | required |
| `mono` | `boolean` | `false` |
| `copyable` | `boolean` | `false` |

---

#### `QoSearchBarComponent`
**Selector:** `qo-search-bar`
**Path:** `libs/ui-components/src/lib/data-display/search-bar/`

Search input with optional filter chips.

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `placeholder` | `string` | `'Search...'` |
| `debounceMs` | `number` | `300` |
| `value` | `string` | `''` |

**Outputs:**

| Output | Type |
|--------|------|
| `valueChange` | `EventEmitter<string>` |

---

### 4.7 Navigation Components

---

#### `QoBreadcrumbComponent`
**Selector:** `qo-breadcrumb`
**Path:** `libs/ui-components/src/lib/navigation/breadcrumb/`

**Inputs:**

| Input | Type |
|-------|------|
| `items` | `BreadcrumbItem[]` |

**Model:**
```typescript
interface BreadcrumbItem {
  label: string;
  route?: string[];
}
```

---

#### `QoStepperComponent`
**Selector:** `qo-stepper`
**Path:** `libs/ui-components/src/lib/navigation/stepper/`

Used for multi-step flows like Add Data Source and Add Connector.

**Inputs:**

| Input | Type | Default |
|-------|------|---------|
| `steps` | `StepItem[]` | required |
| `activeStep` | `number` | `0` |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` |

**Outputs:**

| Output | Type |
|--------|------|
| `stepChange` | `EventEmitter<number>` |

**Model:**
```typescript
interface StepItem {
  label: string;
  description?: string;
  completed?: boolean;
  error?: boolean;
}
```

---

### 4.8 Specialized Builder Components

These components are specific to the Builder and Data Sources module but still live in `libs/ui-components` because multiple Builder feature teams need them.

---

#### `QoConnectorIconComponent`
**Selector:** `qo-connector-icon`
**Path:** `libs/ui-components/src/lib/primitives/connector-icon/`

Renders the correct logo/icon for each connector type.

**Inputs:**

| Input | Type |
|-------|------|
| `type` | `ConnectorType` |
| `size` | `'sm' \| 'md' \| 'lg'` |

**Supported connector types:**
`postgresql`, `mysql`, `mssql`, `mongodb`, `rest_api`, `graphql`, `google_sheets`, `airtable`, `csv`, `bigquery`, `supabase`

---

#### `QoMethodBadgeComponent`
**Selector:** `qo-method-badge`
**Path:** `libs/ui-components/src/lib/primitives/method-badge/`

Color-coded HTTP method labels.

**Inputs:**

| Input | Type |
|-------|------|
| `method` | `'GET' \| 'POST' \| 'PUT' \| 'PATCH' \| 'DELETE'` |

Color mapping:
- `GET` → blue
- `POST` → green
- `PUT` → orange
- `PATCH` → yellow
- `DELETE` → red

---

## 5. Shell Components

Shell components form the outer frame of each app. They are **not** reusable like primitives — each app has one instance of each. They still live in `libs/ui-components/src/lib/shell/` because all three apps share the pattern.

---

### `QoTopHeaderComponent`
**Selector:** `qo-top-header`
**Path:** `libs/ui-components/src/lib/shell/top-header/`

**Inputs:**

| Input | Type |
|-------|------|
| `appName` | `string` |
| `logoSrc` | `string` |
| `environment` | `string` |
| `tabs` | `HeaderTab[]` |
| `activeTab` | `string` |
| `showSave` | `boolean` |
| `showPreview` | `boolean` |
| `showDeploy` | `boolean` |
| `isSaving` | `boolean` |
| `isDeploying` | `boolean` |
| `notificationCount` | `number` |
| `user` | `{ name: string; avatarUrl?: string }` |

**Outputs:**

| Output | Type |
|--------|------|
| `tabChange` | `EventEmitter<string>` |
| `saveClicked` | `EventEmitter<void>` |
| `previewClicked` | `EventEmitter<void>` |
| `deployClicked` | `EventEmitter<void>` |
| `notificationsClicked` | `EventEmitter<void>` |
| `profileClicked` | `EventEmitter<void>` |

---

### `QoSidebarComponent`
**Selector:** `qo-sidebar`
**Path:** `libs/ui-components/src/lib/shell/sidebar/`

**Inputs:**

| Input | Type |
|-------|------|
| `items` | `SidebarItem[]` |
| `activeItem` | `string` |
| `collapsed` | `boolean` |

**Outputs:**

| Output | Type |
|--------|------|
| `itemChange` | `EventEmitter<string>` |
| `collapseToggle` | `EventEmitter<void>` |

**Model:**
```typescript
interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  badge?: string | number;
  children?: SidebarItem[];
  route?: string[];
}
```

---

### `QoStatusBarComponent`
**Selector:** `qo-status-bar`
**Path:** `libs/ui-components/src/lib/shell/status-bar/`

**Inputs:**

| Input | Type |
|-------|------|
| `systemLive` | `boolean` |
| `region` | `string` |
| `organisation` | `string` |
| `environment` | `string` |
| `lastSyncAt` | `string` |
| `collaboratorCount` | `number` |

---

## 6. Angular 18 Coding Rules

### 6.1 All Components Are Standalone

Every component in this project uses `standalone: true`. There are no `NgModule` files anywhere.

```typescript
// CORRECT
@Component({
  selector: 'qo-button',
  standalone: true,
  imports: [CommonModule, QoSpinnerComponent, QoIconComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QoButtonComponent { }
```

```typescript
// WRONG — do not create NgModules
@NgModule({ declarations: [QoButtonComponent] })
export class ButtonModule { }
```

### 6.2 Use Signals for Component State

Use Angular signals for internal component state. Do not use `BehaviorSubject` or `Subject` inside components.

```typescript
// CORRECT
export class QoTableComponent {
  selectedRows = signal<unknown[]>([]);
  isLoading = signal(false);
  sortState = signal<TableSort | null>(null);

  toggleRow(row: unknown) {
    this.selectedRows.update(rows =>
      rows.includes(row) ? rows.filter(r => r !== row) : [...rows, row]
    );
  }
}
```

```typescript
// WRONG — use signals, not BehaviorSubject inside components
selectedRows$ = new BehaviorSubject<unknown[]>([]);
```

### 6.3 Use `input()` and `output()` for Component API

Prefer the new `input()` and `output()` functions over `@Input()` and `@Output()` decorators.

```typescript
// CORRECT
export class QoBadgeComponent {
  color = input<BadgeColor>('default');
  size = input<'sm' | 'md'>('sm');
  dot = input(false);
  outlined = input(false);
}
```

```typescript
// ACCEPTABLE for now if team is not yet familiar with input()
@Input() color: BadgeColor = 'default';
```

### 6.4 Use `ChangeDetectionStrategy.OnPush` Everywhere

Every component must use `OnPush`. This is not optional.

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### 6.5 Use `@if` and `@for` Control Flow

Use the new Angular 17+ template control flow. Do not use `*ngIf` or `*ngFor`.

```html
<!-- CORRECT -->
@if (isLoading()) {
  <qo-skeleton type="table-row" [count]="5" />
} @else if (data().length === 0) {
  <qo-empty-state title="No data sources" />
} @else {
  @for (source of data(); track source.id) {
    <app-data-source-item [source]="source" />
  }
}
```

```html
<!-- WRONG -->
<ng-container *ngIf="isLoading; else content">...</ng-container>
<li *ngFor="let item of items">...</li>
```

### 6.6 Functional Guards and Interceptors

Do not use class-based guards or interceptors.

```typescript
// CORRECT
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? true : inject(Router).createUrlTree(['/login']);
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getAccessToken();
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};
```

### 6.7 All Forms Use Reactive Forms

Do not use template-driven forms (`ngModel`). Use `ReactiveFormsModule` and `FormBuilder`.

```typescript
// CORRECT
form = inject(FormBuilder).group({
  name: ['', [Validators.required, Validators.minLength(3)]],
  host: ['', Validators.required],
  port: [5432, [Validators.required, Validators.min(1), Validators.max(65535)]],
  sslEnabled: [false]
});
```

---

## 7. Folder Structure Rules

### Feature Module Structure

Every page-level feature follows this layout:

```
features/
  data-sources/
    components/               ← feature-specific, not shared
      data-source-item/
      endpoint-table/
      metrics-banner/
      schema-browser/
    containers/               ← smart components — inject services, hold state
      data-sources-page/
      add-data-source-flow/
    services/
      data-sources.service.ts
      data-source-schema.service.ts
      data-sources-facade.service.ts
    models/
      data-source.model.ts    ← feature-local type extensions
    data-sources.routes.ts
```

### Rules

1. **`components/`** — dumb components only. Accept inputs, emit outputs. No domain/state service injection.
   Allowed exception: Angular framework utilities such as `FormBuilder`, `DomSanitizer`, `Renderer2`, and `ElementRef` may be injected in feature components when they are only supporting local UI behavior or form wiring.
2. **`containers/`** — inject services, hold signals, pass data down to components.
3. **`services/`** — one service per concern. No business logic in containers.
4. **`models/`** — feature-specific types. Shared types go in `libs/models`.
5. **One component per file.** No co-locating two components in one file.
6. **No inline styles.** All styles in `.scss` files.

---

## 8. Import Rules

### 8.1 Always Import from Library Index

```typescript
// CORRECT
import { QoButtonComponent, QoTableComponent, QoToastService } from '@qo/ui-components';
```

```typescript
// WRONG — never deep-import
import { QoButtonComponent } from '../../libs/ui-components/src/lib/primitives/button/button.component';
```

### 8.2 Path Aliases (defined in `tsconfig.base.json`)

```json
{
  "paths": {
    "@qo/ui-components": ["libs/ui-components/src/index.ts"],
    "@qo/models":        ["libs/models/src/index.ts"],
    "@qo/auth-lib":      ["libs/auth-lib/src/index.ts"],
    "@qo/api-client":    ["libs/api-client/src/index.ts"]
  }
}
```

### 8.3 `libs/ui-components/src/index.ts` Must Be Kept Current

Every time a new component is added to `libs/ui-components`, it must be exported from `index.ts`.

```typescript
// libs/ui-components/src/index.ts
export { QoButtonComponent } from './lib/primitives/button';
export { QoBadgeComponent } from './lib/primitives/badge';
export { QoSpinnerComponent } from './lib/primitives/spinner';
export { QoIconComponent } from './lib/primitives/icon';
// ... all components
```

---

## 9. State Management Rules

There is **no global state library** (no NgRx, no Akita). State is managed per feature using Angular signals and services.

### Pattern: Facade Service

Each feature has one facade service that is the only state-holder. Containers inject the facade. Components receive data as inputs.

```typescript
// data-sources-facade.service.ts
@Injectable({ providedIn: 'root' })
export class DataSourcesFacadeService {
  // State
  dataSources = signal<DataSourceListItem[]>([]);
  selectedSourceId = signal<string | null>(null);
  isLoading = signal(false);
  isAddFlowOpen = signal(false);
  addFlowStep = signal(0);
  schemaState = signal<SchemaState | null>(null);
  error = signal<string | null>(null);

  // Derived
  selectedSource = computed(() =>
    this.dataSources().find(ds => ds.dataSource.id === this.selectedSourceId())
  );

  constructor(
    private dataSourcesService: DataSourcesService,
    private schemaService: DataSourceSchemaService,
    private toast: QoToastService
  ) {}

  async loadDataSources(appId: string) {
    this.isLoading.set(true);
    try {
      const result = await this.dataSourcesService.getAll(appId);
      this.dataSources.set(result.map(ds => ({ dataSource: ds, metrics: ds.metrics, isExpanded: false })));
    } catch {
      this.toast.error('Failed to load data sources.');
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleExpand(id: string) {
    this.dataSources.update(sources =>
      sources.map(s => s.dataSource.id === id ? { ...s, isExpanded: !s.isExpanded } : s)
    );
  }
}
```

### Rules

1. **No state in components.** Components hold only UI-local state (hover, focus, animation).
2. **Facade is the single source of truth** for each feature.
3. **Services handle API calls only.** No state in services.
4. **`computed()` for derived state.** Never duplicate signal values.
5. **No `subscribe()` in components.** Use `async` pipe or `toSignal()`.

---

## 10. Styling Rules

### 10.1 Use CSS Custom Properties

Never hardcode values. Always use tokens.

```scss
// CORRECT
.badge {
  background-color: var(--qo-color-success-100);
  color: var(--qo-color-success-500);
  border-radius: var(--qo-radius-full);
  padding: var(--qo-space-1) var(--qo-space-3);
  font-size: var(--qo-text-xs);
}

// WRONG
.badge {
  background-color: #dcfce7;
  color: #22c55e;
  border-radius: 9999px;
  padding: 4px 12px;
  font-size: 12px;
}
```

### 10.2 Use `:host` for Component Layout

```scss
// CORRECT
:host {
  display: block;
  width: 100%;
}

// WRONG — causes layout issues
.wrapper {
  display: block;
  width: 100%;
}
```

### 10.3 No Global Styles in Feature Folders

Global styles go in:
- `libs/ui-components/src/styles/tokens.scss` — tokens
- `libs/ui-components/src/styles/reset.scss` — box-model reset
- `libs/ui-components/src/styles/typography.scss` — body/heading defaults
- `apps/{app}/src/styles.scss` — imports the above, nothing else

Feature `.scss` files should only contain styles for that specific component.

### 10.4 Tailwind Is Not Used

This project uses CSS custom properties and component-scoped SCSS. Do not add Tailwind.

---

## 11. Do Not Do List

The following are banned. If you see these in a code review, reject the PR.

| Banned | Why |
|--------|-----|
| `NgModule` | Project uses standalone components only |
| `*ngIf`, `*ngFor` | Use `@if`, `@for` |
| `ngModel` (template forms) | Use Reactive Forms |
| `BehaviorSubject` in components | Use signals |
| Hardcoded hex colors | Use CSS tokens |
| Hardcoded px spacing | Use CSS tokens |
| Deep imports from `libs/` | Use path aliases |
| `any` type | Type everything explicitly |
| `console.log` in production code | Use a logging service if needed |
| Class-based guards | Use functional guards |
| Class-based interceptors | Use functional interceptors |
| Business logic in components | Move to services |
| State in services | Move to facade |
| `document.querySelector` | Use `ElementRef` + `Renderer2` |
| Inline styles in HTML | Use component SCSS |
| Creating new components without exporting from `index.ts` | Breaks imports |

---

## Appendix A — Component Checklist (for PR reviews)

Before merging a new UI component, verify:

- [ ] Component is `standalone: true`
- [ ] `ChangeDetectionStrategy.OnPush` is set
- [ ] Component is exported from `libs/ui-components/src/index.ts`
- [ ] All inputs are typed (no `any`)
- [ ] All outputs use `EventEmitter` with typed generics
- [ ] If it wraps a form control — implements `ControlValueAccessor`
- [ ] SCSS uses only CSS custom property tokens
- [ ] `.spec.ts` file exists with at minimum a smoke test
- [ ] Component folder has an `index.ts` that re-exports the component

---

## Appendix B — Quick Reference: Which Component to Use

| Situation | Component |
|-----------|-----------|
| Page-level success/failure message | `QoToastService` |
| Inline persistent warning | `QoAlertComponent` |
| Delete/destructive confirmation | `QoConfirmDialogService` |
| Loading a table or list | `QoSkeletonComponent` |
| Loading a button action | `[loading]="true"` on `QoButtonComponent` |
| Zero results state | `QoEmptyStateComponent` |
| HTTP method indicator | `QoMethodBadgeComponent` |
| Connection health indicator | `QoStatusDotComponent` |
| Connector type icon | `QoConnectorIconComponent` |
| Opening a complex form | `QoModalService` or `QoDrawerService` |
| Multi-step create flow | `QoStepperComponent` inside modal |
| Metric numbers in a row | `QoMetricStripComponent` |
| Single KPI number | `QoStatCardComponent` |
| Table with server-side sort | `QoTableComponent` + `QoPaginationComponent` |
| Expandable row | `QoAccordionItemComponent` |

---

## Appendix C — Component Count Summary

| Category | Count |
|----------|-------|
| Primitives | 6 (Button, Badge, Spinner, Icon, StatusDot, ConnectorIcon, MethodBadge) |
| Form Controls | 8 (FormField, Input, Textarea, Select, MultiSelect, Checkbox, Toggle, RadioGroup, DatePicker, FileUpload) |
| Feedback | 5 (Toast, Alert, Skeleton, EmptyState, ProgressBar) |
| Layout | 4 (Card, Tabs, Accordion, Divider) |
| Overlay | 5 (Modal, Drawer, Tooltip, Popover, ConfirmDialog) |
| Data Display | 6 (Table, Pagination, StatCard, MetricStrip, KeyValue, SearchBar) |
| Navigation | 2 (Breadcrumb, Stepper) |
| Shell | 3 (TopHeader, Sidebar, StatusBar) |
| **Total** | **~42 components and directives** |
