import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableShowcaseComponent } from '@builder/features/page-builder/components/widget-showcase/table/table-showcase.component';

describe('TableShowcaseComponent', () => {
  let component: TableShowcaseComponent;
  let fixture: ComponentFixture<TableShowcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableShowcaseComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TableShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
