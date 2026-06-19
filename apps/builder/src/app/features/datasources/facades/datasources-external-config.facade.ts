import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fromEvent, map, startWith } from 'rxjs';
import {
  QueryReferenceRecord,
  QueryRegistryService,
} from '@builder/core/services/query-registry.service';
import {
  DatasourceAuthMode,
  DatasourceConfigFormValue,
  DatasourceConfigRuntimeTab,
  DatasourceConnectorId,
  DatasourceConnectorOption,
  DatasourceEditorTab,
  DatasourceFieldMapping,
  DatasourceFieldType,
  DatasourceHostEntry,
  DatasourceKeyValueEntry,
  DatasourceQueryRecord,
  DatasourceQueryResultTab,
  DatasourceSection,
  DatasourceSourceRecord,
  DatasourceWorkspace,
  DatasourceResultRow,
} from '@builder/features/datasources/models/datasource-dashboard.model';
import {
  ExternalApiConfigurationValue,
  ExternalApiFieldSchema,
  ExternalApiMappingValue,
  ExternalApiSchema,
} from '@builder/features/datasources/models/external-api-schemas';

import {
  DatasourceEditorForm,
  DatasourceSaveQueryForm,
  ExternalApiDynamicForm,
  ExternalApiMappingGroup,
  HostGroup,
  KeyValueGroup,
  SchemaFieldGroup,
} from '@builder/features/datasources/models/datasource-form-groups.types';

import { DatasourcesWorkspacePreviewFacadeSlice } from '@builder/features/datasources/facades/datasources-workspace-preview.facade';
import { ExternalApiConfigurationService } from '@builder/features/datasources/services/external-api-configuration.service';

export abstract class DatasourcesExternalConfigFacadeSlice extends DatasourcesWorkspacePreviewFacadeSlice {
  private readonly externalApiConfiguration = inject(ExternalApiConfigurationService);

  protected abstract resetRepeatableRows(snapshot?: Partial<DatasourceConfigFormValue>): void;
  protected abstract loadDatasources(): void;
  protected abstract persistSources(sources: DatasourceSourceRecord[]): void;
  protected abstract applyConfigValidators(): void;
  protected abstract externalApiMappingValue(value: unknown): ExternalApiMappingValue[];
  protected abstract preferMeaningfulExternalApiValue<T>(
    ...values: Array<T | null | undefined>
  ): T | null | undefined;
  protected abstract createExternalApiMappingGroup(
    mapping?: Partial<ExternalApiMappingValue>
  ): ExternalApiMappingGroup;
  protected abstract externalApiExplicitValue(
    field: ExternalApiFieldSchema,
    value: unknown
  ): string | boolean | number;
  protected abstract externalApiEmptyValue(field: ExternalApiFieldSchema): string | boolean | number;
  protected abstract readStoredExternalApiConfigurations(): Record<string, ExternalApiConfigurationValue>;
  protected abstract loadLegacyExternalApiConfiguration(
    storageKey: string,
    fallbackKeys: string[]
  ): ExternalApiConfigurationValue | null;
  protected abstract mergeExternalApiConfigurations(
    base: ExternalApiConfigurationValue,
    overlay: ExternalApiConfigurationValue
  ): ExternalApiConfigurationValue;
  protected abstract hasMeaningfulExternalApiConfiguration(
    value: ExternalApiConfigurationValue | null | undefined
  ): boolean;

  constructor() {
    super();
    this.resetRepeatableRows();
    this.loadDatasources();

    effect(() => {
      const sources = this.sources();
      if (!this.hasInitializedSourcePersistence) {
        this.hasInitializedSourcePersistence = true;
        return;
      }
      this.persistSources(sources);
    });

    effect(() => {
      this.selectedConnectorId();
      this.configForm.controls.authenticationType.value;
      this.configForm.controls.connectionMethod.value;
      this.configForm.controls.useMongoUri.value;
      this.configForm.controls.useCaCertificate.value;
      this.applyConfigValidators();
    });
  }

  createExternalApiDynamicForm(
    connectorKey: string,
    initialValue: ExternalApiConfigurationValue | null
  ): { schema: ExternalApiSchema | null; form: ExternalApiDynamicForm; activeMappingTab: string } {
    return this.externalApiConfiguration.createDynamicForm(connectorKey, initialValue);
  }

  saveExternalApiConfiguration(
    storageKey: string,
    value: ExternalApiConfigurationValue,
    fallbackConnectorKey?: string
  ): void {
    if (!this.persistence.isAvailable()) {
      return;
    }

    const configurations = this.readStoredExternalApiConfigurations();
    configurations[storageKey] = value;
    if (fallbackConnectorKey) {
      configurations[fallbackConnectorKey] = value;
    }

    try {
      this.persistence.setItem(this.externalApiConfigurationsStorageKey, JSON.stringify(configurations));
    } catch {
      // Ignore storage failures in local/dev environments.
    }
  }

  loadExternalApiConfiguration(
    storageKey: string,
    fallbackKeys: string[] = []
  ): ExternalApiConfigurationValue | null {
    const configurations = this.readStoredExternalApiConfigurations();
    const keys = [storageKey, ...fallbackKeys].filter((key, index, all) => !!key && all.indexOf(key) === index);
    const current = keys
      .map((key) => configurations[key] ?? null)
      .find((value): value is ExternalApiConfigurationValue => !!value) ?? null;
    const legacy = this.loadLegacyExternalApiConfiguration(storageKey, fallbackKeys);

    if (!current && !legacy) {
      return null;
    }

    const merged = this.mergeExternalApiConfigurations(
      legacy ?? {},
      current ?? {}
    );

    if (this.hasMeaningfulExternalApiConfiguration(merged)) {
      configurations[storageKey] = merged;
      try {
        this.persistence.setItem(this.externalApiConfigurationsStorageKey, JSON.stringify(configurations));
      } catch {
        // Ignore migration failures in restricted environments.
      }
      return merged;
    }

    return current ?? legacy;
  }

}
