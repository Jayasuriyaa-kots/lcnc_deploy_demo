# `@qo/lang`

Shared i18n for all Quanta Ops frontends.

**Day-to-day reference:** [docs/i18n-reference.md](../docs/i18n-reference.md) (file locations, sync/audit commands, how to add strings).

**Design doc:** [docs/i18n-localization-approach.md](../docs/i18n-localization-approach.md).

## Layout

| Path | Purpose |
|------|---------|
| `src/lib/i18n/en.json` | Global common (Cancel, Save, validation, …) — served at `/assets/i18n/en.json` |
| `src/lib/common.en.ts` | Same content for Phase 1 TS (`FLAT_COMMON_LANG`, `featureCommon`) |
| `src/lib/transloco-loader.ts` | HTTP loader |
| `src/lib/transloco.providers.ts` | `provideQuantaTransloco()` |

## Feature copy (builder example)

- **Now:** one file per feature — `apps/builder/src/app/features/<feature>/lang/<feature>.en.ts` (e.g. `form-builder.en.ts`, `reports.lang.ts`).
- **Later (Transloco):** `apps/builder/src/assets/i18n/<scope>/en.json` when templates migrate off `FORM_BUILDER_LANG`.

Scope name = feature folder name (`form-builder`, `report-builder`, …).

## App wiring

1. `provideQuantaTransloco()` in `app.config.ts` (app already provides `HttpClient`).
2. Assets in `project.json`: glob `libs/lang/src/lib/i18n` → `/assets/i18n/`, plus `apps/<app>/src/assets` → `/assets/`.
3. Optional per route: `provideTranslocoScope('form-builder')` (see i18n doc §6.7).
