import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PanelConfigFacade } from '@builder/features/page-builder/facades/panel-config/panel-config.facade';
import { createDefaultPanelConfigState } from '@builder/features/page-builder/models/page-builder-panel-state.factory';
import { ReportWidgetConfigComponent } from './report-widget-config.component';

describe('ReportWidgetConfigComponent', () => {
  let component: ReportWidgetConfigComponent;
  let fixture: ComponentFixture<ReportWidgetConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportWidgetConfigComponent, NoopAnimationsModule],
      providers: [PanelConfigFacade],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportWidgetConfigComponent);
    fixture.componentRef.setInput('panelFacade', TestBed.inject(PanelConfigFacade));
    fixture.componentRef.setInput('panelState', createDefaultPanelConfigState());
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
