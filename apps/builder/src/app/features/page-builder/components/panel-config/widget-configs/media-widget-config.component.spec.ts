import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createDefaultMediaWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { MediaWidgetConfigComponent } from './media-widget-config.component';

describe('MediaWidgetConfigComponent', () => {
  let component: MediaWidgetConfigComponent;
  let fixture: ComponentFixture<MediaWidgetConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaWidgetConfigComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaWidgetConfigComponent);
    fixture.componentRef.setInput('config', createDefaultMediaWidgetConfig());
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
