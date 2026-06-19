import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilderFacadeService } from '@builder/features/form-builder/services/form-builder-facade.service';
import { FormCreateWizardComponent } from '@builder/features/form-builder/containers/form-create-wizard/form-create-wizard.component';
import {
  FORM_BUILDER_TEST_PROVIDERS,
  FORM_BUILDER_TRANSLOCO_TESTING_IMPORT,
} from '@builder/features/form-builder/testing/form-builder-i18n.testing';

describe('FormCreateWizardComponent', () => {
  let fixture: ComponentFixture<FormCreateWizardComponent>;
  let component: FormCreateWizardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCreateWizardComponent, FORM_BUILDER_TRANSLOCO_TESTING_IMPORT],
      providers: FORM_BUILDER_TEST_PROVIDERS,
    }).compileComponents();

    const state = TestBed.inject(FormBuilderFacadeService);
    fixture = TestBed.createComponent(FormCreateWizardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('datasourceOptions', state.datasourceOptions);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
