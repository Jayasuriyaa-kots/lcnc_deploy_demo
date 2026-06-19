import { TestBed } from '@angular/core/testing';
import { FORM_BUILDER_TEST_PROVIDERS } from '@builder/features/form-builder/testing/form-builder-i18n.testing';
import { FormExportService } from './form-export.service';

describe('FormExportService', () => {
  let service: FormExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormExportService, ...FORM_BUILDER_TEST_PROVIDERS],
    });
    service = TestBed.inject(FormExportService);
  });

  it('creates safe export file names', () => {
    expect(service.buildExportFileName('My Form!', 'csv')).toBe('my-form.csv');
    expect(service.buildExportFileName('My Form!', 'pdf')).toBe('my-form.pdf');
  });

  it('builds csv from fields and values', () => {
    const csv = service.buildCsv(
      [{ id: 'name', label: 'Name', type: 'Short Text', properties: {} } as any],
      { name: 'Ada' }
    );

    expect(csv).toContain('"Name"');
    expect(csv).toContain('"Ada"');
  });

  it('stringifies complex values for pdf rows', () => {
    const rows = service.buildPdfRows(
      [
        { id: 'tags', label: 'Tags', type: 'Multi Select', properties: {} } as any,
        { id: 'profile', label: 'Profile', type: 'Name', properties: {} } as any
      ],
      {
        tags: ['a', 'b'],
        profile: { firstName: 'Ada' }
      }
    );

    expect(rows).toEqual([
      ['Tags', 'a, b'],
      ['Profile', '{"firstName":"Ada"}']
    ]);
  });

  it('builds a pdf document with at least one page', () => {
    const doc = service.buildPdfDocument('Leave Form', [
      { id: 'name', label: 'Name', type: 'Short Text', properties: {} } as any
    ], { name: 'Ada' });

    expect(doc.getNumberOfPages()).toBeGreaterThan(0);
  });
});
