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

import { DatasourcesExternalHelpersService } from '@builder/features/datasources/services/datasources-external-helpers.service';

export abstract class DatasourcesStorageService extends DatasourcesExternalHelpersService {
  protected createDatasourceId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `source-${Date.now()}`;
  }

  protected serializeSourceForStorage(source: DatasourceSourceRecord): Record<string, unknown> {
    const snapshot = source.configSnapshot;
    const storedFields = this.buildStoredSourceFields(snapshot);

    return {
      ...source,
      type: source.connectorId,
      datasourceName: snapshot.name || source.name,
      datasourceType: source.connectorId,
      ...storedFields,
      password: storedFields.password || '',
      secret: storedFields.password || '',
      desc: source.subtitle,
    };
  }

  protected hydrateStoredSource(source: DatasourceSourceRecord & Record<string, unknown>): DatasourceSourceRecord {
    const connector = this.connectorOptions().find((item) => item.id === source.connectorId) ?? null;
    const defaults = this.getConfigDefaults(connector);
    const snapshot = source.configSnapshot as Partial<DatasourceConfigFormValue> | undefined;

    const hostAddress = String(source.hostAddress ?? source.host ?? '');
    const baseUrl = String(source.baseUrl ?? source.endpointUrl ?? '');
    const rawHeaders = source.headers;
    const headerEntriesFromStorage = Array.isArray(rawHeaders)
      ? rawHeaders.filter((entry): entry is DatasourceKeyValueEntry => !!entry && typeof entry === 'object')
      : [];

    const normalizedSnapshot: DatasourceConfigFormValue = {
      ...defaults,
      ...snapshot,
      name: String(snapshot?.name ?? source.datasourceName ?? source.name ?? defaults.name),
      connectionMethod: String(snapshot?.connectionMethod ?? source.connectionMethod ?? defaults.connectionMethod),
      accessMode: String(snapshot?.accessMode ?? source.connectionMode ?? defaults.accessMode),
      host: String(snapshot?.host ?? hostAddress ?? defaults.host),
      hostUrl: String(snapshot?.hostUrl ?? hostAddress ?? defaults.hostUrl),
      mongoUri: String(snapshot?.mongoUri ?? hostAddress ?? defaults.mongoUri),
      baseUrl: String(snapshot?.baseUrl ?? baseUrl ?? defaults.baseUrl),
      endpointUrl: String(snapshot?.endpointUrl ?? baseUrl ?? defaults.endpointUrl),
      port: String(snapshot?.port ?? source.port ?? defaults.port),
      databaseName: String(snapshot?.databaseName ?? source.databaseName ?? defaults.databaseName),
      username: String(snapshot?.username ?? source.username ?? defaults.username),
      secret: String(snapshot?.secret ?? source.password ?? source.secret ?? defaults.secret),
      sslMode: String(snapshot?.sslMode ?? source.sslMode ?? defaults.sslMode),
      authenticationType: String(snapshot?.authenticationType ?? source.authType ?? defaults.authenticationType) as DatasourceAuthMode,
      authType: String(snapshot?.authType ?? source.authType ?? defaults.authType),
      headers: snapshot?.headers ?? (typeof rawHeaders === 'string' ? rawHeaders : defaults.headers),
      headerEntries:
        snapshot?.headerEntries?.length
          ? snapshot.headerEntries
          : headerEntriesFromStorage.length
            ? headerEntriesFromStorage
            : defaults.headerEntries,
      hostEntries: snapshot?.hostEntries?.length ? snapshot.hostEntries : defaults.hostEntries,
      sshHostEntries: snapshot?.sshHostEntries?.length ? snapshot.sshHostEntries : defaults.sshHostEntries,
      queryParamEntries: snapshot?.queryParamEntries?.length ? snapshot.queryParamEntries : defaults.queryParamEntries,
    };

    return {
      ...source,
      connectorId: (source.connectorId ?? source.type ?? source.datasourceType) as DatasourceConnectorId,
      name: normalizedSnapshot.name || source.name,
      subtitle: String(source.subtitle ?? source.desc ?? ''),
      connectionMethod: normalizedSnapshot.connectionMethod,
      connectionMode: normalizedSnapshot.accessMode,
      hostAddress: normalizedSnapshot.host || normalizedSnapshot.mongoUri || normalizedSnapshot.baseUrl || normalizedSnapshot.endpointUrl || '',
      baseUrl: normalizedSnapshot.baseUrl || normalizedSnapshot.endpointUrl || '',
      port: normalizedSnapshot.port,
      databaseName: normalizedSnapshot.databaseName,
      username: normalizedSnapshot.username,
      password: normalizedSnapshot.secret,
      sslMode: normalizedSnapshot.sslMode,
      authType: normalizedSnapshot.authenticationType || normalizedSnapshot.authType,
      headers: normalizedSnapshot.headerEntries?.length ? normalizedSnapshot.headerEntries : normalizedSnapshot.headers,
      configSnapshot: normalizedSnapshot,
    };
  }

  protected createInitialSources(): DatasourceSourceRecord[] {
    const fieldMappings = this.createFieldMappings();
    const connectors = this.createConnectorOptions();
    const configFor = (connectorId: DatasourceConnectorId, overrides: Partial<DatasourceConfigFormValue>): DatasourceConfigFormValue => ({
      ...this.getConfigDefaults(connectors.find((connector) => connector.id === connectorId) ?? null),
      ...overrides,
    });
    return [
      {
        id: 'qo-hrms-prod',
        connectorId: 'postgresql',
        status: 'healthy',
        name: 'qo_hrms_prod',
        subtitle: this.i18n.translate('uiText.production14TablesPublicSchema'),
        active: true,
        metrics: { availability: '99.9%', p95: '88ms', rpm: '1,240', errors: '0.1%', auth: 'OK', jobs: '12/12', eps: '14 EPs' },
        configSnapshot: configFor('postgresql', {
          name: 'qo_hrms_prod',
          connectionMethod: this.i18n.translate('common.standard'),
          accessMode: this.i18n.translate('common.readWrite'),
          host: 'localhost',
          port: '5432',
          databaseName: 'hrms',
          username: 'postgres',
          secret: '',
          sslMode: 'Default',
        }),
        expanded: false,
        fieldMappings,
        queries: [
          {
            id: 'employee-directory',
            name: 'Employee Directory',
            method: 'SELECT',
            query: 'SELECT * FROM employees LIMIT 50;',
            active: true,
            calls: '920',
            p50: '35ms',
            p95: '140ms',
            errorRate: '0.0%',
            retries: '0',
            authHealthy: true,
            accessCount: '88',
          }
        ]
      },
      {
        id: 'attendance-api',
        connectorId: 'rest_api',
        status: 'warning',
        name: 'Attendance API',
        subtitle: 'https://api.attendance.co/v2 - 8 endpoints',
        active: false,
        metrics: { availability: '98.2%', p95: '220ms', rpm: '2,180', errors: '1.2%', auth: 'Expired', jobs: '8/10', eps: '8 EPs' },
        configSnapshot: configFor('rest_api', {
          name: 'Attendance API',
          httpMethod: 'GET',
          baseUrl: 'https://api.attendance.co',
          endpointUrl: '/v2/attendance',
          timeout: '5000',
          paginationMode: 'Offset / Limit',
        }),
        expanded: false,
        fieldMappings,
        queries: [
          {
            id: 'attendance-feed',
            name: 'Attendance Feed',
            method: 'GET',
            query: 'GET /attendance',
            active: true,
            calls: '1,240',
            p50: '66ms',
            p95: '220ms',
            errorRate: '1.2%',
            retries: '3',
            authHealthy: false,
            accessCount: '92',
          }
        ]
      },
      {
        id: 'analytics-store',
        connectorId: 'mongodb',
        status: 'healthy',
        name: 'Analytics Store',
        subtitle: 'cluster0.mongodb.net - events, logs, metrics',
        active: true,
        metrics: { availability: '100%', p95: '55ms', rpm: '340', errors: '0.0%', auth: 'OK', jobs: '6/6', eps: '6 EPs' },
        configSnapshot: configFor('mongodb', {
          name: 'Analytics Store',
          useMongoUri: 'Yes',
          mongoUri: 'mongodb+srv://cluster0.mongodb.net',
          mongoConnectionType: this.i18n.translate('common.directConnection'),
          databaseName: 'analytics',
          authenticationType: 'SCRAM-SHA-256',
          authDatabaseName: 'admin',
          username: 'analytics_reader',
          secret: '',
          port: '27017',
        }),
        expanded: false,
        fieldMappings,
        queries: [
          {
            id: 'usage-rollup',
            name: 'Usage Rollup',
            method: 'FIND',
            query: 'db.events.find({}).limit(10)',
            active: true,
            calls: '340',
            p50: '24ms',
            p95: '55ms',
            errorRate: '0.0%',
            retries: '0',
            authHealthy: true,
            accessCount: '44',
          }
        ]
      },
    ];
  }

  protected normalizeSearchValue(value: string): string {
    return value.trim().toLowerCase();
  }

  protected searchHaystack(parts: Array<string | undefined>): string {
    return parts
      .map((part) => String(part ?? '').toLowerCase())
      .join(' ');
  }
}
