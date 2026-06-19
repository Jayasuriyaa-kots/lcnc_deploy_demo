# Workflow Builder Implementation Phases

This file tracks the phased implementation plan for `apps/builder/src/app/features/workflow-builder`.

Primary references:

- `docs/workflow-builder-master-implementation.md`
- `docs/Frontend_UI_Components_Guide.md`

## Phase 1: Architecture And Alignment

Goal: make the workflow feature structurally correct before UI-heavy work starts.

Deliverables:

- Reconcile the current `features/workflow-builder` placeholder with the older `pages/workflows` implementation.
- Define one canonical Workflow Builder feature path.
- Create the nested folder structure for containers, components, models, and services.
- Update Builder routing for the workflow module.
- Update `builder-shell.data.ts` so the workflow sections are exactly:
  - Form Actions
  - Events
  - Scheduler
  - Action Buttons
  - Functions
- Wire route-aware workflow sidebar tab navigation.
- Create shared workflow model files in `libs/models`.
- Create dedicated workflow API client scaffolding in `libs/api-client`.
- Create feature-local state and facade service scaffolding.

Expected output:

- Routes compile.
- Workflow feature has a clean structure.
- All types/services are stubbed and ready.
- The old conflicting workflow surface is no longer the source of truth.

Status: Completed.

## Phase 2: Shared UI Foundation

Goal: build the reusable workflow UI layer in `libs/ui-components`.

Shared components to create:

- `workflow-page-header`
- `workflow-toolbar`
- `workflow-status-badge`
- `workflow-card`
- `workflow-mini-canvas`
- `workflow-node`
- `workflow-execution-history`
- `workflow-code-block`

Rules for every shared component:

- Use `standalone: true`.
- Use `ChangeDetectionStrategy.OnPush`.
- Use `input()` and `output()` for component APIs where practical.
- Use `@if` and `@for`, not `*ngIf` or `*ngFor`.
- Keep all styles in `.scss` files.
- Use CSS tokens only.
- Add `.spec.ts` smoke tests.
- Add local `index.ts` exports.
- Export from `libs/ui-components/src/index.ts`.

Expected output:

- Reusable workflow primitives exist.
- Workflow pages can be assembled consistently.
- The visual direction is locked before page-specific buildout.

## Phase 3: State And Facade Layer

Goal: keep business logic out of page components.

Feature services:

- `workflow-builder-state.service.ts`
- `workflow-builder-facade.service.ts`
- `workflow-search-state.service.ts`
- `workflow-modal.service.ts`
- `workflow-canvas-state.service.ts`
- `workflow-validation.service.ts`
- `workflow-mapper.service.ts`

State handled here:

- Active section.
- Search by page.
- Selected workflow.
- Selected run.
- Modal open/close state.
- Schedule form drafts.
- Function editor drafts.
- Mini-canvas data.
- Loading and error states.

Expected output:

- Containers stay thin.
- Feature behavior is centralized and easy to scale.

Status: Scaffolded in Phase 1, to be expanded during page implementation.

## Phase 4: Form Actions Page

Goal: implement the strongest visual page first.

Feature components:

- `workflow-section-nav`
- `workflow-form-action-list`
- `workflow-form-action-card`
- `workflow-trigger-summary`

UI requirements:

- Dot-grid page background.
- Shared page header.
- Shared toolbar row.
- Stacked workflow cards.
- Status badges.
- Trigger summary lines.
- Mini workflow canvas preview.
- Node cards and connectors.
- `Edit Flow` and `Run History` actions.
- Search and count display.

Expected output:

- The first fully realized workflow page matches the reference mockup direction.

## Phase 5: Events And Scheduler

Goal: cover the operational workflow views.

Events components:

- `workflow-events`
- `workflow-event-table`
- `workflow-event-row`
- `workflow-event-trigger-badge`

Events UI requirements:

- One large table card.
- Columns: Event, Trigger, Source, Last Run, Status, Actions.
- Hoverable rows.
- Compact trigger and status badges.
- Muted source text.
- `Edit` action.

Scheduler components:

- `workflow-scheduler`
- `workflow-schedule-list`
- `workflow-schedule-row`
- `workflow-schedule-form`
- `workflow-next-runs-preview`

Scheduler UI requirements:

- Two-column layout.
- Left column: active schedules list.
- Right column: create new schedule form.
- Reactive form fields: Workflow, Frequency, Run on, Time, Timezone.
- Next 3 runs preview.
- Custom compact toggle styling.
- `Save Schedule` button.

Expected output:

- Events and Scheduler are complete and visually aligned with the Workflow Builder design system.

## Phase 6: Action Buttons And Functions

Goal: complete the remaining management surfaces.

Action Buttons components:

- `workflow-action-buttons`
- `workflow-action-button-table`
- `workflow-action-button-row`
- `workflow-button-create-modal`

Action Buttons UI requirements:

- One large table card.
- Columns: Action Name, Linked Workflow, Scope, Source, Used In, Status.
- Scope badge.
- Source in muted mono style.
- Create modal titled `New Button`.
- Reactive modal fields: Name, Action Type, Linked Workflow, Scope.
- Modal footer: Cancel, Create Button.

Functions components:

- `workflow-functions`
- `workflow-function-grid`
- `workflow-function-card`
- `workflow-function-editor-modal`

Functions UI requirements:

- Two-column function card grid.
- Function name.
- Description.
- Language badge.
- Dark monospace code block.
- `Edit` and `Test Run` actions.
- Create/edit modal fields: Name, Language, Function Body.
- Modal footer: Cancel, Create Function or Save Function.

Expected output:

- All five required Workflow Builder sections exist and are visually aligned.

## Phase 7: Polish, Validation, And Verification

Goal: make the feature standards-compliant and stable.

Checklist:

- Use library index imports only.
- Avoid deep imports.
- Use token-based SCSS only.
- Avoid inline styles.
- Use `@if` and `@for`.
- Use reactive forms.
- Keep state in facade/services.
- Keep presentational components dumb.
- Ensure `.spec.ts` files exist for new shared and feature components.
- Update public exports in `libs/models`, `libs/api-client`, and `libs/ui-components`.
- Run Builder type/build verification.
- Fix casing/import issues found during compile.

Verification commands:

```powershell
npx tsc -p apps\builder\tsconfig.app.json --noEmit
```

Expected output:

- Builder app typechecks.
- Workflow Builder follows the master implementation document.
- Workflow Builder follows the frontend UI components guide.
- The feature is ready for backend API integration without redesign.

