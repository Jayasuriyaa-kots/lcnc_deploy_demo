import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextBlockShowcaseComponent } from '@builder/features/page-builder/components/widget-showcase/text-block/text-block-showcase.component';

describe('TextBlockShowcaseComponent', () => {
  let component: TextBlockShowcaseComponent;
  let fixture: ComponentFixture<TextBlockShowcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextBlockShowcaseComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TextBlockShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
