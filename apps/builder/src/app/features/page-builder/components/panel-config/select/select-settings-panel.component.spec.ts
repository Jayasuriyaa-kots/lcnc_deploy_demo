import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectSettingsPanelComponent } from '@builder/features/page-builder/components/panel-config/select/select-settings-panel.component';

describe('SelectSettingsPanelComponent', () => {
  let component: SelectSettingsPanelComponent;
  let fixture: ComponentFixture<SelectSettingsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectSettingsPanelComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectSettingsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
