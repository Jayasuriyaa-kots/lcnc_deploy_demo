import { inject, Injectable } from '@angular/core';
import { GLOBAL_COMMON_KEY_ALIASES } from '@qo/lang';
import { HashMap, TranslocoService } from '@jsverse/transloco';

/** Transloco scope name - must match `assets/i18n/workflow-builder/`. */
export const WORKFLOW_BUILDER_I18N_SCOPE = 'workflow-builder';

/**
 * Workflow Builder Phase 2 - Transloco access for `.ts` callers.
 * Templates should prefer `*transloco="let t"` and global pipes for shared actions.
 */
@Injectable({ providedIn: 'root' })
export class WorkflowBuilderI18nService {
  private readonly transloco = inject(TranslocoService);

  scope(key: string, params?: HashMap): string {
    if (key.startsWith('common.')) {
      return this.common(key.slice('common.'.length), params);
    }
    return this.transloco.translate(key, params ?? {}, WORKFLOW_BUILDER_I18N_SCOPE);
  }

  global(key: string, params?: HashMap): string {
    return this.transloco.translate(key, params ?? {});
  }

  common(flatKey: string, params?: HashMap): string {
    const globalKey = GLOBAL_COMMON_KEY_ALIASES[flatKey];
    if (globalKey) {
      return this.global(globalKey, params);
    }
    return this.transloco.translate(`common.${flatKey}`, params ?? {}, WORKFLOW_BUILDER_I18N_SCOPE);
  }
}
