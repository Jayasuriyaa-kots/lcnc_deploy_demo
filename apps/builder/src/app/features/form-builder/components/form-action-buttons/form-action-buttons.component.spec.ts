import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilderFacadeService } from '@builder/features/form-builder/services/form-builder-facade.service';
import { FormActionButtonsComponent } from '@builder/features/form-builder/components/form-action-buttons/form-action-buttons.component';
import {
  FORM_BUILDER_TEST_PROVIDERS,
  FORM_BUILDER_TRANSLOCO_TESTING_IMPORT,
} from '@builder/features/form-builder/testing/form-builder-i18n.testing';

describe('FormActionButtonsComponent', () => {
  let fixture: ComponentFixture<FormActionButtonsComponent>;
  let component: FormActionButtonsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormActionButtonsComponent, FORM_BUILDER_TRANSLOCO_TESTING_IMPORT],
      providers: FORM_BUILDER_TEST_PROVIDERS,
    }).compileComponents();

    const state = TestBed.inject(FormBuilderFacadeService);
    const actions = state.selectedForm()?.actions ?? [];
    fixture = TestBed.createComponent(FormActionButtonsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('actions', actions);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
