import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectShowcaseComponent } from '@builder/features/page-builder/components/widget-showcase/select/select-showcase.component';

describe('SelectShowcaseComponent', () => {
  let component: SelectShowcaseComponent;
  let fixture: ComponentFixture<SelectShowcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectShowcaseComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
