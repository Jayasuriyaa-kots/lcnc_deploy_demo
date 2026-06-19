# Builder UI Component Inventory

This file identifies the shared UI base for the Builder application inside `apps/builder`, with focus on Forms, Reports, Pages, and the overall builder shell.

## Goal

Keep reusable UI in `libs/ui-components` so Forms, Reports, Pages, Data Sources, and future builder modules can use the same primitives, overlays, shell blocks, and data-display components.

## Builder Areas Reviewed

- `apps/builder/src/app/features/form-builder`
- `apps/builder/src/app/features/report-builder`
- `apps/builder/src/app/features/page-builder`
- `apps/builder/src/app/layout`
- `apps/builder/src/app/shared`

## Common UI Patterns Found Across Builder

### 1. Builder shell

Used by Forms, Reports, Pages, Data Sources, and other builder modules.

- top navigation/header
- left asset sidebar
- content canvas wrappers
- builder status bar

Shared base in `libs/ui-components`:

- `QoBuilderTopbarComponent`
- `QoSidebarItemComponent`
- `QoStatusToggleComponent`
- `QoSummaryCanvasComponent`
- `QoCanvasFrameComponent`
- `QoBuilderStatusbarComponent`
- `QoWidgetActionBarComponent`
- `builder-shell.models`

### 2. Overlay patterns

Used by Forms and Reports today, and also useful for Pages and Data Sources.

- create wizards
- settings dialogs
- preview dialogs
- slide-over drawers
- confirm dialogs

Shared base in `libs/ui-components`:

- `QoModalComponent`
- `QoDrawerComponent`
- `QoConfirmDialogComponent`
- `QoConfirmDialogService`

### 3. Core form controls

Repeated in Forms, Reports filters/config, Pages property panels, and Data Sources.

- text input
- select
- multi-select
- toggle / checkbox style controls
- labeled form field wrappers
- stepper flow

Shared base in `libs/ui-components`:

- `QoInputComponent`
- `QoSelectComponent`
- `QoMultiSelectComponent`
- `QoToggleComponent`
- `QoFormFieldComponent`
- `QoStepperComponent`

### 4. Data display patterns

Shared between Reports, Data Sources, dashboards, and future builder previews.

- tables
- pagination
- stat cards
- metric strips
- search input
- empty states

Shared base in `libs/ui-components`:

- `QoTableComponent`
- `QoPaginationComponent`
- `QoStatCardComponent`
- `QoMetricStripComponent`
- `QoSearchBarComponent`
- `QoEmptyStateComponent`

### 5. Primitive building blocks

Used nearly everywhere.

- buttons
- icons
- status dots
- badges
- spinners
- connector icons

Shared base in `libs/ui-components`:

- `QoButtonComponent`
- `QoIconComponent`
- `QoStatusDotComponent`
- `QoBadgeComponent`
- `QoSpinnerComponent`
- `QoConnectorIconComponent`

### 6. Feedback and notifications

Used for publish/save/delete/duplicate/test actions.

Shared base in `libs/ui-components`:

- `QoToastComponent`
- `QoToastService`

## Feature-to-Component Mapping

### Form Builder

Main reusable UI pieces:

- builder shell
- create wizard modal
- settings modal
- preview modal
- field inspector controls
- field library list
- action button strip
- confirm dialog for duplicate/delete
- toast feedback

### Report Builder

Main reusable UI pieces:

- builder shell
- left filters/config panel
- center preview canvas
- right configuration panel
- settings modal
- preview modal
- search / field / bulk-edit drawers
- confirm dialog
- toast feedback
- table and pagination patterns

### Page Builder

Main reusable UI pieces:

- builder shell
- canvas frame wrapper
- property/config side panels
- widget library list
- buttons, cards, text blocks, charts, embedded module wrappers
- modal/drawer patterns for configuration

## Recommended Shared Ownership

These components should remain in `libs/ui-components` and be treated as the shared base:

- shell components
- overlay components
- primitive components
- form controls
- data display components
- shared feedback components

These should stay inside feature folders because they contain builder-specific behavior and state:

- form field inspector logic
- report quick-view/detail-view behavior
- report field/bulk/search drawer business rules
- page widget business logic and widget-specific config state
- feature state services

## Immediate Base Layer Outcome

After this inventory update, the shared base now includes the builder-level reusable UI that is shared without moving feature business logic:

- `QoConfirmDialogComponent`
- `QoCanvasFrameComponent`
- `QoBuilderStatusbarComponent`
- `QoSidebarItemComponent`
- `QoStatusToggleComponent`
- `QoWidgetActionBarComponent`

## Next Refactor Direction

When implementation resumes, the next cleanup step should be:

1. Replace app-local confirm dialog usage with `QoConfirmDialogComponent`.
2. Replace app-local canvas frame usage with `QoCanvasFrameComponent`.
3. Move builder statusbar usage to `QoBuilderStatusbarComponent`.
4. Gradually move feature templates to the shared shell and overlay components without changing feature behavior.
