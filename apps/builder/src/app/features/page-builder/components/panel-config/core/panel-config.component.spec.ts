import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanelConfigComponent } from '@builder/features/page-builder/components/panel-config/core/panel-config.component';

describe('PanelConfigComponent', () => {
  let component: PanelConfigComponent;
  let fixture: ComponentFixture<PanelConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelConfigComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
