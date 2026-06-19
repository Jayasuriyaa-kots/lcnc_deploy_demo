Quanta Ops — Low Code Platform
Architecture & Implementation Summary
# Table of Contents

Platform Overview
Architecture Decisions
Decision Summary
AWS Infrastructure
Database Schema
API Design
Auth Flow
Angular Client
Shared Python Packages
Project Structure
# 1. Platform Overview
Quanta Ops is a low-code platform that lets organisations build and deploy internal IT applications. It is composed of three distinct applications, each serving a different user group.

## How the Three Apps Connect
Deployer creates an organization and provisions an application instance
Developer clicks "Open in Builder" from the Deployer → enters Builder pre-loaded for that app
Builder configures all forms, reports, pages, roles, and deployment layout
Publishing in the Builder makes the Client App live at its URL
The Client App sends live metrics (latency, active users, API calls) back up to the Deployer dashboard in real time

## Key Design Separation
User profiles (name, email, phone, status, password reset) → managed in Deployer
User roles and permissions (View/Create/Edit/Delete per form, report, page, down to field level) → configured in Builder, app-specific
A user can have different roles in different apps under the same organization
# 2. Architecture Decisions
## Three Separate Frontends and Backends
Three Angular SPAs + three FastAPI services, all in a single Nx monorepo.

## Authentication
Self-hosted FastAPI auth service.
A dedicated FastAPI service issues short-lived JWTs with three scopes:
`platform` → Deployer
`builder` → Builder
`app:{id}` → Client App
Handles token refresh, logout, password reset email dispatch
Shared via `qo-auth` Python package and Angular `auth-lib`
FastAPI's built-in `OAuth2PasswordBearer` + `python-jose` handles token flow
## Database Structure
One RDS PostgreSQL instance, three schemas — not three separate databases.

Cross-schema access enforced via PostgreSQL grants (read-only where appropriate).

## Direct SQL

No ORM — direct SQL with psycopg3 (async).
`psycopg3` chosen over `psycopg2` — async-native, actively maintained, pairs with FastAPI
Parameterized queries only — no string interpolation
Custom migration runner in `qo-db` package (raw `.sql` files)

## Caching and Sessions
DynamoDB — not Redis or ElastiCache.

Free tier covers most customer instances (25GB + 25 WCU/RCU forever). Eliminates ~$25/mo ElastiCache cost per customer.
## Background Jobs

Celery on ECS with SQS as broker.
SQS as the Celery message broker (serverless, near-zero cost)
Celery workers run as ECS Fargate containers — no EC2 needed
Workers auto-scale based on SQS queue depth
What Celery handles:
`workflow_tasks` — multi-step user-defined automations
`email_tasks` — password reset, billing alerts, publish notifications
`metrics_tasks` — batched metric writes to RDS every 60 seconds
`report_tasks` — large exports saved to S3, user notified on completion
`billing_tasks` — monthly invoices, overdue payment checks (scheduled)

## Customer Data Connectors
Custom connector layer — replicates Hasura-style multi-source connectivity.
The platform's own data lives in PostgreSQL. Customer data can come from any external source via the `qo-connectors` package.

# 3. Decision Summary

# 4. AWS Infrastructure
## Per-Customer Deployment (Single-Tenant)

Route 53          → DNS (deployer / builder / {slug}.quantaops.io)
CloudFront        → CDN for Angular SPAs (hosted on S3)
ALB               → Load balancer → ECS services
ECS (Fargate)     → All FastAPI services + Celery workers
ECR               → Docker image registry
RDS PostgreSQL    → Platform database (3 schemas)
DynamoDB          → Cache + sessions + JWT blacklist
SQS               → Celery task broker
S3                → File storage, reports, backups
Secrets Manager   → DB passwords, JWT secrets, connector credentials

## ECS Services

## Per-Customer Cost Estimate
# 5. Database Schema
## Schema: `platform` — Owned by Deployer API
### `organisations`

### `users`

### `apps`

### `billing_profiles`

### `invoices`

### `payments`

## Schema: `builder` — Owned by Builder API
### `data_sources`

### `roles`

### `permissions`

### `forms`

### `form_fields`

### `pages`

### `workflows`

### `app_users`

## Schema: `runtime` — Owned by Client API

### `form_submissions`

### `job_executions`

### `audit_logs`

### `usage_metrics`

## Cross-Schema Access (PostgreSQL Grants)

-- Builder reads from platform
GRANT SELECT ON platform.users         TO builder_service_user;
GRANT SELECT ON platform.apps          TO builder_service_user;
GRANT ALL    ON ALL TABLES IN SCHEMA builder TO builder_service_user;

-- Client reads from builder
GRANT SELECT ON builder.app_configs    TO client_service_user;
GRANT SELECT ON builder.roles          TO client_service_user;
GRANT SELECT ON builder.permissions    TO client_service_user;
GRANT SELECT ON builder.forms          TO client_service_user;
GRANT SELECT ON builder.form_fields    TO client_service_user;
GRANT SELECT ON builder.pages          TO client_service_user;
GRANT SELECT ON builder.workflows      TO client_service_user;
GRANT ALL    ON ALL TABLES IN SCHEMA runtime TO client_service_user;

-- Deployer reads usage from runtime
GRANT SELECT ON runtime.usage_metrics  TO deployer_service_user;
GRANT ALL    ON ALL TABLES IN SCHEMA platform TO deployer_service_user;

# 6. API Design

## Auth Service — `auth.quantaops.io`

## Deployer API — `api.deployer.quantaops.io/v1`

## Builder API — `api.builder.quantaops.io/v1`

## Client API — `api.{slug}.quantaops.io/v1`

# 7. Auth Flow

## Three Identity Contexts

## Token Structure

## Token Lifetimes

## DynamoDB Token Tables

## Login Flow
POST /auth/login  { email, password, scope }
        ↓
1. Fetch user by email from platform.users
2. Verify bcrypt password hash
3. Check user.status == "active"
4. Check org.status == "active"
5. Build token payload based on scope
6. Sign access token (15min) + refresh token (30d)
7. Store refresh token in DynamoDB
8. Update last_login_at
9. Return { access_token, refresh_token, expires_in }

## Refresh Flow

POST /auth/refresh  (refresh token in httpOnly cookie)
        ↓
1. Decode refresh token
2. Look up jti in DynamoDB — check not revoked
3. Re-fetch user — validate still active
4. Revoke OLD refresh token (token rotation)
5. Issue NEW access + refresh token pair
6. Store new refresh token in DynamoDB

## Logout Flow

POST /auth/logout
        ↓
1. Revoke refresh token in DynamoDB
2. Blacklist access token jti in DynamoDB
3. Angular clears access token from memory

## Security Rules

# 8. Angular Client

## Nx Library Structure

## Angular 18 Patterns

## App Routing

## Path Aliases (tsconfig.base.json)

{
  "@quanta-ops/models":        "libs/models/src/index.ts",
  "@quanta-ops/auth-lib":      "libs/auth-lib/src/index.ts",
  "@quanta-ops/api-client":    "libs/api-client/src/index.ts",
  "@quanta-ops/ui-components": "libs/ui-components/src/index.ts"
}

# 9. Shared Python Packages

## pyproject.toml Pattern (per service)

[project]
dependencies = [
  "fastapi>=0.111.0",
  "uvicorn[standard]>=0.29.0",
  "psycopg[async]>=3.1.0",
  "psycopg-pool>=3.2.0",
  "qo-auth        @ file://../../packages/qo-auth",
  "qo-db          @ file://../../packages/qo-db",
  "qo-utils       @ file://../../packages/qo-utils",
  "qo-connectors  @ file://../../packages/qo-connectors",
]

# 10. Project Structure

quanta-ops/                              ← Nx monorepo root
│
├── nx.json
├── package.json
├── tsconfig.base.json
├── docker-compose.yml
│
├── apps/
│   │
│   ├── deployer/                        ← Angular SPA (Quanta Ops staff)
│   │   └── src/app/
│   │       ├── app.config.ts
│   │       ├── app.routes.ts
│   │       ├── layout/shell.component.ts
│   │       └── pages/
│   │           ├── login/
│   │           ├── dashboard/
│   │           ├── organisations/
│   │           ├── users/
│   │           ├── apps/
│   │           └── billing/
│   │
│   ├── builder/                         ← Angular SPA (Developers)
│   │   └── src/app/
│   │       ├── app.routes.ts
│   │       ├── layout/builder-shell.component.ts
│   │       └── pages/
│   │           ├── login/
│   │           ├── apps/
│   │           ├── app-workspace/
│   │           ├── forms/               ← forms.component + form-editor.component
│   │           ├── pages/               ← pages.component + page-editor.component
│   │           ├── workflows/
│   │           ├── data-sources/
│   │           ├── roles/
│   │           └── users/
│   │
│   ├── client/                          ← Angular SPA (End users)
│   │   └── src/app/
│   │       ├── app.routes.ts
│   │       ├── layout/client-shell.component.ts
│   │       ├── pages/
│   │       │   ├── login/
│   │       │   └── page-view/
│   │       └── components/
│   │           ├── dynamic-form/
│   │           └── dynamic-report/
│   │
│   ├── deployer-api/                    ← FastAPI (scope: platform)
│   │   ├── Dockerfile
│   │   ├── pyproject.toml
│   │   └── app/
│   │       ├── main.py
│   │       ├── core/                    ← config, database, security
│   │       ├── api/v1/                  ← organisations, users, apps, billing, dashboard
│   │       ├── repositories/            ← raw SQL queries
│   │       ├── services/                ← business logic
│   │       └── schemas/                 ← Pydantic request/response models
│   │
│   ├── builder-api/                     ← FastAPI (scope: builder)
│   │   ├── Dockerfile
│   │   ├── pyproject.toml
│   │   └── app/
│   │       ├── main.py
│   │       ├── core/
│   │       ├── api/v1/                  ← forms, pages, workflows, roles, data_sources, app_users
│   │       ├── repositories/
│   │       ├── services/
│   │       └── schemas/
│   │
│   ├── client-api/                      ← FastAPI (scope: app:{id})
│   │   ├── Dockerfile
│   │   ├── pyproject.toml
│   │   └── app/
│   │       ├── main.py
│   │       ├── core/
│   │       ├── api/v1/                  ← render, submissions, query, workflows, metrics
│   │       ├── repositories/
│   │       ├── services/
│   │       └── schemas/
│   │
│   └── worker/                          ← Celery workers (ECS)
│       ├── Dockerfile
│       └── app/
│           ├── worker.py                ← Celery app + SQS config
│           ├── schedules.py             ← Celery Beat scheduled jobs
│           └── tasks/
│               ├── workflow_tasks.py
│               ├── email_tasks.py
│               ├── metrics_tasks.py
│               ├── report_tasks.py
│               └── billing_tasks.py
│
├── libs/                                ← Shared Angular libraries
│   ├── models/src/lib/                  ← common, platform, builder, client, auth
│   ├── auth-lib/src/lib/                ← AuthService, interceptor, guards
│   ├── api-client/src/lib/              ← deployer/, builder/, client/, auth/
│   └── ui-components/src/lib/           ← button, table, badge, modal, input...
│
├── packages/                            ← Shared Python packages
│   ├── qo-auth/qo_auth/                 ← dependencies, dynamo, permissions
│   ├── qo-db/qo_db/                     ← connection, migration
│   ├── qo-utils/qo_utils/               ← schemas, exceptions, pagination
│   ├── qo-usage/qo_usage/               ← metering
│   └── qo-connectors/qo_connectors/     ← base, factory, postgres, mysql, mongodb, rest_api
│
├── migrations/                          ← Raw SQL migration files
│   ├── platform/                        ← 0001–0006 (orgs, users, apps, billing)
│   ├── builder/                         ← 0001–0008 (forms, pages, workflows, roles)
│   └── runtime/                         ← 0001–0005 (submissions, jobs, audit, metrics)
│
├── services/
│   └── auth-service/                    ← Standalone FastAPI JWT issuer
│       ├── Dockerfile
│       ├── pyproject.toml
│       └── app/
│           ├── main.py
│           ├── api/auth.py
│           └── core/                    ← config, database, jwt, scopes
│
└── infrastructure/
    ├── ecs/                             ← ECS task definitions (5 services)
    ├── rds/                             ← RDS init SQL
    └── s3/                             ← S3 bucket policy

| App | Users | Purpose |
| --- | --- | --- |
| Deployer | QuantaOps team | Control plane — onboard clients, provision app instances, monitor health, manage billing and usage |
| Builder | QuantaOps team | Build plane — design forms, reports, pages, workflows, configure deployment and permissions per app |
| Client App | End users (per org/app) | Runtime plane — the deployed application end users interact with via browser URL |

| Deployable | URL |
| --- | --- |
| Deployer frontend | `deployer.quantaops.io` |
| Builder frontend | `builder.quantaops.io` |
| Client App frontend | `{slug}.quantaops.io` |
| Deployer API | Separate FastAPI container on ECS |
| Builder API | Separate FastAPI container on ECS |
| Client API | Separate FastAPI container on ECS |
| Auth Service | Separate FastAPI container on ECS |

| Schema | Owned by | Tables |
| --- | --- | --- |
| `platform` | Deployer API | `organisations`, `users`, `apps`, `invoices`, `payments`, `billing_profiles` |
| `builder` | Builder API | `app_configs`, `roles`, `permissions`, `forms`, `reports`, `pages`, `workflows` |
| `runtime` | Client API | `form_data`, `sessions`, `audit_logs`, `usage_metrics` |

| Use Case | DynamoDB |
| --- | --- |
| App config cache per render | ✅ TTL supported |
| User permission cache | ✅ TTL supported |
| JWT blacklist on logout | ✅ TTL supported |
| Session storage | ✅ TTL supported |
| Rate limiting | ✅ Conditional writes |

| Connector | Driver |
| --- | --- |
| PostgreSQL | `asyncpg` |
| MySQL | `aiomysql` |
| MongoDB | `motor` |
| REST APIs | `httpx` |
| BigQuery | `google-cloud-bigquery` |

| Decision | Choice | Reason |
| --- | --- | --- |
| Frontend | 3 Angular SPAs — Nx monorepo | Independent deploys + shared libraries |
| Backend | 3 FastAPI services — same monorepo | Async-native, built-in docs, better than Flask |
| Auth | Self-hosted FastAPI auth service | 3 user pools, custom RBAC, cost control |
| Database | RDS PostgreSQL — 3 schemas | Cross-schema joins, single ops overhead |
| DB driver | psycopg3 async | Async-native, replaces legacy psycopg2 |
| ORM | None — direct SQL only | Full query control, consistent team pattern |
| Migrations | Raw `.sql` files + custom runner | No external tool dependency |
| Caching | DynamoDB (TTL-based) | Serverless, free tier, no ElastiCache cost |
| Task broker | SQS | Serverless, replaces Redis for Celery |
| Background jobs | Celery on ECS Fargate | Auto-scales on SQS queue depth, no EC2 |
| File storage | S3 | Reports, uploads, backups |
| Secrets | AWS Secrets Manager | DB passwords, JWT secrets, connector creds |
| Customer connectors | Custom `qo-connectors` layer | asyncpg, aiomysql, motor, httpx |
| Deployment model | Single-tenant — 1 instance per customer | Simpler auth, no multi-tenancy complexity |
| Infrastructure | Fully serverless — ECS Fargate, no EC2 | No servers to manage, pay per use |
| Shared frontend code | Nx Angular libraries | ui-components, auth-lib, api-client, models |
| Shared backend code | Local pip packages | qo-auth, qo-db, qo-utils, qo-usage, qo-connectors |

| Service | Type | Purpose |
| --- | --- | --- |
| `deployer-api` | FastAPI container | Deployer REST API |
| `builder-api` | FastAPI container | Builder REST API |
| `client-api` | FastAPI container | Client App REST API |
| `auth-service` | FastAPI container | JWT issuance and validation |
| `celery-worker-workflow` | Celery container | Workflow execution |
| `celery-worker-email` | Celery container | Email dispatch |
| `celery-worker-metrics` | Celery container | Usage metric aggregation |

| Service | Cost/month | Notes |
| --- | --- | --- |
| ECS Fargate (APIs + workers) | ~$30–50 | Scales with usage |
| RDS PostgreSQL (db.t3.micro) | ~$15 | Single instance, 3 schemas |
| DynamoDB | ~$0 | Free tier covers small/medium customers |
| SQS | ~$0 | Free tier: 1M requests/month |
| S3 | ~$2–5 | Files, reports, backups |
| Secrets Manager | ~$2 | Per secret stored |
| CloudFront + Route 53 | ~$2–5 | CDN + DNS |
| **Total per customer** | **~$50–75/mo** | Scales with customer size |

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK | `gen_random_uuid()` |
| `name` | VARCHAR(255) | NOT NULL |
| `slug` | VARCHAR(100) | UNIQUE — used in subdomain |
| `status` | VARCHAR(20) | `active` / `suspended` / `cancelled` |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK | `gen_random_uuid()` |
| `org_id` | UUID FK | references `organisations(id)` |
| `email` | VARCHAR(255) | UNIQUE |
| `name` | VARCHAR(255) | NOT NULL |
| `phone` | VARCHAR(50) | nullable |
| `password_hash` | TEXT | bcrypt |
| `status` | VARCHAR(20) | `active` / `inactive` / `suspended` |
| `last_login_at` | TIMESTAMPTZ | nullable |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK |  |
| `org_id` | UUID FK | references `organisations(id)` |
| `name` | VARCHAR(255) | NOT NULL |
| `slug` | VARCHAR(100) | UNIQUE |
| `status` | VARCHAR(20) | `draft` / `published` / `suspended` / `archived` |
| `published_at` | TIMESTAMPTZ | nullable |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK |  |
| `org_id` | UUID FK UNIQUE | references `organisations(id)` |
| `plan` | VARCHAR(50) | `starter` / `pro` / `enterprise` |
| `billing_email` | VARCHAR(255) | NOT NULL |
| `billing_name` | VARCHAR(255) | nullable |
| `billing_address` | TEXT | nullable |
| `currency` | CHAR(3) | DEFAULT `USD` |

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK |  |
| `org_id` | UUID FK |  |
| `billing_profile_id` | UUID FK |  |
| `invoice_number` | VARCHAR(50) | UNIQUE e.g. `INV-2026-0001` |
| `status` | VARCHAR(20) | `draft` / `sent` / `paid` / `overdue` / `cancelled` |
| `amount_total` | NUMERIC(12,2) |  |
| `currency` | CHAR(3) |  |
| `due_date` | DATE |  |
| `paid_at` | TIMESTAMPTZ | nullable |

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK |  |
| `invoice_id` | UUID FK |  |
| `org_id` | UUID FK |  |
| `amount` | NUMERIC(12,2) |  |
| `status` | VARCHAR(20) | `pending` / `completed` / `failed` / `refunded` |
| `payment_method` | VARCHAR(50) | card, bank_transfer etc |
| `transaction_id` | VARCHAR(255) | UNIQUE external ref |
| `paid_at` | TIMESTAMPTZ | nullable |

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK |  |
| `app_id` | UUID | ref `platform.apps` |
| `name` | VARCHAR(255) |  |
| `type` | VARCHAR(50) | `postgres` / `mysql` / `mongodb` / `rest_api` / `bigquery` |
| `connection_config` | JSONB | encrypted at app layer |
| `status` | VARCHAR(20) | `active` / `inactive` / `error` |
| `last_tested_at` | TIMESTAMPTZ | nullable |

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK |  |
| `app_id` | UUID | ref `platform.apps` |
| `name` | VARCHAR(100) | UNIQUE per app |
| `description` | TEXT | nullable |
| `is_default` | BOOLEAN | DEFAULT false |

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK |  |
| `role_id` | UUID FK | references `roles(id)` |
| `resource_type` | VARCHAR(50) | `form` / `report` / `page` / `field` / `workflow` |
| `resource_id` | UUID | the specific resource |
| `can_view` | BOOLEAN |  |
| `can_create` | BOOLEAN |  |
| `can_edit` | BOOLEAN |  |
| `can_delete` | BOOLEAN |  |

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK |  |
| `app_id` | UUID | ref `platform.apps` |
| `name` | VARCHAR(255) |  |
| `slug` | VARCHAR(100) | UNIQUE per app |
| `data_source_id` | UUID FK | nullable |
| `status` | VARCHAR(20) | `draft` / `published` / `archived` |
| `published_at` | TIMESTAMPTZ | nullable |

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK |  |
| `form_id` | UUID FK | references `forms(id)` |
| `name` | VARCHAR(100) | UNIQUE per form |
| `label` | VARCHAR(255) |  |
| `type` | VARCHAR(50) | `text` / `number` / `email` / `select` / `file` etc |
| `config` | JSONB | validation, options, placeholder |
| `display_order` | INTEGER |  |
| `required` | BOOLEAN |  |
| `visible` | BOOLEAN |  |

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK |  |
| `app_id` | UUID | ref `platform.apps` |
| `name` | VARCHAR(255) |  |
| `slug` | VARCHAR(100) | UNIQUE per app |
| `layout` | JSONB | grid layout, component placements |
| `display_order` | INTEGER |  |
| `is_home` | BOOLEAN |  |
| `status` | VARCHAR(20) | `draft` / `published` / `archived` |

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK |  |
| `app_id` | UUID | ref `platform.apps` |
| `name` | VARCHAR(255) |  |
| `trigger_type` | VARCHAR(50) | `manual` / `form_submit` / `schedule` / `webhook` |
| `trigger_config` | JSONB | cron expression, form_id, webhook secret |
| `steps` | JSONB | ordered array of step definitions |
| `status` | VARCHAR(20) | `draft` / `active` / `inactive` / `archived` |

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK |  |
| `app_id` | UUID | ref `platform.apps` |
| `user_id` | UUID | ref `platform.users` |
| `role_id` | UUID FK | references `roles(id)` |
| UNIQUE | `(app_id, user_id)` | one role per user per app |

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK |  |
| `app_id` | UUID | ref `platform.apps` |
| `form_id` | UUID | ref `builder.forms` |
| `user_id` | UUID | nullable — ref `platform.users` |
| `data` | JSONB | submitted field values |
| `status` | VARCHAR(20) | `draft` / `submitted` / `approved` / `rejected` |
| `submitted_at` | TIMESTAMPTZ | nullable |

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK |  |
| `app_id` | UUID |  |
| `workflow_id` | UUID | ref `builder.workflows` |
| `celery_task_id` | VARCHAR(255) | Celery task UUID |
| `trigger_type` | VARCHAR(50) | `manual` / `schedule` / `form_submit` |
| `status` | VARCHAR(20) | `pending` / `running` / `completed` / `failed` |
| `input` | JSONB |  |
| `output` | JSONB | nullable |
| `error_message` | TEXT | nullable |
| `steps_log` | JSONB | per-step execution log |

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK |  |
| `app_id` | UUID |  |
| `user_id` | UUID | nullable |
| `action` | VARCHAR(100) | `form.submit` / `record.delete` etc |
| `resource_type` | VARCHAR(50) | `form` / `report` / `page` / `workflow` |
| `resource_id` | UUID | nullable |
| `old_value` | JSONB | nullable |
| `new_value` | JSONB | nullable |
| `ip_address` | INET | nullable |

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK |  |
| `app_id` | UUID |  |
| `org_id` | UUID |  |
| `metric_date` | DATE |  |
| `metric_type` | VARCHAR(50) | `api_calls` / `active_users` / `form_submissions` etc |
| `value` | BIGINT | DEFAULT 0 |
| UNIQUE | `(app_id, metric_date, metric_type)` | enables upsert |

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/login` | Authenticate and receive JWT tokens |
| POST | `/auth/refresh` | Exchange refresh token for new access token |
| POST | `/auth/logout` | Blacklist tokens and end session |
| POST | `/auth/password-reset/request` | Send password reset email |
| POST | `/auth/password-reset/confirm` | Validate token and update password |
| POST | `/auth/change-password` | Authenticated password change |

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/organisations` | List all organisations |
| POST | `/organisations` | Create organisation |
| GET | `/organisations/{id}` | Get organisation |
| PATCH | `/organisations/{id}` | Update organisation |
| DELETE | `/organisations/{id}` | Delete organisation |
| POST | `/organisations/{id}/suspend` | Suspend organisation |
| GET | `/users` | List users |
| POST | `/users` | Create user |
| GET | `/users/{id}` | Get user |
| PATCH | `/users/{id}` | Update user |
| POST | `/users/{id}/suspend` | Suspend user |
| GET | `/apps` | List apps |
| POST | `/apps` | Create app |
| GET | `/apps/{id}` | Get app |
| PATCH | `/apps/{id}` | Update app |
| DELETE | `/apps/{id}` | Delete app |
| GET | `/apps/{id}/usage` | Get app usage metrics |
| GET | `/billing/{org_id}/profile` | Get billing profile |
| PATCH | `/billing/{org_id}/profile` | Update billing profile |
| GET | `/billing/{org_id}/invoices` | List invoices |
| POST | `/billing/{org_id}/invoices` | Create invoice |
| POST | `/billing/invoices/{id}/send` | Send invoice |
| POST | `/billing/invoices/{id}/mark-paid` | Mark invoice paid |
| GET | `/dashboard/stats` | Get platform dashboard stats |
| GET | `/dashboard/usage` | Get platform-wide usage |

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/data-sources` | List data sources |
| POST | `/data-sources` | Create data source |
| GET | `/data-sources/{id}` | Get data source |
| PATCH | `/data-sources/{id}` | Update data source |
| DELETE | `/data-sources/{id}` | Delete data source |
| POST | `/data-sources/{id}/test` | Test connection |
| GET | `/data-sources/{id}/schema` | Get database schema |
| GET | `/roles` | List roles |
| POST | `/roles` | Create role |
| PATCH | `/roles/{id}` | Update role |
| DELETE | `/roles/{id}` | Delete role |
| GET | `/roles/{id}/permissions` | Get role permissions |
| PUT | `/roles/{id}/permissions` | Upsert role permissions |
| GET | `/forms` | List forms |
| POST | `/forms` | Create form |
| GET | `/forms/{id}` | Get form with fields |
| PATCH | `/forms/{id}` | Update form |
| DELETE | `/forms/{id}` | Delete form |
| POST | `/forms/{id}/publish` | Publish form |
| POST | `/forms/{id}/fields` | Add field |
| PATCH | `/forms/{id}/fields/{field_id}` | Update field |
| DELETE | `/forms/{id}/fields/{field_id}` | Delete field |
| PUT | `/forms/{id}/fields/reorder` | Reorder fields |
| GET | `/pages` | List pages |
| POST | `/pages` | Create page |
| GET | `/pages/{id}` | Get page |
| PATCH | `/pages/{id}` | Update page |
| DELETE | `/pages/{id}` | Delete page |
| POST | `/pages/{id}/publish` | Publish page |
| GET | `/workflows` | List workflows |
| POST | `/workflows` | Create workflow |
| GET | `/workflows/{id}` | Get workflow |
| PATCH | `/workflows/{id}` | Update workflow |
| DELETE | `/workflows/{id}` | Delete workflow |
| POST | `/workflows/{id}/activate` | Activate workflow |
| POST | `/workflows/{id}/test-run` | Test run workflow |
| GET | `/apps/{id}/users` | List app users |
| POST | `/apps/{id}/users` | Assign user to app |
| PATCH | `/apps/{id}/users/{user_id}/role` | Change user role |
| DELETE | `/apps/{id}/users/{user_id}` | Remove user from app |

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/render/nav` | Get app navigation + theme |
| GET | `/render/pages/{slug}` | Render full page layout |
| GET | `/render/forms/{id}` | Render form with permissions applied |
| GET | `/submissions` | List submissions |
| POST | `/submissions` | Create submission |
| GET | `/submissions/{id}` | Get submission |
| PATCH | `/submissions/{id}` | Update submission |
| DELETE | `/submissions/{id}` | Delete submission |
| GET | `/submissions/{id}/history` | Get submission audit history |
| POST | `/query` | Execute data source query |
| POST | `/workflows/trigger` | Trigger workflow (async) |
| GET | `/workflows/jobs/{id}` | Poll job status |

| Who is logging in | Scope | Token audience |
| --- | --- | --- |
| Quanta Ops staff | `platform` | Deployer API |
| Quanta Ops developers | `builder` | Builder API |
| Customer end users | `app:{app_id}` | Client API |

| Field | Platform | Builder | App |
| --- | --- | --- | --- |
| `sub` | user_id | user_id | user_id |
| `org_id` | ✅ | ✅ | ✅ |
| `email` | ✅ | ✅ | ✅ |
| `scope` | `"platform"` | `"builder"` | `"app:{id}"` |
| `role` | `admin/support/billing` | `developer` | — |
| `role_id` | — | — | ✅ |
| `app_id` | — | — | ✅ |
| `exp` | 15 min | 15 min | 15 min |
| `jti` | ✅ (blacklist) | ✅ | ✅ |

| Token | Lifetime | Storage |
| --- | --- | --- |
| Access token | 15 minutes | Angular memory only |
| Refresh token | 30 days | httpOnly cookie |
| Reset token | 60 minutes | DynamoDB (hashed, single-use) |

| Table | Purpose | TTL |
| --- | --- | --- |
| `refresh_tokens` | Refresh token metadata | 30 days |
| `token_blacklist` | Revoked access token JTIs | Access token expiry |
| `permission_cache` | Role permissions per role_id | 5 minutes |
| `reset_tokens` | SHA-256 hashed reset tokens | 60 minutes |

| Rule | Implementation |
| --- | --- |
| Passwords | bcrypt hashed — never stored plain |
| Access tokens | Memory only in Angular — never localStorage |
| Refresh tokens | httpOnly cookie — JS cannot access |
| Token rotation | New refresh token issued on every refresh |
| Logout blacklisting | Access token blacklisted in DynamoDB until expiry |
| Reset tokens | SHA-256 hashed in DynamoDB — single use |
| Org suspension | Checked on every login and refresh |
| Failed logins | Same error for wrong email or wrong password |
| Scope isolation | Token locked to scope at issuance |
| Permission cache | DynamoDB TTL 5 minutes |

| Library | Path | Contents |
| --- | --- | --- |
| `models` | `libs/models` | TypeScript interfaces for all API response schemas |
| `auth-lib` | `libs/auth-lib` | `AuthService` (signals), `authInterceptor`, `authGuard`, `scopeGuard` |
| `api-client` | `libs/api-client` | Typed HTTP services for all 4 APIs |
| `ui-components` | `libs/ui-components` | Design system: Button, Table, Badge, Modal, Input, Select, Spinner |

| Pattern | Usage |
| --- | --- |
| Standalone components | No NgModules anywhere |
| Signals | Component state — `signal()`, `computed()`, `effect()` |
| Functional guards | `authGuard`, `scopeGuard('platform')` |
| Functional interceptors | `authInterceptor` — auto token refresh on 401 |
| Lazy loading | Every page/route loaded on demand |
| httpOnly cookie | Refresh token — never accessible to JS |
| Memory-only access token | Cleared on page refresh (intentional) |

| App | Login scope | Route protection |
| --- | --- | --- |
| Deployer | `platform` | `authGuard` + `scopeGuard('platform')` |
| Builder | `builder` | `authGuard` + `scopeGuard('builder')` |
| Client App | `app:{id}` | `authGuard` + `scopeGuard('app')` |

| Package | Path | Contents |
| --- | --- | --- |
| `qo-auth` | `packages/qo-auth` | JWT decode, RBAC decorators, DynamoDB token ops, permission cache |
| `qo-db` | `packages/qo-db` | psycopg3 async pool, migration runner, query helpers |
| `qo-utils` | `packages/qo-utils` | Pagination, serializers, error classes, date helpers |
| `qo-usage` | `packages/qo-usage` | Metering hooks, billing metric recording |
| `qo-connectors` | `packages/qo-connectors` | BaseConnector, factory, PostgreSQL / MySQL / MongoDB / REST drivers |
