import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QoToastService } from '@qo/ui-components';
import { FormBuilderFacadeService } from '@builder/features/form-builder/services/form-builder-facade.service';
import { FormBuilderPageComponent } from '@builder/features/form-builder/containers/form-builder-page.component';
import {
  FORM_BUILDER_TEST_PROVIDERS,
  FORM_BUILDER_TRANSLOCO_TESTING_IMPORT,
} from '@builder/features/form-builder/testing/form-builder-i18n.testing';

describe('FormBuilderPageComponent', () => {
  let fixture: ComponentFixture<FormBuilderPageComponent>;
  let component: FormBuilderPageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormBuilderPageComponent, FORM_BUILDER_TRANSLOCO_TESTING_IMPORT],
      providers: [
        ...FORM_BUILDER_TEST_PROVIDERS,
        FormBuilderFacadeService,
        {
          provide: QoToastService,
          useValue: {
            success: jasmine.createSpy('success')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormBuilderPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
