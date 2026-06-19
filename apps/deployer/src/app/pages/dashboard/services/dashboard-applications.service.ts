import { Injectable, inject } from '@angular/core';
import { createApplications } from '../../../mock-data/dashboard.mock';
import { DeployerI18nService } from '../../../services/deployer-i18n.service';
import { ApplicationModel, CreateApplicationPayload } from '../models';

@Injectable({ providedIn: 'root' })
export class DashboardApplicationsService {
  private readonly i18n = inject(DeployerI18nService);
  private readonly storageKey = 'qo.deployer.dashboard.applications.v1';

  loadApplications(): ApplicationModel[] {
    const defaultApplications = this.defaultApplications();

    if (!this.isStorageAvailable()) {
      return defaultApplications;
    }

    const storedValue = window.localStorage.getItem(this.storageKey);

    if (!storedValue) {
      this.saveApplications(defaultApplications);
      return defaultApplications;
    }

    try {
      const parsedValue = JSON.parse(storedValue);

      if (!Array.isArray(parsedValue)) {
        this.saveApplications(defaultApplications);
        return defaultApplications;
      }

      return parsedValue as ApplicationModel[];
    } catch {
      this.saveApplications(defaultApplications);
      return defaultApplications;
    }
  }

  saveApplications(applications: ApplicationModel[]): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(applications));
  }

  createApplication(payload: CreateApplicationPayload, organisationId: string): ApplicationModel {
    return {
      id: this.createId(),
      organisationId,
      name: payload.name.trim(),
      type: payload.type,
      primaryOwner: payload.primaryOwner,
      description: payload.description.trim(),
      superAdminEmails: payload.superAdminEmails,
      adminEmails: payload.adminEmails,
      iconLabel: this.createIconLabel(payload.name),
      environment: this.i18n.translate('mockData.environmentBuilder'),
      status: 'inactive',
      latency: '0 ms',
      lastActivity: this.i18n.translate('dashboard.justNow'),
      users: '0',
      dataUsage: '0.0 TB',
      version: 'v1.0.0',
      healthy: false,
      createdAt: new Date().toISOString()
    };
  }

  private createId(): string {
    return `app-${Date.now()}`;
  }

  private defaultApplications(): ApplicationModel[] {
    return createApplications(this.i18n);
  }

  private createIconLabel(name: string): string {
    const letters = name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment[0]?.toUpperCase() ?? '')
      .join('');

    return letters || 'AP';
  }

  private isStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }
}
