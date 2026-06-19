import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextBlockSettingsPanelComponent } from '@builder/features/page-builder/components/panel-config/text-block/text-block-settings-panel.component';

describe('TextBlockSettingsPanelComponent', () => {
  let component: TextBlockSettingsPanelComponent;
  let fixture: ComponentFixture<TextBlockSettingsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextBlockSettingsPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextBlockSettingsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
