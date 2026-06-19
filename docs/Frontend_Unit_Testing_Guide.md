# Quanta Ops — Frontend Unit Testing Guide

> Angular 18 · Karma + Jasmine · Standalone Components · Signals
> April 2026 — applies to: Builder, Deployer, Client App

---

## Table of Contents

1. [Philosophy and Rules](#1-philosophy-and-rules)
2. [Test Framework Setup](#2-test-framework-setup)
3. [What to Test and What Not to Test](#3-what-to-test-and-what-not-to-test)
4. [Coverage Targets](#4-coverage-targets)
5. [Smoke Tests — the Baseline](#5-smoke-tests--the-baseline)
6. [Component Testing](#6-component-testing)
7. [Service and Facade Testing](#7-service-and-facade-testing)
8. [Signal Testing Patterns](#8-signal-testing-patterns)
9. [Mocking Rules](#9-mocking-rules)
10. [Do's and Don'ts](#10-dos-and-donts)

---

## 1. Philosophy and Rules

### Three levels of tests

| Level | What it covers | When to write |
|-------|---------------|---------------|
| **Smoke** | Component creates without crashing | Every component — mandatory |
| **Behaviour** | User interactions, state changes, output emissions | Every non-trivial component and all facades |
| **Unit** | Pure functions, computed signals, model helpers | Utility functions and complex computed logic |

### Non-negotiable rules

- Every component file must have a paired `.spec.ts` in the same folder.
- Every facade service must have a `.spec.ts` covering its public methods and signals.
- Tests must be **independent** — no shared mutable state between `it()` blocks.
- Tests must be **fast** — no real HTTP calls, no real localStorage access without mocking.
- A failing test blocks the PR. Do not `fdescribe` or `fit` in committed code.

---

## 2. Test Framework Setup

### Stack

| Tool | Role |
|------|------|
| **Karma** | Test runner (ChromeHeadless) |
| **Jasmine** | Assertion and spy library |
| **Angular TestBed** | Component + service wiring |
| `createSmokeFixture` | Shared helper for smoke tests (see §5) |

### Running tests

```bash
# Run all tests for the deployer app
npx nx test deployer

# Run all tests for the builder app
npx nx test builder

# Run a single spec file (watch mode)
npx nx test deployer --include="**/users-facade.service.spec.ts" --watch

# Run with coverage report
npx nx test deployer --code-coverage
```

### Coverage report location

After a coverage run, reports are written to:
```
coverage/apps/deployer/index.html
coverage/apps/builder/index.html
```

---

## 3. What to Test and What Not to Test

### ✅ Always test

| What | Why |
|------|-----|
| Facade service public methods | Core business logic lives here |
| Signal state after each method call | Signals are the source of truth |
| Computed signal values | Derived state must stay correct |
| Component output emissions | Parent–child contracts |
| Form validation rules | User-facing correctness |
| Error paths in facades (catch blocks) | Silent failures are the most dangerous bugs |
| Null/undefined guards on optional fields | Crashes the computed; breaks the whole view |

### ❌ Do not test

| What | Why |
|------|-----|
| Angular framework internals | Not our code |
| Third-party library internals | Not our code |
| Pure template layout (CSS classes, positioning) | Brittle, low value |
| `console.log` calls | Should not exist in production code |
| Private methods directly | Test them through the public API |
| Implementation detail of signal scheduling | Test outcomes, not mechanics |

---

## 4. Coverage Targets

| Category | Minimum line coverage |
|----------|-----------------------|
| Facade services | **80%** |
| Container components | **70%** |
| Presentational components | **60%** (smoke test counts) |
| Utility / helper functions | **90%** |
| Storage services | **70%** |
| Overall per-app target | **70%** |

Coverage is measured by Karma's built-in reporter. Check
`coverage/apps/<app>/index.html` after a run.

> **Priority rule:** A 30-line facade method that contains a bug costs far
> more than 10 untested template lines. Always prioritise testing facade
> methods and computed signals over template coverage.

---

## 5. Smoke Tests — the Baseline

Every component must have at minimum a smoke test: "the component creates
without throwing". Use the shared helper.

### `createSmokeFixture` — how it works

```
apps/deployer/src/app/testing/component-smoke-test.helpers.ts
```

```typescript
import { createSmokeFixture } from '../../../../testing/component-smoke-test.helpers';
```

The helper:
- Configures `TestBed` with `provideRouter([])` and `provideNoopAnimations()`
- Accepts optional extra `providers` for replacing injected services
- Accepts optional `inputs` for setting signal inputs via `setInput()`
- Calls `fixture.detectChanges()` before returning

### Smoke test template

```typescript
// my-component.component.spec.ts
import { signal } from '@angular/core';
import { MyFacadeService } from '../services/my-facade.service';
import { MyComponent } from './my-component.component';
import { createSmokeFixture } from '../../../../testing/component-smoke-test.helpers';

describe('MyComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(MyComponent, {
      providers: [
        {
          provide: MyFacadeService,
          useValue: {
            items: signal([]),
            isLoading: signal(false),
            load: jasmine.createSpy('load')
          }
        }
      ]
    });

    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

### Smoke test with signal inputs

```typescript
import { smokeTestData } from '../../../../testing/component-smoke-test.helpers';

it('should create with user input', async () => {
  const fixture = await createSmokeFixture(UserCardComponent, {
    inputs: {
      user: smokeTestData.user   // typed mock data from the shared helper
    }
  });

  expect(fixture.componentInstance).toBeTruthy();
});
```

---

## 6. Component Testing

### 6.1 Setting up a component test

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { UsersPageComponent } from './users-page.component';
import { UsersFacadeService } from '../services/users-facade.service';
import { USER_RECORDS } from '../../../../mock-data/users.mock';

describe('UsersPageComponent', () => {
  let fixture: ComponentFixture<UsersPageComponent>;
  let component: UsersPageComponent;
  let facadeSpy: jasmine.SpyObj<UsersFacadeService>;

  beforeEach(async () => {
    // 1. Create a spy object for the facade with all public signals mocked
    facadeSpy = jasmine.createSpyObj('UsersFacadeService', [
      'loadUsers', 'addUser', 'editUser', 'deleteUser'
    ], {
      // Signal properties — use signal() so the template can call them
      users:         signal(USER_RECORDS),
      filteredUsers: signal(USER_RECORDS),
      isLoading:     signal(false),
      searchQuery:   signal(''),
      addUserOpen:   signal(false),
      editingUserId: signal<string | null>(null)
    });

    await TestBed.configureTestingModule({
      imports: [UsersPageComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: UsersFacadeService, useValue: facadeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- behaviour tests below ---
});
```

### 6.2 Testing output emissions

```typescript
it('should open the Add User modal when the button is clicked', () => {
  // Arrange: spy on the facade method the component delegates to
  facadeSpy.openAddUserModal = jasmine.createSpy('openAddUserModal');

  // Act: find the "Add User" button and click it
  const button = fixture.nativeElement.querySelector('[data-testid="add-user-btn"]');
  button.click();
  fixture.detectChanges();

  // Assert
  expect(facadeSpy.openAddUserModal).toHaveBeenCalledOnce();
});
```

> **Rule:** Add `data-testid` attributes to interactive elements that tests
> need to query. Never query by CSS class — classes change with design updates.

```html
<!-- in the template -->
<qo-button data-testid="add-user-btn" (click)="facade.openAddUserModal()">
  Add User
</qo-button>
```

### 6.3 Testing signal input changes

```typescript
it('should display the correct user name when input changes', () => {
  // Set initial input
  fixture.componentRef.setInput('user', USER_RECORDS[0]);
  fixture.detectChanges();

  let nameEl = fixture.nativeElement.querySelector('[data-testid="user-name"]');
  expect(nameEl.textContent).toContain(USER_RECORDS[0].name);

  // Change the input
  fixture.componentRef.setInput('user', USER_RECORDS[1]);
  fixture.detectChanges();

  nameEl = fixture.nativeElement.querySelector('[data-testid="user-name"]');
  expect(nameEl.textContent).toContain(USER_RECORDS[1].name);
});
```

### 6.4 Testing @if blocks (OnPush)

With `ChangeDetectionStrategy.OnPush`, you must call `fixture.detectChanges()`
after any state change for the template to update.

```typescript
it('should show the loading skeleton while isLoading is true', () => {
  // Update the mocked signal value
  (facadeSpy.isLoading as ReturnType<typeof signal>).set(true);
  fixture.detectChanges();

  const skeleton = fixture.nativeElement.querySelector('qo-skeleton');
  expect(skeleton).toBeTruthy();

  const table = fixture.nativeElement.querySelector('qo-table');
  expect(table).toBeFalsy();
});

it('should show the table when loading is done', () => {
  (facadeSpy.isLoading as ReturnType<typeof signal>).set(false);
  fixture.detectChanges();

  const table = fixture.nativeElement.querySelector('qo-table');
  expect(table).toBeTruthy();
});
```

### 6.5 Testing form submission in a modal component

```typescript
describe('AddUserModalComponent', () => {
  let fixture: ComponentFixture<AddUserModalComponent>;
  let closeSpy: jasmine.Spy;
  let submitSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUserModalComponent],
      providers: [provideNoopAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddUserModalComponent);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    // Subscribe to output signals
    closeSpy  = jasmine.createSpy('close');
    submitSpy = jasmine.createSpy('submit');
    fixture.componentInstance.close.subscribe(closeSpy);
    fixture.componentInstance.userSubmitted.subscribe(submitSpy);
  });

  it('should not emit userSubmitted when required fields are empty', () => {
    const submitBtn = fixture.nativeElement
      .querySelector('[data-testid="submit-btn"]');
    submitBtn.click();
    fixture.detectChanges();

    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('should emit userSubmitted with form values when form is valid', () => {
    // Fill the form controls
    const form = fixture.componentInstance.userForm;
    form.setValue({
      firstName: 'Alice',
      lastName:  'Smith',
      email:     'alice@example.com',
      phone:     '+44 7700 900000',
      role:      'Admin'
    });
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement
      .querySelector('[data-testid="submit-btn"]');
    submitBtn.click();
    fixture.detectChanges();

    expect(submitSpy).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({ email: 'alice@example.com' })
    );
  });
});
```

---

## 7. Service and Facade Testing

Facades hold all business logic and signal state. These are the most important
tests in the codebase.

### 7.1 Basic facade test structure

```typescript
// users-facade.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { UsersFacadeService } from './users-facade.service';
import { UsersStorageService } from './users-storage.service';
import { USER_RECORDS } from '../../../../mock-data/users.mock';

describe('UsersFacadeService', () => {
  let facade: UsersFacadeService;
  let storageSpy: jasmine.SpyObj<UsersStorageService>;

  beforeEach(() => {
    storageSpy = jasmine.createSpyObj('UsersStorageService', [
      'getUsers', 'saveUsers', 'getUserMeta', 'saveUserMeta'
    ]);

    // Return sensible defaults from storage
    storageSpy.getUsers.and.returnValue(USER_RECORDS);
    storageSpy.getUserMeta.and.returnValue({});

    TestBed.configureTestingModule({
      providers: [
        UsersFacadeService,
        { provide: UsersStorageService, useValue: storageSpy }
      ]
    });

    facade = TestBed.inject(UsersFacadeService);
  });

  // Tests go here
});
```

### 7.2 Testing signal state after method calls

```typescript
it('should load users from storage on initialisation', () => {
  facade.loadUsers();

  // Read signal value — call it as a function
  expect(facade.users()).toEqual(USER_RECORDS);
  expect(facade.isLoading()).toBeFalse();
});

it('should set isLoading to true at the start and false on completion', async () => {
  const loadPromise = facade.loadUsers();

  // At the start, loading should be true (if async)
  // After awaiting, it should be false
  await loadPromise;
  expect(facade.isLoading()).toBeFalse();
});
```

### 7.3 Testing a method that mutates signal state

```typescript
describe('addUser()', () => {
  beforeEach(() => {
    facade.loadUsers();
  });

  it('should append the new user to the users signal', () => {
    const before = facade.users().length;

    facade.addUser({
      firstName: 'Bob',
      lastName:  'Jones',
      email:     'bob@example.com',
      phone:     '',
      role:      'Viewer'
    });

    expect(facade.users().length).toBe(before + 1);
    expect(facade.users().at(-1)?.email).toBe('bob@example.com');
  });

  it('should persist the updated list to storage', () => {
    facade.addUser({ firstName: 'Bob', lastName: 'Jones',
                     email: 'bob@example.com', phone: '', role: 'Viewer' });

    expect(storageSpy.saveUsers).toHaveBeenCalledOnce();
    expect(storageSpy.saveUsers).toHaveBeenCalledWith(facade.users());
  });
});
```

### 7.4 Testing the error path

```typescript
it('should set the error signal when storage throws', () => {
  storageSpy.getUsers.and.throwError('Storage read failed');

  facade.loadUsers();

  expect(facade.error()).toBeTruthy();
  expect(facade.users()).toEqual([]);  // state must be reset, not partial
});
```

### 7.5 Testing computed signals

```typescript
describe('filteredUsers computed', () => {
  beforeEach(() => {
    facade.loadUsers();     // populates this.users signal
  });

  it('should return all users when search query is empty', () => {
    facade.setSearchQuery('');
    expect(facade.filteredUsers().length).toBe(USER_RECORDS.length);
  });

  it('should filter by name case-insensitively', () => {
    const targetName = USER_RECORDS[0].name.toLowerCase().slice(0, 4);
    facade.setSearchQuery(targetName.toUpperCase());

    const results = facade.filteredUsers();
    expect(results.every(u =>
      u.name.toLowerCase().includes(targetName)
      || u.email.toLowerCase().includes(targetName)
    )).toBeTrue();
  });

  it('should return empty array when no users match the query', () => {
    facade.setSearchQuery('xyzzy-no-match');
    expect(facade.filteredUsers()).toEqual([]);
  });

  it('should not crash when a user has a null phone field', () => {
    // Simulate a legacy record with no phone
    const legacyUser = { ...USER_RECORDS[0], phone: null as unknown as string };
    storageSpy.getUsers.and.returnValue([legacyUser]);
    facade.loadUsers();

    expect(() => {
      facade.setSearchQuery('test');
      const _ = facade.filteredUsers();
    }).not.toThrow();
  });
});
```

---

## 8. Signal Testing Patterns

### 8.1 Reading signal values in tests

Always call signals as functions in tests — same as in templates.

```typescript
// ✅ Correct
expect(facade.isLoading()).toBeFalse();
expect(facade.users().length).toBe(3);
expect(facade.selectedUser()).toBeNull();

// ❌ Wrong — reads the signal object, not its value
expect(facade.isLoading).toBeFalse();
```

### 8.2 Updating a mocked signal in a component test

When your facade mock uses `signal()`, you can update the value in a test
and then call `fixture.detectChanges()` to trigger the view update.

```typescript
// In beforeEach, the mock signal is set up as:
const isLoadingSig = signal(false);
facadeSpy = jasmine.createSpyObj('MyFacade', ['load'], {
  isLoading: isLoadingSig
});

// In a test:
it('should show spinner while loading', () => {
  isLoadingSig.set(true);           // update the signal
  fixture.detectChanges();           // re-render (required for OnPush)

  expect(fixture.nativeElement.querySelector('qo-spinner')).toBeTruthy();
});
```

### 8.3 Testing effects

Angular effects are harder to test directly. Test them by observing their
side effects after the triggering signal changes.

```typescript
it('should apply the theme class to the body when theme signal changes', () => {
  // Effect wires: theme signal → document.body.classList
  facade.setTheme('dark');

  // In TestBed, effects run synchronously in test zone
  TestBed.flushEffects();           // flush pending effects

  expect(document.body.classList.contains('theme-dark')).toBeTrue();
});
```

> **Note:** `TestBed.flushEffects()` is available in Angular 18. Use it
> whenever testing code that relies on `effect()` to run a side-effect.

---

## 9. Mocking Rules

### 9.1 Always mock injected services — never use real ones in unit tests

```typescript
// ✅ Correct — inject a spy object
{ provide: UsersFacadeService, useValue: facadeSpy }

// ❌ Wrong — uses the real service which may hit localStorage or HTTP
providers: [UsersFacadeService]
```

Exception: it is acceptable to use the real service when testing the facade
itself and mocking only its storage dependency.

### 9.2 Mock signals with the actual signal() function

```typescript
// ✅ Correct — template can call signal as a function
{
  provide: MyFacade,
  useValue: {
    items:     signal([]),
    isLoading: signal(false),
    load:      jasmine.createSpy('load')
  }
}

// ❌ Wrong — template calling items() will throw "items is not a function"
{
  provide: MyFacade,
  useValue: {
    items:     [],
    isLoading: false,
    load:      jasmine.createSpy('load')
  }
}
```

### 9.3 Use `jasmine.createSpy` for methods, `signal()` for state

```typescript
const facadeMock = {
  // State — must be signals
  users:         signal(USER_RECORDS),
  isLoading:     signal(false),
  searchQuery:   signal(''),

  // Methods — jasmine spies
  loadUsers:     jasmine.createSpy('loadUsers'),
  addUser:       jasmine.createSpy('addUser'),
  deleteUser:    jasmine.createSpy('deleteUser').and.returnValue(Promise.resolve())
};
```

### 9.4 Mock localStorage via the storage service — never mock `localStorage` directly

```typescript
// ✅ Correct — inject a spy for the storage service
storageSpy = jasmine.createSpyObj('UsersStorageService', ['getUsers', 'saveUsers']);
storageSpy.getUsers.and.returnValue(USER_RECORDS);

// ❌ Wrong — brittle, couples tests to DOM globals
spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(USER_RECORDS));
```

### 9.5 Use `smokeTestData` from the shared helper for mock data

```typescript
import { smokeTestData } from '../../../../testing/component-smoke-test.helpers';

// Available data:
smokeTestData.user
smokeTestData.users
smokeTestData.organisation
smokeTestData.organisations
smokeTestData.applications
smokeTestData.application
smokeTestData.invoices
smokeTestData.auditRecords
```

Do not duplicate this data. If you need additional test fixtures, add them
to the `smokeTestData` object in the shared helper — not inline in individual
spec files.

---

## 10. Do's and Don'ts

### Do's

- Write the smoke test first, then add behaviour tests for each public method.
- Use `data-testid` attributes on interactive elements targeted by tests.
- Use `fixture.detectChanges()` after every signal/input change in OnPush tests.
- Use `TestBed.flushEffects()` when testing `effect()` side-effects.
- Call signals as functions: `facade.isLoading()` not `facade.isLoading`.
- Keep each `it()` block focused on exactly one behaviour.
- Test the null/undefined/empty paths — these are the most common crashes.
- Test the error path of every facade method that has a `catch` block.
- Add new mock data to `smokeTestData` rather than duplicating inline.

### Don'ts

- Do not use `fdescribe` or `fit` in committed code — it disables all other tests.
- Do not share mutable state between `it()` blocks — always reset in `beforeEach`.
- Do not test implementation details: if a private method works correctly,
  the public API test will pass. Test the what, not the how.
- Do not `spyOn(localStorage, ...)` — mock the storage service instead.
- Do not write tests that pass a non-signal value to a mock where the template
  calls the value as a function.
- Do not skip the error path. A facade `catch` block that doesn't reset state
  is the most common source of blank screens in production.
- Do not query DOM elements by CSS class — use `data-testid` attributes.
- Do not import from subpaths of `@qo/ui-components` in test files — use the
  barrel import the same as production code.

---

## Quick Reference — Test Checklist

When writing a new spec file, work through this list in order:

```
Facade service (.service.spec.ts):
  [ ] Smoke: service instantiates without error
  [ ] State: signals have correct default values before any method is called
  [ ] loadX(): signal is populated, storage.getX() was called
  [ ] loadX() error: state is reset, error signal is set
  [ ] addX(): signal length increases by 1, storage.saveX() called with new array
  [ ] editX(): item is updated in signal, storage.saveX() called
  [ ] deleteX(): item removed from signal, storage.saveX() called
  [ ] computedY: correct value for empty input
  [ ] computedY: correct value for populated input
  [ ] computedY: correct value for edge-case input (null, empty string, 0)

Container component (.component.spec.ts):
  [ ] Smoke: component creates with mocked facade
  [ ] Loading state: skeleton shown when isLoading = true
  [ ] Loaded state: table/list shown when isLoading = false
  [ ] Empty state: qo-empty-state shown when items list is empty
  [ ] User action → facade method called (e.g. button click → facade.addX())
  [ ] Modal opens/closes in response to facade signal changes

Presentational (dumb) component (.component.spec.ts):
  [ ] Smoke: component creates with required inputs
  [ ] Renders correctly with valid inputs
  [ ] Output emitted on user interaction
  [ ] Handles null/undefined/empty inputs gracefully
```

---

*Quanta Ops Frontend Unit Testing Guide — v1.0 — April 2026*
*Maintainer: Engineering Lead*
*Review cycle: Quarterly or on any major Angular version upgrade*
