# PR Review — Quanta Ops Builder: Code Violations Audit
**Date:** 2026-06-09 · **Scope:** form-builder, page-builder, report-builder, datasources, workflow-builder  
**Review criteria:** i18n / lang adoption · File size targets (Component < 200 lines, Facade < 400 lines, Service < 300 lines) · OOP conventions

---

## Legend
- 🔴 **Critical** — violates hard limits; blocks merge
- 🟡 **Warning** — should be fixed this sprint
- 🟢 **OK** — clean

---

## Summary Table

| Feature | i18n Coverage | Components > 200L | Facades > 400L | Services > 300L | OOP Issues |
|---|---|---|---|---|---|
| form-builder | 🟡 13 components missing | 🟢 None | 🟡 2 facades in `services/` | 🟢 None | 🔴 Deep 33-level inheritance chain |
| page-builder | 🔴 23 components missing | 🔴 8 components | 🔴 7 facades | 🔴 5 services | 🟡 Facades inside `components/` |
| report-builder | 🟢 All covered | 🔴 16 components | 🔴 3 services acting as facades | 🔴 5 services | 🟡 No `facades/` folder; facades in `services/` |
| datasources | 🟢 All covered | 🟢 None | 🟢 None | 🔴 8 services | 🔴 Circular-like deep inheritance chain (15 levels) |
| workflow-builder | 🟡 4 components missing | 🔴 8 components | 🔴 1 (facade in `services/`) | 🔴 1 service | 🟡 Lang file stored in `services/` not `lang/` |

---

---

# 1. Form Builder

## i18n Violations — 13 components not injecting lang

**Issue:** The following components have user-facing strings in templates but do not call `injectFormBuilderTranslate()` / reference the lang service. Since `form-builder-i18n.service.ts` and `form-builder.en.ts` exist and the pattern is established, these are straightforward omissions.

**Affected files:**

```
components/form-preview-modal/form-preview-modal.component.ts
components/form-preview-modal/content/templates/form-preview-field.component.ts
components/form-preview-modal/content/templates/form-preview-decision-field.component.ts
components/form-preview-modal/content/templates/form-preview-field-controls.component.ts
components/form-preview-modal/dispatcher/form-field-renderer.component.ts
components/form-preview-modal/renderers/date-field-renderer.component.ts
components/form-preview-modal/renderers/dropdown-field-renderer.component.ts
components/form-preview-modal/renderers/text-field-renderer.component.ts
components/form-preview-modal/renderers/file-upload-field-renderer.component.ts
containers/form-preview-content/form-preview-content.component.ts
containers/form-create-wizard/form-create-wizard.component.ts
containers/form-builder-page.component.ts
containers/form-preview-page.component.ts
```

**Fix:** Inject `injectFormBuilderTranslate()` in each and replace any raw string labels/placeholders with `t('formBuilder.xxx')` keys. The renderer components are especially important as they display field-level labels directly to the user.

---

## File Size Violations

### Facades in the wrong folder — 🟡 Warning

| File | Lines | Issue |
|---|---|---|
| `services/form-builder-page.facade.ts` | 318 | Facade file living inside `services/` |
| `services/form-builder.facade.ts` | 312 | Same — should be in `facades/` |

**Fix:** Move both to a `facades/` folder alongside the existing `containers/form-create-wizard/form-create-wizard.facade.ts`. Update all imports. This is a structural consistency issue, not a line-count violation (both are within the 400-line facade limit).

### Lang file is over the 400-line notional limit — 🟡 Warning

| File | Lines |
|---|---|
| `lang/form-builder.en.ts` | 590 |

**Fix:** Split by domain — e.g. `form-builder-fields.en.ts`, `form-builder-preview.en.ts`, `form-builder-settings.en.ts` — and re-export from a barrel `index.ts` in `lang/`.

---

## OOP Violations — 🔴 Critical

### 33-level deep inheritance chain in `form-preview-modal/content/base/`

The `FormPreviewContentBase` class is built via a **33-step mixin-style linear inheritance chain** where each base class extends the next. This is the most severe structural violation in the codebase.

**Chain (compressed):**
```
FormPreviewContentComponent
  → FormPreviewContentBase
    → FormPreviewContentSignatureBase
      → FormPreviewContentIoBase
        → FormPreviewContentValidationUtilsBase
          → FormPreviewContentValidationPresenceBase
            → ... (26 more levels)
              → FormPreviewContentChoiceDropdownBase
```

**Why this is problematic:**
- Angular's change detection cannot reason efficiently about a component with a 33-deep prototype chain.
- Adding a property at the bottom of the chain causes TypeScript to resolve it through all 33 levels — it's effectively a god-class disguised as inheritance.
- Any one change to a mid-chain base forces re-testing of all 33 levels.
- This is a textbook violation of the **Composition over Inheritance** principle. The Angular community explicitly discourages deep inheritance in components.

**Fix:** Flatten the chain. Extract logical groups into injectable services or composables:
- Field validation logic → `FormPreviewValidationService`
- Media/file logic → `FormPreviewMediaService`
- Rich text logic → `FormPreviewRichTextService`
- Signature logic → `FormPreviewSignatureService`

Inject these into `FormPreviewContentComponent` directly. The component itself should be a thin coordinator. The `base/` folder should have at most 1–2 thin abstract base classes providing shared signals/lifecycle hooks.

---

---

# 2. Page Builder

## i18n Violations — 🔴 Critical (23 of 55 components missing)

**Entire `widget-showcase/` subtree has zero lang injection.** These components render visible UI to developers building pages, yet bypass the i18n system entirely.

**Affected components (grouped):**

**widget-showcase/ — fully uncovered (18 components):**
```
board/ui-board/ui-board-widget.component.ts          ← 7 hardcoded label strings in .ts
board/board-showcase.component.ts
label/label-showcase.component.ts                    ← 2 hardcoded label strings
text-block/text-block-showcase.component.ts
text-block/ui-text-block/ui-text-block.component.ts
text-block/ui-rich-text/page-builder-rich-text-editor.component.ts  ← 3 hardcoded in .html
snippet/snippet-showcase.component.ts
search/search-showcase.component.ts
media/media-showcase.component.ts
select/select-showcase.component.ts                  ← 6 hardcoded strings
button/ui-button/ui-button.component.ts
button/button-showcase.component.ts                  ← 6 hardcoded strings
table/ui-table/ui-table-widget.component.ts
table/table-showcase.component.ts
panel/ui-panel/ui-panel-widget.component.ts
panel/ui-panel/ui-panel-widget-renderer.component.ts
panel/panel-showcase.component.ts                    ← 36 hardcoded strings — worst offender
chart/chart-thumbnail.component.ts
chart/chart-live-widget.component.ts                 ← 3 hardcoded strings
chart/ui-chart/ui-chart-picker.component.ts          ← 6 hardcoded strings
```

**panel-config/ — partially uncovered (5 components):**
```
panel-config/form/select-form-panel/select-form-panel.component.ts
panel-config/widget-configs/media-widget-config.component.ts
panel-config/widget-configs/board-widget-config.component.ts
```

**Highest-priority fix first:** `panel-showcase.component.ts` (36 hardcoded strings), `select-showcase.component.ts`, `button-showcase.component.ts` (6 each), `ui-chart-picker.component.ts` (6).

**Fix:** Inject `injectPageBuilderTranslate()` and move all `label`, `placeholder`, `tooltip`, and display strings to `page-builder.en.ts` under the appropriate namespaces.

---

## File Size Violations

### Components — 🔴 Critical (8 over 200 lines)

| File | Lines | Target | Action |
|---|---|---|---|
| `widget-showcase/chart/chart-thumbnail.component.ts` | **875** | 200 | Split chart-rendering logic into a `ChartThumbnailRenderService`; the component should only bind inputs and call the service |
| `widget-showcase/chart/chart-live-widget.component.ts` | **851** | 200 | Same as above — move live data subscription logic to service |
| `widget-showcase/media/ui-media/ui-media-widget.component.ts` | **450** | 200 | Extract media-state management into a dedicated facade or service |
| `components/panel-config/text-block/text-block-settings-panel.component.ts` | **359** | 200 | Split settings into subcomponents per section (font, spacing, alignment) |
| `components/panel-config/core/panel-config.component.ts` | **351** | 200 | Move config routing/switching logic to `PanelConfigService`; keep component as a thin dispatcher |
| `widget-showcase/select/ui-select/ui-select-widget.component.ts` | **280** | 200 | Extract option-resolution logic to `SelectOptionBindingUtil` (the util file already exists at 179 lines — merge logic there) |
| `panel-config/widget-configs/button-widget-config.component.ts` | **257** | 200 | Delegate binding setup to `ButtonWidgetConfigService` |
| `widget-showcase/panel/panel-showcase.component.ts` | **230** | 200 | Move showcase data arrays to a `panel-showcase.data.ts` constant file |

### Facades — 🔴 Critical (7 facades over 400 lines)

| File | Lines | Target | Action |
|---|---|---|---|
| `facades/page-canvas.facade.ts` | **857** | 400 | Split into `PageCanvasLayoutFacade` (positioning/grid) + `PageCanvasSelectionFacade` (widget select/focus) |
| `facades/page-builder-panel-session.facade.ts` | **762** | 400 | Extract panel-session undo/redo and history management into a `PanelSessionHistoryFacade` |
| `facades/panel-config/chart-settings.facade.ts` | **685** | 400 | Split into `ChartAxisSettingsFacade` + `ChartStyleSettingsFacade` |
| `facades/page-builder-page.facade.ts` | **550** | 400 | Move page-load orchestration to a `PageBuilderPageLoaderFacade` |
| `facades/panel-config/table-settings.facade.ts` | **592** | 400 | Split into `TableColumnSettingsFacade` + `TableStyleSettingsFacade` |
| `facades/panel-config/panel-settings.facade.ts` | **468** | 400 | Extract aggregation-rules logic to a sub-facade |
| `facades/panel-config/media-settings.facade.ts` | **459** | 400 | Extract media-upload vs media-url path into separate concerns |

### Services — 🔴 Critical (5 services over 300 lines)

| File | Lines | Target | Action |
|---|---|---|---|
| `services/page-builder-data-binding.service.ts` | **465** | 300 | Split binding-resolution from binding-registration — two focused services |
| `services/page-builder-mock-datasource.service.ts` | **412** | 300 | Move seed/fixture data to a `page-builder-mock.data.ts` constant; service becomes a thin loader |
| `services/widget-defaults.service.ts` | **395** | 300 | Split by widget category: `ChartDefaultsService`, `TableDefaultsService`, `MediaDefaultsService` |
| `services/page-builder-binding-registry.service.ts` | **330** | 300 | Extract the registry map to a separate `binding-registry.map.ts` constant |
| `services/page-builder-drag-drop.service.ts` | **318** | 300 | Extract auto-layout calculation helpers to a `drag-drop.util.ts` |

### Model file — 🔴 Critical

| File | Lines | Issue |
|---|---|---|
| `models/page-builder-canvas.model.ts` | **1003** | God model containing types/interfaces for all widget kinds, canvas state, layout config, and data bindings |

**Fix:** Split by concern — `canvas-layout.model.ts`, `widget-config.model.ts`, `data-binding.model.ts`, `panel-state.model.ts`. A model file has no special size limit but 1003 lines of type definitions is a maintenance and discoverability problem.

---

## OOP Violations

### Facades co-located inside `components/` — 🟡 Warning

```
components/widget-showcase/text-block/ui-text-block/ui-text-block.facade.ts
components/widget-showcase/table/ui-table/ui-table.facade.ts
```

Facades are feature-level concerns and belong in `facades/` or next to their container, not buried inside a `components/` subtree.

**Fix:** Move to `facades/widget/ui-text-block.facade.ts` and `facades/widget/ui-table.facade.ts`. Update imports.

---

---

# 3. Report Builder

## i18n Violations — 🟢 All components covered

All 33 components inject the lang service. No i18n issues.

### Minor: 2 hardcoded strings remain in drawer components — 🟡 Warning

```
services/report-drawers/detail-layout-drawer/detail-layout-drawer.component.ts  ← 2 strings
services/report-drawers/detail-block-layout-drawer/detail-block-layout-drawer.component.ts  ← 2 strings
```

These are confirmation/dialog messages not routed through the lang file. Move to `reports.lang.ts`.

---

## File Size Violations

### Components — 🔴 Critical (16 over 200 lines)

| File | Lines | Action |
|---|---|---|
| `report-create-layout-modal.component.ts` | **619** | Extract canvas drag logic to `ReportLayoutCanvasService`; split into `LayoutHeaderComponent` + `LayoutCanvasComponent` |
| `report-detail-create-layout-modal.component.ts` | **572** | Extract the `CanvasDragController` (already in `canvas-drag.controller.ts`) usage — component is still doing too much |
| `report-builder-page.component.ts` | **546** | Move toolbar/action logic to `ReportBuilderPageFacade`; this container is acting as a service |
| `report-preview-modal.component.ts` | **544** | Split preview rendering from modal shell; create a `ReportPreviewBodyComponent` |
| `report-custom-layout-modal.component.ts` | **531** | Extract custom-layout builder canvas to its own component |
| `report-detail-layout-builder.component.ts` | **507** | Move layout-builder state to a dedicated `DetailLayoutBuilderFacade` |
| `detail-tab-layout.component.ts` | **432** | Extract tab management + field assignment to separate sub-components |
| `detail-block-layout-drawer.component.ts` | **418** | Split block configuration form into `BlockFieldsComponent` + `BlockStyleComponent` |
| `filters.component.ts` | **402** | Extract filter rule builder to `FilterRuleComponent`; filters list stays in this component |
| `detail-layout-drawer.component.ts` | **349** | Move layout-preview logic to a service |
| `field-config-drawer.component.ts` | **341** | Extract field-specific option panels to per-type sub-components |
| `search-filters-drawer.component.ts` | **337** | Split filter config form from drawer shell |
| `report-right-panel.component.ts` | **313** | Delegate to `QuickViewComponent` + `DetailViewComponent` (already exist as children — let them own their logic) |
| `report-center-preview.component.ts` | **295** | Move virtual-scroll and row-expansion logic to a service |
| `report-create-wizard.component.ts` | **247** | Extract step validation logic to `ReportCreateWizardValidators` |
| `detail-block-layout.component.ts` | **224** | Move block-resize drag logic to `BlockLayoutResizeService` |

### Services — 🔴 Critical (5 services over 300 lines, all severely over)

| File | Lines | Target | Action |
|---|---|---|---|
| `report-preview-data.service.ts` | **795** | 300 | Split into `ReportPreviewQueryService` (fetching) + `ReportPreviewTransformService` (mapping/pivoting) |
| `report-builder-facade.service.ts` | **594** | 300 | This is a facade, not a service — move to a proper `facades/` folder and split into `ReportBuilderStateFacade` + `ReportBuilderActionFacade` |
| `report-preview-builder.service.ts` | **536** | 300 | Split into `ReportPreviewStyleService` (already at 221 lines) and `ReportPreviewDataService` (already split above) |
| `report-preview-detail.service.ts` | **491** | 300 | Split detail-view expansion logic from main preview service |
| `report-detail-layout.service.ts` | **329** | 300 | Extract grid calculation helpers to `report-layout.util.ts` |

### Lang file — 🟡 Warning

| File | Lines |
|---|---|
| `lang/reports.lang.ts` | **646** |

Split into `reports-list.lang.ts`, `reports-preview.lang.ts`, `reports-layout.lang.ts`.

---

## OOP Violations

### No `facades/` folder — 🟡 Warning

Report-builder has no `facades/` directory. `report-builder-facade.service.ts` and `report-preview-facade.service.ts` live in `services/` with a `.facade.` naming that breaks the directory convention every other feature uses.

**Fix:** Create `facades/` folder, move both files, rename to drop `.service` suffix (`report-builder.facade.ts`, `report-preview.facade.ts`). Update barrel exports.

---

---

# 4. Datasources

## i18n Violations — 🟢 All components covered

12 of 14 components inject the lang service. No meaningful i18n gaps.

---

## File Size Violations

### Services — 🔴 Critical (8 services over 300 lines)

The datasources service layer has the most severe size violations in the codebase, made worse by the inheritance chain (see OOP section below). Every abstract class is both a service and a slice of a megaclass.

| File | Lines | Target | Action |
|---|---|---|---|
| `external-apis-facade.service.ts` | **423** | 300 | This is a facade — move to `facades/external-apis.facade.ts` |
| `datasources-query.service.ts` | **384** | 300 | Extract query-building helpers to `datasources-query.util.ts` |
| `datasources-editor-support.service.ts` | **380** | 300 | Extract editor UI helpers to a `datasources-editor-ui.util.ts` |
| `external-apis-seed.service.ts` | **374** | 300 | Move seed fixture data to a `external-apis-seed.data.ts` constant file |
| `datasources-management.service.ts` | **370** | 300 | Split CRUD from lifecycle management |
| `datasources-external-storage.service.ts` | **362** | 300 | Extract storage-schema helpers to a util |
| `datasources-config-ui.service.ts` | **361** | 300 | Split config-form generation from config-form validation |
| `datasources-config-support.service.ts` | **316** | 300 | Extract connection-test helpers to a util |

---

## OOP Violations — 🔴 Critical

### 15-level circular-style linear inheritance chain in `services/`

The entire datasources service layer is structured as one mega-class split across 15 abstract base classes that extend each other linearly. The final `DatasourcesFacadeService` inherits from everything:

```
DatasourcesFacadeService
  extends DatasourcesWorkspaceService
    extends DatasourcesStorageService
      extends DatasourcesExternalHelpersService
        extends DatasourcesExternalStorageService
          extends DatasourcesConfigSupportService
            extends DatasourcesEditorSupportService
              extends DatasourcesQueryService
                extends DatasourcesManagementService
                  extends DatasourcesConfigUiService
                    extends DatasourcesExternalConfigFacadeSlice
                      extends DatasourcesWorkspacePreviewFacadeSlice
                        extends DatasourcesStateFacadeSlice
                          ... (2 more levels)
```

**Why this is a problem:**
- Angular's DI cannot partially inject a node in the middle of the chain — you always get the entire mega-class. This makes unit testing impossible without instantiating all 15 slices.
- Any change in a lower-level service forces re-testing of every class above it.
- Two of the chain members (`DatasourcesQueryService` extends `DatasourcesManagementService` which extends `DatasourcesConfigUiService`) create a **dependency direction that goes upward** — query knowledge depending on management knowledge depending on UI knowledge — violating the Single Responsibility Principle.

**Fix (incremental):**
1. Stop the chain growing further immediately.
2. Identify the three logical domains within the chain: **Storage/Persistence**, **Query/Editor**, **Config/UI**.
3. Refactor into three independent services (`DatasourcesStorageService`, `DatasourcesQueryService`, `DatasourcesConfigService`) that are composed — not inherited — inside `DatasourcesFacadeService`.
4. Move facade slices currently living in `services/` to the existing `facades/` folder.

---

---

# 5. Workflow Builder

## i18n Violations — 4 components missing — 🟡 Warning

```
containers/workflow-editor/workflow-editor.component.ts
containers/workflow-functions/workflow-functions.component.ts
containers/workflow-events/workflow-events.component.ts
containers/workflow-action-buttons/workflow-action-buttons.component.ts
```

All four are container-level components that render visible headings, empty-state messages, and button labels. They must inject the i18n service.

---

## File Size Violations

### Components — 🔴 Critical (8 over 200 lines)

| File | Lines | Action |
|---|---|---|
| `components/config-panel/workflow-node-config-panel/workflow-node-config-panel.component.ts` | **592** | Extract per-node-type config panels as separate components; this component is a monolithic dispatcher |
| `containers/workflow-editor/workflow-editor.component.ts` | **544** | Move canvas-interaction logic entirely to `WorkflowEditorGraphService` (already at 204 lines — expand it); component should only handle keyboard/mouse events |
| `containers/workflow-scheduler/workflow-scheduler.component.ts` | **501** | Extract schedule-preview and schedule-form into separate sub-components |
| `containers/workflow-functions/workflow-functions.component.ts` | **225** | Move function-list state to facade |
| `components/config-panel/workflow-rule-builder/workflow-rule-builder.component.ts` | **221** | Extract rule-condition rows to a `RuleConditionRowComponent` |
| `containers/workflow-events/workflow-events.component.ts` | **220** | Move event-filter state to facade |
| `containers/workflow-action-buttons/workflow-action-buttons.component.ts` | **211** | Move action-button CRUD to facade |
| `components/scheduler/workflow-schedule-form/workflow-schedule-form.component.ts` | **208** | Extract cron-builder UI to `WorkflowCronBuilderComponent` |

### Services — 🔴 Critical

| File | Lines | Target | Action |
|---|---|---|---|
| `services/workflow-builder-facade.service.ts` | **664** | 400 (facade) | Rename to `workflow-builder.facade.ts`, move to a `facades/` folder, split into `WorkflowBuilderStateFacade` + `WorkflowBuilderCommandFacade` |

---

## OOP / Structure Violations

### Lang file stored in `services/` not `lang/` — 🟡 Warning

```
services/workflow-language.ts    ← 1199 lines, living in wrong folder
lang/workflow-builder.en.ts      ← just re-exports from services/workflow-language.ts
```

The actual lang content is in `services/workflow-language.ts` (1199 lines). The `lang/` folder is a hollow proxy. This violates the pattern every other feature follows.

**Fix:**
1. Move `workflow-language.ts` to `lang/workflow-language.ts` (or split it, see below).
2. Update `workflow-builder.en.ts` to import from `../lang/workflow-language`.
3. Remove the `services/workflow-language.ts` file.

### Lang file is excessively large — 🟡 Warning

| File | Lines |
|---|---|
| `services/workflow-language.ts` | **1199** |

Split by domain: `workflow-editor.lang.ts`, `workflow-nodes.lang.ts`, `workflow-scheduler.lang.ts`, `workflow-events.lang.ts`. Re-export all from `lang/index.ts`.

---

---

# Cross-Cutting Issues

## Transloco not yet wired — 🔴 Blocker for i18n rollout

Per the i18n approach doc, Transloco is the chosen library. None of the five features currently use `*transloco` directive or `TranslocoService` — they use a custom `injectXxxTranslate()` pattern wrapping a static constant object. This pattern does **not** support:
- Runtime language switching
- Fallback language resolution
- CI key extraction via `transloco-keys-manager`

**This is not a per-feature violation but an architecture decision that must be made before any feature migration is considered "done."** The `provideQuantaTransloco()` setup described in the i18n doc needs to be wired into `app.config.ts` and each feature migrated to use the structural directive/pipe/service pattern.

---

## Recommended Fix Priority

| Priority | Action |
|---|---|
| P0 | Datasources: stop the inheritance chain from growing further |
| P0 | Form-builder: break the 33-level inheritance chain |
| P1 | Page-builder: cover all 23 missing components with lang |
| P1 | Report-builder: create `facades/` folder and move facade services |
| P1 | Workflow-builder: move lang file out of `services/` |
| P2 | Page-builder: split the 7 oversized facades |
| P2 | Report-builder: split the 5 oversized services |
| P2 | Workflow-builder: split `workflow-builder-facade.service.ts` |
| P3 | Form-builder: cover remaining 13 components with lang |
| P3 | All: wire Transloco properly as per i18n approach doc |

