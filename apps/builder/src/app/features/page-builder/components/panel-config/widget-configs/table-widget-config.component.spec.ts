import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createDefaultTableWidgetConfig } from '@builder/features/page-builder/models/page-builder-canvas.model';
import { TableWidgetConfigComponent } from './table-widget-config.component';

describe('TableWidgetConfigComponent', () => {
  let component: TableWidgetConfigComponent;
  let fixture: ComponentFixture<TableWidgetConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableWidgetConfigComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TableWidgetConfigComponent);
    fixture.componentRef.setInput('config', createDefaultTableWidgetConfig());
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
