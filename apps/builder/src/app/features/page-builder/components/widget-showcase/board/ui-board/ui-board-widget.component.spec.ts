import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiBoardWidgetComponent } from '@builder/features/page-builder/components/widget-showcase/board/ui-board/ui-board-widget.component';

describe('UiBoardWidgetComponent', () => {
  let component: UiBoardWidgetComponent;
  let fixture: ComponentFixture<UiBoardWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiBoardWidgetComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UiBoardWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
