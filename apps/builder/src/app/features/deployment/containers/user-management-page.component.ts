import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { QoButtonComponent, QoIconComponent } from '@qo/ui-components';
import { DeploymentFacadeService } from '../facades/deployment.facade';

@Component({
  selector: 'app-user-management-page',
  standalone: true,
  imports: [QoButtonComponent, QoIconComponent],
  templateUrl: './user-management-page.component.html',
  styleUrl: './user-management-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementPageComponent {
  private readonly facade = inject(DeploymentFacadeService);

  readonly roles = this.facade.roles;
  readonly users = this.facade.users;
  readonly permissionGroups = this.facade.permissionGroups;
  readonly fieldPermissions = this.facade.fieldPermissions;
}
