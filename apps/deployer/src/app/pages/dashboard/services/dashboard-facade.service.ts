import { computed, inject, Injectable, signal } from '@angular/core';
import { BuilderContextFacadeService } from '@qo/api-client';
import { QoConfirmDialogService, QoToastService } from '@qo/ui-components';
import { environment } from '../../../../environments/environment';
import { OrganisationsFacadeService } from '../../../core/layout/services/organisations-facade.service';
import { DeployerI18nService } from '../../../services/deployer-i18n.service';
import { ApplicationModel, CreateApplicationPayload, DashboardKpiModel } from '../models';
import { DashboardApplicationsService } from './dashboard-applications.service';

@Injectable({ providedIn: 'root' })
export class DashboardFacadeService {
  private readonly applicationsService = inject(DashboardApplicationsService);
  private readonly confirmDialogService = inject(QoConfirmDialogService);
  private readonly toastService = inject(QoToastService);
  private readonly builderContextFacade = inject(BuilderContextFacadeService);
  private readonly organisationsFacade = inject(OrganisationsFacadeService);
  private readonly i18n = inject(DeployerI18nService);
  readonly applicationTypes = [
    this.i18n.translate('dashboard.applicationTypeInternalTool'),
    this.i18n.translate('dashboard.applicationTypeOperationsControl'),
    this.i18n.translate('dashboard.applicationTypeCustomerPortal')
  ] as const;
  readonly primaryOwners = [
    this.i18n.translate('dashboard.primaryOwnerPriyaSharma'),
    this.i18n.translate('dashboard.primaryOwnerArjunMehta'),
    this.i18n.translate('dashboard.primaryOwnerRinaKapoor')
  ] as const;
  readonly applications = signal<ApplicationModel[]>(this.applicationsService.loadApplications());
  readonly addingApplication = signal(false);
  readonly selectedOrganisation = this.organisationsFacade.selectedOrganisation;
  readonly applicationSearch = signal('');
  readonly statusFilter = signal<'all' | ApplicationModel['status']>('all');
  readonly openActionsApplicationId = signal<string | null>(null);
  readonly applicationTypeOpen = signal(false);
  readonly primaryOwnerOpen = signal(false);
  readonly selectedApplicationType = signal<string>(this.applicationTypes[0]);
  readonly selectedPrimaryOwner = signal<string>(this.primaryOwners[0]);
  readonly selectedOrganisationApplications = computed(() => {
    const selectedOrganisationId = this.organisationsFacade.selectedOrganisationId();

    if (!selectedOrganisationId) {
      return [];
    }

    return this.applications().filter(
      (application) => application.organisationId === selectedOrganisationId
    );
  });
  readonly liveWorkspaceCount = computed(() =>
    this.selectedOrganisationApplications().filter((application) => application.status === 'live').length
  );
  readonly kpis = computed<DashboardKpiModel[]>(() => {
    const applications = this.selectedOrganisationApplications();
    const totalUsers = applications.reduce(
      (sum, application) => sum + this.parseWholeNumber(application.users),
      0
    );
    const totalUsageTb = applications.reduce(
      (sum, application) => sum + this.parseUsageInTb(application.dataUsage),
      0
    );
    const averageLatency = this.averageLatency(applications);
    const successfulApps = applications.filter((application) => application.healthy).length;
    const successRate = applications.length === 0
      ? 0
      : (successfulApps / applications.length) * 100;

    return [
      {
        label: this.i18n.translate('dashboard.totalApplications'),
        value: applications.length.toString(),
        delta: applications.length === 0
          ? this.i18n.translate('dashboard.noApplicationsYet')
          : this.i18n.translate('dashboard.applicationsAddedThisMonth', { count: Math.max(applications.length - 3, 0) }),
        tone: 'positive'
      },
      {
        label: this.i18n.translate('dashboard.activeUsers'),
        value: totalUsers.toString(),
        delta: this.i18n.translate('dashboard.liveEnvironments', { count: applications.filter((application) => application.status === 'live').length }),
        tone: 'positive'
      },
      {
        label: this.i18n.translate('dashboard.dataUsage'),
        value: this.formatUsage(totalUsageTb),
        delta: this.i18n.translate('dashboard.trackedWorkloads', { count: applications.length }),
        tone: totalUsageTb > 5 ? 'warning' : 'neutral'
      },
      {
        label: this.i18n.translate('dashboard.apiCallVolume'),
        value: `${(applications.length * 4.6).toFixed(1)}M`,
        delta: this.i18n.translate('dashboard.successfulRate', { rate: successRate.toFixed(2) }),
        tone: 'neutral'
      },
      {
        label: this.i18n.translate('dashboard.averageLatency'),
        value: `${averageLatency} ms`,
        delta: averageLatency <= 220 ? this.i18n.translate('dashboard.withinTargetRange') : this.i18n.translate('dashboard.needsAttention'),
        tone: averageLatency <= 220 ? 'positive' : 'warning'
      }
    ];
  });
  readonly filteredApplications = computed(() => {
    const searchTerm = this.applicationSearch().trim().toLowerCase();
    const statusFilter = this.statusFilter();

    return this.selectedOrganisationApplications().filter((application) => {
      const matchesSearch =
        !searchTerm ||
        application.name.toLowerCase().includes(searchTerm) ||
        application.description.toLowerCase().includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  });

  cycleStatusFilter(): void {
    const order: Array<'all' | ApplicationModel['status']> = ['all', 'live', 'warning', 'inactive'];
    const currentIndex = order.indexOf(this.statusFilter());
    const nextIndex = (currentIndex + 1) % order.length;

    this.statusFilter.set(order[nextIndex]);
  }

  statusFilterLabel(): string {
    const activeFilter = this.statusFilter();

    if (activeFilter === 'all') {
      return this.i18n.translate('dashboard.allStatus');
    }

    return activeFilter[0].toUpperCase() + activeFilter.slice(1);
  }

  closeAddApplicationModal(): void {
    this.closeAddApplicationDropdowns();
    this.addingApplication.set(false);
  }

  toggleApplicationActionsMenu(applicationId: string): void {
    this.openActionsApplicationId.update((openId) =>
      openId === applicationId ? null : applicationId
    );
  }

  closeApplicationActionsMenu(): void {
    this.openActionsApplicationId.set(null);
  }

  openBuilder(application: ApplicationModel): void {
    const selectedOrganisationId = this.organisationsFacade.selectedOrganisationId();

    if (!selectedOrganisationId) {
      this.toastService.warning(this.i18n.translate('dashboard.selectOrganisationFirst'));
      return;
    }

    if (!application.id) {
      this.toastService.error(this.i18n.translate('dashboard.unableToOpenBuilder'));
      return;
    }

    const builderContext = {
      organisationId: selectedOrganisationId,
      applicationId: application.id,
      applicationName: application.name
    };

    this.builderContextFacade.setContext(builderContext);

    const queryParams = new URLSearchParams({
      applicationId: builderContext.applicationId,
      organisationId: builderContext.organisationId,
      applicationName: builderContext.applicationName
    });

    globalThis.location.assign(`${environment.builderAppUrl}/deployment/desktop?${queryParams.toString()}`);
  }

  addApplication(payload: CreateApplicationPayload): void {
    const selectedOrganisationId = this.organisationsFacade.selectedOrganisationId();

    if (!selectedOrganisationId) {
      return;
    }

    const newApplication = this.applicationsService.createApplication(payload, selectedOrganisationId);

    this.applications.update((applications) => {
      const updatedApplications = [newApplication, ...applications];

      this.applicationsService.saveApplications(updatedApplications);
      return updatedApplications;
    });
    this.selectedApplicationType.set(this.applicationTypes[0]);
    this.selectedPrimaryOwner.set(this.primaryOwners[0]);
    this.closeAddApplicationModal();
  }

  async deleteApplication(applicationId: string): Promise<void> {
    const application = this.applications().find((item) => item.id === applicationId);

    if (!application) {
      return;
    }

    const confirmed = await this.confirmDialogService.confirm(
      this.i18n.translate('dashboard.deleteApplicationTitle'),
      this.i18n.translate('dashboard.deleteApplicationDescription', { name: application.name })
    );

    if (!confirmed) {
      return;
    }

    this.applications.update((applications) => {
      const updatedApplications = applications.filter((item) => item.id !== applicationId);

      this.applicationsService.saveApplications(updatedApplications);
      return updatedApplications;
    });
    this.closeApplicationActionsMenu();
  }

  toggleApplicationTypeDropdown(): void {
    this.primaryOwnerOpen.set(false);
    this.applicationTypeOpen.update((open) => !open);
  }

  togglePrimaryOwnerDropdown(): void {
    this.applicationTypeOpen.set(false);
    this.primaryOwnerOpen.update((open) => !open);
  }

  selectApplicationType(type: string): void {
    this.selectedApplicationType.set(type);
    this.applicationTypeOpen.set(false);
  }

  selectPrimaryOwner(owner: string): void {
    this.selectedPrimaryOwner.set(owner);
    this.primaryOwnerOpen.set(false);
  }

  closeAddApplicationDropdowns(): void {
    this.applicationTypeOpen.set(false);
    this.primaryOwnerOpen.set(false);
  }

  private parseWholeNumber(value: string): number {
    const numericValue = Number.parseInt(value.replace(/[^\d]/g, ''), 10);

    return Number.isNaN(numericValue) ? 0 : numericValue;
  }

  private parseUsageInTb(value: string): number {
    const trimmedValue = value.trim().toUpperCase();
    const numericValue = Number.parseFloat(trimmedValue);

    if (Number.isNaN(numericValue)) {
      return 0;
    }

    if (trimmedValue.endsWith('GB')) {
      return numericValue / 1024;
    }

    return numericValue;
  }

  private formatUsage(totalUsageTb: number): string {
    if (totalUsageTb >= 1) {
      return `${totalUsageTb.toFixed(1)} TB`;
    }

    return `${Math.round(totalUsageTb * 1024)} GB`;
  }

  private averageLatency(applications: ApplicationModel[]): number {
    const latencyValues = applications
      .map((application) => Number.parseInt(application.latency.replace(/[^\d]/g, ''), 10))
      .filter((value) => Number.isFinite(value) && value > 0);

    if (latencyValues.length === 0) {
      return 0;
    }

    const totalLatency = latencyValues.reduce((sum, value) => sum + value, 0);

    return Math.round(totalLatency / latencyValues.length);
  }
}
