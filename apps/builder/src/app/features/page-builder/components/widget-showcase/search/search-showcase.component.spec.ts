import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchShowcaseComponent } from '@builder/features/page-builder/components/widget-showcase/search/search-showcase.component';

describe('SearchShowcaseComponent', () => {
  let component: SearchShowcaseComponent;
  let fixture: ComponentFixture<SearchShowcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchShowcaseComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
