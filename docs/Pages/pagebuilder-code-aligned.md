## 8.8 Search Widget

The search widget is used for search entry, lookup-driven filtering, and search-triggered navigation patterns inside a page.

### Types

1. `icon-only`
2. `inline-button`
3. `inline-button-lg`
4. `stacked-rounded`

### Configuration Panel Tabs

- Properties
- Style

### Configuration Panel Properties

Properties:

- result target: This field decides where the search results should be sent after the user performs a search, such as opening a page, refreshing a result area, or loading a report.
- selected item target: This field decides what should happen after the user clicks one specific result item, such as opening a details page for the selected employee.
- search criteria: This field defines which data fields the search is allowed to look through. For example, the search can be set to check `Employee Name`, `Employee ID`, and `Department`.
- default value: This field places a starting value in the search box when the page opens, which is useful when the page needs to begin with a prefilled search.
- placeholder: This field shows help text inside the empty search box so the user knows what kind of value can be entered.
- open target: This field controls whether the result opens in the current window or in a new one.
- allow public access: This field decides whether people without restricted internal access are allowed to use the search.

Style:

- search box shape: This field changes the overall shape of the search control so it can match the page style, such as a sharp rectangular bar or a rounded search box.
- font family: This field decides which text style is used in the search input and button.
- search button font size: This field controls how large the text appears inside the search button.
- search bar font size: This field controls how large the typed search text appears inside the input.
- search button color: This field controls the visual color used for the search button text or emphasis.
- search bar color: This field controls the color used for the search input text or main search bar styling.
- background color: This field controls the background color behind the search widget.
- search button bold: This field makes the search button text appear heavier so the main action stands out more clearly.
- search button italic: This field gives the search button text an italic style.
- search bar bold: This field makes the text entered in the search box appear bolder.
- search bar italic: This field gives the text entered in the search box an italic style.
- image source: This field decides where an icon or supporting image used in the search widget should come from.
- padding top: This field adds inner space at the top of the search widget so the content does not sit too close to the edge.
- padding right: This field adds inner space on the right side of the search widget.
- padding bottom: This field adds inner space at the bottom of the search widget.
- padding left: This field adds inner space on the left side of the search widget.

### Working Notes

The main role of this widget is to collect user input and use it to search or open a target context. The selected style changes how compact or action-oriented the search control appears on the page.

## 8.9 Form Widget

The form widget is used where direct data entry or form-triggered actions are needed inside the page.

### Types

1. `form-embed`
2. `form-button`
3. `form-action-card`

### Configuration Panel Areas

- form selection
- form settings
- submit settings
- button style settings for button-like variants

### Configuration Panel Properties

- form id: This field links the widget to the exact form design that needs to be shown inside the page.
- application label: This field shows which application or business module the form belongs to, helping the user understand the context of the form.
- form label: This field defines the title shown at the top of the form so the user knows what the form is meant for.
- field list: This field controls which form fields are included in the widget, which is useful when only some fields from a larger form need to be shown.
- field labels: This field defines the visible names shown beside each input so users know what information to enter.
- field placeholders: This field shows hint text inside each empty input, such as `Enter employee name`, to guide the user.
- required flags: This field marks which inputs must be completed before the form can be submitted.
- field options: This field provides the list of choices for option-based fields such as dropdowns, radio buttons, or multiselect inputs.
- action labels: This field controls the wording used for form-related actions, such as action buttons or form action areas.
- success message: This field defines the confirmation text shown after the form is submitted successfully.
- submit button text: This field defines the label shown on the main button used to submit the form.
- reset button text: This field defines the label shown on the button used to clear or reset the form values.
- allow public access: This field decides whether the form can be opened and used by users without restricted internal access.

### Working Notes

The embedded form variant is suited for in-page entry, while button-based variants are more useful when the form needs to open or trigger as an action rather than remain visible all the time.

## 8.10 Report Widget

The report widget is useful for showing structured records and table-style business output.

### Types

1. `report-embed`
2. `report-button`
3. `report-action-card`

### Configuration Panel Tabs

For embedded reports:

- Properties
- Filter

For button-like report variants:

- Display
- Action
- Style

### Configuration Panel Properties

Properties:

- report id: This field links the widget to the exact report definition that needs to be displayed.
- application label: This field shows which application or business module the report belongs to.
- report label: This field defines the title shown on the report widget so the viewer knows what the table represents.
- source form id: This field identifies the form whose records are used to build the report output.
- source form label: This field shows the readable name of that source form so the user can clearly see where the report data is coming from.
- columns: This field decides which data columns are visible in the report, such as `Employee Name`, `Department`, and `Status`.
- row preview data: This field shows example rows while configuring the report so the structure can be understood even before reviewing full live data.
- visibility settings: This field controls which report actions and tools are shown, such as search, print, export, add, edit, or delete.
- allow public access: This field decides whether users without restricted access are allowed to open and view the report.

Visibility:

- add: This field controls whether the user is allowed to create a new record directly from the report area.
- edit: This field controls whether existing rows can be opened and changed.
- delete: This field controls whether rows can be removed from the report output.
- duplicate: This field controls whether a row can be copied to create a similar new record.
- search: This field controls whether a search box is available for quickly finding rows in the report.
- retain changes: This field controls whether temporary edits, selections, or report state should be kept instead of being cleared immediately.
- print: This field controls whether the user is allowed to print the report output.
- export: This field controls whether the user is allowed to download the report data for use outside the page.
- records count: This field controls whether the total number of matching rows should be shown.
- bulk edit: This field controls whether several selected rows can be edited together.
- bulk delete: This field controls whether several selected rows can be deleted together.
- bulk duplicate: This field controls whether several selected rows can be copied together.

Filter:

- criteria rows: This field contains the full list of filter rules that have been added for the report.
- field: This field decides which data column a filter rule should check, such as `Department` or `Status`.
- operator: This field decides how the selected field should be compared with the entered value, such as `equals`, `contains`, or `greater than`.
- value: This field stores the value used in the filter comparison, such as `Finance`.
- joiner: This field connects multiple filter rules together using logic such as `AND` or `OR`.
- filter expression summary: This field shows the complete filter logic in readable form so the user can quickly understand what records are being included.
- clear filter action: This field is used to remove all active filters and return the report to its unfiltered state.

### Working Notes

This widget is typically used where the page needs tabular business information with record actions. Filter settings help narrow the report output without changing the source report itself.

## 8.11 Snippet Widget

The snippet widget is used for embedded markup or externally sourced embed content.

### Types

1. `html`
2. `embed`

### Configuration Panel Tabs

- Display
- Content
- Style

### Configuration Panel Properties

- label: This field defines the display name of the snippet block on the page.
- markup: This field contains the actual HTML or embed code that the widget should render.
- background color: This field controls the background shown behind the custom content.
- text color: This field controls the color of the text shown inside the snippet.
- padding: This field adds space inside the snippet block so the content does not touch the edges.
- border radius: This field controls how rounded or square the snippet block corners appear.

### Working Notes

This widget is typically used for compact custom content blocks or for embedding content that does not fit into the standard widget families.

## 8.12 Text Block Widget

The text block widget covers text-oriented and input-oriented elements used for fields and simple content entry.

### Types

1. `text`
2. `date`
3. `file`
4. `richtext`

### Configuration Panel Tabs

- Display
- Action
- Style

For non-action-oriented variants, only relevant tabs are shown.

### Configuration Panel Properties

Display:

Common:

- label: This field defines the text shown to the user to explain what the field is for.
- widget name: This field gives the widget an internal or display name so it can be identified in the page structure.
- input type: This field decides what kind of input control the user will interact with, such as a text box, or file upload field.
- allow type selection: This field decides whether the input type can be changed from the configuration panel when that behavior is supported.
- visible: This field decides whether the field should appear on the page or stay hidden.
- required: This field makes the input mandatory before the form or section can be completed.
- read only: This field allows the value to be viewed but prevents the user from editing it.
- disabled: This field makes the input inactive so the user cannot interact with it.

Widget specific:

- placeholder (`text`, `date`, `file`): This field shows hint text inside the empty field before the user enters a value.
- default value (`text`, `date`): This field fills the field with a starting value before the user changes it.
- min length (`text`): This field sets the minimum number of characters the user must enter.
- max length (`text`): This field sets the maximum number of characters the user is allowed to enter.
- custom regex (`text`): This field applies a pattern-based validation rule, for example allowing only numbers or enforcing a particular text format.
- text (`richtext`): This field stores the main content for the rich text variant.
- data format (`date`): This field controls how the value should appear or be interpreted for date-oriented variants.
- date format (`date`): This field controls how the date should appear to the user, such as `DD/MM/YYYY`.
- min date (`date`): This field prevents the user from selecting a date earlier than the allowed minimum.
- max date (`date`): This field prevents the user from selecting a date later than the allowed maximum.
- allowed file types (`file`): This field limits what file formats the user is allowed to upload, such as only PDF files or only image files.
- max files (`file`): This field limits how many files the user can upload in a file-type field.
- animate loading (`file`): This field controls whether a loading animation is shown while the widget is preparing content.

Style:

Common:

- label color: This field controls the color of the field label text.
- label font size: This field controls how large the field label appears.
- background color: This field controls the background color inside the field area.
- border color: This field controls the outline color around the field.
- border width: This field controls how thick the outline around the field appears.
- border radius: This field controls how rounded or sharp the field corners look.
- font family: This field controls which typeface is used for the text block content, following the same idea used in other input and text-based widgets.
- font size: This field controls how large the text content appears.
- font weight: This field controls how light, normal, or bold the text content should appear.
- line height: This field controls the vertical spacing between lines of text.
- letter spacing: This field controls the horizontal spacing between characters.

Widget specific:

- font style (`richtext`, `text`): This field controls whether the text should appear in normal, bold, or italic form.
- text decoration (`richtext`, `text`): This field controls whether the text should have no decoration, underline, or line-through.
- text alignment (`richtext`, `text`): This field controls whether the text should align left, center, or right.
- text transform (`richtext`, `text`): This field controls how the text casing should appear, such as normal text, uppercase, or lowercase.

### Working Notes

This widget family is flexible because it covers both simple field-like input elements and richer text content. Static label-only content is handled by the standalone Label widget.

## 8.13 Example Widget JSON By Family

The examples below show one representative JSON shape for each widget family. Each example uses a single widget from that family so the saved structure is easier to understand while reading the guide.


### Chart Widget Example

```json
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
      "filterDataBasedOn": [],
      "showDataLabel": false,
      "showUnderlyingData": false,
      "valueType": "aggregate",
      "recordScope": "all",
      "selectedRecordCriteriaRows": [],
      "chartColor": "var(--qo-color-primary-700)",
      "chartColorSecondary": "var(--qo-color-neutral-500)"
    }
  }
}
```

### Search Widget Example

```json
{
  "id": "widget-search-001",
  "type": "search-showcase",
  "label": "Employee Search",
  "x": 48,
  "y": 36,
  "width": 300,
  "height": 60,
  "searchVariant": "inline-button",
  "searchBoxShape": "rounded",
  "searchBarFontFamily": "inherit",
  "searchBarColor": "var(--qo-color-neutral-800)",
  "searchBarFontSize": "15 px",
  "searchButtonColor": "var(--qo-color-primary-700)",
  "searchButtonFontSize": "15 px",
  "searchBackgroundColor": "var(--qo-color-neutral-0)",
  "widgetProps": {
    "searchConfig": {
      "placeholder": "Search employee...",
      "defaultValue": "",
      "resultTarget": "report",
      "selectedItemTarget": "employee-details-page"
    }
  }
}
```

### Form Widget Example

```json
{
  "id": "widget-form-001",
  "type": "form-embed",
  "label": "Add Employee",
  "x": 120,
  "y": 120,
  "width": 640,
  "height": 420,
  "widgetProps": {
    "formConfig": {
      "formId": "employee-form",
      "applicationLabel": "HR Management",
      "formLabel": "Add Employee",
      "fields": [],
      "actionLabels": ["Submit", "Reset"],
      "submitConfig": {
        "submitButtonText": "Submit",
        "resetButtonText": "Reset",
        "successMessage": "Employee saved successfully",
        "allowPublicAccess": false
      }
    }
  }
}
```

### Report Widget Example

```json
{
  "id": "widget-report-001",
  "type": "report-embed",
  "label": "Employee Directory",
  "x": 120,
  "y": 180,
  "width": 720,
  "height": 320,
  "widgetProps": {
    "reportConfig": {
      "reportId": "employee-directory",
      "applicationLabel": "HR Management",
      "reportLabel": "Employee Directory",
      "sourceFormId": "employee-form",
      "sourceFormLabel": "Employee Form",
      "columns": [],
      "allowPublicAccess": false,
      "visibility": {
        "search": true,
        "print": true,
        "export": true,
        "add": false,
        "edit": false,
        "delete": false
      },
      "filterCriteriaRows": [],
      "filterConfigured": false
    }
  }
}
```

### Table Widget Example

```json
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
      "dataSourceKey": "builder_runtime_demo",
      "queryId": "asset_inventory_table",
      "queryBinding": "{{datasources.builder_runtime_demo.queries.asset_inventory_table}}",
      "dataColumns": ["display_name", "asset_city", "occupancy_pct"],
      "columnConfigs": [
        {
          "key": "display_name",
          "label": "Display Name",
          "visible": true,
          "order": 0,
          "width": 180,
          "align": "left",
          "type": "text"
        },
        {
          "key": "asset_city",
          "label": "Asset City",
          "visible": true,
          "order": 1,
          "width": 180,
          "align": "left",
          "type": "text"
        },
        {
          "key": "occupancy_pct",
          "label": "Occupancy %",
          "visible": true,
          "order": 2,
          "width": 180,
          "align": "left",
          "type": "number"
        }
      ],
      "dataRows": [
        {
          "display_name": "Brigade Cornerstone",
          "asset_city": "Bengaluru",
          "occupancy_pct": 92
        }
      ]
    }
  }
}
```

### Snippet Widget Example

```json
{
  "id": "widget-snippet-001",
  "type": "snippet-showcase",
  "label": "HTML Snippet",
  "x": 220,
  "y": 120,
  "width": 360,
  "height": 220,
  "snippetVariant": "html",
  "widgetProps": {
    "snippetConfig": {
      "label": "HTML Snippet",
      "markup": "<section><h2>Welcome</h2><p>Quick summary block.</p></section>",
      "backgroundColor": "var(--qo-color-neutral-0)",
      "textColor": "var(--qo-color-neutral-900)",
      "padding": "16px"
    }
  }
}
```

### Button Widget Example

```json
{
  "id": "widget-button-001",
  "type": "button-showcase",
  "label": "View Dashboard",
  "x": 420,
  "y": 72,
  "width": 220,
  "height": 64,
  "buttonVariant": "primary-filled",
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
      "type": "open-page",
      "url": "",
      "openIn": "same-window",
      "formId": "",
      "reportId": "",
      "pageId": "executive-dashboard",
      "datasourceId": "builder_runtime_demo",
      "queryBinding": "{{datasources.builder_runtime_demo.queries.asset_inventory_table}}",
      "queryParams": "",
      "functionName": ""
    }
  }
}
```

### Icon Button Widget Example

```json
{
  "id": "widget-button-icon-001",
  "type": "button-showcase",
  "label": "Download",
  "x": 680,
  "y": 72,
  "width": 64,
  "height": 64,
  "buttonVariant": "primary-outline",
  "buttonIcon": "download",
  "buttonIconSize": 20,
  "buttonIconImageDataUrl": "",
  "buttonStyleConfig": {
    "cornerRadius": 12,
    "bold": false,
    "italic": true,
    "underline": false,
    "textCase": "default",
    "fontFamily": "var(--qo-font-family-sans)",
    "fontSize": "14px",
    "color": "var(--qo-color-primary-700)",
    "fillColor": "var(--qo-color-primary-50)",
    "strokeColor": "var(--qo-color-primary-200)",
    "strokeWidth": 1,
    "paddingTop": 10,
    "paddingRight": 10,
    "paddingBottom": 10,
    "paddingLeft": 10,
    "marginTop": 0,
    "marginRight": 0,
    "marginBottom": 0,
    "marginLeft": 0
  },
  "widgetProps": {
    "buttonActionConfig": {
      "type": "open-url",
      "url": "https://example.com/download",
      "openIn": "new-window",
      "formId": "",
      "reportId": "",
      "pageId": "",
      "datasourceId": "",
      "queryBinding": "",
      "queryParams": "",
      "functionName": ""
    }
  }
}
```

### Button Group Widget Example

```json
{
  "id": "widget-button-group-001",
  "type": "button-showcase",
  "label": "Quick Actions",
  "x": 420,
  "y": 150,
  "width": 320,
  "height": 64,
  "buttonVariant": "primary-outline",
  "buttonStyleConfig": {
    "cornerRadius": 10,
    "bold": false,
    "italic": true,
    "underline": false,
    "textCase": "default",
    "fontFamily": "var(--qo-font-family-sans)",
    "fontSize": "14px",
    "color": "var(--qo-color-neutral-900)",
    "fillColor": "var(--qo-color-neutral-0)",
    "strokeColor": "var(--qo-border-color)",
    "strokeWidth": 1,
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
    "buttonGroupConfig": {
      "buttons": [
      {
        "id": "group-btn-1",
        "label": "Approve",
        "selectedAction": "execute-function",
        "buttonActionConfig": {
          "type": "execute-function",
          "url": "",
          "openIn": "same-window",
          "formId": "",
          "reportId": "",
          "pageId": "",
          "datasourceId": "",
          "queryBinding": "",
          "queryParams": "",
          "functionName": "approveRequest"
        }
      },
      {
        "id": "group-btn-2",
        "label": "Reject",
        "selectedAction": "execute-function",
        "buttonActionConfig": {
          "type": "execute-function",
          "url": "",
          "openIn": "same-window",
          "formId": "",
          "reportId": "",
          "pageId": "",
          "datasourceId": "",
          "queryBinding": "",
          "queryParams": "",
          "functionName": "rejectRequest"
        }
      }
      ]
    }
  }
}
```

### Label Widget Example

```json
{
  "id": "widget-label-001",
  "type": "label-showcase",
  "label": "Label",
  "x": 180,
  "y": 90,
  "width": 180,
  "height": 48,
  "textBlockVariant": "labeltext",
  "widgetProps": {
    "textBlockConfig": {
      "inputType": "labeltext",
      "text": "{{datasources.builder_runtime_demo.queries.asset_inventory_table.data[0].display_name}}",
      "defaultValue": "Employee Summary",
      "contentSource": "datasource",
      "datasourceId": "builder_runtime_demo",
      "queryId": "asset_inventory_table",
      "recordId": "1",
      "field": "display_name",
      "overflowText": "none",
      "visible": true,
      "disableLinks": false,
      "backgroundColor": "transparent",
      "borderColor": "transparent",
      "borderWidth": "0",
      "borderRadius": "0",
      "labelColor": "var(--qo-color-neutral-900)",
      "fontFamily": "var(--qo-font-family-sans)",
      "fontSize": "16px",
      "lineHeight": "1.5",
      "letterSpacing": "normal",
      "textAlign": "left",
      "bold": true,
      "italic": false,
      "underline": false,
      "lineThrough": false
    }
  }
}
```

### Text Block Widget Example

```json
{
  "id": "widget-text-001",
  "type": "text-block-showcase",
  "label": "Input Type Text",
  "x": 120,
  "y": 300,
  "width": 360,
  "height": 112,
  "textBlockVariant": "text",
  "widgetProps": {
    "textBlockConfig": {
      "inputType": "text",
      "label": "Employee Name",
      "placeholder": "Enter employee name",
      "defaultValue": "",
      "required": true,
      "readOnly": false,
      "disabled": false,
      "visible": true,
      "minLength": 2,
      "maxLength": 100,
      "customRegex": "",
      "backgroundColor": "var(--qo-color-neutral-0)",
      "borderColor": "var(--qo-border-color)",
      "borderWidth": "1",
      "borderRadius": "12px"
    }
  }
}
```

### Board Widget Example

```json
{
  "id": "widget-board-001",
  "type": "board-showcase",
  "label": "Employee Kanban",
  "x": 220,
  "y": 440,
  "width": 720,
  "height": 360,
  "widgetProps": {
    "boardConfig": {
      "title": "Employee Workflow",
      "sourceFormId": "employee-request-form",
      "sourceFormLabel": "Employee Request Form",
      "groupByField": "status",
      "cardTitleField": "employeeName",
      "cardDescriptionField": "requestSummary",
      "showCardCount": true,
      "allowDragBetweenColumns": true,
      "backgroundColor": "transparent"
    }
  }
}
```

### Select Widget Example

```json
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
      "variant": "select",
      "visible": true,
      "placeholder": "Choose city",
      "backgroundColor": "transparent",
      "textColor": "var(--qo-color-neutral-900)",
      "borderColor": "var(--qo-border-color-strong)",
      "datasourceId": "builder_runtime_demo",
      "queryId": "asset_inventory_table",
      "queryBinding": "{{datasources.builder_runtime_demo.queries.asset_inventory_table}}",
      "labelField": "asset_city",
      "valueField": "asset_city",
      "defaultValue": null,
      "allowSearch": true,
      "multiSelect": false,
      "options": []
    }
  }
}
```

### Media Widget Example

```json
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
      "mediaType": "image",
      "sourceMode": "datasource",
      "title": "Property Image",
      "caption": "Bound from datasource",
      "backgroundColor": "transparent",
      "sourceUrl": "",
      "datasourceId": "builder_runtime_demo",
      "queryId": "asset_inventory_table",
      "queryBinding": "{{datasources.builder_runtime_demo.queries.asset_inventory_table}}",
      "recordId": "1",
      "imageField": "image_url",
      "titleField": "display_name",
      "captionField": "asset_city",
      "showTitle": true,
      "showCaption": true,
      "uploadedImageDataUrl": "",
      "uploadedVideoDataUrl": "",
      "uploadedPdfDataUrl": "",
      "autoPlay": false,
      "pdfDefaultPage": 1,
      "pdfShowToolbar": false,
      "pdfAllowDownload": false,
      "pdfAllowPrint": false,
      "pdfZoomLevel": 100,
      "pdfFitToWidth": false,
      "pdfDisabled": false,
      "pdfLoadingState": false
    }
  }
}
```

### Panel Widget Example

```json
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
      "iconSymbol": "payments",
      "iconBackgroundColor": "#e8f2ff",
      "iconColor": "#1d4ed8",
      "valueColor": "#1d4ed8",
      "alignment": "right",
      "iconPlacement": "before",
      "layoutVariant": "icon-left-value-top",
      "sourceType": "aggregation",
      "datasourceId": "builder_runtime_demo",
      "queryId": "asset_inventory_table",
      "field": "revenue_lakhs",
      "aggregationType": "average",
      "filters": [],
      "condition": null,
      "staticText": "80%",
      "bindingExpression": "",
      "presetId": "",
      "backgroundColor": "#ffffff",
      "borderColor": "var(--qo-border-color)",
      "borderRadius": "16px"
    }
  }
}
```


### Common Widget Properties

These are the properties that can usually be shared across many widget types:

- `id`: unique widget id
- `type`: widget type
- `label`: visible widget name
- `x`: horizontal canvas position
- `y`: vertical canvas position
- `width`: widget width
- `height`: widget height
- `visible`: whether the widget is shown
- `disabled`: whether the widget is inactive
- `readOnly`: whether the widget can be viewed but not edited
- `required`: whether the widget must receive a value before submission, where relevant
- `locked`: whether the widget can be moved or edited in layout mode
- `zIndex`: layer order on the canvas
- `alignment`: layout alignment or stretch behavior

### Widget-Specific Properties

Each widget should also keep a dedicated JSON block for fields that belong only to that widget type.

Examples:

- button widget: `buttonVariant`, `buttonStyleConfig`, `buttonActionConfig`
- report widget: `reportId`, `reportLabel`, `visibility`, `allowPublicAccess`
- form widget: `formId`, `formLabel`, `fields`, `submitConfig`
- search widget: `placeholder`, `defaultValue`, `resultTarget`, `criteriaRows`
- text block widget: `inputType`, `placeholder`, `defaultValue`, `richTextConfig`
- media widget: `mediaType`, `imageSource`, `uploadConfig`

### Widgets That Derive Data From a Data Source

Some widgets do not only store layout and display settings. They also derive their data from a data source, form, or report. In this model the datasource is selected at widget level, not at page level.

Typical examples:

- report widgets
- form widgets
- select widgets with dynamic options
- chart widgets
- board widgets backed by report or form data

For such widgets, the JSON should include a dedicated binding block such as:

```json
{
  "dataSourceBinding": {
    "dataSourceId": "qo_hrms_prod",
    "sourceType": "report",
    "sourceId": "employee-directory",
    "refreshMode": "manual"
  }
}
```
This makes it clear:

- which datasource the widget depends on
- whether the widget is using form data, report data, chart data, or static data
- which exact source record or schema definition should be used
