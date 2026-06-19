import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilderFacadeService } from '@builder/features/form-builder/services/form-builder-facade.service';
import { FormPreviewModalComponent } from '@builder/features/form-builder/components/form-preview-modal/form-preview-modal.component';
import {
  FORM_BUILDER_TEST_PROVIDERS,
  FORM_BUILDER_TRANSLOCO_TESTING_IMPORT,
} from '@builder/features/form-builder/testing/form-builder-i18n.testing';

describe('FormPreviewModalComponent', () => {
  let fixture: ComponentFixture<FormPreviewModalComponent>;
  let component: FormPreviewModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormPreviewModalComponent, FORM_BUILDER_TRANSLOCO_TESTING_IMPORT],
      providers: FORM_BUILDER_TEST_PROVIDERS,
    }).compileComponents();

    const state = TestBed.inject(FormBuilderFacadeService);
    const form = state.selectedForm();
    fixture = TestBed.createComponent(FormPreviewModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('formName', form?.name ?? '');
    fixture.componentRef.setInput('formDescription', form?.description ?? '');
    fixture.componentRef.setInput('fields', form?.fields ?? []);
    fixture.componentRef.setInput('actions', form?.actions ?? []);
    fixture.componentRef.setInput('settings', form?.settings ?? {
      formLayout: 'Single Column',
      labelPlacement: 'Top',
      showSectionBorders: false,
      submitBehavior: 'Show Message',
      redirectUrl: '',
      duplicateDetection: 'None'
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
