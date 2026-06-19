import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormGroup } from '@angular/forms';
import { NewRoleModalComponent } from '@builder/features/deployment/components/new-role-modal.component';

describe('NewRoleModalComponent', () => {
  let component: NewRoleModalComponent;
  let fixture: ComponentFixture<NewRoleModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewRoleModalComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(NewRoleModalComponent);
    fixture.componentRef.setInput('form', new FormGroup({}));
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
