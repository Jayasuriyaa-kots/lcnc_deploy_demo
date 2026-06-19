import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiSearchComponent } from '@builder/features/page-builder/components/widget-showcase/search/ui-search/ui-search.component';

describe('UiSearchComponent', () => {
  let component: UiSearchComponent;
  let fixture: ComponentFixture<UiSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiSearchComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UiSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
