import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonStylePanelComponent } from '@builder/features/page-builder/components/panel-config/button/button-style-panel/button-style-panel.component';

describe('ButtonStylePanelComponent', () => {
  let component: ButtonStylePanelComponent;
  let fixture: ComponentFixture<ButtonStylePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonStylePanelComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonStylePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
