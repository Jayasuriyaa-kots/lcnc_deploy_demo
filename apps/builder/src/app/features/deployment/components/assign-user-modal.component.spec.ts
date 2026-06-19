import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormGroup } from '@angular/forms';
import { AssignUserModalComponent } from '@builder/features/deployment/components/assign-user-modal.component';

describe('AssignUserModalComponent', () => {
  let component: AssignUserModalComponent;
  let fixture: ComponentFixture<AssignUserModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignUserModalComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignUserModalComponent);
    fixture.componentRef.setInput('form', new FormGroup({}));
    fixture.componentRef.setInput('users', []);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
