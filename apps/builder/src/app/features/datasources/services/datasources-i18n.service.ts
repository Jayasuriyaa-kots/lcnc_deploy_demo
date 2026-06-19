import { inject, Injectable } from '@angular/core';
import { GLOBAL_COMMON_KEY_ALIASES } from '@qo/lang';
import { TranslocoService } from '@jsverse/transloco';

type TranslateParams = Record<string, string | number | boolean>;

export function injectDatasourcesTranslate(): DatasourcesI18nService['t'] {
  const i18n = inject(DatasourcesI18nService);
  return i18n.t.bind(i18n);
}

const DATASOURCES_SCOPE = 'datasources';
const DATASOURCES_SCOPE_PATH = `${DATASOURCES_SCOPE}/en`;

@Injectable({ providedIn: 'root' })
export class DatasourcesI18nService {
  private readonly transloco = inject(TranslocoService);

  constructor() {
    this.transloco.load(DATASOURCES_SCOPE_PATH).subscribe();
  }

  t(key: string, params?: TranslateParams): string {
    if (key.startsWith('common.')) {
      return this.common(key.slice('common.'.length));
    }
    return this.scope(key, params);
  }

  translate(key: string, params?: TranslateParams): string {
    return this.t(key, params);
  }

  scope(key: string, params?: TranslateParams): string {
    return this.transloco.translate(key, params ?? {}, DATASOURCES_SCOPE);
  }

  global(key: string, params?: TranslateParams): string {
    return this.transloco.translate(key, params ?? {});
  }

  common(flatKey: string): string {
    const globalKey = GLOBAL_COMMON_KEY_ALIASES[flatKey];
    return globalKey ? this.global(globalKey) : this.scope(`common.${flatKey}`);
  }

  selectTranslate(key: string, params?: TranslateParams) {
    return this.transloco.selectTranslate(key, params ?? {}, DATASOURCES_SCOPE);
  }
}
