import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiChartPickerComponent } from '@builder/features/page-builder/components/widget-showcase/chart/ui-chart/ui-chart-picker.component';

describe('UiChartPickerComponent', () => {
  let component: UiChartPickerComponent;
  let fixture: ComponentFixture<UiChartPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiChartPickerComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UiChartPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
