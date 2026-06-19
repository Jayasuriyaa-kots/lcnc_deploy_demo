import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartThumbnailComponent } from '@builder/features/page-builder/components/widget-showcase/chart/chart-thumbnail.component';

describe('ChartThumbnailComponent', () => {
  let component: ChartThumbnailComponent;
  let fixture: ComponentFixture<ChartThumbnailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartThumbnailComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartThumbnailComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('type', 'line');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
