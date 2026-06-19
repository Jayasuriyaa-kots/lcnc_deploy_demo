import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SnippetShowcaseComponent } from '@builder/features/page-builder/components/widget-showcase/snippet/snippet-showcase.component';

describe('SnippetShowcaseComponent', () => {
  let component: SnippetShowcaseComponent;
  let fixture: ComponentFixture<SnippetShowcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnippetShowcaseComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SnippetShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
