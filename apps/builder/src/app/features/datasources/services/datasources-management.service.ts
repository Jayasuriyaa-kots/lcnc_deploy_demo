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

import { DatasourcesConfigUiService } from '@builder/features/datasources/services/datasources-config-ui.service';

export abstract class DatasourcesManagementService extends DatasourcesConfigUiService {
  protected abstract getConfigDefaults(
    connector: DatasourceConnectorOption | null
  ): DatasourceConfigFormValue;
  protected abstract resetRepeatableRows(snapshot?: Partial<DatasourceConfigFormValue>): void;
  protected abstract getSourceById(sourceId: string): DatasourceSourceRecord | null;
  protected abstract buildConfigFormValueForSource(
    source: DatasourceSourceRecord,
    connector: DatasourceConnectorOption
  ): DatasourceConfigFormValue;
  protected abstract applyConfigValidators(): void;
  protected abstract collectConfigSnapshot(
    formValue: Omit<
      DatasourceConfigFormValue,
      'hostEntries' | 'sshHostEntries' | 'headerEntries' | 'queryParamEntries'
    >
  ): DatasourceConfigFormValue;
  protected abstract readStoredSources(): DatasourceSourceRecord[] | null;
  protected abstract createUniqueDatasourceName(requestedName: string, excludeSourceId?: string): string;
  protected abstract buildStoredSourceFields(
    formValue: DatasourceConfigFormValue
  ): Pick<
    DatasourceSourceRecord,
    | 'connectionMethod'
    | 'connectionMode'
    | 'hostAddress'
    | 'baseUrl'
    | 'port'
    | 'databaseName'
    | 'username'
    | 'password'
    | 'sslMode'
    | 'authType'
    | 'headers'
  >;
  protected abstract buildSubtitleForConnector(
    connector: DatasourceConnectorOption,
    formValue: DatasourceConfigFormValue
  ): string;
  protected abstract persistSources(sources: DatasourceSourceRecord[]): void;
  protected abstract loadDatasources(): void;
  protected abstract createDatasourceId(): string;
  protected abstract createFieldMappings(): DatasourceFieldMapping[];
  protected abstract createSchemaFieldGroup(field: DatasourceFieldMapping): SchemaFieldGroup;

  selectConnector(connectorId: DatasourceConnectorId): void {
    this.configMode.set('create');
    this.editingSourceId.set(null);
    this.selectedConnectorId.set(connectorId);
    const connector = this.connectorOptions().find((item) => item.id === connectorId) ?? null;
    const defaults = this.getConfigDefaults(connector);
    this.configForm.reset(defaults);
    this.resetRepeatableRows(defaults);
    this.workspace.set('config');
  }

  openEditDatasource(sourceId: string): void {
    this.editDatasource(sourceId);
  }

  editDatasource(id: string): void {
    const datasource = this.getSourceById(id);
    if (!datasource) {
      this.notifyError(this.i18n.translate('common.datasourceNotFound'), this.i18n.translate('externalApis.edit'));
      return;
    }

    const connector = this.connectorOptions().find((item) => item.id === datasource.connectorId) ?? null;
    if (!connector) {
      this.notifyError(this.i18n.translate('common.datasourceConnectorNotFound'), this.i18n.translate('externalApis.edit'));
      return;
    }

    const config = this.buildConfigFormValueForSource(datasource, connector);

    this.selectedSourceId.set(id);
    this.editingSourceId.set(id);
    this.configMode.set('edit');
    this.selectedConnectorId.set(datasource.connectorId);
    this.configForm.reset(config, { emitEvent: false });
    this.resetRepeatableRows(config);
    this.applyConfigValidators();
    this.workspace.set('config');
  }

  cancelEditingDatasource(): void {
    this.configMode.set('create');
    this.selectedConnectorId.set(null);
    const defaults = this.getConfigDefaults(null);
    this.configForm.reset(defaults);
    this.resetRepeatableRows(defaults);
    this.backToDashboard();
  }

  testAllSources(): void {
    const activeSources = this.sources().filter((source) => source.active);
    if (!activeSources.length) {
      this.notifyError(this.i18n.translate('common.noActiveDataSourcesToTest'), this.i18n.translate('common.testAll'));
      return;
    }

    this.testingAll.set(true);
    queueMicrotask(() => {
      this.testingAll.set(false);
      this.notifySuccess(this.i18n.translate('common.activeDataSourcesTested'), this.i18n.translate('common.testAll'));
    });
  }

  testSource(sourceId: string): void {
    const source = this.sources().find((item) => item.id === sourceId);
    if (!source) {
      this.notifyError(this.i18n.translate('common.datasourceNotFound'), this.i18n.translate('externalApis.test'));
      return;
    }

    if (!source.active) {
      this.notifyError(
        this.i18n.translate('common.datasourceInactiveActivateBeforeTesting', { name: source.name }),
        this.i18n.translate('externalApis.test')
      );
      return;
    }

    this.notifySuccess(
      this.i18n.translate('common.datasourceTestedSuccessfully', { name: source.name }),
      this.i18n.translate('externalApis.test')
    );
  }

  testConnection(): void {
    this.notifySuccess(
      this.i18n.translate('common.connectionTestSucceeded'),
      this.i18n.translate('common.testConnection')
    );
  }

  saveDatasource(): void {
    this.configForm.markAllAsTouched();
    if (this.configForm.invalid || !this.selectedConnector()) {
      return;
    }

    this.savingSource.set(true);
    const connector = this.selectedConnector()!;
    const formValue = this.collectConfigSnapshot(this.configForm.getRawValue());
    const existingSources = this.readStoredSources() ?? [];
    const editingSourceId = this.editingSourceId();
    const requestedName = formValue.name.trim();

    if (editingSourceId) {
      const uniqueName = this.createUniqueDatasourceName(requestedName, editingSourceId);
      const storedFields = this.buildStoredSourceFields({ ...formValue, name: uniqueName });

      const nextSources = existingSources.map((source) =>
        source.id === editingSourceId
          ? {
              ...source,
              connectorId: connector.id,
              name: uniqueName,
              datasourceName: uniqueName,
              type: connector.id,
              subtitle: this.buildSubtitleForConnector(connector, { ...formValue, name: uniqueName }),
              desc: this.buildSubtitleForConnector(connector, { ...formValue, name: uniqueName }),
              ...storedFields,
              configSnapshot: { ...formValue, name: uniqueName },
            }
          : source
      );
      this.persistSources(nextSources);
      this.loadDatasources();
      this.selectedSourceId.set(editingSourceId);
      this.configMode.set('create');
      this.selectedConnectorId.set(null);
      this.savingSource.set(false);
      this.datasourceSearch.set('');
      const defaults = this.getConfigDefaults(null);
      this.configForm.reset(defaults);
      this.resetRepeatableRows(defaults);
      this.backToDashboard();
      void this.router.navigate(['/datasources/sources'], { queryParamsHandling: 'preserve' });
      this.notifySuccess(
        this.i18n.translate('common.datasourceUpdatedSuccessfully', { name: uniqueName }),
        this.i18n.translate('externalApis.saveChanges')
      );
      return;
    }

    const uniqueName = this.createUniqueDatasourceName(requestedName);
    const storedFields = this.buildStoredSourceFields({ ...formValue, name: uniqueName });
    const newSource: DatasourceSourceRecord = {
      id: this.createDatasourceId(),
      type: connector.id,
      connectorId: connector.id,
      status: 'healthy',
      name: uniqueName,
      datasourceName: uniqueName,
      subtitle: this.buildSubtitleForConnector(connector, { ...formValue, name: uniqueName }),
      desc: this.buildSubtitleForConnector(connector, { ...formValue, name: uniqueName }),
      ...storedFields,
      active: true,
      metrics: {
        availability: '100%',
        p95: '55ms',
        rpm: '340',
        errors: '0.0%',
        auth: 'OK',
        jobs: '6/6',
        eps: '4 EPs',
      },
      configSnapshot: { ...formValue, name: uniqueName },
      queries: [],
      fieldMappings: this.createFieldMappings(),
      expanded: false,
    };

    const nextSources = [...existingSources, newSource];
    this.persistSources(nextSources);
    this.loadDatasources();
    this.selectedSourceId.set(newSource.id);
    this.configMode.set('create');
    this.selectedConnectorId.set(null);
    this.savingSource.set(false);
    this.datasourceSearch.set('');
    const defaults = this.getConfigDefaults(null);
    this.configForm.reset(defaults);
    this.resetRepeatableRows(defaults);
    this.backToDashboard();
    void this.router.navigate(['/datasources/sources'], { queryParamsHandling: 'preserve' });
    this.notifySuccess(
      this.i18n.translate('common.datasourceAdded', { name: newSource.name }),
      this.i18n.translate('common.saveDatasource')
    );
  }

  toggleExpansion(sourceId: string): void {
    this.sources.update((sources) =>
      sources.map((source) =>
        source.id === sourceId ? { ...source, expanded: !source.expanded } : source
      )
    );
  }

  openSchema(sourceId: string): void {
    const source = this.sources().find((item) => item.id === sourceId);
    if (!source) {
      this.notifyError(this.i18n.translate('common.datasourceNotFound'), this.i18n.translate('common.schema'));
      return;
    }

    if (!source.active) {
      this.notifyError(
        this.i18n.translate('common.datasourceInactiveActivateBeforeOpeningSchema', { name: source.name }),
        this.i18n.translate('common.schema')
      );
      return;
    }

    this.schemaSourceId.set(sourceId);
    this.schemaFields.clear();
    for (const field of source?.fieldMappings ?? []) {
      this.schemaFields.push(this.createSchemaFieldGroup(field));
    }
  }

  closeSchema(): void {
    this.schemaSourceId.set(null);
    this.schemaFields.clear();
  }

  toggleAllSchemaFields(): void {
    const shouldSelectAll = this.selectedSchemaCount() !== this.schemaFields.length;
    this.schemaFields.controls.forEach((field) => field.controls.selected.setValue(shouldSelectAll));
  }

  setSchemaFieldSelected(index: number, selected: boolean): void {
    this.schemaFields.at(index)?.controls.selected.setValue(selected);
  }

  applySchema(): void {
    const sourceId = this.schemaSourceId();
    if (!sourceId) {
      return;
    }
    const nextMappings = this.schemaFields.getRawValue();
    this.sources.update((sources) =>
      sources.map((source) =>
        source.id === sourceId ? { ...source, fieldMappings: nextMappings } : source
      )
    );
    this.closeSchema();
    this.notifySuccess(
      this.i18n.translate('schemaModal.fieldMappingsApplied'),
      this.i18n.translate('schemaModal.applyFields')
    );
  }

  openDetail(sourceId: string, queryId: string): void {
    const source = this.sources().find((item) => item.id === sourceId);
    const query = source?.queries.find((item) => item.id === queryId);
    if (source && query) {
      if (!this.queryRegistry.getQueryById(query.id)) {
        const mockResult = this.queryRegistry.generateMockResult(query.query);
        this.queryRegistry.saveQuery({
          id: query.id,
          name: query.name,
          datasourceId: source.id,
          datasourceName: source.name,
          queryType: query.method,
          query: query.query,
          columns: mockResult.columns,
          mockData: mockResult.rows,
          active: query.active,
          usedIn: [],
        });
      }
      this.detailState.set({ source, query });
    }
  }

  closeDetail(): void {
    this.detailState.set(null);
  }

}
