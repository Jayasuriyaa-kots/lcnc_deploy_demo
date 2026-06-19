import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PanelConfigFacade } from '@builder/features/page-builder/facades/panel-config/panel-config.facade';
import { createDefaultButtonActionConfig, createDefaultButtonStyleConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { ButtonWidgetConfigComponent } from './button-widget-config.component';

describe('ButtonWidgetConfigComponent', () => {
  let component: ButtonWidgetConfigComponent;
  let fixture: ComponentFixture<ButtonWidgetConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonWidgetConfigComponent, NoopAnimationsModule],
      providers: [PanelConfigFacade],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonWidgetConfigComponent);
    fixture.componentRef.setInput('panelFacade', TestBed.inject(PanelConfigFacade));
    fixture.componentRef.setInput('buttonStyleConfig', createDefaultButtonStyleConfig());
    fixture.componentRef.setInput('buttonActionConfig', createDefaultButtonActionConfig());
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
