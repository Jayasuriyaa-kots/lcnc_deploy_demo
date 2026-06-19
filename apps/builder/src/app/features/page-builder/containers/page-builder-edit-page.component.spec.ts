import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageBuilderEditPageComponent } from '@builder/features/page-builder/containers/page-builder-edit-page.component';

describe('PageBuilderEditPageComponent', () => {
  let component: PageBuilderEditPageComponent;
  let fixture: ComponentFixture<PageBuilderEditPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageBuilderEditPageComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PageBuilderEditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
