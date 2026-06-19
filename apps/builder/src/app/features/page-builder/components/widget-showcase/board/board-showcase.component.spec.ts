import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoardShowcaseComponent } from '@builder/features/page-builder/components/widget-showcase/board/board-showcase.component';

describe('BoardShowcaseComponent', () => {
  let component: BoardShowcaseComponent;
  let fixture: ComponentFixture<BoardShowcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardShowcaseComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
