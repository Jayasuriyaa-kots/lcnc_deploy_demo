# Form Builder Phase 2 — team reference (complete)

Form Builder is the **pilot** for Phase 2 (Transloco templates + scoped JSON). Use this guide when rolling the same pattern to **page-builder**, **report-builder**, **workflow-builder**, or **datasources**.

Platform overview: [i18n-localization-approach.md](./i18n-localization-approach.md).  
Phase 1 lang-file rules: [feature-lang-guide.md](./feature-lang-guide.md).

---

## What Phase 2 adds (on top of Phase 1)

| Layer | Phase 1 | Phase 2 |
|-------|---------|---------|
| Templates | `{{ lang.page.title }}` from `.ts` | `*transloco="let t"` + `{{ t('page.title') }}` |
| Global buttons | `lang.common.cancel` | `'actions.cancel' \| transloco` (no scope) |
| Scoped `.ts` strings | `FORM_BUILDER_LANG` | `FormBuilderI18nService` |
| Runtime JSON | `{}` placeholder | `assets/i18n/form-builder/en.json` |
| Route | — | `provideTranslocoScope('form-builder')` |

Phase 1 `.ts` lang files **stay** for module-level configs, seed data, and preview validation logic that runs before or outside Transloco scope. Sync them to JSON with the script below.

---

## File map (Form Builder)

| Purpose | Path |
|---------|------|
| Scoped JSON (Transloco) | `apps/builder/src/assets/i18n/form-builder/en.json` |
| Phase 1 source + configs | `apps/builder/src/app/features/form-builder/lang/form-builder.en.ts` |
| Dynamic message helpers | `apps/builder/src/app/features/form-builder/lang/form-builder-messages.ts` |
| `.ts` Transloco access | `apps/builder/src/app/features/form-builder/services/form-builder-i18n.service.ts` |
| JSON sync script | `tools/generate-form-builder-en-json.mjs` |
| Route scope | `apps/builder/src/app/app.routes.ts` — `/form-builder`, `/form-builder/preview` |

---

## Step-by-step: replicate for another feature

Replace `form-builder` / `FORM_BUILDER` with your scope (e.g. `page-builder`, `PAGE_BUILDER`).

### 1. Fill scoped JSON

Copy strings from your feature `.en.ts` into:

`apps/builder/src/assets/i18n/<scope>/en.json`

Use nested keys that match UI areas (`page`, `modals`, `actions`, …). Use `{{param}}` for interpolated copy.

### 2. Register route scope

```ts
import { provideTranslocoScope } from '@jsverse/transloco';

{
  path: 'page-builder',
  component: PageBuilderPageComponent,
  // provideTranslocoScope already returns an array — do NOT wrap in [...]
  providers: provideTranslocoScope('page-builder'),
}
```

Add the same scope on any standalone preview routes for that feature.

### 3. Add a feature i18n service (optional but recommended)

Mirror `FormBuilderI18nService`:

- `scope(key, params?)` → `transloco.translate(key, params, '<scope>')`
- `global(key, params?)` → global `libs/lang` keys
- `common(flatKey)` → map legacy flat keys to global or scoped `common.*`

### 4. Migrate templates

```html
<ng-container *transloco="let t" translocoScope="form-builder" translocoPrefix="formBuilder">
  <h1>{{ t('page.title') }}</h1>
  <button>{{ 'actions.cancel' | transloco }}</button>
  <button>{{ t('common.saveAndPublish') }}</button>
</ng-container>
```

Component imports: `TranslocoDirective`, `TranslocoPipe`.

**Rules:**

- **Every** `*transloco` wrapper needs **both** `translocoScope="form-builder"` (loads JSON) **and** `translocoPrefix="formBuilder"` (camelCase scope alias — without this you see raw keys like `settings.title`)
- Route + page component: `providers: provideTranslocoScope('form-builder')` — **not** `providers: [provideTranslocoScope(...)]`
- Feature-specific keys → `t('section.key')` inside `*transloco`
- Shared Cancel/Save/Delete → `'actions.cancel' \| transloco` (global, no scope prefix)
- Params → `t('confirm.deleteMessage', { name: item.name })` matching JSON `{{name}}`
- **Do not** use `translocoRead` / `read:` — that prefixes keys (`form-builder.settings.title`)

### 5. Migrate component `.ts` (dialogs, toasts, select labels)

```ts
private readonly i18n = inject(FormBuilderI18nService);

this.toast.success(this.i18n.scope('toast.saved'));
this.confirm.message = this.i18n.scope('confirm.deleteMessage', { fieldLabel: field.label });
```

Remove `readonly text = FEATURE_LANG` once the component no longer needs it.

### 6. Keep `.ts` lang for configs / heavy runtime (acceptable)

These **do not** need Transloco in Phase 2:

- Static config arrays (`form-builder-options.config.ts`, `form-field-inspector.config.ts`)
- Seed/mock services (`form-builder-seed.service.ts`)
- Preview validation base classes (`form-preview-content-*.base.ts`)
- Field policy helpers

They import `FORM_BUILDER_LANG` (or your feature equivalent) at module load. When you edit static strings in `form-builder.en.ts`, run:

```bash
npm run i18n:sync-form-builder
```

That regenerates `en.json` from the `.ts` file (template functions become `{{param}}` placeholders).

### 7. Dynamic strings

Functions in `form-builder.en.ts` (e.g. `connectionSummary(datasource, query)`) are listed in `form-builder-messages.ts` for `.ts` callers. In JSON they use Transloco params:

```json
"connectionSummary": "{{datasource}} executes {{query}} for this form."
```

Templates: `t('page.connectionSummary', { datasource: ds, query: q })`  
`.ts`: `i18n.scope('page.connectionSummary', { datasource: ds, query: q })`

---

## Form Builder — what is migrated (pilot complete)

### Done (Phase 2)

- All Form Builder **HTML templates** use `FormBuilderI18nService.t()` via a component `t()` helper (not `*transloco` — see troubleshooting)
- Route scopes on `/form-builder` and `/form-builder/preview` only (not global in `app.config.ts`)
- `en.json` populated — sync from `form-builder.en.ts` via `npm run i18n:sync-form-builder`
- `FormBuilderI18nService` for page confirms, toasts, wizard validation, inspector options, action-button selects, settings fallback name, field-list flags
- Global actions: `{{ 'actions.cancel' | transloco }}` · draft/live: `{{ 'states.draft' | transloco }}`

### Still on `FORM_BUILDER_LANG` (by design)

- `config/form-builder-config/*.ts` — default field properties, library labels, weekday options
- `form-field-inspector.config.ts`
- `form-builder-seed.service.ts`
- `form-builder-field-policy.service.ts`
- `form-export.service.ts`
- `form-preview-modal/content/base/*.ts` — runtime validation and media messages

These can move to `FormBuilderI18nService` in a later pass when you add a second locale or language switcher.

---

## Template pattern (verified)

Scoped keys live in `en` as `formBuilder.page.title`, etc. The `*transloco` directive resolves the active lang to `en` and does **not** reliably prefix scoped keys in child components/modals.

**Use the i18n service in templates instead:**

```ts
// component.ts
private readonly i18n = inject(FormBuilderI18nService);
protected readonly t = this.i18n.t.bind(this.i18n);
// or: protected readonly t = injectFormBuilderTranslate();
```

```html
<h1>{{ t('page.title') }}</h1>
<button>{{ 'actions.cancel' | transloco }}</button>
```

`FormBuilderI18nService` preloads `form-builder/en` on startup and calls `translate(key, params, 'form-builder')`, which maps `page.title` → `formBuilder.page.title`.

---

## Troubleshooting: raw keys (`settings.title`, `inspector.fieldName`)

| Symptom | Cause | Fix |
|---------|-------|-----|
| Scoped keys raw (`settings.title`); `actions.cancel` works | `*transloco` looks up `page.title` in global `en`, not `formBuilder.page.title` | Use `FormBuilderI18nService.t()` / `injectFormBuilderTranslate()` in the component (see above) |
| Console: `Missing translation for 'page.title'` | Same — directive/pipe passed lang `en` without scope prefix | Replace `*transloco="let t"` wrappers with component `t()` |
| `form-builder.settings.title` in UI | `translocoRead` / `read:` on template | Remove; use `t('settings.title')` via i18n service |
| UPPERCASE `INSPECTOR.*` in UI | Missing translation + CSS `text-transform` | Fix scoped lookup first; labels render as English |

---

## Checklist before PR (any feature Phase 2)

- [ ] `assets/i18n/<scope>/en.json` filled (not `{}`)
- [ ] `provideTranslocoScope('<scope>')` on feature routes (+ preview routes)
- [ ] Templates: scoped copy via `t('...')` + `FormBuilderI18nService`; global copy via `TranslocoPipe`
- [ ] Component `.ts`: dialogs/toasts/selects use feature i18n service (or documented exception)
- [ ] Global actions use `'actions.*' \| transloco`, not duplicated in feature JSON
- [ ] `nx run builder:build` passes
- [ ] After editing `form-builder.en.ts` static strings: `npm run i18n:sync-form-builder`

---

## Not in Phase 2 yet (platform backlog)

- Second locale (`es.json`)
- Language switcher UI
- `@jsverse/transloco-keys-manager` / CI key drift checks
- Migrating preview validation strings to Transloco
- Deployer app Transloco wiring (same pattern as builder)

---

## Quick copy for manager / teammates

> **Phase 1** (merged): all features use `.ts` lang files + `@qo/lang` for shared words.  
> **Phase 2** (Form Builder pilot, ready to merge): templates load copy from `assets/i18n/form-builder/en.json` via Transloco; routes register scope `form-builder`. Copy this pattern to your module using `docs/form-builder-phase2-guide.md`. Configs and preview internals still read `FORM_BUILDER_LANG` until we add locales.
