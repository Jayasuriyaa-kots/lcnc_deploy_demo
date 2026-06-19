import { computed, Injectable, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { createOrganisations } from '../../../mock-data/organisations.mock';
import {
  AddOrganisationFormControls,
  AddOrganisationFormGroup,
  AddOrganisationFormValue,
  Organisation
} from '../models/organisation.model';
import { DeployerI18nService } from '../../../services/deployer-i18n.service';
import { OrganisationStorageService } from './organisation-storage.service';

@Injectable({ providedIn: 'root' })
export class OrganisationsFacadeService {
  private readonly storageService = inject(OrganisationStorageService);
  private readonly i18n = inject(DeployerI18nService);
  private readonly defaultFormValue: AddOrganisationFormValue = {
    organisationName: '',
    entityType: this.i18n.translate('organisations.entityTypeItServices'),
    primaryOwnerEmail: '',
    billingEmail: '',
    additionalAdminUsers: ''
  };

  readonly organisationEntityTypes = [
    this.i18n.translate('organisations.entityTypeItServices'),
    this.i18n.translate('organisations.entityTypeEnterpriseCustomer'),
    this.i18n.translate('organisations.entityTypeOperations')
  ] as const;
  readonly organisations = signal<Organisation[]>([]);
  readonly selectedOrganisationId = signal<string | null>(null);
  readonly selectedOrganisation = computed(
    () =>
      this.organisations().find(
        (organisation) => organisation.id === this.selectedOrganisationId()
      ) ?? null
  );
  readonly isAddModalOpen = signal(false);
  readonly organisationForm: AddOrganisationFormGroup = new FormGroup<AddOrganisationFormControls>({
    organisationName: new FormControl(this.defaultFormValue.organisationName, {
      nonNullable: true,
      validators: [Validators.required]
    }),
    entityType: new FormControl(this.defaultFormValue.entityType, {
      nonNullable: true,
      validators: [Validators.required]
    }),
    primaryOwnerEmail: new FormControl(this.defaultFormValue.primaryOwnerEmail, {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    billingEmail: new FormControl(this.defaultFormValue.billingEmail, {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    additionalAdminUsers: new FormControl(this.defaultFormValue.additionalAdminUsers, {
      nonNullable: true
    })
  });

  constructor() {
    this.loadOrganisations();
  }

  loadOrganisations(): void {
    const storedOrganisations = this.storageService.getOrganisations();
    const defaultOrganisations = createOrganisations(this.i18n);
    const nextOrganisations = storedOrganisations.length > 0 ? storedOrganisations : defaultOrganisations;

    if (storedOrganisations.length === 0) {
      this.storageService.saveOrganisations(nextOrganisations);
    }

    this.organisations.set(nextOrganisations);
    this.restoreSelectedOrganisation();
  }

  openAddOrganisationModal(): void {
    this.organisationForm.reset(this.defaultFormValue);
    this.isAddModalOpen.set(true);
  }

  closeAddOrganisationModal(): void {
    this.isAddModalOpen.set(false);
    this.organisationForm.reset(this.defaultFormValue);
  }

  selectOrganisation(organisationId: string): void {
    if (!this.organisations().some((organisation) => organisation.id === organisationId)) {
      return;
    }

    this.selectedOrganisationId.set(organisationId);
    this.storageService.saveSelectedOrganisationId(organisationId);
  }

  restoreSelectedOrganisation(): void {
    const storedSelectedId = this.storageService.getSelectedOrganisationId();
    const hasStoredSelection = storedSelectedId
      ? this.organisations().some((organisation) => organisation.id === storedSelectedId)
      : false;
    const fallbackOrganisationId = this.organisations()[0]?.id ?? null;
    const nextSelection = hasStoredSelection ? storedSelectedId : fallbackOrganisationId;

    this.selectedOrganisationId.set(nextSelection);

    if (nextSelection) {
      this.storageService.saveSelectedOrganisationId(nextSelection);
    }
  }

  submitOrganisationForm(): void {
    if (this.organisationForm.invalid) {
      this.organisationForm.markAllAsTouched();
      return;
    }

    this.addOrganisation(this.organisationForm.getRawValue());
  }

  addOrganisation(data: AddOrganisationFormValue): void {
    const organisation: Organisation = {
      id: crypto.randomUUID(),
      name: data.organisationName.trim(),
      entityType: data.entityType.trim(),
      primaryOwnerEmail: data.primaryOwnerEmail.trim().toLowerCase(),
      billingEmail: data.billingEmail.trim().toLowerCase(),
      additionalAdminUsers: this.parseAdditionalAdminUsers(data.additionalAdminUsers),
      status: 'active',
      createdAt: new Date().toISOString()
    };

    let updatedOrganisations: Organisation[] = [];

    this.organisations.update((currentOrganisations) => {
      updatedOrganisations = [...currentOrganisations, organisation];
      return updatedOrganisations;
    });

    this.storageService.saveOrganisations(updatedOrganisations);
    this.selectOrganisation(organisation.id);
    this.closeAddOrganisationModal();
  }

  removeOrganisation(organisationId: string): void {
    let updatedOrganisations: Organisation[] = [];

    this.organisations.update((currentOrganisations) => {
      updatedOrganisations = currentOrganisations.filter((organisation) => organisation.id !== organisationId);
      return updatedOrganisations;
    });

    this.storageService.saveOrganisations(updatedOrganisations);
    this.restoreSelectedOrganisation();
  }

  private parseAdditionalAdminUsers(rawValue: string): string[] | undefined {
    const additionalAdmins = rawValue
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);

    return additionalAdmins.length > 0 ? additionalAdmins : undefined;
  }
}
