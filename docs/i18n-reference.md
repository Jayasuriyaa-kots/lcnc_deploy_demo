# i18n reference — Quanta Ops (implemented)

**Status:** Complete for Builder (form, report, page, datasources, workflow) and Deployer  
**Library:** [Transloco](https://jsverse.github.io/transloco/) (`@jsverse/transloco`) via `@qo/lang`  
**Locales:** English only (`en`) — no language switcher yet

This document is the **practical reference** for the localization work that is merged in the repo: where files live, how data flows, and what commands to run when you change copy.

For the original platform design, see [i18n-localization-approach.md](./i18n-localization-approach.md).

---

## 1. Architecture at a glance

```
libs/lang                          ← global shared strings (Cancel, Save, Active, …)
  └── en.json  ──────────────────► /assets/i18n/en.json

apps/<app>/src/.../lang/*.ts       ← feature source of truth (YOU EDIT THIS)
        │
        │  npm run i18n:sync-<scope>
        ▼
apps/<app>/src/assets/i18n/<scope>/en.json   ← generated (do not hand-edit)
        │
        │  Transloco HTTP loader
        ▼
*I18nService  →  templates / .ts code
```

**Two layers:**

| Layer | Purpose | Edit? |
|-------|---------|-------|
| **Global base** | Words reused everywhere (actions, fields, states, validation) | Yes — only when truly shared |
| **Feature scope** | Copy unique to form-builder, report-builder, workflow, deployer, etc. | Yes — main place for new UI text |

Shared words are **not duplicated** in feature JSON. Sync scripts prune them; runtime resolves them from the global base via `GLOBAL_COMMON_KEY_ALIASES` in `@qo/lang`.

---

## 2. File map — everything in one table

### Global (all apps)

| File | Role |
|------|------|
| `libs/lang/src/lib/i18n/en.json` | Global Transloco JSON → served as `/assets/i18n/en.json` |
| `libs/lang/src/lib/common.en.ts` | TypeScript mirror of global strings |
| `libs/lang/src/lib/merge-common.ts` | `FLAT_COMMON_LANG`, `featureCommon()`, `GLOBAL_COMMON_KEY_ALIASES` |
| `libs/lang/src/lib/transloco-loader.ts` | Loads `/assets/i18n/{lang}.json` and scoped paths like `form-builder/en` |
| `libs/lang/src/lib/transloco.providers.ts` | `provideQuantaTransloco()` |
| `libs/lang/src/index.ts` | Public exports (`@qo/lang`) |

### Builder — feature lang sources (edit these)

| Feature | Scope name | Lang TS file (source) | Generated JSON |
|---------|------------|----------------------|----------------|
| Form Builder | `form-builder` | `apps/builder/src/app/features/form-builder/lang/form-builder.en.ts` | `apps/builder/src/assets/i18n/form-builder/en.json` |
| Report Builder | `report-builder` | `apps/builder/src/app/features/report-builder/lang/reports.lang.ts` | `apps/builder/src/assets/i18n/report-builder/en.json` |
| Page Builder | `page-builder` | `apps/builder/src/app/features/page-builder/lang/page-builder.en.ts` | `apps/builder/src/assets/i18n/page-builder/en.json` |
| Datasources | `datasources` | `apps/builder/src/app/features/datasources/lang/datasources-lang.ts` | `apps/builder/src/assets/i18n/datasources/en.json` |
| Workflow Builder | `workflow-builder` | `apps/builder/src/app/features/workflow-builder/services/workflow-language.ts` | `apps/builder/src/assets/i18n/workflow-builder/en.json` |

### Builder — i18n services (runtime)

| Feature | Service |
|---------|---------|
| Form | `apps/builder/src/app/features/form-builder/services/form-builder-i18n.service.ts` |
| Report | `apps/builder/src/app/features/report-builder/services/report-builder-i18n.service.ts` |
| Page | `apps/builder/src/app/features/page-builder/services/page-builder-i18n.service.ts` |
| Datasources | `apps/builder/src/app/features/datasources/services/datasources-i18n.service.ts` |
| Workflow | `apps/builder/src/app/features/workflow-builder/services/workflow-builder-i18n.service.ts` |

### Deployer

| File | Role |
|------|------|
| `apps/deployer/src/lang/deployer-lang.ts` | Lang source (edit this) |
| `apps/deployer/src/assets/i18n/deployer/en.json` | Generated JSON |
| `apps/deployer/src/app/services/deployer-i18n.service.ts` | Runtime service |

### App wiring

| App | Config | Routes |
|-----|--------|--------|
| Builder | `apps/builder/src/app/app.config.ts` — preloads `en` + all 5 scopes | `apps/builder/src/app/app.routes.ts` — `provideTranslocoScope(...)` per feature |
| Deployer | `apps/deployer/src/app/app.config.ts` — preloads `en` + `deployer/en` | `apps/deployer/src/app/app.routes.ts` — `provideTranslocoScope('deployer')` on shell |

### Assets (both apps)

In `apps/builder/project.json` and `apps/deployer/project.json`:

```json
{ "glob": "**/*", "input": "libs/lang/src/lib/i18n", "output": "/assets/i18n/" },
{ "glob": "**/*", "input": "apps/<app>/src/assets", "output": "/assets/" }
```

### Tooling (`tools/`)

| Script | Purpose |
|--------|---------|
| `tools/lib/i18n-common.mjs` | Shared prune/sync helpers for global common |
| `tools/generate-*-en-json.mjs` | TS lang → JSON (one per scope) |
| `tools/audit-*-i18n.mjs` | Per-scope audits |
| `tools/audit-global-i18n.mjs` | Global base + asset globs + duplicate check |
| `tools/audit-all-i18n.mjs` | Runs global + all scope audits |

---

## 3. npm commands

| Command | What it does |
|---------|----------------|
| `npm run i18n:sync-all` | Regenerate JSON for **all** scopes |
| `npm run i18n:audit-all` | Full check: global base + form + report + page + datasources + workflow + deployer |
| `npm run i18n:audit-global` | Global base only |
| `npm run i18n:sync-form-builder` | Form JSON only |
| `npm run i18n:sync-report-builder` | Report JSON only |
| `npm run i18n:sync-page-builder` | Page JSON only |
| `npm run i18n:sync-datasources` | Datasources JSON only |
| `npm run i18n:sync-workflow-builder` | Workflow JSON only |
| `npm run i18n:sync-deployer` | Deployer JSON only |
| `npm run i18n:audit-<scope>` | Audit one scope (same names as sync) |

**Typical workflow after changing copy:**

```bash
# 1. Edit the lang TS file for your feature (see table in §2)
# 2. Regenerate JSON
npm run i18n:sync-workflow-builder   # example

# 3. Verify
npm run i18n:audit-all
```

---

## 4. How to add or change strings

### Feature-specific text

1. Open the **lang TS file** for your module (§2 table).
2. Add or change the string in the nested object (e.g. `pages.formActions.title`).
3. Run the matching `i18n:sync-*` command.
4. Use the key in code (see §5).

**Example** — workflow (`workflow-language.ts`):

```ts
pages: {
  formActions: {
    title: 'Form Actions',
  },
},
```

Template key: `pages.formActions.title`  
After sync: appears in `workflow-builder/en.json`.

### Shared text (Cancel, Save, Active, Desktop, …)

1. Add to **both**:
   - `libs/lang/src/lib/i18n/en.json`
   - `libs/lang/src/lib/common.en.ts`
2. If features use flat `common.*` keys, add an alias in `libs/lang/src/lib/merge-common.ts` → `GLOBAL_COMMON_KEY_ALIASES`.
3. Run `npm run i18n:sync-all` so feature JSON stays pruned.
4. Run `npm run i18n:audit-all`.

**In feature lang TS**, reuse global via `@qo/lang`:

```ts
import { FLAT_COMMON_LANG, featureCommon } from '@qo/lang';

export const MY_FEATURE_LANG = {
  common: featureCommon({
  // only feature-only overrides here, e.g.:
    myCustomLabel: 'Something unique',
  }),
  pages: { ... },
} as const;
```

Or reference directly: `cancel: FLAT_COMMON_LANG.cancel`.

### Do not hand-edit

- `apps/**/assets/i18n/**/en.json` — always regenerated by sync scripts.

---

## 5. How to use strings in code

### Builder — most features

**In component `.ts`:**

```ts
import { FormBuilderI18nService } from '.../form-builder-i18n.service';

export class MyComponent {
  private readonly i18n = inject(FormBuilderI18nService);
  protected readonly t = this.i18n.t.bind(this.i18n);
}
```

**In template:**

```html
<h1>{{ t('page.title') }}</h1>
<button>{{ t('common.submissions') }}</button>
```

`t('common.cancel')` resolves to global `actions.cancel` automatically (no entry needed in feature JSON).

**Global buttons in templates** (no scope):

```html
{{ 'actions.cancel' | transloco }}
{{ 'actions.save' | transloco }}
{{ 'states.draft' | transloco }}
```

### Workflow Builder (special)

Workflow HTML uses Transloco’s structural directive with a **read alias** (required for this app’s JSON shape):

```html
<ng-container *transloco="let t; read: 'workflowBuilder'">
  <h1>{{ t('pages.formActions.title') }}</h1>
  <button>{{ 'actions.cancel' | transloco }}</button>
</ng-container>
```

- Scoped keys → `t('pages....')` inside the `*transloco` block.
- Shared actions → `'actions.*' | transloco` (global pipe).
- **Do not remove** `read: 'workflowBuilder'` — UI will show raw keys without it.

### Deployer

```ts
readonly i18n = inject(DeployerI18nService);
```

```html
{{ i18n.translate('settings.exportAll') }}
{{ i18n.translate('organisations.cancel') }}
```

Keys like `organisations.cancel` resolve from deployer JSON when present, else global base (`actions.cancel`), else `deployer-lang.ts` fallback.

### In `.ts` only (services, configs, toasts)

```ts
this.i18n.t('confirm.deleteTitle');
this.i18n.translate('users.active');           // deployer
this.workflowI18n.scope('toast.saved');
```

---

## 6. Global `en.json` structure

`libs/lang/src/lib/i18n/en.json` top-level sections:

| Section | Examples |
|---------|----------|
| `actions` | `cancel`, `save`, `delete`, `search`, `settings` |
| `fields` | `required`, `optional`, `name`, `status` |
| `layout` | `desktop`, `tablet`, `mobile`, `form`, `report`, `page` |
| `states` | `active`, `inactive`, `draft`, `live`, `loading` |
| `validation` | `required`, `fieldRequired`, `emailInvalid` |
| `viewport` | `desktopRequiredTitle`, `desktopRequiredDescription` |
| `dialogs` | `deleteTitle`, `unsavedChanges` |
| `dataBinding` | `queryBinding`, `queryBindingPlaceholder` |

---

## 7. Scopes and preloading

| App | Transloco scopes | Preloaded in `app.config.ts` |
|-----|------------------|------------------------------|
| Builder | `form-builder`, `report-builder`, `page-builder`, `datasources`, `workflow-builder` | `en`, `form-builder/en`, `page-builder/en`, `datasources/en`, `report-builder/en`, `workflow-builder/en` |
| Deployer | `deployer` | `en`, `deployer/en` |

Route-level `provideTranslocoScope('...')` is set in `app.routes.ts` (builder) and on the deployer shell route.

---

## 8. Verification checklist

Before merging i18n changes:

```bash
npm run i18n:sync-all      # if any lang TS or global en.json changed
npm run i18n:audit-all     # must pass with no errors
npx nx build builder
npx nx build deployer
```

Audits check for:

- Missing translation keys in JSON
- Legacy `translateDeployerLang` / hardcoded HTML strings
- Duplicated global common values under feature `common.*`
- Global asset globs and app preloads

---

## 9. Quick FAQ

**Which file do I edit?**  
The **lang TS file** for your feature (§2). Not the JSON under `assets/i18n/`.

**Where did “feature lang TS file” come from?**  
It’s the per-module TypeScript object (`FORM_BUILDER_LANG`, `WORKFLOW_LANGUAGE`, `DEPLOYER_LANG`, etc.) that holds your strings before sync.

**Can I add Hindi / Spanish later?**  
Yes. Add `es.json` (etc.) next to each `en.json`, extend `availableLangs` in `provideQuantaTransloco`, and add a language switcher. English-only is intentional for now.

**Workflow path looks different?**  
Workflow lang lives in `workflow-language.ts` under `services/`, not under `lang/`. That’s intentional — same role as other lang TS files.

**Client app?**  
Not migrated yet. Copy the same pattern from builder/deployer when needed.

---

## 10. Related docs

| Doc | Use when |
|-----|----------|
| [i18n-reference.md](./i18n-reference.md) | **This file** — day-to-day reference |
| [i18n-localization-approach.md](./i18n-localization-approach.md) | Original design rationale |
| [feature-lang-guide.md](./feature-lang-guide.md) | Older Phase 1 notes (partially superseded) |
| [team-i18n-start-here.md](./team-i18n-start-here.md) | Older onboarding (partially superseded) |
| `libs/lang/README.md` | Short `@qo/lang` package overview |
