# Page Builder Data Binding Guide

## Overview

The Page Builder now uses a binding-first model.

Instead of configuring value output with separate `Datasource`, `Query / Table`, and `Field` dropdowns, the widget reads one binding expression and resolves it at runtime.

This gives us:

- a cleaner UI
- one consistent way to bind values
- support for static text, datasource values, widget values, page values, filters, and formulas
- a foundation that can be reused across panel, label, chart, text block, and future widgets

## Core Idea

The main `Binding` field accepts either:

1. plain text
2. a dynamic expression wrapped in `{{ ... }}`

### Plain text

If you type normal text without curly braces, the value is shown exactly as written.

Example:

```text
Active Users
```

Result:

```text
Active Users
```

### Dynamic expression

If you wrap the value in `{{ ... }}`, the builder resolves it from runtime data.

Example:

```text
{{page.currentUser.name}}
```

Result:

```text
John Doe
```

## Expression Structure

Every dynamic expression follows this pattern:

```text
{{ some.runtime.path.or.formula }}
```

The resolved value can come from:

- page state
- widget state
- datasource query data
- formula functions
- filtered query results

## Datasource Binding

Datasource bindings are written as paths.

General shape:

```text
{{datasources.<datasourceId>.queries.<queryId>.data[<index>].<fieldName>}}
```

### Meaning of each part

`datasources`

- the runtime datasource collection

`<datasourceId>`

- the datasource identifier
- example: `builder_runtime_demo`

`queries`

- the set of query results available for that datasource

`<queryId>`

- the query or table identifier
- example: `asset_inventory_table`

`data`

- the row collection returned from that query

`[<index>]`

- the row number to read
- `[0]` means the first row

`<fieldName>`

- the field you want from that row
- example: `occupancy_pct`

### Datasource example

```text
{{datasources.builder_runtime_demo.queries.asset_inventory_table.data[0].occupancy_pct}}
```

This means:

- use datasource `builder_runtime_demo`
- open query `asset_inventory_table`
- take the first row
- read the `occupancy_pct` field

If the first row contains:

```json
{
  "occupancy_pct": 91
}
```

Then the result is:

```text
91
```

## Query-Level Binding

Sometimes you want to work with the full query result instead of one field.

Example:

```text
{{datasources.builder_runtime_demo.queries.asset_inventory_table.data}}
```

This returns the whole row array and is usually used inside formulas like `count`, `sum`, or `average`.

## Widget Binding

Widget bindings let one widget read data from another widget.

Example:

```text
{{widgets.table_1.selectedRow.city}}
```

Meaning:

- read widget `table_1`
- use its current `selectedRow`
- return the `city` field

This is useful when:

- a panel should react to a selected table row
- a label should mirror the selected item
- a detail view should update based on another widget

## Page Binding

Page bindings use shared page or global runtime values.

Example:

```text
{{page.currentUser.name}}
```

Meaning:

- read the current page/global runtime object
- return `currentUser.name`

Useful for:

- current user info
- organisation info
- page state
- environment-style runtime values

## Supported Formula Functions

The binding layer supports formulas inside `{{ ... }}`.

### `count`

Counts rows or values.

```text
{{count(datasources.builder_runtime_demo.queries.asset_inventory_table.data)}}
```

Result example:

```text
4
```

### `sum`

Adds a numeric field across rows.

```text
{{sum(datasources.builder_runtime_demo.queries.asset_inventory_table.data, "revenue_lakhs")}}
```

### `average`

Returns the average of a numeric field.

```text
{{average(datasources.builder_runtime_demo.queries.asset_inventory_table.data, "occupancy_pct")}}
```

Result example:

```text
87.75
```

### `min`

Returns the lowest numeric value.

```text
{{min(datasources.builder_runtime_demo.queries.asset_inventory_table.data, "occupancy_pct")}}
```

### `max`

Returns the highest numeric value.

```text
{{max(datasources.builder_runtime_demo.queries.asset_inventory_table.data, "occupancy_pct")}}
```

### `median`

Returns the median numeric value.

```text
{{median(datasources.builder_runtime_demo.queries.asset_inventory_table.data, "occupancy_pct")}}
```

### `distinct_count`

Counts unique values in a field.

```text
{{distinct_count(datasources.builder_runtime_demo.queries.asset_inventory_table.data, "city")}}
```

## Filter Function

Use `filter(...)` when you want to narrow rows before a formula runs.

General pattern:

```text
{{count(filter(datasources.some_ds.queries.some_query.data, "field operator value"))}}
```

### Example 1

```text
{{count(filter(datasources.builder_runtime_demo.queries.asset_inventory_table.data, "city equals Mumbai"))}}
```

Meaning:

- load all rows
- keep only rows where `city == Mumbai`
- count the remaining rows

### Example 2

```text
{{average(filter(datasources.builder_runtime_demo.queries.asset_inventory_table.data, "occupancy_pct greaterThan 80"), "occupancy_pct")}}
```

Meaning:

- load all rows
- keep only rows where `occupancy_pct > 80`
- average the remaining `occupancy_pct` values

## Supported Filter Operators

Filter strings support:

- `equals`
- `notEquals`
- `contains`
- `startsWith`
- `endsWith`
- `greaterThan`
- `lessThan`

Filter comparison format:

```text
"field operator value"
```

Example:

```text
"city equals Mumbai"
```

## Fallback

Use `Fallback` when the binding might return nothing.

Example:

- Binding:

```text
{{page.currentUser.department}}
```

- Fallback:

```text
No department assigned
```

If the resolved value is empty, `Fallback` is shown.

## Format

Use `Format` for a light output hint after a value resolves.

Examples:

- `%`
- `Lakhs`
- `currency`

### Example with percent

- Binding:

```text
{{average(datasources.builder_runtime_demo.queries.asset_inventory_table.data, "occupancy_pct")}}
```

- Format:

```text
%
```

Displayed result:

```text
87.75 %
```

### Example with currency

- Binding:

```text
{{sum(datasources.builder_runtime_demo.queries.asset_inventory_table.data, "revenue_lakhs")}}
```

- Format:

```text
currency
```

Displayed result:

- numeric value formatted as INR currency

## Recommended Patterns

### Static label

```text
New Employees
```

### First row field

```text
{{datasources.builder_runtime_demo.queries.asset_inventory_table.data[0].occupancy_pct}}
```

### Count all rows

```text
{{count(datasources.builder_runtime_demo.queries.asset_inventory_table.data)}}
```

### Average a field

```text
{{average(datasources.builder_runtime_demo.queries.asset_inventory_table.data, "occupancy_pct")}}
```

### Distinct cities

```text
{{distinct_count(datasources.builder_runtime_demo.queries.asset_inventory_table.data, "city")}}
```

### Table-selected value

```text
{{widgets.table_1.selectedRow.city}}
```

### Current user

```text
{{page.currentUser.name}}
```

### Filtered count

```text
{{count(filter(datasources.builder_runtime_demo.queries.asset_inventory_table.data, "city equals Mumbai"))}}
```

## Good Usage Notes

- Use plain text for fixed labels.
- Use `{{ ... }}` only when the value must resolve dynamically.
- Prefer one readable expression over many manual config controls.
- Use formulas when you want summaries, totals, averages, or KPI-style output.
- Use `Fallback` for safety when the runtime value may be missing.
- Use `Format` only for output presentation, not for logic.

## Important Note About Query Paths

Yes, datasource query paths like these are expected to work:

```text
{{datasources.builder_runtime_demo.queries.asset_inventory_table.data[0].occupancy_pct}}
```

And formulas built on top of those query paths should also work:

```text
{{count(datasources.builder_runtime_demo.queries.asset_inventory_table.data)}}
```

```text
{{average(datasources.builder_runtime_demo.queries.asset_inventory_table.data, "occupancy_pct")}}
```

```text
{{count(filter(datasources.builder_runtime_demo.queries.asset_inventory_table.data, "city equals Mumbai"))}}
```

So the datasource/query information still exists in the runtime model, but it is now expressed through one binding syntax instead of multiple dropdown fields.
