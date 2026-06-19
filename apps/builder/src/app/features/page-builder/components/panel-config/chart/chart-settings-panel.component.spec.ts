import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartSettingsPanelComponent } from '@builder/features/page-builder/components/panel-config/chart/chart-settings-panel.component';

describe('ChartSettingsPanelComponent', () => {
  let component: ChartSettingsPanelComponent;
  let fixture: ComponentFixture<ChartSettingsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartSettingsPanelComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartSettingsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
