# Page Builder Guide

## Chapter 1. Purpose

This document is a guide for the Page Builder experience.

It explains:

- the overall screen structure
- what appears in each region of the page builder
- how a page gets built from scratch
- the flow followed while designing a page
- the list of widgets, their types, and their configuration panel properties

## Chapter 2. Main Screens

The page builder is organized into two main screens:

1. Page list and preview screen
2. Page editing screen

### 2.1 Page List and Preview Screen

This screen covers:

- page selection
- page creation
- page preview
- viewport switching
- navigation into edit mode

### 2.2 Page Editing Screen

This screen covers:

- widget selection
- widget placement
- widget arrangement
- widget configuration
- page layout building

## Chapter 3. Page List and Preview Screen Layout

### 3.1 Left Sidebar

The left sidebar contains page-level actions and page navigation.

This area includes:

- page list
- page search
- create page action
- duplicate page action
- delete page action
- page selection

### 3.2 Top Section

The top section contains:

- page builder title
- selected page name
- descriptive summary text
- edit action
- viewport toggle
- save and publish action

The viewport toggle contains:

- Desktop
- Tablet
- Mobile

### 3.3 Center Section

The center section acts as the preview area.

This area contains:

- preview canvas
- page layout preview
- placed widgets

When the page is empty, this section carries the empty state for starting the page design.

## Chapter 4. Page Editing Screen Layout

### 4.1 Left Primary Sidebar

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
8. Text Block
9. Board
10. Select
11. Media

### 4.2 Left Secondary Sidebar

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
- form placement styles
- report placement styles
- select variants
- text block presets
- media presets

### 4.3 Center Canvas

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

### 4.4 Floating Selection Toolbar

The floating selection toolbar appears when a widget is selected.

This toolbar contains quick actions such as:

- configure
- text edit
- duplicate
- delete

### 4.5 Right Configuration Overlay

The right configuration overlay opens while editing a selected widget.

The overlay contains:

1. header
2. optional left helper panel
3. center live preview
4. right configuration section

## Chapter 5. Configuration Overlay Structure

### 5.1 Header

The header contains:

- panel title
- panel name
- rename action
- cancel action
- apply action
- close action

### 5.2 Left Helper Panel

The optional helper panel contains supporting insert or preview tabs such as:

- Text
- Image
- Button

### 5.3 Center Preview Area

The center area of the overlay contains the live preview of the selected widget.

### 5.4 Right Configuration Area

The right side contains widget settings.

Depending on widget type, the available tabs may include:

- Display
- Content
- Properties
- Action
- Actions
- Style
- Filter

## Chapter 6. Page Building Flow

The page-building flow follows these steps:

1. Create a new page.
2. Enter page name and data source or application context.
3. Select the page from the page list.
4. Open the editor.
5. Choose a widget family from the first left sidebar.
6. Choose a widget variant from the second left sidebar.
7. Drag the widget onto the canvas.
8. Move and resize the widget as required.
9. Open the configuration overlay.
10. Configure content, style, actions, and other widget settings.
11. Save the page.
12. Review the page in desktop, tablet, and mobile preview.

## Chapter 7. Widget Guide

## 7.1 Chart Widget

### Types

1. `line`
2. `scatter`
3. `area`
4. `stacked-area`
5. `web`
6. `column`
7. `stacked-column`
8. `stacked-pct-column`
9. `bar`
10. `stacked-bar`

### Configuration Panel Properties

- source form id
- source form label
- x-axis category
- x-axis label
- y-axis stack by
- aggregate value
- y-axis label
- interval
- filter data based on
- show data label
- show underlying data
- value type
- record scope
- selected record criteria

### Panel Flow

The chart panel is divided into:

1. source selection
2. chart settings

## 7.2 Search Widget

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

- result target
- selected item target
- search criteria
- default value
- placeholder
- open target
- allow public access

Style:

- search box shape
- font family
- search button font size
- search bar font size
- search button color
- search bar color
- background color
- search button bold
- search button italic
- search bar bold
- search bar italic
- image source
- padding top
- padding right
- padding bottom
- padding left

## 7.3 Form Widget

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

- form id
- application label
- form label
- field list
- field labels
- field placeholders
- required flags
- field options
- action labels
- success message
- submit button text
- reset button text
- allow public access

## 7.4 Report Widget

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

- report id
- application label
- report label
- source form id
- source form label
- columns
- row preview data
- visibility settings
- allow public access

Visibility:

- add
- edit
- delete
- duplicate
- search
- retain changes
- print
- export
- records count
- bulk edit
- bulk delete
- bulk duplicate

Filter:

- criteria rows
- field
- operator
- value
- joiner
- filter expression summary
- clear filter action

## 7.5 Table Widget

### Types

1. `table`

### Configuration Panel Tabs

- Display
- Actions
- Style

### Configuration Panel Properties

Display:

- label
- visible
- rows per page
- table size
- show search
- show download
- show sorting
- show column filters
- enable add
- enable edit
- enable delete
- enable duplicate

Actions:

- row click action

Style:

- background color
- border color
- border radius

## 7.6 Snippet Widget

### Types

1. `html`
2. `embed`

### Configuration Panel Tabs

- Display
- Content
- Style

### Configuration Panel Properties

- label
- markup
- background color
- text color
- padding
- border radius

## 7.7 Button Widget

### Types

1. `primary`
2. `secondary`
3. `outline`

### Configuration Panel Tabs

- Display
- Action
- Style

### Configuration Panel Properties

Display:

- label

Action:

- none
- open URL
- open form
- open report
- open page
- execute function
- URL
- open target
- form selector
- report selector
- page selector
- query parameters
- function selector

Style:

- corner radius
- bold
- italic
- underline
- text case
- font family
- font size
- text color
- fill color
- stroke color
- stroke width
- padding top
- padding right
- padding bottom
- padding left
- margin top
- margin right
- margin bottom
- margin left

## 7.8 Text Block Widget

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

- label
- widget name
- label color
- label font size
- input type
- allow type selection
- visible
- background color
- border color
- border width
- border radius
- placeholder
- default value
- allowed file types
- data format
- max files
- animate loading
- date format
- min date
- max date
- required
- read only
- disabled
- min length
- max length
- custom regex

## 7.9 Board Widget

### Types

1. `department-list`
2. `list`
3. `grid`

### Configuration Panel Tabs

- Display
- Style

### Configuration Panel Properties

- board variant
- source context or form
- background color
- layout type
- panels per row
- image source
- padding top
- padding right
- padding bottom
- padding left

## 7.10 Select Widget

### Types

1. `select`
2. `multiselect`
3. `radio`

### Configuration Panel Tabs

- Content
- Style

### Configuration Panel Properties

Content:

- label
- variant
- visibility
- placeholder
- options list

Style:

- background color
- text color
- border color

## 7.11 Media Widget

### Types

1. `image`
2. `video`
3. `pdf`

### Configuration Panel Tabs

- Content
- Style

### Configuration Panel Properties

- visible
- media type
- title
- caption
- background color
- source URL
- uploaded image source
- uploaded video source
- uploaded PDF source
- autoplay
- PDF default page
- PDF toolbar visibility
- PDF allow download
- PDF allow print
- PDF zoom level
- PDF fit to width
- PDF disabled state
- PDF loading state

## Chapter 8. Preview Guide

The preview area includes:

- page title
- page preview canvas
- placed widgets
- desktop preview
- tablet preview
- mobile preview

## Chapter 9. Quick Summary

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
