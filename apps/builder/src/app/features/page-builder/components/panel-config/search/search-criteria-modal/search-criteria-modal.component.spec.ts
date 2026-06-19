import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchCriteriaModalComponent } from '@builder/features/page-builder/components/panel-config/search/search-criteria-modal/search-criteria-modal.component';

describe('SearchCriteriaModalComponent', () => {
  let component: SearchCriteriaModalComponent;
  let fixture: ComponentFixture<SearchCriteriaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchCriteriaModalComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchCriteriaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
