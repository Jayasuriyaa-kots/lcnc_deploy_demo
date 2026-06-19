import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiTextBlockComponent } from '@builder/features/page-builder/components/widget-showcase/text-block/ui-text-block/ui-text-block.component';

describe('UiTextBlockComponent', () => {
  let component: UiTextBlockComponent;
  let fixture: ComponentFixture<UiTextBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiTextBlockComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UiTextBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
