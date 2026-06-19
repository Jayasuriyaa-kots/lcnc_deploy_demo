import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanelDisplaySettingsComponent } from '@builder/features/page-builder/components/panel-config/report/panel-display-settings/panel-display-settings.component';

describe('PanelDisplaySettingsComponent', () => {
  let component: PanelDisplaySettingsComponent;
  let fixture: ComponentFixture<PanelDisplaySettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelDisplaySettingsComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelDisplaySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
