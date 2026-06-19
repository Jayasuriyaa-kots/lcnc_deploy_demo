import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormSubmitSettingsComponent } from '@builder/features/page-builder/components/panel-config/form/form-submit-settings/form-submit-settings.component';

describe('FormSubmitSettingsComponent', () => {
  let component: FormSubmitSettingsComponent;
  let fixture: ComponentFixture<FormSubmitSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSubmitSettingsComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FormSubmitSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
