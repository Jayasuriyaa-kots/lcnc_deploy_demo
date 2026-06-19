import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectFormPanelComponent } from '@builder/features/page-builder/components/panel-config/form/select-form-panel/select-form-panel.component';

describe('SelectFormPanelComponent', () => {
  let component: SelectFormPanelComponent;
  let fixture: ComponentFixture<SelectFormPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectFormPanelComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectFormPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
