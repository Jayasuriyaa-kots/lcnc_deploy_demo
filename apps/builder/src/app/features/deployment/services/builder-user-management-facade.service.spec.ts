import { TestBed } from '@angular/core/testing';
import { BuilderUserManagementFacadeService } from '@builder/features/deployment/facades/builder-user-management.facade';
import { BuilderUserManagementStorageService } from '@builder/features/deployment/services/builder-user-management-storage.service';
import { QoToastService } from '@qo/ui-components';

describe('BuilderUserManagementFacadeService', () => {
  let service: BuilderUserManagementFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BuilderUserManagementFacadeService,
        {
          provide: BuilderUserManagementStorageService,
          useValue: {
            loadRoles: jasmine.createSpy('loadRoles').and.returnValue([]),
            loadRoleUsers: jasmine.createSpy('loadRoleUsers').and.returnValue([]),
            loadPermissions: jasmine.createSpy('loadPermissions').and.returnValue([]),
            saveRoles: jasmine.createSpy('saveRoles'),
            saveRoleUsers: jasmine.createSpy('saveRoleUsers'),
            savePermissions: jasmine.createSpy('savePermissions'),
          },
        },
        {
          provide: QoToastService,
          useValue: jasmine.createSpyObj('QoToastService', ['success', 'error']),
        },
      ],
    });

    service = TestBed.inject(BuilderUserManagementFacadeService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty roles', () => {
    expect(service.rolesForCurrentApplication()).toEqual([]);
  });
});
