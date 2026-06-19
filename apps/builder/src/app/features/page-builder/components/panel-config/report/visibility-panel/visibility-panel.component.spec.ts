import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisibilityPanelComponent } from '@builder/features/page-builder/components/panel-config/report/visibility-panel/visibility-panel.component';

describe('VisibilityPanelComponent', () => {
  let component: VisibilityPanelComponent;
  let fixture: ComponentFixture<VisibilityPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisibilityPanelComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(VisibilityPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
