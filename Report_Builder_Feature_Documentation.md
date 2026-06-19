# Report Builder Feature Proposal Documentation

## Proposal Overview

The Report Builder is a proposed module within Quanta Ops Builder intended to allow teams to create, configure, preview, and publish operational reports composed from  datasources. It provides a full configuration surface for defining what data is shown, how it is grouped and filtered, how records appear in list and card modes, and how detail views are structured when a record is opened.

The proposed first phase is planned as frontend-driven. All report state is held in an Angular signals-based facade service (`ReportBuilderFacadeService`) and managed entirely in-memory during a builder session. Preview record generation, join resolution, filtering, sorting, and grouping are computed locally using static JSON-backed datasource records. No remote query execution or server-backed persistence currently exists.

**Planned in Phase 1 (frontend-driven):**
- Report creation, duplication, deletion, publish status change
- Column management, filter rules, sort/group settings
- Quick View and Detail View configuration including custom card layout
- Detail block creation, ordering, and related-form block support
- Preview record generation, filtering, grouping, and sorting
- Row selection and bulk action state

**Planned in later phases (backend integration):**
- Report CRUD persistence (no server round-trip on create/update/delete)
- Remote query execution against live datasources
- Join resolution via SQL or API query
- Publish lifecycle enforcement
- Source form and datasource discovery via API

---

## Proposed Functional Capabilities

### Report Creation and Seeded Reports

In the proposed implementation, `ReportBuilderFacadeService` will seed the report collection with five static reports across the `employees_form`, `attendance_form`, and `leave_form` source forms, with a mix of `live` and `draft` statuses. Each seeded report initialises a full `ReportBuilderAsset` including columns, filter presets, actions, and a complete `settings` payload.

New reports are proposed to be created through a three-step wizard (`ReportCreateWizardComponent`) that collects:
- A report name
- A source form (selected from `sourceOptions`)
- A report type (`list`, `chart`, or `pivot`)
- A view type (`List View` or `Card View`)
- An initial column selection (up to 5 columns from the source form's column list)

On wizard completion, `createReport()` is expected to construct a new `ReportBuilderAsset` in draft status, prepends it to the report collection, and selects it. The short code for sidebar display is derived from the report name.

### Source Form and Datasource Selection

Source forms are proposed to be exposed as `ReportBuilderSourceOption[]` resolved at service construction time by `loadSourceOptions()`. Each source option carries:
- `id` and `name` — form identifier and display label
- `datasourceLabel` and `tableLabel` — contextual datasource metadata
- `columns: ReportBuilderColumn[]` — the full typed column set for that form

Source options are planned to be loaded from a combination of static JSON-backed forms (`flats_database`, `property_db`) and form seeds stored in `BrowserStorageService` under the key `qo.builder.report.sourceForms.v1`. If no stored forms exist, a default set of seed forms (`employees_form`, `attendance_form`, `leave_form`) is written into storage on first load.

When the active report's source form is changed via `updateSelectedReportSource()`, the following properties are reset to align with the new source:
<!-- - `joins` — cleared to empty array -->
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

Joined columns are appended to the column array after primary columns. Their `source` is set to `'joined'` and their `id` follows the namespaced format `targetFormId__fieldId` (see Joins section). Their `formId` is set to the target form's id.

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

Join preview resolution is currently only active for the `flats_database` and `property_db` source forms, which have corresponding static JSON datasets. For other source forms (`employees_form`, `attendance_form`, `leave_form`), joins are stored in configuration but the preview falls back to a non-joined record set.

### Filters and Filter Rules

Filter rules are proposed to be stored as `ReportBuilderFilterRule[]` on each report and are applied during preview record generation via `filterPreviewRecords()`. All active rules are Added together — a record must satisfy every active rule to appear in the preview output.

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

Sorting and grouping settings are proposed to be stored within `report.settings`:
- `sortBy` — column id to sort by
- `sortOrder` — `asc` or `desc`
- `groupBy` — column id to group by (empty string = no grouping)
- `groupOrder` — `none`, `asc`, or `desc` (controls group header ordering)

During preview generation, `applyGroupingAndSorting()` is called after filtering:
- If `groupBy` is set, records are partitioned into groups keyed by the group field's value. Groups are optionally sorted by key. Within each group, records are sorted by `sortBy`/`sortOrder`. The `groupLabel` on each `PreviewRecord` is set to the group key value.
- If `groupBy` is empty, records are sorted by `sortBy`/`sortOrder` and `groupLabel` is set to the record's primary display value.

Sort comparison is type-aware: date strings are parsed via `Date.parse()`, numeric strings are compared as numbers after stripping non-numeric characters, and remaining values fall through to locale-sensitive string comparison with `numeric: true`.

### Quick View Configuration

Quick View is intended to control how records appear in the center preview panel. Three modes are supported, toggled via `setQuickLayout()`:

**`list`** — Tabular column-based rendering. The active columns in definition order are displayed as table headers and row cells.

**`card`** — Card-based rendering using two designated fields: `cardPrimaryFieldId` (main display value) and `cardSecondaryFieldId` (supporting value). These are set from `report.settings`.

**`custom`** — Full custom card layout stored in `report.settings.quickViewCustomLayout` as `ReportQuickViewCustomLayout`. The custom layout has two sub-modes:

- **Template mode** (`templateMode: true`) — a slot-based layout with five named slots: `image`, `title`, `body`, `meta_left`, `meta_right`. Each slot maps to a column id. Slot-level style controls include alignment, background color, and padding. Global style controls include card background, card padding, and per-role typography settings (title/body/meta font size, weight, and color).

- **Canvas mode** (`templateMode: false`) — a positioned-element canvas layout stored as `canvasLayout: QuickViewCanvasLayout`. The canvas has a defined `containerWidth` and `containerHeight`, and an array of `QuickViewCanvasElement` items, each with absolute `x`, `y`, `width`, `height` coordinates, a `slotId`, `visualType` (`text`, `image`, `icon`, `button`), and per-element style overrides.

On first creation, `createDefaultQuickViewCustomLayout()` auto-populates the slot mapping by scanning column labels for semantic candidates (image/photo/file for the image slot, name/title/subject for the title slot, multi-line/description/notes for the body slot).

Saved custom layouts can be activated, duplicated, and deleted through the Custom Layout Modal (`ReportCustomLayoutModalComponent`).

### Detail View Configuration

Detail View is intended to control the right-side panel that opens when a record is clicked in preview. Three modes are available, set via `setDetailLayout()`:

**`all_fields`** — All visible columns for the report are rendered in a flat field list. No block structure is applied.

**`block_layout`** — Fields are organised into named blocks. Each block has a `title`, a `sourceFormId`, and an ordered list of `fieldIds`. Blocks are rendered as collapsible or titled sections in the detail panel. This is the primary mode for reports that include joined data, as each block can point to a different source form.

**`custom_layout`** — Reserved for custom template rendering. Detail layout templates are accessible via a flyout on hover over the "Custom Layout" card in the right panel. The `ReportDetailCreateLayoutModalComponent` handles creation of new detail layouts in this mode.

### Detail Block Layout and Related Block Support

Detail blocks are stored in `report.settings.detailBlocks` as:
```typescript
Array<{ id: string; title: string; fieldIds: string[]; sourceFormId: string }>
```

The detail block drawer (`toggleDrawer('detailBlockLayout')`) exposes the block editor. Capabilities include:
- Adding and removing blocks
- Adding, removing, and reordering fields within a block
- Setting per-block source form association (`sourceFormId`)
- Adding a **related block** — a block sourced from a non-primary form (i.e. a joined form's column set)

When a new related block is added, it is sourced from the non-primary source options available to the report (any source form that appears in the `joins` array). The related block's `fieldIds` are populated from the joined form's columns using the `targetFormId__fieldId` namespacing convention.

When the active report source is changed via `updateSelectedReportSource()`, `detailBlocks` is reset to a single primary block aligned with the new source form. This ensures the detail tab structure always corresponds to the active center-grid datasource. The reset uses the source's `tableLabel` as the block title and maps all source columns as `fieldIds`.

Detail blocks are consumed by `ReportPreviewModalComponent` and the preview detail side panel to generate per-block tabs. Each tab renders the fields from its `fieldIds` array by resolving values from the `PreviewRecord.fields` map using the full (potentially namespaced) column id.

### Actions Configuration

**Quick actions** are stored in `report.settings.quickActionGroups` as `ReportActionGroup[]`. The default groups and their semantics are defined in `REPORT_BUILDER_QUICK_ACTION_GROUPS`:
- `Single Record` — actions available when one row is selected (Edit, Duplicate, Delete)
- `Right-Click Record` — context menu actions on a row (Edit, Delete; Duplicate disabled by default)
- `Multiple Selection` — bulk selection toolbar actions (Bulk Edit, Delete; Edit disabled by default)

Each group contains `items: ReportActionItem[]` with `label` and `enabled` boolean. The action config drawer (`toggleDrawer('action')`) surfaces the toggle and ordering controls.

**Detail actions** are surfaced in the Detail View panel header. `REPORT_BUILDER_DETAIL_ACTION_GROUPS` defines one group: `Detail View Actions` with Edit, Duplicate, and Delete items.

Row-level action items in the center preview (edit, duplicate, delete, context menu) reference the `quickActionGroups` configuration. Enabled state controls whether the action appears in the respective context.

### Report Settings

Report settings are edited via `ReportSettingsModalComponent` and include:
- `name` and `description` — display metadata
- `defaultLayout` — `Compact`, `Comfortable`, or `Detailed`
- `recordClickAction` — `Open Detail View` or `Do Nothing`
- `showSearch`, `showFilters`, `showExport`, `showViewSwitcher` — feature toggle flags for the preview toolbar
- `showRecordCount` — toggles record count display in grouped previews

Settings updates are written via `updateSelectedReport()` using the mutator pattern.

### Publish, Duplicate, and Delete

**Publish** — `publishReport(reportId)` sets the report's `status` to `live` via a signal update. No external API call occurs. The status change is reflected immediately in the sidebar and report header.

**Duplicate** — `duplicateReport(reportId)` performs a deep-copy of all report state including:
- Columns (shallow copy of each column object)
- Joins (with `on` object cloned)
- Filter rules (deep-cloned via `cloneFilterRules()`)
- Actions and filter presets
- `settings.quickActionGroups` (deep-cloned via `cloneActionGroups()`)
- `settings.quickViewCustomLayout` (with `slots`, `styles`, and `canvasLayout.elements` individually spread)

The duplicate is set to `draft` status and named `<original name> (Copy)`. It is prepended to the report list and auto-selected.

**Delete** — `deleteReport(reportId)` removes the report from state and reassigns the selected report to the next report at the same index, or the preceding report, or empty string if none remain.

### Preview Behavior and Record Detail Side Panel

The center preview (`ReportCenterPreviewComponent`) renders the result of `buildPreviewRecords()` in list or card mode depending on the active quick layout. Preview records are generated on demand and reflect the current column, filter, sort, and group configuration.

The full preview modal (`ReportPreviewModalComponent`) and full preview page (`report-preview-page.component`) provide an expanded view with pagination (page size controlled by `previewPageSize` signal), search drawer, export menu, and view switcher.

Clicking a record opens the detail side panel. In `all_fields` mode, the panel renders a flat field list from the visible columns. In `block_layout` mode, the panel renders one tab per configured detail block. The block title becomes the tab label. Fields within each tab are resolved from `PreviewRecord.fields` using the block's `fieldIds`. For related blocks, field values are resolved using the `targetFormId__fieldId` namespaced key.

### Row Selection and Bulk Actions

Row selection is planned to be managed by `previewSelection: signal<number[]>` in the facade, storing the indices of selected preview records. `togglePreviewRow(index)` adds or removes a row index from the selection set. `clearPreviewSelection()` resets the selection.

When rows are selected, the preview renders a selection toolbar displaying count and contextually available actions from the `Multiple Selection` action group. `select-all-visible` behavior selects all record indices in the current page-limited preview output. Selection state is cleared on `selectReport()` to prevent stale selection when switching reports.

---

## Proposed Data Model and State Handling

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
| `fieldConfigOpen`, `searchPanelOpen`, `bulkEditOpen`, `actionConfigOpen`, `detailLayoutConfigOpen`, `detailBlockLayoutConfigOpen` | `signal<boolean>` | Drawer open states (mutually exclusive via `toggleDrawer()`) |
| `createWizardOpen`, `reportSettingsOpen`, `previewOpen`, `customLayoutOpen` | `computed<boolean>` | Modal open states |

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
    detailBlocks: Array<{ id: string; title: string; fieldIds: string[]; sourceFormId: string }>;
  };
}
```

`BuilderAssetItem` contributes: `id`, `shortCode`, `name`, `typeLabel`, `status`.

### Joined Field Representation

Joined columns are materialised with ids in the format `{targetFormId}__{fieldId}` (double underscore separator). This convention is applied at three points:

1. **Column array** — when joins are applied during preview record generation, joined columns are appended to the column list with ids in this format and `source: 'joined'`.
2. **Preview record fields** — `prefixJoinedRow()` keys all fields from the joined row using `${targetFormId}__${column.id}`, so `PreviewRecord.fields` carries both primary and joined values in a flat map.
3. **Detail block `fieldIds`** — when a related block is created for a joined source, its `fieldIds` reference the same namespaced ids, allowing the detail panel to resolve values from the merged `PreviewRecord.fields` map.

### Detail Block Config Storage and Consumption

`report.settings.detailBlocks` is the persistent store for block definitions. `detailBlockConfig` signal in the facade is a working copy used during the block drawer editing session and is committed back to `report.settings.detailBlocks` when the drawer emits `detailBlocksChange`.

Consumption path:
1. The block drawer reads from `selectedReport().settings.detailBlocks` as initial state
2. Edits are held in the drawer's local component state and signalled out via `detailBlocksChange` output
3. The page container calls `updateSelectedReport()` to write the updated blocks back into report settings
4. The preview modal and preview page read `report.settings.detailBlocks` to construct the detail panel tab structure

### Preview Record Generation

`buildPreviewRecords(report)` is the public entry point. The pipeline:

1. `createPreviewRecords(report)` — routes to `createJoinedDatasourcePreviewRecords()` for `flats_database` and `property_db` sources, or generates static-mapped records for the form-based sources (`employees_form`, `attendance_form`, `leave_form`).
2. `applyJoinsToRows()` — for join-capable sources, iterates `report.joins` and applies join semantics (inner/left/right/lookup) against the static JSON target dataset. Produces a merged row set.
3. `filterPreviewRecords(records, report.filterRules)` — applies all active filter rules with AND logic.
4. `applyGroupingAndSorting(filtered, settings)` — applies grouping partitioning (if `groupBy` is set) and sort ordering.

Output is `PreviewRecord[]` where each record has `{ id: number, groupLabel: string, fields: Record<string, string> }`.

---

## Proposed Persistence and Mock Data Behavior

### Static / Mock Data

- `apps/builder/src/app/features/report-builder/data/flats_database.json` — static row set for the `flats_database` source form. Used for join preview resolution.
- `apps/builder/src/app/features/report-builder/data/property_db.json` — static row set for the `property_db` source form. Used as join target dataset.
- Preview records for `employees_form`, `attendance_form`, and `leave_form` are hardcoded inline in `createPreviewRecords()` — five static records per form, with field values mapped by column id.

### Locally Persisted (BrowserStorage)

- Source form definitions are written to and read from `localStorage` under the key `qo.builder.report.sourceForms.v1` via `BrowserStorageService`. This allows source form seeds to persist across page reloads.
- Report collection state, selected report id, and all configuration are held in-memory signals only and are **not persisted**. Refreshing the page resets the report collection to the seeded default state.

### Not Yet Persisted or Server-Backed

- Report CRUD (create, update, delete, rename) — runtime state only, not written to any backend
- Publish lifecycle — `status` field is mutated locally; no backend workflow triggered
- Filter rules, column configuration, join definitions, detail block config — all runtime only
- Custom quick-view layout (template and canvas mode) — runtime only
- Query execution — preview records are generated locally from static data; no datasource query is issued
- Report share, export, embed — not implemented

---

## Proposed Scope (For Approval)

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
- Preview detail side panel renders tabs from `settings.detailBlocks` rather than fixed generic tabs
- `ReportDetailCreateLayoutModalComponent` for detail custom layout creation

### Actions
- `quickActionGroups` with configurable `Single Record`, `Right-Click Record`, and `Multiple Selection` groups
- `detailActionGroups` for detail view context
- Action config drawer for enabling/disabling individual action items
- Row selection toolbar respects `Multiple Selection` group enabled state

### Preview
- [ ] Preview export to PDF downloads the current report view
- [ ] Preview export to XLSX downloads tabular data with expected columns
- [ ] Preview export to CSV downloads tabular data with expected columns`r`n- Center preview (`ReportCenterPreviewComponent`) with list and card rendering
- Full preview modal (`ReportPreviewModalComponent`) with pagination, search drawer, export menu (PDF/XLSX/CSV), view switcher
- Preview page (`report-preview-page.component`) for full-page preview experience
- Detail side panel with block-based tab rendering using `detailBlocks`
- Row selection (`previewSelection` signal) with select-all and clear behaviors
- Selection toolbar with bulk action items

### Report Settings
- `ReportSettingsModalComponent` with all settings fields wired to `updateSelectedReport()`

---

## Target Behavior After Approval

- Creating, duplicating, deleting, and publishing reports within the current session
- Selecting source forms from available options and resetting dependent configuration
- Toggling column visibility and reordering columns in the field config drawer
- Configuring up to N joins per report with inner/left/right/lookup semantics
- Adding, editing, and removing filter rules with the full operator set
- Applying sort and group settings and seeing them reflected in the center preview
- Switching between list, card, and custom quick view modes
- Configuring custom card layout in both template mode (slot assignment + styles) and canvas mode (positioned elements)
- Switching between `all_fields`, `block_layout`, and `custom_layout` detail modes
- Adding, removing, and reordering blocks in block layout mode
- Adding related blocks sourced from joined forms
- Selecting records in the preview and triggering the detail side panel
- Detail side panel rendering the correct tabs per `detailBlocks` configuration
- Row selection with multi-select and select-all, and selection toolbar display
- Report settings (name, description, view defaults) persisting within the session

**Primary vs joined data in preview and detail:**
- Primary source fields resolve directly from `PreviewRecord.fields[columnId]`
- Joined fields resolve from `PreviewRecord.fields[targetFormId__fieldId]`
- Join preview resolution is active for `flats_database` / `property_db` sources only
- For `employees_form`, `attendance_form`, `leave_form`: joins are stored in config but preview records are not join-resolved; all field values come from the static inline record set

---

## Known Constraints and Planned Simplifications

- **Preview records are static.** All preview data is hardcoded inline or backed by static JSON files. There is no live datasource query. Changing filters, sort, or group settings re-processes the same fixed record set.
- **Join resolution is source-scoped.** The `createJoinedDatasourcePreviewRecords()` path is only triggered for `flats_database` and `property_db` sources. Join configuration on other sources (employees, attendance, leave) is stored but does not affect the preview output.
- **Filter presets are display-only.** `ReportBuilderFilterPreset` items are toggleable in the UI but are not wired into the `filterPreviewRecords()` logic. They do not produce filter rules.
- **Report state is session-only.** All configuration changes, new reports, and deletions are lost on page reload. Only source form seeds are persisted via `BrowserStorageService`.
- **Publish is a local status mutation.** `publishReport()` changes `status` from `draft` to `live` in the in-memory signal. No publish workflow, validation, or backend call occurs.
- **Custom layout canvas mode has no drag resize guards.** Element positions and dimensions in `canvasLayout.elements` are stored as raw numbers with no boundary enforcement at the data layer.
- **Detail `custom_layout` mode does not have an implemented rendering surface.** The mode can be selected and layouts can be created via `ReportDetailCreateLayoutModalComponent`, but the preview panel does not render custom detail layout templates.
- **`chart` and `pivot` report types are not rendered.** These can be selected in the wizard and are stored in `reportType`, but the center preview and full preview modal only implement list and card rendering. Chart and pivot views display placeholder content.
- **Comparison logic treats all values as strings.** `PreviewRecord.fields` is `Record<string, string>`. All filter and sort operations cast to string or parse numeric/date values heuristically. There is no typed field evaluation.
- **`shortCode` generation is deterministic from the report name.** Two reports with identical names will produce the same short code. No deduplication is applied.
- **`BrowserStorageService` dependency for source options.** If `localStorage` is unavailable (SSR, private mode restrictions), `loadSourceOptions()` falls back to seed forms only and suppresses the read error.

---

## Future Extension and Backend Readiness

The facade's `updateSelectedReport()` mutator pattern and signal-based state model are designed to be replaced at specific seams without affecting component consumers:

**Report CRUD API integration:**
- Replace the in-memory `reportsState` signal initialisation with an API fetch in a `lifespan` effect or `toSignal()` observable
- `createReport()`, `duplicateReport()`, `deleteReport()`, `publishReport()` should issue API calls and update local state optimistically or on confirmation

**Datasource and source form discovery:**
- `loadSourceOptions()` should query a forms/datasource API rather than reading from `BrowserStorageService`
- The `ReportBuilderSourceOption` shape is compatible with a backend-provided form metadata response

**Remote query execution:**
- `buildPreviewRecords()` should be replaced with an API call that accepts the current `ReportBuilderAsset` config (filters, joins, sort, group) and returns a `PreviewRecord[]` response
- The local `filterPreviewRecords()` and `applyGroupingAndSorting()` can remain as client-side augmentation (e.g. for quick re-sorts without re-fetching) or be deprecated entirely

**Join resolution:**
- `applyJoinsToRows()` and `prefixJoinedRow()` should be replaced by backend-resolved joined record sets returned as part of the preview query response
- The `targetFormId__fieldId` namespacing convention must be maintained in the API response for compatibility with column ids, detail block `fieldIds`, and UI rendering

**Publish workflow:**
- `publishReport()` should trigger a backend publish endpoint with validation (e.g. ensuring source form exists, at least one visible column, valid joins)
- Status should reflect the server response rather than a local mutation

**Persistence:**
- Any state mutated through `updateSelectedReport()` can be debounce-synced to a report patch API
- `BrowserStorageService` usage for source forms can be removed once an API-backed form discovery endpoint exists

---

## QA and Validation Checklist \(Planned\)

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
- [ ] Previously configured custom layout slots are preserved (not reset) on source switch

### Column Management
- [ ] Toggling a column's visibility reflects immediately in center preview
- [ ] Reordering columns persists the new order in the column array
- [ ] Joined columns appear below primary columns with `source: 'joined'`
- [ ] Joined column id follows `targetFormId__fieldId` format

### Joins
- [ ] Adding a join appends the target form's columns to the report column array
- [ ] Removing a join removes the associated joined columns
- [ ] Inner join: preview excludes primary rows with no match in target
- [ ] Left join: preview includes all primary rows; joined fields empty where no match
- [ ] Right join: preview includes all target rows; primary-only rows excluded
- [ ] Lookup join: each primary row receives only the first matching target row's fields
- [ ] Join resolution only runs for `flats_database` and `property_db` sources

### Filter Rules
- [ ] Rule with no columnId or no operator does not affect preview output
- [ ] Value-independent operators (`isEmpty`, `isNotEmpty`, `isChecked`, `isUnchecked`) activate without a value
- [ ] `between` operator uses `{ start, end }` value shape and handles date and numeric ranges
- [ ] All 15+ operators produce correct record inclusion/exclusion
- [ ] Multiple rules are ANDed: record must match all active rules
- [ ] Clearing source form clears filter rules

### Sorting and Grouping
- [ ] Sort by date column uses date comparison, not string comparison
- [ ] Sort by numeric column uses numeric comparison
- [ ] Group order `asc`/`desc` orders group headers alphabetically or by date
- [ ] Within each group, rows are sorted by `sortBy`/`sortOrder`
- [ ] Setting `groupBy` to empty removes grouping and uses flat sort
- [ ] `groupLabel` on each record reflects the group key value

### Quick View Configuration
- [ ] Switching to list mode shows tabular column rendering
- [ ] Switching to card mode uses `cardPrimaryFieldId` and `cardSecondaryFieldId`
- [ ] Custom template mode slot assignment maps column values correctly in preview
- [ ] Canvas mode element positions are preserved on save
- [ ] Duplicating a report deep-copies custom layout (changes to copy do not affect original)

### Detail View and Blocks
- [ ] `all_fields` mode renders all visible columns in the detail panel
- [ ] `block_layout` mode renders one tab per `detailBlock` entry
- [ ] Block tab label is the block's `title`
- [ ] Fields within a block tab resolve from `PreviewRecord.fields` by `fieldId`
- [ ] Related block fields resolve using `targetFormId__fieldId` namespaced keys
- [ ] Removing a field from a block removes it from the detail panel tab
- [ ] Source switch resets to single primary block and removes any related blocks

### Actions
- [ ] Disabled action items do not appear in the relevant context (toolbar / context menu)
- [ ] `Multiple Selection` group actions appear only when multiple rows are selected
- [ ] `Right-Click Record` group maps to context menu actions

### Preview
- [ ] Preview export to PDF downloads the current report view
- [ ] Preview export to XLSX downloads tabular data with expected columns
- [ ] Preview export to CSV downloads tabular data with expected columns`r`n- [ ] Preview page size change updates visible record count
- [ ] Clicking a record opens the detail side panel
- [ ] Detail panel tabs match `settings.detailBlocks` length and titles
- [ ] Row checkbox selection updates `previewSelection` signal
- [ ] Selecting all rows selects all indices in the current page
- [ ] Clearing selection resets `previewSelection` to empty
- [ ] Switching reports clears `previewSelection`

### Duplicate and Delete
- [ ] Duplicate creates a copy in draft status with `(Copy)` suffix
- [ ] Duplicate does not share mutable references with the original (joins, columns, filter rules, action groups, custom layout)
- [ ] Deleting the selected report selects the next available report
- [ ] Deleting the last report results in an empty selection

---

## Glossary

**Report asset** — the full data structure representing a single report in the builder, including source metadata, columns, joins, filters, actions, and the complete settings payload. Stored as `ReportBuilderAsset`.

**Source form** — a form registered in the builder's datasource layer that serves as the primary data source for a report. Exposed as a `ReportBuilderSourceOption` with column definitions.

**Column (`ReportBuilderColumn`)** — a data field exposed by a source or joined form. Carries display metadata (label, format, width, alignment) and capability flags (sortable, filterable). Has a `source` property of `primary` or `joined`.

**Join (`ReportJoin`)** — a configuration linking a primary source form to a secondary (target) form via a matching field pair. Supports `inner`, `left`, `right`, and `lookup` semantics.

**Joined column id** — a column id in the format `{targetFormId}__{fieldId}` that identifies a field originating from a joined form. Used consistently in the column array, preview records, and detail block field references.

**Filter rule (`ReportBuilderFilterRule`)** — a single condition applied during preview record generation, consisting of a `columnId`, an `operator`, and a `value`. Multiple rules are ANDed together.

**Filter preset (`ReportBuilderFilterPreset`)** — a named, toggleable preset label (e.g. "Active Only") stored per report. Display-only in the current implementation; not wired to the filter rule engine.

**Quick View** — the mode and configuration controlling how records appear in the center preview panel. Three modes: `list`, `card`, `custom`.

**Quick View custom layout (`ReportQuickViewCustomLayout`)** — a complete card rendering specification stored in `report.settings.quickViewCustomLayout`. Contains slot mapping, slot and card-level styles, and an optional canvas layout with positioned elements.

**Detail View** — the right-side panel shown when a record is clicked in preview. Renders fields from the selected record in `all_fields`, `block_layout`, or `custom_layout` mode.

**Detail block** — a named grouping of field ids associated with a specific source form, used in `block_layout` detail mode. Each block becomes a tab in the detail side panel.

**Related block** — a detail block whose `sourceFormId` references a non-primary (joined) form. Fields in a related block use the `targetFormId__fieldId` naming convention.

**Preview record (`PreviewRecord`)** — a single record in the report preview output. Contains `id`, `groupLabel` (the value used as the group header when grouping is active), and `fields` (a flat `Record<string, string>` map of all primary and joined field values keyed by column id).

**Action group (`ReportActionGroup`)** — a named set of action items configuring the toolbar or context menu behavior for a specific selection context (single record, right-click, multiple selection, detail view).

**Seeded report** — a report pre-loaded into the report collection at service initialisation, used to provide a realistic starting state. Seeded reports are not persisted and reset on page reload.

**Session state** — all report-builder configuration exists only in in-memory Angular signals for the duration of the browser session. Changes are lost on page refresh.

**`BrowserStorageService`** — a wrapper around `localStorage` providing SSR-safe read/write operations. Used by the report builder exclusively to persist source form seed definitions across sessions.



