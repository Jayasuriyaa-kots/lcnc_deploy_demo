import { Injectable } from '@angular/core';
import { Organisation } from '../models/organisation.model';

@Injectable({ providedIn: 'root' })
export class OrganisationStorageService {
  private readonly storageKey = 'qo_organisations';
  private readonly selectedOrganisationKey = 'qo_selected_organisation_id';

  getOrganisations(): Organisation[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    const rawValue = localStorage.getItem(this.storageKey);

    if (!rawValue) {
      return [];
    }

    try {
      const parsedValue: unknown = JSON.parse(rawValue);

      if (!Array.isArray(parsedValue)) {
        return [];
      }

      return parsedValue.filter(this.isOrganisation);
    } catch {
      return [];
    }
  }

  saveOrganisations(organisations: Organisation[]): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(organisations));
  }

  getSelectedOrganisationId(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage.getItem(this.selectedOrganisationKey);
  }

  saveSelectedOrganisationId(organisationId: string): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.selectedOrganisationKey, organisationId);
  }

  private readonly isOrganisation = (value: unknown): value is Organisation => {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const organisation = value as Record<string, unknown>;

    return (
      typeof organisation['id'] === 'string' &&
      typeof organisation['name'] === 'string' &&
      typeof organisation['entityType'] === 'string' &&
      typeof organisation['primaryOwnerEmail'] === 'string' &&
      typeof organisation['billingEmail'] === 'string' &&
      (organisation['additionalAdminUsers'] === undefined ||
        (Array.isArray(organisation['additionalAdminUsers']) &&
          organisation['additionalAdminUsers'].every((entry) => typeof entry === 'string'))) &&
      (organisation['status'] === 'active' || organisation['status'] === 'inactive') &&
      typeof organisation['createdAt'] === 'string'
    );
  };
}
