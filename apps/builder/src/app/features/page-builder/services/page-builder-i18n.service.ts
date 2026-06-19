import { inject, Injectable } from '@angular/core';
import { GLOBAL_COMMON_KEY_ALIASES } from '@qo/lang';
import { HashMap, TranslocoService } from '@jsverse/transloco';

/** Transloco scope name — must match `assets/i18n/page-builder/`. */
export const PAGE_BUILDER_I18N_SCOPE = 'page-builder';
const PAGE_BUILDER_SCOPE_PATH = `${PAGE_BUILDER_I18N_SCOPE}/en`;

/** Returns a template-safe `t()` bound to scoped page-builder translations. */
export function injectPageBuilderTranslate(): PageBuilderI18nService['t'] {
  const i18n = inject(PageBuilderI18nService);
  return i18n.t.bind(i18n);
}

@Injectable({ providedIn: 'root' })
export class PageBuilderI18nService {
  private readonly transloco = inject(TranslocoService);

  constructor() {
    this.transloco.load(PAGE_BUILDER_SCOPE_PATH).subscribe();
  }

  t(key: string, params?: HashMap): string {
    if (key.startsWith('common.')) {
      return this.common(key.slice('common.'.length), params);
    }
    return this.scope(key, params);
  }

  scope(key: string, params?: HashMap): string {
    return this.transloco.translate(key, params ?? {}, PAGE_BUILDER_I18N_SCOPE);
  }

  global(key: string, params?: HashMap): string {
    return this.transloco.translate(key, params ?? {});
  }

  common(flatKey: string, params?: HashMap): string {
    const globalKey = GLOBAL_COMMON_KEY_ALIASES[flatKey];
    if (globalKey) {
      return this.global(globalKey, params);
    }
    return this.scope(`common.${flatKey}`, params);
  }
}
