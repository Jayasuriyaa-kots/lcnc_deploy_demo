import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchStylePanelComponent } from '@builder/features/page-builder/components/panel-config/search/search-style-panel/search-style-panel.component';

describe('SearchStylePanelComponent', () => {
  let component: SearchStylePanelComponent;
  let fixture: ComponentFixture<SearchStylePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchStylePanelComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchStylePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
