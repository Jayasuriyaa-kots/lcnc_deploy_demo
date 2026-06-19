# Feature lang files — how to add copy for any module

Read this before adding UI strings to **datasources**, **report-builder**, **page-builder**, **workflow-builder**, **deployer**, or any new feature.

Full platform rules: [i18n-localization-approach.md](./i18n-localization-approach.md).

---

## Simple rules

1. **No hardcoded user-facing text** in templates or `.ts` (buttons, labels, toasts, dialogs, placeholders).
2. **Shared words once** — Cancel, Save, Search, Required, etc. come from `@qo/lang`, not copied into every feature.
3. **One TypeScript lang file per feature** — all feature-specific strings live there.
4. **Scope name = folder name** — `form-builder`, `report-builder`, `page-builder`, `workflow-builder`, `datasources`, `deployer`.
5. **JSON under `assets/i18n/<scope>/en.json`** — leave as `{}` until Transloco migration is approved. Form Builder uses **Phase 1 only** (`FORM_BUILDER_LANG` + `text.*`) — copy that.

---

## File locations

| App | Feature | TS lang file (use this now) | Transloco JSON (later) |
|-----|---------|----------------------------|-------------------------|
| builder | form-builder | `apps/builder/src/app/features/form-builder/lang/form-builder.en.ts` | `apps/builder/src/assets/i18n/form-builder/en.json` (**`{}` — Phase 1 reference**) |
| builder | report-builder | `apps/builder/src/app/features/report-builder/lang/reports.lang.ts` | `apps/builder/src/assets/i18n/report-builder/en.json` |
| builder | page-builder | `apps/builder/src/app/features/page-builder/lang/page-builder.en.ts` | `apps/builder/src/assets/i18n/page-builder/en.json` |
| builder | workflow-builder | `apps/builder/src/app/features/workflow-builder/lang/workflow-builder.en.ts` | `apps/builder/src/assets/i18n/workflow-builder/en.json` |
| builder | datasources | `apps/builder/src/app/features/datasources/lang/datasources.en.ts` | `apps/builder/src/assets/i18n/datasources/en.json` |
| deployer | deployer | `apps/deployer/src/lang/deployer.en.ts` | `apps/deployer/src/assets/i18n/deployer/en.json` |

**Global common (all apps):** `libs/lang/src/lib/i18n/en.json` and `libs/lang/src/lib/common.en.ts` (`FLAT_COMMON_LANG`, `featureCommon`).

---

## Step-by-step for a new or empty feature

### 1. Open or create the lang file

Example for **datasources**:

`apps/builder/src/app/features/datasources/lang/datasources.en.ts`

### 2. Start from the base (do not duplicate Cancel/Save)

```ts
import { FLAT_COMMON_LANG, featureCommon } from '@qo/lang';

export const DATASOURCES_LANG = {
  // Flat access: lang.common.cancel, lang.common.save, …
  common: FLAT_COMMON_LANG,

  // Only strings unique to this feature:
  pages: {
    title: 'Data Sources',
    sourcesTab: 'Sources',
  },
  modals: {
    createTitle: 'Create connector',
  },
} as const;
```

Use **`featureCommon({ ... })`** when the feature needs extra `common` keys (like Form Builder `draft`, `live`):

```ts
common: featureCommon({
  draft: 'Draft',
  live: 'Live',
}),
```

Generic actions/labels stay in `@qo/lang` only.

### 3. Use it in components

```ts
import { DATASOURCES_LANG } from '../lang/datasources.en';

export class MyComponent {
  readonly lang = DATASOURCES_LANG;
}
```

Template: `{{ lang.pages.title }}` — not `'Data Sources'` inline.

Configs/services: import the same object; use `lang.common.save` for shared buttons.

### 4. Placeholder JSON (optional until Transloco templates)

Ensure folder exists:

`apps/builder/src/assets/i18n/datasources/en.json`

```json
{}
```

Fill this file when you move templates to Transloco pipes/directives (see i18n doc §5–7).

### 5. Features that already have full lang files

Do **not** replace these with empty shells. Keep all feature-specific sections; only dedupe **shared** words via `@qo/lang`.

| Feature | File | Notes |
|---------|------|--------|
| Page Builder | `page-builder.en.ts` | Full file; `common` uses `featureCommon()` for page-only keys |
| Datasources | `datasources-lang.ts` (+ `datasources.en.ts` re-export) | Full file; `common` uses `featureCommon()` |
| Workflow | `workflow-builder/services/workflow-language.ts` | Full `WORKFLOW_LANGUAGE`; `workflow-builder.en.ts` re-exports |
| Deployer | `deployer-lang.ts` (+ `deployer.en.ts` re-export) | Full file; merge shared labels into `@qo/lang` when you touch each section |
| Report Builder | `reports.lang.ts` | Full `REPORTS_LANG` — do not empty |

Imports stay as today (`reports.lang`, `datasources-lang`, `workflow-language`, etc.) unless you choose to rename.

### Form builder (Phase 1 — working reference)

**Team guide:** [team-i18n-start-here.md](./team-i18n-start-here.md)

- Templates: `readonly text = FORM_BUILDER_LANG` and `{{ text.settings.title }}` — **not** Transloco.
- JSON: `assets/i18n/form-builder/en.json` stays `{}` for now.
- Transloco template migration is on hold (showed raw keys when rushed).

**All features:** follow Form Builder Phase 1 pattern until Transloco is approved platform-wide.

---

## What is already wired (platform)

- `@qo/lang` path alias in `tsconfig.base.json`
- `provideQuantaTransloco()` in `apps/builder/src/app/app.config.ts`
- `TranslocoHttpLoader` + `provideQuantaTransloco()` in `libs/lang`
- Builder `project.json` assets: global `libs/lang/src/lib/i18n` → `/assets/i18n/`, plus `apps/builder/src/assets`

**Deployer:** add the same `provideQuantaTransloco()` and asset globs in `apps/deployer` when you start UI work there.

---

## Checklist before PR

- [ ] No new hardcoded UI strings in HTML/TS
- [ ] Shared labels use `@qo/lang` (`FLAT_COMMON_LANG` or `featureCommon`)
- [ ] Feature-only strings in `<feature>.en.ts` (or `reports.lang.ts` for report-builder)
- [ ] Component uses `readonly lang = FEATURE_LANG` (or service import)
- [ ] `assets/i18n/<scope>/en.json` exists (`{}` for Phase 1 only; filled when doing Phase 2)

---

## For AI assistants

When asked to externalize strings for a feature:

1. Identify scope name from folder (`datasources`, `page-builder`, etc.).
2. Edit only that feature’s `lang/*.en.ts` and component imports — do not create extra sync scripts, duplicate JSON copies, or multiple lang file splits unless the user asks.
3. Pull generic copy from `@qo/lang`; never duplicate `Cancel`, `Save`, `Delete`, validation atoms.
4. Keep Report Builder on `reports.lang.ts` / `REPORTS_LANG` unless the user requests a rename to `report-builder.en.ts`.
