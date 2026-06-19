# Workflow Builder Node Actions and Right-Side Config Panel Reference

Prepared for QuantaOps Builder `workflow-builder`.

## Purpose

This document defines every workflow node, its purpose, builder usage, properties, and the full set of options that should appear in the right-side configuration panel.

The goal is to make node configuration consistent, schema-driven, and reusable across:

- Form Builder
- Page Builder
- Report Builder
- Workflow Builder canvas

## Configuration Panel Standard

Every node should open the right-side configuration panel when selected on the canvas.

Recommended panel tabs:

| Tab | Purpose |
| --- | --- |
| General | Basic node identity, label, description, enabled state, and builder context. |
| Trigger or Action | Main node-specific behavior. For trigger nodes, this defines when the workflow starts. For action nodes, this defines what the node does. |
| Input Mapping | Maps values from previous nodes, page state, form payload, report rows, user context, or variables. |
| Output Mapping | Defines what this node exposes to following nodes. |
| Validation | Required fields, constraints, validation expressions, and fallback behavior. |
| Error Handling | Retry rules, timeout behavior, fallback path, and failure message. |
| Permissions | Roles, environments, and access rules for using or running the node. |
| Advanced | Raw payload, feature flags, execution options, metadata, and debug settings. |

## Node Count Summary

| Count | Node | Category |
| --- | --- | --- |
| 1 | Start | Core |
| 2 | End | Core |
| 3 | Database Query | Database |
| 4 | API Query | API / Integration |
| 5 | Channel Switch | Messaging / Router |
| 6 | Send Email | Notification |
| 7 | Condition | Logic |
| 8 | Page Trigger | Page Builder |
| 9 | Set Widget Data | Page Builder |
| 10 | HTTP Request | API / Page Action |
| 11 | Navigate | Page Builder |
| 12 | Show Notification | UI Feedback |
| 13 | Transform Data | Data Transform |
| 14 | Upload to CDN | Storage |

## 1. Start Node

### Purpose

The Start node is the mandatory workflow entry point. It defines how the workflow begins and what initial payload is available to the rest of the graph.

### Used In

| Builder | Usage |
| --- | --- |
| Form Builder | Starts on form submit, form load, field change, approval action, or validation event. |
| Page Builder | Starts on page load, widget click, widget change, route event, or custom UI event. |
| Report Builder | Starts on row action, bulk action, scheduled report, export, or manual run. |

### Node Properties

| Property | Description |
| --- | --- |
| Node Name | Display label shown on the canvas. Default: `Start`. |
| Trigger Type | Defines source type: form, page, report, schedule, API, webhook, manual, button, event. |
| Source Builder | Form Builder, Page Builder, Report Builder, or Workflow Builder. |
| Source Object | Form, page, report, widget, table, event, schedule, or API source. |
| Initial Payload | Payload made available to the workflow at runtime. |
| Active | Whether this workflow can be triggered. |
| Description | Optional notes for builders and reviewers. |

### Right-Side Config Panel

#### General

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Node Label | Text | Yes | Usually locked to `Start`, but can allow subtitle/alias. |
| Description | Textarea | No | Internal explanation. |
| Active | Toggle | Yes | Enables or disables trigger execution. |
| Builder Context | Select | Yes | Form, Page, Report, Workflow, API. |

#### Trigger

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Trigger Type | Select | Yes | Form Submit, Form Load, Field Change, Page Load, Widget Click, Report Action, Schedule, Webhook, Manual. |
| Source Form | Select | Conditional | Required for form triggers. |
| Source Page | Select | Conditional | Required for page triggers. |
| Source Widget | Select | Conditional | Required for widget triggers. |
| Source Report | Select | Conditional | Required for report triggers. |
| Event Name | Select/Text | Yes | Example: `submit`, `click`, `load`, `change`, `row.selected`. |
| Payload Schema | Schema Editor | No | Defines expected input shape. |

#### Input Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Include User Context | Toggle | No | Adds user id, role, tenant, locale. |
| Include Page State | Toggle | No | Useful for Page Builder workflows. |
| Include Form Data | Toggle | No | Useful for Form Builder workflows. |
| Include Selected Rows | Toggle | No | Useful for Report Builder workflows. |
| Custom Variables | Key-Value Editor | No | Adds static or dynamic runtime variables. |

#### Output Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Output Key | Text | No | Default: `start`. |
| Exposed Fields | Field Picker | No | Controls which payload values are available downstream. |

#### Validation

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Require Source | Toggle | Yes | Prevents save if no source is selected. |
| Payload Validation | Select | No | None, strict, permissive. |
| Missing Payload Behavior | Select | No | Fail, continue with empty object, use defaults. |

#### Error Handling

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Trigger Failure Path | Select | No | Stop workflow or route to error branch. |
| Error Message | Textarea | No | Message shown in run history. |

#### Permissions

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Allowed Roles | Multi Select | No | Roles allowed to run this trigger. |
| Environment | Multi Select | No | Dev, staging, production. |

#### Advanced

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Node ID | Readonly Text | Yes | Stable internal id. |
| Runtime Key | Text | No | Used by execution engine. |
| Feature Flag | Text | No | Optional rollout flag. |
| Debug Payload | JSON Editor | No | Sample trigger payload. |

## 2. End Node

### Purpose

The End node marks a terminal workflow path. It stores final status, return payload, and completion message.

### Used In

| Builder | Usage |
| --- | --- |
| Form Builder | Shows final form outcome, approval result, or submission completion. |
| Page Builder | Completes page action and optionally returns UI data. |
| Report Builder | Completes export, row action, scheduled job, or notification workflow. |

### Node Properties

| Property | Description |
| --- | --- |
| Node Name | Display label shown on canvas. |
| Completion Status | Success, failure, cancelled, skipped, or custom. |
| Message | Final completion message. |
| Return Payload | Data returned to caller or UI. |
| Audit Note | Optional note stored in execution history. |

### Right-Side Config Panel

#### General

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Node Label | Text | Yes | Example: `End`, `Approved`, `Rejected`, `Completed`. |
| Description | Textarea | No | Internal explanation. |
| Enabled | Toggle | Yes | Usually enabled. |

#### Action

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Completion Status | Select | Yes | Success, Failure, Cancelled, Skipped, Custom. |
| Completion Message | Textarea | No | Human-readable completion text. |
| Stop Execution | Toggle | Yes | Should normally be true. |

#### Input Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Final Input Source | Select | No | Previous node output or workflow variables. |
| Include Error Context | Toggle | No | Useful for failure paths. |

#### Output Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Return Payload | JSON/Mapping Editor | No | Data returned to UI/API caller. |
| Output Key | Text | No | Default: `result`. |

#### Validation

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Require Incoming Edge | Toggle | Yes | Ensures End is reachable. |
| Require Status | Toggle | Yes | Prevents incomplete terminal node. |

#### Error Handling

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| On End Failure | Select | No | Stop, retry, fallback message. |

#### Permissions

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Visible In Run History | Toggle | No | Controls audit visibility. |

#### Advanced

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Terminal Code | Text | No | Machine-readable completion code. |
| Metadata | JSON Editor | No | Runtime metadata. |

## 3. Database Query Node

### Purpose

Reads, inserts, updates, deletes, or upserts application data.

### Used In

| Builder | Usage |
| --- | --- |
| Form Builder | Save submissions, update records, check duplicate data, create approval rows. |
| Page Builder | Load widget data, update records from page actions, refresh dashboards. |
| Report Builder | Fetch report records, update selected rows, run bulk operations. |

### Node Properties

| Property | Description |
| --- | --- |
| Datasource | Target app datasource or database connection. |
| Table | Target table or collection. |
| Operation | Select, insert, update, delete, upsert. |
| Query Builder | Visual rule builder for filters and joins. |
| Input Mapping | Maps workflow data into query parameters. |
| Output Mapping | Maps query result into workflow variables. |

### Right-Side Config Panel

#### General

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Node Label | Text | Yes | Example: `Create Employee Record`. |
| Description | Textarea | No | Internal explanation. |
| Enabled | Toggle | Yes | Allows disabling without deleting. |

#### Action

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Datasource | Select | Yes | App database or connected datasource. |
| Table | Select | Yes | Depends on selected datasource. |
| Operation | Select | Yes | Select, Insert, Update, Delete, Upsert. |
| Query Mode | Select | Yes | Visual builder, raw query, stored query. |
| Filters | Rule Builder | Conditional | Required for select/update/delete where needed. |
| Insert Values | Mapping Editor | Conditional | Required for insert/upsert. |
| Update Values | Mapping Editor | Conditional | Required for update/upsert. |
| Limit | Number | No | Select operations. |
| Offset | Number | No | Select operations. |
| Sort By | Field Picker | No | Select operations. |
| Sort Direction | Select | No | Ascending or descending. |

#### Input Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Query Parameters | Mapping Editor | No | Dynamic filters and values. |
| Previous Node Data | Variable Picker | No | Uses prior output. |
| Form/Page/Report Context | Variable Picker | No | Uses builder-specific context. |

#### Output Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Result Key | Text | Yes | Example: `employeeRecord`. |
| Return Mode | Select | No | First row, all rows, affected count, inserted id. |
| Field Mapping | Mapping Editor | No | Renames or reshapes result. |

#### Validation

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Require Table | Toggle | Yes | Prevents incomplete query. |
| Require Filter For Update/Delete | Toggle | Yes | Prevents accidental bulk changes. |
| Empty Result Behavior | Select | No | Continue, stop, fallback branch. |

#### Error Handling

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Timeout | Duration | No | Query timeout. |
| Retry Count | Number | No | Retry transient failures. |
| On Query Error | Select | No | Stop, continue, fallback branch. |
| Error Branch Label | Text | No | Label for error edge. |

#### Permissions

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Required Role | Multi Select | No | Controls who can configure/run this node. |
| Allowed Operations | Multi Select | No | Restricts dangerous operations. |

#### Advanced

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Raw Query | Code Editor | Conditional | Used in raw query mode. |
| Transaction Group | Text | No | Groups multiple DB nodes in a transaction. |
| Cache Result | Toggle | No | Useful for read operations. |
| Metadata | JSON Editor | No | Runtime metadata. |

## 4. API Query Node

### Purpose

Calls external APIs, integrations, webhooks, and internal services.

### Used In

| Builder | Usage |
| --- | --- |
| Form Builder | Send form data to CRM, ticketing, HR, payment, or external systems. |
| Page Builder | Fetch remote widget data or trigger external actions. |
| Report Builder | Sync report rows, enrich records, push exports to external tools. |

### Node Properties

| Property | Description |
| --- | --- |
| Method | HTTP method. |
| URL | API endpoint. |
| Auth Type | None, bearer, API key, OAuth, basic. |
| Headers | Request headers. |
| Query Params | URL parameters. |
| Body | Request body. |
| Timeout | Request timeout. |
| Retry Policy | Retry rules. |
| Response Mapping | Maps API response to workflow variables. |

### Right-Side Config Panel

#### General

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Node Label | Text | Yes | Example: `Create CRM Contact`. |
| Description | Textarea | No | Internal explanation. |
| Enabled | Toggle | Yes | Allows disabling without deleting. |

#### Action

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Method | Select | Yes | GET, POST, PUT, PATCH, DELETE. |
| URL | Text | Yes | Supports variables. |
| Auth Type | Select | No | None, Bearer, API Key, OAuth, Basic. |
| Credential | Select | Conditional | Required when auth is used. |
| Headers | Key-Value Editor | No | Request headers. |
| Query Params | Key-Value Editor | No | URL query parameters. |
| Body Type | Select | No | JSON, form data, raw text, none. |
| Body | JSON/Text Editor | Conditional | Required for POST/PUT/PATCH when needed. |
| Timeout | Duration | No | Request timeout. |

#### Input Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| URL Variables | Mapping Editor | No | Dynamic path values. |
| Body Mapping | Mapping Editor | No | Builds request payload. |
| Header Variables | Mapping Editor | No | Dynamic headers. |

#### Output Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Response Key | Text | Yes | Example: `crmResponse`. |
| Response Path | Text | No | JSON path to extract. |
| Include Status Code | Toggle | No | Stores HTTP status. |
| Include Headers | Toggle | No | Stores response headers. |

#### Validation

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Require URL | Toggle | Yes | Prevents empty endpoint. |
| Allowed Status Codes | Text | No | Example: `200,201,204`. |
| Validate Response Schema | Toggle | No | Uses JSON schema. |

#### Error Handling

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Retry Count | Number | No | Retry transient failures. |
| Retry Delay | Duration | No | Delay between retries. |
| Retry On Status | Text | No | Example: `408,429,500,502,503`. |
| On Failure | Select | No | Stop, continue, fallback branch. |

#### Permissions

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Allowed Domains | List Editor | No | Enterprise security control. |
| Credential Access Role | Multi Select | No | Controls credential usage. |

#### Advanced

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Raw Request Preview | Readonly Code | No | Shows final request. |
| Test Request | Button | No | Runs test with sample payload. |
| Metadata | JSON Editor | No | Runtime metadata. |

## 5. Channel Switch Node

### Purpose

Routes workflow execution based on the incoming or outgoing channel.

### Used In

| Builder | Usage |
| --- | --- |
| Form Builder | Route form response differently for email, chat, or internal UI. |
| Page Builder | Handle page, chat, webhook, or embedded UI interactions differently. |
| Report Builder | Send report outputs to email, Slack, UI notification, webhook, or storage. |

### Node Properties

| Property | Description |
| --- | --- |
| Channel Expression | Expression used to detect channel. |
| Cases | Channel-specific branches. |
| Default Path | Fallback branch if no case matches. |

### Right-Side Config Panel

#### General

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Node Label | Text | Yes | Example: `Route By Channel`. |
| Description | Textarea | No | Internal explanation. |
| Enabled | Toggle | Yes | Allows disabling without deleting. |

#### Action

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Channel Source | Select | Yes | Trigger channel, user context, previous node, custom expression. |
| Channel Expression | Expression Editor | Yes | Example: `{{start.channel}}`. |
| Cases | Branch List Editor | Yes | Email, chat, page, webhook, API, notification. |
| Default Case | Select | Yes | Fallback branch. |

#### Input Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Channel Value | Mapping Editor | Yes | Runtime value used for switching. |
| Context Values | Mapping Editor | No | Extra branch context. |

#### Output Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Matched Channel Key | Text | No | Stores matched case. |
| Branch Result Key | Text | No | Stores routing decision. |

#### Validation

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Require At Least One Case | Toggle | Yes | Prevents empty switch. |
| Require Default Case | Toggle | Yes | Prevents dead ends. |
| Duplicate Case Check | Toggle | Yes | Prevents duplicate channel names. |

#### Error Handling

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Unknown Channel Behavior | Select | Yes | Use default, stop, error branch. |

#### Permissions

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Allowed Channels | Multi Select | No | Restricts configured channels. |

#### Advanced

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Case Matching Mode | Select | No | Exact, contains, regex. |
| Metadata | JSON Editor | No | Runtime metadata. |

## 6. Send Email Node

### Purpose

Sends transactional, notification, approval, alert, or report summary emails.

### Used In

| Builder | Usage |
| --- | --- |
| Form Builder | Confirmation, approval, rejection, reminder, or escalation emails. |
| Page Builder | Email from page actions or guided user flows. |
| Report Builder | Scheduled summaries, exports, alerts, and exception reports. |

### Node Properties

| Property | Description |
| --- | --- |
| To | Recipients. |
| CC/BCC | Additional recipients. |
| Subject | Email subject. |
| Template | Email template. |
| Body | HTML or plain text body. |
| Attachments | Static or dynamic files. |
| Sender | Sender identity. |

### Right-Side Config Panel

#### General

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Node Label | Text | Yes | Example: `Send Welcome Email`. |
| Description | Textarea | No | Internal explanation. |
| Enabled | Toggle | Yes | Allows disabling without deleting. |

#### Action

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Sender | Select | Yes | Verified sender identity. |
| To | Recipient Editor | Yes | Supports variables. |
| CC | Recipient Editor | No | Supports variables. |
| BCC | Recipient Editor | No | Supports variables. |
| Subject | Text | Yes | Supports variables. |
| Template | Select | No | Optional reusable template. |
| Body Type | Select | Yes | Plain text, HTML, template. |
| Body | Rich Text/HTML Editor | Conditional | Required when no template is selected. |
| Attachments | File Mapping | No | Static files or previous node outputs. |

#### Input Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Template Variables | Mapping Editor | No | Dynamic values for email. |
| Attachment Source | Mapping Editor | No | CDN upload, report export, form file. |

#### Output Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Email ID Key | Text | No | Stores provider message id. |
| Delivery Status Key | Text | No | Stores sent, bounced, failed. |

#### Validation

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Require Recipient | Toggle | Yes | Prevents sending without recipients. |
| Validate Email Format | Toggle | Yes | Checks email fields. |
| Require Subject | Toggle | Yes | Prevents blank subject. |
| Unresolved Variable Behavior | Select | No | Warn, fail, replace with blank. |

#### Error Handling

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Retry Count | Number | No | Retry provider failures. |
| On Send Failure | Select | No | Stop, continue, fallback branch. |
| Fallback Sender | Select | No | Secondary sender. |

#### Permissions

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Require Approval | Toggle | No | Approval before external email. |
| Allowed Sender Roles | Multi Select | No | Restricts sender use. |

#### Advanced

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Provider Options | JSON Editor | No | Provider-specific metadata. |
| Tracking Enabled | Toggle | No | Opens/clicks if supported. |
| Metadata | JSON Editor | No | Runtime metadata. |

## 7. Condition Node

### Purpose

Branches workflow execution using deterministic rules.

### Used In

| Builder | Usage |
| --- | --- |
| Form Builder | Approval gates, validation checks, duplicate checks, eligibility rules. |
| Page Builder | Role-based routing, UI state checks, API response checks. |
| Report Builder | Row filtering, threshold alerts, bulk-action safety checks. |

### Node Properties

| Property | Description |
| --- | --- |
| Expression | Rule expression. |
| Operator | AND, OR, equals, contains, greater than, less than. |
| True Branch | Branch for passing condition. |
| False Branch | Branch for failing condition. |
| Error Branch | Optional branch for evaluation errors. |

### Right-Side Config Panel

#### General

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Node Label | Text | Yes | Example: `Is Manager Approval Required?`. |
| Description | Textarea | No | Internal explanation. |
| Enabled | Toggle | Yes | Allows disabling without deleting. |

#### Action

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Rule Mode | Select | Yes | Visual builder, expression, JSON logic. |
| Expression | Expression Editor | Conditional | Required in expression mode. |
| Conditions | Rule Builder | Conditional | Required in visual mode. |
| Match Type | Select | Yes | All, any, custom. |
| True Branch Label | Text | No | Label for true edge. |
| False Branch Label | Text | No | Label for false edge. |
| Error Branch Enabled | Toggle | No | Adds error path. |

#### Input Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Condition Inputs | Mapping Editor | No | Values used in rules. |
| Variable Source | Variable Picker | No | Previous node or context. |

#### Output Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Result Key | Text | No | Stores true/false result. |
| Matched Rule Key | Text | No | Stores matched condition. |

#### Validation

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Require Rule | Toggle | Yes | Prevents empty condition. |
| Require True Branch | Toggle | Yes | Ensures branch is connected. |
| Require False Branch | Toggle | Yes | Ensures branch is connected. |
| Validate Expression Syntax | Toggle | Yes | Prevents runtime errors. |

#### Error Handling

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| On Evaluation Error | Select | Yes | Stop, false branch, error branch. |

#### Permissions

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Advanced Expression Roles | Multi Select | No | Controls who can use raw expression mode. |

#### Advanced

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Test Input | JSON Editor | No | Used to test rule. |
| Evaluation Preview | Readonly | No | Shows result for sample input. |

## 8. Page Trigger Node

### Purpose

Starts a workflow from Page Builder interactions.

### Used In

| Builder | Usage |
| --- | --- |
| Form Builder | Limited use when form is embedded inside page. |
| Page Builder | Primary node for page load, widget click, widget change, route change, and custom UI events. |
| Report Builder | Can trigger from report widget embedded on a page. |

### Node Properties

| Property | Description |
| --- | --- |
| Page ID | Source page. |
| Widget ID | Source widget. |
| Event Name | Click, load, change, submit, route enter, custom. |
| Payload Schema | Shape of event payload. |

### Right-Side Config Panel

#### General

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Node Label | Text | Yes | Example: `On Button Click`. |
| Description | Textarea | No | Internal explanation. |
| Enabled | Toggle | Yes | Allows disabling without deleting. |

#### Trigger

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Page | Select | Yes | Source page. |
| Widget | Select | Conditional | Required for widget events. |
| Event | Select | Yes | Click, Load, Change, Submit, Custom. |
| Event Name | Text | Conditional | Required for custom events. |
| Debounce | Duration | No | Useful for input/change events. |
| Prevent Default | Toggle | No | Stops default UI behavior. |

#### Input Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Event Payload | Schema Editor | No | Defines event data. |
| Include Page Params | Toggle | No | Adds route/query params. |
| Include Widget State | Toggle | No | Adds selected widget state. |

#### Output Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Event Output Key | Text | No | Default: `pageEvent`. |
| Exposed Fields | Field Picker | No | Controls downstream payload. |

#### Validation

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Require Page | Toggle | Yes | Prevents orphan trigger. |
| Require Event | Toggle | Yes | Prevents unknown trigger. |
| Validate Widget Exists | Toggle | Yes | Prevents stale widget references. |

#### Error Handling

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| On Missing Widget | Select | No | Disable workflow, warn, fail save. |

#### Permissions

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Allowed Page Roles | Multi Select | No | Roles allowed to trigger. |

#### Advanced

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Event Listener Mode | Select | No | Once, always, throttled. |
| Test Event Payload | JSON Editor | No | Sample data. |

## 9. Set Widget Data Node

### Purpose

Updates a Page Builder widget with data produced by the workflow.

### Used In

| Builder | Usage |
| --- | --- |
| Form Builder | Update embedded page widgets after form events. |
| Page Builder | Primary action for refreshing tables, charts, cards, lists, or custom widgets. |
| Report Builder | Update report widgets or page-level report summaries. |

### Node Properties

| Property | Description |
| --- | --- |
| Target Widget | Widget to update. |
| Data Source | Data to assign. |
| Transformation | Optional mapping or formatting. |
| Refresh Strategy | Replace, merge, append, patch. |

### Right-Side Config Panel

#### General

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Node Label | Text | Yes | Example: `Update Results Table`. |
| Description | Textarea | No | Internal explanation. |
| Enabled | Toggle | Yes | Allows disabling without deleting. |

#### Action

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Target Page | Select | Yes | Page containing widget. |
| Target Widget | Select | Yes | Widget to update. |
| Data Source | Mapping Editor | Yes | Data from previous node or variables. |
| Refresh Strategy | Select | Yes | Replace, Merge, Append, Patch. |
| Loading State | Toggle | No | Shows widget loading during update. |
| Empty State Message | Text | No | Message when data is empty. |

#### Input Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Widget Data | Mapping Editor | Yes | Final data passed to widget. |
| Widget Props | Mapping Editor | No | Optional property updates. |

#### Output Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Update Status Key | Text | No | Stores success/failure. |
| Updated Widget Key | Text | No | Stores target widget id. |

#### Validation

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Require Target Widget | Toggle | Yes | Prevents incomplete update. |
| Validate Data Shape | Toggle | No | Checks widget-compatible data. |
| Empty Data Behavior | Select | No | Show empty state, keep old data, clear widget. |

#### Error Handling

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| On Widget Update Failure | Select | No | Stop, continue, show notification, fallback branch. |

#### Permissions

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Allowed Page Roles | Multi Select | No | Roles allowed to update this widget. |

#### Advanced

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Patch Path | Text | Conditional | Used for patch strategy. |
| Animation | Select | No | None, fade, highlight, pulse. |
| Metadata | JSON Editor | No | Runtime metadata. |

## 10. HTTP Request Node

### Purpose

Runs a lightweight HTTP request from a page, form, report, or workflow context without requiring a full integration object.

### Used In

| Builder | Usage |
| --- | --- |
| Form Builder | Simple webhook or validation call. |
| Page Builder | Button-click API action or widget data fetch. |
| Report Builder | Push selected row data to an endpoint. |

### Node Properties

| Property | Description |
| --- | --- |
| Method | HTTP method. |
| URL | Endpoint. |
| Headers | Request headers. |
| Body | Request payload. |
| Response Mapping | Maps response to workflow variables. |

### Right-Side Config Panel

#### General

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Node Label | Text | Yes | Example: `Post Approval Webhook`. |
| Description | Textarea | No | Internal explanation. |
| Enabled | Toggle | Yes | Allows disabling without deleting. |

#### Action

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Method | Select | Yes | GET, POST, PUT, PATCH, DELETE. |
| URL | Text | Yes | Supports variables. |
| Headers | Key-Value Editor | No | Request headers. |
| Query Params | Key-Value Editor | No | URL query params. |
| Body | JSON/Text Editor | No | Request body. |
| Timeout | Duration | No | Request timeout. |

#### Input Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Request Variables | Mapping Editor | No | Builds request values. |
| Body Mapping | Mapping Editor | No | Dynamic payload. |

#### Output Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Response Key | Text | Yes | Default: `httpResponse`. |
| Extract Path | Text | No | JSON path extraction. |

#### Validation

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Require URL | Toggle | Yes | Prevents blank request. |
| Validate URL Format | Toggle | Yes | Prevents invalid URLs. |
| Allowed Status Codes | Text | No | Example: `200,201`. |

#### Error Handling

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Retry Count | Number | No | Retry failures. |
| On Failure | Select | No | Stop, continue, fallback branch. |

#### Permissions

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Allowed Domains | List Editor | No | Security allowlist. |

#### Advanced

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Raw Request Preview | Readonly Code | No | Shows final request. |
| Metadata | JSON Editor | No | Runtime metadata. |

## 11. Navigate Node

### Purpose

Navigates the user to another page, route, record detail, report, or external URL.

### Used In

| Builder | Usage |
| --- | --- |
| Form Builder | Redirect after submit, approval, or cancellation. |
| Page Builder | Guided page flows, drilldowns, redirects, wizard steps. |
| Report Builder | Open detail page from selected row or report action. |

### Node Properties

| Property | Description |
| --- | --- |
| Target Route | Destination route or page. |
| Params | Route/query parameters. |
| Preserve State | Whether to keep page state. |
| Navigation Mode | Push, replace, new tab, modal. |

### Right-Side Config Panel

#### General

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Node Label | Text | Yes | Example: `Open Employee Detail`. |
| Description | Textarea | No | Internal explanation. |
| Enabled | Toggle | Yes | Allows disabling without deleting. |

#### Action

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Target Type | Select | Yes | Page, route, record detail, report, external URL. |
| Target Page/Route | Select/Text | Yes | Destination. |
| Navigation Mode | Select | Yes | Push, replace, new tab, modal. |
| Preserve State | Toggle | No | Keeps existing page state. |
| Query Params | Key-Value Editor | No | URL query values. |
| Route Params | Key-Value Editor | No | Dynamic route values. |

#### Input Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Param Values | Mapping Editor | No | Dynamic route/query params. |
| State Payload | Mapping Editor | No | Data passed to destination. |

#### Output Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Navigation Status Key | Text | No | Stores navigation result. |

#### Validation

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Require Target | Toggle | Yes | Prevents blank navigation. |
| Validate Route Exists | Toggle | No | Checks internal pages/routes. |

#### Error Handling

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| On Navigation Failure | Select | No | Stop, continue, show notification. |

#### Permissions

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Required Role | Multi Select | No | Restricts navigation destination. |

#### Advanced

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Open Delay | Duration | No | Optional delay before navigation. |
| Metadata | JSON Editor | No | Runtime metadata. |

## 12. Show Notification Node

### Purpose

Displays toast, banner, inline, modal, or widget-level feedback to the user.

### Used In

| Builder | Usage |
| --- | --- |
| Form Builder | Shows submit success, validation failure, approval result, or warning. |
| Page Builder | Shows feedback after page actions. |
| Report Builder | Shows export complete, bulk update result, or alert message. |

### Node Properties

| Property | Description |
| --- | --- |
| Message | Notification text. |
| Severity | Success, error, warning, info. |
| Duration | Auto-dismiss duration. |
| Action Label | Optional CTA. |
| Display Target | Toast, banner, inline, modal, widget. |

### Right-Side Config Panel

#### General

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Node Label | Text | Yes | Example: `Show Success Toast`. |
| Description | Textarea | No | Internal explanation. |
| Enabled | Toggle | Yes | Allows disabling without deleting. |

#### Action

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Message | Textarea | Yes | Supports variables. |
| Severity | Select | Yes | Success, Error, Warning, Info. |
| Display Target | Select | Yes | Toast, Banner, Inline, Modal, Widget. |
| Duration | Duration | No | Auto-dismiss. |
| Action Label | Text | No | Optional CTA text. |
| Action Behavior | Select | Conditional | Navigate, retry, open URL, emit event. |

#### Input Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Message Variables | Mapping Editor | No | Dynamic values. |
| Target Widget | Select | Conditional | Required for widget/inline target. |

#### Output Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Notification ID Key | Text | No | Stores notification id. |
| Action Clicked Key | Text | No | Stores CTA result if clicked. |

#### Validation

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Require Message | Toggle | Yes | Prevents blank notification. |
| Max Message Length | Number | No | Optional limit. |

#### Error Handling

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| On Display Failure | Select | No | Continue, stop, log only. |

#### Permissions

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Visible To Roles | Multi Select | No | Controls who sees notification. |

#### Advanced

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Custom CSS Class | Text | No | Optional class token. |
| Metadata | JSON Editor | No | Runtime metadata. |

## 13. Transform Data Node

### Purpose

Transforms, maps, filters, formats, or normalizes data between workflow nodes.

### Used In

| Builder | Usage |
| --- | --- |
| Form Builder | Convert form payload into database/API format. |
| Page Builder | Convert API or database results into widget data. |
| Report Builder | Format rows for export, email, charts, summaries, or API sync. |

### Node Properties

| Property | Description |
| --- | --- |
| Input Schema | Expected input shape. |
| Output Schema | Result shape. |
| Mapping Rules | Field-to-field mappings. |
| Transform Function | Optional custom function. |
| Formatters | Date, number, currency, text helpers. |

### Right-Side Config Panel

#### General

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Node Label | Text | Yes | Example: `Format CRM Payload`. |
| Description | Textarea | No | Internal explanation. |
| Enabled | Toggle | Yes | Allows disabling without deleting. |

#### Action

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Transform Mode | Select | Yes | Visual mapping, expression, code function, template. |
| Input Schema | Schema Editor | No | Expected input. |
| Output Schema | Schema Editor | No | Expected output. |
| Mapping Rules | Mapping Editor | Conditional | Required in visual mapping mode. |
| Expression | Expression Editor | Conditional | Required in expression mode. |
| Function | Code Editor | Conditional | Required in code mode. |

#### Input Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Input Data Source | Mapping Editor | Yes | Previous node, context, variables. |
| Default Values | Mapping Editor | No | Used when input is missing. |

#### Output Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Output Key | Text | Yes | Example: `formattedPayload`. |
| Output Fields | Mapping Editor | No | Exposed downstream fields. |

#### Validation

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Validate Input Schema | Toggle | No | Checks input before transform. |
| Validate Output Schema | Toggle | No | Checks output after transform. |
| Missing Field Behavior | Select | No | Fail, use default, omit. |

#### Error Handling

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| On Transform Error | Select | No | Stop, continue, fallback branch. |
| Fallback Output | JSON Editor | No | Used when transform fails. |

#### Permissions

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Code Mode Allowed Roles | Multi Select | No | Restricts custom code usage. |

#### Advanced

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Test Input | JSON Editor | No | Sample input. |
| Preview Output | Readonly JSON | No | Shows transformation result. |
| Metadata | JSON Editor | No | Runtime metadata. |

## 14. Upload to CDN Node

### Purpose

Uploads files, generated assets, reports, PDFs, images, or form attachments to CDN/cloud storage.

### Used In

| Builder | Usage |
| --- | --- |
| Form Builder | Upload submitted attachments, generated PDFs, or documents. |
| Page Builder | Upload files selected from page widgets. |
| Report Builder | Store exported CSV, Excel, PDF, or generated report files. |

### Node Properties

| Property | Description |
| --- | --- |
| File Source | File from form, widget, report export, previous node, or generated output. |
| Bucket | Storage bucket. |
| Path | Upload path. |
| Visibility | Public or private. |
| Metadata | File metadata. |
| Retention Policy | Storage retention rules. |

### Right-Side Config Panel

#### General

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Node Label | Text | Yes | Example: `Upload Report Export`. |
| Description | Textarea | No | Internal explanation. |
| Enabled | Toggle | Yes | Allows disabling without deleting. |

#### Action

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| File Source | Select/Mapping Editor | Yes | Form file, widget file, report export, previous node. |
| Bucket | Select | Yes | Target storage bucket. |
| Path | Text | Yes | Supports variables. |
| File Name | Text | No | Custom output file name. |
| Visibility | Select | Yes | Public, private, signed URL. |
| Content Type | Select/Text | No | MIME type. |
| Overwrite Existing | Toggle | No | Controls duplicate names. |
| Retention Policy | Select | No | None, days, permanent, archive. |

#### Input Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| File Input | Mapping Editor | Yes | Runtime file object or URL. |
| Path Variables | Mapping Editor | No | Dynamic folder/name values. |
| Metadata Fields | Key-Value Editor | No | Stored with file. |

#### Output Mapping

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| File URL Key | Text | Yes | Example: `uploadedFileUrl`. |
| File ID Key | Text | No | Stores storage id. |
| Signed URL Key | Text | Conditional | When visibility is signed URL. |

#### Validation

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Require File | Toggle | Yes | Prevents empty upload. |
| Max File Size | Size Input | No | Upload limit. |
| Allowed File Types | Multi Select | No | PDF, CSV, XLSX, PNG, JPG, DOCX. |
| Validate Bucket Access | Toggle | Yes | Prevents runtime permission issues. |

#### Error Handling

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Retry Count | Number | No | Retry upload failures. |
| On Upload Failure | Select | No | Stop, continue, fallback branch. |
| Fallback File URL | Text | No | Optional fallback. |

#### Permissions

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| Allowed Upload Roles | Multi Select | No | Controls who can upload. |
| Private File Access Roles | Multi Select | Conditional | Required for private files. |

#### Advanced

| Option | Type | Required | Notes |
| --- | --- | --- | --- |
| CDN Cache Control | Text | No | Example: `public, max-age=3600`. |
| Generate Thumbnail | Toggle | No | For images/PDF previews. |
| Virus Scan Required | Toggle | No | Enterprise security option. |
| Metadata | JSON Editor | No | Runtime metadata. |

## Recommended Implementation Notes

1. Store all node definitions in a typed registry instead of a simple palette config.
2. Generate the node library from the registry.
3. Generate the right-side config panel from each node's `configSchema`.
4. Use shared QuantaOps UI controls for all fields.
5. Keep Start and End as core system nodes.
6. Prevent deleting Start.
7. Validate all required fields before save.
8. Support `allowedBuilders` so Form Builder, Page Builder, and Report Builder can show only relevant nodes.
9. Store node config in workflow JSON as runtime-compatible payloads.
10. Add tests for every node schema, required field validation, and panel rendering.
