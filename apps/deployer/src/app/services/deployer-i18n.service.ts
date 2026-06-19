import { inject, Injectable } from '@angular/core';
import { GLOBAL_COMMON_KEY_ALIASES } from '@qo/lang';
import { HashMap, TranslocoService } from '@jsverse/transloco';
import { DEPLOYER_LANG, formatDeployerMessage } from '../../lang/deployer-lang';

export const DEPLOYER_I18N_SCOPE = 'deployer';
const DEPLOYER_SCOPE_PATH = `${DEPLOYER_I18N_SCOPE}/en`;

/** Returns a template-safe `translate()` bound to scoped deployer translations. */
export function injectDeployerTranslate(): DeployerI18nService['translate'] {
  const i18n = inject(DeployerI18nService);
  return i18n.translate.bind(i18n);
}

@Injectable({ providedIn: 'root' })
export class DeployerI18nService {
  private readonly transloco = inject(TranslocoService);

  constructor() {
    this.transloco.load(DEPLOYER_SCOPE_PATH).subscribe();
  }

  translate(key: string, params?: HashMap): string {
    return this.scope(key, params);
  }

  t(key: string, params?: HashMap): string {
    return this.scope(key, params);
  }

  scope(key: string, params?: HashMap): string {
    if (key.startsWith('common.')) {
      return this.common(key.slice('common.'.length), params);
    }

    const leafKey = key.includes('.') ? key.slice(key.lastIndexOf('.') + 1) : key;
    const globalKey = GLOBAL_COMMON_KEY_ALIASES[leafKey];
    if (globalKey) {
      const translated = this.transloco.translate(key, params ?? {}, DEPLOYER_I18N_SCOPE);
      if (translated === key) {
        const globalTranslated = this.global(globalKey, params);
        if (globalTranslated !== globalKey) {
          return globalTranslated;
        }
      }
    }

    const translated = this.transloco.translate(key, params ?? {}, DEPLOYER_I18N_SCOPE);
    return this.withFallback(translated, key, params);
  }

  global(key: string, params?: HashMap): string {
    return this.transloco.translate(key, params ?? {});
  }

  common(flatKey: string, params?: HashMap): string {
    const globalKey = GLOBAL_COMMON_KEY_ALIASES[flatKey];
    if (globalKey) {
      return this.global(globalKey, params);
    }
    return this.withFallback(
      this.transloco.translate(`common.${flatKey}`, params ?? {}, DEPLOYER_I18N_SCOPE),
      `common.${flatKey}`,
      params
    );
  }

  selectTranslate(key: string, params?: HashMap) {
    return this.transloco.selectTranslate(key, params ?? {}, DEPLOYER_I18N_SCOPE);
  }

  private withFallback(translated: string, key: string, params?: HashMap): string {
    if (translated !== key) {
      return translated;
    }

    return this.localTranslate(key, params);
  }

  private localTranslate(key: string, params?: HashMap): string {
    const localKey = key.startsWith(`${DEPLOYER_I18N_SCOPE}.`)
      ? key.slice(DEPLOYER_I18N_SCOPE.length + 1)
      : key;

    const value = localKey
      .split('.')
      .reduce<unknown>((current, segment) => {
        if (!current || typeof current !== 'object') {
          return undefined;
        }

        return (current as Record<string, unknown>)[segment];
      }, DEPLOYER_LANG);

    if (typeof value !== 'string') {
      return key;
    }

    if (!params) {
      return value;
    }

    return formatDeployerMessage(
      value,
      Object.fromEntries(Object.entries(params).map(([paramKey, paramValue]) => [paramKey, String(paramValue)]))
    );
  }
}
