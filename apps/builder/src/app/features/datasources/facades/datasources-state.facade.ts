import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fromEvent, map, startWith } from 'rxjs';
import { QoToastService } from '@qo/ui-components';
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
import { ExternalApiSchemaFacade } from '@builder/features/datasources/facades/external-api-schema.facade';
import { DatasourcesI18nService } from '@builder/features/datasources/services/datasources-i18n.service';
import { DatasourcesPersistenceService } from '@builder/features/datasources/services/datasources-persistence.service';

import {
  DatasourceEditorForm,
  DatasourceSaveQueryForm,
  ExternalApiDynamicForm,
  ExternalApiMappingGroup,
  HostGroup,
  KeyValueGroup,
  SchemaFieldGroup,
} from '@builder/features/datasources/models/datasource-form-groups.types';


/**
 * State-owning base slice of DatasourcesFacadeService.
 * It is abstract so Angular never creates a second feature state holder.
 */
export abstract class DatasourcesStateFacadeSlice {
  protected abstract createConnectorOptions(): DatasourceConnectorOption[];
  abstract get schemaFields(): FormArray<SchemaFieldGroup>;

  protected readonly fb = inject(FormBuilder);
  protected readonly router = inject(Router);
  protected readonly toast = inject(QoToastService);
  protected readonly i18n = inject(DatasourcesI18nService);
  protected readonly queryRegistry = inject(QueryRegistryService);
  protected readonly externalApiSchemaService = inject(ExternalApiSchemaFacade);
  protected readonly persistence = inject(DatasourcesPersistenceService);
  protected readonly sourcesStorageKey = 'hrms_builder_datasources';
  protected readonly legacySourcesStorageKey = 'builder.datasources.sources';
  protected readonly externalApiConfigurationsStorageKey = 'external-api-configurations';
  protected hasInitializedSourcePersistence = false;

  protected notifySuccess(message: string, title: string): void {
    this.toast.success(message, title);
  }

  protected notifyWarning(message: string, title: string): void {
    this.toast.warning(message, title);
  }

  protected notifyInfo(message: string, title: string): void {
    this.toast.info(message, title);
  }

  protected notifyError(message: string, title: string): void {
    this.toast.error(message, title);
  }

  readonly section = signal<DatasourceSection>('sources');
  readonly workspace = signal<DatasourceWorkspace>('dashboard');
  readonly isViewportBlocked =
    typeof window !== 'undefined'
      ? toSignal(
          fromEvent(window, 'resize').pipe(
            startWith(null),
            map(() => window.innerWidth < 1024)
          ),
          { initialValue: window.innerWidth < 1024 }
        )
      : signal(false);
  readonly testingAll = signal(false);
  readonly runningQuery = signal(false);
  readonly savingSource = signal(false);
  readonly saveQueryModalOpen = signal(false);
  readonly datasourceSearch = signal('');
  readonly querySearchByDatasourceId = signal<Record<string, string>>({});
  readonly selectedConnectorId = signal<DatasourceConnectorId | null>(null);
  readonly selectedSourceId = signal<string | null>(null);
  readonly editingSourceId = signal<string | null>(null);
  readonly configMode = signal<'create' | 'edit'>('create');
  readonly queryTabs = signal<DatasourceEditorTab[]>([]);
  readonly activeQueryTabId = signal<string | null>(null);
  readonly resultTab = signal<DatasourceQueryResultTab>('Results');
  readonly configRuntimeTab = signal<DatasourceConfigRuntimeTab>('Response');
  readonly hasRunQuery = signal(false);
  readonly lastRunAtLabel = signal(this.i18n.translate('common.notRunYet'));
  readonly executedQueryText = signal('');
  readonly currentResultColumns = signal<string[]>([]);
  readonly currentResultRows = signal<DatasourceResultRow[]>([]);
  readonly schemaSourceId = signal<string | null>(null);
  readonly detailState = signal<{ source: DatasourceSourceRecord; query: DatasourceQueryRecord } | null>(null);

  readonly connectorOptions = signal<DatasourceConnectorOption[]>(this.createConnectorOptions());
  readonly sources = signal<DatasourceSourceRecord[]>([]);

  readonly configForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    connectionMethod: [this.i18n.translate('common.standard')],
    accessMode: [this.i18n.translate('common.readWrite')],
    useMongoUri: ['No'],
    mongoUri: [''],
    mongoConnectionType: [this.i18n.translate('common.directConnection')],
    host: [''],
    hostUrl: [''],
    port: [''],
    databaseName: [''],
    serviceName: [''],
    baseUrl: [''],
    endpointUrl: [''],
    timeout: ['5000'],
    headers: ['Authorization, Content-Type'],
    httpMethod: ['GET'],
    bodyType: ['NONE'],
    requestBody: [''],
    paginationMode: ['None'],
    paginationFieldOne: [''],
    paginationFieldTwo: [''],
    paginationFieldThree: [''],
    paginationFieldFour: [''],
    paginationFieldFive: [''],
    paginationFieldSix: [''],
    authentication: ['None' as DatasourceAuthMode],
    authenticationType: ['None' as DatasourceAuthMode],
    authDatabaseName: [''],
    username: [''],
    secret: [''],
    apiKeyLocation: ['Header'],
    apiKeyName: [''],
    bearerToken: [''],
    oauthClientId: [''],
    oauthClientSecret: [''],
    oauthTokenUrl: [''],
    oauthScope: [''],
    authorizationHeader: [''],
    sslMode: ['Default'],
    sslEnabled: [true],
    useCaCertificate: ['Disabled'],
    caCertificateFileName: [''],
    caCertificateBase64: [''],
    sendSignatureHeader: [false],
    useSelfSignedCertificate: [false],
    sshHost: [''],
    sshPort: ['22'],
    sshUsername: [''],
    sshKeyName: [''],
    region: ['ap-south-1'],
    accessKeyId: [''],
    secretAccessKey: [''],
    databaseNumber: ['0'],
    databaseUrl: [''],
    projectId: [''],
    serviceAccountCredentials: [''],
    accountName: [''],
    warehouse: [''],
    role: [''],
    authType: ['Basic'],
    privateKeyName: [''],
    privateKeyPassphrase: [''],
    configurationMethod: [this.i18n.translate('common.useFormProperties')],
    httpPath: [''],
    defaultCatalog: [''],
    defaultSchema: [''],
    personalAccessToken: [''],
    serverTimezoneOverride: [''],
    graphqlQuery: ['query Example { users { id name } }'],
    graphqlVariables: ['{\n  "limit": 10\n}'],
  });

  readonly hostList = this.fb.array<HostGroup>([]);
  readonly sshHostList = this.fb.array<HostGroup>([]);
  readonly headerRows = this.fb.array<KeyValueGroup>([]);
  readonly queryParamRows = this.fb.array<KeyValueGroup>([]);

  readonly editorForm: DatasourceEditorForm = this.fb.nonNullable.group({
    datasourceId: [''],
    queryTypeLabel: [this.i18n.translate('configSections.customQuery')],
    query: ['SELECT * FROM users LIMIT 10;'],
  });

  readonly saveQueryForm: DatasourceSaveQueryForm = this.fb.nonNullable.group({
    name: [this.i18n.translate('uiText.query1'), Validators.required],
    description: [''],
  });

  readonly schemaForm = this.fb.group({
    fields: this.fb.array<SchemaFieldGroup>([])
  });

  readonly selectedConnector = computed(() =>
    this.connectorOptions().find((option) => option.id === this.selectedConnectorId()) ?? null
  );
  readonly isEditingSource = computed(() => this.configMode() === 'edit' && this.editingSourceId() !== null);
  readonly isApiConnector = computed(() => this.selectedConnector()?.kind === 'api');
  readonly authMode = computed(() => this.configForm.controls.authentication.value);
  readonly schemaSource = computed(() =>
    this.sources().find((source) => source.id === this.schemaSourceId()) ?? null
  );
  readonly selectedSchemaCount = computed(() =>
    this.schemaFields.controls.filter((field) => field.controls.selected.value).length
  );
  readonly editorDatasourceOptions = computed(() =>
    this.sources().map((source) => ({ label: source.name, value: source.id }))
  );
  readonly responsePreview = computed(() =>
    this.hasRunQuery()
      ? JSON.stringify(
          {
            status: 'ok',
            query: this.executedQueryText(),
            columns: this.currentResultColumns(),
            rows: this.currentResultRows(),
          },
          null,
          2
        )
      : JSON.stringify({ status: 'idle', rows: [] }, null, 2)
  );
  readonly detailReference = computed<QueryReferenceRecord | null>(() => {
    const state = this.detailState();
    return state ? this.queryRegistry.getQueryById(state.query.id) : null;
  });
}
