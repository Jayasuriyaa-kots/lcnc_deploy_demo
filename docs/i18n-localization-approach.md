# Internationalization (i18n) Approach — Quanta Ops

**Status:** Proposed · **Scope:** builder / client / deployer apps + shared libs · **Target locales:** English (default) + one LTR language to start

This document proposes how we externalize every static UI string into language files, share common text without duplication, and support runtime language switching across the Nx monorepo.

---

## 1. Goals

1. **Single source of truth** — no hardcoded user-facing strings in templates or `.ts` files. Every static string lives in a lang file.
2. **No repetition of common text** — "Save", "Cancel", "Search…", validation messages, etc. are defined **once** and reused everywhere (the "inheritance" requirement).
3. **Multiple languages** with **runtime switching** (no rebuild to change language).
4. **Scales** across 3 apps and ~12 features without one giant translation blob.
5. **Type-safe** — a typo in a translation key is a compile/lint error, not a runtime blank.

---

## 2. Library decision: **Transloco** (`@jsverse/transloco`)

| Option | Runtime switch | Monorepo scoping | Fallback / inheritance | Verdict |
|---|---|---|---|---|
| `@angular/localize` | ❌ separate build per locale | weak | none | Wrong for runtime switching |
| `@ngx-translate/core` | ✅ | flat, manual | fallback lang only | Works, but no first-class scoping |
| **Transloco** | ✅ | **scopes per feature/lib** | fallback lang + global merge | **Selected** |

**Why Transloco scales here:** its *scopes* let each feature/lib own a small translation file that lazy-loads with its route, instead of every app downloading one monolithic file. That keeps files small, ownership clear, and bundles lean as we grow.

---

## 3. How "common text, not repeated" works

Two mechanisms together satisfy the no-duplication requirement:

### a) A global `common` namespace (referenced, never re-typed)
Shared atoms live in **one** file per language and are read by key from anywhere:

```html
<button>{{ 'actions.cancel' | transloco }}</button>   <!-- from common -->
<h2>{{ 'confirmDialog.title' | transloco }}</h2>       <!-- from a scope -->
```

A feature's lang file only contains what is **unique** to that feature; everything generic resolves against `common`.

### b) Fallback language (inheritance for missing translations)
`fallbackLang: 'en'` means any key not yet translated in the second locale automatically resolves to the English value — a half-translated locale never renders a blank or a raw key.

---

## 4. File & folder structure

```
libs/lang/                                  ← shared across ALL apps
  src/
    index.ts                                ← exports providers, loader, key types
    lib/
      transloco-loader.ts                   ← HTTP loader (reused by every app)
      transloco.providers.ts                ← provideQuantaTransloco()
      i18n/
        en.json                             ← GLOBAL COMMON (the "base")
        es.json                             ← global common, second locale

apps/builder/src/assets/i18n/
  form-builder/
    en.json                                 ← feature scope
    es.json
  report-builder/
    en.json
    es.json
  confirm-dialog/
    en.json
    es.json
```

- The **global common** file is owned by `libs/lang` and served to every app via an `assets` glob, so it is defined exactly once.
- Each **feature scope** lives inside its app and lazy-loads with the route.

### Global common — `libs/lang/src/lib/i18n/en.json`
```json
{
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "delete": "Delete",
    "create": "New",
    "search": "Search..."
  },
  "states": { "loading": "Loading…", "empty": "Nothing here yet" },
  "validation": {
    "required": "This field is required",
    "tooLong": "Must be {{ max }} characters or fewer"
  }
}
```

---

## 5. The pipe question — pipe works, but it is the *minority* tool

The `transloco` **pipe** only works inside templates. A large share of our static strings live in **`.ts` files** (e.g. `BUILDER_MODULE_CONFIG` / `*.data.ts`, `ConfirmDialogConfig` objects, toast/validation messages built in services). A pipe cannot run there. So we use **three tools, chosen by where the string lives:**

| Where the string lives | Use | Why |
|---|---|---|
| Template with **many** strings (our big inline templates) | `*transloco` **structural directive** | One subscription per component; reads the scope into a local var. Best perf under OnPush. |
| Template, **one-off** binding | `transloco` **pipe** | Fine for a single label; each use is its own subscription — don't carpet a 40-string template with it. |
| **`.ts` files** — configs, toasts, dynamic objects | `TranslocoService` (`selectTranslate()` / signal) | Only option that works outside templates; handles `*.data.ts`, dialog and toast cases. |

**Rule of thumb:** directive-first in templates, pipe for the occasional single label, service for everything in `.ts`. A pipe-only strategy would get stuck the moment it hits `BUILDER_MODULE_CONFIG` and the confirm-dialog configs — which is where most of our current static text actually lives.

---

## 6. Setup steps

### 6.1 Install
```bash
npm install @jsverse/transloco@^7
npm install -D @jsverse/transloco-keys-manager@^5
```

### 6.2 Path alias — `tsconfig.base.json`
```jsonc
"@qo/lang": ["libs/lang/src/index.ts"],
"@qo/lang/*": ["libs/lang/src/*"]
```

### 6.3 HTTP loader — `libs/lang/src/lib/transloco-loader.ts`
```ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Translation, TranslocoLoader } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);
  getTranslation(lang: string) {
    // lang is "en", or "form-builder/en" for a scope
    return this.http.get<Translation>(`/assets/i18n/${lang}.json`);
  }
}
```

### 6.4 Providers — `libs/lang/src/lib/transloco.providers.ts`
```ts
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';
import { TranslocoHttpLoader } from './transloco-loader';

export const provideQuantaTransloco = () => [
  provideHttpClient(),
  provideTransloco({
    config: {
      availableLangs: ['en', 'es'],
      defaultLang: 'en',
      fallbackLang: 'en',
      reRenderOnLangChange: true,
      prodMode: false, // set via environment
      missingHandler: { useFallbackTranslation: true },
    },
    loader: TranslocoHttpLoader,
  }),
];
```

### 6.5 Wire into the app — `apps/builder/src/app/app.config.ts`
```ts
import { provideQuantaTransloco } from '@qo/lang';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideQuantaTransloco(),   // ← add
  ],
};
```

### 6.6 Serve the lang files — `apps/builder/project.json` (`build.options`)
The global common comes from `libs/lang`; feature scopes come from the app. Both are globbed into `/assets/i18n/`:
```jsonc
"assets": [
  { "glob": "**/*", "input": "libs/lang/src/lib/i18n", "output": "/assets/i18n/" },
  { "glob": "**/*", "input": "apps/builder/src/assets", "output": "/assets/" }
]
```
Repeat the same two `assets` entries in `client` and `deployer` `project.json` so all apps share the one common file.

### 6.7 Per-feature scope (lazy)
```ts
// form-builder.routes.ts (or the route definition)
import { provideTranslocoScope } from '@jsverse/transloco';

{ path: 'form-builder', component: FormBuilderPageComponent,
  providers: provideTranslocoScope('form-builder') }
```

---

## 7. Worked migration examples

### 7.1 Template-heavy component → structural directive
**Before** — `confirm-dialog.component.ts` (hardcoded):
```html
<button (click)="cancel()">{{ config().cancelLabel ?? 'Cancel' }}</button>
<button (click)="confirm()">{{ config().confirmLabel ?? 'Confirm' }}</button>
```
**After** — directive reads common + scope once:
```html
<ng-container *transloco="let t">
  <h2>{{ config().title }}</h2>            <!-- title still passed by caller -->
  <button (click)="cancel()">{{ t('actions.cancel') }}</button>
  <button (click)="confirm()">{{ t('actions.confirm') }}</button>
</ng-container>
```
```ts
imports: [TranslocoDirective], // add to component imports
```

### 7.2 Strings in `.ts` constants → keys + service
**Before** — `shared/constants/builder-shell.data.ts`:
```ts
export const BUILDER_MODULE_LINKS = [
  { id: 'deployment', label: 'Deployment', route: '/deployment' },
];
```
**After** — store keys, resolve at use site:
```ts
export const BUILDER_MODULE_LINKS = [
  { id: 'deployment', labelKey: 'builder.modules.deployment', route: '/deployment' },
];
```
```ts
// in the component/service
private t = inject(TranslocoService);
label = this.t.translate(link.labelKey);          // one-off
label$ = this.t.selectTranslate(link.labelKey);    // re-emits on lang change
```

---

## 8. Type safety & extraction (`transloco-keys-manager`)

Add scripts to `package.json`:
```jsonc
"i18n:find":    "transloco-keys-manager find",    // report keys used but missing
"i18n:extract": "transloco-keys-manager extract", // pull keys from templates into JSON
"i18n:types":   "transloco-keys-manager types"    // generate typed key unions
```
- `extract` scans templates/`.ts` and writes any new keys into the JSON files.
- `find` fails CI if a used key has no translation, or flags unused keys.
- `types` generates a key union so `t('actions.cnacel')` is a compile error with autocomplete.

Wire `i18n:find` into CI to enforce "every used string exists in every language."

---

## 9. Language switcher (runtime)

```ts
private t = inject(TranslocoService);
switchLang(lang: 'en' | 'es') { this.t.setActiveLang(lang); }
getActive() { return this.t.getActiveLang(); }
```
Persist the choice (e.g. `localStorage`) and read it in an `APP_INITIALIZER` to restore on reload.

---

## 10. Conventions (team rules)

- **No hardcoded user-facing strings** in templates or `.ts`. Lint/`i18n:find` enforces it.
- One scope per feature; scope name == feature folder name.
- Generic atoms go in **global common**, never duplicated into a scope.
- Interpolations use Transloco params (`{{ max }}`), never string concatenation.
- Directive-first in templates; pipe only for single labels; service for `.ts`.
- Keep keys structured/namespaced (`actions.*`, `validation.*`, `<feature>.*`).

---

## 11. Rollout plan

1. **Foundation** — create `libs/lang` (loader, providers, global common `en`/`es`), add path alias, wire `provideQuantaTransloco()` + `assets` into **builder** first.
2. **Reference migration** — migrate `confirm-dialog` (template → directive) and `builder-shell.data.ts` (consts → keys + service) as the pattern to copy.
3. **Feature-by-feature** — migrate builder features one scope at a time; add `i18n:find` to CI.
4. **Replicate** — apply the same wiring to `client` and `deployer` (they reuse the same `libs/lang` common file).
5. **Second locale** — translate the `es.json` files; verify switching + fallback.

---

## 12. Open questions for the team

- Which is the second locale? (doc uses `es` as a placeholder — rename throughout.)
- Where does the language switcher live in the UI (topbar?), and do we persist per-user vs per-device?
- Do we gate CI on `i18n:find` (fail on missing keys) from day one, or after the first full migration?
