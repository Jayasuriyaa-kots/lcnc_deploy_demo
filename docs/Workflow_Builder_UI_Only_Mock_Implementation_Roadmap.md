# Workflow Builder UI-Only Mock Implementation Roadmap

Prepared for the QuantaOps Builder `workflow-builder` feature.

## Purpose

This roadmap defines the plan to complete Workflow Builder as a fully functional frontend module using mock data only.

The scope is UI and frontend interaction behavior. It does not include real backend workflow execution, real schedule processing, real email/API/database actions, collaboration, permissions enforcement, or AI.

This plan should follow:

- `docs/Frontend_UI_Components_Guide.md`
- `docs/quanta-ops-ui-ux-guidelines.md`
- Current Builder reference UI direction from `quantaops-builder app.html`

## Current Status

Workflow Builder already has a strong MVP foundation:

- Workflow navigation sections exist.
- Form Actions, Events, Scheduler, Action Buttons, and Functions sections are scaffolded.
- Canvas editor exists.
- Node registry foundation exists.
- Start and End graph rules exist.
- Right-side config panel shell exists.
- Mock workflow data exists.
- Build and tests are passing.

## Target Outcome

By the end of this roadmap, Workflow Builder should feel complete and demo-ready with mock data.

The UI should support:

- Navigate between Workflow Builder sections.
- Search and filter workflows, events, schedules, action buttons, and functions.
- Create, edit, and delete mock flows.
- Create, edit, and delete mock events.
- Create, edit, and delete mock schedules.
- Create, edit, and delete mock action buttons.
- Create, edit, and delete mock functions.
- Open workflow editor.
- Drag nodes onto canvas.
- Connect nodes.
- Select nodes.
- Configure nodes in the right-side config panel.
- Validate graph.
- Save graph to mock state.
- Mock run workflow.
- Show node execution status.
- Show toasts, inline errors, loading states, empty states, and confirmation dialogs.

## Estimated Timeline

Recommended estimate: **4 weeks for one developer**.

| Scenario | Estimate | Notes |
| --- | ---: | --- |
| Fast demo-ready UI | 2.5-3 weeks | Good for internal walkthroughs, some rough edges accepted. |
| Polished mock UI | 4 weeks | Recommended target. Strong UX, validation, mock flows, and QA. |
| High-confidence production-like frontend | 5 weeks | Includes deeper tests, visual polish, and broader edge states. |

## Scope Boundaries

### Included

- Angular UI implementation.
- Mock data and mock state updates.
- Shared `qo-` UI components.
- Signal/facade-based state.
- Responsive desktop/tablet behavior where required by guidelines.
- Validation UX.
- Mock execution visualization.
- Tests for key UI behaviors.

### Not Included

- Real workflow runtime engine.
- Real API persistence.
- Real schedule runner.
- Real email/API/database execution.
- Real permission enforcement.
- Multi-user collaboration.
- AI workflow generation.
- Marketplace/templates backend.

## Week 1: Workflow Shell and Section Polish

### Goal

Make the Workflow Builder shell and all primary section screens consistent with QuantaOps UI guidelines.

### Tasks

#### 1. Workflow Navigation Polish

- Match the left workflow navigation style from the reference screenshot.
- Improve active states for:
  - Form Actions
  - Events
  - Scheduler
  - Action Buttons
  - Functions
- Standardize icon size, spacing, hover state, and focus state.
- Ensure routes are stable and direct navigation works.

#### 2. Shared Section Layout

- Standardize page header.
- Standardize toolbar.
- Standardize search/filter row.
- Standardize count labels.
- Standardize loading, empty, and error states.
- Use shared components from `@qo/ui-components`.

#### 3. Form Actions Screen

- Polish workflow cards/list.
- Improve `+ New Flow` modal.
- Add mock create/edit/delete interactions.
- Add run history CTA placeholders.
- Add status and trigger summaries.

#### 4. Events Screen

- Complete event table/list.
- Add search.
- Add mock create event modal.
- Add status badges.
- Add trigger/source summaries.

#### 5. Scheduler Screen

- Complete schedule list.
- Add schedule create/edit form.
- Add next-runs preview.
- Add enable/disable toggle.
- Add mock save and delete behavior.

### Week 1 Deliverable

All primary Workflow Builder sections render cleanly, follow the QuantaOps visual style, and feel consistent with the reference Builder shell.

## Week 2: Action Buttons, Functions, and Mock Interactions

### Goal

Make supporting workflow tools complete and interactive with mock data.

### Tasks

#### 1. Action Buttons Screen

- Complete action button table/list.
- Add new action modal.
- Add edit action modal.
- Add delete confirmation.
- Add fields:
  - Action Name
  - Action Type
  - Linked Workflow
  - Scope
  - Source
  - Used In
  - Status
- Add mock save, delete, and status changes.

#### 2. Functions Screen

- Polish function cards/grid.
- Add function editor modal.
- Add language selector:
  - JavaScript
  - Python
- Add mock code editor area.
- Add search/filter.
- Add mock save, test, duplicate, and delete actions.

#### 3. Mock State Improvements

- Move mock create/update/delete behavior into facade/state services.
- Keep containers responsible for orchestration.
- Keep presentational components input/output driven.
- Add consistent fake async delays for save actions.
- Add consistent toast messages.

#### 4. Validation UX for Forms and Modals

- Add inline field errors.
- Mark required fields.
- Disable submit buttons where appropriate.
- Show loading state for fake async operations.
- Use `QoToastService` for success/failure messages.

### Week 2 Deliverable

Users can create, edit, delete, search, and filter mock workflow actions, schedules, functions, events, and flows.

## Week 3: Workflow Editor Canvas Completion

### Goal

Make the workflow canvas feel like a real low-code workflow editor.

### Tasks

#### 1. Canvas Visual Polish

- Improve node card styling.
- Show node category.
- Show node icon.
- Show node status.
- Show selected state.
- Show invalid state.
- Show terminal End state.
- Improve connector handles.
- Improve grid background.

#### 2. Canvas Toolbar

Add a clear editor toolbar with:

- Save
- Validate
- Mock Run/Test
- Zoom controls
- Back
- Workflow status
- Version indicator

#### 3. Node Library Polish

- Add node search.
- Keep registry-driven category groups.
- Add empty state for filtered results.
- Prepare for builder-specific filtering with `allowedBuilders`.
- Keep Start hidden from palette.
- Keep End visible.

#### 4. Connection UX

- Improve SVG connection lines.
- Add branch labels for Condition and Channel Switch.
- Prevent invalid connections visually.
- Show feedback when blocked:
  - Start incoming blocked.
  - End outgoing blocked.
  - duplicate edge blocked.
  - self-connection blocked.

#### 5. Start and End UX

- Show locked indicator for Start.
- Show terminal indicator for End.
- Improve graph validation messages.
- Make Start and End behavior obvious without extra explanation.

### Week 3 Deliverable

The workflow editor is demo-ready: drag, select, connect, configure, validate, and save with mock data.

## Week 4: Config Panel, Validation UX, Mock Execution, and QA

### Goal

Make node configuration and workflow validation feel complete.

### Tasks

#### 1. Config Panel Field Renderer

Improve schema-driven rendering for:

- Text
- Number
- Textarea
- Select
- Toggle
- Key-value editor
- JSON editor
- Mapping placeholder
- Rule builder placeholder
- Email list editor placeholder
- File mapping placeholder

#### 2. Config Panel Validation

- Show required-field errors.
- Add tab-level error indicators.
- Add node-level invalid status.
- Block save when required config is missing.
- Show the first actionable validation issue in toast.

#### 3. Mock Save State

- Track dirty state.
- Show saved/unsaved indicator.
- Add fake save delay.
- Show loading state on save buttons.
- Persist graph updates to mock state.

#### 4. Mock Execution UX

- Add mock run button.
- Highlight nodes in sequence.
- Show node states:
  - pending
  - running
  - success
  - failed
- Add mock run history panel or placeholder.
- Add retry placeholder for failed nodes.

#### 5. Final QA

- Run `npx nx build builder`.
- Run `npx nx test builder --watch=false`.
- Verify desktop layout at 1280px+.
- Verify tablet behavior where applicable.
- Review token-only SCSS.
- Remove raw colors and hardcoded spacing where possible.
- Check focus states and ARIA labels for icon-only controls.
- Check empty, loading, success, error, and disabled states.

### Week 4 Deliverable

Workflow Builder is fully functional as a polished UI-only mock-data module.

## Recommended Sprint Split

### Sprint 1

Workflow shell, navigation, Form Actions, Events, Scheduler.

### Sprint 2

Action Buttons, Functions, mock CRUD state.

### Sprint 3

Canvas polish, node library search, connection UX.

### Sprint 4

Config panel polish, validation UX, mock execution, QA.

## Acceptance Checklist

| Area | Acceptance Criteria |
| --- | --- |
| Navigation | All Workflow Builder sections are reachable and active state is clear. |
| Form Actions | User can create, view, edit, delete, and open a mock workflow. |
| Events | User can search, create, edit, and delete mock event workflows. |
| Scheduler | User can create, edit, toggle, and delete mock schedules. |
| Action Buttons | User can create, edit, delete, and link mock action buttons to workflows. |
| Functions | User can create, edit, test, duplicate, and delete mock functions. |
| Canvas | User can drag nodes, select nodes, connect nodes, and zoom. |
| Start/End | Start is protected; End is terminal; validation enforces both. |
| Config Panel | Selected node renders registry-driven tabs and editable fields. |
| Validation | Required fields, graph errors, and invalid connections show clear feedback. |
| Mock Save | Save shows loading, updates mock state, and shows success/error toast. |
| Mock Run | Run highlights nodes and writes mock execution status/history. |
| UI Guidelines | Uses shared `qo-` components, design tokens, focus states, and safe defaults. |
| Tests | Builder build and tests pass. |

## Technical Guidelines

- Use standalone Angular components.
- Use `ChangeDetectionStrategy.OnPush`.
- Use signals for local state and facade state.
- Use `@if` and `@for`.
- Avoid `ngModel`.
- Use reactive forms for forms and modals.
- Use shared `@qo/ui-components` imports.
- Keep containers smart and components presentational.
- Keep SCSS token-based.
- Avoid raw hex colors.
- Avoid hardcoded spacing.
- Add specs for new components and high-risk interactions.

## Risks

| Risk | Mitigation |
| --- | --- |
| Config panel grows too complex | Keep dedicated editor widgets small and schema-driven. |
| Canvas interactions become hard to maintain | Keep graph state in services and avoid DOM-heavy logic in templates. |
| Mock state diverges from future backend | Shape mock models close to expected API contracts. |
| UI polish takes longer than expected | Prioritize critical flows first, then visual refinements. |
| Too many custom controls | Reuse `qo-` components and create shared controls only when repeated. |

## Final Recommendation

Plan for **4 weeks** to complete the mock UI properly.

The fastest useful path is:

1. Finish section screens and mock CRUD.
2. Polish canvas interactions.
3. Improve config panel fields and validation.
4. Add mock execution visualization.
5. Run final QA against QuantaOps UI guidelines.

