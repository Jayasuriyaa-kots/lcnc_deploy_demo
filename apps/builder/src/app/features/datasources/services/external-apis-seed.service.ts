import { ExternalApiConfigurationValue, ExternalApiConnectorSchema } from '@builder/features/datasources/models/external-api-schemas';
import { ExternalApiAuth, ExternalApiCategory, ExternalApiConnector, ExternalApiFieldMapping, ExternalApiIntegration, ExternalApiKeyValuePair, ExternalApiResourceConfig, ExternalApiResponseMapping, ExternalApiStatus } from '@builder/features/datasources/models/external-apis.types';
import { ExternalApisStateFacadeSlice } from '@builder/features/datasources/facades/external-apis-state.facade';

export abstract class ExternalApisSeedService extends ExternalApisStateFacadeSlice {
  protected abstract mergeExternalApiConfigurationValues(base: ExternalApiConfigurationValue, overlay: ExternalApiConfigurationValue | null): ExternalApiConfigurationValue;
  protected abstract externalConfigurationFromIntegration(integration: ExternalApiIntegration): ExternalApiConfigurationValue;
  protected abstract configText(value: ExternalApiConfigurationValue, key: string, fallback?: string): string;
  protected abstract configStatus(value: ExternalApiConfigurationValue, fallback: ExternalApiStatus): ExternalApiStatus;
  protected abstract configAuth(value: ExternalApiConfigurationValue, fallback: ExternalApiAuth): ExternalApiAuth;
  protected abstract createExternalResourceFromConfiguration(value: ExternalApiConfigurationValue): ExternalApiResourceConfig | null;
  protected defaultExternalIntegrations(): ExternalApiIntegration[] {
    return this.externalApiSchemaService
      .connectors()
      .map((connector) =>
        this.createExternalIntegrationSeed(connector.key, this.externalSeedOverrides(connector))
      );
  }

  protected externalConnectorById(connectorId: string): ExternalApiConnector | undefined {
    return this.externalConnectors().find((item) => item.id === connectorId);
  }

  protected externalSchemaAuthById(connectorId: string): ExternalApiAuth {
    const schemaConnector = this.externalApiSchemaService.connector(connectorId);
    const auth = schemaConnector ? this.externalSchemaAuth(schemaConnector).trim() : '';
    return (auth || 'OAuth 2.0') as ExternalApiAuth;
  }

  protected externalSchemaAuth(connector: ExternalApiConnectorSchema): string {
    const authField = connector.schema.sections
      .flatMap((section) => section.fields)
      .find((field) => field.key === 'authenticationType');

    if (typeof authField?.defaultValue === 'string' && authField.defaultValue.trim()) {
      return authField.defaultValue.trim();
    }

    const firstOption = authField?.options?.[0];
    if (firstOption) {
      return String(firstOption.value ?? firstOption.label ?? connector.defaultAuth);
    }

    return connector.defaultAuth;
  }

  protected externalSeedOverrides(connector: ExternalApiConnectorSchema): Partial<ExternalApiIntegration> {
    const seed = connector.seed ?? {};
    const rawEndpoints = seed['endpoints'];

    return {
      active: typeof seed['active'] === 'boolean' ? seed['active'] : true,
      name: typeof seed['name'] === 'string' && seed['name'].trim() ? seed['name'].trim() : connector.name,
      category:
        typeof seed['category'] === 'string' && seed['category'].trim()
          ? (seed['category'].trim() as ExternalApiCategory)
          : (connector.category as ExternalApiCategory),
      status:
        typeof seed['status'] === 'string' && seed['status'].trim()
          ? (seed['status'].trim() as ExternalApiStatus)
          : undefined,
      auth:
        typeof seed['auth'] === 'string' && seed['auth'].trim()
          ? (seed['auth'].trim() as ExternalApiAuth)
          : this.externalSchemaAuthById(connector.key),
      lastSync:
        typeof seed['lastSync'] === 'string' && seed['lastSync'].trim() ? seed['lastSync'].trim() : undefined,
      usedIn:
        typeof seed['usedIn'] === 'string' && seed['usedIn'].trim() ? seed['usedIn'].trim() : undefined,
      logo: typeof seed['logo'] === 'string' && seed['logo'].trim() ? seed['logo'].trim() : connector.logo,
      clientIdOrApiKey:
        typeof seed['clientIdOrApiKey'] === 'string' ? seed['clientIdOrApiKey'] : '',
      clientSecretOrToken:
        typeof seed['clientSecretOrToken'] === 'string' ? seed['clientSecretOrToken'] : '',
      redirectUrl:
        typeof seed['redirectUrl'] === 'string' && seed['redirectUrl'].trim()
          ? seed['redirectUrl'].trim()
          : undefined,
      workspaceTenantDomain:
        typeof seed['workspaceTenantDomain'] === 'string' ? seed['workspaceTenantDomain'] : '',
      permissionsScopes:
        typeof seed['permissionsScopes'] === 'string' ? seed['permissionsScopes'] : '',
      endpoints: this.normalizeExternalEndpoints(rawEndpoints, []),
    };
  }

  protected createExternalIntegrationSeed(
    connectorId: string,
    overrides: Partial<ExternalApiIntegration> = {}
  ): ExternalApiIntegration {
    const connector = this.externalConnectorById(connectorId);
    if (!connector) {
      throw new Error(`Unknown external connector: ${connectorId}`);
    }

    const schemaConnector = this.externalApiSchemaService.connector(connectorId);
    const schemaSeedOverrides = schemaConnector ? this.externalSeedOverrides(schemaConnector) : {};
    const mergedOverrides = {
      ...schemaSeedOverrides,
      ...overrides,
    };

    return {
      id: connectorId,
      connectorId,
      active: true,
      name: connector.name,
      category: connector.category,
      status: 'Connected',
      auth: this.externalSchemaAuthById(connectorId),
      lastSync: this.i18n.translate('common.justNow'),
      usedIn: this.i18n.translate('uiText.formsReportsWorkflows'),
      logo: connector.logo,
      expanded: false,
      clientIdOrApiKey: '',
      clientSecretOrToken: '',
      redirectUrl: this.defaultRedirectUrl(connector),
      workspaceTenantDomain: '',
      permissionsScopes: '',
      endpoints: [],
      ...mergedOverrides,
    };
  }

  protected createExternalEndpointSeed(
    resourceName: string,
    httpMethod: string,
    usage: string,
    syncMode: string,
    fieldMappings: ExternalApiFieldMapping[],
    endpointUrl = ''
  ): ExternalApiResourceConfig {
    return {
      resourceName,
      httpMethod,
      endpointUrl,
      usage,
      syncMode,
      fieldMappings,
        advancedOptions: {
          requestHeaders: [{ key: 'Authorization', value: 'Bearer ' }],
          queryParameters: [{ key: '', value: '' }],
          responseMappings: [{ responsePath: 'data.records[0].email', targetField: 'email' }],
          retryCount: '3',
          timeout: '5000',
          fallbackMessage: 'Unable to complete this request right now.',
        },
    };
  }

  protected defaultRedirectUrl(connector: ExternalApiConnector): string {
    return `https://builder.quantaops.app/oauth/${connector.id}/callback`;
  }

  protected readStoredExternalIntegrations(): ExternalApiIntegration[] {
    if (!this.persistence.isAvailable()) {
      return [];
    }

    try {
      const raw = this.persistence.getItem('qo.externalApis.integrations');
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .map((entry) => this.normalizeExternalIntegration(entry))
        .filter((entry): entry is ExternalApiIntegration => !!entry);
    } catch {
      return [];
    }
  }

  protected persistExternalIntegrations(integrations: ExternalApiIntegration[]): void {
    if (!this.persistence.isAvailable()) {
      return;
    }

    try {
      this.persistence.setItem('qo.externalApis.integrations', JSON.stringify(integrations));
    } catch {
      return;
    }
  }

  protected normalizeExternalIntegration(value: unknown): ExternalApiIntegration | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const raw = value as Record<string, unknown>;
    const storedConnectorId = typeof raw.connectorId === 'string' ? raw.connectorId.trim() : '';
    const storedId = typeof raw.id === 'string' ? raw.id.trim() : '';
    const storedName = typeof raw.name === 'string' ? raw.name.trim() : '';
    const connectors = this.externalConnectors();

    const connectorId =
      (storedConnectorId && connectors.find((item) => item.id === storedConnectorId)?.id) ||
      (storedId && connectors.find((item) => item.id === storedId)?.id) ||
      (storedId &&
        connectors.find((item) => storedId === item.id || storedId.startsWith(`${item.id}-`))?.id) ||
      (storedName && connectors.find((item) => item.name === storedName)?.id) ||
      '';

    const connector = connectorId ? connectors.find((item) => item.id === connectorId) : undefined;
    if (!connector) {
      return null;
    }

    const fallbackId = storedId || connector.id;
    const fallbackSeed = this.createExternalIntegrationSeed(connector.id, { id: fallbackId });
    const storedConfiguration = this.configuration.load(fallbackId, [connector.id, storedConnectorId]);
    const mergedConfiguration = this.mergeExternalApiConfigurationValues(
      this.externalConfigurationFromIntegration(fallbackSeed),
      storedConfiguration
    );
    const normalizedName =
      this.configText(mergedConfiguration, 'connectionName') ||
      (typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : fallbackSeed.name);
    const normalizedCategory =
      typeof raw.category === 'string' && raw.category.trim()
        ? (raw.category.trim() as ExternalApiCategory)
        : fallbackSeed.category;
    const normalizedStatus = this.configStatus(mergedConfiguration, fallbackSeed.status);
    const normalizedAuth = this.configAuth(mergedConfiguration, fallbackSeed.auth);
    const normalizedLastSync =
      this.configText(mergedConfiguration, 'lastSync') ||
      (typeof raw.lastSync === 'string' && raw.lastSync.trim() ? raw.lastSync.trim() : fallbackSeed.lastSync);
    const normalizedUsedIn =
      this.configText(mergedConfiguration, 'useIn') ||
      (typeof raw.usedIn === 'string' && raw.usedIn.trim() ? raw.usedIn.trim() : fallbackSeed.usedIn);
    const normalizedLogo =
      typeof raw.logo === 'string' && raw.logo.trim() ? raw.logo.trim() : fallbackSeed.logo;
    const normalizedEndpoints = this.normalizeExternalEndpoints(raw.endpoints, fallbackSeed.endpoints);
    const storedPrimaryEndpoint = storedConfiguration
      ? this.createExternalResourceFromConfiguration(storedConfiguration)
      : null;

    return {
      id: fallbackId,
      connectorId: connector.id,
      active: typeof raw.active === 'boolean' ? raw.active : true,
      name: normalizedName,
      category: normalizedCategory,
      status: normalizedStatus,
      auth: normalizedAuth,
      lastSync: normalizedLastSync,
      usedIn: normalizedUsedIn,
      logo: normalizedLogo,
      expanded: Boolean(raw.expanded),
      clientIdOrApiKey:
        this.configText(mergedConfiguration, 'clientIdOrApiKey') ||
        (typeof raw.clientIdOrApiKey === 'string' ? raw.clientIdOrApiKey : ''),
      clientSecretOrToken:
        this.configText(mergedConfiguration, 'clientSecretOrToken') ||
        (typeof raw.clientSecretOrToken === 'string' ? raw.clientSecretOrToken : ''),
      redirectUrl:
        this.configText(mergedConfiguration, 'redirectUrl') ||
        (typeof raw.redirectUrl === 'string' ? raw.redirectUrl : this.defaultRedirectUrl(connector)),
      workspaceTenantDomain:
        this.configText(mergedConfiguration, 'workspaceTenantDomain') ||
        (typeof raw.workspaceTenantDomain === 'string' ? raw.workspaceTenantDomain : ''),
      permissionsScopes:
        this.configText(mergedConfiguration, 'permissionsScopes') ||
        (typeof raw.permissionsScopes === 'string' ? raw.permissionsScopes : ''),
      endpoints: storedPrimaryEndpoint
        ? [storedPrimaryEndpoint, ...normalizedEndpoints.slice(1)]
        : normalizedEndpoints,
    };
  }

  protected normalizeExternalEndpoints(value: unknown, fallback: ExternalApiResourceConfig[]): ExternalApiResourceConfig[] {
    if (!Array.isArray(value)) {
      return fallback;
    }

    return value
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return null;
        }

        const raw = item as Record<string, unknown>;
        const advancedOptionsRaw =
          raw.advancedOptions && typeof raw.advancedOptions === 'object'
            ? (raw.advancedOptions as Record<string, unknown>)
            : null;
        const fieldMappings = Array.isArray(raw.fieldMappings)
          ? raw.fieldMappings
              .map((mapping) => {
                if (!mapping || typeof mapping !== 'object') {
                  return null;
                }

                const mappingRaw = mapping as Record<string, unknown>;
                return {
                  externalField: typeof mappingRaw.externalField === 'string' ? mappingRaw.externalField : '',
                  internalField: typeof mappingRaw.internalField === 'string' ? mappingRaw.internalField : '',
                  fieldType: typeof mappingRaw.fieldType === 'string' ? mappingRaw.fieldType : 'Text',
                  required: Boolean(mappingRaw.required),
                } satisfies ExternalApiFieldMapping;
              })
              .filter((mapping): mapping is ExternalApiFieldMapping => !!mapping)
          : [];

        return {
          resourceName: typeof raw.resourceName === 'string' ? raw.resourceName : '',
          httpMethod: typeof raw.httpMethod === 'string' ? raw.httpMethod : 'GET',
          endpointUrl: typeof raw.endpointUrl === 'string' ? raw.endpointUrl : '',
          usage: typeof raw.usage === 'string' ? raw.usage : 'Forms',
          syncMode: typeof raw.syncMode === 'string' ? raw.syncMode : 'Auto sync',
          fieldMappings,
          advancedOptions: {
            requestHeaders: Array.isArray(advancedOptionsRaw?.requestHeaders)
              ? advancedOptionsRaw.requestHeaders
                  .map((entry) =>
                    entry && typeof entry === 'object'
                      ? {
                          key: typeof (entry as Record<string, unknown>).key === 'string' ? (entry as Record<string, unknown>).key as string : '',
                          value: typeof (entry as Record<string, unknown>).value === 'string' ? (entry as Record<string, unknown>).value as string : '',
                        }
                      : null
                  )
                  .filter((entry): entry is ExternalApiKeyValuePair => !!entry)
              : [{ key: 'Authorization', value: 'Bearer ' }],
            queryParameters: Array.isArray(advancedOptionsRaw?.queryParameters)
                ? advancedOptionsRaw.queryParameters
                    .map((entry) =>
                      entry && typeof entry === 'object'
                        ? {
                            key: typeof (entry as Record<string, unknown>).key === 'string' ? (entry as Record<string, unknown>).key as string : '',
                            value: typeof (entry as Record<string, unknown>).value === 'string' ? (entry as Record<string, unknown>).value as string : '',
                          }
                        : null
                    )
                    .filter((entry): entry is ExternalApiKeyValuePair => !!entry)
                : [{ key: '', value: '' }],
            responseMappings: Array.isArray(advancedOptionsRaw?.responseMappings)
              ? advancedOptionsRaw.responseMappings
                  .map((entry) =>
                    entry && typeof entry === 'object'
                      ? {
                          responsePath:
                            typeof (entry as Record<string, unknown>).responsePath === 'string'
                              ? (entry as Record<string, unknown>).responsePath as string
                              : '',
                          targetField:
                            typeof (entry as Record<string, unknown>).targetField === 'string'
                              ? (entry as Record<string, unknown>).targetField as string
                              : '',
                        }
                      : null
                  )
                  .filter((entry): entry is ExternalApiResponseMapping => !!entry)
              : [{ responsePath: 'data.records[0].email', targetField: 'email' }],
            retryCount: typeof advancedOptionsRaw?.retryCount === 'string' ? advancedOptionsRaw.retryCount : '3',
            timeout: typeof advancedOptionsRaw?.timeout === 'string' ? advancedOptionsRaw.timeout : '5000',
            fallbackMessage:
              typeof advancedOptionsRaw?.fallbackMessage === 'string'
                ? advancedOptionsRaw.fallbackMessage
                : 'Unable to complete this request right now.',
          },
        } satisfies ExternalApiResourceConfig;
      })
      .filter((endpoint): endpoint is ExternalApiResourceConfig => !!endpoint && !!endpoint.resourceName);
  }

}

