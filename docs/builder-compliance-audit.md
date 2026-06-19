# Builder Features — Compliance Audit (PR Review Style)

**Date:** 2026-06-08  
**Scope:** `form-builder`, `report-builder`, `page-builder`, `datasources`, `workflow-builder` under `apps/builder/src/app/features/`  
**References:** `docs/Frontend_UI_Components_Guide.md`, `docs/quanta-ops-ui-ux-guidelines.md`, `docs/i18n-localization-approach.md`, `docs/ARCHITECTURE.md`

**Line-count targets (from team rules):**

| Artifact | Target |
|----------|--------|
| Components (`.component.ts`) | < 200 lines |
| Facades (`.facade.ts`, `*-facade.service.ts`) | < 400 lines |
| Services (`.service.ts`, API-only) | < 300 lines |

---

## Executive summary

| Builder | Severity | Top issues |
|---------|----------|------------|
| **Form Builder** | Low | Remediation Phases 1–3 + 6 complete; optional preview mixin refactor deferred; config/seed still use `form-builder.en.ts` at module load |
| **Report Builder** | **High** | 14 oversized components; facade service 536 lines; 5 preview services > 300 lines; container page 490 lines |
| **Page Builder** | **High** | 5 facades > 400 lines (max 734); chart widgets 728–752 lines; mega-templates (941-line HTML) |
| **Datasources** | Medium | 6 services > 300 lines; deep-import of tokens SCSS; `external-apis-facade.service.ts` misnamed |
| **Workflow Builder** | **High** | `workflow-language.ts` 1,178 lines; facade 600 lines; 3 containers > 400 lines |

**Cross-cutting wins:** No `*ngIf`/`*ngFor`, no `ngModel`, no `NgModule`, no `BehaviorSubject` in components, no `document.querySelector`, standalone + `OnPush` widely adopted, `qo-*` components used in most builder surfaces, Transloco scopes wired in `app.routes.ts`.

**Cross-cutting gaps:** Dual i18n pattern (`.en.ts` + `en.json`); no `es.json` locale files; raw `<button>`/`<input>` in widget preview surfaces; inline `[style.*]` bindings; hardcoded px in some SCSS; OOP/facade layering inconsistent (god facades, state in misnamed services).

---

## 1. Form Builder

**Path:** `apps/builder/src/app/features/form-builder/`

### 1.1 File size

| Status | File | Lines | Limit | Action |
|--------|------|-------|-------|--------|
| OK | All `*.component.ts` files | ≤ 200 | 200 | — |
| OK | `services/form-builder-page.facade.ts` | ~250 | 400 | **Done (Phase 2):** moved to `services/`; UI state uses signals + `computed()`. |
| OK | `handlers/inspector-query.handlers.ts` + `inspector-mutation.handlers.ts` | split | 200* | **Done (Phase 2):** policy/read vs mutation layers. |
| Warn | `services/form-builder.facade.ts` | 262 | 400 | OK for facade target; keep API-only logic out |
| Warn | `content/base/form-preview-content-media.base.ts` | 218 | 200* | Extract upload vs display concerns into separate bases |
| Info | `lang/form-builder.en.ts` | 589 | — | Not a component; migrate remaining consumers to JSON-only |
| Warn | `config/.../form-builder-field-properties.config.ts` | 268 | — | Split per field category or generate from schema |

\*Base/handler files are not components but violate the spirit of the 200-line component rule.

**Oversized templates (split into sub-components):**

| File | Lines | Action |
|------|-------|--------|
| `containers/form-field-inspector/sections/form-field-inspector-identity-section.component.html` | 212 | Extract repeated option rows into dumb child components |
| `containers/form-field-inspector/sections/form-field-inspector-date-media-section.component.html` | 203 | Same |

### 1.2 Architecture & OOP (ARCHITECTURE.md + Frontend guide §7)

| Issue | Location | What to do |
|-------|----------|------------|
| ~~**Duplicate feature trees (critical)**~~ | ~~`components/form-create-wizard/` + `containers/form-create-wizard/`~~ | **Done (Phase 1, 2026-06-08):** stale `components/` copies removed; canonical paths under `containers/`. |
| ~~**Duplicate feature trees (critical)**~~ | ~~`components/form-field-inspector/` + `containers/form-field-inspector/`~~ | **Done (Phase 1):** same as above. Barrel exports: `components/index.ts`, `containers/index.ts`. |
| ~~Facade in wrong folder~~ | ~~`containers/form-builder-page.facade.ts`~~ | **Done (Phase 2):** now `services/form-builder-page.facade.ts`. |
| Facade inside component folder | `components/form-preview-modal/state/form-preview-modal.facade.ts` | Acceptable for sub-feature modal, but document as sub-facade; ensure it does not hold app-level state. |
| Mixin chain complexity | `form-preview-modal/content/base/*.base.ts` (51 files) | OOP via mixins works but is hard to navigate. Prefer composition (small injectable strategy services per field family) for new code. |
| Preview uses raw controls | `preview-controls-*.component.html` (phone, media, date-time, rich-text) | Expected for **runtime form simulation**, but document exception. Where possible wrap with `qo-form-field` + `qo-input` for builder chrome consistency. |

### 1.3 i18n (`i18n-localization-approach.md`)

| Issue | Location | What to do |
|-------|----------|------------|
| ~~Preview direct lang import~~ | ~~`form-preview-content-state-inputs.base.ts`~~ | **Done (Phase 3, 2026-06-08):** preview mixin bases use `FormBuilderI18nService.t()`; no `FORM_BUILDER_LANG` in preview subtree. |
| Dual source of truth | `lang/form-builder.en.ts` (589 lines) **and** `assets/i18n/form-builder/en.json` | Configs/seed still import `.en.ts` at module load (acceptable). Templates use Transloco; run `npm run i18n:sync-form-builder` after lang edits. |
| Custom `t()` wrapper vs directive | `FormBuilderI18nService` + `TranslocoPipe` in some templates | Prefer `*transloco` in large templates per i18n doc §5; keep service for `.ts` configs only. |
| Missing second locale | No `assets/i18n/form-builder/es.json` | Add when second locale is chosen. |

### 1.4 UI / UX

| Issue | Location | What to do |
|-------|----------|------------|
| Inline styles in preview | `preview-controls-rich-text.component.html`, canvas widgets | Move dynamic styles to SCSS classes + CSS variables where values are token-backed. |
| Good | `form-builder-page`, modals, wizards | Use `qo-button`, `qo-form-field`, `qo-stepper`, `QoConfirmDialogService`. |

---

## 2. Report Builder

**Path:** `apps/builder/src/app/features/report-builder/`

### 2.1 File size — Components (> 200)

| File | Lines | Action |
|------|-------|--------|
| `components/report-preview-modal/report-preview-modal.component.ts` | 522 | Split: toolbar, table host, detail drawer as children; keep modal as shell |
| `components/report-detail-create-layout-modal/report-detail-create-layout-modal.component.ts` | 518 | Extract canvas drag-drop into `report-layout-canvas.component.ts` + facade |
| `containers/report-builder-page.component.ts` | 490 | **Container doing too much** — move orchestration to `report-builder-page.facade.ts`; page should compose children only |
| `components/report-custom-layout-modal/report-custom-layout-modal.component.ts` | 490 | Split layout picker vs preview pane |
| `components/report-detail-layout-builder/report-detail-layout-builder.component.ts` | 467 | Extract block renderer components |
| `components/report-create-layout-modal/report-create-layout-modal.component.ts` | 551 | Same pattern as detail-create modal |
| `components/report-drawers/detail-block-layout-drawer/detail-block-layout-drawer.component.ts` | 379 | Split drawer shell vs block editor |
| `components/report-left-panel/filters/filters.component.ts` | 342 | Extract `FilterRuleRowComponent` (one rule = one dumb component) |
| `components/report-drawers/detail-layout-drawer/detail-layout-drawer.component.ts` | 316 | Split |
| `components/report-drawers/field-config-drawer/field-config-drawer.component.ts` | 303 | Split field list vs field editor |
| `components/report-drawers/search-filters-drawer/search-filters-drawer.component.ts` | 296 | Split |
| `components/report-right-panel/report-right-panel.component.ts` | 287 | Split quick-view vs detail-view tabs |
| `components/report-center-preview/report-center-preview.component.ts` | 255 | Extract table vs empty state |
| `components/detail-tab-layout/detail-tab-layout.component.ts` | 393 | Extract tab chrome vs field grid |
| `components/report-create-wizard/report-create-wizard.component.ts` | 211 | Minor — extract step panels |

**Oversized templates:** `report-preview-modal.component.html` (616), `report-detail-create-layout-modal.component.html` (443), `report-create-layout-modal.component.html` (367), `report-center-preview.component.html` (347), `report-custom-layout-modal.component.html` (325).

### 2.2 File size — Facades / state services (> 400)

| File | Lines | Action |
|------|-------|--------|
| `services/report-builder-facade.service.ts` | **536** | God object: holds columns, filters, layouts, joins, UI tabs. Split into `report-builder-state.facade.ts` (data) + `report-builder-ui.facade.ts` (panels/modals) or domain slices (filters, layouts, preview). |
| `services/report-preview-data.service.ts` | **726** | **Misnamed** — contains state + transformation. Rename to `report-preview-data.facade.ts` and split: data fetch vs row shaping vs grouping. |
| `services/report-preview-builder.service.ts` | 493 | Extract HTML/PDF export builders to separate utilities |
| `services/report-preview-detail.service.ts` | 447 | Split detail layout resolution from record hydration |

### 2.3 File size — Services (> 300)

| File | Lines | Action |
|------|-------|--------|
| `services/report-detail-layout.service.ts` | 306 | Split persistence vs in-memory layout editing |
| `services/report-seed-factory.service.ts` | 322 | Acceptable for seed data; move static seed to JSON assets |

### 2.4 Architecture & OOP

| Issue | Location | What to do |
|-------|----------|------------|
| State in services | `report-preview-*.service.ts` family | Per ARCHITECTURE §9: services = API only; move signals to facades. |
| Facade naming | `ReportBuilderFacadeService` in `services/` | Rename file to `report-builder.facade.ts` for consistency with page-builder. |
| Container providers anti-pattern | `report-builder-page.component.ts` provides `ReportPreviewService`, `ReportQuickLayoutService`, etc. | Register at route or feature level; avoid re-instantiating per page mount. |
| Business logic in container | `report-builder-page.component.ts` (490 lines) | Extract handlers to facade; container binds signals only. |
| Duplicate lang modules | `lang/reports.lang.ts` (646), `lang/reports.en.ts`, `assets/i18n/report-builder/en.json` | Consolidate to Transloco JSON + `ReportBuilderI18nService` wrapper only. |

### 2.5 i18n

| Issue | Action |
|-------|--------|
| Templates use `t()` via service (OK pattern) but not `*transloco` | Large modals should use structural directive per i18n doc |
| `reports.lang.ts` still imported in utils/config | Replace with keys; delete legacy file |
| No `es.json` | Add when locale finalized |

### 2.6 UI / UX

| Issue | Location | What to do |
|-------|----------|------------|
| Good filter panel | `filters.component.ts` | Uses `qo-select`, `qo-button`, reactive forms; documented UX §13.6 deviation |
| Inline dynamic styles | `report-center-preview.component.html`, layout modals | Replace with token-backed CSS classes |
| Hardcoded px in SCSS | `detail-tab-layout.component.scss` (14 hits) | Replace with `var(--qo-space-*)` |
| Missing `qo-empty-state` | Verify all empty report lists | Audit preview/table zero states |

---

## 3. Page Builder

**Path:** `apps/builder/src/app/features/page-builder/`

### 3.1 File size — Components (> 200)

| File | Lines | Action |
|------|-------|--------|
| `widget-showcase/chart/chart-thumbnail.component.ts` | **752** | Split chart registry, thumbnail renderer, and data binding |
| `widget-showcase/chart/chart-live-widget.component.ts` | **728** | Split live preview vs chart config resolver |
| `widget-showcase/media/ui-media/ui-media-widget.component.ts` | 386 | Split upload/capture vs display |
| `panel-config/core/panel-config.component.ts` | 328 | Shell only — delegate each widget tab to existing settings panels |
| `panel-config/text-block/text-block-settings-panel.component.ts` | 313 | Extract rich-text vs plain-text settings |
| `widget-showcase/select/ui-select/ui-select-widget.component.ts` | 238 | Extract option binding UI |
| `widget-showcase/panel/panel-showcase.component.ts` | 222 | Minor split |
| `panel-config/widget-configs/button-widget-config.component.ts` | 220 | Minor split |

**Critical templates:**

| File | Lines | Action |
|------|-------|--------|
| `containers/page-builder-edit-page.component.html` | **941** | **Blocker-level** — split into layout zones: left palette, canvas, right overlay (per UX §13.3) |
| `panel-config/core/panel-config.component.html` | 655 | One tab per child component; shell uses `@switch` + lazy children |
| `containers/page-builder-page.component.html` | 492 | Extract page list panel, header, status |
| `panel-config/button/button-style-panel.component.html` | 276 | Split color vs typography vs layout sections |

### 3.2 File size — Facades (> 400)

| File | Lines | Action |
|------|-------|--------|
| `facades/page-canvas.facade.ts` | **734** | Split: selection/drag-drop, widget graph, snap/grid, clipboard |
| `facades/page-builder-panel-session.facade.ts` | **674** | Split per overlay session type (panel-config vs preview) |
| `facades/panel-config/chart-settings.facade.ts` | 594 | Split data binding vs display vs axis config |
| `facades/panel-config/table-settings.facade.ts` | 492 | Split column config vs datasource binding |
| `facades/page-builder-page.facade.ts` | 477 | Split page list CRUD vs publish workflow |
| `facades/panel-config/panel-settings.facade.ts` | 409 | Trim or split panel chrome vs content slots |

**Also watch:** `models/page-builder-canvas.model.ts` (932 lines) — move to `libs/models` or split by widget type.

### 3.3 File size — Services (> 300)

| File | Lines | Action |
|------|-------|--------|
| `services/page-builder-data-binding.service.ts` | 382 | Split registry lookup vs expression evaluation |
| `services/page-builder-mock-datasource.service.ts` | 367 | Move mock data to JSON fixtures |
| `services/widget-defaults.service.ts` | 342 | Split per widget family |

### 3.4 Architecture & OOP

| Issue | Location | What to do |
|-------|----------|------------|
| Too many facades | `facades/` + `widget-showcase/**/**.facade.ts` | Define ownership: one feature facade composes sub-facades; avoid components injecting 3+ facades. |
| Custom widget primitives | `widget-showcase/button/ui-button/` | **Required** for canvas runtime preview, but must not replace `qo-button` in builder chrome. Document boundary. |
| Facade inside component tree | `ui-table/ui-table.facade.ts`, `ui-text-block.facade.ts` | OK for widget encapsulation if scoped to widget subtree. |
| `panel-widget-resolution.util.ts` | 416 lines | Move to service or strategy registry class |

### 3.5 i18n

| Issue | Action |
|-------|--------|
| `lang/page-builder.en.ts` (806 lines) + `assets/i18n/page-builder/en.json` | Complete JSON migration |
| Good | Many panel templates use `TranslocoPipe` / `*transloco` |
| Missing `es.json` | Add second locale file |

### 3.6 UI / UX

| Issue | Location | What to do |
|-------|----------|------------|
| Raw `<button>` / `<input>` in showcase widgets | `ui-search`, `ui-select`, `ui-media`, `ui-table` templates | Acceptable for **end-user widget preview**; builder config panels must stay on `qo-*` |
| Inline `[style.*]` | `page-builder-page.component.html` (13), `ui-panel-widget-renderer` (32) | Use CSS variables set on host for user theming |
| Hex fallbacks in SCSS | `page-builder-form-preview-page.component.scss` | Remove `#dc2626` fallbacks; use tokens only |
| Hardcoded px | `detail-tab-layout` pattern in page-builder SCSS files | Tokenize |
| Good | Config panels | `qo-color-picker`, `qo-toggle`, `qo-tabs` widely used |

---

## 4. Datasources

**Path:** `apps/builder/src/app/features/datasources/`

### 4.1 File size

| File | Lines | Type | Action |
|------|-------|------|--------|
| `services/external-apis-facade.service.ts` | 368 | **Facade** (misnamed) | Rename to `external-apis.facade.ts`; move to `facades/` |
| `services/datasources-editor-support.service.ts` | 356 | Service | Split editor UI helpers vs API adapters |
| `services/external-apis-seed.service.ts` | 341 | Service | Move seed JSON to assets |
| `services/datasources-query.service.ts` | 339 | Service | Split query execution vs result mapping |
| `services/datasources-management.service.ts` | 337 | Service | Split CRUD vs connection testing |
| `services/datasources-external-storage.service.ts` | 309 | Service | At limit — monitor |
| `components/dynamic-integration-form/dynamic-integration-form.component.ts` | 203 | Component | Minor — extract field-type renderers |

**Facades (within limit but dense):** `datasources-state.facade.ts` (233), `datasources-workspace-preview.facade.ts` (285).

**Oversized templates:** `datasource-config-options.component.html` (370), `datasource-config-connection.component.html` (210).

### 4.2 Architecture & OOP

| Issue | Location | What to do |
|-------|----------|------------|
| Deep import of tokens | `components/datasource-card/datasource-card.component.scss` → `libs/ui-components/src/styles/tokens` | Import via shared builder styles entry or `@qo/ui-components` public style path per Frontend guide §8 |
| `pages/` folder | `pages/datasources-dashboard-page.component.ts` | Merge into `containers/` per standard feature layout |
| Multiple facades | `facades/datasources-*.facade.ts`, `external-apis-*.facade.ts` | Document which facade owns connection vs query vs external API state |
| Good | Containers | `datasources-page`, `datasource-config` use `qo-*` heavily |

### 4.3 i18n

| Issue | Action |
|-------|--------|
| `lang/datasources-lang.ts` (587 lines) + `datasources.en.ts` + `en.json` | Triple source — consolidate to JSON |
| Templates use `t()` via `DatasourcesI18nService` | OK; add `*transloco` to large config templates |
| No `es.json` | Add second locale |

### 4.4 UI / UX

| Issue | Action |
|-------|--------|
| Good | Connection/options forms use `qo-form-field`, `qo-input`, `qo-select` |
| Config template size | Split `datasource-config-options` into section components (SSL, pooling, advanced) |

---

## 5. Workflow Builder

**Path:** `apps/builder/src/app/features/workflow-builder/`

### 5.1 File size — Components (> 200)

| File | Lines | Action |
|------|-------|--------|
| `components/config-panel/workflow-node-config-panel/workflow-node-config-panel.component.ts` | 501 | Split per node category (trigger / action / data / notification) |
| `containers/workflow-editor/workflow-editor.component.ts` | 471 | Editor shell only — canvas, sidebar, topbar already exist as children; move orchestration to facade |
| `containers/workflow-scheduler/workflow-scheduler.component.ts` | 443 | Split list vs form vs preview |
| `containers/workflow-functions/workflow-functions.component.ts` | 207 | Minor |

### 5.2 File size — Facades / state (> 400)

| File | Lines | Action |
|------|-------|--------|
| `services/workflow-builder-facade.service.ts` | **600** | Split: workflows list, editor graph, scheduler, functions, form-actions |
| `services/workflow-language.ts` | **1,178** | **Not a service** — move to `assets/i18n/workflow-builder/en.json`; keep thin `WorkflowBuilderI18nService` |

### 5.3 File size — Other large files

| File | Lines | Action |
|------|-------|--------|
| `models/workflow-nodes/notification.nodes.ts` | 374 | OK as data; ensure no runtime logic |
| `models/workflow-nodes/form-action.nodes.ts` | 329 | Same |

### 5.4 Architecture & OOP

| Issue | Location | What to do |
|-------|----------|------------|
| Monolithic language object | `workflow-language.ts` | Violates i18n single source of truth; blocks runtime locale switch for 1,000+ strings |
| Node models + language mixed concerns | `models/workflow-nodes/*.ts` | Keep node **definitions** in TypeScript; move **labels** to i18n keys |
| Good decomposition | `workflow-editor-*` services (canvas, connection, persistence, run) | Proper SRP — extend this pattern to other subsystems |
| Good | Most sub-containers | Transloco + `WorkflowBuilderI18nService` |

### 5.5 i18n

| Issue | Action |
|-------|--------|
| `workflow-language.ts` vs `assets/i18n/workflow-builder/en.json` | Migrate all `WORKFLOW_LANGUAGE` consumers to Transloco keys; delete TS blob |
| Good | `provideTranslocoScope('workflow-builder')` on routes | Keep |
| Raw HTML in scheduler | `workflow-schedule-form.component.html` uses native inputs in places | Wrap with `qo-form-field` + `qo-input` / `qo-select` |

### 5.6 UI / UX

| Issue | Action |
|-------|--------|
| Good | Modals, tables use `qo-button`, `qo-form-field` |
| Editor template 210 lines | Split zoom controls / sidebar / canvas host (children already exist — wire thinner parent template) |

---

## 6. Cross-cutting violations

### 6.1 i18n approach compliance

| Rule | Status |
|------|--------|
| No hardcoded UI strings | **Partial** — legacy `*.lang.ts` / `*.en.ts` / `workflow-language.ts` still hold hundreds of strings |
| One scope per feature + `en.json` | **Partial** — JSON exists for all 5 features but TS duplicates remain |
| `*transloco` directive-first in large templates | **Partial** — form/page/workflow migrating; report/datasources rely on `t()` binding |
| Second locale (`es.json`) | **Missing** for all feature scopes |
| CI `i18n:find` enforcement | **Not verified** — recommend wiring per rollout plan §11 |

### 6.2 Frontend UI guide — “Do not do” checklist

| Banned pattern | Found? |
|----------------|--------|
| `NgModule` | No |
| `*ngIf` / `*ngFor` | No |
| `ngModel` | No |
| `BehaviorSubject` in components | No |
| `console.log` | No |
| `any` (production) | Rare — a few `as any` in inspector sections (fix typing) |
| Deep `libs/` imports | Yes — datasources SCSS token imports |
| Business logic in dumb components | Yes — report/page oversized components |
| State in API services | Yes — report preview services, external-apis-facade |

### 6.3 OOP / SOLID summary

| Principle | Assessment |
|-----------|------------|
| **SRP** | Violated by god facades (`page-canvas`, `report-builder-facade`, `workflow-builder-facade`, `report-preview-data`) |
| **OCP** | Form preview mixin chain is extensible but opaque; prefer strategy registry for new field types |
| **DIP** | Generally good — components inject facades/services via `inject()` |
| **Facade pattern** | Intended pattern present but inconsistently named (`*.service.ts` holding state) |
| **Dumb vs smart components** | Violated when containers exceed 400+ lines and components inject domain services |

---

## 7. Recommended remediation order

### P0 — Blockers (do first)

1. **Remove duplicate form-builder trees** (`form-create-wizard`, `form-field-inspector`) — pick `containers/` canonical paths.
2. **Split `page-builder-edit-page.component.html` (941 lines)** and **`report-builder-page` container (490 lines)**.
3. **Migrate `workflow-language.ts` (1,178 lines)** to `assets/i18n/workflow-builder/en.json`.

### P1 — High impact

4. Decompose **`page-canvas.facade.ts` (734)** and **`report-preview-data.service.ts` (726)**.
5. Split **chart-live-widget** and **chart-thumbnail** (728–752 lines).
6. Consolidate **dual i18n** (`*.en.ts` + `en.json`) per feature; delete legacy lang TS files.
7. Rename state-holding `*-facade.service.ts` files to `*.facade.ts` and move to `facades/`.

### P2 — Quality / consistency

8. Tokenize hardcoded **px** in report `detail-tab-layout` and page-builder preview SCSS.
9. Remove **hex fallbacks** in `page-builder-form-preview-page.component.scss`.
10. Fix **deep token imports** in datasources SCSS.
11. Add **`es.json`** (or chosen locale) for all five scopes.
12. Enable **`i18n:find` in CI** once P0 i18n migrations land.

---

## 8. Form Builder remediation status (2026-06-08)

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1 — Cleanup | **Done** | Duplicate trees removed; barrel exports; import paths cleaned |
| Phase 2 — Architecture | **Done** | `FormBuilderPageFacade` → `services/` + signals; inspector handlers split; effect loop fix |
| Phase 3 — i18n | **Done** | Preview mixin chain migrated to `FormBuilderI18nService` |
| Phase 4 — Preview refactor | Deferred | Mixin → strategy pattern; optional unless adding many field types |
| Phase 6 — Verification | **Done** | `i18n:audit-all` + `nx build builder` pass; form-builder test harness added |

**Manual smoke test** (user-confirmed): form builder loads without hang; clicks and inspector property edits work.

---

## 9. What is already in good shape

- Angular 18 patterns: standalone components, signals, `input()`/`output()`, functional routes, `OnPush`, reactive forms.
- Shared UI library adoption: `qo-button`, `qo-form-field`, `qo-select`, `qo-modal`, `qo-toast`, `qo-confirm-dialog` across builder chrome.
- Transloco infrastructure: `provideQuantaTransloco()`, per-route `provideTranslocoScope()`, feature `en.json` assets, `@qo/lang` common namespace.
- Form builder component sizes: all `*.component.ts` files under 200 lines after recent refactors.
- Form builder remediation: Phases 1–3 complete; preview i18n aligned with `FormBuilderI18nService`.
- Workflow editor: decomposed into focused services (canvas, connections, persistence, run).

---

*Generated by automated line-count scan + pattern grep against project docs. Re-run after major refactors to refresh counts.*
