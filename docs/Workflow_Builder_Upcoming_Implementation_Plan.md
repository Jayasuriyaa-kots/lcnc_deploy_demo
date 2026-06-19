# Workflow Builder Upcoming Implementation Plan

Prepared for the Quanta Ops Builder `workflow-builder` feature.  
Date: May 12, 2026

## Purpose

This document defines the next implementation plan for the Workflow Builder canvas editor. It starts with the required node catalogue, explains why each node is needed, and maps the feature work to:

- `docs/Frontend_UI_Components_Guide.md`
- `docs/quanta-ops-ui-ux-guidelines.md`

## Required Workflow Canvas Nodes

| Node | Group | Why We Want It | Primary Configuration |
| --- | --- | --- | --- |
| Start | Core trigger | Mandatory first node for every workflow. Gives every canvas a predictable entry point, supports validation, and makes run history readable. | Name, trigger type, source form/page/event, initial payload |
| End | Core completion | Marks a successful terminal path. Needed for explicit completion, audit trails, and future branch validation. | Completion status, message, optional output mapping |
| AI Message | Prompt node | Sends guided text back to a user or conversational surface. Useful for assistant-like flows and confirmation messages. | Message body, channel, personalization variables |
| AI Question | Prompt node | Requests input, stores the answer, and continues the workflow. Needed for branching based on user-provided values. | Question text, answer key, validation rule, fallback |
| Database Query | Data operation | Reads, inserts, or updates app data. Required for workflows that synchronize tables, create records, or fetch context. | Datasource/table, operation, query/filter, input mapping, output mapping |
| API Query | Integration | Calls external systems. Required for integrations, webhooks, enrichment, ticket creation, and third-party sync. | Method, URL, headers, body, auth, timeout, retry policy |
| Channel Switch | Messaging router | Routes the same workflow differently for email, chat, page, webhook, or future channels. | Channel expression, cases, default path |
| Send Email | Messaging action | Sends transactional or notification email from a workflow. Needed for approvals, alerts, confirmations, and summaries. | To/cc/bcc, subject, template, attachments, sender |
| Intent Recognition | AI control flow | Classifies user intent and selects a branch. Useful for support, sales, billing, routing, and smart assistants. | Intent labels, confidence threshold, fallback branch |
| Condition | Control flow | Branches on deterministic rules. Required for approvals, status checks, eligibility gates, and data validation. | Expression, true branch, false branch, error branch |
| Page Trigger | UI page action | Starts workflows from Builder-created pages. Required for user-click, page-load, and widget-event automation. | Page id, widget id, event name, payload schema |
| Set Widget Data | UI page action | Updates a widget on a page from workflow results. Makes workflows visible and useful inside Client App screens. | Target widget, data source, transformation mapping |
| HTTP Request | UI/API action | Runs an HTTP request from page or workflow context. Useful for lightweight API actions without a full integration object. | Method, URL, headers, body, response mapping |
| Navigate | UI page action | Moves the user to another page after an action. Needed for guided flows, post-submit paths, and drilldowns. | Target route/page, params, preserve state flag |
| Show Notification | UI feedback | Shows toast/banner feedback after user actions. Required by the UX guideline for visible action feedback. | Message, severity, duration, action label |
| Transform Data | Data transform | Normalizes payloads between nodes. Reduces custom code inside API/database actions and keeps mappings reusable. | Input schema, transform function, output schema |
| Upload to CDN | Storage | Uploads files/assets produced or selected during a workflow. Needed for document, media, and generated report workflows. | File source, bucket/path, visibility, metadata |

## Implementation Phases

| Phase | Implementation Work | Definition of Done |
| --- | --- | --- |
| 1. Node Registry | Create a typed node registry in workflow-builder models with id, label, icon, category, config schema, default node, validation rules, and feature flags. | All palette nodes are generated from one source of truth. |
| 2. Canvas Foundations | Keep Start as the first node, support vertical edit layout, 8px snap, connector handles, zoom, keyboard selection, delete confirmation, and empty-state guidance. | Canvas is predictable, accessible, and Builder-like. |
| 3. Node Configuration Panels | Add right-side configuration drawer or modal panels using `qo-form-field`, `qo-input`, `qo-select`, `qo-textarea`, `qo-toggle`, `qo-tabs`, and reactive forms. | Every node can be configured without custom raw controls. |
| 4. Validation and Run Readiness | Validate required fields, dangling edges, unreachable nodes, branch completeness, missing End node, and invalid mappings before Save. | Bad workflows are caught before runtime. |
| 5. API and Persistence | Replace demo data with real workflow create/update/list/get endpoints, persist node positions, config payloads, versions, and run metadata. | Editor state survives reloads and supports collaboration later. |
| 6. Execution History | Connect run history to workflow runs, node-level status, errors, and retry actions using shared status badges and tables. | Builders can debug flows from the same module. |
| 7. Polish and Accessibility | Add focus rings, aria labels, keyboard shortcuts, visible loading states, inline errors, and no indefinite loading. | Meets UI/UX and PR review standards. |

## UX and Component Alignment

| Area | Required Alignment |
| --- | --- |
| Shared components | Use `@qo/ui-components` barrel imports only. Use `qo-button`, `qo-modal`, `qo-drawer`, `qo-form-field`, `qo-input`, `qo-select`, `qo-textarea`, `qo-toggle`, `qo-tabs`, `qo-empty-state`, `QoToastService`, and `qo-confirm-dialog` where applicable. |
| Angular rules | All components standalone, `ChangeDetectionStrategy.OnPush`, `input()` / `output()`, signals for local state, reactive forms, `@if` / `@for`, no `ngModel`, no NgModules. |
| State model | `WorkflowBuilderFacadeService` remains feature source of truth. Containers orchestrate, components receive inputs and emit outputs. Services handle API only. |
| Styling | Token-only SCSS: `var(--qo-color-*)`, `var(--qo-space-*)`, `var(--qo-size-*)`, `var(--qo-radius-*)`. No raw hex, hardcoded px spacing, `::ng-deep`, or inline template styles. |
| UX behavior | Immediate feedback within 200ms, button loading for saves, inline form errors, toast for async failures, confirm dialog for destructive deletes, empty state when no nodes exist. |
| Builder canvas | Desktop-first canvas, 8px grid snap, visible selected state, no overlapping inaccessible controls, keyboard/focus support, vertical edit layout when opened from Edit Flow. |

## Proposed Canvas Behavior

- Every new workflow starts with a single Start node. The Start node cannot be deleted; it can only be configured.
- When a flow is opened from Edit Flow, the editor presents a vertical sequence. The overview cards can remain horizontal for scanning multiple workflows.
- Node placement snaps to an 8px grid.
- Dragging shows visible feedback and selected nodes show handles and a clear border.
- Connections must prevent duplicate edges and self-connections.
- Dangling edges are invalid.
- The empty canvas state should use `qo-empty-state` with a clear call to drag a node or configure Start.
- Save must validate first, show loading on the `qo-button`, then use `QoToastService` for success/failure feedback.

## Configuration UX

- Use a shared `qo-drawer` or `qo-modal` for node configuration depending on complexity.
- Routine node configuration should prefer a right-side drawer so the canvas remains visible.
- Every field must use `qo-form-field` plus `qo-input`, `qo-select`, `qo-textarea`, `qo-toggle`, or other shared controls.
- Placeholder text is not a substitute for labels.
- Show inline field errors for missing required config.
- Do not block the panel from staying open when a field is invalid.
- For advanced nodes, use `qo-tabs` for Properties, Input Mapping, Output Mapping, Retry/Error Handling, and Test Data.

## Data Model and API Requirements

- Persist workflow id, app id, name, description, status, version, trigger type, trigger config, node list, edge list, node positions, and per-node config payloads.
- Add typed schemas for node configuration so the UI can render forms and validation consistently.
- Track run history with workflow id, run id, node statuses, started/finished timestamps, error details, and retry metadata.
- Keep services API-only.
- Keep workflow state in `WorkflowBuilderFacadeService` / `WorkflowBuilderStateService` using signals and computed values.

## Acceptance Checklist for PR Review

| Scenario | Acceptance Criteria |
| --- | --- |
| Create flow | `+ New Flow` opens shared `qo-modal`; create action shows loading, creates draft workflow, opens editor with Start node. |
| Edit flow | `Edit Flow` opens editor with a vertical node sequence and first node labeled Start. |
| Save flow | Save validates graph, shows button loading, persists graph, and shows success/error feedback. |
| Node add/configure | Dragging palette node adds it to canvas; selecting node opens config UI; invalid required fields show inline errors. |
| Delete node | Delete requires `qo-confirm-dialog` and uses danger action styling. |
| Accessibility | Keyboard navigation, focus rings, aria labels for icon-only controls, labelled form fields, no color-only state. |
| Tests | Smoke tests for every component, facade tests for graph creation/validation, editor interaction tests for add/select/save/delete. |
| Checks | `npx nx build builder` and `npx nx test builder --watch=false` pass before PR. |

## Risks and Open Questions

- Decide whether End is mandatory in v1 or only recommended. Mandatory End improves validation but adds friction for quick drafts.
- Confirm whether AI Message and AI Question are runtime nodes for Client App chat surfaces, internal automation helpers, or both.
- Confirm real API contracts for workflow create/update, run history, node test-run, and function execution before replacing mock data.
- Decide whether node icons should use the existing `QoIcon` registry names or require new icon registrations.

## Recommended Next PR Split

- PR 1: Node registry, Start/End behavior, vertical edit canvas normalization, graph validation tests.
- PR 2: Node configuration drawer/modal shell using shared `qo-` components and reactive forms.
- PR 3: API persistence integration and replacement of demo/mock workflow data.
- PR 4: Execution history, node-level run status, retries, and error details.
- PR 5: Accessibility polish, keyboard shortcuts, visual regression screenshots, and documentation updates.
