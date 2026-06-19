import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilderFacadeService } from '@builder/features/form-builder/services/form-builder-facade.service';
import { FormSettingsModalComponent } from '@builder/features/form-builder/components/form-settings-modal/form-settings-modal.component';
import {
  FORM_BUILDER_TEST_PROVIDERS,
  FORM_BUILDER_TRANSLOCO_TESTING_IMPORT,
} from '@builder/features/form-builder/testing/form-builder-i18n.testing';

describe('FormSettingsModalComponent', () => {
  let fixture: ComponentFixture<FormSettingsModalComponent>;
  let component: FormSettingsModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSettingsModalComponent, FORM_BUILDER_TRANSLOCO_TESTING_IMPORT],
      providers: FORM_BUILDER_TEST_PROVIDERS,
    }).compileComponents();

    const state = TestBed.inject(FormBuilderFacadeService);
    const form = state.selectedForm();
    fixture = TestBed.createComponent(FormSettingsModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('formName', form?.name ?? '');
    fixture.componentRef.setInput('formDescription', form?.description ?? '');
    fixture.componentRef.setInput('settings', form?.settings ?? {
      formLayout: 'Single Column',
      labelPlacement: 'Top',
      showSectionBorders: false,
      submitBehavior: 'Show Message',
      redirectUrl: '',
      duplicateDetection: 'None'
    });
    fixture.componentRef.setInput('meta', {
      name: form?.name ?? '',
      description: form?.description ?? '',
      datasourceLabel: form?.datasourceLabel ?? '',
      queryLabel: form?.queryLabel ?? '',
      fieldCount: form?.fields.length ?? 0,
      status: form?.status ?? 'draft'
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
