import { inject, Injectable } from '@angular/core';
import { GLOBAL_COMMON_KEY_ALIASES } from '@qo/lang';
import { TranslocoService } from '@jsverse/transloco';
import { FORM_BUILDER_LANG } from '@builder/features/form-builder/lang/form-builder.en';

/** Returns a template-safe `t()` bound to scoped form-builder translations. */
export function injectFormBuilderTranslate(): FormBuilderI18nService['t'] {
  const i18n = inject(FormBuilderI18nService);
  return i18n.t.bind(i18n);
}

const FORM_BUILDER_SCOPE = 'form-builder';
const FORM_BUILDER_SCOPE_PATH = `${FORM_BUILDER_SCOPE}/en`;

type TranslateParams = Record<string, unknown>;

function formatFormBuilderMessage(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (next, [key, value]) => next.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value),
    template
  );
}

@Injectable({ providedIn: 'root' })
export class FormBuilderI18nService {
  private readonly transloco = inject(TranslocoService);

  constructor() {
    this.transloco.load(FORM_BUILDER_SCOPE_PATH).subscribe();
  }

  t(key: string, params?: TranslateParams): string {
    if (key.startsWith('common.')) {
      return this.common(key.slice('common.'.length), params);
    }
    return this.scope(key, params);
  }

  scope(key: string, params?: TranslateParams): string {
    const translated = this.transloco.translate(key, params ?? {}, FORM_BUILDER_SCOPE);
    return this.withFallback(translated, key, params);
  }

  global(key: string, params?: TranslateParams): string {
    const translated = this.transloco.translate(key, params ?? {});
    if (translated && translated !== key) {
      return translated;
    }
    return this.localTranslate(key, params);
  }

  common(flatKey: string, params?: TranslateParams): string {
    const globalKey = GLOBAL_COMMON_KEY_ALIASES[flatKey];
    if (globalKey) {
      const globalTranslated = this.global(globalKey, params);
      if (globalTranslated && globalTranslated !== globalKey) {
        return globalTranslated;
      }
    }

    const scopedTranslated = this.transloco.translate(`common.${flatKey}`, params ?? {}, FORM_BUILDER_SCOPE);
    return this.withFallback(scopedTranslated, `common.${flatKey}`, params);
  }

  private withFallback(translated: string, key: string, params?: TranslateParams): string {
    if (translated && translated !== key) {
      return translated;
    }
    return this.localTranslate(key, params);
  }

  private localTranslate(key: string, params?: TranslateParams): string {
    const scopedKey = key.startsWith(`${FORM_BUILDER_SCOPE}.`)
      ? key.slice(FORM_BUILDER_SCOPE.length + 1)
      : key;

    const value = scopedKey
      .split('.')
      .reduce<unknown>((current, segment) => {
        if (!current || typeof current !== 'object') {
          return undefined;
        }
        return (current as Record<string, unknown>)[segment];
      }, FORM_BUILDER_LANG);

    if (typeof value === 'function') {
      const args = params ? Object.values(params).map((entry) => String(entry)) : [];
      return String((value as (...args: string[]) => string)(...args));
    }

    if (typeof value !== 'string') {
      return key;
    }

    if (!params) {
      return value;
    }

    const stringParams = Object.fromEntries(
      Object.entries(params).map(([paramKey, paramValue]) => [paramKey, String(paramValue)])
    );
    return formatFormBuilderMessage(value, stringParams);
  }
}
