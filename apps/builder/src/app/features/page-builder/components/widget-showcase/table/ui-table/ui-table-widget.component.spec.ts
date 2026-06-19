import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiTableWidgetComponent } from '@builder/features/page-builder/components/widget-showcase/table/ui-table/ui-table-widget.component';

describe('UiTableWidgetComponent', () => {
  let component: UiTableWidgetComponent;
  let fixture: ComponentFixture<UiTableWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiTableWidgetComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UiTableWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
