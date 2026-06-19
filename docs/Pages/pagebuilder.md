# Page Builder Guide

## 1. Introduction

Page Builder is a visual workspace used to assemble a page by placing reusable widgets on a layout canvas and configuring them through guided panels.

It brings together:

- page structure
- content blocks
- interactive controls
- media elements
- data-driven widgets
- responsive preview behavior

The overall working style is visual. Instead of building the page directly in code, the page is composed by selecting a widget, placing it on the canvas, and adjusting its content, appearance, and behavior from the configuration area.

## 2. Purpose of Page Builder

The purpose of Page Builder is to organize page creation, page arrangement, and widget-level configuration inside one workspace.

It supports:

- creating a page from scratch
- arranging the layout visually
- placing widgets in meaningful page sections
- configuring each widget from a dedicated settings panel
- combining content, actions, media, and data display elements in one page
- reviewing the page in different viewport sizes

This makes the page-building process easier to follow because layout, content, and configuration are handled in a connected flow rather than across separate screens.

## 3. Main Screens

The page builder is organized into two main screens:

1. Page list and preview screen
2. Page editing screen

### 3.1 Page List and Preview Screen

This screen covers:

- page selection
- page creation
- page preview canvas
- viewport switching
- navigation into edit mode

This screen works as the entry point to the page builder. It is used to review available pages, choose which page to open, and quickly inspect the page layout before entering the editing area.

### 3.2 Page Editing Screen

This screen covers:

- widget selection
- widget placement
- widget arrangement
- widget configuration
- page layout building

This is the main working area of the page builder. The editing screen is where the structure of the page takes shape and where widget-level changes are made.

## 4. Page List and Preview Screen Layout

### 4.1 Left Sidebar

The left sidebar contains page-level actions and page navigation.

This area includes:

- page list
- page search
- create page action
- duplicate page action
- delete page action
- page selection
- active inactive toggle 

This section is useful for managing multiple pages in one place. It keeps the page selection flow separate from the widget editing flow.

### 4.2 Top Section

The top section contains:

- page builder title
- selected page name
- descriptive summary text
- edit action
- viewport selector
- save and publish action

The viewport selector contains:

- Desktop
- Tablet
- Mobile

The top section acts as the main control strip for page-level actions. It is used when changing the viewport, opening edit mode, or completing page-level actions such as saving and publishing.

The selected viewport is shared across page builder behavior. When the viewport is changed, the canvas and the preview use the same device mode.

### 4.3 Center Section

The center section acts as the preview area.

This area contains:

- preview canvas
- page layout preview
- placed widgets

When the page is empty, this section carries the empty state for starting the page design. Once widgets are added, the same section becomes the primary surface for reviewing the page composition.

### 4.4 Preview and Page Status

- saved pages stay in `inactive` until they are published
- only `active` pages are available in published preview mode
- inactive pages can still be reviewed inside the builder
- when a page is published, its status changes from `inactive` to `active`

## 5. Page Editing Screen Layout

### 5.1 Left Primary Sidebar

The first left sidebar contains widget families.

This area is used to decide the broad category of component to add to the page.

The widget families are:

1. Chart
2. Search
3. Form
4. Report
5. Table
6. Snippets
7. Button
8. Label
9. Text Block
10. Board
11. Select
12. Media

This sidebar acts as the first level of navigation inside the editor. It narrows the selection from a high-level family before moving to the exact widget type.

### 5.2 Left Secondary Sidebar

The second left sidebar changes based on the selected widget family.

This area contains:

- widget variants
- draggable previews
- family-specific options
- source selection where needed

Examples of content shown in this sidebar:

- chart type picker
- search styles
- button presets
- label preview card
- form placement styles
- report placement styles
- select variants
- text block presets
- media presets

This area helps refine the selection by showing the exact widget type or visual variant that can be added to the canvas. It acts as the bridge between category selection and actual placement.

### 5.3 Center Canvas

The center area is the design canvas.

This area handles:

- drag and drop
- widget placement
- movement
- resize
- selection
- page composition

Each placed widget carries:

- position
- size
- label
- widget-specific settings

The canvas is the core building region of the page builder. All page composition and visual arrangement happen here. It is the closest representation of how the page will appear when viewed in preview mode.

### 5.4 Floating Selection Toolbar

The floating selection toolbar appears when a widget is selected.

This toolbar contains quick actions such as:
- Selected element name
- duplicate
- delete

This toolbar is useful for short actions that do not require opening a full configuration flow.

### 5.5 Right Property Side bar 

The right property side bar opens while editing a selected widget.

This area contains:

- widget settings tabs
- label and content fields
- action settings
- style controls
- widget-specific configuration options

Depending on the selected widget, the tab names and settings change. Common tabs in this area include:

- Display
- Action
- Style
- Properties
- Filter

This area is the main control section for detailed widget editing. It is used after selecting a widget on the canvas and helps adjust how that particular widget looks, behaves, and works on the page.

## 7. Page Building Flow

The page-building flow follows these steps:

1. Create a new page.
2. Enter page name and page description.
3. Select the page from the page list.
4. Open the editor.
5. Choose a widget family from the first left sidebar.
6. Choose a widget variant from the second left sidebar.
7. Drag the widget onto the canvas.
8. Move and resize the widget as required.
9. Open the right property sidebar.
10. Configure content, style, actions, and other widget settings.
11. Apply the widget configuration.
12. Save the page and view in preview mode.
13. Review the page in desktop, tablet, and mobile preview.

In short a page is built by placing a few widgets first, arranging the layout, and then revisiting each widget for detailed configuration.



## 8. Widgets

## 8.1 Chart Widget

The chart widget is used for visual representation of grouped, compared, or summarized data.

### Left Sidebar

The chart type picker is grouped as:

- Line chart: `line`
- Scatter chart: `scatter`
- Area chart: `area`, `stacked-area`
- Web chart: `web`
- Column chart: `column`, `stacked-column`, `stacked-pct-column`
- Bar chart: `bar`, `stacked-bar`

### Right Property Panel

Tabs:

- Display
- Style

Display:

- datasource: Selects the datasource used by the chart.
- query / binding: Accepts the datasource query binding or inline JSON data.
- x-axis category: Selects the field used for grouping on the X-axis.
- x-axis label: Sets the X-axis label.
- aggregation: Selects the calculation type such as `SUM`, `AVG`, `MIN`, `MAX`, `COUNT`, or `COUNT DISTINCT`.
- y-axis field: Selects the value field used for the Y-axis.
- y-axis label: Sets the Y-axis label.
- interval: Sets the interval value when grouping or spacing is needed.

Style:

- series color: Sets the main chart series color.
- comparison color: Sets the secondary or comparison series color.

### Datasource Binding

- datasource binding is widget-level
- first select the datasource
- then bind the chart query in `Query / Binding`
- binding format is usually `{{datasources.<datasourceId>.queries.<queryId>}}`
- inline JSON can also be used in the same field
- X-axis and Y-axis field options are built from the bound query result or JSON rows

### Working Notes

The chart setup starts with chart type selection, then datasource binding, and then axis mapping. The canvas uses the selected chart type, while the property panel controls the current binding, labels, aggregation, and colors.

### Chart JSON Example

```jsonc
{
  "id": "widget-chart-001",
  "type": "chart-showcase",
  "label": "Revenue by Quarter",
  "x": 120,
  "y": 140,
  "width": 220,
  "height": 190,
  "chartType": "column",
  "chartTypeLabel": "Column",
  "widgetProps": {
    "chartConfig": {
      "datasourceId": "builder_runtime_demo",
      "datasourceLabel": "Builder Runtime Demo",
      "queryId": "chart_execution_query",
      "queryBinding": "{{datasources.builder_runtime_demo.queries.chart_execution_query}}",
      "xAxisCategory": "chart_group",
      "xAxisLabel": "Quarter",
      "yAxisField": "revenue_lakhs",
      "yAxisStackBy": "",
      "aggregateValue": {
        "tab": "sum",
        "value": "revenue_lakhs"
      },
      "yAxisLabel": "Revenue",
      "interval": "",
      "filterDataBasedOn": [], // optional filter values applied to the chart data
      "showDataLabel": false, // widget specific
      "showUnderlyingData": false, // widget specific
      "valueType": "aggregate", // widget specific
      "recordScope": "all", // widget specific
      "selectedRecordCriteriaRows": [], // used only when recordScope is based on selected records
      "chartColor": "var(--qo-color-primary-700)", // widget specific
      "chartColorSecondary": "var(--qo-color-neutral-500)" // widget specific
    }
  }
}
```

## 8.2 Table Widget

The table widget is mainly used for list-style record display with row-level actions and table controls.

### Left Sidebar

The left sidebar shows a single draggable table preview.

### Right Property Panel

- Display
- Style

Display:

- visible: This field decides whether the table should appear on the page or stay hidden.
- datasource: Selects the datasource used by the table.
- query / binding: Accepts the datasource query binding or inline JSON rows.
- columns: Shows the detected columns from the bound data.
- selected column: Lets the user rename a column and control its visibility.
- rows per page: This field controls how many rows are shown at one time before the user needs to move to another page of results.
- table size: This field controls how compact or spacious the table looks.
- show search: This field controls whether a search box is shown for quickly finding rows.
- show download: This field controls whether users are allowed to download the table data.
- show sorting: This field controls whether users can sort data by clicking column headers.
- show column filters: This field controls whether each column can have its own filter control.
- enable add: This field controls whether users can create a new record from the table area.
- enable edit: This field controls whether row edit actions are available.
- enable delete: This field controls whether row delete actions are available.
- enable duplicate: This field controls whether row duplicate actions are available.

Style:

- background color: This field controls the color behind the table content.
- border color: This field controls the outline color around the table box.
- border radius: This field controls how rounded or sharp the table corners appear.

### Datasource Binding

- datasource binding is widget-level
- first select the datasource
- then bind the query in `Query / Binding`
- binding format is usually `{{datasources.<datasourceId>.queries.<queryId>}}`
- inline JSON rows can also be used
- columns are generated from the resolved rows and can then be renamed or hidden

### Working Notes

This widget is useful when the page needs a simple data table without the broader report-specific structure.

### Table JSON Example

```jsonc
{
  "id": "widget-table-001",
  "type": "table-showcase",
  "label": "Asset Table",
  "x": 96,
  "y": 220,
  "width": 640,
  "height": 260,
  "widgetProps": {
    "tableConfig": {
      "visible": true,
      "rowsPerPage": 10,
      "tableSize": "default",
      "backgroundColor": "var(--qo-color-neutral-0)",
      "borderColor": "var(--qo-border-color)",
      "borderRadius": "12px",
      "showSearch": true,
      "showDownload": true,
      "showSorting": true,
      "showColumnFilters": true,
      "enableAdd": false,
      "enableEdit": false,
      "enableDelete": false,
      "enableDuplicate": false,
      "dataSourceKey": "builder_runtime_demo", // widget specific
      "queryId": "asset_inventory_table", // widget specific
      "queryBinding": "{{datasources.builder_runtime_demo.queries.asset_inventory_table}}" // widget specific
    }
  }
}
```

## 8.3 Button Widget

The button widget is mainly used for navigation, page actions, and trigger-based interactions.

### Left Sidebar

- standard button
- icon button
- button group

### Right Property Panel

- Display
- Action
- Style

Display:

Common:

- button type: Switches the button between `Standard`, `Icon`, and `Group`.
- datasource: Selects the datasource used for button binding.
- query / binding: Stores datasource binding or inline binding text.

Widget specific:

- label (`standard`): Sets the button text for a normal button.
- selected button (`group`): Lets the user select one button inside the group for editing.
- buttons (`group`): Lets the user add, remove, and rename group buttons.
- icon library (`icon`): Lets the user switch between icon categories.
- default icons (`icon`): Lets the user choose one built-in icon.
- upload icon image (`icon`): Lets the user upload an image to use as the icon.
- replace image (`icon`): Appears when an icon image is already attached.
- remove image (`icon`): Clears the uploaded icon image.
- icon size (`icon`): Controls the icon size.

Action:

Common:

- action type: This field decides what should happen when the button is clicked.
- open in: This field controls whether the destination should open in the current window or in a new one.

Widget specific:

- url (`open-url`): Appears when the action is `open-url`.
- form (`open-form`): Appears when the action is `open-form`.
- dataframe (`open-report`): Appears when the action is `open-report`.
- page (`open-page`): Appears when the action is `open-page`.
- function (`execute-function`): Appears when the action is `execute-function`.

For button groups, the Action tab applies to the currently selected button inside the group rather than the whole group at once.

Style:

Common:

- box type: Switches the button between rectangular and rounded styling.
- corner radius: This field controls how rounded or square the button corners appear.
- text color: This field controls the color of the button label.
- fill color: This field controls the main background color of the button.
- stroke color: This field controls the border color of the button.
- stroke width: This field controls how thick the button border should appear.
- padding top: This field adds inner space above the button text.
- padding right: This field adds inner space to the right of the button text.
- padding bottom: This field adds inner space below the button text.
- padding left: This field adds inner space to the left of the button text.
- margin top: This field adds outer space above the button so it does not sit too close to the element above it.
- margin right: This field adds outer space to the right of the button.
- margin bottom: This field adds outer space below the button.
- margin left: This field adds outer space to the left of the button.

Widget specific:

- bold (`standard`, `group`): Makes the button text bolder.
- italic (`standard`, `group`): Makes the button text italic.
- underline (`standard`, `group`): Adds underline to the button text.
- text case (`standard`, `group`): Controls normal, uppercase, or lowercase text.
- font family (`standard`, `group`): Controls the button font family.
- font size (`standard`, `group`): Controls the button font size.
- icon button style (`icon`): Uses the same shared box, color, stroke, padding, and margin settings, but the icon is the main visible content.

### Datasource Binding

- datasource binding is stored at button action level
- datasource and `Query / Binding` are available in the display panel
- the action itself is configured separately in the `Action` tab
- this is mainly used when button behavior needs runtime binding context

### Working Notes

The button widget supports three working patterns in one component: a normal text button, an icon-driven button, and a multi-button group. The Action tab changes behavior based on the selected mode, and for groups the chosen group button carries its own label, style, and action configuration.

### Button JSON Example

```jsonc
{
  "id": "widget-button-001",
  "type": "button-showcase",
  "label": "View Dashboard",
  "x": 420,
  "y": 72,
  "width": 220,
  "height": 64,
  "buttonVariant": "primary-filled", // widget specific
  "buttonStyleConfig": {
    "cornerRadius": 3,
    "bold": false,
    "italic": true,
    "underline": false,
    "textCase": "default",
    "fontFamily": "var(--qo-font-family-sans)",
    "fontSize": "14px",
    "color": "var(--qo-color-neutral-0)",
    "fillColor": "var(--qo-color-primary-700)",
    "strokeColor": "var(--qo-color-primary-700)",
    "strokeWidth": 0,
    "paddingTop": 12,
    "paddingRight": 15,
    "paddingBottom": 12,
    "paddingLeft": 15,
    "marginTop": 0,
    "marginRight": 0,
    "marginBottom": 0,
    "marginLeft": 0
  },
  "widgetProps": {
    "buttonActionConfig": {
      "type": "open-page", // widget specific
      "url": "",
      "openIn": "same-window",
      "formId": "",
      "reportId": "",
      "pageId": "executive-dashboard", // used for open-page
      "datasourceId": "builder_runtime_demo", // optional runtime binding context
      "queryBinding": "{{datasources.builder_runtime_demo.queries.asset_inventory_table}}", // optional runtime binding context
      "queryParams": "",
      "functionName": ""
    }
  }
}
```

## 8.4 Label Widget

The label widget is used for simple standalone text labels and display-only text content on the page canvas.

### Left Sidebar

The left sidebar shows a single draggable label preview.

### Right Property Panel

- Display
- Style

Display:

- label: Stores the widget label in the property panel header area.
- text box / binding: Stores the visible label content.
- source: Switches between `Static Text` and `Datasource`.
- datasource: Appears when the source is `Datasource`.
- overflow text: This field controls how extra text behaves when the label content exceeds the available space.
- visible: This field decides whether the label should appear on the page or stay hidden.
- disable links: This field decides whether links inside the label content should remain clickable.

Style:

- background color: This field controls the background behind the label content. It can remain transparent when no surface is needed.
- border color: This field controls the border color when a border is used.
- border width: This field controls the label border width.
- border radius: This field controls the label corner radius.
- font color: This field controls the main visible color of the label text.
- font family: This field controls which typeface is used for the label.
- font size: This field controls how large the label text appears.
- line height: This field controls the vertical spacing between lines of label text.
- letter spacing: This field controls the spacing between characters.
- bold / italic / underline / line-through: These fields control the text emphasis and decoration.
- text alignment: This field controls whether the label text should align left, center, or right.

### Datasource Binding

- datasource binding is optional for labels
- when `Source` is set to `Datasource`, the text box accepts `{{ }}` bindings
- the label builds a datasource expression using datasource, query, record, and field
- this is useful for showing one bound text value on the page

### Working Notes

This widget is now a standalone widget family in the left primary sidebar. It can be used for static text or one datasource-driven text value.

### Label JSON Example

```jsonc
{
  "id": "widget-label-001",
  "type": "label-showcase",
  "label": "Label",
  "x": 180,
  "y": 90,
  "width": 180,
  "height": 48,
  "textBlockVariant": "labeltext", // widget specific
  "widgetProps": {
    "textBlockConfig": {
      "inputType": "labeltext", // widget specific
      "text": "{{datasources.builder_runtime_demo.queries.asset_inventory_table.data[0].display_name}}", // datasource expression used for the visible label
      "defaultValue": "Employee Summary",
      "contentSource": "datasource",
      "datasourceId": "builder_runtime_demo",
      "queryId": "asset_inventory_table", // widget specific
      "recordId": "1", // selected datasource record
      "field": "display_name", // selected field from the datasource record
      "overflowText": "none",
      "visible": true,
      "disableLinks": false,
      "backgroundColor": "transparent",
      "borderColor": "transparent",
      "borderWidth": "0",
      "borderRadius": "0",
      "labelColor": "var(--qo-color-neutral-900)"
    }
  }
}
```


## 8.5 Select Widget

The select widget is used for option picking, single selection, multi-selection, or radio-style choice input.

### Left Sidebar

- `select`
- `multiselect`
- `radio`

### Right Property Panel

- Content
- Style

Content:

Common:

- visible: Controls whether the widget appears on the page.
- field label: Defines the label shown for the select field.
- placeholder: Shows the empty-state helper text.
- variant: Switches between `select`, `multiselect`, and `radio`.
- datasource: Selects the datasource used by the select widget.
- query / binding: Accepts datasource binding or inline JSON.
- label field: Selects the field used as the visible option label.
- value field: Selects the field used as the saved option value.

Widget specific:

- default value (`select`, `radio`): Appears for non-multiselect variants.
- allow search (`select`, `multiselect`): Enables search for supported variants. It is disabled for `radio`.
- dropdown options (`select`, `multiselect`, `radio`): Appears when no binding is configured and allows static option management.

Style:

- background color: This field controls the background color of the selection control.
- text color: This field controls the color of the visible selected value and related text.
- border color: This field controls the outline color around the selection control.

### Datasource Binding

- datasource binding is widget-level
- first select the datasource
- then bind the query in `Query / Binding`
- binding format is usually `{{datasources.<datasourceId>.queries.<queryId>}}`
- inline JSON rows can also be used
- `label field` and `value field` are resolved from the bound rows
- if no binding is configured, the widget uses static options


### Working Notes

This widget is generally used where controlled option input is needed in a compact form.

### Select JSON Example

```jsonc
{
  "id": "widget-select-001",
  "type": "select-showcase",
  "label": "City Select",
  "x": 140,
  "y": 380,
  "width": 280,
  "height": 180,
  "widgetProps": {
    "selectConfig": {
      "label": "Select city",
      "variant": "select", // widget specific
      "visible": true,
      "placeholder": "Choose city",
      "backgroundColor": "transparent",
      "textColor": "var(--qo-color-neutral-900)",
      "borderColor": "var(--qo-border-color-strong)",
      "datasourceId": "builder_runtime_demo", // widget specific
      "queryId": "asset_inventory_table", // widget specific
      "queryBinding": "{{datasources.builder_runtime_demo.queries.asset_inventory_table}}", // widget specific
      "labelField": "asset_city", // field shown to the user
      "valueField": "asset_city", // field stored as the selected value
      "defaultValue": null, // widget specific
      "allowSearch": true, // widget specific
      "multiSelect": false, // widget specific
      "options": [] // kept empty when datasource binding is used
    }
  }
}
```

## 8.6 Media Widget

The media widget is used for placing image, video, or document-based content inside the page layout.

### Left Sidebar

- `image`
- `video`
- `pdf`

### Right Property Panel

- Content
- Style

Content:

Common:

- visible: This field decides whether the media widget should appear on the page.
- media type: This field decides whether the widget should display an image, a video, or a PDF document.
- source mode: Switches between `Static URL`, `Upload`, and `Datasource`.
- title: This field defines the main heading shown with the media so the user understands what the content is about.
- caption: This field adds supporting text that describes or explains the media content.
- source URL: This field stores the external web link used when the media should be loaded from a URL.
- datasource: Appears when `Source mode` is `Datasource`.
- query / binding: Accepts datasource binding or inline JSON when datasource mode is used.

Widget specific:

- autoplay (`video`): This field controls whether a video should start playing automatically when the widget loads.
- PDF default page (`pdf`): This field decides which page of the PDF should be shown first when the document opens.
- PDF toolbar visibility (`pdf`): This field controls whether PDF tools such as zoom, print, and navigation should be visible.
- PDF allow download (`pdf`): This field controls whether the displayed PDF can be downloaded by the user.
- PDF allow print (`pdf`): This field controls whether the displayed PDF can be printed by the user.
- PDF zoom level (`pdf`): This field controls how large the PDF appears when it first opens.
- PDF fit to width (`pdf`): This field controls whether the PDF should stretch to match the width of the available space.
- PDF disabled state (`pdf`): This field makes the PDF viewer inactive so the user cannot interact with it.
- PDF loading state (`pdf`): This field controls how the widget behaves while the PDF is still loading, such as showing a loading state or placeholder.

Style:

Common:

- background color: This field controls the background behind the media container.

### Datasource Binding

- datasource binding is widget-level
- binding is available when `Source mode` is `Datasource`
- binding format is usually `{{datasources.<datasourceId>.queries.<queryId>}}`
- inline JSON rows can also be used
- media field, title field, and caption field are inferred from the first resolved row in the current config flow


### Working Notes

This widget is used when the page needs direct visual or document content. The exact behavior changes depending on whether the selected type is image, video, or PDF.

### Media JSON Example

```jsonc
{
  "id": "widget-media-001",
  "type": "media-showcase",
  "label": "Property Image",
  "x": 420,
  "y": 180,
  "width": 360,
  "height": 248,
  "widgetProps": {
    "mediaConfig": {
      "visible": true,
      "mediaType": "image", // widget specific
      "sourceMode": "datasource", // widget specific
      "title": "Property Image",
      "caption": "Bound from datasource",
      "backgroundColor": "transparent",
      "sourceUrl": "",
      "datasourceId": "builder_runtime_demo", // widget specific
      "queryId": "asset_inventory_table", // widget specific
      "queryBinding": "{{datasources.builder_runtime_demo.queries.asset_inventory_table}}", // widget specific
      "recordId": "1", // selected datasource record
      "imageField": "image_url", // widget specific
      "titleField": "display_name", // widget specific
      "captionField": "asset_city" // widget specific
    }
  }
}
```

## 8.7 Panel Widget

The panel widget is used for KPI cards, summary cards, and highlighted value display.

### Left Sidebar

The left sidebar shows multiple draggable KPI panel presets with different layouts:

- `simple-value-top`
- `simple-value-bottom`
- `icon-center-value-top`
- `icon-center-value-bottom`
- `icon-left-value-top`
- `icon-left-value-bottom`
- `icon-right-value-top`
- `icon-right-value-bottom`
- `icon-inline-center-title-top`
- `icon-inline-center-title-bottom`
- `icon-inline-split-title-top`
- `icon-inline-split-title-bottom`

### Right Property Panel

Tabs:

- Display
- Style

Display:

- panel sections: Lets the user switch between `Card`, `Value`, `Icon`, and `Copy`.
- layout: Selects the panel layout variant.
- alignment: Controls left, center, or right alignment.
- icon placement: Controls whether the icon appears before or after the value.
- title / subtitle / caption / trend / suffix: Controls the visible copy in the panel.
- display type: Selects the value source type.
- static value: Appears for `Static Text`.
- datasource: Appears for datasource-driven panel modes.
- query / table: Selects the datasource query.
- field: Selects the field used for datasource-driven modes.
- aggregation: Appears for aggregate value mode.
- base filters: Appears for KPI percentage mode.
- KPI condition: Appears for KPI percentage mode.
- page variable: Appears for page variable mode.
- widget value / advanced binding: Appears for widget binding mode.
- preset: Appears for preset template mode.
- preview: Shows the resolved value preview.
- icon: Lets the user select the panel icon.

Style:

- card colors: Background, border, and radius.
- value style: Value color.
- icon style: Icon fill and glyph color.
- copy style: Copy color.

### Datasource Binding

- datasource binding is widget-level
- datasource-driven modes are `Datasource Field`, `Aggregate Value`, `KPI Percentage`, and `Preset Template`
- panel binding can also come from `Page Variable` or `Widget Binding`
- the panel preview resolves the current binding and shows the current result

### Working Notes

This widget is mainly used for summary cards. It supports static values, datasource values, aggregate values, KPI calculations, page variables, widget bindings, and preset KPI layouts.

### Panel JSON Example


```jsonc
{
  "id": "widget-panel-001",
  "type": "panel-showcase",
  "label": "Revenue Overview",
  "x": 520,
  "y": 96,
  "width": 280,
  "height": 160,
  "widgetProps": {
    "panelConfig": {
      "visible": true,
      "title": "Revenue Overview",
      "value": "0",
      "subtitle": "Average revenue across assets",
      "caption": "Datasource-driven KPI",
      "trend": "Rolling average",
      "suffix": " Lakhs",
      "titleColor": "var(--qo-color-neutral-900)",
      "iconSymbol": "payments", // widget specific
      "iconBackgroundColor": "#e8f2ff", // widget specific
      "iconColor": "#1d4ed8", // widget specific
      "valueColor": "#1d4ed8", // widget specific
      "backgroundColor": "#ffffff",
      "borderColor": "var(--qo-border-color)",
      "borderRadius": "16px",
      "alignment": "right",
      "iconPlacement": "before", // widget specific
      "layoutVariant": "icon-left-value-top", // widget specific
      "sourceType": "aggregation", // widget specific
      "datasourceId": "builder_runtime_demo", // widget specific
      "queryId": "asset_inventory_table", // widget specific
      "field": "revenue_lakhs", // datasource field used for the value
      "aggregationType": "average", // widget specific
      "filters": [], // optional datasource filter rules for the panel value
      "condition": null, // used for KPI percentage mode when a match condition is needed
      "staticText": "80%", // used only for static text mode
      "bindingExpression": "", // used for page-variable or widget-binding mode
      "presetId": "" // used only when a preset template is selected
    }
  }
}
```
## 9. Page Storage and Page-Level JSON

The implementation stores page metadata and page widgets separately, but if the requirement is to capture the full page story from page creation until save, the JSON model should be understood in two parts.

### Implementation

The builder keeps separate storage for:

- page list metadata
- selected page id
- draft widgets for each page
- published widgets for each page

The main storage keys are:

- `qo.builder.page-builder.pages.v1`: stores the available pages
- `qo.builder.page-builder.selected-page.v1`: stores the currently selected page id
- `page-builder-draft-widgets:<pageId>`: stores the draft widget array for one specific page
- `page-builder-published-widgets:<pageId>`: stores the published widget array for one specific page

This means the widgets are currently stored page by page as arrays, and the owning `pageId` is attached through the storage key rather than repeated inside every widget object.

### Important Page-Level Notes

- datasource selection remains widget-level only where a widget needs one, such as chart, select, media, panel, report-linked behavior, or similar bindings
- viewport selection is shared between builder behavior and preview behavior, so when the viewport is changed the canvas and preview are aligned to the same device mode

### Detailed Structure Desired

If the JSON needs to capture who created the page, which page contains which widgets, the page-level shared properties, the application relationship, and the widget-specific properties in one detailed structure, then the page should be modeled as one full page document instead of only a raw widget array.

### Page Create JSON

When a new page is created, the initial page-creation JSON can contain authentication context, page identity, timestamps, and page settings metadata even before widgets are saved.

Example:

```json
{
  "jwtToken": {
    "accessToken": "<jwt-access-token>",
    "refreshToken": "<jwt-refresh-token>"
  },
  "applicationId": "UUID",
  "pageId": "UUID",
  "pageIndex": 2,
  "pageName": "HR Dashboard",
  "description": "Main employee dashboard",
  "status": "inactive",
  "createdBy": {
    "userId": "UUID",
    "userName": "Aman Verma",
    "role": "admin"
  },
  "createdAt": "2026-05-15T10:30:00.000Z",
  "lastModifiedAt": "2026-05-15T10:30:00.000Z",
  "pageSettings": {
    "pageId": "UUID",
    "pageIndex": 2,
    "viewport": "desktop",
    "background": "grid",
    "pageCopy": false
  }
}
```

This initial create JSON should capture:

- `jwtToken`: the authenticated session context used while creating the page
- `applicationId`: the parent application that owns the page
- `pageId`: the generated unique page id
- `pageIndex`: the page order inside the application
- `pageName`: the page name entered at creation time
- `description`: the page description entered at creation time
- `createdBy`: the user who created the page
- `createdBy.role`: the role of the user who created the page
- `createdAt`: the time the page was first created
- `lastModifiedAt`: the latest modification timestamp, which initially can match `createdAt`
- `pageSettings`: the page-level settings metadata for that created page

The `pageCopy` field should be a boolean flag. It should be `false` for a newly created page and should only become `true` when the page is created by duplicating an existing page.

### Page Save JSON

After saving a page, the page remains `inactive`. The saved widget array is updated, but the published preview does not change until the page is published.

Recommended page JSON structure:

```jsonc
{
  "applicationId": "UUID",
  "pageId": "UUID",
  "pageIndex": 2,
  "pageName": "HR Dashboard",
  "description": "Main employee dashboard",
  "status": "inactive",
  "createdBy": {
    "userId": "UUID",
    "userName": "Aman Verma",
    "email": "aman.verma@quantaops.com",
    "role": "admin"
  },
  "createdAt": "2026-05-15T10:30:00.000Z",
  "updatedAt": "2026-05-15T11:10:00.000Z",
  "publishedAt": null, // not published yet
  "sharedPageProperties": {
    "viewport": "desktop", // default viewport context saved for this page
    "background": "grid", // page canvas background style
    "version": 1, // saved page version number
    "pageContext": "internal", // page usage context inside the application
    "devicePreview": "desktop" // last selected preview device
  },
  "widgets": [
    {
      "id": "widget-1778209218548-yea4n8",
      "type": "button-showcase",
      "label": "Update Details",
      "x": 496.12, // horizontal canvas position
      "y": 69.48, // vertical canvas position
      "width": 220, // widget width
      "height": 64, // widget height
      "visible": true, // controls whether the widget is shown
      "disabled": false, // prevents user interaction when true
      "readOnly": false, // allows view-only mode where applicable
      "required": false, // marks the widget mandatory where applicable
      "locked": false, // prevents layout edits such as move or resize
      "zIndex": 1, // stacking order on the canvas
      "alignment": "left", // layout alignment inside the widget area
      "buttonVariant": "primary-filled", // selected button preset or display style
      "buttonStyleConfig": {
        "cornerRadius": 3,
        "bold": false,
        "italic": false,
        "underline": false,
        "textCase": "default",
        "fontFamily": "var(--qo-font-family-sans)",
        "fontSize": "var(--qo-text-xl)",
        "color": "var(--qo-color-neutral-0)",
        "fillColor": "var(--qo-color-primary-700)",
        "strokeColor": "var(--qo-border-color)",
        "strokeWidth": 0,
        "paddingTop": 12,
        "paddingRight": 15,
        "paddingBottom": 12,
        "paddingLeft": 15,
        "marginTop": 0,
        "marginRight": 0,
        "marginBottom": 0,
        "marginLeft": 0
      },
      "buttonActionConfig": {
        "type": "open-page",
        "url": "",
        "openIn": "same-window",
        "formId": "",
        "reportId": "",
        "pageId": "employee-portal",
        "queryParams": "",
        "functionName": ""
      }
    },
    {
      "id": "widget-1778209221918-ep2m8q",
      "type": "report-embed",
      "label": "Employee Directory",
      "x": 120, // horizontal canvas position
      "y": 160, // vertical canvas position
      "width": 720, // widget width
      "height": 320, // widget height
      "visible": true, // controls whether the widget is shown
      "disabled": false, // prevents user interaction when true
      "readOnly": false, // allows view-only mode where applicable
      "required": false, // marks the widget mandatory where applicable
      "locked": false, // prevents layout edits such as move or resize
      "zIndex": 2, // stacking order on the canvas
      "alignment": "stretch", // layout alignment inside the widget area
      "reportId": "employee-directory", // selected report identifier
      "reportLabel": "Employee Directory", // display name shown in the page
      "allowPublicAccess": false, // controls whether the report is public
      "dataSourceBinding": {
        "mode": "report",
        "dataSourceId": "qo_hrms_prod",
        "sourceType": "report",
        "sourceId": "employee-directory"
      },
      "visibility": {
        "search": true,
        "print": true,
        "export": true,
        "add": false,
        "edit": false,
        "delete": false
      }
    }
  ],
  "saveHistory": {
    "draftSaved": true,
    "lastSavedBy": "u001",
    "lastSavedAt": "2026-05-15T11:10:00.000Z",
    "published": false
  },
  "preview": {
    "builderPreview": true, // inactive page can still be reviewed inside builder
    "publishedPreview": false // standalone preview still uses the last active version
  }
}
```

The example above shows an inactive saved-page output. In a real saved page, the `widgets` array should contain every widget placed on that page. Representative examples for all widget families are listed later in this document.

### Published Page JSON

After publishing, the saved widgets are copied into the published page and the page status becomes `active`.

Example:

```jsonc
{
  "applicationId": "UUID",
  "pageId": "UUID",
  "pageIndex": 2,
  "pageName": "HR Dashboard",
  "description": "Main employee dashboard",
  "status": "active",
  "createdBy": {
    "userId": "UUID",
    "userName": "Aman Verma",
    "email": "aman.verma@quantaops.com",
    "role": "admin"
  },
  "createdAt": "2026-05-15T10:30:00.000Z",
  "updatedAt": "2026-05-15T11:25:00.000Z",
  "publishedAt": "2026-05-15T11:25:00.000Z",
  "sharedPageProperties": {
    "viewport": "desktop", // default viewport context saved for this page
    "background": "grid", // page canvas background style
    "version": 2, // incremented version after publish
    "pageContext": "internal", // page usage context inside the application
    "devicePreview": "desktop" // last selected preview device
  },
  "saveHistory": {
    "draftSaved": true,
    "lastSavedBy": "u001",
    "lastSavedAt": "2026-05-15T11:25:00.000Z",
    "published": true,
    "publishedBy": "u001",
    "publishedVersion": 2
  },
  "preview": {
    "builderPreview": true, // builder can still open the page for further edits
    "publishedPreview": true // standalone preview uses this published active version
  }
}
```

### Preview and Status

- `save`: keeps the page `inactive`
- `publish`: changes the page to `active`
- `builder preview`: can review the current saved page while editing
- `published preview`: shows only the `active` / published version

### Save Failure JSON

If the save action fails, the system should be able to return a clear failure payload instead of only a generic message.

Example:

```json
{
  "success": false,
  "operation": "save-page",
  "pageId": "UUID",
  "pageName": "HR Dashboard",
  "status": "inactive",
  "error": {
    "code": "PAGE_SAVE_FAILED",
    "message": "Unable to save page widgets",
    "details": "Draft widget storage could not be updated",
    "retryable": true
  },
  "lastKnownSaveState": {
    "draftSaved": false,
    "lastSavedAt": "2026-05-15T10:58:00.000Z"
  }
}
```

### What This Detailed Structure Captures

- application relationship: `applicationId`
- page identity: `pageId`, `pageIndex`, `pageName`, `status`
- page ownership: `createdBy`
- page timeline: `createdAt`, `updatedAt`, `publishedAt`
- page-level shared settings: `sharedPageProperties`
- widget list for that exact page: `widgets`
- widget shared properties: position, size, visibility, state flags, stacking
- widget-specific properties: button config, report config, form config, search config, text block config, and other widget-specific fields
- datasource-driven configuration: `dataSourceBinding`, `reportId`, `formId`, `sourceType`, or similar data-linked properties
- save lifecycle data: `saveHistory`
- draft versus published state transitions: `status`, `publishedAt`, `publishedVersion`
- failure response details when save does not complete: `success`, `error`, `lastKnownSaveState`

### Shared Page Properties Notes

- `viewport`: the default viewport context saved for that page
- `background`: the canvas or page background style
- `version`: numeric version of the saved page output; this should increment on meaningful save or publish checkpoints
- `pageContext`: a simple context label such as `internal`, `public`, or other application-specific grouping
- `devicePreview`: the last selected preview device such as `desktop`, `tablet`, or `mobile`

### Required Page-Level Fields

Each saved page JSON should include at least:

- `applicationId`: identifies which larger application owns the page
- `pageId`: unique page identifier
- `pageIndex`: page order inside the application such as `0`, `1`, `2`, `3`
- `pageName`: display name of the page
- `status`: such as `inactive` or `active`
- `widgets`: array of all widgets saved for that page

### Flow From Create Page to Save

1. When the page is created, the system should generate `applicationId`, `pageId`, `pageIndex`, `pageName`, `status`, creator details, and creation timestamp.
2. When widgets are added, each widget should be appended to that page document under `widgets`.
3. Shared widget properties should store layout and common behavior such as `x`, `y`, `width`, `height`, `visible`, and `disabled`.
4. Specific widget properties should store only the fields that belong to that widget type, such as button actions, report visibility, form fields, or text block settings.
5. For datasource-driven widgets, the data source binding should also be saved with the widget.
6. When the page is saved as draft, `updatedAt`, `lastSavedAt`, and draft status should be updated.
7. When the page is published, `status` should become `Active` and `publishedAt` should be filled.

### Important Note

The structure shown above is the detailed JSON shape recommended for complete page tracking. The current implementation in the builder does not yet save all of this information inside one single page document. Right now it keeps page metadata and widget arrays in separate storage entries.

## 10. Quick Reference

### 10.1 Top Section

- page builder title
- selected page name
- descriptive text
- edit action
- viewport toggle
- save and publish action

### 10.2 Left Sidebars

Primary left sidebar:

- widget families

Secondary left sidebar:

- widget variants
- previews
- source selectors where needed

### 10.3 Center Area

- preview canvas on the preview screen
- design canvas on the editing screen
- placed widgets

### 10.4 Right Configuration Area

- widget-specific tabs
- content settings
- style settings
- action settings
- property settings
- filter settings where needed
