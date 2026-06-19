import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiSelectWidgetComponent } from '@builder/features/page-builder/components/widget-showcase/select/ui-select/ui-select-widget.component';

describe('UiSelectWidgetComponent', () => {
  let component: UiSelectWidgetComponent;
  let fixture: ComponentFixture<UiSelectWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiSelectWidgetComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UiSelectWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
