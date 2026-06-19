# Panel Widget Frontend Guide

This document explains how the Page Builder Panel widget works in the frontend today and how to connect each supported source type using sample data.

## What the Panel widget is

The Panel widget is a KPI / stat / summary card. It can display:

- Static text
- A datasource field from the first matching record
- An aggregated datasource value
- A KPI percentage based on matched rows
- A page variable
- A bound value from another widget
- A preset template that pre-fills a panel configuration

The widget is rendered by:

- `apps/builder/src/app/features/page-builder/components/widget-showcase/panel/ui-panel/ui-panel-widget.component.ts`

The value-resolution logic lives in:

- `apps/builder/src/app/features/page-builder/components/widget-showcase/panel/panel-widget-resolution.util.ts`

The settings UI lives in:

- `apps/builder/src/app/features/page-builder/components/panel-config/panel/panel-settings-panel.component.ts`
- `apps/builder/src/app/features/page-builder/components/panel-config/panel/panel-settings-panel.component.html`

## Frontend-only runtime model

The Panel is fully frontend-driven for the current scope. It does not wait for backend execution.

It resolves values from:

- Mock datasources in `page-builder-mock-datasource.service.ts`
- Runtime datasource state in `page-builder-runtime-state.service.ts`
- Runtime widget state in `page-builder-runtime-state.service.ts`
- Binding expressions resolved by `page-builder-expression-resolver.service.ts`

That means the panel can be tested end-to-end right now in the builder using sample data.

## Sample datasources available now

The built-in sample datasources include:

- `builder_runtime_demo`
- `property`
- `flats`
- `real_estate_hub`

Useful sample queries / tables include:

- `asset_inventory_table`
- `chart_execution_query`
- `table_execution_query`
- `image_execution_query`
- `all_properties`
- `available_properties`
- `all_flats`
- `vacant_flats`
- `properties_table`
- `flats_table`

Good sample fields from `asset_inventory_table`:

- `display_name`
- `city`
- `status`
- `units_sold`
- `revenue_lakhs`
- `occupancy_pct`

## Sample page variables available now

The frontend runtime seeds these sample page values:

- `page.currentUser.name`
- `page.currentUser.email`
- `page.pageTitle`
- `page.selectedCity`
- `page.selectedDepartment`
- `page.selectedQuarter`
- `page.portfolioStats.totalAssets`
- `page.portfolioStats.activeAssets`
- `page.portfolioStats.averageOccupancy`
- `page.portfolioStats.averageRevenueLakhs`
- `page.filters.city`
- `page.filters.status`

## Sample widget bindings available now

The frontend runtime also seeds sample widget values so widget-binding mode is demoable even before a full page is wired up.

Examples:

- `widgets.SalesSummaryPanel.value`
- `widgets.SalesSummaryPanel.rawValue`
- `widgets.SalesSummaryPanel.title`
- `widgets.AssetTable.selectedRow.display_name`
- `widgets.AssetTable.selectedRow.city`
- `widgets.AssetTable.selectedRow.occupancy_pct`
- `widgets.OccupancyChart.value`

Also, real Panel widgets publish their own resolved state back into runtime widget state, so another widget can bind to them by widget id or label.

## How each source type works

### 1. Static Text

Use this when the panel should show a fixed value.

Settings flow:

1. Set `Display type` to `Static Text`
2. Enter the value in `Static value`

Example:

- Source type: `text`
- Static value: `80%`

Result:

- The card shows exactly that value

### 2. Datasource Field

Use this when the panel should show a direct field value from the first matching row.

Settings flow:

1. Set `Display type` to `Datasource Field`
2. Choose a `Datasource`
3. Choose a `Query / Table`
4. Choose a `Field`
5. Optionally rely on filters already configured in the panel config

Example:

- Datasource: `builder_runtime_demo`
- Query / Table: `asset_inventory_table`
- Field: `display_name`

How it resolves:

- The panel loads rows from the selected query
- It applies configured filters
- It takes the first filtered row
- It reads the selected field from that row

Important behavior:

- This mode is not a list view
- It does not show multiple rows
- It previews the first matching record only

### 3. Aggregate Value

Use this when the panel should calculate a numeric or count-style KPI from a datasource.

Supported aggregations:

- `sum`
- `min`
- `max`
- `average`
- `median`
- `count`
- `distinct_count`

Settings flow:

1. Set `Display type` to `Aggregate Value`
2. Choose a `Datasource`
3. Choose a `Query / Table`
4. Choose an `Aggregation`
5. Choose a `Field` when needed

Example:

- Datasource: `builder_runtime_demo`
- Query / Table: `asset_inventory_table`
- Aggregation: `average`
- Field: `revenue_lakhs`
- Suffix: ` Lakhs`

How it resolves:

- The panel loads the query rows
- It applies filters
- It aggregates the filtered rows

Notes:

- `count` does not require a field
- `sum`, `min`, `max`, `average`, and `median` require numeric fields
- `distinct_count` counts distinct non-empty values in the chosen field

### 4. KPI Percentage

Use this when the panel should calculate the percentage of rows that match a KPI condition.

Settings flow:

1. Set `Display type` to `KPI Percentage`
2. Choose a `Datasource`
3. Choose a `Query / Table`
4. Configure `Base filters`
5. Configure the `KPI condition`

Example:

- Datasource: `builder_runtime_demo`
- Query / Table: `asset_inventory_table`
- Base filters: `category equals Commercial`
- KPI condition: `status equals Available`

How it resolves:

- The panel loads all rows from the query
- It applies the base filters first
- It then applies the KPI condition on the filtered rows
- Final value is:

`(matched rows / filtered rows) * 100`

Important note:

- This is row-match percentage logic
- It is not yet a custom numerator / denominator formula builder

### 5. Page Variable

Use this when the panel should display a frontend runtime value from the page context.

Settings flow:

1. Set `Display type` to `Page Variable`
2. Choose a page variable from the dropdown

Example:

- Binding: `page.selectedCity`

Result:

- The panel shows `Bengaluru`

Another example:

- Binding: `page.portfolioStats.averageOccupancy`
- Suffix: `%`

Result:

- The panel shows the sample average occupancy value

### 6. Widget Binding

Use this when the panel should display a value published by another widget.

Settings flow:

1. Set `Display type` to `Widget Binding`
2. Choose a widget value from the dropdown
3. Optionally use `Advanced binding` for a deeper path

Example bindings:

- `widgets.SalesSummaryPanel.value`
- `widgets.AssetTable.selectedRow.city`
- `widgets.AssetTable.selectedRow.occupancy_pct`

How it works:

- Widgets write their runtime state into the shared widget registry
- The Panel resolves the selected binding expression from that registry

### 7. Preset Template

Use this when you want a ready-made KPI card and then tweak it.

Available presets:

- `Revenue KPI Card`
- `Occupancy Percentage Card`
- `Asset Summary Card`

How presets behave:

- Selecting a preset fills sensible defaults
- The resulting card remains editable
- You can still change datasource, query, field, colors, copy, and layout

Preset examples:

- `Revenue KPI Card` uses average `revenue_lakhs`
- `Occupancy Percentage Card` uses average `occupancy_pct`
- `Asset Summary Card` shows a direct field value from the first row

## Preview behavior

The settings panel preview is driven by the same resolver used by the widget renderer.

Preview states:

- `ready`
- `empty`
- `unconfigured`
- `invalid`
- `no_data`

Examples:

- Missing datasource: `Choose a datasource to continue`
- Missing query: `Choose a query or table to continue`
- Missing field: `Choose a field to display`
- Invalid field: `The selected field is not available in this query result`
- No rows: `No rows are available for the selected query`

## Visual customization supported

The Panel keeps its card-style customization while changing value sources.

Supported visual options:

- Title
- Subtitle
- Caption
- Trend
- Suffix
- Icon
- Icon placement
- Alignment
- Value color
- Title color
- Icon colors
- Background color
- Border color
- Border radius
- Layout variant

## Practical examples

### Example A: Revenue KPI

- Display type: `Aggregate Value`
- Datasource: `builder_runtime_demo`
- Query / Table: `asset_inventory_table`
- Aggregation: `average`
- Field: `revenue_lakhs`
- Suffix: ` Lakhs`
- Title: `Revenue Overview`

### Example B: Occupancy Percentage by condition

- Display type: `KPI Percentage`
- Datasource: `builder_runtime_demo`
- Query / Table: `asset_inventory_table`
- Base filters: `department equals Sales`
- KPI condition: `status equals Available`
- Suffix: `%`

### Example C: Show selected city from page state

- Display type: `Page Variable`
- Page variable: `page.selectedCity`
- Title: `Selected City`

### Example D: Show selected row city from another widget

- Display type: `Widget Binding`
- Widget value: `widgets.AssetTable.selectedRow.city`
- Title: `Focused Asset City`

## Current frontend scope vs backend-later

Working now in frontend:

- Static values
- Datasource field values
- Aggregations
- KPI percentage by row match
- Page-variable bindings
- Widget bindings
- Preset-based cards
- Preview and fallback states

Still backend-later:

- Real server-side datasource execution
- Backend query refresh / async execution
- Advanced formula-based KPI builders
- Custom numerator / denominator formulas
- Full relational / joined runtime behavior beyond the provided sample query data

## Summary

Today the Panel widget is fully usable in the frontend as a Zoho-style KPI card as long as you treat datasource execution as mock/runtime-backed. The sample datasources, page variables, and widget bindings are enough to demonstrate every supported panel mode without backend integration.
