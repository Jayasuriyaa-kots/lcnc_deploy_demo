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

import { DatasourcesEditorSupportService } from '@builder/features/datasources/services/datasources-editor-support.service';

export abstract class DatasourcesConfigSupportService extends DatasourcesEditorSupportService {
  protected abstract createInitialSources(): DatasourceSourceRecord[];
  protected abstract serializeSourceForStorage(source: DatasourceSourceRecord): Record<string, unknown>;
  protected abstract hydrateStoredSource(
    source: DatasourceSourceRecord & Record<string, unknown>
  ): DatasourceSourceRecord;

  protected resetRepeatableRows(snapshot?: Partial<DatasourceConfigFormValue>): void {
    this.hostList.clear();
    this.sshHostList.clear();
    this.headerRows.clear();
    this.queryParamRows.clear();

    const hostEntries = snapshot?.hostEntries?.length
      ? snapshot.hostEntries
      : [{ host: snapshot?.host || '', port: snapshot?.port || this.configForm.controls.port.value || '' }];
    const sshHostEntries = snapshot?.sshHostEntries?.length
      ? snapshot.sshHostEntries
      : [{ host: snapshot?.sshHost || '', port: snapshot?.sshPort || '22' }];
    const headerEntries = snapshot?.headerEntries?.length
      ? snapshot.headerEntries
      : this.parseHeaderText(snapshot?.headers ?? this.configForm.controls.headers.value);
    const queryParamEntries = snapshot?.queryParamEntries?.length
      ? snapshot.queryParamEntries
      : [this.createEmptyKeyValueEntry()];

    hostEntries.forEach((entry) => this.hostList.push(this.createHostGroup(entry.port, entry.host)));
    sshHostEntries.forEach((entry) => this.sshHostList.push(this.createHostGroup(entry.port, entry.host)));
    headerEntries.forEach((entry) => this.headerRows.push(this.createKeyValueGroup(entry)));
    queryParamEntries.forEach((entry) => this.queryParamRows.push(this.createKeyValueGroup(entry)));
  }

  protected applyConfigValidators(): void {
    const controls = this.configForm.controls;
    const clear = (...names: Array<keyof typeof controls>) => {
      for (const name of names) {
        controls[name].clearValidators();
        controls[name].updateValueAndValidity({ emitEvent: false });
      }
    };
    const requireFields = (...names: Array<keyof typeof controls>) => {
      for (const name of names) {
        controls[name].setValidators([Validators.required]);
        controls[name].updateValueAndValidity({ emitEvent: false });
      }
    };

    clear(
      'name', 'host', 'hostUrl', 'port', 'databaseName', 'serviceName', 'baseUrl', 'endpointUrl',
      'username', 'secret', 'mongoUri', 'authDatabaseName', 'accessKeyId', 'secretAccessKey', 'databaseUrl',
      'projectId', 'serviceAccountCredentials', 'accountName', 'warehouse', 'httpPath', 'personalAccessToken',
      'region', 'sshHost', 'sshPort', 'sshUsername', 'sshKeyName', 'authorizationHeader', 'apiKeyName',
      'bearerToken', 'oauthClientId', 'oauthClientSecret', 'oauthTokenUrl', 'graphqlQuery', 'privateKeyName',
      'caCertificateBase64', 'caCertificateFileName'
    );

    requireFields('name');

    if (this.isConnector('postgresql')) {
      requireFields('host', 'port', 'databaseName', 'username', 'secret');
    }
    if (this.isConnector('mysql')) {
      requireFields('host', 'port', 'databaseName', 'username', 'secret');
    }
    if (this.isConnector('mssql')) {
      requireFields('host', 'port', 'databaseName', 'username', 'secret');
    }
    if (this.isConnector('redis')) {
      requireFields('host', 'port', 'databaseNumber');
    }
    if (this.isConnector('arangodb')) {
      requireFields('host', 'port', 'databaseName', 'username', 'secret');
    }
    if (this.isConnector('oracle')) {
      requireFields('host', 'port', 'serviceName', 'username', 'secret');
    }
    if (this.isConnector('elasticsearch')) {
      requireFields('hostUrl', 'port');
    }
    if (this.isConnector('dynamodb')) {
      requireFields('region', 'accessKeyId', 'secretAccessKey');
    }
    if (this.isConnector('firestore')) {
      requireFields('databaseUrl', 'projectId', 'serviceAccountCredentials');
    }
    if (this.isConnector('snowflake')) {
      requireFields('accountName', 'warehouse', 'databaseName', 'username');
      if (this.configForm.controls.authType.value === 'Key Pair') {
        requireFields('privateKeyName');
      } else {
        requireFields('secret');
      }
    }
    if (this.isConnector('databricks')) {
      requireFields('configurationMethod', 'host', 'port', 'httpPath', 'personalAccessToken');
    }
    if (this.showRestFields()) {
      requireFields('httpMethod', 'endpointUrl');
    }
    if (this.showGraphqlFields()) {
      requireFields('endpointUrl', 'httpMethod', 'graphqlQuery');
    }
    if (this.showAuthenticatedApiFields()) {
      requireFields('baseUrl', 'authenticationType');
      if (this.showBasicFields()) {
        requireFields('username', 'secret');
      }
      if (this.showApiKeyFields()) {
        requireFields('apiKeyName', 'secret');
      }
      if (this.showBearerFields()) {
        requireFields('bearerToken');
      }
      if (this.showOAuthFields()) {
        requireFields('oauthClientId', 'oauthClientSecret', 'oauthTokenUrl');
      }
    }
    if (this.showMongoFields()) {
      if (this.showMongoUriFields()) {
        requireFields('mongoUri');
      } else {
        requireFields('host', 'port');
      }
      requireFields('authenticationType');
      if (this.configForm.controls.authenticationType.value !== 'None') {
        requireFields('authDatabaseName', 'username', 'secret');
      }
    }
    if (this.showSshFields()) {
      requireFields('sshHost', 'sshPort', 'sshUsername', 'sshKeyName');
    }
    if (this.showArangoCertificateBase64()) {
      requireFields('caCertificateBase64');
    }
    if (this.showArangoCertificateUpload()) {
      requireFields('caCertificateFileName');
    }
  }

  protected createUniqueDatasourceName(requestedName: string, excludeSourceId?: string): string {
    const trimmedName = requestedName || 'New Datasource';
    const existingNames = new Set(
      this.sources()
        .filter((source) => source.id !== excludeSourceId)
        .map((source) => source.name.toLowerCase())
    );
    if (!existingNames.has(trimmedName.toLowerCase())) {
      return trimmedName;
    }

    let suffix = 2;
    let nextName = `${trimmedName} ${suffix}`;
    while (existingNames.has(nextName.toLowerCase())) {
      suffix += 1;
      nextName = `${trimmedName} ${suffix}`;
    }

    return nextName;
  }

  protected createConnectorOptions(): DatasourceConnectorOption[] {
    const connectorText = (key: string) => this.i18n.translate(`connectors.${key}`);

    return [
      { id: 'rest_api', label: connectorText('restApi'), kind: 'api', icon: 'rest', description: '', capabilitySummary: connectorText('restRequestBuilder'), capabilityChips: [connectorText('chipGet'), connectorText('chipPost'), connectorText('chipPut'), connectorText('chipPatch'), connectorText('chipDelete')] },
      { id: 'graphql_api', label: connectorText('graphqlApi'), kind: 'api', icon: 'graphql', description: '', capabilitySummary: connectorText('graphqlRequestBuilder'), capabilityChips: [connectorText('chipQuery'), connectorText('chipMutation')] },
      { id: 'authenticated_api', label: connectorText('authenticatedApi'), kind: 'api', icon: 'rest', description: '', capabilitySummary: connectorText('secureRestRequestBuilder'), capabilityChips: [connectorText('chipGet'), connectorText('chipPost'), connectorText('chipPut'), connectorText('chipPatch'), connectorText('chipDelete')] },
      { id: 'authenticated_graphql', label: connectorText('authenticatedGraphql'), kind: 'api', icon: 'graphql', description: '', capabilitySummary: connectorText('secureGraphqlRequestBuilder'), capabilityChips: [connectorText('chipQuery'), connectorText('chipMutation'), connectorText('chipSubscription')] },
      { id: 'postgresql', label: connectorText('postgresql'), kind: 'database', icon: 'postgres', description: '', capabilitySummary: connectorText('sqlCustomQuery'), capabilityChips: [connectorText('chipSelect'), connectorText('chipInsert'), connectorText('chipUpdate'), connectorText('chipDelete'), connectorText('chipJoin'), connectorText('chipStoredProcedures')], defaultPort: '5432' },
      { id: 'mongodb', label: connectorText('mongodb'), kind: 'database', icon: 'default', description: '', capabilitySummary: connectorText('mongoQuery'), capabilityChips: [connectorText('chipFind'), connectorText('chipFindOne'), connectorText('chipInsertOne'), connectorText('chipAggregate')], defaultPort: '27017' },
      { id: 'mysql', label: connectorText('mysql'), kind: 'database', icon: 'mysql', description: '', capabilitySummary: connectorText('sqlCustomQuery'), capabilityChips: [connectorText('chipSelect'), connectorText('chipInsert'), connectorText('chipUpdate'), connectorText('chipDelete'), connectorText('chipJoin'), connectorText('chipStoredProcedures')], defaultPort: '3306' },
      { id: 'elasticsearch', label: connectorText('elasticsearch'), kind: 'database', icon: 'default', description: '', capabilitySummary: connectorText('searchQuery'), capabilityChips: [connectorText('chipSearch'), connectorText('chipIndex'), connectorText('chipUpdate'), connectorText('chipDelete'), connectorText('chipAggregation')] },
      { id: 'dynamodb', label: connectorText('dynamodb'), kind: 'database', icon: 'default', description: '', capabilitySummary: connectorText('dynamodbOperation'), capabilityChips: [connectorText('chipGetItem'), connectorText('chipPutItem'), connectorText('chipUpdateItem'), connectorText('chipQuery'), connectorText('chipScan')] },
      { id: 'redis', label: connectorText('redis'), kind: 'database', icon: 'default', description: '', capabilitySummary: connectorText('redisCommandSet'), capabilityChips: [connectorText('chipGet'), connectorText('chipSet'), connectorText('chipDel'), connectorText('chipHget'), connectorText('chipHset')] },
      { id: 'mssql', label: connectorText('mssql'), kind: 'database', icon: 'default', description: '', capabilitySummary: connectorText('sqlCustomQuery'), capabilityChips: [connectorText('chipSelect'), connectorText('chipInsert'), connectorText('chipUpdate'), connectorText('chipDelete'), connectorText('chipJoin'), connectorText('chipStoredProcedures')] },
      { id: 'firestore', label: connectorText('firestore'), kind: 'database', icon: 'default', description: '', capabilitySummary: connectorText('firestoreDocumentQuery'), capabilityChips: [connectorText('chipGetDocument'), connectorText('chipAddDocument'), connectorText('chipUpdateDocument'), connectorText('chipQueryCollection')] },
      { id: 'snowflake', label: connectorText('snowflake'), kind: 'database', icon: 'default', description: '', capabilitySummary: connectorText('warehouseSqlQuery'), capabilityChips: [connectorText('chipSelect'), connectorText('chipMerge'), connectorText('chipCopyInto'), connectorText('chipAlter')] },
      { id: 'arangodb', label: connectorText('arangodb'), kind: 'database', icon: 'default', description: '', capabilitySummary: connectorText('arangoMultiModelQuery'), capabilityChips: [connectorText('chipAqlQuery'), connectorText('chipInsert'), connectorText('chipUpsert'), connectorText('chipGraphQuery')] },
      { id: 'oracle', label: connectorText('oracle'), kind: 'database', icon: 'default', description: '', capabilitySummary: connectorText('enterpriseSqlQuery'), capabilityChips: [connectorText('chipSelect'), connectorText('chipInsert'), connectorText('chipUpdate'), connectorText('chipDelete'), connectorText('chipMerge'), connectorText('chipStoredProcedures')] },
      { id: 'databricks', label: connectorText('databricks'), kind: 'database', icon: 'default', description: '', capabilitySummary: connectorText('databricksSqlQuery'), capabilityChips: [connectorText('chipSelect'), connectorText('chipInsert'), connectorText('chipUpdate'), connectorText('chipDelete'), connectorText('chipSparkSql')] },
      { id: 'google_sheets', label: connectorText('googleSheets'), kind: 'database', icon: 'default', description: '', capabilitySummary: connectorText('sheetQuery'), capabilityChips: [connectorText('chipSelect')] },
    ];
  }

  protected loadDatasources(): void {
    if (typeof window === 'undefined') {
      this.sources.set(this.createInitialSources());
      return;
    }

    const savedRaw = this.persistence.getItem(this.sourcesStorageKey);
    const saved = savedRaw ? JSON.parse(savedRaw) : [];

    if (Array.isArray(saved) && saved.length > 0) {
      const hydrated = this.hydrateStoredSources(saved);
      this.sources.set(hydrated);
      return;
    }

    const defaultDatasources = this.createInitialSources();
    this.sources.set(defaultDatasources);
    this.persistence.setItem(
      this.sourcesStorageKey,
      JSON.stringify(defaultDatasources.map((source) => this.serializeSourceForStorage(source)))
    );
  }

  protected getSourceById(sourceId: string): DatasourceSourceRecord | null {
    return (
      this.readStoredSources()?.find((item) => item.id === sourceId) ??
      this.sources().find((item) => item.id === sourceId) ??
      null
    );
  }

  protected readStoredSources(): DatasourceSourceRecord[] | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const raw =
        this.persistence.getItem(this.sourcesStorageKey) ??
        this.persistence.getItem(this.legacySourcesStorageKey);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as Array<DatasourceSourceRecord & Record<string, unknown>>;
      return this.hydrateStoredSources(parsed);
    } catch {
      return null;
    }
  }

  protected hydrateStoredSources(
    parsed: Array<DatasourceSourceRecord & Record<string, unknown>>
  ): DatasourceSourceRecord[] {
    if (!Array.isArray(parsed)) {
      return [];
    }

    const hydratedSources: DatasourceSourceRecord[] = [];
    for (const source of parsed) {
      try {
        hydratedSources.push(this.hydrateStoredSource(source));
      } catch {
        // Ignore malformed datasource records so other saved items still load.
      }
    }

    return hydratedSources;
  }

  protected persistSources(sources: DatasourceSourceRecord[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      this.persistence.setItem(
        this.sourcesStorageKey,
        JSON.stringify(sources.map((source) => this.serializeSourceForStorage(source)))
      );
    } catch {
      // Ignore storage failures in local/dev environments.
    }
  }

}
