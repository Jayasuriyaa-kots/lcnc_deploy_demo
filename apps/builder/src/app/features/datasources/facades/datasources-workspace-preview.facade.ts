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

import { DatasourcesStateFacadeSlice } from '@builder/features/datasources/facades/datasources-state.facade';

export abstract class DatasourcesWorkspacePreviewFacadeSlice extends DatasourcesStateFacadeSlice {
  abstract showRestFields(): boolean;
  abstract showGraphqlFields(): boolean;
  abstract showArangoCertificateUpload(): boolean;

  readonly configResponsePreview = computed(() => {
    const connector = this.selectedConnector();
    const value = this.configForm.getRawValue();

    if (!connector) {
      return JSON.stringify({ status: 'idle' }, null, 2);
    }

    if (connector.kind === 'api') {
      return JSON.stringify(
        {
          datasource: value.name || connector.label,
          connector: connector.label,
          method: value.httpMethod || 'GET',
          endpoint: value.endpointUrl || value.baseUrl || '',
          status: 'preview',
          bodyType: value.bodyType || 'NONE',
        },
        null,
        2
      );
    }

    return JSON.stringify(
      {
        datasource: value.name || connector.label,
        connector: connector.label,
        host: value.host || value.hostUrl || value.mongoUri || '',
        database: value.databaseName || value.defaultSchema || '',
        status: 'preview',
      },
      null,
      2
    );
  });
  readonly configHeadersPreview = computed(() =>
    JSON.stringify(
      this.headerRows.controls
        .map((group) => ({
          key: group.controls.key.value,
          value: group.controls.value.value,
        }))
        .filter((row) => row.key || row.value),
      null,
      2
    )
  );
  readonly configLogsPreview = computed(() => {
    const connector = this.selectedConnector();
    const value = this.configForm.getRawValue();

    return [
      `[info] connector=${connector?.label ?? 'n/a'}`,
      `[info] datasource=${value.name || 'unsaved datasource'}`,
      `[info] runtime=preview`,
      `[info] auth=${value.authenticationType || value.authType || 'None'}`,
    ].join('\n');
  });
  readonly configLinterPreview = computed(() => {
    const value = this.configForm.getRawValue();
    const issues: string[] = [];

    if (!value.name.trim()) {
      issues.push(this.i18n.translate('messages.datasourceNameRequired'));
    }
    if (this.showRestFields() && !value.endpointUrl.trim()) {
      issues.push(this.i18n.translate('messages.endpointUrlRequiredForApi'));
    }
    if (this.showGraphqlFields() && !value.graphqlQuery.trim()) {
      issues.push(this.i18n.translate('messages.graphqlQueryRequired'));
    }
    if (this.showArangoCertificateUpload() && !value.caCertificateFileName.trim()) {
      issues.push(this.i18n.translate('messages.caCertificateRequiredForUpload'));
    }

    return issues.length ? issues.join('\n') : this.i18n.translate('messages.noLinterIssues');
  });
  readonly configStatePreview = computed(() =>
    JSON.stringify(
      {
        isLoading: this.runningQuery() || this.savingSource(),
        data: this.hasRunQuery() ? this.currentResultRows() : [],
        responseMeta: {
          connectorId: this.selectedConnectorId(),
          workspace: this.workspace(),
          hasHeaders: this.headerRows.controls.some((group) => group.controls.key.value || group.controls.value.value),
          hasQueryParams: this.queryParamRows.controls.some((group) => group.controls.key.value || group.controls.value.value),
          authMode: this.configForm.controls.authenticationType.value || this.configForm.controls.authType.value,
          paginationMode: this.configForm.controls.paginationMode.value,
        },
        'run()': 'Trigger the current datasource configuration preview.',
        'clear()': 'Reset the current runtime preview state.',
      },
      null,
      2
    )
  );
  readonly activeEditorTab = computed(() =>
    this.queryTabs().find((tab) => tab.id === this.activeQueryTabId()) ?? null
  );
  readonly selectedEditorSource = computed(() =>
    this.sources().find((source) => source.id === this.selectedSourceId()) ?? null
  );
  readonly activeEditorQuery = computed(() => {
    const activeTab = this.activeEditorTab();
    const source = this.selectedEditorSource();

    if (!activeTab?.existingQueryId || !source) {
      return null;
    }

    return source.queries.find((query) => query.id === activeTab.existingQueryId) ?? null;
  });
  readonly canRunActiveQuery = computed(() => {
    const source = this.selectedEditorSource();
    const existingQuery = this.activeEditorQuery();

    if (!source?.active) {
      return false;
    }

    return existingQuery?.active ?? true;
  });

  readonly accessModeOptions = [
    { label: this.i18n.translate('common.readWrite'), value: this.i18n.translate('common.readWrite') },
    { label: this.i18n.translate('common.readOnly'), value: 'Read Only' },
  ];

  readonly connectionMethodOptions = [
    { label: this.i18n.translate('common.standard'), value: this.i18n.translate('common.standard') },
    { label: this.i18n.translate('common.sshTunnel'), value: 'SSH Tunnel' },
  ];

  readonly yesNoOptions = [
    { label: this.i18n.translate('uiText.yes'), value: 'Yes' },
    { label: this.i18n.translate('uiText.no'), value: 'No' },
  ];

  readonly mongoConnectionTypeOptions = [
    { label: this.i18n.translate('common.directConnection'), value: this.i18n.translate('common.directConnection') },
    { label: this.i18n.translate('uiText.replicaSet'), value: 'Replica Set' },
    { label: this.i18n.translate('uiText.sRVConnection'), value: 'SRV Connection' },
  ];

  readonly authOptions = [
    { label: this.i18n.translate('uiText.none'), value: 'None' },
    { label: this.i18n.translate('uiText.bearerToken2'), value: 'Bearer Token' },
    { label: this.i18n.translate('uiText.aPIKey'), value: 'API Key' },
    { label: this.i18n.translate('uiText.basicAuth'), value: 'Basic Auth' },
    { label: this.i18n.translate('uiText.oAuth'), value: 'OAuth' },
  ];

  readonly generalAuthenticationOptions = [
    { label: this.i18n.translate('uiText.none'), value: 'None' },
    { label: this.i18n.translate('uiText.basic'), value: 'Basic' },
    { label: this.i18n.translate('uiText.oAuth20'), value: 'OAuth 2.0' },
    { label: this.i18n.translate('uiText.aPIKey'), value: 'API Key' },
    { label: this.i18n.translate('uiText.bearerToken2'), value: 'Bearer Token' },
  ];

  readonly snowflakeAuthOptions = [
    { label: this.i18n.translate('uiText.basic'), value: 'Basic' },
    { label: this.i18n.translate('uiText.keyPair'), value: 'Key Pair' },
  ];

  readonly mongoAuthOptions = [
    { label: this.i18n.translate('uiText.sCRAMSHA1'), value: 'SCRAM-SHA-1' },
    { label: this.i18n.translate('uiText.sCRAMSHA256'), value: 'SCRAM-SHA-256' },
    { label: this.i18n.translate('uiText.mONGODBCR'), value: 'MONGODB-CR' },
    { label: this.i18n.translate('uiText.x509'), value: 'X.509' },
  ];

  readonly sslModeOptions = [
    { label: this.i18n.translate('uiText.defaultOption'), value: 'Default' },
    { label: this.i18n.translate('uiText.disable'), value: 'Disable' },
    { label: this.i18n.translate('uiText.require'), value: 'Require' },
    { label: this.i18n.translate('uiText.verifyCA'), value: 'Verify CA' },
    { label: this.i18n.translate('uiText.verifyFull'), value: 'Verify Full' },
  ];

  readonly redisSslModeOptions = [
    { label: this.i18n.translate('uiText.disabled'), value: 'Disabled' },
    { label: this.i18n.translate('uiText.enabled'), value: 'Enabled' },
  ];

  readonly mssqlSslModeOptions = [
    { label: this.i18n.translate('uiText.enabledWithNoVerify'), value: 'Enabled with no verify' },
    { label: this.i18n.translate('uiText.enabled'), value: 'Enabled' },
    { label: this.i18n.translate('uiText.disabled'), value: 'Disabled' },
  ];

  readonly arangoSslModeOptions = [
    { label: this.i18n.translate('uiText.defaultOption'), value: 'Default' },
    { label: this.i18n.translate('uiText.enabled'), value: 'Enabled' },
    { label: this.i18n.translate('uiText.disabled'), value: 'Disabled' },
  ];

  readonly oracleSslModeOptions = [
    { label: this.i18n.translate('uiText.disable'), value: 'Disable' },
    { label: this.i18n.translate('uiText.tLS'), value: 'TLS' },
  ];

  readonly caCertificateOptions = [
    { label: this.i18n.translate('uiText.disabled'), value: 'Disabled' },
    { label: this.i18n.translate('uiText.uploadFile'), value: 'Upload File' },
    { label: this.i18n.translate('uiText.base64String'), value: 'Base64 String' },
  ];

  readonly httpMethodOptions = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((value) => ({ label: value, value }));

  readonly graphqlMethodOptions = [
    { label: this.i18n.translate('uiText.pOST'), value: 'POST' },
    { label: this.i18n.translate('uiText.gET'), value: 'GET' },
  ];

  readonly bodyTypeOptions = [
    'NONE',
    'JSON',
    'FORM_URLENCODED',
    'MULTIPART_FORM_DATA',
    'BINARY',
    'RAW',
  ].map((value) => ({ label: value, value }));

  readonly restPaginationOptions = [
    { label: this.i18n.translate('uiText.none'), value: 'None' },
    { label: this.i18n.translate('uiText.paginateWithTablePageNumber'), value: 'Paginate with Table Page Number' },
    { label: this.i18n.translate('uiText.paginateUsingLimitAndOffset'), value: 'Paginate using Limit and Offset' },
    { label: this.i18n.translate('uiText.paginateUsingCursor'), value: 'Paginate using Cursor' },
    { label: this.i18n.translate('uiText.paginateWithResponseURL'), value: 'Paginate with Response URL' },
  ];

  readonly graphqlPaginationOptions = [
    { label: this.i18n.translate('uiText.none'), value: 'None' },
    { label: this.i18n.translate('uiText.limitAndOffset'), value: 'Limit and Offset' },
    { label: this.i18n.translate('uiText.cursorPagination'), value: 'Cursor Pagination' },
  ];

  readonly awsRegionOptions = ['ap-south-1', 'us-east-1', 'us-west-2', 'eu-central-1', 'ap-southeast-1'].map((value) => ({
    label: value,
    value,
  }));

  readonly databricksConfigurationMethodOptions = [
    { label: this.i18n.translate('common.useFormProperties'), value: this.i18n.translate('common.useFormProperties') },
  ];

  readonly apiKeyLocationOptions = [
    { label: this.i18n.translate('uiText.header'), value: 'Header' },
    { label: this.i18n.translate('uiText.queryParameter'), value: 'Query Parameter' },
  ];

  readonly queryTypeOptions = [
    { label: this.i18n.translate('configSections.customQuery'), value: this.i18n.translate('configSections.customQuery') },
  ];

  readonly fieldTypeOptions = [
    'Text',
    'Name',
    'Email',
    'Number',
    'Date',
    'Drop Down',
    'Checkbox',
    'Phone',
    'Currency',
  ].map((value) => ({ label: value, value }));

  get schemaFields(): FormArray<SchemaFieldGroup> {
    return this.schemaForm.controls.fields;
  }

}
