import { Injectable } from '@angular/core';
import { ConnectorType } from '@qo/ui-components';
import { ExternalApiConfigurationValue } from '@builder/features/datasources/models/external-api-schemas';
import { ExternalApiConnector, ExternalApiEndpointRow, ExternalApiIntegration, ExternalApiStatus } from '@builder/features/datasources/models/external-apis.types';
import { ExternalApisConfigService } from '@builder/features/datasources/services/external-apis-config.service';

export interface IExternalApisFacade extends ExternalApisConfigService {}

@Injectable({ providedIn: 'root' })
export class ExternalApisFacadeService extends ExternalApisConfigService implements IExternalApisFacade {
  externalIntegrationTrack(integration: ExternalApiIntegration): string {
    return integration.id;
  }

  externalConnectorTrack(connector: ExternalApiConnector): string {
    return connector.id;
  }

  externalEndpointRows(integration: ExternalApiIntegration): ExternalApiEndpointRow[] {
    const savedConfiguration = this.configuration.load(
      integration.id,
      [integration.connectorId, this.externalStorageKeyFromName(integration.name)]
    );
    const savedEndpoint = savedConfiguration
      ? this.createExternalResourceFromConfiguration(savedConfiguration)
      : null;

    return integration.endpoints.map((endpoint, index) => ({
      resource: endpoint.resourceName,
      method: endpoint.httpMethod,
      mappedFields: this.externalMappedFields(endpoint, index === 0 ? savedEndpoint : null),
      syncMode: endpoint.syncMode,
      usage: endpoint.usage,
    }));
  }

  private externalMappedFields(
    endpoint: ExternalApiIntegration['endpoints'][number],
    savedEndpoint: ExternalApiIntegration['endpoints'][number] | null
  ): string {
    const endpoints = savedEndpoint ? [endpoint, savedEndpoint] : [endpoint];
    const fields = [
      ...endpoints.flatMap((item) =>
        item.fieldMappings.map((mapping) => mapping.internalField || mapping.externalField)
      ),
      ...endpoints.flatMap((item) =>
        item.advancedOptions.responseMappings.map((mapping) => mapping.targetField || mapping.responsePath)
      ),
      ...endpoints.flatMap((item) =>
        item.advancedOptions.requestHeaders.map((mapping) => mapping.key || mapping.value)
      ),
    ]
      .map((field) => field.trim())
      .filter(Boolean);

    return [...new Set(fields)].join(', ') || '-';
  }

  visibleExternalEndpointRows(integration: ExternalApiIntegration): ExternalApiEndpointRow[] {
    const query = this.externalDetailSearchValue(integration.id).trim().toLowerCase();
    const rows = this.externalEndpointRows(integration);
    if (!query) {
      return rows;
    }

    return rows.filter((row) =>
      [row.resource, row.method, row.mappedFields, row.syncMode, row.usage].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }

  externalDetailSearchValue(integrationId: string): string {
    return this.externalDetailSearch()[integrationId] ?? '';
  }

  setExternalDetailSearch(integrationId: string, value: unknown): void {
    const nextValue = String(value ?? '');
    this.externalDetailSearch.update((current) => ({
      ...current,
      [integrationId]: nextValue,
    }));
  }

  clearExternalDetailSearch(integrationId: string): void {
    this.externalDetailSearch.update((current) => {
      if (!(integrationId in current)) {
        return current;
      }

      const next = { ...current };
      delete next[integrationId];
      return next;
    });
  }

  externalDetailHeading(integration: ExternalApiIntegration): string {
    return this.i18n.translate('externalApis.detailHeading', {
      name: integration.name.toUpperCase(),
      count: this.externalEndpointRows(integration).length,
    });
  }

  externalDetailHeadingLabel(integration: ExternalApiIntegration): string {
    return this.externalDetailHeading(integration);
  }

  externalConnectorIconType(id: string): ConnectorType {
    if (id === 'googleSheets') {
      return 'google_sheets';
    }

    return id as ConnectorType;
  }

  externalStatusColor(status: ExternalApiStatus): 'success' | 'warning' | 'danger' | 'default' {
    if (status === 'Connected') {
      return 'success';
    }
    if (status === 'Expired Token') {
      return 'warning';
    }
    if (status === 'Error') {
      return 'danger';
    }
    return 'default';
  }

  onExternalSearch(value: unknown): void {
    this.externalApiSearch.set(String(value ?? ''));
  }

  onExternalCategory(value: unknown): void {
    this.externalCategoryFilter.set(String(value ?? this.i18n.translate('common.allCategories')));
  }

  onExternalStatus(value: unknown): void {
    this.externalStatusFilter.set(String(value ?? this.i18n.translate('common.allStatus')));
  }

  onConnectorSearch(value: unknown): void {
    this.connectorSearch.set(String(value ?? ''));
  }

  showExternalDashboard(): void {
    this.externalConfigReady.set(false);
    this.externalWorkspace.set('dashboard');
    this.selectedExternalConnector.set(null);
    this.responsePreview.set('');
    this.editingIntegration.set(null);
    this.externalFormSchema.set(null);
    this.externalDynamicForm.set(null);
    this.externalActiveMappingTab.set('requestMappings');
    this.externalFormValue.set({});
  }

  showExternalConnectors(): void {
    this.externalConfigReady.set(false);
    this.externalWorkspace.set('connectors');
    this.connectorSearch.set('');
    this.responsePreview.set('');
    this.editingIntegration.set(null);
    this.externalFormSchema.set(null);
    this.externalDynamicForm.set(null);
    this.externalActiveMappingTab.set('requestMappings');
    this.externalFormValue.set({});
  }

  selectExternalConnector(connector: ExternalApiConnector): void {
    this.selectedExternalConnector.set(connector);
    this.responsePreview.set('');
    this.editingIntegration.set(null);
    this.prepareExternalSetup(() => {
      this.configureExternalDynamicForm(connector.id, this.createBlankExternalConfiguration(connector.id));
    });
  }

  private createBlankExternalConfiguration(connectorId: string): ExternalApiConfigurationValue {
    const schema = this.externalApiSchemaService.schema(connectorId);
    if (!schema) {
      return {};
    }

    const configuration: ExternalApiConfigurationValue = {};

    for (const section of schema.sections) {
      for (const field of section.fields) {
        if (field.type === 'mappingList') {
          configuration[field.key] = [{ sourcePath: '', targetField: '', fieldType: 'Text', required: false }];
          continue;
        }

        if (field.type === 'toggle' || field.type === 'checkbox') {
          configuration[field.key] = typeof field.defaultValue === 'boolean' ? field.defaultValue : false;
          continue;
        }

        if (field.type === 'select') {
          configuration[field.key] =
            typeof field.defaultValue === 'string' ||
            typeof field.defaultValue === 'number' ||
            typeof field.defaultValue === 'boolean'
              ? field.defaultValue
              : field.options?.[0]?.value ?? '';
          continue;
        }

        configuration[field.key] = '';
      }
    }

    return configuration;
  }

  editExternalIntegration(integration: ExternalApiIntegration): void {
    const selectedIntegration =
      this.externalIntegrations().find((item) => item.id === integration.id) ?? integration;
    const connector =
      this.externalConnectors().find((item) => item.id === selectedIntegration.connectorId) ??
      this.externalConnectors().find((item) => item.name === selectedIntegration.name);

    if (!connector) {
      this.notifyError(
        this.i18n.translate('externalApis.externalConnectorNotFound'),
        this.i18n.translate('externalApis.edit')
      );
      return;
    }

    this.editingIntegration.set(selectedIntegration);
    this.selectedExternalConnector.set(connector);
    this.responsePreview.set('');
    this.prepareExternalSetup(() => {
      const storedConfiguration = this.configuration.load(
        selectedIntegration.id,
        this.externalConfigurationStorageKeys(selectedIntegration, connector, integration)
      );
      this.configureExternalDynamicForm(
        connector.id,
        this.mergeExternalApiConfigurationValues(
          this.externalConfigurationFromIntegration(selectedIntegration),
          storedConfiguration
        )
      );
    });
  }

  private externalConfigurationStorageKeys(
    selectedIntegration: ExternalApiIntegration,
    connector: ExternalApiConnector,
    requestedIntegration: ExternalApiIntegration
  ): string[] {
    return [
      connector.id,
      selectedIntegration.connectorId,
      requestedIntegration.connectorId,
      this.externalStorageKeyFromName(connector.name),
      this.externalStorageKeyFromName(selectedIntegration.name),
      this.externalStorageKeyFromName(requestedIntegration.name),
    ].filter((key, index, keys): key is string => !!key && keys.indexOf(key) === index);
  }

  private externalStorageKeyFromName(name: string): string {
    return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  cancelExternalSetup(): void {
    if (this.editingIntegration()) {
      this.showExternalDashboard();
      return;
    }

    this.showExternalConnectors();
  }

  testAllExternalApis(): void {
    this.notifySuccess(
      this.i18n.translate('externalApis.allIntegrationsTested'),
      this.i18n.translate('externalApis.externalApisTitle')
    );
  }

  testExternalIntegration(integration: ExternalApiIntegration): void {
    if (!integration.active) {
      this.notifyWarning(
        this.i18n.translate('externalApis.inactiveActivateBeforeTesting', { name: integration.name }),
        this.i18n.translate('externalApis.test')
      );
      return;
    }
    if (integration.status === 'Not Connected') {
      this.notifyWarning(
        this.i18n.translate('externalApis.notConnectedYet', { name: integration.name }),
        this.i18n.translate('externalApis.test')
      );
      return;
    }
    this.notifySuccess(
      this.i18n.translate('externalApis.testedSuccessfully', { name: integration.name }),
      this.i18n.translate('externalApis.test')
    );
  }

  testExternalConnection(): void {
    const value = this.currentExternalConfiguration();
    const name = this.configText(value, 'connectionName', this.selectedExternalConnector()?.name || 'Integration');
    this.responsePreview.set(`HTTP/1.1 200 OK\n{\n  "success": true,\n  "message": "${name} connected successfully"\n}`);
    this.notifySuccess(
      this.i18n.translate('externalApis.connectionTestedSuccessfully'),
      this.i18n.translate('externalApis.testConfiguration')
    );
  }

  saveExternalConnection(): void {
    const form = this.externalDynamicForm();
    form?.markAllAsTouched();
    if (!form || form.invalid || !this.selectedExternalConnector()) {
      return;
    }

    const connector = this.selectedExternalConnector()!;
    const value = this.currentExternalConfiguration();
    const editing = this.editingIntegration();

    if (editing) {
      this.configuration.save(editing.id, value, connector.id);
      this.externalIntegrations.update((integrations) =>
        integrations.map((integration) =>
          integration.id === editing.id
            ? this.createExternalIntegrationFromForm(editing.id, connector, {
                ...integration,
                lastSync: this.i18n.translate('common.justNow'),
              })
            : integration
        )
      );
      this.showExternalDashboard();
      this.notifySuccess(
        this.i18n.translate('externalApis.updatedSuccessfully', {
          name: this.configText(value, 'connectionName', editing.name),
        }),
        this.i18n.translate('externalApis.saveChanges')
      );
      return;
    }

    const id = `${connector.id}-${Date.now()}`;
    this.configuration.save(id, value, connector.id);
    this.externalIntegrations.update((integrations) => [
      this.createExternalIntegrationFromForm(id, connector, { lastSync: this.i18n.translate('common.justNow') }),
      ...integrations,
    ]);
    this.showExternalDashboard();
    this.notifySuccess(
      this.i18n.translate('externalApis.savedSuccessfully', {
        name: this.configText(value, 'connectionName', connector.name),
      }),
      this.i18n.translate('externalApis.save')
    );
  }

  onExternalDynamicFormValue(value: ExternalApiConfigurationValue): void {
    this.externalFormValue.set(value);
  }

  toggleExternalExpansion(integrationId: string): void {
    this.externalIntegrations.update((integrations) =>
      integrations.map((integration) =>
        integration.id === integrationId ? { ...integration, expanded: !integration.expanded } : integration
      )
    );
  }

  toggleExternalIntegrationActive(integrationId: string): void {
    let integrationName = 'Integration';
    let nextActive = true;

    this.externalIntegrations.update((integrations) =>
      integrations.map((integration) => {
        if (integration.id !== integrationId) {
          return integration;
        }

        integrationName = integration.name;
        nextActive = !integration.active;
        return { ...integration, active: nextActive };
      })
    );

    this.notifySuccess(
      this.i18n.translate(nextActive ? 'externalApis.markedActive' : 'externalApis.markedInactive', {
        name: integrationName,
      }),
      this.i18n.translate('externalApis.metricStatus')
    );
  }

  syncExternalIntegration(integrationId: string): void {
    let syncedName = 'Integration';
    this.externalIntegrations.update((integrations) =>
      integrations.map((integration) => {
        if (integration.id !== integrationId) {
          return integration;
        }
        syncedName = integration.name;
        return { ...integration, status: 'Connected', lastSync: this.i18n.translate('common.justNow') };
      })
    );
    this.notifySuccess(
      this.i18n.translate('externalApis.syncedSuccessfully', { name: syncedName }),
      this.i18n.translate('externalApis.sync')
    );
  }

  deleteExternalIntegration(integration: ExternalApiIntegration): void {
    this.externalIntegrations.update((integrations) => integrations.filter((item) => item.id !== integration.id));
    this.notifySuccess(
      this.i18n.translate('externalApis.deleted', { name: integration.name }),
      this.i18n.translate('externalApis.delete')
    );
  }
}

