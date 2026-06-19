import { TestBed } from '@angular/core/testing';
import { FORM_BUILDER_TEST_PROVIDERS } from '@builder/features/form-builder/testing/form-builder-i18n.testing';
import { FormPreviewModalFacade } from './form-preview-modal.facade';

const defaultSettings = {
  formLayout: 'Single Column' as const,
  labelPlacement: 'Top' as const,
  showSectionBorders: false,
  submitBehavior: 'Show Message' as const,
  duplicateDetection: 'None' as const
};

describe('FormPreviewModalFacade', () => {
  let facade: FormPreviewModalFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormPreviewModalFacade, ...FORM_BUILDER_TEST_PROVIDERS],
    });
    facade = TestBed.inject(FormPreviewModalFacade);
  });

  it('resets values for fields', () => {
    facade.reset([
      { id: 'name', label: 'Name', type: 'Short Text', properties: {} } as any,
      { id: 'tags', label: 'Tags', type: 'Multi Select', properties: {} } as any
    ]);

    expect(facade.values()).toEqual({ name: '', tags: [] });
    expect(facade.submitted()).toBe(false);
    expect(facade.submitAttempted()).toBe(false);
  });

  it('blocks submit when required field is empty', () => {
    const valid = facade.submit(
      [{ id: 'name', label: 'Name', type: 'Short Text', properties: { required: true } } as any],
      defaultSettings
    );

    expect(valid).toBe(false);
    expect(facade.errors()['name']).toBe('Name is required.');
    expect(facade.submitted()).toBe(false);
  });

  it('submits when required fields are filled', () => {
    facade.reset([{ id: 'name', label: 'Name', type: 'Short Text', properties: { required: true } } as any]);
    facade.setValue('name', 'Ada');

    const valid = facade.submit(
      [{ id: 'name', label: 'Name', type: 'Short Text', properties: { required: true } } as any],
      defaultSettings
    );

    expect(valid).toBe(true);
    expect(facade.submitted()).toBe(true);
    expect(facade.errors()).toEqual({});
  });

  it('marks draft saved without submitting', () => {
    facade.saveDraft();

    expect(facade.draftSaved()).toBe(true);
    expect(facade.submitAttempted()).toBe(false);
    expect(facade.submitted()).toBe(false);
  });

  it('runs reset action', () => {
    facade.setValue('name', 'Ada');
    facade.runAction(
      { id: 'reset', name: 'Reset', style: 'ghost', actionType: 'reset' },
      [{ id: 'name', label: 'Name', type: 'Short Text', properties: {} } as any],
      defaultSettings
    );

    expect(facade.values()).toEqual({ name: '' });
  });
});
