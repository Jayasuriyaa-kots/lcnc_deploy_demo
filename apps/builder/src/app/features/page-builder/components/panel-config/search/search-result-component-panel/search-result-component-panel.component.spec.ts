import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchResultComponentPanelComponent } from '@builder/features/page-builder/components/panel-config/search/search-result-component-panel/search-result-component-panel.component';

describe('SearchResultComponentPanelComponent', () => {
  let component: SearchResultComponentPanelComponent;
  let fixture: ComponentFixture<SearchResultComponentPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchResultComponentPanelComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultComponentPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
