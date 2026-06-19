import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableSettingsPanelComponent } from '@builder/features/page-builder/components/panel-config/table/table-settings-panel.component';

describe('TableSettingsPanelComponent', () => {
  let component: TableSettingsPanelComponent;
  let fixture: ComponentFixture<TableSettingsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableSettingsPanelComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TableSettingsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
