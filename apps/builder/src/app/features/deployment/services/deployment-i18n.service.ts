import { inject, Injectable } from '@angular/core';
import { GLOBAL_COMMON_KEY_ALIASES } from '@qo/lang';
import { TranslocoService } from '@jsverse/transloco';
import { DEPLOYMENT_LANG } from '../lang/deployment.en';

/** Returns a template-safe `t()` bound to scoped deployment translations. */
export function injectDeploymentTranslate(): DeploymentI18nService['t'] {
  const i18n = inject(DeploymentI18nService);
  return i18n.t.bind(i18n);
}

const DEPLOYMENT_SCOPE = 'deployment';
const DEPLOYMENT_SCOPE_PATH = `${DEPLOYMENT_SCOPE}/en`;

type TranslateParams = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class DeploymentI18nService {
  private readonly transloco = inject(TranslocoService);

  constructor() {
    this.transloco.load(DEPLOYMENT_SCOPE_PATH).subscribe();
  }

  t(key: string, params?: TranslateParams): string {
    if (key.startsWith('common.')) {
      return this.common(key.slice('common.'.length), params);
    }
    return this.scope(key, params);
  }

  scope(key: string, params?: TranslateParams): string {
    const translated = this.transloco.translate(key, params ?? {}, DEPLOYMENT_SCOPE);
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
    const scopedTranslated = this.transloco.translate(`common.${flatKey}`, params ?? {}, DEPLOYMENT_SCOPE);
    return this.withFallback(scopedTranslated, `common.${flatKey}`, params);
  }

  private withFallback(translated: string, key: string, params?: TranslateParams): string {
    if (
      translated &&
      translated !== key &&
      translated !== `${DEPLOYMENT_SCOPE}.${key}` &&
      !translated.startsWith(`${DEPLOYMENT_SCOPE}.`)
    ) {
      return translated;
    }
    return this.localTranslate(key, params);
  }

  private localTranslate(key: string, params?: TranslateParams): string {
    const scopedKey = key.startsWith(`${DEPLOYMENT_SCOPE}.`)
      ? key.slice(DEPLOYMENT_SCOPE.length + 1)
      : key;

    const value = scopedKey
      .split('.')
      .reduce<unknown>((current, segment) => {
        if (!current || typeof current !== 'object') return undefined;
        return (current as Record<string, unknown>)[segment];
      }, DEPLOYMENT_LANG);

    if (typeof value === 'function') {
      const args = params ? Object.values(params).map((v) => String(v)) : [];
      return String((value as (...args: string[]) => string)(...args));
    }

    if (typeof value !== 'string') return key;

    if (!params) return value;

    return Object.entries(params).reduce(
      (result, [k, v]) => result.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v)),
      value
    );
  }
}
