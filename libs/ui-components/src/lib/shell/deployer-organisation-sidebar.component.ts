import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { QoAvatarBadgeComponent } from '../primitives/avatar-badge/avatar-badge.component';
import { QoButtonComponent } from '../primitives/button/button.component';
import { QoSearchBarComponent } from '../data-display/search-bar/search-bar.component';
import { QoIconComponent } from '../primitives/icon/icon.component';

export interface DeployerOrganisationSidebarItem {
  id: string;
  name: string;
}

@Component({
  selector: 'qo-deployer-organisation-sidebar',
  standalone: true,
  imports: [QoSearchBarComponent, QoAvatarBadgeComponent, QoButtonComponent, QoIconComponent],
  templateUrl: './deployer-organisation-sidebar.component.html',
  styleUrl: './deployer-organisation-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QoDeployerOrganisationSidebarComponent {
  readonly organisations = input.required<readonly DeployerOrganisationSidebarItem[]>();
  readonly activeId = input.required<string>();
  readonly search = input('');
  readonly searchChange = output<string>();
  readonly organisationSelect = output<string>();
  readonly addOrganisation = output<void>();
}
