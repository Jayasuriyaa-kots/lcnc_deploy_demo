# Quanta Ops — Backend Engineering Guidelines
> FastAPI · Python 3.12 · PostgreSQL · asyncpg (Direct SQL) | April 2026

---

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [Project Structure](#2-project-structure)
3. [OOP and Code Design](#3-oop-and-code-design)
4. [API Design](#4-api-design)
5. [Pydantic Schemas](#5-pydantic-schemas)
6. [Database — Direct SQL](#6-database--direct-sql)
7. [Authentication and Authorization](#7-authentication-and-authorization)
8. [Error Handling](#8-error-handling)
9. [Service Layer and Business Logic](#9-service-layer-and-business-logic)
10. [Dependency Injection](#10-dependency-injection)
11. [Async and Performance](#11-async-and-performance)
12. [Security](#12-security)
13. [Testing](#13-testing)
14. [Logging and Observability](#14-logging-and-observability)
15. [Do's and Don'ts](#15-dos-and-donts)

---

## 1. Purpose and Scope

This document defines the **backend engineering standards** all developers must follow when building or modifying any Quanta Ops backend service.

### Services in scope

| Service | Responsibility |
|---|---|
| `builder-api` | Serves the Builder app — forms, pages, reports, workflows |
| `deployer-api` | Serves the Deployer app — organisations, users, billing, audit |
| `client-api` | Serves the Client App — page rendering, form submission, report data |
| `shared-lib` | Shared models, utilities, base classes used across all services |

### What this document covers
- Project folder structure and naming conventions
- OOP principles — base classes, inheritance, abstraction
- API route design and versioning
- Pydantic schema patterns
- Direct SQL with `asyncpg` — no ORM
- Authentication, authorisation, and RBAC
- Error handling and HTTP status codes
- Service layer design
- Async patterns and performance
- Security rules
- Testing standards
- Logging and observability

### What this document does not cover
- Infrastructure and deployment (see DevOps runbook)
- Frontend Angular patterns (see `quanta-ops-ui-ux-guidelines.md`)
- CI/CD pipelines

---

## 2. Project Structure

Every service follows the same folder structure. Do not invent new top-level folders.

```
builder-api/
├── app/
│   ├── main.py                  ← FastAPI app factory
│   ├── config.py                ← Settings via pydantic-settings
│   ├── dependencies.py          ← Shared FastAPI dependencies
│   │
│   ├── api/
│   │   ├── v1/
│   │   │   ├── router.py        ← Aggregates all v1 routers
│   │   │   ├── forms.py         ← Form endpoints
│   │   │   ├── pages.py         ← Page endpoints
│   │   │   ├── reports.py       ← Report endpoints
│   │   │   └── workflows.py     ← Workflow endpoints
│   │   └── v2/                  ← Future version
│   │
│   ├── services/
│   │   ├── base.py              ← BaseService abstract class
│   │   ├── form_service.py
│   │   ├── page_service.py
│   │   ├── report_service.py
│   │   └── workflow_service.py
│   │
│   ├── repositories/
│   │   ├── base.py              ← BaseRepository abstract class
│   │   ├── form_repository.py
│   │   ├── page_repository.py
│   │   ├── report_repository.py
│   │   └── workflow_repository.py
│   │
│   ├── models/
│   │   ├── base.py              ← Base SQLAlchemy model
│   │   ├── form.py
│   │   ├── page.py
│   │   ├── report.py
│   │   └── workflow.py
│   │
│   ├── schemas/
│   │   ├── base.py              ← Base Pydantic schemas
│   │   ├── form.py
│   │   ├── page.py
│   │   ├── report.py
│   │   └── workflow.py
│   │
│   ├── core/
│   │   ├── database.py          ← DB engine, session factory
│   │   ├── security.py          ← JWT, password hashing
│   │   ├── exceptions.py        ← Custom exception classes
│   │   └── middleware.py        ← CORS, logging, timing middleware
│   │
│   └── utils/
│       ├── pagination.py
│       └── validators.py
│
├── tests/
│   ├── conftest.py
│   ├── unit/
│   └── integration/
│
├── alembic/                     ← DB migrations
├── pyproject.toml
└── Dockerfile
```

### Naming conventions

| Type | Convention | Example |
|---|---|---|
| Files | `snake_case.py` | `form_service.py` |
| Classes | `PascalCase` | `FormService` |
| Functions / methods | `snake_case` | `get_form_by_id` |
| Variables | `snake_case` | `form_data` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_PAGE_SIZE` |
| Routes | `kebab-case` | `/api/v1/form-fields` |
| DB table names | `snake_case` plural | `form_fields` |

---

## 3. OOP and Code Design

### 3.1 The Four OOP Principles — Required

#### Abstraction — use abstract base classes

Every service and repository must have an abstract base class. Never write a service that does not extend `BaseService`.

```python
# app/services/base.py
from abc import ABC, abstractmethod
from typing import Generic, TypeVar

T = TypeVar('T')

class BaseService(ABC, Generic[T]):
    """
    Abstract base for all services.
    Defines the contract every service must fulfil.
    """

    @abstractmethod
    async def get_by_id(self, resource_id: str) -> T:
        ...

    @abstractmethod
    async def create(self, data: dict) -> T:
        ...

    @abstractmethod
    async def update(self, resource_id: str, data: dict) -> T:
        ...

    @abstractmethod
    async def delete(self, resource_id: str) -> bool:
        ...
```

```python
# app/services/form_service.py
from app.services.base import BaseService
from app.models.form import Form

class FormService(BaseService[Form]):

    async def get_by_id(self, form_id: str) -> Form:
        ...

    async def create(self, data: dict) -> Form:
        ...

    async def update(self, form_id: str, data: dict) -> Form:
        ...

    async def delete(self, form_id: str) -> bool:
        ...
```

#### Inheritance — share common behaviour, do not copy it

```python
# ❌ Wrong — copy-pasting the same SQL columns into every repository method
class FormRepository:
    async def create(self, data: dict):
        await self._conn.fetchrow(
            """
            INSERT INTO forms (id, name, created_at, updated_at)  -- copy-pasted columns
            VALUES (gen_random_uuid(), $1, NOW(), NOW())
            RETURNING *
            """, data['name']
        )

class PageRepository:
    async def create(self, data: dict):
        await self._conn.fetchrow(
            """
            INSERT INTO pages (id, title, created_at, updated_at)  -- copy-pasted again
            VALUES (gen_random_uuid(), $1, NOW(), NOW())
            RETURNING *
            """, data['title']
        )

# ✅ Correct — define shared SQL fragments as constants in base, inherit everywhere
class BaseRepository(ABC, Generic[T]):
    # Common column list used in SELECT statements
    BASE_COLS = "id, created_at, updated_at, created_by"

    # Common WHERE clause for soft deletes
    NOT_DELETED = "deleted_at IS NULL"

    # Subclasses declare their table name
    TABLE: str = ''

    async def soft_delete(self, resource_id: str) -> bool:
        result = await self._conn.execute(
            f"UPDATE {self.TABLE} SET deleted_at = NOW() WHERE id = $1 AND {self.NOT_DELETED}",
            resource_id
        )
        return result == 'UPDATE 1'

class FormRepository(BaseRepository[FormResponse]):
    TABLE = 'forms'  # only define what is specific to this repository

    async def get_by_id(self, form_id: str) -> FormResponse | None:
        row = await self._conn.fetchrow(
            f"""
            SELECT {self.BASE_COLS}, name, description, app_id
            FROM {self.TABLE}
            WHERE id = $1 AND {self.NOT_DELETED}
            """, form_id
        )
        return FormResponse(**dict(row)) if row else None
```

#### Encapsulation — keep internals private

```python
# ❌ Wrong — everything public
class FormService:
    def _hash(self, value):   # named private but still accessible
        ...
    def repo = FormRepository()  # direct attribute, no control

# ✅ Correct — inject dependencies, keep internals protected
class FormService(BaseService[Form]):
    def __init__(self, repository: FormRepository) -> None:
        self._repository = repository   # private — injected, not created here

    def __validate_schema(self, data: dict) -> None:  # truly private
        ...
```

#### Polymorphism — same interface, different behaviour

```python
# All exporters share the same interface
class BaseExporter(ABC):
    @abstractmethod
    async def export(self, data: list[dict]) -> bytes:
        ...

class CsvExporter(BaseExporter):
    async def export(self, data: list[dict]) -> bytes:
        # CSV implementation

class PdfExporter(BaseExporter):
    async def export(self, data: list[dict]) -> bytes:
        # PDF implementation

class XlsxExporter(BaseExporter):
    async def export(self, data: list[dict]) -> bytes:
        # XLSX implementation

# Caller doesn't care which exporter — same interface
async def export_report(exporter: BaseExporter, data: list[dict]) -> bytes:
    return await exporter.export(data)
```

### 3.2 SOLID Principles

| Principle | Rule |
|---|---|
| **S** — Single Responsibility | One class does one thing. `FormService` handles form logic only — not auth, not email |
| **O** — Open/Closed | Extend via inheritance, not by modifying base classes |
| **L** — Liskov Substitution | Subclasses must be usable wherever the base class is expected |
| **I** — Interface Segregation | Split large abstract classes into focused interfaces |
| **D** — Dependency Inversion | Services depend on abstractions (repositories), not concrete implementations |

### 3.3 What must NOT be in a route handler

Route handlers must be thin. They only:
1. Accept the request
2. Call the service
3. Return the response

```python
# ❌ Wrong — business logic in the route
@router.post('/forms')
async def create_form(data: FormCreate, db: Session = Depends(get_db)):
    existing = db.query(Form).filter(Form.name == data.name).first()
    if existing:
        raise HTTPException(400, 'Form already exists')
    form = Form(**data.model_dump())
    form.id = str(uuid4())
    db.add(form)
    db.commit()
    return form

# ✅ Correct — route delegates everything to the service
@router.post('/forms', response_model=FormResponse, status_code=201)
async def create_form(
    data: FormCreate,
    service: FormService = Depends(get_form_service)
):
    return await service.create(data)
```

---

## 4. API Design

### 4.1 Versioning

All routes must be versioned. Use URL versioning.

```python
# app/main.py
app.include_router(v1_router, prefix='/api/v1')
app.include_router(v2_router, prefix='/api/v2')  # future
```

Never change a v1 route in a breaking way. Add a v2 endpoint instead.

### 4.2 Route naming

Use plural nouns. No verbs in URLs. Actions are expressed by HTTP method.

```
# ❌ Wrong
GET  /api/v1/getForm/123
POST /api/v1/createForm
POST /api/v1/deleteForm/123

# ✅ Correct
GET    /api/v1/forms/123       ← get one form
POST   /api/v1/forms           ← create a form
PATCH  /api/v1/forms/123       ← update a form
DELETE /api/v1/forms/123       ← delete a form
GET    /api/v1/forms           ← list forms
```

Nested resources for sub-resources:
```
GET  /api/v1/forms/123/fields         ← fields of a specific form
POST /api/v1/forms/123/fields         ← add a field to a form
GET  /api/v1/apps/456/forms           ← all forms in an app
```

### 4.3 HTTP methods and status codes

| Action | Method | Success code | Notes |
|---|---|---|---|
| Get one resource | GET | 200 | 404 if not found |
| List resources | GET | 200 | Always paginated |
| Create resource | POST | 201 | Return created resource |
| Full update | PUT | 200 | Replace entire resource |
| Partial update | PATCH | 200 | Update specific fields |
| Delete | DELETE | 204 | No response body |
| Long-running action | POST | 202 | Accepted, async processing |

### 4.4 Pagination — mandatory on all list endpoints

All list endpoints must be paginated. Never return unbounded lists.

```python
# app/utils/pagination.py
from pydantic import BaseModel, Field

class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)

class PaginatedResponse[T](BaseModel):
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int

# Usage in route
@router.get('/forms', response_model=PaginatedResponse[FormResponse])
async def list_forms(
    pagination: PaginationParams = Depends(),
    service: FormService = Depends(get_form_service)
):
    return await service.list(pagination)
```

### 4.5 Response envelope — do not use

Return the resource directly. Do not wrap in `{ "data": ..., "status": "ok" }` envelopes — FastAPI's `response_model` handles serialisation.

```python
# ❌ Wrong
return {"status": "success", "data": form, "message": "created"}

# ✅ Correct
return form   # FastAPI serialises via response_model=FormResponse
```

---

## 5. Pydantic Schemas

### 5.1 Schema hierarchy — one base, many specific

Use a base schema with shared fields. Each endpoint gets its own schema.

```python
# app/schemas/form.py
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID

class FormBase(BaseModel):
    """Shared fields across all form schemas."""
    name:        str = Field(..., min_length=1, max_length=255)
    description: str = Field(default='')
    app_id:      UUID

class FormCreate(FormBase):
    """Schema for POST /forms — only fields the caller can set."""
    pass

class FormUpdate(BaseModel):
    """Schema for PATCH /forms/{id} — all fields optional."""
    name:        str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None

class FormResponse(FormBase):
    """Schema for all responses — includes server-set fields."""
    id:         UUID
    created_at: datetime
    updated_at: datetime

    model_config = {'from_attributes': True}  # required for ORM objects
```

### 5.2 Rules for schemas

- **Never reuse the same schema for input and output.** Input schemas must never expose `id`, `created_at`, `updated_at`.
- **Always use `Field()` for validation** — min/max length, regex, ge/le for numbers.
- **Use `model_config = {'from_attributes': True}`** on all response schemas to support ORM object conversion.
- **Never use `dict` as a field type.** Define explicit schemas.
- **Never use `Any` type.** Every field must have a specific type.

```python
# ❌ Wrong
class FormCreate(BaseModel):
    data: dict        # completely untyped
    settings: Any     # forbidden

# ✅ Correct
class FormCreate(BaseModel):
    name:     str
    settings: FormSettings   # specific nested schema
```

### 5.3 Validators

Use Pydantic validators for business-rule validation that goes beyond type checking.

```python
from pydantic import field_validator, model_validator

class FormCreate(FormBase):

    @field_validator('name')
    @classmethod
    def name_no_special_chars(cls, v: str) -> str:
        if not v.replace(' ', '').replace('-', '').replace('_', '').isalnum():
            raise ValueError('Form name can only contain letters, numbers, spaces, hyphens and underscores')
        return v.strip()

    @model_validator(mode='after')
    def validate_field_count(self) -> 'FormCreate':
        if hasattr(self, 'fields') and len(self.fields) > 200:
            raise ValueError('A form cannot have more than 200 fields')
        return self
```

---

## 6. Database — Direct SQL

**No ORM is used in this project.** All database access is done via direct SQL using `asyncpg`. This gives the team full control over queries, explicit performance visibility, and zero magic from an abstraction layer.

> Rule: **Never use SQLAlchemy ORM, Django ORM, or any other ORM.** Write SQL. Use the repository pattern to keep SQL out of services.

### 6.1 Connection pool setup

```python
# app/core/database.py
import asyncpg
from app.config import settings

_pool: asyncpg.Pool | None = None

async def create_pool() -> asyncpg.Pool:
    return await asyncpg.create_pool(
        dsn=settings.DATABASE_URL,
        min_size=5,           # minimum connections kept alive
        max_size=20,          # maximum connections in pool
        max_inactive_connection_lifetime=300,  # recycle idle connections after 5 min
        command_timeout=30,   # query timeout in seconds
    )

async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await create_pool()
    return _pool

# FastAPI dependency — yields a connection from the pool
async def get_db() -> asyncpg.Connection:
    pool = await get_pool()
    async with pool.acquire() as conn:
        yield conn

# app/main.py — create pool on startup, close on shutdown
@app.on_event('startup')
async def startup():
    app.state.pool = await create_pool()

@app.on_event('shutdown')
async def shutdown():
    await app.state.pool.close()
```

### 6.2 Repository pattern — SQL lives here, nowhere else

All SQL must be written inside repository methods. Services call repository methods. Route handlers call services. SQL never appears outside a repository.

```python
# app/repositories/base.py
from abc import ABC, abstractmethod
from typing import Generic, TypeVar
import asyncpg

T = TypeVar('T')

class BaseRepository(ABC, Generic[T]):
    """Abstract base for all repositories. Defines the contract."""

    def __init__(self, conn: asyncpg.Connection) -> None:
        self._conn = conn

    @abstractmethod
    async def get_by_id(self, resource_id: str) -> T | None:
        ...

    @abstractmethod
    async def list(self, offset: int, limit: int) -> tuple[list[T], int]:
        ...

    @abstractmethod
    async def create(self, data: dict) -> T:
        ...

    @abstractmethod
    async def update(self, resource_id: str, data: dict) -> T:
        ...

    @abstractmethod
    async def delete(self, resource_id: str) -> bool:
        ...
```

```python
# app/repositories/form_repository.py
import asyncpg
from app.repositories.base import BaseRepository
from app.schemas.form import FormResponse

class FormRepository(BaseRepository[FormResponse]):

    async def get_by_id(self, form_id: str) -> FormResponse | None:
        row = await self._conn.fetchrow(
            """
            SELECT id, name, description, app_id, created_at, updated_at
            FROM forms
            WHERE id = $1 AND deleted_at IS NULL
            """,
            form_id
        )
        return FormResponse(**dict(row)) if row else None

    async def list(
        self,
        app_id: str,
        offset: int,
        limit: int
    ) -> tuple[list[FormResponse], int]:
        total = await self._conn.fetchval(
            "SELECT COUNT(*) FROM forms WHERE app_id = $1 AND deleted_at IS NULL",
            app_id
        )
        rows = await self._conn.fetch(
            """
            SELECT id, name, description, app_id, created_at, updated_at
            FROM forms
            WHERE app_id = $1 AND deleted_at IS NULL
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            """,
            app_id, limit, offset
        )
        return [FormResponse(**dict(r)) for r in rows], total

    async def create(self, data: dict) -> FormResponse:
        row = await self._conn.fetchrow(
            """
            INSERT INTO forms (id, name, description, app_id, created_at, updated_at)
            VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
            RETURNING id, name, description, app_id, created_at, updated_at
            """,
            data['name'], data['description'], data['app_id']
        )
        return FormResponse(**dict(row))

    async def update(self, form_id: str, data: dict) -> FormResponse:
        # Build SET clause dynamically from provided fields only
        fields  = {k: v for k, v in data.items() if v is not None}
        columns = ', '.join(f'{k} = ${i+2}' for i, k in enumerate(fields))
        values  = list(fields.values())

        row = await self._conn.fetchrow(
            f"""
            UPDATE forms
            SET {columns}, updated_at = NOW()
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING id, name, description, app_id, created_at, updated_at
            """,
            form_id, *values
        )
        if not row:
            raise NotFoundException(f'Form {form_id} not found')
        return FormResponse(**dict(row))

    async def delete(self, form_id: str) -> bool:
        # Soft delete — never hard delete
        result = await self._conn.execute(
            "UPDATE forms SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
            form_id
        )
        return result == 'UPDATE 1'
```

### 6.3 Parameterised queries — always use `$1, $2, ...` placeholders

Never concatenate user input into SQL strings. Always use positional placeholders.

```python
# ❌ NEVER do this — SQL injection vulnerability
query = f"SELECT * FROM forms WHERE name = '{name}'"
await conn.fetch(query)

# ❌ NEVER do this either
query = "SELECT * FROM forms WHERE name = '" + name + "'"

# ✅ Always use positional parameters
row = await conn.fetchrow(
    "SELECT * FROM forms WHERE name = $1 AND app_id = $2",
    name, app_id   # asyncpg handles escaping automatically
)
```

### 6.4 asyncpg fetch methods — use the right one

| Method | Returns | Use when |
|---|---|---|
| `fetchrow(sql, ...)` | Single `Record` or `None` | Expecting exactly one row |
| `fetch(sql, ...)` | `list[Record]` | Expecting multiple rows |
| `fetchval(sql, ...)` | Single scalar value | `COUNT`, `MAX`, single column |
| `execute(sql, ...)` | Status string (`'INSERT 1'`) | `INSERT`/`UPDATE`/`DELETE` with no return |
| `executemany(sql, args)` | None | Bulk inserts/updates |

```python
# Single row
form = await conn.fetchrow("SELECT * FROM forms WHERE id = $1", form_id)

# Multiple rows
forms = await conn.fetch("SELECT * FROM forms WHERE app_id = $1", app_id)

# Count
total = await conn.fetchval("SELECT COUNT(*) FROM forms WHERE app_id = $1", app_id)

# Insert with return
row = await conn.fetchrow(
    "INSERT INTO forms (name) VALUES ($1) RETURNING *", name
)

# Update/delete
status = await conn.execute(
    "UPDATE forms SET name = $1 WHERE id = $2", name, form_id
)
```

### 6.5 Transactions — explicit for multi-step operations

```python
# app/repositories/form_repository.py

async def create_with_fields(
    self,
    form_data: dict,
    fields_data: list[dict]
) -> FormResponse:
    async with self._conn.transaction():   # rolls back if anything fails
        form_row = await self._conn.fetchrow(
            """
            INSERT INTO forms (id, name, app_id, created_at, updated_at)
            VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())
            RETURNING *
            """,
            form_data['name'], form_data['app_id']
        )
        form_id = form_row['id']

        # Insert all fields in a single bulk operation
        await self._conn.executemany(
            """
            INSERT INTO form_fields (id, form_id, label, field_type, position)
            VALUES (gen_random_uuid(), $1, $2, $3, $4)
            """,
            [(form_id, f['label'], f['field_type'], i)
             for i, f in enumerate(fields_data)]
        )

    return FormResponse(**dict(form_row))
```

### 6.6 Joins — write explicit SQL, no lazy loading

```python
# ❌ Wrong — N+1 problem (1 query per form to get its fields)
forms = await form_repo.list(app_id)
for form in forms:
    form.fields = await field_repo.get_by_form(form.id)  # 1 extra query each!

# ✅ Correct — single JOIN query returns everything at once
rows = await conn.fetch(
    """
    SELECT
        f.id          AS form_id,
        f.name        AS form_name,
        ff.id         AS field_id,
        ff.label      AS field_label,
        ff.field_type AS field_type
    FROM forms f
    LEFT JOIN form_fields ff ON ff.form_id = f.id
    WHERE f.app_id = $1 AND f.deleted_at IS NULL
    ORDER BY f.created_at DESC, ff.position ASC
    """,
    app_id
)

# Group results by form_id in Python
from itertools import groupby
forms_with_fields = [
    {
        'id': form_id,
        'name': list(rows)[0]['form_name'],
        'fields': [{'id': r['field_id'], 'label': r['field_label']} for r in rows]
    }
    for form_id, rows in groupby(rows, key=lambda r: r['form_id'])
]
```

### 6.7 Schema migrations — raw SQL migration files

Since there is no ORM, migrations are written as plain SQL files managed by **Flyway** or **raw versioned `.sql` files** applied via a migration script.

```
migrations/
├── V001__create_forms_table.sql
├── V002__create_form_fields_table.sql
├── V003__add_status_to_forms.sql
└── V004__add_deleted_at_to_forms.sql
```

```sql
-- migrations/V001__create_forms_table.sql
CREATE TABLE forms (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255)    NOT NULL,
    description TEXT            NOT NULL DEFAULT '',
    app_id      UUID            NOT NULL REFERENCES apps(id),
    created_by  UUID,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ     -- soft delete
);

CREATE INDEX idx_forms_app_id ON forms(app_id);
CREATE INDEX idx_forms_deleted_at ON forms(deleted_at) WHERE deleted_at IS NULL;
```

**Migration rules:**
- Every schema change needs a new versioned migration file.
- Never modify an existing migration file after it has been applied to any environment.
- Always include a rollback script (comment at bottom of each file).
- Never drop a column in a single migration — mark it nullable first, deploy, then drop in a separate migration.
- Commit all migration files to git.

---

## 7. Authentication and Authorization

### 7.1 JWT — structure and validation

```python
# app/core/security.py
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from app.config import settings

ALGORITHM = 'HS256'

def create_access_token(subject: str, extra_claims: dict = {}) -> str:
    payload = {
        'sub': subject,
        'iat': datetime.now(timezone.utc),
        'exp': datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        **extra_claims
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise UnauthorizedException('Invalid or expired token')
```

### 7.2 Current user dependency

```python
# app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

bearer_scheme = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    payload = decode_token(credentials.credentials)
    user = await user_repo.get_by_id(payload['sub'])
    if not user:
        raise HTTPException(status_code=401, detail='User not found')
    return user

# Usage in routes
@router.get('/forms/{form_id}')
async def get_form(
    form_id: str,
    current_user: User = Depends(get_current_user),  # auth required
    service: FormService = Depends(get_form_service)
):
    return await service.get_by_id(form_id)
```

### 7.3 Role-based access control (RBAC)

Define roles as an enum. Create a reusable dependency for role checks.

```python
# app/core/rbac.py
from enum import StrEnum
from functools import lru_cache

class Role(StrEnum):
    SUPER_ADMIN = 'super_admin'
    ORG_ADMIN   = 'org_admin'
    DEVELOPER   = 'developer'
    VIEWER      = 'viewer'

def require_roles(*roles: Role):
    """Dependency factory — checks that current user has one of the given roles."""
    async def check(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise ForbiddenException(f'Required role: {", ".join(roles)}')
        return current_user
    return check

# Usage
@router.delete('/organisations/{org_id}')
async def delete_org(
    org_id: str,
    current_user: User = Depends(require_roles(Role.SUPER_ADMIN))
):
    ...

@router.post('/apps')
async def create_app(
    data: AppCreate,
    current_user: User = Depends(require_roles(Role.ORG_ADMIN, Role.DEVELOPER))
):
    ...
```

---

## 8. Error Handling

### 8.1 Custom exception hierarchy

Define exceptions once. Never raise bare `HTTPException` inside services.

```python
# app/core/exceptions.py
from fastapi import HTTPException, status

class QuantaOpsException(HTTPException):
    """Base for all application exceptions."""
    status_code: int = 500
    detail:      str = 'An unexpected error occurred'

    def __init__(self, detail: str | None = None) -> None:
        super().__init__(
            status_code=self.status_code,
            detail=detail or self.detail
        )

class NotFoundException(QuantaOpsException):
    status_code = status.HTTP_404_NOT_FOUND
    detail      = 'Resource not found'

class UnauthorizedException(QuantaOpsException):
    status_code = status.HTTP_401_UNAUTHORIZED
    detail      = 'Authentication required'

class ForbiddenException(QuantaOpsException):
    status_code = status.HTTP_403_FORBIDDEN
    detail      = 'You do not have permission to perform this action'

class ConflictException(QuantaOpsException):
    status_code = status.HTTP_409_CONFLICT
    detail      = 'Resource already exists'

class ValidationException(QuantaOpsException):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    detail      = 'Validation failed'

class BadRequestException(QuantaOpsException):
    status_code = status.HTTP_400_BAD_REQUEST
    detail      = 'Bad request'
```

### 8.2 Usage in services

```python
# ❌ Wrong — raises HTTPException inside a service (service shouldn't know about HTTP)
class FormService:
    async def get_by_id(self, form_id: str) -> Form:
        form = await self._repository.get_by_id(form_id)
        if not form:
            raise HTTPException(status_code=404, detail='Form not found')  # ← wrong layer

# ✅ Correct — raises domain exception
class FormService(BaseService[Form]):
    async def get_by_id(self, form_id: str) -> Form:
        form = await self._repository.get_by_id(form_id)
        if not form:
            raise NotFoundException(f'Form {form_id} not found')
        return form
```

### 8.3 Global exception handler

```python
# app/main.py
from fastapi.responses import JSONResponse

@app.exception_handler(QuantaOpsException)
async def quantaops_exception_handler(request, exc: QuantaOpsException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            'error': exc.__class__.__name__,
            'detail': exc.detail,
            'path': str(request.url.path)
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            'error': 'ValidationError',
            'detail': exc.errors(),
            'path': str(request.url.path)
        }
    )
```

---

## 9. Service Layer and Business Logic

### 9.1 Services are the only place for business logic

```
Request → Router → Service → Repository → Database
                ↑
         ALL business logic lives here
```

The service layer is responsible for:
- Validating business rules (not just schema validation)
- Orchestrating multiple repository calls
- Emitting events / notifications
- Calling external APIs

The service layer is **NOT** responsible for:
- Parsing HTTP requests (that is the router's job)
- Writing SQL (that is the repository's job)
- Authentication (that is the dependency's job)

### 9.2 Transaction management in services

Multi-step operations that must succeed or fail together are handled via repository methods that accept an existing connection (and thus participate in the caller's transaction). The service coordinates, the repository executes the SQL.

```python
class FormService(BaseService[FormResponse]):
    def __init__(self, repository: FormRepository) -> None:
        self._repository = repository

    async def create_with_fields(
        self,
        form_data: FormCreate,
        fields_data: list[FieldCreate]
    ) -> FormResponse:
        # Transaction is owned by the repository — if any INSERT fails,
        # the entire transaction rolls back automatically
        return await self._repository.create_with_fields(
            form_data.model_dump(),
            [f.model_dump() for f in fields_data]
        )
```

---

## 10. Dependency Injection

Use FastAPI's `Depends()` for all dependencies. Never instantiate services directly in route handlers.

```python
# app/dependencies.py
from fastapi import Depends
import asyncpg
from app.core.database import get_db

# Repository factory — receives asyncpg connection
def get_form_repository(
    conn: asyncpg.Connection = Depends(get_db)
) -> FormRepository:
    return FormRepository(conn)

# Service factory — injected with its repository
def get_form_service(
    repo: FormRepository = Depends(get_form_repository)
) -> FormService:
    return FormService(repo)

# Route uses Depends — nothing is instantiated manually
@router.post('/forms')
async def create_form(
    data: FormCreate,
    service: FormService = Depends(get_form_service)
):
    return await service.create(data)
```

### Config via pydantic-settings

```python
# app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL:                  str
    SECRET_KEY:                    str
    ACCESS_TOKEN_EXPIRE_MINUTES:   int = 60
    REFRESH_TOKEN_EXPIRE_DAYS:     int = 30
    ALLOWED_ORIGINS:               list[str] = ['http://localhost:4200']
    MAX_PAGE_SIZE:                 int = 100
    LOG_LEVEL:                     str = 'INFO'

    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        case_sensitive=True
    )

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
```

Never hardcode config values. All environment-specific values come from `.env` via `Settings`.

---

## 11. Async and Performance

### 11.1 Always use async — never block the event loop

```python
# ❌ Wrong — synchronous DB call blocks the event loop
@router.get('/forms/{form_id}')
def get_form(form_id: str, db: Session = Depends(get_db)):  # sync function!
    return db.query(Form).filter(Form.id == form_id).first()

# ✅ Correct — async throughout
@router.get('/forms/{form_id}')
async def get_form(
    form_id: str,
    service: FormService = Depends(get_form_service)
):
    return await service.get_by_id(form_id)
```

### 11.2 CPU-bound work goes to a thread pool

```python
import asyncio
from fastapi.concurrency import run_in_threadpool

# ❌ Wrong — CPU work blocks the event loop
@router.post('/reports/export')
async def export_report(data: ExportRequest):
    pdf_bytes = generate_pdf(data)  # CPU-heavy — blocks all other requests!
    return Response(content=pdf_bytes)

# ✅ Correct — run CPU work off the event loop
@router.post('/reports/export')
async def export_report(data: ExportRequest):
    pdf_bytes = await run_in_threadpool(generate_pdf, data)
    return Response(content=pdf_bytes)
```

### 11.3 Use background tasks for fire-and-forget operations

```python
from fastapi import BackgroundTasks

@router.post('/forms/{form_id}/submit')
async def submit_form(
    form_id: str,
    submission: FormSubmission,
    background_tasks: BackgroundTasks,
    service: FormService = Depends(get_form_service)
):
    result = await service.process_submission(form_id, submission)
    background_tasks.add_task(send_confirmation_email, submission.email)
    background_tasks.add_task(trigger_workflow, form_id, result.id)
    return result
```

### 11.4 Connection pooling

```python
# app/core/database.py
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=10,         # base connections in pool
    max_overflow=20,      # extra connections when pool is full
    pool_timeout=30,      # seconds to wait for a connection
    pool_recycle=1800,    # recycle connections after 30 min
    echo=False            # set True only in local dev
)
```

---

## 12. Security

### 12.1 Never trust input — validate everything

```python
# ❌ NEVER — string formatting into SQL = SQL injection
@router.get('/search')
async def search(q: str, conn: asyncpg.Connection = Depends(get_db)):
    rows = await conn.fetch(f"SELECT * FROM forms WHERE name LIKE '%{q}%'")  # INJECTION!

# ❌ NEVER — concatenation is equally dangerous
query = "SELECT * FROM forms WHERE name = '" + q + "'"

# ✅ Always use $1, $2, ... positional parameters — asyncpg escapes them
@router.get('/search')
async def search(
    q: str = Query(..., max_length=100),
    service: FormService = Depends(get_form_service)
):
    return await service.search(q)

# In the repository:
async def search(self, q: str) -> list[FormResponse]:
    rows = await self._conn.fetch(
        "SELECT * FROM forms WHERE name ILIKE $1 AND deleted_at IS NULL",
        f'%{q}%'   # asyncpg handles escaping of the value
    )
    return [FormResponse(**dict(r)) for r in rows]
```

### 12.2 Secrets — environment variables only

```python
# ❌ Wrong — hardcoded secrets
SECRET_KEY = 'my-secret-key-123'
DATABASE_URL = 'postgresql://admin:password@localhost/prod'

# ✅ Correct — always from environment
SECRET_KEY   = settings.SECRET_KEY
DATABASE_URL = settings.DATABASE_URL
```

Never commit `.env` files. Add `.env` to `.gitignore`. Commit `.env.example` with placeholder values.

### 12.3 CORS — explicit allowlist

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,  # explicit list, never ['*'] in production
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allow_headers=['Authorization', 'Content-Type'],
)
```

### 12.4 Rate limiting

Apply rate limiting to all public endpoints.

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post('/auth/login')
@limiter.limit('5/minute')   # max 5 login attempts per minute per IP
async def login(request: Request, data: LoginRequest):
    ...
```

### 12.5 Passwords

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# ❌ Never store or log plain-text passwords
# ❌ Never compare passwords with ==
# ✅ Always use verify_password()
```

---

## 13. Testing

### 13.1 Test structure — unit and integration separate

```
tests/
├── conftest.py                 ← shared fixtures
├── unit/
│   ├── services/
│   │   ├── test_form_service.py
│   │   └── test_report_service.py
│   └── utils/
│       └── test_validators.py
└── integration/
    ├── api/
    │   ├── test_forms_api.py
    │   └── test_reports_api.py
    └── repositories/
        └── test_form_repository.py
```

### 13.2 Unit tests — mock the repository

Since services only call repository methods (no SQL, no DB), unit tests mock the repository with `AsyncMock`. No database required.

```python
# tests/unit/services/test_form_service.py
import pytest
from unittest.mock import AsyncMock
from app.services.form_service import FormService
from app.core.exceptions import NotFoundException

@pytest.fixture
def mock_repo() -> AsyncMock:
    return AsyncMock()

@pytest.fixture
def service(mock_repo: AsyncMock) -> FormService:
    return FormService(repository=mock_repo)

async def test_get_by_id_returns_form(service, mock_repo):
    mock_repo.get_by_id.return_value = FormResponse(
        id='abc-123', name='My Form', app_id='app-1',
        description='', created_at=..., updated_at=...
    )
    result = await service.get_by_id('abc-123')
    assert result.name == 'My Form'
    mock_repo.get_by_id.assert_called_once_with('abc-123')

async def test_get_by_id_raises_not_found(service, mock_repo):
    mock_repo.get_by_id.return_value = None
    with pytest.raises(NotFoundException):
        await service.get_by_id('does-not-exist')
```

### 13.3 Integration tests — use test database with asyncpg

Integration tests run against a real PostgreSQL test database. The schema is created by applying migration SQL files before tests run.

```python
# tests/conftest.py
import pytest
import asyncpg
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import get_db

TEST_DATABASE_URL = 'postgresql://test:test@localhost/quanta_ops_test'

@pytest.fixture(scope='session')
async def test_pool():
    pool = await asyncpg.create_pool(dsn=TEST_DATABASE_URL)
    # Apply all migration SQL files
    async with pool.acquire() as conn:
        for sql_file in sorted(Path('migrations').glob('V*.sql')):
            await conn.execute(sql_file.read_text())
    yield pool
    # Teardown — drop all tables
    async with pool.acquire() as conn:
        await conn.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
    await pool.close()

@pytest.fixture
async def conn(test_pool):
    async with test_pool.acquire() as connection:
        async with connection.transaction():   # rolls back after each test
            yield connection

@pytest.fixture
async def client(conn):
    app.dependency_overrides[get_db] = lambda: conn   # inject test connection
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url='http://test'
    ) as c:
        yield c
    app.dependency_overrides.clear()

# Integration test — hits the real DB, rolled back after test
async def test_create_form(client, auth_headers):
    response = await client.post(
        '/api/v1/forms',
        json={'name': 'Test Form', 'app_id': 'app-123', 'description': ''},
        headers=auth_headers
    )
    assert response.status_code == 201
    body = response.json()
    assert body['name'] == 'Test Form'
    assert 'id' in body
```

### 13.4 Coverage requirement

Minimum coverage thresholds:

| Layer | Required coverage |
|---|---|
| Services (business logic) | 90% |
| Repositories | 80% |
| API routes | 80% |
| Utilities | 95% |

```toml
# pyproject.toml
[tool.pytest.ini_options]
asyncio_mode = 'auto'

[tool.coverage.report]
fail_under = 80
```

---

## 14. Logging and Observability

### 14.1 Structured logging — JSON format

```python
# app/core/logging.py
import logging
import json
from datetime import datetime, timezone

class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        return json.dumps({
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'level':     record.levelname,
            'logger':    record.name,
            'message':   record.getMessage(),
            'module':    record.module,
            'function':  record.funcName,
        })
```

### 14.2 What to log

```python
import logging
logger = logging.getLogger(__name__)

class FormService(BaseService[Form]):
    async def create(self, data: FormCreate) -> Form:
        logger.info('Creating form', extra={'app_id': str(data.app_id), 'name': data.name})
        form = await self._repository.create(Form(**data.model_dump()))
        logger.info('Form created', extra={'form_id': str(form.id)})
        return form

    async def delete(self, form_id: str) -> bool:
        logger.warning('Deleting form', extra={'form_id': form_id})
        ...
```

**Always log:** resource creation, resource deletion, auth failures, external API calls, slow queries (>500ms).

**Never log:** passwords, JWT tokens, full request bodies containing PII, credit card numbers, API keys.

### 14.3 Request logging middleware

```python
# app/core/middleware.py
import time
from fastapi import Request

async def request_logging_middleware(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000

    logger.info('Request completed', extra={
        'method':      request.method,
        'path':        request.url.path,
        'status_code': response.status_code,
        'duration_ms': round(duration_ms, 2),
    })

    if duration_ms > 500:
        logger.warning('Slow request', extra={
            'path':        request.url.path,
            'duration_ms': round(duration_ms, 2)
        })

    return response
```

---

## 15. Do's and Don'ts

### Do's

- Use abstract base classes for services and repositories — define the contract, enforce it.
- Define shared SQL fragments (`BASE_COLS`, `NOT_DELETED`, `TABLE`) in `BaseRepository` — extend it, never repeat them.
- Keep route handlers thin — one call to a service, return the result.
- Use `async`/`await` everywhere — never use synchronous DB or HTTP calls.
- Validate all input with Pydantic `Field()` and `field_validator`.
- Use the repository pattern — all SQL belongs in repository methods, nowhere else.
- Use `$1, $2, ...` positional parameters in every query — never format user input into SQL strings.
- Use the right `asyncpg` method: `fetchrow` for one row, `fetch` for many, `fetchval` for scalars, `execute` for writes.
- Raise domain exceptions (`NotFoundException`, `ForbiddenException`) — not bare `HTTPException`.
- Paginate all list endpoints — never return unbounded data.
- Write unit tests for every service method — mock the repository with `AsyncMock`.
- Use `Depends()` for everything — services, repos, current user, config.
- Store all secrets in `.env` — never hardcode them.
- Log structured JSON — never use `print()`.

### Don'ts

- Do not use any ORM — no SQLAlchemy, no Django ORM, no Tortoise ORM.
- Do not write business logic in route handlers.
- Do not write SQL in services — that belongs in repositories.
- Do not use `Any` type in Pydantic schemas — every field must be typed.
- Do not share input and output schemas — create separate ones.
- Do not use `dict` as a field type — define an explicit schema.
- Do not format user input into SQL strings (`f"WHERE name = '{name}'"`) — always use `$1` parameters.
- Do not skip migrations — never `ALTER TABLE` manually in production.
- Do not modify an existing migration file after it has been applied anywhere.
- Do not hard-delete rows — always soft-delete with `deleted_at`.
- Do not use `allow_origins=['*']` in production CORS config.
- Do not log passwords, tokens, or PII.
- Do not commit `.env` files — only commit `.env.example`.
- Do not create a new service class without extending `BaseService`.
- Do not return unbounded lists from any endpoint — always paginate.
- Do not run blocking CPU work inside an async function — use `run_in_threadpool`.
- Do not add new endpoints to an existing API version in a breaking way — create a new version.
- Do not use `print()` for debugging — use the logger.

---

*Quanta Ops Backend Guidelines — v1.0 — April 2026*
*Maintainer: Engineering Lead / Backend Lead*
*Review cycle: Quarterly or on any major feature addition*
*Stack: Python 3.12 · FastAPI · asyncpg · PostgreSQL · Versioned SQL migrations · Pydantic v2 · pytest*
