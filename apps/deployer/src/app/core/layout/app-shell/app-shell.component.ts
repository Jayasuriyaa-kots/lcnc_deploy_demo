import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  QoBreadcrumbComponent,
  QoDeployerOrganisationSidebarComponent,
  QoDeployerTopbarComponent
} from '@qo/ui-components';
import { NotificationsPanelHostComponent } from '../../../pages/notifications/containers/notifications-panel-host/notifications-panel-host.component';
import { AddOrganisationModalComponent } from '../components/add-organisation-modal/add-organisation-modal.component';
import { AppShellFacadeService } from '../services/app-shell-facade.service';
import { DeployerTheme } from '../../theme/models/deployer-theme.model';
import { DeployerThemeFacadeService } from '../../theme/services/deployer-theme-facade.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    QoDeployerTopbarComponent,
    QoDeployerOrganisationSidebarComponent,
    QoBreadcrumbComponent,
    NotificationsPanelHostComponent,
    AddOrganisationModalComponent
  ],
  
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShellComponent {
  private readonly facade = inject(AppShellFacadeService);
  private readonly themeFacade = inject(DeployerThemeFacadeService);

  readonly organisationSearch = this.facade.organisationSearch;
  readonly activeOrganisationId = this.facade.activeOrganisationId;
  readonly notificationsOpen = this.facade.notificationsOpen;
  readonly addingOrganisation = this.facade.addingOrganisation;
  readonly organisationForm = this.facade.organisationForm;
  readonly profileMenuOpen = this.facade.profileMenuOpen;
  readonly organisationEntityTypes = this.facade.organisationEntityTypes;
  readonly filteredOrganisations = this.facade.filteredOrganisations;
  readonly unreadCount = this.facade.unreadCount;
  readonly topTabs = this.facade.topTabs;
  readonly breadcrumbItems = this.facade.breadcrumbItems;
  readonly theme = this.themeFacade.theme;

  selectOrganisation(organisationId: string): void {
    this.facade.selectOrganisation(organisationId);
  }

  openAddOrganisationModal(): void {
    this.facade.openAddOrganisationModal();
  }

  closeAddOrganisationModal(): void {
    this.facade.closeAddOrganisationModal();
  }

  submitOrganisationForm(): void {
    this.facade.submitOrganisationForm();
  }

  toggleProfileMenu(): void {
    this.facade.toggleProfileMenu();
  }

  closeProfileMenu(): void {
    this.facade.closeProfileMenu();
  }

  setTheme(theme: DeployerTheme): void {
    this.themeFacade.setTheme(theme);
  }
}
