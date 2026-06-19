import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { UserManagementPageComponent } from '@builder/features/deployment/containers/user-management-page.component';
import { DeploymentFacadeService } from '@builder/features/deployment/facades/deployment.facade';

describe('UserManagementPageComponent', () => {
  let component: UserManagementPageComponent;
  let fixture: ComponentFixture<UserManagementPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserManagementPageComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: DeploymentFacadeService,
          useValue: {
            roles: signal([]),
            users: signal([]),
            permissionGroups: signal([]),
            fieldPermissions: signal([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
