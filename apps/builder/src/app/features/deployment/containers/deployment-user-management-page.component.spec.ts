import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { DeploymentUserManagementPageComponent } from '@builder/features/deployment/containers/deployment-user-management-page.component';
import { BuilderUserManagementFacadeService } from '@builder/features/deployment/facades/builder-user-management.facade';
import { BuilderContextFacadeService } from '@qo/api-client';

describe('DeploymentUserManagementPageComponent', () => {
  let component: DeploymentUserManagementPageComponent;
  let fixture: ComponentFixture<DeploymentUserManagementPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeploymentUserManagementPageComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: BuilderContextFacadeService,
          useValue: {
            context: signal(null),
            applicationId: signal(null),
            organisationId: signal(null),
          },
        },
        {
          provide: BuilderUserManagementFacadeService,
          useValue: {
            rolesForCurrentApplication: signal([]),
            selectedRole: signal(null),
            usersForSelectedRole: signal([]),
            availableUsersForSelectedRole: signal([]),
            permissionSections: signal([]),
            assignUserModalOpen: signal(false),
            newRoleModalOpen: signal(false),
            load: jasmine.createSpy('load'),
            selectRole: jasmine.createSpy('selectRole'),
            roleCount: jasmine.createSpy('roleCount').and.returnValue(0),
            openAssignUserModal: jasmine.createSpy('openAssignUserModal'),
            closeAssignUserModal: jasmine.createSpy('closeAssignUserModal'),
            assignUsersToSelectedRole: jasmine.createSpy('assignUsersToSelectedRole'),
            openNewRoleModal: jasmine.createSpy('openNewRoleModal'),
            closeNewRoleModal: jasmine.createSpy('closeNewRoleModal'),
            createRole: jasmine.createSpy('createRole'),
            removeUserFromSelectedRole: jasmine.createSpy('removeUserFromSelectedRole'),
            togglePermission: jasmine.createSpy('togglePermission'),
            fieldPermissionNote: jasmine.createSpy('fieldPermissionNote').and.returnValue(''),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeploymentUserManagementPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
