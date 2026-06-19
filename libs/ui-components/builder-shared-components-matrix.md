# Builder Shared Components Matrix

This file records the current reusable UI base for the Builder app and shows what is already shared through `libs/ui-components` for Forms, Reports, and Pages.

## Purpose

- identify common UI components used across builder modules
- show which pieces are already moved into `libs/ui-components`
- highlight which pieces stay feature-specific because they contain module logic

## Shared Base Components

| Area | Component / Service | In Shared Lib | Used By | Notes |
| --- | --- | --- | --- | --- |
| Shell | `QoBuilderTopbarComponent` | Yes | Builder shell | Shared builder header shell |
| Shell | `QoSidebarItemComponent` | Yes | Builder sidebar list flows | Shared asset row/card UI |
| Shell | `QoStatusToggleComponent` | Yes | Builder sidebar list flows | Shared active/inactive status toggle |
| Shell | `QoSummaryCanvasComponent` | Yes | Builder home, deployment, workflow | Generic summary canvas |
| Shell | `QoCanvasFrameComponent` | Yes | Page builder edit canvas | Shared device/frame wrapper |
| Shell | `QoBuilderStatusbarComponent` | Yes | Ready for builder shell use | Shared bottom status bar |
| Widget UI | `QoWidgetActionBarComponent` | Yes | Page builder selection state | Shared action bar without widget business logic |
| Overlay | `QoModalComponent` | Yes | Reusable for modal flows | Base modal shell |
| Overlay | `QoDrawerComponent` | Yes | Data source pages and reusable drawers | Base right-side drawer |
| Overlay | `QoConfirmDialogComponent` | Yes | Builder sidebar duplicate/delete | Shared confirm dialog |
| Overlay | `QoConfirmDialogService` | Yes | Available globally | Programmatic confirm helper |
| Feedback | `QoToastService` | Yes | Forms, reports, sidebar, login | Shared toast service |
| Feedback | `QoToastComponent` | Yes | Programmatic service rendering | No app-level toast host needed |
| Forms | `QoInputComponent` | Yes | Reusable inputs | Shared text input |
| Forms | `QoSelectComponent` | Yes | Form/report/page configs | Shared select input |
| Forms | `QoMultiSelectComponent` | Yes | Advanced config use | Shared multi-select |
| Forms | `QoToggleComponent` | Yes | Feature config toggles | Shared boolean control |
| Forms | `QoFormFieldComponent` | Yes | Reusable form wrappers | Shared field label/hint wrapper |
| Navigation | `QoStepperComponent` | Yes | Wizard-style flows | Reusable step progress |
| Data Display | `QoSearchBarComponent` | Yes | Search/filter layouts | Shared search UI |
| Data Display | `QoTableComponent` | Yes | Report/data listing patterns | Shared table base |
| Data Display | `QoPaginationComponent` | Yes | Report/listing pages | Shared pagination |
| Data Display | `QoStatCardComponent` | Yes | Dashboard/page widgets | Shared stat card |
| Data Display | `QoMetricStripComponent` | Yes | Summary strips | Shared metrics row |
| Primitives | buttons / icons / badges / status dots / spinner | Yes | All builder modules | Shared visual primitives |

## Forms

### Forms using shared lib now

| Type | Component / Service | Shared? | Notes |
| --- | --- | --- | --- |
| Feedback | `QoToastService` | Yes | Publish flow now uses shared toast |
| Overlay base | modal / drawer / confirm foundation | Yes | Available from lib for future cleanup |
| Input base | select, input, toggle, multi-select | Yes | Shared base available for reuse |

### Forms still feature-specific

| Component | Why Local |
| --- | --- |
| `FormFieldsListComponent` | Handles field ordering, row selection, builder-specific actions |
| `FormFieldLibraryComponent` | Knows builder field catalog and grouping |
| `FormFieldInspectorComponent` | Field-type-specific property logic |
| `FormCreateWizardComponent` | Form datasource-table-field flow is builder-specific |
| `FormPreviewModalComponent` | Preview rendering tied to form builder state |
| `FormSettingsModalComponent` | Form metadata + settings logic is form-specific |
| `FormActionButtonsComponent` | Builder action strip logic is form-specific |

## Reports

### Reports using shared lib now

| Type | Component / Service | Shared? | Notes |
| --- | --- | --- | --- |
| Feedback | `QoToastService` | Yes | Publish/duplicate/delete now use shared toast |
| Input base | shared select/input/toggle patterns | Yes | Available to report config flows |
| Overlay base | modal / drawer / confirm foundation | Yes | Available to standardize report overlays |

### Reports still feature-specific

| Component | Why Local |
| --- | --- |
| `ReportLeftPanelComponent` | Contains report filter/group/sort behavior |
| `ReportCenterPreviewComponent` | Report preview layout and toolbar behavior |
| `ReportRightPanelComponent` | Quick view/detail view config logic |
| `ReportDrawersComponent` | Search, field config, bulk edit flows are report-specific |
| `ReportCreateWizardComponent` | Report creation flow is report-specific |
| `ReportSettingsModalComponent` | Report metadata/settings logic |
| `ReportPreviewModalComponent` | Report preview state and rendering |

## Pages

### Pages using shared lib now

| Type | Component / Service | Shared? | Notes |
| --- | --- | --- | --- |
| Shell | `QoCanvasFrameComponent` | Yes | Page edit canvas now uses shared frame |
| Forms | `QoSelectComponent` | Yes | Page config uses shared select |
| Overlay base | modal / drawer foundation | Yes | Reusable for config flows |
| Primitives / display | stat cards, buttons, inputs, search | Yes | Available for widget standardization |

### Pages still feature-specific

| Component | Why Local |
| --- | --- |
| `PanelConfigComponent` | Widget config logic is page-builder-specific |
| widget showcase components | Showcase content and drag behavior are page-specific |
| widget config panels | Behavior tied to page canvas widgets and presets |
| canvas state services | Business logic, drag/drop, resize, layout persistence |

## Builder App-Level Reuse Completed In This Pass

| Change | Result |
| --- | --- |
| Shared confirm dialog added to lib | Sidebar duplicate/delete can use common confirm dialog |
| Shared builder canvas frame added to lib | Page builder edit uses reusable frame wrapper |
| Shared builder statusbar added to lib | Ready to use from common shell layer |
| Shared builder exports expanded | Builder-specific shell components are publicly exported |
| App switched to shared toast service | Forms, reports, sidebar now use lib toast service |
| App switched to shared builder canvas | Builder home, deployment, workflow use lib canvas |

## Still Local But Candidate For Later Sharing

| Candidate | Why It May Move Later |
| --- | --- |
| Builder shell topbar implementation | Can be aligned fully with lib shell once behavior is standardized |
| Form preview/settings modal styling | Can move to common modal composition pattern |
| Report preview/settings/drawer styling | Can move to common overlay composition pattern |
| Page widget cards | Can move once widget catalog is finalized |

## Recommended Rule

Use `libs/ui-components` for:

- anything visual that can be reused by more than one builder module
- shell layout pieces
- common overlays
- common input controls
- shared feedback and display components

Keep feature folders for:

- business logic
- builder-specific workflows
- state services
- field/report/page configuration rules
