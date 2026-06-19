import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilderFacadeService } from '@builder/features/form-builder/services/form-builder-facade.service';
import { FormFieldInspectorComponent } from '@builder/features/form-builder/containers/form-field-inspector/form-field-inspector.component';
import {
  FORM_BUILDER_TEST_PROVIDERS,
  FORM_BUILDER_TRANSLOCO_TESTING_IMPORT,
} from '@builder/features/form-builder/testing/form-builder-i18n.testing';

describe('FormFieldInspectorComponent', () => {
  let fixture: ComponentFixture<FormFieldInspectorComponent>;
  let component: FormFieldInspectorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldInspectorComponent, FORM_BUILDER_TRANSLOCO_TESTING_IMPORT],
      providers: FORM_BUILDER_TEST_PROVIDERS,
    }).compileComponents();

    const state = TestBed.inject(FormBuilderFacadeService);
    const field = state.selectedForm()?.fields[0] ?? null;
    fixture = TestBed.createComponent(FormFieldInspectorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('field', field);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
