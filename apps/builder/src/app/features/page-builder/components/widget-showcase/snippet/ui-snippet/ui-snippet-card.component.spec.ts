import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiSnippetCardComponent } from '@builder/features/page-builder/components/widget-showcase/snippet/ui-snippet/ui-snippet-card.component';

describe('UiSnippetCardComponent', () => {
  let component: UiSnippetCardComponent;
  let fixture: ComponentFixture<UiSnippetCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiSnippetCardComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UiSnippetCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
