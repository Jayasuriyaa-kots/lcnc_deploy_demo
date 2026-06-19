import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createDefaultTextBlockWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { TextWidgetConfigComponent } from './text-widget-config.component';

describe('TextWidgetConfigComponent', () => {
  let component: TextWidgetConfigComponent;
  let fixture: ComponentFixture<TextWidgetConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextWidgetConfigComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TextWidgetConfigComponent);
    fixture.componentRef.setInput('config', createDefaultTextBlockWidgetConfig());
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
