import { Injectable, inject } from '@angular/core';
import { SettingsFacadeService } from '../../services/settings-facade.service';

@Injectable({ providedIn: 'root' })
export class OrganisationSettingsFacadeService {
  private readonly facade = inject(SettingsFacadeService);

  readonly organisation = this.facade.organisation;
  readonly adminUsers = this.facade.adminUsers;
  readonly organisationSummary = this.facade.organisationSummary;
  readonly addAdminOpen = this.facade.addAdminOpen;
  readonly organisationTypeOpen = this.facade.organisationTypeOpen;
  readonly organisationStatusOpen = this.facade.organisationStatusOpen;
  readonly selectedOrganisationType = this.facade.selectedOrganisationType;
  readonly selectedOrganisationStatus = this.facade.selectedOrganisationStatus;

  openAddAdminModal(): void {
    this.facade.openAddAdminModal();
  }

  closeAddAdminModal(): void {
    this.facade.closeAddAdminModal();
  }

  toggleOrganisationType(): void {
    this.facade.toggleOrganisationType();
  }

  toggleOrganisationStatus(): void {
    this.facade.toggleOrganisationStatus();
  }

  selectOrganisationType(type: string): void {
    this.facade.selectOrganisationType(type);
  }

  selectOrganisationStatus(status: string): void {
    this.facade.selectOrganisationStatus(status);
  }

  closeOrganisationDropdowns(): void {
    this.facade.closeOrganisationDropdowns();
  }

  deleteSelectedOrganisation(): Promise<void> {
    return this.facade.deleteSelectedOrganisation();
  }
}
