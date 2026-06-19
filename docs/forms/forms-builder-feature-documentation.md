# Forms Builder Feature Documentation

## 1. Overview

The Forms Builder feature in Builder allows users to create, configure, preview, save, and test data-entry forms inside the Quanta Ops Builder application.

Its current scope is still frontend-driven, but the stored JSON contracts are now shaped to support stronger form persistence and submission tracking:

- create a new form from a datasource-linked query
- auto-generate initial form fields from datasource query columns
- edit field properties in a field inspector
- save detailed form metadata to browser local storage
- preview and validate the form before publishing
- capture mock submissions in browser local storage using query-ready payloads

The current implementation is intentionally designed so that static/mock datasource and query handling can later be replaced with real backend integrations.

## 2. Main Flow

### 2.1 New Form Flow

The `New Form` action opens a dedicated full-screen creation experience instead of a popup modal.

The flow is:

1. Enter `Form Name`
2. Enter `Description`
3. Select a `Datasource`
4. Select a `Query`
5. Load the query columns automatically
6. Review the suggested field mappings
7. Adjust any field types if needed
8. Create the form

### 2.2 Datasource Query Selection

The datasource/query configuration is currently static/mock.

Each selectable query already represents a datasource and dummy query combination, for example:

- `qo_hrms_stage.queries.attendance_upsert`
- `qo_hrms_stage.queries.leave_request_create`
- `qo_hrms_prod.queries.employee_profile_save`

This keeps the user flow simple while still preserving form-related metadata such as:

- datasource id
- datasource label
- query id
- query label
- qualified query name
- query text
- expected datasource input

### 2.3 Column Loading and Field Auto-Mapping

Once the query is selected, columns are loaded automatically.

The Builder then auto-suggests form field types based on:

- column datatype
- column name patterns
- lookup/options metadata

Examples:

- `employee_name` -> `Name`
- `employee_email` -> `Email`
- `phone_number` -> `Phone`
- `attendance_date` -> `Date Picker`
- `check_in_time` -> `Time`
- `profile_updated_at` -> `Date-Time`
- `salary_amount` -> `Currency`
- `shift_hours` -> `Decimal`
- `active_status` -> `Decision Box`
- `notes` or `reason` -> `Long Text`

### 2.4 Editable Mapping Review

Before the form is created, the user sees a field-mapping review screen.

This screen:

- shows each datasource column
- shows the suggested field type
- allows the user to change the mapping manually

The reviewed mapping is the same mapping used during final form creation and later submission-to-query payload generation.

## 3. Forms Builder Capabilities

### 3.1 Supported Field Types

Current supported field types include:

- Name
- Email
- Address
- Phone
- Single Line
- Multi Line
- Number
- Decimal
- Currency
- Percent
- Date
- Time
- Date-Time
- Dropdown
- Radio
- Multi Select
- Checkbox
- Decision Box
- URL
- Rich Text
- Signature
- Image
- Audio
- Video
- File Upload

### 3.2 Field Properties

The Builder supports a broad set of per-field properties, including:

- field name and link name
- placeholder
- required / mandatory
- duplicate restriction
- width / field size
- description mode
- field layout
- default / initial value
- validation-related settings
- field-type-specific settings for name, address, phone, numeric, date/time, choice, and media fields

Each field maintains its own independent property state inside the Builder.

### 3.3 Preview Behavior

The preview modal supports property-driven behavior for the active Builder scope, including:

- labels and placeholders
- required validation
- text, number, decimal, currency, and date/time input handling
- choice-based interactions
- name/address structured input behavior
- rich text editing
- signature capture
- simplified image/audio/video/file preview behavior

### 3.4 Submission Behavior

Submitting a preview form creates a mock submission payload based on the form values.

The payload is stored in browser local storage under:

`qo.builder.form-builder.submissions.v1`

Submissions are grouped by form and stored as an array of records for each form.

Each record now includes:

- UUID submission id
- dummy user UUID
- dummy JWT token
- submitted timestamp
- raw input JSON
- datasource request metadata
- mapped datasource input JSON
- field-to-query mapping metadata

### 3.5 Submission Viewer / Debug Behavior

The Builder includes a simple submission viewer for testing.

This allows users to:

- inspect saved submission records for the selected form
- review the full saved JSON payload
- clear saved submissions for that form

## 4. Simplified Scope and Active Constraints

### 4.1 Intentionally Simplified Areas

Some parts are intentionally simplified for the current Builder scope:

- image configuration is reduced to practical frontend-supported options
- file upload is reduced to practical local upload behavior
- datasource and query handling is static/mock
- preview submission is stored in local storage instead of being sent to a backend
- user identity and JWT token values are stored as dummy placeholders

### 4.2 Static / Mock Datasource Behavior

The datasource query layer currently uses static configuration for:

- datasource options
- query options
- query text
- expected input metadata
- column metadata

### 4.3 Local Storage Instead of Backend

The following are still frontend/mock behaviors:

- saved form definitions
- saved mock form submissions
- preview submission persistence
- submission viewer/debug inspection

### 4.4 Active Media Scope

The media configuration surface is intentionally reduced to the currently supported Builder behavior.

The active supported media properties are:

- Image: `mediaSource`, `imageUploadType`, `maxFileCount`
- File Upload: `acceptedFileTypes`, `maxFileSizeMb`, `fileUploadType`, `maxFileCount`

## 5. JSON Contracts

### 5.1 Form Creation JSON

The form creation JSON represents the payload produced when the user completes `Create Form`.

Example:

```json
{
  "formId": "59a95314-c15d-4f35-89db-730721d202d2",
  "name": "Leave Request Form",
  "description": "Capture leave request details and approval-ready metadata.",
  "datasourceId": "f8f8fc83-48b5-45f0-a2b2-67cb4487f13f",
  "datasourceLabel": "qo_hrms_stage",
  "queryId": "1efac17d-9d33-4883-b4eb-79d52dc00389",
  "queryLabel": "Leave Request Create Query",
  "queryText": "INSERT INTO leave_requests (employee_name, employee_email, employee_phone, leave_type, start_date, end_date, half_day, reason, submitted_at) VALUES (:employee_name, :employee_email, :employee_phone, :leave_type, :start_date, :end_date, :half_day, :reason, :submitted_at)",
  "userId": "94efaa44-38aa-46e3-bb0d-7b7f6fd73d43",
  "jwtToken": "mock-jwt-token-builder-user",
  "createdAt": "2026-05-15T09:00:00.000Z",
  "modifiedAt": "2026-05-15T09:00:00.000Z",
  "fieldMappings": [
    {
      "columnId": "employee_name",
      "queryParam": "employee_name",
      "fieldType": "Name"
    },
    {
      "columnId": "employee_email",
      "queryParam": "employee_email",
      "fieldType": "Email"
    },
    {
      "columnId": "leave_type",
      "queryParam": "leave_type",
      "fieldType": "Dropdown"
    }
  ]
}
```

### 5.2 Saved Form JSON

The saved form JSON is the full persisted Builder form definition stored in local storage under:

`qo.builder.form-builder.forms.v2`

Example:

```json
[
  {
    "id": "59a95314-c15d-4f35-89db-730721d202d2",
    "shortCode": "LR",
    "name": "Leave Request Form",
    "typeLabel": "Form",
    "status": "live",
    "description": "Capture leave request details and approval-ready metadata.",
    "datasourceId": "f8f8fc83-48b5-45f0-a2b2-67cb4487f13f",
    "datasourceLabel": "qo_hrms_stage",
    "queryId": "1efac17d-9d33-4883-b4eb-79d52dc00389",
    "queryLabel": "Leave Request Create Query",
    "queryText": "INSERT INTO leave_requests (employee_name, employee_email, employee_phone, leave_type, start_date, end_date, half_day, reason, submitted_at) VALUES (:employee_name, :employee_email, :employee_phone, :leave_type, :start_date, :end_date, :half_day, :reason, :submitted_at)",
    "queryQualifiedName": "qo_hrms_stage.queries.leave_request_create",
    "expectedDatasourceInput": [
      {
        "key": "employee_name",
        "label": "Employee Name",
        "type": "string",
        "required": true,
        "sourceColumnId": "employee_name"
      },
      {
        "key": "employee_email",
        "label": "Employee Email",
        "type": "string",
        "required": true,
        "sourceColumnId": "employee_email"
      },
      {
        "key": "leave_type",
        "label": "Leave Type",
        "type": "string",
        "required": true,
        "sourceColumnId": "leave_type"
      }
    ],
    "fieldMappings": [
      {
        "columnId": "employee_name",
        "queryParam": "employee_name",
        "fieldType": "Name"
      },
      {
        "columnId": "employee_email",
        "queryParam": "employee_email",
        "fieldType": "Email"
      }
    ],
    "userId": "94efaa44-38aa-46e3-bb0d-7b7f6fd73d43",
    "jwtToken": "mock-jwt-token-builder-user",
    "createdAt": "2026-05-15T09:00:00.000Z",
    "modifiedAt": "2026-05-15T09:30:00.000Z",
    "fields": [
      {
        "id": "field_50f4cf42-e5c3-4d0f-a1e6-26086273c403",
        "label": "Employee Name",
        "type": "Name",
        "binding": "employee_name"
      }
    ],
    "settings": {
      "formLayout": "Single Column",
      "labelPlacement": "Top",
      "showSectionBorders": false,
      "submitBehavior": "Show Message",
      "redirectUrl": "",
      "duplicateDetection": "None"
    },
    "actions": [
      {
        "id": "a1",
        "name": "Submit",
        "style": "primary",
        "actionType": "submit"
      }
    ]
  }
]
```

### 5.3 Form Submission JSON

The form submission JSON is produced when the preview form is submitted.

The raw form submission becomes the datasource input JSON, and the mapping into datasource query parameters is captured in the same record.

Example:

```json
{
  "59a95314-c15d-4f35-89db-730721d202d2": {
    "formId": "59a95314-c15d-4f35-89db-730721d202d2",
    "formName": "Leave Request Form",
    "datasourceId": "f8f8fc83-48b5-45f0-a2b2-67cb4487f13f",
    "datasourceLabel": "qo_hrms_stage",
    "queryId": "1efac17d-9d33-4883-b4eb-79d52dc00389",
    "queryLabel": "Leave Request Create Query",
    "queryText": "INSERT INTO leave_requests (employee_name, employee_email, employee_phone, leave_type, start_date, end_date, half_day, reason, submitted_at) VALUES (:employee_name, :employee_email, :employee_phone, :leave_type, :start_date, :end_date, :half_day, :reason, :submitted_at)",
    "userId": "94efaa44-38aa-46e3-bb0d-7b7f6fd73d43",
    "jwtToken": "mock-jwt-token-builder-user",
    "records": [
      {
        "submissionId": "7f831490-7468-4ae4-bd0d-8df3aad1f991",
        "submittedAt": "2026-05-15T09:45:00.000Z",
        "submittedByUserId": "94efaa44-38aa-46e3-bb0d-7b7f6fd73d43",
        "jwtToken": "mock-jwt-token-builder-user",
        "inputJson": {
          "employee_name": {
            "prefix": "",
            "firstName": "Ava",
            "lastName": "Shah",
            "suffix": ""
          },
          "employee_email": "ava@company.com",
          "leave_type": "Casual",
          "start_date": "2026-05-16",
          "end_date": "2026-05-18",
          "reason": "Family event"
        },
        "datasourceRequest": {
          "datasourceId": "f8f8fc83-48b5-45f0-a2b2-67cb4487f13f",
          "datasourceLabel": "qo_hrms_stage",
          "queryId": "1efac17d-9d33-4883-b4eb-79d52dc00389",
          "queryLabel": "Leave Request Create Query",
          "queryText": "INSERT INTO leave_requests (employee_name, employee_email, employee_phone, leave_type, start_date, end_date, half_day, reason, submitted_at) VALUES (:employee_name, :employee_email, :employee_phone, :leave_type, :start_date, :end_date, :half_day, :reason, :submitted_at)",
          "mappedInput": {
            "employee_name": {
              "prefix": "",
              "firstName": "Ava",
              "lastName": "Shah",
              "suffix": ""
            },
            "employee_email": "ava@company.com",
            "leave_type": "Casual",
            "start_date": "2026-05-16",
            "end_date": "2026-05-18",
            "reason": "Family event"
          },
          "fieldMappings": [
            {
              "queryParam": "employee_name",
              "submissionPath": "inputJson.employee_name"
            },
            {
              "queryParam": "employee_email",
              "submissionPath": "inputJson.employee_email"
            },
            {
              "queryParam": "leave_type",
              "submissionPath": "inputJson.leave_type"
            }
          ]
        }
      }
    ]
  }
}
```

## 6. Example Data Flow

### 6.1 Form Creation

1. User opens `New Form`
2. User enters name and description
3. User selects datasource
4. User selects query
5. Builder loads datasource columns
6. Builder auto-suggests field mappings
7. User reviews or edits mappings
8. Builder creates and saves the form JSON

### 6.2 Preview Submission

1. User opens preview
2. User fills out the form
3. User submits
4. Builder generates a JSON-style input record
5. Builder maps that record into datasource query input JSON
6. Builder stores the full submission record locally with metadata

### 6.3 Local Storage Save

Saved forms are stored under:

`qo.builder.form-builder.forms.v2`

Saved submissions are stored under:

`qo.builder.form-builder.submissions.v1`

### 6.4 Future Reuse in Reports / Pages

The new saved form JSON and submission JSON are intentionally reusable so future modules such as Reports and Pages can consume the same mock data model before backend integration is available.

This is why the Builder now captures:

- query metadata
- expected datasource input
- field mappings
- audit timestamps
- dummy user identity
- dummy JWT token

## 7. Known Limitations and Pending Integrations

### 7.1 Backend-Dependent Items

The following items still need backend or runtime support for full production behavior:

- real datasource reads
- real query execution
- backend-enforced uniqueness and duplicate checks
- lookup-backed live data
- real submission persistence beyond browser local storage
- real user identity and JWT token sourcing

### 7.2 Product-Decision Items

Some behaviors still require product clarification before full implementation, especially where visibility, security, runtime policy, and true query contract enforcement should be applied beyond metadata.

### 7.3 Static / Mock Limitations

Current limitations include:

- datasource options are static
- query options are static
- query text is mocked
- expected datasource input is mocked
- submission execution is simulated only

## 8. Summary

The Forms Builder is in a strong frontend state for its current scope and now stores richer JSON contracts for form persistence and submission handling.

It supports:

- full-screen form creation
- datasource query-aware field generation
- editable field mapping review
- form field/property editing
- preview validation and interaction
- query-based mock local submission storage and inspection

The main next steps are:

- replace static/mock datasource query handling with real backend integration
- replace local storage submissions with real persistence
- source user identity and JWT token from real auth context
- formalize runtime behavior for real query execution
- continue QA hardening and regression coverage
