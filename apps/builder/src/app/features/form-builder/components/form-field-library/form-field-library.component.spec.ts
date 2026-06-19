import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormFieldLibraryComponent } from '@builder/features/form-builder/components/form-field-library/form-field-library.component';
import {
  FORM_BUILDER_TEST_PROVIDERS,
  FORM_BUILDER_TRANSLOCO_TESTING_IMPORT,
} from '@builder/features/form-builder/testing/form-builder-i18n.testing';

describe('FormFieldLibraryComponent', () => {
  let fixture: ComponentFixture<FormFieldLibraryComponent>;
  let component: FormFieldLibraryComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldLibraryComponent, FORM_BUILDER_TRANSLOCO_TESTING_IMPORT],
      providers: FORM_BUILDER_TEST_PROVIDERS,
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldLibraryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('searchQuery', '');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
