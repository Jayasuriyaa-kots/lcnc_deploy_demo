import { Provider } from '@angular/core';
import { ReportBuilderI18nService } from '@builder/features/report-builder/services/report-builder-i18n.service';

/**
 * Test double for {@link ReportBuilderI18nService}.
 *
 * Returns translation keys verbatim so specs stay decoupled from copy and never
 * reach Transloco / HTTP (Frontend Unit Testing Guide §9 — always mock injected
 * services). Every report-builder component now resolves text through
 * `injectReportBuilderTranslate()`, and the facade injects this service too, so
 * this provider is the single dependency a smoke test needs.
 */
export function provideReportBuilderI18nTesting(): Provider {
  const echo = (key: string): string => key;
  const stub: Pick<ReportBuilderI18nService, 't' | 'scope' | 'global' | 'common'> = {
    t: echo,
    scope: echo,
    global: echo,
    common: echo,
  };
  return { provide: ReportBuilderI18nService, useValue: stub };
}
