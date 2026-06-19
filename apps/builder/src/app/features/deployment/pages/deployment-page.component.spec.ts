import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DeploymentPageComponent } from '@builder/features/deployment/pages/deployment-page.component';

describe('DeploymentPageComponent (pages)', () => {
  let component: DeploymentPageComponent;
  let fixture: ComponentFixture<DeploymentPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeploymentPageComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(DeploymentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
