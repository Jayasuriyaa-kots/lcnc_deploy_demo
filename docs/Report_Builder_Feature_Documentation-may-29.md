# Report Builder Feature Documentation
## Quanta Ops Builder — v2.0 · Updated May 2026

---

## Overview

The Report Builder is a module within Quanta Ops Builder that allows teams to create, configure, preview, and publish operational reports composed from form-based datasources. It provides a full configuration surface for defining what data is shown, how it is grouped and filtered, how records appear in list and card modes, and how detail views are structured when a record is opened.

The current implementation is **frontend-driven**. All report state is held in an Angular signals-based facade service (`ReportBuilderFacadeService`) and managed entirely in-memory during a builder session. Preview record generation, join resolution, filtering, sorting, and grouping are computed locally using static JSON-backed datasource records. No remote query execution or server-backed persistence currently exists.

**Frontend-driven (current):**
- Report creation, duplication, deletion, publish status change
- Column management, filter rules, sort/group settings
- Quick View and Detail View configuration including custom card layout
- Detail block creation, ordering, and related-form block support
- Preview record generation, filtering, grouping, and sorting
- Row selection and bulk action state
- Inline search bar — real-time cross-column filtering *(NEW)*
- Row height options — Compact / Comfortable / Expanded *(NEW)*
- Freeze / pin columns — sticky left-edge positioning *(NEW)*
- Group drill-down — collapse/expand grouped rows *(NEW)*
- Print full report view *(NEW)*
- Viewport preview — Desktop / Tablet / Mobile with responsive card view *(NEW)*
- Detail panel drag-to-resize *(NEW)*
- Two-column block layout in Detail View (ADD BLOCK and ADD TAB modes) *(NEW)*

**Backend integration points (not yet implemented):**
- Report CRUD persistence (no server round-trip on create/update/delete)
- Remote query execution against live datasources
- Join resolution via SQL or API query
- Publish lifecycle enforcement
- Source form and datasource discovery via API
- Scheduled email reports (requires cron + email service)
- Embed / share report via public URL or iframe (requires token-based backend auth)

---

## Functional Capabilities

### Report Creation and Seeded Reports

On initialization, `ReportBuilderFacadeService` seeds the report collection with five static reports across the `employees_form`, `attendance_form`, and `leave_form` source forms, with a mix of `live` and `draft` statuses. Each seeded report initialises a full `ReportBuilderAsset` including columns, filter presets, actions, and a complete `settings` payload.

New reports are created through a three-step wizard (`ReportCreateWizardComponent`) that collects:
- A report name
- A source form (selected from `sourceOptions`)
- A report type (`list`, `chart`, or `pivot`)
- A view type (`List View` or `Card View`)
- An initial column selection (up to 5 columns from the source form's column list)

On wizard completion, `createReport()` constructs a new `ReportBuilderAsset` in draft status, prepends it to the report collection, and selects it. The short code for sidebar display is derived from the report name.

### Source Form and Datasource Selection

Source forms are exposed as `ReportBuilderSourceOption[]` resolved at service construction time by `loadSourceOptions()`. Each source option carries:
- `id` and `name` — form identifier and display label
- `datasourceLabel` and `tableLabel` — contextual datasource metadata
- `columns: ReportBuilderColumn[]` — the full typed column set for that form

Source options are loaded from a combination of static JSON-backed forms (`flats_database`, `property_db`) and form seeds stored in `BrowserStorageService` under the key `qo.builder.report.sourceForms.v1`. If no stored forms exist, a default set of seed forms (`employees_form`, `attendance_form`, `leave_form`) is written into storage on first load.

When the active report's source form is changed via `updateSelectedReportSource()`, the following properties are reset to align with the new source:
- `columns` — replaced with the new source's columns, all set to `visible: true`
- `filterRules` — cleared
- `settings.groupBy`, `settings.sortBy`, `settings.cardPrimaryFieldId`, `settings.cardSecondaryFieldId` — reassigned from the new source's column list
- `settings.detailBlocks` — reset to a single primary block containing all columns from the new source

### Column Management

Each `ReportBuilderColumn` carries the following metadata:
- `id`, `label`, `formId`, `source` (`primary` | `joined`)
- `fieldType` — raw field type string (e.g. `single_line`, `date`, `drop_down`)
- `format` — display format: `text`, `number`, `date`, `email`, `currency`, `image`
- `visible` — whether the column appears in the report view
- `width` — `Small`, `Medium`, or `Large`
- `sortable`, `filterable` — capability flags used by the preview and filter surfaces
- `alignment` — `Left`, `Center`, or `Right`

Column visibility is toggled individually. Column order can be changed and is persisted in the report's column array order. The field config drawer (`toggleDrawer('field')`) exposes the column configuration surface.

Joined columns are appended to the column array after primary columns. Their `source` is set to `'joined'` and their `id` follows the namespaced format `targetFormId__fieldId`. Their `formId` is set to the target form's id.

**Column border dividers:** Vertical `border-left` dividers are rendered between all columns in both the builder list view and the preview modal. The dividers use `box-shadow: inset 1px 0 0 0` with `align-items: stretch` to ensure a continuous line from header through all body rows without gaps at row boundaries.

### Joins and Related Data Integration

`ReportJoin` is stored as an array on each `ReportBuilderAsset`. Each join definition contains:
- `sourceFormId` — the primary report source form
- `targetFormId` — the form being joined
- `joinType` — one of `inner`, `left`, `right`, or `lookup`
- `on.sourceField` and `on.targetField` — the matching field ids for join resolution
- `alias` (optional) — an alias prefix for the joined form

Join semantics during preview record generation:
- `inner` — only rows where a matching `targetField` value exists in the target dataset are included
- `left` — all primary rows are included; joined fields are empty strings where no match exists
- `right` — all target rows are included; primary rows without a match are dropped
- `lookup` — the first matching target row is merged into the primary row (single-value enrichment); unmatched primary rows receive empty strings for joined fields

Joined columns are materialised into preview records with prefixed ids using the format `targetFormId__fieldId`. This same namespacing is used in:
- `ReportBuilderColumn.id` for joined columns
- `PreviewRecord.fields` key resolution during `applyJoinsToRows()`
- Detail block `fieldIds` references for related-block rendering

Join preview resolution is currently only active for the `flats_database` and `property_db` source forms.

### Filters and Filter Rules

Filter rules are stored as `ReportBuilderFilterRule[]` on each report and are applied during preview record generation via `filterPreviewRecords()`. All active rules are ANDed together — a record must satisfy every active rule to appear in the preview output.

A rule is considered active when both `columnId` and `operator` are set, and either:
- The `value` string is non-empty, or
- The operator is one of `isEmpty`, `isNotEmpty`, `isChecked`, `isUnchecked` (value-independent operators)

Supported operators by field behaviour:

| Category | Operators |
|---|---|
| Equality | `is`, `isNot` |
| Text | `contains`, `notContains`, `startsWith`, `endsWith` |
| Numeric | `greaterThan`, `greaterThanOrEqual`, `lessThan`, `lessThanOrEqual` |
| Date | `before`, `after`, `onOrBefore`, `onOrAfter`, `between` |
| Boolean | `isChecked`, `isUnchecked` |
| Existence | `isEmpty`, `isNotEmpty` |

The `between` operator supports both date range and numeric range values via a `{ start, end }` value shape.

Filter rules are updated via `updateSelectedReportFilters()` which deep-clones the rule set before writing into report state. Clearing a source form resets filter rules to empty.

Filter presets (`ReportBuilderFilterPreset[]`) are a separate array of named, toggleable preset filters. These are static per-report labels (`Active Only`, `This Month`, `My Team`) with enabled states. They are stored in report state but not currently wired to the filter rule engine — they function as display-only UI toggles.

### Sorting and Grouping

Sorting and grouping settings are stored within `report.settings`:
- `sortBy` — column id to sort by
- `sortOrder` — `asc` or `desc`
- `groupBy` — column id to group by (empty string = no grouping)
- `groupOrder` — `none`, `asc`, or `desc` (controls group header ordering)

During preview generation, `applyGroupingAndSorting()` is called after filtering:
- If `groupBy` is set, records are partitioned into groups keyed by the group field's value. Groups are optionally sorted by key. Within each group, records are sorted by `sortBy`/`sortOrder`. The `groupLabel` on each `PreviewRecord` is set to the group key value.
- If `groupBy` is empty, records are sorted by `sortBy`/`sortOrder` and `groupLabel` is set to the record's primary display value.

Sort comparison is type-aware: date strings are parsed via `Date.parse()`, numeric strings are compared as numbers after stripping non-numeric characters, and remaining values fall through to locale-sensitive string comparison with `numeric: true`.

### Quick View Configuration

Quick View controls how records appear in the center preview panel. Three modes are supported, toggled via `setQuickLayout()`:

**`list`** — Tabular column-based rendering. The active columns in definition order are displayed as table headers and row cells.

**`card`** — Card-based rendering using two designated fields: `cardPrimaryFieldId` (main display value) and `cardSecondaryFieldId` (supporting value). These are set from `report.settings`.

**`custom`** — Full custom card layout stored in `report.settings.quickViewCustomLayout` as `ReportQuickViewCustomLayout`. The custom layout has two sub-modes:

- **Template mode** (`templateMode: true`) — a slot-based layout with five named slots: `image`, `title`, `body`, `meta_left`, `meta_right`. Each slot maps to a column id.
- **Canvas mode** (`templateMode: false`) — a positioned-element canvas layout stored as `canvasLayout: QuickViewCanvasLayout`. The canvas has a defined `containerWidth` and `containerHeight`, and an array of `QuickViewCanvasElement` items with absolute coordinates.

### Detail View Configuration

Detail View controls the right-side panel that opens when a record is clicked in preview. Three modes are available, set via `setDetailLayout()`:

**`all_fields`** — All visible columns for the report are rendered in a flat field list.

**`block_layout`** — Fields are organised into named blocks. Each block has a `title`, a `sourceFormId`, and an ordered list of `fieldIds`. Blocks are rendered as titled sections in the detail panel.

**`custom_layout`** — Reserved for custom template rendering via `ReportDetailCreateLayoutModalComponent`.

### Detail Block Layout and Related Block Support

Detail blocks are stored in `report.settings.detailBlocks`. The detail block drawer (`toggleDrawer('detailBlockLayout')`) exposes the block editor. Capabilities include:
- Adding and removing blocks
- Adding, removing, and reordering fields within a block
- Setting per-block source form association (`sourceFormId`)
- Adding a **related block** — a block sourced from a non-primary form (i.e. a joined form's column set)
- **Splitting a block into two columns** *(NEW — see below)*

**Two-Column Block Layout *(NEW)*:**

Both the ADD BLOCK detail layout and the ADD TAB tab layout now support splitting any block into two side-by-side columns:

- A **split button** (two-column icon `⊟`) appears in every block header alongside the edit and delete buttons
- Clicking split divides the block into **Column 1** and **Column 2**, each with its own independent drop zone and `+ Add Fields` selector
- Maximum of **2 columns per block** — the split button disables (35% opacity, `cursor: not-allowed`) once the limit is reached, with a tooltip reading "Max 2 columns"
- Each column shows a header label ("Column 1 / Column 2") and an **× button** to remove that column; removing a column merges its fields back into the remaining single column
- Drag-and-drop reordering works **within and between columns**
- The two-column layout is **reflected in the preview detail panel** with side-by-side field rendering and a vertical divider between columns
- **Data model change:** `ReportBlockLayoutItem` gains an optional `columns?: string[][]` field. When set (up to 2 arrays of field ids), it overrides `fieldIds` in the preview. Fully backward compatible — existing blocks without `columns` continue to use `fieldIds`.

### Actions Configuration

**Quick actions** are stored in `report.settings.quickActionGroups` as `ReportActionGroup[]`. The default groups:
- `Single Record` — actions available when one row is selected (Edit, Duplicate, Delete)
- `Right-Click Record` — context menu actions on a row
- `Multiple Selection` — bulk selection toolbar actions

**Detail actions** are surfaced in the Detail View panel header via `REPORT_BUILDER_DETAIL_ACTION_GROUPS`.

### Report Settings

Report settings are edited via `ReportSettingsModalComponent` and include:
- `name` and `description` — display metadata
- `defaultLayout` — `Compact`, `Comfortable`, or `Detailed`
- `recordClickAction` — `Open Detail View` or `Do Nothing`
- `showSearch`, `showFilters`, `showExport`, `showViewSwitcher` — feature toggle flags
- `showRecordCount` — toggles record count display in grouped previews

### Publish, Duplicate, and Delete

**Publish** — `publishReport(reportId)` sets the report's `status` to `live`. No external API call occurs.

**Duplicate** — `duplicateReport(reportId)` performs a deep-copy of all report state. The duplicate is set to `draft` status and named `<original name> (Copy)`.

**Delete** — `deleteReport(reportId)` removes the report from state and reassigns the selected report to the next available report.

### Preview Behavior and Record Detail Side Panel

The center preview (`ReportCenterPreviewComponent`) renders the result of `buildPreviewRecords()` in list or card mode. The full preview modal (`ReportPreviewModalComponent`) and full preview page (`report-preview-page.component`) provide an expanded view with pagination, search, export, view switcher, and all new preview features.

Clicking a record opens the detail side panel. In `all_fields` mode, the panel renders a flat field list. In `block_layout` mode, the panel renders one section per configured detail block. For two-column blocks, fields are rendered side by side with a vertical divider.

### Row Selection and Bulk Actions

Row selection is managed by `previewSelection: signal<number[]>` in the facade. `togglePreviewRow(index)` adds or removes a row index from the selection set. `clearPreviewSelection()` resets the selection. When rows are selected, the preview renders a selection toolbar with contextually available actions from the `Multiple Selection` action group.

---

## New Features (May 2026)

All features in this section are frontend-only and require no backend changes.

### Inline Search Bar

An expandable inline search bar in the preview toolbar provides real-time cross-column filtering.

- Activated by clicking the **search icon** in the preview toolbar — expands inline rather than opening a side drawer
- A single text input queries **all visible columns** in real time as the user types (`Object.values(row.fields).some(v => v.includes(query))`)
- The existing per-column search drawer and panel filter rules remain untouched and work alongside the inline bar
- A **clear (×) button** removes the search text without closing the bar; a **collapse button** closes and clears it
- Smooth expand animation (150ms) with primary-coloured border on focus
- **Implementation:** `inlineSearchOpen = signal<boolean>(false)`, `inlineSearchQuery = signal<string>('')`, fed into the `filteredRows` computed

### Row Height Options

Users can choose between three row height presets from the **⋮ (more) menu** in the preview toolbar, below the export format options.

| Preset | Row Height | Notes |
|---|---|---|
| **Compact** | `var(--qo-space-8)` | Font size reduced to xs; more rows visible at once |
| **Comfortable** | `var(--qo-space-12)` | Default — unchanged from previous behaviour |
| **Expanded** | `var(--qo-space-16)` | Font size increased to base; spacious reading |

- Active preset is highlighted in the menu
- Material density icons (`density_small` / `density_medium` / `density_large`) displayed alongside each option
- **Implementation:** `rowHeight = signal<'compact' | 'comfortable' | 'expanded'>('comfortable')` applies `.table-shell--{preset}` CSS modifier class on the table shell element; `setRowHeight()` method

### Freeze / Pin Columns

Individual columns can be pinned to the left edge of the table so they remain visible during horizontal scrolling.

- **Pin Column / Unpin Column** toggle appears in each column's dropdown menu (the ↓ chevron on the column header)
- Pinned columns receive `position: sticky` with a dynamically calculated `left` offset that accounts for all earlier pinned columns plus the fixed icon and checkbox prefix columns (76px combined)
- A subtle right-side drop shadow visually separates the pinned column from scrolling content
- **Implementation:** `pinnedColumnIds = signal<string[]>([])`, `pinColumn()`, `unpinColumn()`, `isColumnPinned()` methods; `getColumnStyle()` updated to inject sticky positioning

### Group Drill-Down (Collapse / Expand Groups)

When records are grouped, each group header can be collapsed or expanded independently.

- Group headers are **clickable** — clicking toggles the group between collapsed and expanded states
- A **chevron icon** (`chevron_right` / `expand_more`) in the group header row indicates current state
- **Record count badge** shown in the group header label (e.g. `Vacant (2)`)
- **Collapse All** and **Expand All** buttons (`unfold_less` / `unfold_more` icons) appear in the grouping chip bar
- Collapsed rows are **not rendered in the DOM** — no animation overhead
- Collapse state resets when grouping is cleared via `clearGrouping()`
- **Implementation:** `collapsedGroups = signal<Set<string>>(new Set())`, `toggleGroup()`, `collapseAllGroups()`, `expandAllGroups()`, `isGroupCollapsed()` methods

### Print Full Report View

A **Print button** (print icon) in the preview toolbar prints the complete report across all pages.

- Triggers `window.print()` — uses the browser's native print dialog
- A hidden `div.print-area` is always present in the DOM (`display: none` on screen)
- On print, all other UI (toolbar, sidebar, pagination, detail panel) is hidden via `visibility: hidden`; only the print area is shown using `visibility: visible`
- The print area renders a full native `<table>` with **all rows across all groups** — not limited to the current page
- **Group headers** appear as full-width shaded rows (`background: #e8e8e8`)
- **Report header** shows name, view type, datasource, and total record count
- Page setup: `@page { size: landscape; margin: 1.5cm }`
- Row-break prevention: `page-break-inside: avoid` on `tbody tr`
- **Implementation:** `printReport()` method; `.print-area` rendered at end of component; `@media print` stylesheet

### Viewport Preview (Desktop / Tablet / Mobile)

The full preview page (opened via the PREVIEW button) now has a Zoho Creator–style top bar with viewport switching.

| Viewport | Canvas Width | Layout Behaviour |
|---|---|---|
| **Desktop** | Full width (no constraint) | List View or Card View as configured |
| **Tablet** | 820 px, centred with shadow frame | Auto-switches to Card View (2-column grid) |
| **Mobile** | 390 px, centred with shadow frame | Auto-switches to Card View (1-column stack) |

- Viewport toggle group shows `desktop_windows` / `tablet_mac` / `smartphone` Material icons
- Desktop: full bleed, no padding — identical experience to the previous full preview
- Tablet/Mobile: device-frame shadow (`border-radius: 12px`, grey background) to simulate device
- On tablet/mobile, the List/Card toggle pills are **hidden** — view is automatically forced to Card View via `effectiveViewType` computed
- **Edit this application** button in the top bar navigates back to `/report-builder`
- **Close** button closes the tab or falls back to navigate to `/report-builder`
- **Implementation:** `selectedViewport = signal<'desktop' | 'tablet' | 'mobile'>('desktop')` on `ReportPreviewPageComponent`; `viewport = input<...>` on `ReportPreviewModalComponent`; `effectiveViewType = computed(() => viewport() !== 'desktop' ? 'Card View' : report().viewType)`

### Detail Panel Drag-to-Resize

The **Record Details** side panel in the preview modal is resizable by dragging its left edge.

- A 6px invisible drag handle sits on the left edge of the panel, spanning its full height
- Dragging **left** widens the panel; dragging **right** narrows it
- **Minimum width:** 280px — **Maximum width:** 900px
- A short vertical pill indicator appears on the handle during hover/drag
- **Implementation:** `detailPanelWidth = signal<number>(460)`; `onDetailPanelResizeStart()` attaches `mousemove`/`mouseup` to `window` and removes them on release; `[style.width.px]="detailPanelWidth()"` bound on the `<aside>` element

---

## Data Model and State Handling

### Core State: `ReportBuilderFacadeService`

The facade is provided at root scope and owns all report-builder state through Angular signals and computed values:

| Signal / Computed | Type | Purpose |
|---|---|---|
| `reportsState` | `signal<ReportBuilderAsset[]>` | Full collection of report assets |
| `selectedReportIdState` | `signal<string>` | Id of the currently active report |
| `selectedReport` | `computed<ReportBuilderAsset \| null>` | Derived from `reportsState` + `selectedReportIdState` |
| `reportItems` | `computed<BuilderAssetItem[]>` | Stripped report list for sidebar rendering |
| `reportConfigTab` | `signal<ReportConfigTab>` | `quick` or `detail` — active right-panel tab |
| `reportConfigMode` | `signal<ReportConfigMode>` | `layout` or `actions` — active right-panel mode |
| `quickLayout` | `signal<QuickLayout>` | `list`, `card`, or `custom` |
| `detailLayout` | `signal<DetailLayout>` | `all_fields`, `block_layout`, or `custom_layout` |
| `previewSelection` | `signal<number[]>` | Selected row indices in preview |
| `previewPageSize` | `signal<string>` | Page size string for preview pagination |
| `detailBlockConfig` | `signal<DetailBlock[]>` | Transient working copy of detail blocks during drawer editing |
| `rowHeight` *(NEW)* | `signal<'compact' \| 'comfortable' \| 'expanded'>` | Active row height preset |
| `pinnedColumnIds` *(NEW)* | `signal<string[]>` | Column ids currently pinned/frozen |
| `collapsedGroups` *(NEW)* | `signal<Set<string>>` | Group label values currently collapsed in grouped view |
| `inlineSearchQuery` *(NEW)* | `signal<string>` | Live cross-column search text in preview toolbar |
| `inlineSearchOpen` *(NEW)* | `signal<boolean>` | Whether the inline search bar is expanded |
| `detailPanelWidth` *(NEW)* | `signal<number>` | Detail side panel width in px (default 460) |

All `updateSelectedReport()` mutations use a `(report: ReportBuilderAsset) => ReportBuilderAsset` mutator pattern that produces a new object and triggers signal propagation through `reportsState.update()`.

### Report Asset Shape

```typescript
interface ReportBuilderAsset extends BuilderAssetItem {
  description: string;
  reportType: 'list' | 'chart' | 'pivot';
  viewType: 'List View' | 'Card View';
  density: 'Compact' | 'Comfortable' | 'Detailed';
  sourceFormId: string;
  sourceFormLabel: string;
  datasourceLabel: string;
  tableLabel: string;
  joins: ReportJoin[];
  columns: ReportBuilderColumn[];
  filterPresets: ReportBuilderFilterPreset[];
  filterRules: ReportBuilderFilterRule[];
  actions: ReportBuilderAction[];
  settings: {
    defaultLayout: 'Compact' | 'Comfortable' | 'Detailed';
    recordClickAction: 'Open Detail View' | 'Do Nothing';
    showSearch: boolean;
    showFilters: boolean;
    showExport: boolean;
    showViewSwitcher: boolean;
    groupBy: string;
    groupOrder: 'none' | 'asc' | 'desc';
    showRecordCount: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    cardPrimaryFieldId: string;
    cardSecondaryFieldId: string;
    detailLayoutMode: DetailLayout;
    quickLayoutMode: QuickLayout;
    cardFieldTextColor: string;
    cardFieldFontSize: number;
    quickActionGroups: ReportActionGroup[];
    quickViewCustomLayout: ReportQuickViewCustomLayout;
    detailBlocks: Array<{
      id: string;
      title: string;
      fieldIds: string[];
      sourceFormId: string;
      columns?: string[][];  // NEW — up to 2 column arrays; overrides fieldIds when set
    }>;
  };
}
```

`BuilderAssetItem` contributes: `id`, `shortCode`, `name`, `typeLabel`, `status`.

### Updated Interfaces

#### `ReportBlockLayoutItem` (updated)

```typescript
export interface ReportBlockLayoutItem {
  id: string;
  title: string;
  sourceFormId: string;
  fieldIds: string[];
  columns?: string[][];  // NEW — when set, overrides fieldIds; up to 2 columns
}
```

When `columns` is present and has 2 entries, the block renders as two side-by-side column zones in both the builder and the preview detail panel. Backward compatible — existing blocks without `columns` continue to use `fieldIds`.

#### `ReportTabLayoutItem` (updated)

```typescript
export interface ReportTabLayoutItem {
  id: string;
  title: string;
  sourceFormId: string;
  fieldIds: string[];
  blocks?: ReportBlockLayoutItem[];  // blocks within a tab also support columns split
}
```

### Joined Field Representation

Joined columns are materialised with ids in the format `{targetFormId}__{fieldId}` (double underscore separator). This convention is applied at three points:

1. **Column array** — joined columns are appended with ids in this format and `source: 'joined'`
2. **Preview record fields** — `prefixJoinedRow()` keys all joined fields using `${targetFormId}__${column.id}`
3. **Detail block `fieldIds`** — related blocks reference the same namespaced ids

### Detail Block Config Storage and Consumption

`report.settings.detailBlocks` is the persistent store. Consumption path:
1. The block drawer reads from `selectedReport().settings.detailBlocks` as initial state
2. Edits are held in local component state and signalled out via `detailBlocksChange` output
3. The page container calls `updateSelectedReport()` to write the updated blocks back
4. The preview modal reads `report.settings.detailBlocks` to construct the detail panel structure

### Preview Record Generation

`buildPreviewRecords(report)` pipeline:

1. `createPreviewRecords(report)` — routes to `createJoinedDatasourcePreviewRecords()` for `flats_database` and `property_db` sources, or generates static-mapped records for form-based sources
2. `applyJoinsToRows()` — applies join semantics (inner/left/right/lookup) against the static JSON target dataset
3. `filterPreviewRecords(records, report.filterRules)` — applies all active filter rules with AND logic; also applies `inlineSearchQuery` cross-column filter *(NEW)*
4. `applyGroupingAndSorting(filtered, settings)` — applies grouping partitioning and sort ordering

Output is `PreviewRecord[]` where each record has `{ id: number, groupLabel: string, fields: Record<string, string> }`.

---

## Persistence and Mock Data Behavior

### Static / Mock Data

- `apps/builder/src/app/features/report-builder/data/flats_database.json` — static row set for the `flats_database` source form
- `apps/builder/src/app/features/report-builder/data/property_db.json` — static row set for the `property_db` source form
- Preview records for `employees_form`, `attendance_form`, and `leave_form` are hardcoded inline — five static records per form

### Locally Persisted (BrowserStorage)

- Source form definitions are written to and read from `localStorage` under the key `qo.builder.report.sourceForms.v1` via `BrowserStorageService`
- Report collection state, selected report id, and all configuration are held in-memory signals only and are **not persisted**

### Not Yet Persisted or Server-Backed

- Report CRUD (create, update, delete, rename) — runtime state only
- Publish lifecycle — `status` field is mutated locally; no backend workflow triggered
- Filter rules, column configuration, join definitions, detail block config — all runtime only
- Custom quick-view layout (template and canvas mode) — runtime only
- Report share, export (scheduled / scheduled email), embed — not implemented

---

## What Has Been Completed

### Core Report Infrastructure
- `ReportBuilderFacadeService` with full signal/computed state model
- `ReportBuilderAsset` shape covering all configuration surfaces
- Report creation via 3-step wizard (`ReportCreateWizardComponent`)
- Five seeded reports with realistic column, filter, and settings payloads
- Report duplication (deep-copy including joins, custom layout, action groups)
- Report deletion with fallback selection logic
- Publish status transition (local state mutation)

### Source and Column Management
- Source option loading from `BrowserStorageService` with seed form fallback
- Source switch triggering aligned reset of columns, joins, filters, detail blocks, and sort/group settings
- Column visibility toggle and order persistence
- Full `ReportBuilderColumn` metadata (fieldType, format, width, alignment, sortable, filterable)
- Column border dividers in list view (builder and preview) *(NEW)*

### Joins
- `ReportJoin` model with `inner`, `left`, `right`, `lookup` join types
- `applyJoinsToRows()` implementing all four join semantics against static JSON datasets
- `prefixJoinedRow()` generating `targetFormId__fieldId` namespaced column ids
- Joined column materialisation in the report column array with `source: 'joined'`

### Filters
- `ReportBuilderFilterRule` with full operator set (15+ operators across text, numeric, date, boolean, existence categories)
- `filterPreviewRecords()` with AND logic applied before grouping/sorting
- Active rule detection (value-independent operators, range values)
- Filter rule deep-clone on update and duplication

### Sorting and Grouping
- `applyGroupingAndSorting()` with group partition, group ordering, and within-group sort
- Type-aware comparison (date, numeric, string) in `compareValues()`
- Sort and group settings persisted in report `settings` and reset on source change

### Quick View Configuration
- List, card, and custom layout modes
- Template mode with five named slots and per-slot style controls
- Canvas mode with absolute-positioned elements and per-element style overrides
- Auto-populated default custom layout based on column type/label heuristics
- Custom layout modal for saving, editing, duplicating, and deleting named layouts

### Detail View Configuration
- `all_fields`, `block_layout`, and `custom_layout` modes
- Detail block drawer: add/remove blocks, add/remove/reorder fields, per-block source selection
- Related block support: add a block sourced from a joined form's column set
- Detail block sync on source change: reset to single primary block aligned with new source
- Preview detail side panel renders sections from `settings.detailBlocks`
- `ReportDetailCreateLayoutModalComponent` for detail custom layout creation
- **Two-column block split in ADD BLOCK mode** *(NEW)*
- **Two-column block split in ADD TAB → Block mode** *(NEW)*
- **Two-column layout rendered in preview detail panel** *(NEW)*

### Actions
- `quickActionGroups` with configurable `Single Record`, `Right-Click Record`, and `Multiple Selection` groups
- `detailActionGroups` for detail view context
- Action config drawer for enabling/disabling individual action items
- Row selection toolbar respects `Multiple Selection` group enabled state

### Preview *(includes all new features)*
- Center preview (`ReportCenterPreviewComponent`) with list and card rendering
- Full preview modal (`ReportPreviewModalComponent`) with pagination, search drawer, export menu, view switcher
- Preview page (`report-preview-page.component`) for full-page preview experience
- Detail side panel with block-based rendering using `detailBlocks`
- Row selection (`previewSelection` signal) with select-all and clear behaviors
- Selection toolbar with bulk action items
- **Inline search bar** — real-time cross-column filtering *(NEW)*
- **Row height options** — Compact / Comfortable / Expanded from ⋮ menu *(NEW)*
- **Freeze/pin columns** — sticky positioning with `left` offset calculation *(NEW)*
- **Group drill-down** — collapse/expand groups with record counts *(NEW)*
- **Print full report view** — complete table print with `@media print` stylesheet *(NEW)*
- **Viewport preview** — Desktop / Tablet / Mobile with auto card-view on small viewports *(NEW)*
- **Detail panel drag-to-resize** — 280px–900px range *(NEW)*

### Report Settings
- `ReportSettingsModalComponent` with all settings fields wired to `updateSelectedReport()`

---

## Current Supported Behavior

- Creating, duplicating, deleting, and publishing reports within the current session
- Selecting source forms from available options and resetting dependent configuration
- Toggling column visibility and reordering columns in the field config drawer
- Configuring up to N joins per report with inner/left/right/lookup semantics
- Adding, editing, and removing filter rules with the full operator set
- Applying sort and group settings and seeing them reflected in the center preview
- Switching between list, card, and custom quick view modes
- Configuring custom card layout in both template mode and canvas mode
- Switching between `all_fields`, `block_layout`, and `custom_layout` detail modes
- Adding, removing, and reordering blocks in block layout mode
- Adding related blocks sourced from joined forms
- Splitting any detail block into two side-by-side columns *(NEW)*
- Selecting records in the preview and triggering the detail side panel
- Detail side panel rendering the correct sections per `detailBlocks` configuration, including two-column blocks *(NEW)*
- Row selection with multi-select and select-all, and selection toolbar display
- Report settings (name, description, view defaults) persisting within the session
- Inline cross-column search in preview toolbar *(NEW)*
- Row height switching (Compact / Comfortable / Expanded) *(NEW)*
- Pinning columns for horizontal scroll stability *(NEW)*
- Collapsing and expanding grouped rows individually or all at once *(NEW)*
- Printing the full report table (all rows, all groups) *(NEW)*
- Previewing the report at Desktop / Tablet / Mobile viewport widths *(NEW)*
- Resizing the detail panel by dragging its left edge *(NEW)*

---

## Known Constraints and Simplifications

- **Preview records are static.** All preview data is hardcoded inline or backed by static JSON files. There is no live datasource query.
- **Join resolution is source-scoped.** Only active for `flats_database` and `property_db` sources.
- **Filter presets are display-only.** `ReportBuilderFilterPreset` items are not wired into `filterPreviewRecords()`.
- **Report state is session-only.** All configuration changes are lost on page reload. Only source form seeds are persisted via `BrowserStorageService`.
- **Publish is a local status mutation.** No backend workflow, validation, or API call occurs.
- **Custom layout canvas mode has no drag resize guards.** Element dimensions are stored as raw numbers with no boundary enforcement.
- **Detail `custom_layout` mode does not have an implemented rendering surface.** The mode can be selected and layouts can be created, but the preview panel does not render custom detail layout templates.
- **`chart` and `pivot` report types are not rendered.** Stored in `reportType`, but only list and card rendering is implemented.
- **Comparison logic treats all values as strings.** `PreviewRecord.fields` is `Record<string, string>`. No typed field evaluation.
- **`shortCode` generation is deterministic from the report name.** No deduplication applied.
- **Scheduled email reports are not implemented.** Requires backend cron/scheduler service and email delivery integration.
- **Embed / share via public URL or iframe is not implemented.** Requires token generation endpoint and a public-facing render route.

---

## Extension and Backend Readiness

The facade's `updateSelectedReport()` mutator pattern and signal-based state model are designed to be replaced at specific seams without affecting component consumers:

**Report CRUD API integration:**
- Replace the in-memory `reportsState` signal initialisation with an API fetch in a `lifespan` effect or `toSignal()` observable
- `createReport()`, `duplicateReport()`, `deleteReport()`, `publishReport()` should issue API calls and update local state optimistically or on confirmation

**Datasource and source form discovery:**
- `loadSourceOptions()` should query a forms/datasource API rather than reading from `BrowserStorageService`
- The `ReportBuilderSourceOption` shape is compatible with a backend-provided form metadata response

**Remote query execution:**
- `buildPreviewRecords()` should be replaced with an API call that accepts the current `ReportBuilderAsset` config (filters, joins, sort, group) and returns a `PreviewRecord[]` response
- The local `filterPreviewRecords()` and `applyGroupingAndSorting()` can remain as client-side augmentation or be deprecated entirely
- `inlineSearchQuery` filtering can remain client-side as it operates on the already-fetched page of results *(NEW)*

**Join resolution:**
- `applyJoinsToRows()` and `prefixJoinedRow()` should be replaced by backend-resolved joined record sets
- The `targetFormId__fieldId` namespacing convention must be maintained in the API response

**Publish workflow:**
- `publishReport()` should trigger a backend publish endpoint with validation
- Status should reflect the server response rather than a local mutation

**Persistence:**
- Any state mutated through `updateSelectedReport()` can be debounce-synced to a report patch API
- `BrowserStorageService` usage for source forms can be removed once an API-backed form discovery endpoint exists

**Scheduled email reports (future):**
- Requires a cron/scheduler service, email delivery integration (e.g. SendGrid, SES), and a UI for configuring schedule frequency and recipient lists

**Embed / share (future):**
- Requires a token generation endpoint, a public-facing render route that bypasses auth, and an iframe embed code generator

---

## QA and Validation Checklist

### Report Creation
- [ ] Wizard step 1 validates source form selection before advancing
- [ ] Wizard step 2 shows report type options and persists selection
- [ ] Wizard step 3 shows column selection from source and enforces at least one selected column
- [ ] Cancelling the wizard does not create a report
- [ ] New report appears at top of list in draft status
- [ ] Short code is derived from the report name

### Source Switch
- [ ] Changing source resets joins array to empty
- [ ] Changing source replaces all columns with new source columns, all visible
- [ ] Changing source clears filter rules
- [ ] Changing source resets sortBy and groupBy to first available column
- [ ] Changing source resets detailBlocks to single primary block

### Column Management
- [ ] Toggling a column's visibility reflects immediately in center preview
- [ ] Reordering columns persists the new order in the column array
- [ ] Joined columns appear below primary columns with `source: 'joined'`
- [ ] Joined column id follows `targetFormId__fieldId` format
- [ ] Column border dividers visible in builder list view and preview modal

### Joins
- [ ] Adding a join appends the target form's columns to the report column array
- [ ] Removing a join removes the associated joined columns
- [ ] Inner join: preview excludes primary rows with no match in target
- [ ] Left join: preview includes all primary rows; joined fields empty where no match
- [ ] Right join: preview includes all target rows; primary-only rows excluded
- [ ] Lookup join: each primary row receives only the first matching target row's fields

### Filter Rules
- [ ] Rule with no columnId or no operator does not affect preview output
- [ ] Value-independent operators (`isEmpty`, `isNotEmpty`, `isChecked`, `isUnchecked`) activate without a value
- [ ] `between` operator uses `{ start, end }` value shape and handles date and numeric ranges
- [ ] All 15+ operators produce correct record inclusion/exclusion
- [ ] Multiple rules are ANDed: record must match all active rules

### Sorting and Grouping
- [ ] Sort by date column uses date comparison, not string comparison
- [ ] Sort by numeric column uses numeric comparison
- [ ] Group order `asc`/`desc` orders group headers correctly
- [ ] Within each group, rows are sorted by `sortBy`/`sortOrder`
- [ ] Setting `groupBy` to empty removes grouping and uses flat sort

### Quick View Configuration
- [ ] Switching to list mode shows tabular column rendering
- [ ] Switching to card mode uses `cardPrimaryFieldId` and `cardSecondaryFieldId`
- [ ] Custom template mode slot assignment maps column values correctly in preview
- [ ] Canvas mode element positions are preserved on save
- [ ] Duplicating a report deep-copies custom layout

### Detail View and Blocks
- [ ] `all_fields` mode renders all visible columns in the detail panel
- [ ] `block_layout` mode renders one section per `detailBlock` entry
- [ ] Block section label is the block's `title`
- [ ] Fields within a block resolve from `PreviewRecord.fields` by `fieldId`
- [ ] Related block fields resolve using `targetFormId__fieldId` namespaced keys
- [ ] Source switch resets to single primary block and removes any related blocks

### New Feature Checks *(NEW)*
- [ ] **Inline search:** typing filters rows in real time across all columns
- [ ] **Inline search:** clear (×) button removes text without closing the bar
- [ ] **Inline search:** collapse button closes bar and clears query
- [ ] **Inline search:** existing filter drawer and per-column search still work alongside
- [ ] **Row height Compact:** rows visibly shorter; font size reduced
- [ ] **Row height Comfortable:** rows match previous default height
- [ ] **Row height Expanded:** rows visibly taller; font size increased
- [ ] **Row height:** active preset highlighted in ⋮ menu
- [ ] **Pin column:** column remains visible while table scrolls horizontally
- [ ] **Pin column:** multiple pinned columns offset correctly with no overlap
- [ ] **Unpin column:** column returns to normal scroll flow
- [ ] **Group drill-down:** clicking group header collapses its rows
- [ ] **Group drill-down:** clicking again expands rows
- [ ] **Collapse All:** all groups collapse simultaneously
- [ ] **Expand All:** all groups expand simultaneously
- [ ] **Group drill-down:** record count badge shows correct count per group
- [ ] **Group drill-down:** collapse state cleared when grouping is removed
- [ ] **Print:** print preview shows all rows (not just current page)
- [ ] **Print:** toolbar, sidebar, and pagination hidden in print view
- [ ] **Print:** group headers appear as shaded full-width rows
- [ ] **Print:** page orientation is landscape
- [ ] **Viewport desktop:** full-width, no centering or padding
- [ ] **Viewport tablet:** 820px canvas centred, card view forced, 2-column grid
- [ ] **Viewport mobile:** 390px canvas centred, card view forced, 1-column stack
- [ ] **Viewport:** List/Card toggle pills hidden on tablet and mobile
- [ ] **Viewport:** Edit this application navigates to /report-builder
- [ ] **Detail panel resize:** dragging left edge widens/narrows panel
- [ ] **Detail panel resize:** panel respects min 280px and max 900px
- [ ] **Block split (ADD BLOCK):** split button divides block into 2 columns
- [ ] **Block split:** fields can be added independently to each column
- [ ] **Block split:** split button disabled at 2 columns with tooltip
- [ ] **Block split:** remove column (×) merges fields back to single column
- [ ] **Block split (ADD TAB → Block):** same behaviour in tab layout blocks
- [ ] **Block split preview:** two-column blocks render side by side in detail panel
- [ ] **Block split backward compat:** existing blocks without `columns` field render unchanged

### Actions
- [ ] Disabled action items do not appear in the relevant context (toolbar / context menu)
- [ ] `Multiple Selection` group actions appear only when multiple rows are selected
- [ ] `Right-Click Record` group maps to context menu actions

### Preview
- [ ] Preview page size change updates visible record count
- [ ] Clicking a record opens the detail side panel
- [ ] Row checkbox selection updates `previewSelection` signal
- [ ] Selecting all rows selects all indices in the current page
- [ ] Clearing selection resets `previewSelection` to empty
- [ ] Switching reports clears `previewSelection`

### Duplicate and Delete
- [ ] Duplicate creates a copy in draft status with `(Copy)` suffix
- [ ] Duplicate does not share mutable references with the original
- [ ] Deleting the selected report selects the next available report
- [ ] Deleting the last report results in an empty selection

---

# Report Builder — Preview State JSON Structure

## Overview

When the **Preview** button is clicked in the Report Builder, the active `ReportBuilderAsset` is serialised to JSON and written to `localStorage` under a key in the format:

```
report-preview-{reportId}-{uuid}
```

The preview page (`/report-builder/preview?stateKey=...`) reads this key, parses the JSON into a `ReportBuilderAsset`, and uses it to render the full preview UI. The key is deleted from `localStorage` immediately after reading to avoid stale state.

---

## Full JSON Structure

```json
{
  "id": "uuid",
  "name": "Employee Directory",
  "typeLabel": "Report",
  "status": "live",

  "description": "Summarise attendance logs with grouped trends and status filters.",
  "reportType": "list",
  "viewType": "List View",
  "density": "Comfortable",

  "sourceFormId": "uuid",
  "sourceFormLabel": "Flats Database",
  "datasourceLabel": "qo_hmrs_stage",
  "tableLabel": "attendance_logs",

  "columns": [
    {
      "id": "flat_unique_id",
      "label": "Flats Unique ID",
      "formId": "uuid",
      "source": "primary",
      "fieldType": "single_line",
      "format": "text",
      "visible": true,
      "width": "Medium",
      "sortable": true,
      "filterable": true,
      "alignment": "Left"
    },
    {
      "id": "property_db__property_name",
      "label": "Property DB · Property Name",
      "formId": "property_db",
      "source": "joined",
      "fieldType": "single_line",
      "format": "text",
      "visible": true,
      "width": "Medium",
      "sortable": true,
      "filterable": false,
      "alignment": "Left"
    }
  ],

  "filterPresets": [
    { "id": "fp1", "label": "Active Only", "enabled": false },
    { "id": "fp2", "label": "This Month",  "enabled": false },
    { "id": "fp3", "label": "My Team",     "enabled": false }
  ],

  "filterRules": [
    {
      "id": "fr1",
      "columnId": "occupancy_status",
      "operator": "is",
      "value": "Occupied"
    },
    {
      "id": "fr2",
      "columnId": "flat_area",
      "operator": "between",
      "value": { "start": "500", "end": "1200" }
    }
  ],

  "actions": [
    { "id": "a1", "label": "Edit",   "enabled": true },
    { "id": "a2", "label": "Delete", "enabled": true }
  ],

  "settings": {

    "defaultLayout": "Comfortable",
    "recordClickAction": "Open Detail View",

    "showSearch": true,
    "showFilters": true,
    "showExport": true,
    "showViewSwitcher": true,
    "showRecordCount": true,

    "sortBy": "flat_unique_id",
    "sortOrder": "asc",

    "groupBy": "occupancy_status",
    "groupOrder": "asc",

    "cardPrimaryFieldId": "flat_unique_id",
    "cardSecondaryFieldId": "occupancy_status",
    "cardFieldTextColor": "#111827",
    "cardFieldFontSize": 14,

    "quickLayoutMode": "list",
    "detailLayoutMode": "block_layout",

    "quickActionGroups": [
      {
        "title": "Single Record",
        "description": "Actions available when one row is selected.",
        "items": [
          { "label": "Edit",      "enabled": true  },
          { "label": "Duplicate", "enabled": true  },
          { "label": "Delete",    "enabled": true  }
        ]
      },
      {
        "title": "Right-Click Record",
        "description": "Actions in the row context menu.",
        "items": [
          { "label": "Edit",      "enabled": true  },
          { "label": "Duplicate", "enabled": false },
          { "label": "Delete",    "enabled": true  }
        ]
      },
      {
        "title": "Multiple Selection",
        "description": "Actions in the bulk selection toolbar.",
        "items": [
          { "label": "Bulk Edit", "enabled": false },
          { "label": "Delete",    "enabled": true  },
          { "label": "Edit",      "enabled": false }
        ]
      }
    ],

    "detailBlocks": [
      {
        "id": "db1",
        "title": "Flat Details",
        "sourceFormId": "uuid",
        "fieldIds": ["flat_unique_id", "occupancy_status", "cluster"],
        "columns": [
          ["flat_unique_id", "occupancy_status"],
          ["cluster", "property_code"]
        ]
      },
      {
        "id": "db2",
        "title": "Property Info",
        "sourceFormId": "property_db",
        "fieldIds": [
          "property_db__property_name",
          "property_db__block_name"
        ]
      }
    ],

    "quickViewCustomLayout": {
      "templateMode": false,
      "templateVariant": "block",
      "selectedSlot": "title",
      "activeTab": "display",
      "slots": {
        "image":      "photo",
        "title":      "flat_unique_id",
        "body":       "occupancy_status",
        "meta_left":  "cluster",
        "meta_right": "property_code"
      },
      "styles": {
        "cardBackgroundColor": "#ffffff",
        "cardPadding": { "top": 12, "right": 16, "bottom": 12, "left": 16 },
        "titleColor":      "#111827",
        "titleFontSize":   15,
        "titleFontWeight": 600,
        "bodyColor":       "#374151",
        "bodyFontSize":    13,
        "metaColor":       "#6b7280",
        "metaFontSize":    12,
        "imageShape":      "circle",
        "slotStyles": {
          "title": { "align": "left", "backgroundColor": "transparent",
                     "padding": { "top": 4, "right": 0, "bottom": 2, "left": 0 } },
          "body":  { "align": "left", "backgroundColor": "transparent",
                     "padding": { "top": 0, "right": 0, "bottom": 4, "left": 0 } }
        }
      },
      "canvasLayout": {
        "containerWidth": 320,
        "containerHeight": 160,
        "elements": [
          {
            "instanceId": "el-1",
            "slotId": "title",
            "label": "Flat ID",
            "x": 12, "y": 12, "width": 200, "height": 24,
            "visualType": "text",
            "fontSize": 15, "fontWeight": 600,
            "textAlign": "left", "textColor": "#111827",
            "backgroundColor": "transparent"
          }
        ]
      }
    }
  }
}
```

---

## Field Reference

### Top-level (Asset metadata)

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique report id |
| `shortCode` | `string` | 2-letter code shown in sidebar avatar |
| `name` | `string` | Report display name |
| `typeLabel` | `string` | Always `"Report"` |
| `status` | `"live" \| "draft"` | Publish status |
| `description` | `string` | Report description text |
| `reportType` | `"list" \| "chart" \| "pivot"` | Report rendering type |
| `viewType` | `"List View" \| "Card View"` | Default quick view mode |
| `density` | `"Compact" \| "Comfortable" \| "Detailed"` | Row density |
| `sourceFormId` | `string` | Id of the primary source form |
| `sourceFormLabel` | `string` | Display name of the source form |
| `datasourceLabel` | `string` | Datasource identifier |
| `tableLabel` | `string` | Table/collection name within the datasource |

---

### `joins[]`

| Field | Type | Description |
|---|---|---|
| `sourceFormId` | `string` | Primary form id |
| `targetFormId` | `string` | Form id being joined |
| `joinType` | `"inner" \| "left" \| "right" \| "lookup"` | Join semantics |
| `on.sourceField` | `string` | Field id on the primary form used as the join key |
| `on.targetField` | `string` | Field id on the target form used as the join key |
| `alias` | `string?` | Optional short alias for the joined form |

---

### `columns[]`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | For primary columns: plain field id. For joined columns: `{targetFormId}__{fieldId}` |
| `label` | `string` | Display label |
| `formId` | `string` | The form this column belongs to |
| `source` | `"primary" \| "joined"` | Origin of the column |
| `fieldType` | `string` | Raw field type (`single_line`, `date`, `drop_down`, etc.) |
| `format` | `"text" \| "number" \| "date" \| "email" \| "currency" \| "image"` | Display format |
| `visible` | `boolean` | Whether the column appears in the preview table |
| `width` | `"Small" \| "Medium" \| "Large"` | Column width preset |
| `sortable` | `boolean` | Whether the column header shows a sort control |
| `filterable` | `boolean` | Whether the column can be used in filter rules |
| `alignment` | `"Left" \| "Center" \| "Right"` | Cell content alignment |

---

### `filterRules[]`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique rule id |
| `columnId` | `string` | Column id the rule applies to |
| `operator` | `string` | One of: `is`, `isNot`, `contains`, `notContains`, `startsWith`, `endsWith`, `greaterThan`, `greaterThanOrEqual`, `lessThan`, `lessThanOrEqual`, `before`, `after`, `onOrBefore`, `onOrAfter`, `between`, `isEmpty`, `isNotEmpty`, `isChecked`, `isUnchecked` |
| `value` | `string \| { start: string; end: string }` | Filter value. Use `{ start, end }` object for `between` operator only |

---

### `settings` object

| Field | Type | Description |
|---|---|---|
| `defaultLayout` | `"Compact" \| "Comfortable" \| "Detailed"` | Row density default |
| `recordClickAction` | `"Open Detail View" \| "Do Nothing"` | What happens when a row is clicked |
| `showSearch` | `boolean` | Show search icon in preview toolbar |
| `showFilters` | `boolean` | Show filter controls in preview toolbar |
| `showExport` | `boolean` | Show export menu in preview toolbar |
| `showViewSwitcher` | `boolean` | Show list/card switcher in preview toolbar |
| `showRecordCount` | `boolean` | Show record count chip in group headers |
| `sortBy` | `string` | Column id to sort by (empty = no sort) |
| `sortOrder` | `"asc" \| "desc"` | Sort direction |
| `groupBy` | `string` | Column id to group by (empty = no grouping) |
| `groupOrder` | `"none" \| "asc" \| "desc"` | Group header ordering |
| `cardPrimaryFieldId` | `string` | Column id used as the card title in card view |
| `cardSecondaryFieldId` | `string` | Column id used as the card subtitle in card view |
| `cardFieldTextColor` | `string` | Hex color for card field text |
| `cardFieldFontSize` | `number` | Font size in px for card field text |
| `quickLayoutMode` | `"list" \| "card" \| "custom"` | Active quick view mode |
| `detailLayoutMode` | `"all_fields" \| "block_layout" \| "custom_layout"` | Active detail view mode |

---

### `settings.quickActionGroups[]`

Three groups are expected in this order: `Single Record`, `Right-Click Record`, `Multiple Selection`.

| Field | Type | Description |
|---|---|---|
| `title` | `string` | Group label |
| `description` | `string` | Short description shown in the action config drawer |
| `items[].label` | `string` | Action label (e.g. `"Edit"`, `"Delete"`) |
| `items[].enabled` | `boolean` | Whether this action is active in its context |

---

### `settings.detailBlocks[]`

Each entry becomes one section in the detail side panel when `detailLayoutMode` is `block_layout`.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique block id |
| `title` | `string` | Section label shown in the detail panel |
| `sourceFormId` | `string` | The form this block's fields come from |
| `fieldIds[]` | `string[]` | Ordered list of column ids. Used when `columns` is absent. |
| `columns` | `string[][] (optional)` | **NEW** — Up to 2 arrays of field ids rendered side by side. When present, overrides `fieldIds` in the preview. |

---

### `settings.quickViewCustomLayout`

| Field | Type | Description |
|---|---|---|
| `templateMode` | `boolean` | `true` = slot-based template mode, `false` = canvas mode |
| `templateVariant` | `"block" \| "list"` | Visual variant when in template mode |
| `selectedSlot` | `"image" \| "title" \| "body" \| "meta_left" \| "meta_right"` | Currently active slot in the designer |
| `activeTab` | `"display" \| "style"` | Active right-panel tab in the custom layout editor |
| `slots.image` | `string` | Column id mapped to the image slot |
| `slots.title` | `string` | Column id mapped to the title slot |
| `slots.body` | `string` | Column id mapped to the body slot |
| `slots.meta_left` | `string` | Column id mapped to the bottom-left meta slot |
| `slots.meta_right` | `string` | Column id mapped to the bottom-right meta slot |
| `styles.cardBackgroundColor` | `string` | Hex color for the card surface |
| `styles.cardPadding` | `{ top, right, bottom, left: number }` | Card inner padding in px |
| `styles.titleColor` | `string` | Hex color for title slot text |
| `styles.titleFontSize` | `number` | Font size in px for title |
| `styles.titleFontWeight` | `number` | Font weight for title (e.g. 400, 600) |
| `styles.bodyColor` | `string` | Hex color for body slot text |
| `styles.bodyFontSize` | `number` | Font size in px for body |
| `styles.metaColor` | `string` | Hex color for meta slot text |
| `styles.metaFontSize` | `number` | Font size in px for meta slots |
| `styles.imageShape` | `"square" \| "circle" \| "full"` | Shape of the image slot |
| `styles.slotStyles[slot].align` | `"left" \| "center" \| "right"` | Per-slot horizontal alignment |
| `styles.slotStyles[slot].backgroundColor` | `string` | Per-slot background color |
| `styles.slotStyles[slot].padding` | `{ top, right, bottom, left: number }` | Per-slot inner padding in px |

---

### `settings.quickViewCustomLayout.canvasLayout`

Only present when `templateMode` is `false`.

| Field | Type | Description |
|---|---|---|
| `containerWidth` | `number` | Canvas width in px |
| `containerHeight` | `number` | Canvas height in px |
| `elements[]` | `QuickViewCanvasElement[]` | Positioned elements on the canvas |

**Each canvas element:**

| Field | Type | Description |
|---|---|---|
| `instanceId` | `string` | Unique element id within the canvas |
| `slotId` | `"image" \| "title" \| "body" \| "meta_left" \| "meta_right"` | Which data slot this element renders |
| `label` | `string` | Display label for the element in the designer |
| `x` | `number` | Left offset in px from canvas origin |
| `y` | `number` | Top offset in px from canvas origin |
| `width` | `number` | Element width in px |
| `height` | `number` | Element height in px |
| `visualType` | `"text" \| "image" \| "icon" \| "button"` | Rendering type |
| `iconGlyph` | `string?` | Icon name (only for `visualType: "icon"`) |
| `buttonVariant` | `"filled" \| "outline"?` | Button style (only for `visualType: "button"`) |
| `fontSize` | `number?` | Font size in px (text elements) |
| `fontWeight` | `number?` | Font weight (text elements) |
| `textAlign` | `"left" \| "center" \| "right"?` | Text alignment (text elements) |
| `textColor` | `string?` | Hex text color (text elements) |
| `backgroundColor` | `string?` | Hex background color |

---

## Key Conventions

**Joined column id format:** All fields from a joined form must use the `{targetFormId}__{fieldId}` double-underscore format in `columns[].id`, `detailBlocks[].fieldIds`, `slots.*`, and canvas element `slotId` mappings.

**`filterRules[].value` for `between`:** Must be a JSON object `{ "start": "...", "end": "..." }`, not a string. All other operators use a plain string value.

**`canvasLayout` presence:** If `templateMode` is `true`, the `canvasLayout` key should be omitted or set to `undefined`. If `templateMode` is `false`, `canvasLayout` must be present with valid `containerWidth`, `containerHeight`, and `elements[]`.

**`detailBlocks` order:** The order of items in `detailBlocks[]` directly controls the order of sections in the detail side panel. The first block is treated as the primary block.

**`detailBlocks[].columns` vs `fieldIds`:** When `columns` is present, it takes precedence over `fieldIds` in the preview rendering. The `fieldIds` array should still be kept in sync as a flattened fallback for backward compatibility. When a column is removed, its id should be removed from both `columns` and `fieldIds`.

**`filterPresets[]` vs `filterRules[]`:** These are independent arrays. `filterPresets` are display-only named toggles. `filterRules` are the actual conditions evaluated during preview record generation.

---

## Glossary

**Report asset** — the full data structure (`ReportBuilderAsset`) representing a single report including source metadata, columns, joins, filters, actions, and the complete settings payload.

**Source form** — a form registered in the builder's datasource layer that serves as the primary data source for a report. Exposed as a `ReportBuilderSourceOption` with column definitions.

**Column (`ReportBuilderColumn`)** — a data field exposed by a source or joined form. Carries display metadata (label, format, width, alignment) and capability flags (sortable, filterable).

**Join (`ReportJoin`)** — a configuration linking a primary source form to a secondary (target) form via a matching field pair. Supports `inner`, `left`, `right`, and `lookup` semantics.

**Joined column id** — a column id in the format `{targetFormId}__{fieldId}` that identifies a field originating from a joined form.

**Filter rule (`ReportBuilderFilterRule`)** — a single condition applied during preview record generation, consisting of a `columnId`, an `operator`, and a `value`. Multiple rules are ANDed together.

**Filter preset (`ReportBuilderFilterPreset`)** — a named, toggleable preset label stored per report. Display-only in the current implementation.

**Quick View** — the mode controlling how records appear in the center preview panel. Three modes: `list`, `card`, `custom`.

**Quick View custom layout (`ReportQuickViewCustomLayout`)** — a complete card rendering specification stored in `report.settings.quickViewCustomLayout`.

**Detail View** — the right-side panel shown when a record is clicked in preview. Three modes: `all_fields`, `block_layout`, `custom_layout`.

**Detail block** — a named grouping of field ids (`ReportBlockLayoutItem`) associated with a specific source form. In `block_layout` mode each block becomes a section in the detail side panel.

**Block column split** *(NEW)* — optional two-column layout within a single block. Stored as `columns?: string[][]` on `ReportBlockLayoutItem`. When set, the block renders two side-by-side field columns in both the builder and the preview detail panel.

**Related block** — a detail block whose `sourceFormId` references a non-primary (joined) form.

**Preview record (`PreviewRecord`)** — a single record in the report preview output: `{ id, groupLabel, fields: Record<string, string> }`.

**Inline search** *(NEW)* — a real-time cross-column text filter in the preview toolbar. Separate from and complementary to the per-column search drawer and filter rules.

**Row height** *(NEW)* — a user-selectable row density preset: `compact`, `comfortable`, or `expanded`. Controlled by the `rowHeight` signal and applied as a CSS modifier class on the table shell.

**Pinned column** *(NEW)* — a column with `position: sticky` applied, remaining visible at the left edge during horizontal scroll. Managed by the `pinnedColumnIds` signal.

**Group drill-down** *(NEW)* — collapsible group rows in grouped list view. Collapse/expand per group or all at once. Managed by the `collapsedGroups` signal.

**Viewport preview** *(NEW)* — full preview page mode showing the report at Desktop (full width), Tablet (820px), or Mobile (390px) viewport widths. Tablet/mobile automatically force Card View.

**Action group (`ReportActionGroup`)** — a named set of action items configuring the toolbar or context menu behaviour for a specific selection context.

**Seeded report** — a report pre-loaded into the report collection at service initialisation. Not persisted; resets on page reload.

**Session state** — all report-builder configuration exists only in in-memory Angular signals for the duration of the browser session.

**`BrowserStorageService`** — a wrapper around `localStorage` providing SSR-safe read/write operations. Used by the report builder exclusively to persist source form seed definitions across sessions.
