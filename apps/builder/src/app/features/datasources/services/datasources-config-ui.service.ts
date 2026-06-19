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

import { DatasourcesExternalConfigFacadeSlice } from '@builder/features/datasources/facades/datasources-external-config.facade';

export abstract class DatasourcesConfigUiService extends DatasourcesExternalConfigFacadeSlice {
  protected abstract createHostGroup(defaultPort?: string, defaultHost?: string): HostGroup;
  protected abstract createKeyValueGroup(entry?: Partial<DatasourceKeyValueEntry>): KeyValueGroup;
  protected abstract normalizeSearchValue(value: string): string;
  protected abstract searchHaystack(parts: Array<string | undefined>): string;

  setSection(section: DatasourceSection): void {
    this.section.set(section);
    if (this.workspace() === 'config' || this.workspace() === 'editor') {
      return;
    }
    if (section === 'sources') {
      if (this.workspace() !== 'picker') {
        this.workspace.set('dashboard');
      }
    } else {
      this.workspace.set('dashboard');
    }
  }

  showExternalApisSuccess(message: string, title: string): void {
    this.notifySuccess(message, title);
  }

  showExternalApisWarning(message: string, title: string): void {
    this.notifyWarning(message, title);
  }

  showExternalApisInfo(message: string, title: string): void {
    this.notifyInfo(message, title);
  }

  showExternalApisError(message: string, title: string): void {
    this.notifyError(message, title);
  }

  isConnector(...ids: DatasourceConnectorId[]): boolean {
    const connectorId = this.selectedConnectorId();
    return connectorId ? ids.includes(connectorId) : false;
  }

  showDatabaseConnectionFields(): boolean {
    return this.isConnector('postgresql', 'mysql', 'mssql', 'redis', 'arangodb', 'oracle');
  }

  showMongoFields(): boolean {
    return this.isConnector('mongodb');
  }

  showElasticFields(): boolean {
    return this.isConnector('elasticsearch');
  }

  showDynamoFields(): boolean {
    return this.isConnector('dynamodb');
  }

  showFirestoreFields(): boolean {
    return this.isConnector('firestore');
  }

  showSnowflakeFields(): boolean {
    return this.isConnector('snowflake');
  }

  showDatabricksFields(): boolean {
    return this.isConnector('databricks');
  }

  showRestFields(): boolean {
    return this.isConnector('rest_api');
  }

  showGraphqlFields(): boolean {
    return this.isConnector('graphql_api');
  }

  showAuthenticatedApiFields(): boolean {
    return this.isConnector('authenticated_api', 'authenticated_graphql');
  }

  showAuthenticatedRestFields(): boolean {
    return this.isConnector('authenticated_api');
  }

  showAuthenticatedGraphqlFields(): boolean {
    return this.isConnector('authenticated_graphql');
  }

  showSshFields(): boolean {
    return this.isConnector('postgresql', 'mysql') && this.configForm.controls.connectionMethod.value === 'SSH Tunnel';
  }

  showMongoUriFields(): boolean {
    return this.showMongoFields() && this.configForm.controls.useMongoUri.value === 'Yes';
  }

  showMongoHostFields(): boolean {
    return this.showMongoFields() && this.configForm.controls.useMongoUri.value !== 'Yes';
  }

  showApiKeyFields(): boolean {
    return this.configForm.controls.authenticationType.value === 'API Key';
  }

  showBearerFields(): boolean {
    return this.configForm.controls.authenticationType.value === 'Bearer Token';
  }

  showOAuthFields(): boolean {
    const value = this.configForm.controls.authenticationType.value;
    return value === 'OAuth' || value === 'OAuth 2.0';
  }

  showBasicFields(): boolean {
    const value = this.configForm.controls.authenticationType.value;
    return value === 'Basic' || value === 'Basic Auth';
  }

  showSnowflakeKeyPairFields(): boolean {
    return this.showSnowflakeFields() && this.configForm.controls.authType.value === 'Key Pair';
  }

  showArangoCertificateUpload(): boolean {
    return this.isConnector('arangodb') && this.configForm.controls.useCaCertificate.value === 'Upload File';
  }

  showArangoCertificateBase64(): boolean {
    return this.isConnector('arangodb') && this.configForm.controls.useCaCertificate.value === 'Base64 String';
  }

  showRunDebugActions(): boolean {
    return this.showRestFields() || this.showGraphqlFields();
  }

  showConfigRuntimeSection(): boolean {
    return this.showRestFields() || this.showGraphqlFields();
  }

  showAuthenticationSection(): boolean {
    return (
      this.isConnector('postgresql', 'mysql', 'mssql', 'arangodb', 'oracle', 'redis', 'mongodb', 'elasticsearch', 'snowflake', 'databricks') ||
      this.showAuthenticatedApiFields()
    );
  }

  showSslSection(): boolean {
    return this.isConnector('postgresql', 'mongodb', 'mysql', 'redis', 'mssql', 'arangodb', 'oracle');
  }

  showHeadersSection(): boolean {
    return this.showRestFields() || this.showGraphqlFields() || this.showAuthenticatedApiFields();
  }

  showQueryParamsSection(): boolean {
    return this.showRestFields() || this.showAuthenticatedApiFields();
  }

  addHost(): void {
    this.hostList.push(this.createHostGroup());
  }

  removeHost(index: number): void {
    if (this.hostList.length > 1) {
      this.hostList.removeAt(index);
    }
  }

  addSshHost(): void {
    this.sshHostList.push(this.createHostGroup('22'));
  }

  removeSshHost(index: number): void {
    if (this.sshHostList.length > 1) {
      this.sshHostList.removeAt(index);
    }
  }

  addHeaderRow(): void {
    this.headerRows.push(this.createKeyValueGroup());
  }

  removeHeaderRow(index: number): void {
    if (this.headerRows.length > 1) {
      this.headerRows.removeAt(index);
    }
  }

  addQueryParamRow(): void {
    this.queryParamRows.push(this.createKeyValueGroup());
  }

  removeQueryParamRow(index: number): void {
    if (this.queryParamRows.length > 1) {
      this.queryParamRows.removeAt(index);
    }
  }

  setUploadField(controlName: 'sshKeyName' | 'privateKeyName' | 'caCertificateFileName', files: File[]): void {
    this.configForm.controls[controlName].setValue(files[0]?.name ?? '');
  }

  setConfigRuntimeTab(tab: DatasourceConfigRuntimeTab): void {
    this.configRuntimeTab.set(tab);
  }

  runConfigAction(): void {
    this.notifySuccess(
      this.i18n.translate('common.datasourceRunPreviewExecuted'),
      this.i18n.translate('common.run')
    );
  }

  debugConfigAction(): void {
    this.notifySuccess(
      this.i18n.translate('common.datasourceDebugViewOpened'),
      this.i18n.translate('common.debug')
    );
  }

  openPicker(): void {
    this.configMode.set('create');
    this.editingSourceId.set(null);
    this.section.set('sources');
    this.workspace.set('picker');
  }

  backToDashboard(): void {
    this.configMode.set('create');
    this.editingSourceId.set(null);
    this.section.set('sources');
    this.workspace.set('dashboard');
  }

  setDatasourceSearch(value: string): void {
    this.datasourceSearch.set(value.trimStart());
  }

  clearDatasourceSearch(): void {
    this.datasourceSearch.set('');
  }

  setQuerySearch(sourceId: string, value: string): void {
    this.querySearchByDatasourceId.update((current) => ({
      ...current,
      [sourceId]: value.trimStart(),
    }));
  }

  clearQuerySearch(sourceId: string): void {
    this.querySearchByDatasourceId.update((current) => ({
      ...current,
      [sourceId]: '',
    }));
  }

  datasourceMatchesSearch(source: DatasourceSourceRecord): boolean {
    const query = this.normalizeSearchValue(this.datasourceSearch());
    if (!query) {
      return true;
    }

    const connector = this.connectorOptions().find((option) => option.id === source.connectorId);
    return this.searchHaystack([
      source.name,
      connector?.label ?? '',
      connector?.kind ?? '',
      source.subtitle,
      source.status,
      source.active ? 'active' : 'inactive',
      source.metrics.auth,
      source.metrics.jobs,
    ]).includes(query);
  }

  querySearchValue(sourceId: string): string {
    return this.querySearchByDatasourceId()[sourceId] ?? '';
  }

  querySearchPlaceholder(sourceId: string): string {
    const source = this.sources().find((item) => item.id === sourceId);
    if (!source) {
      return this.i18n.translate('card.querySearchPlaceholder');
    }

    const connector = this.connectorOptions().find((option) => option.id === source.connectorId);
    return connector?.kind === 'api'
      ? this.i18n.translate('card.endpointSearchPlaceholder')
      : this.i18n.translate('card.querySearchPlaceholder');
  }

  filteredQueries(sourceId: string): DatasourceQueryRecord[] {
    const source = this.sources().find((item) => item.id === sourceId);
    if (!source) {
      return [];
    }

    const query = this.normalizeSearchValue(this.querySearchValue(sourceId));
    if (!query) {
      return source.queries;
    }

    return source.queries.filter((record) => {
      const firstLine = record.query.split('\n')[0] ?? '';
      return this.searchHaystack([
        record.name,
        record.method,
        record.query,
        firstLine,
        source.name,
      ]).includes(query);
    });
  }

}
