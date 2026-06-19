import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createDefaultPanelDisplaySettingsState } from '@builder/features/page-builder/models/page-builder-panel-state.factory';
import { BoardWidgetConfigComponent } from './board-widget-config.component';

describe('BoardWidgetConfigComponent', () => {
  let component: BoardWidgetConfigComponent;
  let fixture: ComponentFixture<BoardWidgetConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardWidgetConfigComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardWidgetConfigComponent);
    fixture.componentRef.setInput('displaySettingsState', createDefaultPanelDisplaySettingsState());
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
