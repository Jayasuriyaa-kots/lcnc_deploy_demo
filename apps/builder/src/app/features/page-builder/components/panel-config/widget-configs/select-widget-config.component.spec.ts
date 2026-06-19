import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createDefaultSelectWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { SelectWidgetConfigComponent } from './select-widget-config.component';

describe('SelectWidgetConfigComponent', () => {
  let component: SelectWidgetConfigComponent;
  let fixture: ComponentFixture<SelectWidgetConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectWidgetConfigComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectWidgetConfigComponent);
    fixture.componentRef.setInput('config', createDefaultSelectWidgetConfig());
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
