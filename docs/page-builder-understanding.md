# Page Builder - Understanding

## Description
Understood the overall code structure of the Page Builder module.

Analyzed the project folder structure and module organization.

Explored widget implementation and rendering flow.

Reviewed JSON configuration and page schema handling.

Understood the Properties Sidebar functionality and configuration flow.

Analyzed datasource integration and mapping process.

Reviewed query structure and widget data binding flow.

## Understanding Summary

### 1. Module Structure
The Page Builder module is organized around a clear feature-based structure inside `apps/builder/src/app/features/page-builder`.

The module is mainly divided into:
- `containers`
- `components`
- `models`
- `services`

The major entry points are:
- `page-builder-page.component.*` for page preview/list behavior
- `page-builder-edit-page.component.*` for the editable builder canvas
- `page-builder-facade.service.ts` for state, widget lifecycle, page state, and builder interactions

### 2. Folder Organization
The Page Builder implementation is split to keep responsibilities separated:

- `containers/`
  Holds top-level page experiences such as preview and edit screens.

- `components/panel-config/`
  Contains the right-side configuration panels used to edit widget properties, display rules, styles, bindings, and settings.

- `components/widget-showcase/`
  Contains draggable widget preview/showcase implementations and runtime widget UI pieces.

- `models/`
  Defines canvas widget structure, panel state, chart config, form embed config, report embed config, and other shared builder data models.

- `services/`
  Contains the facade that coordinates persistence, selection, widget mutations, draft/publish state, and editor behavior.

### 3. Widget Implementation and Rendering Flow
Widgets are driven by a central canvas model and rendered conditionally by widget type.

At a high level:
1. The facade manages widget state in signals.
2. The edit container reads canvas widgets from the facade.
3. Each widget type is rendered through a switch-based template flow.
4. Specialized widget components are used for live previews where needed.
5. Configuration updates are pushed back into the facade and persisted.

This means the rendering flow is:
- widget data created or updated in the facade
- edit container reads widget state
- widget-specific UI is rendered
- property panel edits mutate the selected widget
- canvas preview updates immediately

### 4. JSON Configuration and Page Schema Handling
Page schema and widget configuration are effectively represented through structured TypeScript models and persisted state rather than one loose raw JSON file.

Important schema areas include:
- page asset metadata
- widget coordinates and dimensions
- widget type and subtype
- widget property payloads
- form/report/chart/select/media/panel/snippet/text configurations

The persisted page state supports:
- draft widgets
- published widgets
- selected page
- page metadata

This gives the builder a schema-driven behavior even when the source is stored as structured app state.

### 5. Properties Sidebar Flow
The Properties Sidebar is the main editing surface for widget configuration.

Its flow works like this:
1. A widget is selected on the canvas.
2. The selected widget metadata is pushed into panel-config state.
3. The right panel loads the matching settings component.
4. Component-specific controls update widget config.
5. The facade applies the updated config back to the selected widget.

The sidebar supports multiple configuration domains such as:
- content
- display
- style
- datasource binding
- actions
- layout settings

### 6. Datasource Integration and Mapping
Datasource integration is scoped through page-level datasource assignment and widget-level binding configuration.

The important pattern is:
- a page stores allowed datasource IDs
- settings panels read active datasource IDs from the selected page
- only allowed datasources are exposed to widget config panels
- query options are filtered based on selected datasource
- widget bindings are generated from datasource, query, record, and field selections

This keeps widget data configuration aligned with the page’s selected datasource context.

### 7. Query Structure and Data Binding Flow
The binding flow is built around datasource -> query -> record -> field.

A typical binding process works like this:
1. Select a datasource.
2. Resolve available queries for that datasource.
3. Resolve rows for the selected query.
4. Resolve field options from query row structure.
5. Build a binding expression using the selected datasource/query/field path.

Example binding shape:

```text
{{datasources.datasource_id.queries.query_id.data[index].field_name}}
```

This approach is used in label/text binding flows and supports dynamic runtime data display based on datasource-backed query output.

## Key Takeaways
- The Page Builder is driven by a facade-centered architecture.
- Widget rendering is schema-based and type-driven.
- The right properties panel is tightly connected to selected widget state.
- Datasource binding is filtered by the active page configuration.
- Query mapping and field binding follow a consistent runtime expression pattern.
- The codebase is modular enough to support extension of widgets, settings panels, and bindings without changing the full builder flow.
