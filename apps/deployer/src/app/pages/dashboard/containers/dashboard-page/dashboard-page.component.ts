import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  QoButtonComponent,
  QoIconComponent,
  QoPageSectionComponent,
  QoSearchBarComponent
} from '@qo/ui-components';
import { AddApplicationModalComponent } from '../../components/add-application-modal/add-application-modal.component';
import { ApplicationListComponent } from '../../components/application-list/application-list.component';
import { ApplicationModel, CreateApplicationPayload } from '../../models';
import { SummaryMetricsRowComponent } from '../../components/summary-metrics-row/summary-metrics-row.component';
import { DashboardFacadeService } from '../../services/dashboard-facade.service';
import { DeployerI18nService } from '../../../../services/deployer-i18n.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    AddApplicationModalComponent,
    ApplicationListComponent,
    ReactiveFormsModule,
    QoPageSectionComponent,
    QoButtonComponent,
    QoIconComponent,
    QoSearchBarComponent,
    SummaryMetricsRowComponent
  ],
  
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly facade = inject(DashboardFacadeService);
  readonly i18n = inject(DeployerI18nService);

  readonly kpis = this.facade.kpis;
  readonly applications = this.facade.applications;
  readonly addingApplication = this.facade.addingApplication;
  readonly applicationTypes = this.facade.applicationTypes;
  readonly primaryOwners = this.facade.primaryOwners;
  readonly applicationTypeOpen = this.facade.applicationTypeOpen;
  readonly primaryOwnerOpen = this.facade.primaryOwnerOpen;
  readonly selectedApplicationType = this.facade.selectedApplicationType;
  readonly selectedPrimaryOwner = this.facade.selectedPrimaryOwner;
  readonly selectedOrganisation = this.facade.selectedOrganisation;
  readonly liveWorkspaceCount = this.facade.liveWorkspaceCount;
  readonly applicationSearch = this.facade.applicationSearch;
  readonly statusFilter = this.facade.statusFilter;
  readonly selectedOrganisationApplications = this.facade.selectedOrganisationApplications;
  readonly filteredApplications = this.facade.filteredApplications;
  readonly openActionsApplicationId = this.facade.openActionsApplicationId;
  readonly applicationForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    superAdminEmails: [''],
    adminEmails: ['']
  });

  cycleStatusFilter(): void {
    this.facade.cycleStatusFilter();
  }

  statusFilterLabel(): string {
    return this.facade.statusFilterLabel();
  }

  closeAddApplicationModal(): void {
    this.applicationForm.reset({
      name: '',
      description: '',
      superAdminEmails: '',
      adminEmails: ''
    });
    this.facade.closeAddApplicationModal();
  }

  addApplication(payload: CreateApplicationPayload): void {
    this.facade.addApplication(payload);
    this.applicationForm.reset({
      name: '',
      description: '',
      superAdminEmails: '',
      adminEmails: ''
    });
  }

  deleteApplication(applicationId: string): Promise<void> {
    return this.facade.deleteApplication(applicationId);
  }

  toggleApplicationActionsMenu(applicationId: string): void {
    this.facade.toggleApplicationActionsMenu(applicationId);
  }

  closeApplicationActionsMenu(): void {
    this.facade.closeApplicationActionsMenu();
  }

  openBuilder(application: ApplicationModel): void {
    this.facade.openBuilder(application);
  }

  toggleApplicationTypeDropdown(): void {
    this.facade.toggleApplicationTypeDropdown();
  }

  togglePrimaryOwnerDropdown(): void {
    this.facade.togglePrimaryOwnerDropdown();
  }

  selectApplicationType(type: string): void {
    this.facade.selectApplicationType(type);
  }

  selectPrimaryOwner(owner: string): void {
    this.facade.selectPrimaryOwner(owner);
  }

  closeAddApplicationDropdowns(): void {
    this.facade.closeAddApplicationDropdowns();
  }
}
