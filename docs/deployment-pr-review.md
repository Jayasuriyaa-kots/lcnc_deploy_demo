# PR Review — Deployment Feature: Code Violations Audit

**Date:** 2026-06-10  
**Scope:** `apps/builder/src/app/features/deployment/`  
**Reviewer criteria:** File size targets · OOP principles · Angular patterns · i18n · Design tokens · Testing  
**Reference docs:** `Frontend_UI_Components_Guide.md` · `quanta-ops-ui-ux-guidelines.md` · `i18n-localization-approach.md` · `Frontend_Unit_Testing_Guide.md` · `ARCHITECTURE.md`

---

## Legend

| Symbol | Meaning |
|--------|---------|
| 🔴 **Critical** | Violates a hard limit; blocks merge |
| 🟡 **Warning** | Should be fixed this sprint |
| 🟢 **OK** | Passes the rule |
| 💡 **Suggestion** | Improvement but not a violation |

---

## Quick Summary

| Category | Rating | Count |
|----------|--------|-------|
| File size — Components | 🔴 Critical | 2 over limit |
| File size — Facades | 🔴 Critical | 1 over limit (4× the limit) |
| OOP principles | 🔴 Critical | God facade, interfaces in wrong file |
| Angular patterns | 🔴 Critical | Direct DOM, `localStorage` bypass, broken spec |
| i18n coverage | 🔴 Critical | 0 of 7 components wired |
| Design tokens | 🟡 Warning | Undefined tokens + hardcoded px |
| Missing spec files | 🟡 Warning | 9 files without specs |
| Facade folder placement | 🟡 Warning | Facades living in `services/` |

---

## File Inventory

| File | Lines | Limit | Status |
|------|-------|-------|--------|
| `services/deployment-facade.service.ts` | **1 680** | 400 (facade) | 🔴 420 % over |
| `containers/deployment-page.component.html` | **1 730** | — | 🔴 God template |
| `containers/deployment-page.component.scss` | **2 885** | — | 🔴 God stylesheet |
| `containers/mobile-web-page.component.ts` | **462** | 200 | 🔴 131 % over |
| `containers/mobile-web-page.component.html` | **1 230** | — | 🟡 Large |
| `containers/mobile-web-page.component.scss` | **1 426** | — | 🟡 Large |
| `containers/deployment-page.component.ts` | **267** | 200 | 🟡 34 % over |
| `containers/user-management-page.component.scss` | 365 | — | 🟢 SCSS only |
| `services/builder-user-management-facade.service.ts` | 362 | 400 | 🟢 Within limit |
| `containers/deployment-user-management-page.component.ts` | 132 | 200 | 🟢 |
| `containers/preferences-page.component.ts` | 16 | 200 | 🟢 |
| `components/assign-user-modal.component.ts` | 47 | 200 | 🟢 |
| `components/new-role-modal.component.ts` | 27 | 200 | 🟢 |

---

---

# 1. File Size Violations

## 1.1 `deployment-facade.service.ts` — 1 680 lines 🔴 Critical

**Limit:** 400 lines (facade rule)  
**Actual:** 1 680 lines — **4.2× over the limit**

### What is wrong

This file is a textbook **God Object**. It owns the state and logic for six completely separate concerns that have no business being in one class:

| Concern | Signals / methods |
|---------|------------------|
| Desktop layout configuration | `primaryPages`, `leftPagesByPrimaryId`, `subPagesByLeftPageId`, `topTabPagesBySourceId`, all add/rename/remove/reorder methods |
| Header & footer toggle configuration | `leftHeaderOptions`, `rightHeaderOptions`, `footerOptions`, `leftFooterButtons`, `rightFooterButtons` |
| Theme / branding | `theme`, `colourTokens` |
| Preview runtime (navigation) | `selectedPreviewPageId`, `selectedPreviewLeftPageId`, `selectedPreviewSubPageId`, `selectedPreviewTopTabId`, `previewDataset`, all select/toggle preview methods |
| Form runtime modal | `showFormRuntimeModal`, `formRuntimeValues`, `formRuntimeErrors`, `submitFormRuntime()` |
| Workflow execution animation | `workflowExecutionOpen`, `workflowExecutionSteps`, `animateWorkflowStep()`, `buildWorkflowStepsForForm()` |

### OOP violation: Interfaces defined inside the service file (lines 23–128)

Ten interfaces (`DeploymentToggle`, `NavigationPage`, `PageGroup`, `LeftPageGroup`, `TopPageGroup`, `WorkspaceType`, `DeploymentEnvironment`, `FooterButton`, `PreviewDataset`, `PreviewFilters`, `DeploymentTheme`, plus type aliases) are defined locally in the service file. These belong in `models/deployment.models.ts`.

### What to do

**Step 1 — Move all interfaces to `models/deployment.models.ts`**

```typescript
// models/deployment.models.ts
export interface DeploymentToggle { ... }
export interface NavigationPage { ... }
export interface DeploymentTheme { ... }
// ... all 10 interfaces + type aliases
```

**Step 2 — Split into four focused services/facades**

```
services/
  deployment-layout.facade.ts      ← primary/left/sub/top pages, header, footer, workspace
  deployment-preview.facade.ts     ← preview navigation, dataset filtering, sort/filter panels
  deployment-form-runtime.facade.ts ← form modal, field values, validation, submission
  deployment-workflow.facade.ts    ← workflow execution animation, step building
  deployment-facade.service.ts     ← thin orchestrator: injects the 4 above, exposes combined computed
```

Each split service should stay under 300 lines. The orchestrating facade re-exports only the computed signals that the template needs and stays under 100 lines.

---

## 1.2 `mobile-web-page.component.ts` — 462 lines 🔴 Critical

**Limit:** 200 lines (component rule)  
**Actual:** 462 lines — **131 % over the limit**

### What is wrong

The component mixes three responsibilities that should each live in their own file:

1. **Facade delegation block** (lines 35–140): 100+ lines of `readonly x = this.facade.x` and `readonly doX = this.facade.doX.bind(this.facade)`. This pattern means the facade is too large; see section 1.1.

2. **Mobile-specific computed signals** (lines 154–287): `mobilePreviewMetrics` alone is 130 lines with 10 dataset column-matching branches. This is data transformation logic that belongs in a dedicated service or in `deployment-preview.facade.ts`.

3. **Export utilities** (lines 333–443): `exportCsv()`, `exportPdf()`, `exportJson()` are copy-pasted from `deployment-page.component.ts`. Two components with identical export logic signals this should be a shared `DeploymentExportService`.

### What to do

1. Extract `mobilePreviewMetrics` logic → `deployment-preview.facade.ts` as a `computed()` that the component binds.
2. Extract export methods → `DeploymentExportService` (shared between `DeploymentPageComponent` and `MobileWebPageComponent`).
3. After the split the component should be a thin 80-line orchestrator.

---

## 1.3 `deployment-page.component.ts` — 267 lines 🟡 Warning

**Limit:** 200 lines (component rule)  
**Actual:** 267 lines — **34 % over**

The same facade-delegation pattern as section 1.2 inflates this file. After splitting the facade (section 1.1) and extracting export logic to a shared service, this component will collapse to under 100 lines naturally.

---

---

# 2. OOP Principle Violations

## 2.1 Single Responsibility Principle — God Facade 🔴 Critical

Already documented in section 1.1. The `DeploymentFacadeService` breaks SRP by owning navigation, preview, forms, workflows, theme, and persistence all in one class.

**Where:** `services/deployment-facade.service.ts` (all 1 680 lines)  
**Fix:** Split into four focused facades as described above.

---

## 2.2 Models belong in `models/`, not inside services 🔴 Critical

**Where:** `services/deployment-facade.service.ts`, lines 23–128

Ten interfaces and five type aliases are declared at the top of the service file. This is a separation-of-concerns violation: the service implementation should not be the source of truth for domain types.

```typescript
// WRONG — inside deployment-facade.service.ts
interface NavigationPage { id: string; label: string; icon: string; tone: 'blue' | 'green' | 'purple'; }
interface DeploymentTheme { borderColor: string; footerBg: string; ... }
```

```typescript
// CORRECT — in models/deployment.models.ts, imported by the service
export interface NavigationPage { ... }
export interface DeploymentTheme { ... }
```

**Fix:** Move all interfaces and type aliases to `models/deployment.models.ts` and re-export from `models/index.ts`.

---

## 2.3 UI animation logic inside a business facade 🟡 Warning

**Where:** `services/deployment-facade.service.ts`, lines 1466–1522 (`triggerWorkflowExecution`, `animateWorkflowStep`, `buildWorkflowStepsForForm`)

`animateWorkflowStep()` chains `setTimeout` calls to animate step-by-step execution. This is presentation behaviour — it is not business logic. A facade should not own timer management and step animation.

```typescript
// WRONG — facade orchestrates UI animation
private animateWorkflowStep(stepIndex: number, totalSteps: number): void {
  ...
  const t1 = window.setTimeout(() => { ... }, runDelay);
  this.workflowAnimationTimers.push(t1);
}
```

**Fix:** Move `triggerWorkflowExecution` + `animateWorkflowStep` to a dedicated `DeploymentWorkflowAnimationService` that is injected into the preview component, not the layout facade.

---

## 2.4 Duplicated export utilities violate DRY 🟡 Warning

**Where:**  
- `containers/deployment-page.component.ts`, lines 215–265 (`exportCsv`, `exportPdf`, `exportJson`, `downloadBlob`)  
- `containers/mobile-web-page.component.ts`, lines 333–443 (identical logic, copy-pasted)

Both components contain identical CSV / PDF / JSON export functions. Identical code in two components is both an OOP violation (no reuse) and a maintenance risk.

**Fix:** Create `services/deployment-export.service.ts`:

```typescript
@Injectable({ providedIn: 'root' })
export class DeploymentExportService {
  exportCsv(dataset: PreviewDataset, filename: string): void { ... }
  exportPdf(dataset: PreviewDataset, filename: string, title: string): void { ... }
  exportJson(dataset: PreviewDataset, filename: string): void { ... }
  private downloadBlob(blob: Blob, filename: string): void { ... }
}
```

Both components then call `this.exportService.exportCsv(...)`.

---

---

# 3. Angular Pattern Violations

## 3.1 Direct DOM manipulation with `document.createElement` 🔴 Critical

**Reference:** Frontend_UI_Components_Guide.md §11 — "Do not use `document.querySelector` / direct DOM. Use `ElementRef` + `Renderer2`."

**Where:**
- `containers/deployment-page.component.ts`, line 260
- `containers/mobile-web-page.component.ts`, line 438

```typescript
// WRONG — direct DOM access in both components
private downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');   // ← violation
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

**Fix:** Move to `DeploymentExportService` (see section 2.4) and use `Renderer2` or an injected `DOCUMENT` token:

```typescript
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class DeploymentExportService {
  private readonly document = inject(DOCUMENT);

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = this.document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
```

---

## 3.2 Direct `localStorage` access in facade (bypassing `BrowserStorageService`) 🟡 Warning

**Where:** `services/deployment-facade.service.ts`, lines 1650, 1660, 1671

```typescript
// WRONG — raw localStorage calls inside the facade
private readSavedLayoutPayload() {
  const savedJson = localStorage.getItem(SAVED_DESKTOP_LAYOUT_STORAGE_KEY); // ← bypass
  ...
}

private persistSavedLayoutPayload(payload: ...) {
  localStorage.setItem(SAVED_DESKTOP_LAYOUT_STORAGE_KEY, JSON.stringify(payload)); // ← bypass
}
```

The facade already injects `BrowserStorageService` (line 186) and uses it for widget state (e.g., `this.browserStorage.getJson<CanvasWidget[]>(...)`). Using raw `localStorage` directly for layout persistence is inconsistent and breaks testability — unit tests cannot mock `localStorage`, but they can mock `BrowserStorageService`.

**Fix:** Route all storage through `BrowserStorageService`:

```typescript
private readSavedLayoutPayload() {
  return this.browserStorage.getJson<...>(SAVED_DESKTOP_LAYOUT_STORAGE_KEY);
}

private persistSavedLayoutPayload(payload: ...) {
  this.browserStorage.setJson(SAVED_DESKTOP_LAYOUT_STORAGE_KEY, payload);
}
```

---

## 3.3 `window.setTimeout` called directly in service 🟡 Warning

**Where:** `services/deployment-facade.service.ts`, lines 1189, 1452, 1511, 1516

```typescript
// WRONG — raw window.setTimeout in Angular service
window.setTimeout(() => this.setSaveState('saved'), 350);
```

Angular runs outside the zone for `window.setTimeout` when used in services, which can cause OnPush components not to detect changes after the timeout fires.

**Fix:** Use Angular's `inject(NgZone)` and wrap in `zone.run()`, or for simpler cases use RxJS `timer()` with `takeUntilDestroyed()`:

```typescript
import { DestroyRef, NgZone, inject } from '@angular/core';
import { timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

private readonly zone = inject(NgZone);
private readonly destroyRef = inject(DestroyRef);

private setSaveStateWithReset(state: DeploymentSaveState): void {
  this.saveState.set(state);
  if (state === 'saved') {
    timer(1800).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.saveState.set('idle');
    });
  }
}
```

This replaces the manual timer array + `ngOnDestroy` pattern and is zone-safe.

---

## 3.4 `@Input()` / `@Output()` usage — not applicable 🟢

All components correctly use `input()` / `output()` signal API or skip inputs/outputs entirely. No `@Input()`/`@Output()` decorator violations found.

---

## 3.5 Component delegates facade methods via `.bind()` antipattern 💡 Suggestion

**Where:** `deployment-page.component.ts` lines 69–185, `mobile-web-page.component.ts` lines 78–141

Both containers re-export every facade method via `readonly doX = this.facade.doX.bind(this.facade)`. This is a workaround for the fact that the template cannot call `this.facade.doX(...)` directly on a private field.

The root cause is that the template needs access to a field the component hides. The proper fix is either:
1. Make the facade injection accessible to the template directly (using `protected readonly facade = inject(...)`) and call `facade.doX()` in the template, OR
2. After splitting the facade (section 1.1), each child facade has fewer methods and the delegation block shrinks to ≤10 lines.

This does not block merge, but is unnecessary boilerplate that obscures the component's own logic.

---

---

# 4. i18n Violations

**Reference:** `i18n-localization-approach.md` §1 — "No hardcoded user-facing strings in templates or `.ts` files."

## 4.1 Zero i18n coverage across all 7 components 🔴 Critical

None of the following components inject a translation service or use Transloco:

- `containers/deployment-page.component.ts`
- `containers/mobile-web-page.component.ts`
- `containers/user-management-page.component.ts`
- `containers/deployment-user-management-page.component.ts`
- `containers/preferences-page.component.ts`
- `components/assign-user-modal.component.ts`
- `components/new-role-modal.component.ts`

---

## 4.2 Hardcoded strings in `deployment-facade.service.ts` 🔴 Critical

| Line | Hardcoded string | Should become |
|------|-----------------|---------------|
| 672 | `'Saving...'` | `t('deployment.save.saving')` |
| 678 | `'Saved'` | `t('deployment.save.saved')` |
| 682 | `'Save & Deploy'` | `t('deployment.save.idle')` |
| 685 | `'HR Management Workspace'` | `t('deployment.runtime.deployedTitle')` |
| 685 | `'Deployed App Layout'` | `t('deployment.runtime.previewTitle')` |
| 687 | `'Deployed App'` | `t('deployment.runtime.deployedEyebrow')` |
| 687 | `'Preview'` | `t('deployment.runtime.previewEyebrow')` |
| 362–374 | `'Show Logo'`, `'Show App Name'`, `'Application Switcher'` | `t('deployment.header.left.*')` |
| 368–375 | `'+ Add Button'`, `'Global Search'`, `'Notifications'`, etc. | `t('deployment.header.right.*')` |
| 418 | `'No subpages - click + Subpage to add'` | `t('deployment.nav.emptySubpages')` |
| 421 | `'No left pages - click + Left Page to add'` | `t('deployment.nav.emptyLeftPages')` |
| 471–492 | `'Form Type'`, `'Report Type'`, `'Custom Page Type'` | `t('deployment.workspace.*')` |
| 476 | `'Enter data into forms...'` (description) | `t('deployment.workspace.form.description')` |
| 1481–1494 | `'Form Created'`, `'Create Record'`, `'Send Email'`, etc. | `t('deployment.workflow.steps.*')` |

---

## 4.3 Hardcoded metric labels in `mobile-web-page.component.ts` 🔴 Critical

**Lines 211–286** — The `mobilePreviewMetrics` computed signal builds metric cards with English labels like `'Present'`, `'Absent'`, `'Avg Coverage'`, `'Employees'`, `'Teams'`, `'Active'`, `'Ready'`, `'In Progress'`, `'Needs Review'`, `'Requests'`, `'Approved'`, `'Leads'`, `'Stages'`, `'Records'`, `'Fields'`, `'Statuses'`.

All 20+ label strings are hardcoded.

**Fix:** Move `mobilePreviewMetrics` to `deployment-preview.facade.ts` (see section 1.1) where `TranslocoService` can be injected and labels resolved at computation time. The `mobile-web-page.component.ts` template then binds `previewMetrics()` without knowing the locale.

---

## 4.4 Hardcoded resource names in `builder-user-management-facade.service.ts` 🟡 Warning

**Lines 16–34** — `PERMISSION_SEED_RESOURCES` contains English `resourceName` values like `'Add Employee Form'`, `'Leave Request Form'`, `'Employee Directory'`, etc.

These names are shown in the permissions UI. They should be resolved through the i18n service, not hardcoded as constants.

---

## 4.5 How to fix i18n for this feature

1. Create `lang/deployment.en.ts` (following the same pattern as `form-builder.en.ts`):

```typescript
// lang/deployment.en.ts
export const deploymentEn = {
  save: { idle: 'Save & Deploy', saving: 'Saving…', saved: 'Saved' },
  runtime: { deployedTitle: 'HR Management Workspace', previewTitle: 'Deployed App Layout', ... },
  header: { left: { logo: 'Show Logo', appName: 'Show App Name', ... }, ... },
  nav: { emptySubpages: 'No subpages — click + Subpage to add', ... },
  workspace: { form: { title: 'Form Type', description: '...' }, ... },
  workflow: { steps: { formCreated: 'Form Created', createRecord: 'Create Record', ... } },
  metrics: { present: 'Present', absent: 'Absent', ... },
};
```

2. Create `lang/deployment-i18n.service.ts` following the `injectFormBuilderTranslate()` pattern already established in the repo.

3. Inject the service in each component and replace every hardcoded string.

---

---

# 5. Design Token Violations

**Reference:** `Frontend_UI_Components_Guide.md` §10.1 — "Never hardcode values. Always use tokens."

## 5.1 Undefined custom tokens used in SCSS 🔴 Critical

**Where:** `containers/deployment-page.component.scss`

| Line | Token used | Status | Correct value |
|------|-----------|--------|---------------|
| 9 | `var(--qo-space-20)` | ❌ Not defined | Should be `5rem` — add `--qo-space-20: 5rem` to `tokens.scss` |
| 18 | `var(--qo-space-11)` | ❌ Not defined | Should be `2.75rem` — add `--qo-space-11: 2.75rem` to `tokens.scss` |
| 37 | `var(--qo-font-extrabold)` | ❌ Not defined in guide | Guide defines only up to `--qo-font-bold: 700`. Add `--qo-font-extrabold: 800` to `tokens.scss` or use `--qo-font-bold` (700) |
| 73 | `var(--qo-font-extrabold)` | ❌ Same | Same fix |

Using undefined tokens silently falls through to the browser default, making styling fragile and environment-dependent. Any new token must first be added to `libs/ui-components/src/styles/tokens.scss` before referencing it in a component.

---

## 5.2 Hardcoded pixel values in SCSS 🟡 Warning

**Where:** `containers/deployment-page.component.scss`

| Line | Value | Should be |
|------|-------|-----------|
| 18 | `gap: 40px` | `var(--qo-space-10)` (40px) |
| 33 | `margin: 10px 0 12px` | Use `var(--qo-space-2)` + `var(--qo-space-3)` |
| 45 | `font-size: 15px` | `var(--qo-text-sm)` (14px) or define a `--qo-text-body-lg: 0.9375rem` token |
| 51 | `min-width: 124px` | Extract as a component-level custom property or nearest standard |
| 52 | `gap: 14px` | Nearest token: `var(--qo-space-3)` (12px) or add `--qo-space-3-5: 0.875rem` |
| 54 | `padding-top: 2px` | `var(--qo-space-0-5)` — add `--qo-space-0-5: 0.125rem` or use `1px` with a comment |
| 57 | `gap: 8px` | `var(--qo-space-2)` (8px) ✅ — consistent, just swap |

**Where:** `containers/mobile-web-page.component.scss` (365 lines of stylesheet also contains hardcoded values — full audit required separately)

---

## 5.3 Hardcoded hex colors inside the facade 🟡 Warning

**Where:** `services/deployment-facade.service.ts`, lines 158–178

```typescript
const DEFAULT_DEPLOYMENT_THEME: DeploymentTheme = {
  borderColor: '#d1d5db',   // should be: var(--qo-color-neutral-300)
  footerBg:    '#f8fafc',   // should be: var(--qo-color-neutral-50)
  headerBg:    '#111827',   // should be: var(--qo-color-neutral-900)
  hoverBg:     '#f3f4f6',   // should be: var(--qo-color-neutral-100)
  // ... 14 more hardcoded hex values
};
```

While these are theme values sent to the runtime (CSS-in-JS), the defaults should reference design token hex values by name, not magic strings. The risk is that if the design token value changes, the theme default diverges silently.

**Fix:** Import token hex values from a shared constant:

```typescript
// In tokens.ts (a new shared constants file)
export const QO_TOKEN_HEX = {
  neutral300: '#D1D5DB',
  neutral900: '#111111',
  // ... pull from tokens.scss
} as const;
```

---

---

# 6. Testing Violations

**Reference:** `Frontend_Unit_Testing_Guide.md` §1 — "Every component file must have a paired `.spec.ts`."  
**Reference:** `Frontend_Unit_Testing_Guide.md` §9.1 — "Always mock injected services."

## 6.1 Missing spec files — 9 files 🟡 Warning

| File | Has spec? |
|------|-----------|
| `containers/deployment-page.component.ts` | ✅ (but broken — see 6.2) |
| `containers/mobile-web-page.component.ts` | ❌ |
| `containers/deployment-user-management-page.component.ts` | ❌ |
| `containers/preferences-page.component.ts` | ❌ |
| `containers/user-management-page.component.ts` | ❌ |
| `components/assign-user-modal.component.ts` | ❌ |
| `components/new-role-modal.component.ts` | ❌ |
| `services/deployment-facade.service.ts` | ❌ **Most important** |
| `services/builder-user-management-facade.service.ts` | ❌ **Important** |

The two facade services have no specs at all. Per the testing guide, facades are the **highest-priority** test target because they hold all business logic.

---

## 6.2 Existing spec is broken — no facade mock 🔴 Critical

**Where:** `containers/deployment-page.component.spec.ts`

```typescript
// WRONG — real DeploymentFacadeService is used, which has 4 real dependencies
await TestBed.configureTestingModule({
  imports: [DeploymentPageComponent],
  // No providers, no mocks, no provideNoopAnimations
}).compileComponents();
```

This spec will fail in CI because `DeploymentFacadeService` injects three real facades (`FormBuilderFacade`, `ReportBuilderFacade`, `PageCanvasFacade`) and `BrowserStorageService`, none of which are provided. The test passes today only if it is never actually run in isolation.

Additionally, line 23–25 tests the facade's behaviour through the component, not the component's own behaviour — violating the unit test isolation principle.

**Fix:**

```typescript
describe('DeploymentPageComponent', () => {
  let facadeSpy: jasmine.SpyObj<DeploymentFacadeService>;

  beforeEach(async () => {
    facadeSpy = jasmine.createSpyObj('DeploymentFacadeService',
      ['saveDeploymentLayout', 'openPreview', 'toggleHeaderOption', ...],
      {
        showPreview:          signal(false),
        saveState:            signal<'idle' | 'saving' | 'saved'>('idle'),
        primaryPages:         signal([]),
        leftHeaderOptions:    signal([
          { id: 'logo', label: 'Show Logo', checked: true }
        ]),
        // ... other signals
      }
    );

    await TestBed.configureTestingModule({
      imports: [DeploymentPageComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: DeploymentFacadeService, useValue: facadeSpy },
      ],
    }).compileComponents();
  });

  it('should create', () => { expect(component).toBeTruthy(); });

  it('should call facade.toggleHeaderOption when header toggle fires', () => {
    const toggle = fixture.nativeElement
      .querySelector('[data-testid="header-toggle-logo"]');
    toggle.click();
    expect(facadeSpy.toggleHeaderOption).toHaveBeenCalledWith('left', 'logo', false);
  });
});
```

---

## 6.3 Minimum required specs to unblock merge 🟡 Warning

At minimum, create smoke-test specs for each missing component using `createSmokeFixture`:

```typescript
// mobile-web-page.component.spec.ts
import { signal } from '@angular/core';
import { createSmokeFixture } from '../../../../testing/component-smoke-test.helpers';
import { MobileWebPageComponent } from './mobile-web-page.component';
import { DeploymentFacadeService } from '../services/deployment-facade.service';

describe('MobileWebPageComponent', () => {
  it('should create', async () => {
    const fixture = await createSmokeFixture(MobileWebPageComponent, {
      providers: [{
        provide: DeploymentFacadeService,
        useValue: {
          showPreview: signal(false),
          previewDataset: signal({ columns: [], rows: [] }),
          mobilePreviewPages: signal([]),
          // ... all signals consumed by the template
        }
      }]
    });
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

---

---

# 7. Structural / Folder Violations

## 7.1 Facades placed in `services/` 🟡 Warning

**Reference:** `Frontend_UI_Components_Guide.md` §7 — facades should live in a `facades/` folder.

| File | Current location | Should be |
|------|-----------------|-----------|
| `deployment-facade.service.ts` | `services/` | `facades/deployment.facade.ts` |
| `builder-user-management-facade.service.ts` | `services/` | `facades/builder-user-management.facade.ts` |

This is a naming/structural inconsistency with other features in the monorepo (e.g., `form-builder/facades/`, `page-builder/facades/`).

---

---

# 8. What Is Clean ✅

Despite the violations above, the deployment feature correctly follows several important patterns:

| Pattern | Status |
|---------|--------|
| `standalone: true` on all components | ✅ |
| `ChangeDetectionStrategy.OnPush` on all components | ✅ |
| No `*ngIf` / `*ngFor` — uses `@if` / `@for` | ✅ |
| No `ngModel` / template-driven forms | ✅ |
| No `BehaviorSubject` in components | ✅ |
| Signals and `computed()` used correctly throughout | ✅ |
| `@qo/ui-components` barrel import used (`QoButtonComponent`, `QoIconComponent`, etc.) | ✅ |
| No subpath imports from `@qo/ui-components` | ✅ |
| No `any` type usage found | ✅ |
| No `console.log` in production code | ✅ |
| Functional guards / no class-based guards | ✅ |
| `QoButtonComponent`, `QoCheckboxComponent` used properly | ✅ |

---

---

# 9. Action Plan (Prioritised)

## P0 — Blocks merge

| # | Action | File(s) | Effort |
|---|--------|---------|--------|
| 1 | Fix broken spec — mock `DeploymentFacadeService` | `deployment-page.component.spec.ts` | 1 hour |
| 2 | Replace `document.createElement` with `DOCUMENT` injection | `deployment-page.component.ts:260`, `mobile-web-page.component.ts:438` | 2 hours |
| 3 | Add undefined tokens (`--qo-space-20`, `--qo-space-11`, `--qo-font-extrabold`) to `tokens.scss` | `libs/ui-components/src/styles/tokens.scss` | 30 min |

## P1 — This sprint

| # | Action | File(s) | Effort |
|---|--------|---------|--------|
| 4 | Move 10 interfaces out of the facade into `models/deployment.models.ts` | `deployment-facade.service.ts:23–128` | 2 hours |
| 5 | Create `DeploymentExportService` — deduplicate CSV/PDF/JSON | New file + both components | 3 hours |
| 6 | Create smoke test specs for all 7 missing components | All `*.component.ts` without spec | 1 day |
| 7 | Create `services/deployment-facade.spec.ts` with coverage of save, preview, and layout methods | New file | 1 day |
| 8 | Move facades from `services/` → `facades/` | Both facade files | 30 min |
| 9 | Replace `localStorage` direct calls with `BrowserStorageService` | `deployment-facade.service.ts:1650–1679` | 1 hour |
| 10 | Replace `window.setTimeout` with `timer()` + `takeUntilDestroyed()` | `deployment-facade.service.ts:1189,1452,1511,1516` | 2 hours |
| 11 | Replace hardcoded px with defined tokens in SCSS | `deployment-page.component.scss` | 2 hours |

## P2 — Next sprint (requires refactoring)

| # | Action | File(s) | Effort |
|---|--------|---------|--------|
| 12 | Split `DeploymentFacadeService` into 4 focused facades | See section 1.1 | 3–4 days |
| 13 | Create `lang/deployment.en.ts` and wire Transloco to all 7 components | All components + new lang file | 2–3 days |
| 14 | Move `mobilePreviewMetrics` computed logic to `deployment-preview.facade.ts` | `mobile-web-page.component.ts:177–287` | Half day |
| 15 | Reduce `mobile-web-page.component.ts` to under 200 lines | After P2-12 and P2-14 | Natural outcome |

---

*Quanta Ops — Deployment Feature PR Review · 2026-06-10*  
*Scope: `apps/builder/src/app/features/deployment/`*  
*Prepared against: `Frontend_UI_Components_Guide.md` · `quanta-ops-ui-ux-guidelines.md` · `i18n-localization-approach.md` · `Frontend_Unit_Testing_Guide.md` · `ARCHITECTURE.md`*
