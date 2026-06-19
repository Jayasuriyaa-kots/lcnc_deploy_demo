import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { of } from 'rxjs';
import {
  REPORT_BUILDER_I18N_SCOPE,
  ReportBuilderI18nService,
} from './report-builder-i18n.service';

describe('ReportBuilderI18nService', () => {
  let service: ReportBuilderI18nService;
  let transloco: jasmine.SpyObj<TranslocoService>;

  beforeEach(() => {
    transloco = jasmine.createSpyObj<TranslocoService>('TranslocoService', [
      'translate',
      'load',
    ]);
    // The constructor eagerly loads the scope; return a completed stream.
    transloco.load.and.returnValue(of({}) as ReturnType<TranslocoService['load']>);
    // Echo the key so delegation is observable without real translations.
    transloco.translate.and.callFake((key: string) => key as never);

    TestBed.configureTestingModule({
      providers: [
        ReportBuilderI18nService,
        { provide: TranslocoService, useValue: transloco },
      ],
    });

    service = TestBed.inject(ReportBuilderI18nService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('eagerly loads the report-builder scope on construction', () => {
    expect(transloco.load).toHaveBeenCalledWith(`${REPORT_BUILDER_I18N_SCOPE}/en`);
  });

  describe('scope() / t()', () => {
    it('translates a key against the report-builder scope', () => {
      service.scope('wizard.title');

      expect(transloco.translate).toHaveBeenCalledWith(
        'wizard.title',
        {},
        REPORT_BUILDER_I18N_SCOPE
      );
    });

    it('forwards interpolation params', () => {
      service.scope('toasts.deleted', { count: 3 });

      expect(transloco.translate).toHaveBeenCalledWith(
        'toasts.deleted',
        { count: 3 },
        REPORT_BUILDER_I18N_SCOPE
      );
    });

    it('t() delegates to scope()', () => {
      const result = service.t('preview.title');

      expect(result).toBe('preview.title');
      expect(transloco.translate).toHaveBeenCalledWith(
        'preview.title',
        {},
        REPORT_BUILDER_I18N_SCOPE
      );
    });
  });

  describe('global()', () => {
    it('translates against the root scope (no scope argument)', () => {
      service.global('actions.save');

      expect(transloco.translate).toHaveBeenCalledWith('actions.save', {});
    });
  });

  describe('common()', () => {
    it('maps a known flat key to its global Transloco path', () => {
      service.common('cancel');

      expect(transloco.translate).toHaveBeenCalledWith('actions.cancel', {});
    });

    it('falls back to a scoped common.* key for unknown flat keys', () => {
      // A feature-specific key that is intentionally NOT in @qo/lang's global
      // common aliases, so it must resolve against the report-builder scope.
      service.common('featureOnlyKey');

      expect(transloco.translate).toHaveBeenCalledWith(
        'common.featureOnlyKey',
        {},
        REPORT_BUILDER_I18N_SCOPE
      );
    });
  });
});
