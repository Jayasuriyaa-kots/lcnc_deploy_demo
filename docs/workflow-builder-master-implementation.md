# Workflow Builder Master Implementation

## 1. Purpose

This document is the **single standalone source of truth** for implementing the **Workflow Builder** inside the Quanta Ops Builder application.

It is written so that a developer or implementation team can build the module **from this file alone**, without needing any additional reference document.

This document defines:

- exact module scope
- exact page structure
- exact UI layout expectations
- exact component breakdown
- exact component properties
- exact frontend models
- exact services
- exact routes
- exact API alignment
- exact implementation rules
- exact acceptance criteria

This document must be treated as the final implementation contract for Workflow Builder.

---

## 2. Final Product Goal

Workflow Builder must be implemented as a **visually strong, structured, modern Builder module** for defining and managing automation workflows.

The module must feel like:

- a premium internal app builder
- clean and architectural
- white-surface based
- black-primary accented
- grid-based and organized
- workflow-oriented, not form-like

The final result must support:

- workflow discovery
- workflow creation
- trigger-specific workflow organization
- visual workflow preview
- schedule management
- action-button workflow management
- reusable custom functions
- future-ready node-based editing

---

## 3. Platform Role Of Workflow Builder

Workflow Builder is part of the **Builder** application.

Its role is:

- create workflow definitions
- update workflow definitions
- test workflows
- activate or deactivate workflows
- expose execution history to Builder users

It does **not** execute workflows directly in the frontend.

Architecture rules:

- Builder frontend is Angular SPA
- Builder frontend calls Builder API for workflow authoring
- Client API is used for runtime trigger/status behavior where required
- workflow execution happens asynchronously in workers
- workflow definitions belong to the `builder` schema
- workflow execution history belongs to the `runtime` schema

---

## 4. Module Scope

Workflow Builder contains exactly **five sub-pages**:

1. Form Actions
2. Events
3. Scheduler
4. Action Buttons
5. Functions

These five sub-pages must exist in the left workflow navigation and must remain in this order.

---

## 5. Overall Workflow Builder Layout

Workflow Builder lives inside the Builder shell.

### 5.1 Outer Shell

The screen must include:

- top navigation bar
- left module sidebar
- right content area
- bottom status bar

### 5.2 Top Navigation Bar

Required structure:

- left app brand block
- module tabs across the top
- right action area with:
  - Save
  - Preview
  - Deploy
  - notifications
  - user avatar

Required visual rules:

- fixed at top
- height around `56px`
- translucent/glass white background
- subtle bottom border
- dark text for active module
- small uppercase tab labels

### 5.3 Left Module Sidebar

Required structure:

- module title block at top
- divider
- vertical nav items below

Workflow Builder nav items:

- Form Actions
- Events
- Scheduler
- Action Buttons
- Functions

Required nav item behavior:

- icon + label
- hover background
- slight hover movement
- active item with:
  - white background
  - stronger text color
  - bold label
  - subtle shadow

### 5.4 Main Content Area

The right side is the main workflow canvas area.

Required behavior:

- scrollable vertically
- centered content wrapper
- generous page padding
- light radial dot-grid background

---

## 6. Visual Design System

This section is mandatory and replaces the need for an external HTML reference.

## 6.1 Theme Direction

Use a **light Builder UI** with:

- white surfaces
- soft gray section backgrounds
- black as primary emphasis color
- muted neutral typography
- subtle borders and shadows

Avoid:

- dark primary layouts
- colorful dashboard styles
- material-heavy default UI
- card overload with strong rounded corners

## 6.2 Typography

Use this hierarchy:

- headlines: strong geometric / editorial sans look
- body text: clean neutral sans
- code blocks: monospace

Recommended font intent:

- headline style like Manrope
- body style like Inter
- code style like JetBrains Mono

## 6.3 Background Pattern

Workflow Builder pages should use:

- soft radial dot-grid page background

Workflow preview/canvas zones should use:

- square grid / graph-style canvas background

## 6.4 Cards

Cards must be:

- white
- bordered lightly
- minimally rounded
- softly shadowed

Cards should feel architectural and precise, not playful.

## 6.5 Buttons

Primary buttons:

- black background
- white text
- compact height
- uppercase micro-label look

Secondary buttons:

- white/gray background
- border
- dark text
- compact

## 6.6 Badges

Use compact rounded badges for:

- status
- language
- trigger type
- scope

Status colors:

- active/live/published: green
- draft/paused: amber
- failed/error: red
- neutral/default: gray

## 6.7 Icons

Use outlined icons with low visual weight.

---

## 7. Shared Page Pattern

Every workflow sub-page must follow the same high-level page pattern.

### 7.1 Page Header

Each page must include:

- breadcrumb text: `Workflow Builder`
- large page title
- short supporting description
- right-aligned action area

### 7.2 Search + Create Row

Each page must include:

- one primary create button
- one search input
- one muted count label

### 7.3 Content Card Area

Each page then renders its own content type:

- card list
- table
- two-column layout
- code grid

---

## 8. Exact Sub-Page Requirements

## 8.1 Form Actions Page

### 8.1.1 Purpose

This page shows workflows triggered by form activity.

### 8.1.2 Header

Required title:

- `Form Actions`

Required subtitle:

- describe workflows triggered by form submission and form-related events

Required create button:

- `+ New Flow`

Required search placeholder:

- search form actions

### 8.1.3 Layout

This page must render as a **stack of workflow cards**.

It must not be implemented as a plain table.

### 8.1.4 Workflow Card Structure

Each workflow card must contain:

- card header
- status badge
- optional action buttons
- trigger summary line
- mini workflow preview canvas

### 8.1.5 Card Header Content

Each card header must support:

- workflow title
- status badge such as `Published`
- `Edit Flow` button
- optional `Run History (...)` button

### 8.1.6 Trigger Summary

A trigger summary text line must describe what starts the workflow.

Example formats:

- `Trigger: employees · Record Created`
- `Trigger: employees · Field status changed to Inactive`

### 8.1.7 Mini Workflow Canvas

Each card must include a workflow preview band with:

- light canvas grid background
- horizontal chain of nodes
- node-to-node connectors

### 8.1.8 Nodes In Mini Canvas

A node must display:

- top micro-label
- main node title
- small description line
- left accent border or color cue

Minimum placeholder examples to support:

- trigger node
- action node
- email node
- document node
- end node

### 8.1.9 Expected Example Flows

The page should support initial placeholder examples such as:

- employee onboarding flow
- employee offboarding flow

---

## 8.2 Events Page

### 8.2.1 Purpose

This page shows event-triggered workflows.

### 8.2.2 Header

Required title:

- `Events`

Required create button:

- `+ New Event`

### 8.2.3 Layout

This page must render as **one large data table inside a card**.

### 8.2.4 Table Columns

Required columns:

- Event
- Trigger
- Source
- Last Run
- Status
- Actions

### 8.2.5 Row Content Rules

Each row must support:

- event name as primary text
- trigger badge
- muted source text
- last run value
- status badge
- `Edit` action button

### 8.2.6 Interaction

Rows should have:

- hover highlight
- non-destructive interaction feel

---

## 8.3 Scheduler Page

### 8.3.1 Purpose

This page manages time-based workflows.

### 8.3.2 Header

Required title:

- `Scheduler`

Required create button:

- `+ New Schedule`

### 8.3.3 Layout

This page must render as a **two-column layout**.

Left column:

- active schedules list

Right column:

- create new schedule form

### 8.3.4 Active Schedules List

Each schedule row must show:

- schedule icon
- workflow name
- frequency text
- extra scope/source text
- next run label/value
- compact toggle

### 8.3.5 Create New Schedule Form

Required fields:

- Workflow
- Frequency
- Run on
- Time
- Timezone

Required lower section:

- next 3 runs preview block
- `Save Schedule` button

### 8.3.6 Toggle Behavior

Do not use default browser checkbox styling.

Use a compact custom toggle:

- pill background
- white thumb
- enabled/disabled state

---

## 8.4 Action Buttons Page

### 8.4.1 Purpose

This page manages reusable workflow actions linked to reports and pages.

### 8.4.2 Header

Required title:

- `Action Buttons`

Required create button:

- `+ New Action`

### 8.4.3 Layout

This page must render as **one large table card**.

### 8.4.4 Table Columns

Required columns:

- Action Name
- Linked Workflow
- Scope
- Source
- Used In
- Status

### 8.4.5 Row Rules

Each row must display:

- action name as primary text
- linked workflow name
- scope badge
- source in muted mono style
- usage text
- status badge

### 8.4.6 Create Action Modal

Opening create action must show a modal with:

- title: `New Button`
- close action
- Name input
- Action Type select
- Linked Workflow select
- Scope select
- footer:
  - Cancel
  - Create Button

---

## 8.5 Functions Page

### 8.5.1 Purpose

This page manages reusable custom code functions available to workflows.

### 8.5.2 Header

Required title:

- `Custom Functions`

Required create button:

- `+ New Function`

### 8.5.3 Layout

This page must render as a **two-column grid of function cards**.

### 8.5.4 Function Card Structure

Each function card must contain:

- card header
- function name
- short description
- language badge
- dark code block
- action row

### 8.5.5 Code Block

The code block must:

- use monospace
- use dark background
- support syntax emphasis where possible
- have compact readable spacing

### 8.5.6 Card Actions

Each card must include:

- `Edit`
- `Test Run`

### 8.5.7 Create/Edit Function Modal

Required modal fields:

- Name
- Language
- Function Body

Footer:

- Cancel
- Create Function or Save Function

---

## 9. Exact Component Structure

The implementation must be component-based.

## 9.1 Route-Level Components

- `WorkflowsComponent`
- `WorkflowFormActionsComponent`
- `WorkflowEventsComponent`
- `WorkflowSchedulerComponent`
- `WorkflowActionButtonsComponent`
- `WorkflowFunctionsComponent`

Optional detail or editing containers:

- `WorkflowEditorComponent`
- `WorkflowFunctionEditorComponent`

## 9.2 Shared Presentation Components

- `WorkflowPageHeaderComponent`
- `WorkflowToolbarComponent`
- `WorkflowSearchBarComponent`
- `WorkflowStatusBadgeComponent`
- `WorkflowCardComponent`
- `WorkflowMiniCanvasComponent`
- `WorkflowNodeComponent`
- `WorkflowConnectionLineComponent`
- `WorkflowExecutionHistoryComponent`
- `WorkflowRunStatusComponent`
- `WorkflowEmptyStateComponent`

## 9.3 Page-Specific Components

Form Actions:

- `WorkflowFormActionListComponent`
- `WorkflowFormActionCardComponent`
- `WorkflowTriggerSummaryComponent`

Events:

- `WorkflowEventTableComponent`
- `WorkflowEventRowComponent`
- `WorkflowEventTriggerBadgeComponent`

Scheduler:

- `WorkflowScheduleListComponent`
- `WorkflowScheduleRowComponent`
- `WorkflowScheduleFormComponent`
- `WorkflowNextRunsPreviewComponent`

Action Buttons:

- `WorkflowActionButtonTableComponent`
- `WorkflowActionButtonRowComponent`
- `WorkflowButtonCreateModalComponent`

Functions:

- `WorkflowFunctionGridComponent`
- `WorkflowFunctionCardComponent`
- `WorkflowCodeBlockComponent`
- `WorkflowFunctionEditorModalComponent`

Editor/Future-ready:

- `WorkflowCanvasComponent`
- `WorkflowNodePaletteComponent`
- `WorkflowNodeInspectorComponent`
- `WorkflowCanvasToolbarComponent`
- `WorkflowValidationPanelComponent`
- `WorkflowTestRunPanelComponent`

---

## 10. Required Component Properties

## 10.1 Route Container State

### `WorkflowsComponent`

Required state:

- `appId`
- `activeSection`
- `loading`
- `error`

### `WorkflowFormActionsComponent`

Required state:

- `appId`
- `workflows`
- `searchQuery`
- `selectedWorkflowId`
- `loading`

### `WorkflowEventsComponent`

Required state:

- `appId`
- `eventWorkflows`
- `searchQuery`
- `loading`

### `WorkflowSchedulerComponent`

Required state:

- `appId`
- `scheduledWorkflows`
- `scheduleDraft`
- `searchQuery`
- `loading`

### `WorkflowActionButtonsComponent`

Required state:

- `appId`
- `buttonActions`
- `searchQuery`
- `loading`

### `WorkflowFunctionsComponent`

Required state:

- `appId`
- `functions`
- `searchQuery`
- `loading`

## 10.2 Shared Component Inputs / Outputs

### `WorkflowPageHeaderComponent`

Inputs:

- `breadcrumb`
- `title`
- `subtitle`
- `actions`

### `WorkflowToolbarComponent`

Inputs:

- `createLabel`
- `searchPlaceholder`
- `countLabel`
- `disableCreate`

Outputs:

- `create`
- `searchChange`

### `WorkflowCardComponent`

Inputs:

- `title`
- `status`
- `subtitle`
- `meta`
- `actions`
- `selected`

Outputs:

- `edit`
- `openHistory`
- `toggle`

### `WorkflowMiniCanvasComponent`

Inputs:

- `nodes`
- `connections`
- `compact`

### `WorkflowNodeComponent`

Inputs:

- `label`
- `title`
- `description`
- `type`
- `accentColor`
- `active`

### `WorkflowExecutionHistoryComponent`

Inputs:

- `runs`
- `loading`
- `selectedRunId`

Outputs:

- `selectRun`

### `WorkflowStatusBadgeComponent`

Inputs:

- `status`

Supported badge values:

- draft
- published
- active
- inactive
- paused
- running
- failed
- completed

## 10.3 Scheduler Inputs / Outputs

### `WorkflowScheduleRowComponent`

Inputs:

- `workflowName`
- `frequencyLabel`
- `scopeLabel`
- `nextRunAt`
- `enabled`

Outputs:

- `toggleEnabled`
- `edit`

### `WorkflowScheduleFormComponent`

Inputs:

- `workflows`
- `timezones`
- `model`
- `saving`

Outputs:

- `modelChange`
- `save`

### `WorkflowNextRunsPreviewComponent`

Inputs:

- `nextRuns`

## 10.4 Function Inputs / Outputs

### `WorkflowFunctionCardComponent`

Inputs:

- `name`
- `language`
- `description`
- `code`

Outputs:

- `edit`
- `testRun`

### `WorkflowFunctionEditorModalComponent`

Inputs:

- `open`
- `model`
- `saving`

Outputs:

- `close`
- `save`

## 10.5 Action Button Modal Inputs / Outputs

### `WorkflowButtonCreateModalComponent`

Inputs:

- `open`
- `availableWorkflows`
- `model`
- `saving`

Outputs:

- `close`
- `save`

---

## 11. Exact Routes

Workflow Builder must exist under the Builder application workspace.

Required base route:

- `/apps/:appId/workflows`

Required child routes:

- `/apps/:appId/workflows/form-actions`
- `/apps/:appId/workflows/events`
- `/apps/:appId/workflows/scheduler`
- `/apps/:appId/workflows/action-buttons`
- `/apps/:appId/workflows/functions`

Optional detail routes:

- `/apps/:appId/workflows/form-actions/:workflowId`
- `/apps/:appId/workflows/events/:workflowId`
- `/apps/:appId/workflows/scheduler/:workflowId`
- `/apps/:appId/workflows/action-buttons/:workflowId`
- `/apps/:appId/workflows/functions/:functionId`

Route protection rules:

- Builder routes must use `authGuard`
- Builder routes must use `scopeGuard('builder')`

---

## 12. Exact Frontend Models

All workflow frontend logic must use typed models.

## 12.1 Core Workflow Models

### `WorkflowSummary`

Fields:

- `id`
- `appId`
- `name`
- `status`
- `triggerType`
- `triggerLabel`
- `lastRunAt`
- `runCount`
- `updatedAt`

### `WorkflowDetail`

Fields:

- `id`
- `appId`
- `name`
- `description`
- `status`
- `triggerType`
- `triggerConfig`
- `steps`
- `version`
- `updatedAt`
- `createdAt`

### `WorkflowTriggerType`

Supported values:

- `form_submit`
- `form_load`
- `form_input`
- `event`
- `schedule`
- `button`
- `manual`
- `webhook`

### `WorkflowStatus`

Supported values:

- `draft`
- `active`
- `inactive`
- `archived`

## 12.2 Workflow Graph Models

### `WorkflowNode`

Fields:

- `id`
- `type`
- `label`
- `position`
- `config`

### `WorkflowNodePosition`

Fields:

- `x`
- `y`

### `WorkflowEdge`

Fields:

- `id`
- `sourceNodeId`
- `targetNodeId`
- `conditionLabel`

### `WorkflowGraph`

Fields:

- `nodes`
- `edges`

### `WorkflowNodeType`

Supported values:

- `trigger`
- `condition`
- `email`
- `api_call`
- `database_write`
- `delay`
- `loop`
- `custom_function`
- `notification`
- `sub_workflow`

## 12.3 Trigger Models

### `FormActionTriggerConfig`

Fields:

- `formId`
- `formName`
- `eventType`
- `fieldId`
- `fieldName`

### `EventTriggerConfig`

Fields:

- `eventName`
- `sourceType`
- `sourceId`
- `conditions`

### `ScheduleTriggerConfig`

Fields:

- `mode`
- `runAt`
- `cron`
- `timezone`
- `relativeField`

### `ActionButtonTriggerConfig`

Fields:

- `sourceType`
- `sourceId`
- `scope`
- `buttonName`

## 12.4 Function Models

### `WorkflowFunctionSummary`

Fields:

- `id`
- `appId`
- `name`
- `language`
- `description`
- `updatedAt`

### `WorkflowFunctionDetail`

Fields:

- `id`
- `appId`
- `name`
- `language`
- `description`
- `code`
- `createdAt`
- `updatedAt`

### `WorkflowFunctionLanguage`

Supported values:

- `javascript`
- `python`

## 12.5 Execution Models

### `WorkflowExecutionSummary`

Fields:

- `id`
- `workflowId`
- `celeryTaskId`
- `triggerType`
- `status`
- `startedAt`
- `finishedAt`

### `WorkflowExecutionDetail`

Fields:

- `id`
- `workflowId`
- `celeryTaskId`
- `triggerType`
- `status`
- `input`
- `output`
- `errorMessage`
- `stepsLog`
- `startedAt`
- `finishedAt`

### `WorkflowExecutionStatus`

Supported values:

- `pending`
- `running`
- `completed`
- `failed`

## 12.6 Request / Editor Models

### `CreateWorkflowRequest`

Fields:

- `name`
- `description`
- `triggerType`
- `triggerConfig`
- `steps`

### `UpdateWorkflowRequest`

Fields:

- `name`
- `description`
- `triggerConfig`
- `steps`
- `status`

### `WorkflowSearchFilters`

Fields:

- `query`
- `triggerType`
- `status`

### `ScheduleEditorModel`

Fields:

- `workflowId`
- `frequency`
- `runOn`
- `time`
- `timezone`

### `ActionButtonEditorModel`

Fields:

- `name`
- `actionType`
- `linkedWorkflowId`
- `scope`

### `FunctionEditorModel`

Fields:

- `name`
- `language`
- `code`
- `description`

---

## 13. Exact Services

Use dedicated services only.

## 13.1 Builder API Services

### `BuilderWorkflowsService`

Responsibilities:

- list workflows
- get workflow detail
- create workflow
- update workflow
- delete workflow
- activate workflow
- test run workflow

Methods:

- `list(appId, filters?)`
- `get(workflowId)`
- `create(payload)`
- `update(workflowId, payload)`
- `remove(workflowId)`
- `activate(workflowId)`
- `testRun(workflowId, payload?)`

### `BuilderWorkflowFunctionsService`

Responsibilities:

- list functions
- get function detail
- create function
- update function
- delete function

Methods:

- `list(appId, filters?)`
- `get(functionId)`
- `create(payload)`
- `update(functionId, payload)`
- `remove(functionId)`

## 13.2 Runtime Service

### `ClientWorkflowRunnerService`

Responsibilities:

- trigger workflow from runtime
- get workflow job execution status

Methods:

- `trigger(payload)`
- `getJob(jobId)`

## 13.3 UI State Services

### `WorkflowBuilderStateService`

Responsibilities:

- active section
- selected workflow
- selected run
- unsaved changes
- editor state

### `WorkflowCanvasStateService`

Responsibilities:

- nodes
- edges
- selected node
- drag state
- validation state

### `WorkflowSearchStateService`

Responsibilities:

- search term per sub-page
- local UI filter persistence

### `WorkflowModalService`

Responsibilities:

- open/close modals
- manage create/edit modal state

## 13.4 Utility Services

### `WorkflowMapperService`

Responsibilities:

- map API DTOs to UI models
- map UI models to API payloads

### `WorkflowValidationService`

Responsibilities:

- validate trigger config
- validate node config
- validate graph completeness
- validate before activate/test

### `WorkflowPaletteService`

Responsibilities:

- provide available node type metadata
- provide node categories
- provide icons/labels/default config

---

## 14. Exact API Alignment

The frontend must align to these authoring endpoints:

- `GET /workflows`
- `POST /workflows`
- `GET /workflows/{id}`
- `PATCH /workflows/{id}`
- `DELETE /workflows/{id}`
- `POST /workflows/{id}/activate`
- `POST /workflows/{id}/test-run`

Runtime alignment:

- `POST /workflows/trigger`
- `GET /workflows/jobs/{id}`

Rules:

- Builder pages use Builder API for management
- runtime trigger/status uses Client API
- frontend must not perform workflow execution logic locally

---

## 15. File Structure Recommendation

Recommended Builder app files:

- `apps/builder/src/app/pages/workflows/workflows.component.ts`
- `apps/builder/src/app/pages/workflows/form-actions.component.ts`
- `apps/builder/src/app/pages/workflows/events.component.ts`
- `apps/builder/src/app/pages/workflows/scheduler.component.ts`
- `apps/builder/src/app/pages/workflows/action-buttons.component.ts`
- `apps/builder/src/app/pages/workflows/functions.component.ts`
- `apps/builder/src/app/pages/workflows/workflow-editor.component.ts`

Recommended shared UI components:

- `libs/ui-components/src/lib/workflow-page-header/`
- `libs/ui-components/src/lib/workflow-toolbar/`
- `libs/ui-components/src/lib/workflow-card/`
- `libs/ui-components/src/lib/workflow-mini-canvas/`
- `libs/ui-components/src/lib/workflow-node/`
- `libs/ui-components/src/lib/workflow-execution-history/`
- `libs/ui-components/src/lib/workflow-code-block/`

Recommended models:

- `libs/models/src/lib/builder-workflows.ts`
- `libs/models/src/lib/client-workflows.ts`

Recommended API services:

- `libs/api-client/src/lib/builder/workflows.service.ts`
- `libs/api-client/src/lib/builder/workflow-functions.service.ts`
- `libs/api-client/src/lib/client/workflow-runner.service.ts`

---

## 16. Non-Negotiable Rules

These rules must not be violated.

### 16.1 Visual Rules

Do not:

- redesign the module into a different visual system
- replace the layout with generic admin pages
- convert all pages into standard tables
- use default Angular Material look as the final visual language

### 16.2 Structure Rules

Do not:

- remove any of the five sub-pages
- rename sub-pages
- change their order
- collapse scheduler into a generic list-only page
- collapse functions into a generic CRUD page without code cards

### 16.3 Architecture Rules

Do not:

- make frontend directly own workflow execution
- mix runtime execution logic into Builder-only services
- ignore typed models
- skip service layer abstraction

---

## 17. Definition Of Done

Workflow Builder is complete when:

- all five sub-pages exist and follow the layouts in this document
- left navigation, page headers, toolbars, cards, tables, modals, and badges match this specification
- components are implemented according to this document
- routes are implemented according to this document
- models are implemented according to this document
- services are implemented according to this document
- Builder API integration is in place for authoring
- Client API integration is in place for runtime trigger/status access where needed
- the frontend is ready to connect to worker-based execution without redesign

---

## 18. Final Rule

If this document is the only file given to an implementation team, they must still be able to build Workflow Builder correctly.

So the final rule is:

- **this file is self-sufficient**
- **this file defines the UI**
- **this file defines the structure**
- **this file defines the code architecture**
- **this file defines the implementation contract**
