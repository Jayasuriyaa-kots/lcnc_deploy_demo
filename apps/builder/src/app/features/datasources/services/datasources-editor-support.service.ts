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

import { DatasourcesQueryService } from '@builder/features/datasources/services/datasources-query.service';

export abstract class DatasourcesEditorSupportService extends DatasourcesQueryService {
  protected seedEditor(sourceId: string, queryId: string | null): void {
    const source = this.sources().find((item) => item.id === sourceId) ?? this.sources()[0];
    if (!source) {
      return;
    }

    if (queryId === null) {
      const tabs: DatasourceEditorTab[] = [
        {
          id: `draft-${sourceId}-1`,
          datasourceId: source.id,
          name: this.i18n.translate('uiText.query1'),
          queryTypeLabel: this.i18n.translate('configSections.customQuery'),
          query: 'SELECT * FROM users LIMIT 10;',
          existingQueryId: null,
        },
        {
          id: `draft-${sourceId}-2`,
          datasourceId: source.id,
          name: 'Query 2',
          queryTypeLabel: this.i18n.translate('configSections.customQuery'),
          query: 'SELECT * FROM users LIMIT 10;',
          existingQueryId: null,
        },
      ];
      this.queryTabs.set(tabs);
      this.activeQueryTabId.set(tabs[0].id);
      this.patchEditorFromTab(tabs[0]);
      this.resultTab.set('Results');
      this.hasRunQuery.set(false);
      this.currentResultColumns.set([]);
      this.currentResultRows.set([]);
      this.executedQueryText.set('');
      return;
    }

    const mappedTabs = source.queries.map((query, index) => ({
      id: query.id,
      datasourceId: source.id,
      name: query.name || `Query ${index + 1}`,
      queryTypeLabel: this.i18n.translate('configSections.customQuery'),
      query: query.query,
      existingQueryId: query.id,
    }));
    this.queryTabs.set(mappedTabs);
    const active = mappedTabs.find((tab) => tab.id === queryId) ?? mappedTabs[0];
    if (active) {
      this.activeQueryTabId.set(active.id);
      this.patchEditorFromTab(active);
    }
    this.resultTab.set('Results');
    this.hasRunQuery.set(false);
    this.currentResultColumns.set([]);
    this.currentResultRows.set([]);
    this.executedQueryText.set('');
  }

  protected persistActiveEditorTab(): void {
    const activeId = this.activeQueryTabId();
    if (!activeId) {
      return;
    }
    this.queryTabs.update((tabs) =>
      tabs.map((tab) =>
        tab.id === activeId
          ? {
              ...tab,
              datasourceId: this.editorForm.controls.datasourceId.value,
              queryTypeLabel: this.editorForm.controls.queryTypeLabel.value,
              query: this.editorForm.controls.query.value,
            }
          : tab
      )
    );
  }

  protected patchEditorFromTab(tab: DatasourceEditorTab): void {
    this.editorForm.setValue({
      datasourceId: tab.datasourceId,
      queryTypeLabel: tab.queryTypeLabel,
      query: tab.query,
    });
    this.selectedSourceId.set(tab.datasourceId);
  }

  protected getConfigDefaults(connector: DatasourceConnectorOption | null): DatasourceConfigFormValue {
    return {
      name: connector?.label === 'REST API' ? 'Attendance API' : '',
      connectionMethod: this.i18n.translate('common.standard'),
      accessMode: this.i18n.translate('common.readWrite'),
      useMongoUri: 'No',
      mongoUri: '',
      mongoConnectionType: this.i18n.translate('common.directConnection'),
      host: '',
      hostUrl: '',
      port: connector?.defaultPort ?? '',
      databaseName: '',
      serviceName: '',
      baseUrl: connector?.kind === 'api' ? 'https://api.example.com' : '',
      endpointUrl: connector?.kind === 'api' ? 'https://api.example.com/resource' : '',
      timeout: '5000',
      headers: 'Authorization, Content-Type',
      httpMethod: connector?.id === 'graphql_api' || connector?.id === 'authenticated_graphql' ? 'POST' : 'GET',
      bodyType: 'NONE',
      requestBody: '',
      paginationMode: 'None',
      paginationFieldOne: '',
      paginationFieldTwo: '',
      paginationFieldThree: '',
      paginationFieldFour: '',
      paginationFieldFive: '',
      paginationFieldSix: '',
      authentication: 'None',
      authenticationType: connector?.id === 'snowflake' ? 'Basic' : 'None',
      authDatabaseName: '',
      username: '',
      secret: '',
      apiKeyLocation: 'Header',
      apiKeyName: '',
      bearerToken: '',
      oauthClientId: '',
      oauthClientSecret: '',
      oauthTokenUrl: '',
      oauthScope: '',
      authorizationHeader: '',
      sslMode: 'Default',
      sslEnabled: true,
      useCaCertificate: 'Disabled',
      caCertificateFileName: '',
      caCertificateBase64: '',
      sendSignatureHeader: false,
      useSelfSignedCertificate: false,
      sshHost: '',
      sshPort: '22',
      sshUsername: '',
      sshKeyName: '',
      region: 'ap-south-1',
      accessKeyId: '',
      secretAccessKey: '',
      databaseNumber: '0',
      databaseUrl: '',
      projectId: '',
      serviceAccountCredentials: '',
      accountName: '',
      warehouse: '',
      role: '',
      authType: 'Basic',
      privateKeyName: '',
      privateKeyPassphrase: '',
      configurationMethod: this.i18n.translate('common.useFormProperties'),
      httpPath: '',
      defaultCatalog: '',
      defaultSchema: '',
      personalAccessToken: '',
      serverTimezoneOverride: '',
      graphqlQuery: 'query Example { users { id name } }',
      graphqlVariables: '{\n  "limit": 10\n}',
      hostEntries: [],
      sshHostEntries: [],
      headerEntries: [],
      queryParamEntries: [],
    };
  }

  protected buildConfigFormValueForSource(
    source: DatasourceSourceRecord,
    connector: DatasourceConnectorOption
  ): DatasourceConfigFormValue {
    const defaults = this.getConfigDefaults(connector);
    const snapshot = (source.configSnapshot ?? source) as Partial<DatasourceConfigFormValue> & Partial<DatasourceSourceRecord>;
    const subtitleParts = source.subtitle.split('-').map((part) => part.trim()).filter(Boolean);
    const inferredLocation = subtitleParts[0] ?? '';

    return {
      ...defaults,
      ...snapshot,
      name: snapshot.name || source.name || defaults.name,
      connectionMethod: snapshot.connectionMethod || source.connectionMethod || defaults.connectionMethod,
      accessMode: snapshot.accessMode || source.connectionMode || defaults.accessMode,
      useMongoUri: snapshot.useMongoUri || defaults.useMongoUri,
      mongoUri: snapshot.mongoUri || source.hostAddress || (connector.id === 'mongodb' ? inferredLocation : defaults.mongoUri),
      host: snapshot.host || source.hostAddress || snapshot.hostEntries?.[0]?.host || (connector.id === 'mongodb' ? '' : defaults.host),
      hostUrl: snapshot.hostUrl || source.hostAddress || defaults.hostUrl,
      port: snapshot.port || source.port || snapshot.hostEntries?.[0]?.port || defaults.port,
      databaseName: snapshot.databaseName || source.databaseName || defaults.databaseName,
      username: snapshot.username || source.username || defaults.username,
      secret: snapshot.secret || source.password || defaults.secret,
      authentication: snapshot.authentication || defaults.authentication,
      authenticationType: (snapshot.authenticationType || source.authType || defaults.authenticationType) as DatasourceAuthMode,
      sslMode: snapshot.sslMode || source.sslMode || defaults.sslMode,
      sslEnabled: snapshot.sslEnabled ?? defaults.sslEnabled,
      headers: snapshot.headers || (typeof source.headers === 'string' ? source.headers : defaults.headers),
      baseUrl: snapshot.baseUrl || source.baseUrl || (connector.kind === 'api' ? inferredLocation : defaults.baseUrl),
      endpointUrl: snapshot.endpointUrl || defaults.endpointUrl,
      timeout: snapshot.timeout || defaults.timeout,
      serviceName: snapshot.serviceName || defaults.serviceName,
      authType: snapshot.authType || source.authType || defaults.authType,
      httpMethod: snapshot.httpMethod || defaults.httpMethod,
      paginationMode: snapshot.paginationMode || defaults.paginationMode,
      sshHost: snapshot.sshHost || snapshot.sshHostEntries?.[0]?.host || defaults.sshHost,
      sshPort: snapshot.sshPort || snapshot.sshHostEntries?.[0]?.port || defaults.sshPort,
      hostEntries: snapshot.hostEntries?.length ? snapshot.hostEntries : defaults.hostEntries,
      sshHostEntries: snapshot.sshHostEntries?.length ? snapshot.sshHostEntries : defaults.sshHostEntries,
      headerEntries:
        snapshot.headerEntries?.length
          ? snapshot.headerEntries
          : Array.isArray(source.headers) && source.headers.length
            ? source.headers
            : defaults.headerEntries,
      queryParamEntries: snapshot.queryParamEntries?.length ? snapshot.queryParamEntries : defaults.queryParamEntries,
    };
  }

  protected buildStoredSourceFields(
    formValue: DatasourceConfigFormValue
  ): Pick<
    DatasourceSourceRecord,
    'connectionMethod' | 'connectionMode' | 'hostAddress' | 'baseUrl' | 'port' | 'databaseName' | 'username' | 'password' | 'sslMode' | 'authType' | 'headers'
  > {
    return {
      connectionMethod: formValue.connectionMethod,
      connectionMode: formValue.accessMode,
      hostAddress:
        formValue.host ||
        formValue.mongoUri ||
        formValue.hostUrl ||
        formValue.baseUrl ||
        formValue.endpointUrl ||
        '',
      baseUrl: formValue.baseUrl || formValue.endpointUrl || '',
      port: formValue.port,
      databaseName: formValue.databaseName,
      username: formValue.username,
      password: formValue.secret,
      sslMode: formValue.sslMode,
      authType: formValue.authenticationType || formValue.authType,
      headers: formValue.headerEntries?.length ? formValue.headerEntries : formValue.headers,
    };
  }

  protected createSchemaFieldGroup(field: DatasourceFieldMapping): SchemaFieldGroup {
    return this.fb.nonNullable.group({
      id: [field.id],
      name: [field.name],
      key: [field.key],
      dataType: [field.dataType],
      required: [field.required],
      unique: [field.unique],
      selected: [field.selected],
      suggestedFieldType: [field.suggestedFieldType],
    });
  }

  protected buildSubtitleForConnector(connector: DatasourceConnectorOption, formValue: DatasourceConfigFormValue): string {
    if (connector.kind === 'api') {
      return `${formValue.baseUrl || formValue.endpointUrl || 'https://api.example.com'} - 8 endpoints`;
    }
    if (connector.id === 'mongodb') {
      return `${formValue.mongoUri || formValue.host || 'cluster0.mongodb.net'} - events, logs, metrics`;
    }
    if (connector.id === 'firestore') {
      return `${formValue.projectId || 'firebase-project'} - service account connected`;
    }
    return `${formValue.databaseName || formValue.defaultSchema || '14 tables'} - ${formValue.serviceName || 'public schema'}`;
  }

  protected createSubtitleForConnector(connector: DatasourceConnectorOption): string {
    if (connector.kind === 'api') {
      return 'https://api.example.com - 8 endpoints';
    }
    return '14 tables - public schema';
  }

  protected createFieldMappings(): DatasourceFieldMapping[] {
    return [
      { id: 'employee-id', name: 'Employee ID', key: 'employee_id', dataType: 'INTEGER', required: true, unique: true, selected: true, suggestedFieldType: 'Number' },
      { id: 'employee-name', name: 'Employee Name', key: 'employee_name', dataType: 'VARCHAR', required: true, unique: false, selected: true, suggestedFieldType: 'Name' },
      { id: 'employee-email', name: 'Employee Email', key: 'employee_email', dataType: 'VARCHAR', required: false, unique: true, selected: true, suggestedFieldType: 'Email' },
      { id: 'role', name: 'Role', key: 'role', dataType: 'VARCHAR', required: false, unique: false, selected: false, suggestedFieldType: 'Text' },
      { id: 'created-date', name: 'Created Date', key: 'created_date', dataType: 'TIMESTAMP', required: false, unique: false, selected: false, suggestedFieldType: 'Date' },
      { id: 'updated-date', name: 'Updated Date', key: 'updated_date', dataType: 'TIMESTAMP', required: false, unique: false, selected: false, suggestedFieldType: 'Date' },
    ];
  }

  protected createKeyValueGroup(entry: Partial<DatasourceKeyValueEntry> = {}): KeyValueGroup {
    return this.fb.nonNullable.group({
      key: [entry.key ?? ''],
      value: [entry.value ?? ''],
    });
  }

  protected createHostGroup(defaultPort = '', defaultHost = ''): HostGroup {
    return this.fb.nonNullable.group({
      host: [defaultHost],
      port: [defaultPort],
    });
  }

  protected createEmptyKeyValueEntry(): DatasourceKeyValueEntry {
    return { key: '', value: '' };
  }

  protected parseHeaderText(rawHeaders: string): DatasourceKeyValueEntry[] {
    const entries = rawHeaders
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => ({ key: value, value: '' }));

    return entries.length ? entries : [this.createEmptyKeyValueEntry()];
  }

  protected collectConfigSnapshot(formValue: Omit<DatasourceConfigFormValue, 'hostEntries' | 'sshHostEntries' | 'headerEntries' | 'queryParamEntries'>): DatasourceConfigFormValue {
    const hostEntries = this.hostList.getRawValue().filter((entry) => entry.host || entry.port);
    const sshHostEntries = this.sshHostList.getRawValue().filter((entry) => entry.host || entry.port);
    const headerEntries = this.headerRows.getRawValue().filter((entry) => entry.key || entry.value);
    const queryParamEntries = this.queryParamRows.getRawValue().filter((entry) => entry.key || entry.value);

    const normalizedHeaders = headerEntries.length
      ? headerEntries.map((entry) => entry.key).filter(Boolean).join(', ')
      : formValue.headers;

    return {
      ...formValue,
      headers: normalizedHeaders,
      hostEntries,
      sshHostEntries,
      headerEntries,
      queryParamEntries,
    };
  }

}
