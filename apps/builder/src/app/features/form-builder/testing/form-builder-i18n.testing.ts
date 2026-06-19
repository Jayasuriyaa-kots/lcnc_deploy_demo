import { Provider } from '@angular/core';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { FORM_BUILDER_LANG } from '@builder/features/form-builder/lang/form-builder.en';
import { FormBuilderI18nService } from '@builder/features/form-builder/services/form-builder-i18n.service';
import { FormBuilderSubmissionStorageService } from '@builder/features/form-builder/services/form-builder-submission-storage.service';

function formatMessage(template: string, params: Record<string, unknown>): string {
  return Object.entries(params).reduce(
    (next, [key, value]) => next.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value)),
    template
  );
}

function resolveFormBuilderTestKey(key: string, params?: Record<string, unknown>): string {
  const scopedKey = key.startsWith('common.') ? key : key;

  const value = scopedKey
    .split('.')
    .reduce<unknown>((current, segment) => {
      if (!current || typeof current !== 'object') {
        return undefined;
      }
      return (current as Record<string, unknown>)[segment];
    }, FORM_BUILDER_LANG as unknown);

  if (typeof value === 'function') {
    const args = params ? Object.values(params).map((entry) => String(entry)) : [];
    return String((value as (...args: string[]) => string)(...args));
  }

  if (typeof value !== 'string') {
    return key;
  }

  return params ? formatMessage(value, params) : value;
}

export const FORM_BUILDER_TRANSLOCO_TESTING_IMPORT = TranslocoTestingModule.forRoot({
  langs: { en: {} },
  translocoConfig: {
    availableLangs: ['en'],
    defaultLang: 'en',
    fallbackLang: 'en',
    reRenderOnLangChange: false,
    prodMode: true,
  },
});

export const FORM_BUILDER_I18N_TESTING_PROVIDER: Provider = {
  provide: FormBuilderI18nService,
  useValue: {
    t: resolveFormBuilderTestKey,
    scope: resolveFormBuilderTestKey,
    global: resolveFormBuilderTestKey,
    common: (flatKey: string, params?: Record<string, unknown>) =>
      resolveFormBuilderTestKey(`common.${flatKey}`, params),
  },
};

export const FORM_BUILDER_SUBMISSION_STORAGE_TESTING_PROVIDER: Provider = {
  provide: FormBuilderSubmissionStorageService,
  useValue: {
    saveSubmission: jasmine.createSpy('saveSubmission'),
    listSubmissions: jasmine.createSpy('listSubmissions').and.returnValue([]),
    clearSubmissions: jasmine.createSpy('clearSubmissions'),
  },
};

/** Shared providers for form-builder unit tests. */
export const FORM_BUILDER_TEST_PROVIDERS: Provider[] = [
  FORM_BUILDER_I18N_TESTING_PROVIDER,
  FORM_BUILDER_SUBMISSION_STORAGE_TESTING_PROVIDER,
];
