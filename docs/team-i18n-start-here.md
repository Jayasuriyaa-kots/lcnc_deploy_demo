# Team i18n — start here

**Audience:** everyone working on builder / deployer features  
**Status:** Phase 1 for your module · **Form Builder Phase 2 (Transloco) is the pilot**  
**Goal:** every module externalizes UI copy — **no raw keys in UI**

Give this file to your AI assistant or follow it manually. Work **one module per PR**.

> **Your module:** finish Phase 1 first (`text.*` from your `.ts` lang file). **Do not start Transloco** until Phase 1 is done. Then copy Form Builder Phase 2 from [form-builder-phase2-guide.md](./form-builder-phase2-guide.md).

**Docs:**
- [feature-lang-guide.md](./feature-lang-guide.md) — Phase 1 lang file rules
- [form-builder-phase2-guide.md](./form-builder-phase2-guide.md) — Transloco pilot (copy after Phase 1)
- [i18n-localization-approach.md](./i18n-localization-approach.md) — full platform design

---

## Step 1 — Phase 1 (your module now)

**Pattern in component `.ts`:**
```ts
import { PAGE_BUILDER_LANG } from '../lang/page-builder.en';

export class MyComponent {
  readonly text = PAGE_BUILDER_LANG;
}
```

**Pattern in template `.html`:**
```html
<h1>{{ text.page.title }}</h1>
<qo-form-field [label]="text.settings.formTitle">
```

---

## Step 2 — Phase 2 (after Phase 1, copy Form Builder)

| What to copy | Form Builder file |
|--------------|-------------------|
| Scoped JSON | `apps/builder/src/assets/i18n/form-builder/en.json` |
| Route scope | `app.routes.ts` → `provideTranslocoScope('form-builder')` |
| `.ts` i18n service | `services/form-builder-i18n.service.ts` |
| Template pattern | `*transloco="let t"` + `t('page.title')` |
| Global buttons | `{{ 'actions.cancel' \| transloco }}` |

**Do not use:** `read:` or `scope:` attributes in templates.

---

## What is already merged

| Item | Location | Status |
|------|----------|--------|
| Global shared words | `libs/lang` (`@qo/lang`) | Ready |
| Transloco platform wiring | `apps/builder/src/app/app.config.ts` | Ready (for later) |
| Feature `.ts` lang files | see table below | Ready — use them |
| JSON placeholders | `apps/<app>/src/assets/i18n/<scope>/en.json` | Keep as `{}` for now |

You do **not** need to set up `@qo/lang` or Transloco. Focus on **your feature `.ts` lang file + templates**.

---

## Pick your module

| Feature | TypeScript lang file | JSON placeholder (keep `{}`) |
|---------|----------------------|------------------------------|
| Form Builder | `apps/builder/.../form-builder/lang/form-builder.en.ts` | `assets/i18n/form-builder/en.json` |
| Page Builder | `apps/builder/.../page-builder/lang/page-builder.en.ts` | `assets/i18n/page-builder/en.json` |
| Report Builder | `apps/builder/.../report-builder/lang/reports.lang.ts` | `assets/i18n/report-builder/en.json` |
| Workflow Builder | `apps/builder/.../workflow-builder/lang/workflow-language.ts` | `assets/i18n/workflow-builder/en.json` |
| Datasources | `apps/builder/.../datasources/lang/datasources.en.ts` | `assets/i18n/datasources/en.json` |
| Deployer | `apps/deployer/src/lang/deployer.en.ts` | `apps/deployer/src/assets/i18n/deployer/en.json` |

**Global common:** `libs/lang/src/lib/i18n/en.json` — Cancel, Save, Delete, etc.

---

## Rules

1. **No hardcoded user-facing text** in HTML or `.ts`.
2. **Shared words once** — use `@qo/lang`; do not copy Cancel/Save/Delete into feature lang files.
3. **Feature-only text** in your feature `.ts` lang file.
4. **Templates use `text.*`** (or `lang.*`) from that file — not `t('...')`.
5. **One PR per feature** — do not change other modules.
6. **Leave `en.json` as `{}`** until Transloco migration is approved.

---

## Step 1 — Use your lang file

```ts
import { PAGE_BUILDER_LANG } from '../lang/page-builder.en';

export class MyComponent {
  readonly text = PAGE_BUILDER_LANG;  // or readonly lang = PAGE_BUILDER_LANG
}
```

```html
<h1>{{ text.pages.title }}</h1>
```

Shared buttons from lang file:
```html
<button>{{ text.common.cancel }}</button>
```

Or use `@qo/lang` in the lang file via `featureCommon()` / `FLAT_COMMON_LANG`.

---

## Step 2 — Audit and fix hardcoded strings

Search **only your feature folder** for:
- Quoted text in `.html` templates
- `label: '...'`, `title: '...'`, toast/dialog strings in `.ts`
- Duplicated Cancel/Save that belong in `@qo/lang`

Move feature text → your lang file. Wire `text.*` in templates.

**OK to leave as-is:** config enum values (`'Single Column'`), seed data, preview validation internals.

---

## Step 3 — Verify and open PR

**Checklist:**
- [ ] No hardcoded user-facing strings in your feature HTML/TS
- [ ] Shared labels from `@qo/lang`, not duplicated
- [ ] Components use `readonly text = FEATURE_LANG` (or `lang`)
- [ ] Templates use `text.section.key` — **not** Transloco
- [ ] `assets/i18n/<scope>/en.json` exists and stays `{}`
- [ ] Build passes: `npx nx run builder:build` (or `deployer:build`)
- [ ] UI smoke test — labels show real words, not keys like `settings.title`

**PR title:** `i18n: externalize strings for page-builder (Phase 1)`

---

## Do NOT do in this task

- Transloco in templates (`*transloco`, `t('...')`, `| transloco` for feature strings)
- `provideTranslocoScope` on routes
- Filling `en.json` with strings
- `FormBuilderI18nService`-style helpers
- Spanish locale, language switcher, CI key manager

---

## Prompt for AI assistant

```
Complete Phase 1 i18n for [MODULE] in quanta-ops.

Follow docs/team-i18n-start-here.md — Phase 1 ONLY. Do NOT use Transloco in templates.

Reference: Form Builder (working)
- apps/builder/src/app/features/form-builder/lang/form-builder.en.ts
- apps/builder/src/app/features/form-builder/components/form-settings-modal/
- Pattern: readonly text = FORM_BUILDER_LANG; templates use {{ text.settings.title }}

My module:
- Lang file: [PATH]
- Feature folder: apps/builder/src/app/features/[MODULE]/

Tasks:
1. Audit feature folder for hardcoded UI strings
2. Move strings to lang file; shared words from @qo/lang
3. Add readonly text = FEATURE_LANG in components
4. Update templates to text.section.key (NOT t('...'))
5. Keep assets/i18n/[scope]/en.json as {}
6. Run nx run builder:build and fix errors
7. Do not change other features
```

---

## Who owns what

| Owner | Module | Lang file |
|-------|--------|-----------|
| Done (reference) | Form Builder | `form-builder.en.ts` |
| Page Builder team | Page Builder | `page-builder.en.ts` |
| Report Builder team | Report Builder | `reports.lang.ts` |
| Workflow team | Workflow Builder | `workflow-language.ts` |
| Datasources team | Datasources | `datasources.en.ts` |
| Deployer team | Deployer | `deployer.en.ts` |

---

## What comes later (not now)

When platform approves Transloco migration:
1. Fill `en.json` per scope
2. Add `provideTranslocoScope` on routes
3. Migrate templates one screen at a time with UI testing
4. Add second locale + language switcher + CI

See [i18n-localization-approach.md](./i18n-localization-approach.md) §11 rollout plan.
