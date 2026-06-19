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

import { DatasourcesConfigSupportService } from '@builder/features/datasources/services/datasources-config-support.service';

export abstract class DatasourcesExternalStorageService extends DatasourcesConfigSupportService {
  protected abstract firstLegacyExternalApiEndpoint(
    raw: Record<string, unknown>
  ): Record<string, unknown> | null;
  protected abstract legacyExternalApiMappingRows(value: unknown): ExternalApiMappingValue[];
  protected abstract legacyExternalApiRequestMappings(
    requestHeadersValue: unknown,
    queryParametersValue: unknown
  ): ExternalApiMappingValue[];
  protected abstract legacyExternalApiResponseMappings(value: unknown): ExternalApiMappingValue[];
  protected abstract firstExternalApiString(
    value: Record<string, unknown>,
    keys: string[],
    fallback?: string
  ): string;
  protected abstract hasMeaningfulExternalApiConfiguration(
    value: ExternalApiConfigurationValue | null | undefined
  ): boolean;
  protected abstract hasMeaningfulExternalApiValue(value: unknown): boolean;

  protected readStoredExternalApiConfigurations(): Record<string, ExternalApiConfigurationValue> {
    if (!this.persistence.isAvailable()) {
      return {};
    }

    try {
      const raw = this.persistence.getItem(this.externalApiConfigurationsStorageKey);
      if (!raw) {
        return {};
      }

      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as Record<string, ExternalApiConfigurationValue>
        : {};
    } catch {
      return {};
    }
  }

  protected readLegacyExternalApiConfigurations(): Record<string, ExternalApiConfigurationValue> {
    if (!this.persistence.isAvailable()) {
      return {};
    }

    try {
      const raw = this.persistence.getItem('qo.externalApis.integrations');
      if (!raw) {
        return {};
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return {};
      }

      return parsed.reduce<Record<string, ExternalApiConfigurationValue>>((configurations, entry) => {
        if (!entry || typeof entry !== 'object') {
          return configurations;
        }

        const rawEntry = entry as Record<string, unknown>;
        const connectorId = this.legacyExternalApiConnectorKey(rawEntry);
        const configuration = this.legacyExternalApiConfigurationValue(rawEntry);
        if (connectorId && this.hasMeaningfulExternalApiConfiguration(configuration)) {
          configurations[connectorId] = configuration;
        }

        return configurations;
      }, {});
    } catch {
      return {};
    }
  }

  protected loadLegacyExternalApiConfiguration(
    storageKey: string,
    fallbackKeys: string[]
  ): ExternalApiConfigurationValue | null {
    const legacyConfigurations = this.readLegacyExternalApiConfigurations();
    const keys = [storageKey, ...fallbackKeys].filter((key, index, all) => !!key && all.indexOf(key) === index);
    const exactMatch = keys
      .map((key) => legacyConfigurations[key] ?? null)
      .find((value): value is ExternalApiConfigurationValue => !!value);

    if (exactMatch) {
      return exactMatch;
    }

    if (!this.persistence.isAvailable()) {
      return null;
    }

    try {
      const raw = this.persistence.getItem('qo.externalApis.integrations');
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return null;
      }

      const matchedEntry = parsed.find((entry) => {
        if (!entry || typeof entry !== 'object') {
          return false;
        }

        const rawEntry = entry as Record<string, unknown>;
        const entryId = typeof rawEntry.id === 'string' ? rawEntry.id.trim() : '';
        const connectorId = this.legacyExternalApiConnectorKey(rawEntry);
        const entryName = typeof rawEntry.name === 'string' ? rawEntry.name.trim() : '';

        return keys.some((key) => key === entryId || key === connectorId || key === entryName);
      });

      if (!matchedEntry || typeof matchedEntry !== 'object') {
        return null;
      }

      return this.legacyExternalApiConfigurationValue(matchedEntry as Record<string, unknown>);
    } catch {
      return null;
    }
  }

  protected legacyExternalApiConnectorKey(raw: Record<string, unknown>): string {
    const connectorId = typeof raw.connectorId === 'string' ? raw.connectorId.trim() : '';
    if (connectorId) {
      return connectorId;
    }

    const id = typeof raw.id === 'string' ? raw.id.trim() : '';
    if (id) {
      const byId = this.externalApiSchemaService.connector(id)?.key ?? '';
      if (byId) {
        return byId;
      }
      const prefix =
        this.externalApiSchemaService.connectors().find((item) => id === item.key || id.startsWith(`${item.key}-`))?.key ??
        '';
      if (prefix) {
        return prefix;
      }
    }

    const name = typeof raw.name === 'string' ? raw.name.trim() : '';
    if (name) {
      return this.externalApiSchemaService.connectors().find((item) => item.name === name)?.key ?? '';
    }

    return '';
  }

  protected legacyExternalApiConfigurationValue(raw: Record<string, unknown>): ExternalApiConfigurationValue {
    const configuration: ExternalApiConfigurationValue = {};

    const rawName = this.firstExternalApiString(raw, ['connectionName', 'name']);
    if (rawName) {
      configuration.connectionName = rawName;
    }

    const rawStatus = this.firstExternalApiString(raw, ['status']);
    if (rawStatus) {
      configuration.status = rawStatus;
    }

    const rawUseIn = this.firstExternalApiString(raw, ['useIn', 'usedIn']);
    if (rawUseIn) {
      configuration.useIn = rawUseIn;
    }

    if (typeof raw.active === 'boolean') {
      configuration.active = raw.active;
    }

    const rawAuthenticationType = this.firstExternalApiString(raw, ['authenticationType', 'auth']);
    if (rawAuthenticationType) {
      configuration.authenticationType = rawAuthenticationType;
    }

    const rawClientIdOrApiKey = this.firstExternalApiString(raw, ['clientIdOrApiKey', 'accountSid']);
    if (rawClientIdOrApiKey) {
      configuration.clientIdOrApiKey = rawClientIdOrApiKey;
      configuration.accountSid = rawClientIdOrApiKey;
    }

    const rawClientSecretOrToken = this.firstExternalApiString(raw, ['clientSecretOrToken', 'authToken']);
    if (rawClientSecretOrToken) {
      configuration.clientSecretOrToken = rawClientSecretOrToken;
      configuration.authToken = rawClientSecretOrToken;
    }

    const rawRedirectUrl = this.firstExternalApiString(raw, ['redirectUrl']);
    if (rawRedirectUrl) {
      configuration.redirectUrl = rawRedirectUrl;
    }

    const rawWorkspaceTenantDomain = this.firstExternalApiString(raw, ['workspaceTenantDomain']);
    if (rawWorkspaceTenantDomain) {
      configuration.workspaceTenantDomain = rawWorkspaceTenantDomain;
    }

    const rawPermissionsScopes = this.firstExternalApiString(raw, ['permissionsScopes']);
    if (rawPermissionsScopes) {
      configuration.permissionsScopes = rawPermissionsScopes;
    }

    const primaryEndpoint = this.firstLegacyExternalApiEndpoint(raw);
    if (primaryEndpoint) {
      const resourceName = this.firstExternalApiString(primaryEndpoint, ['resourceName']);
      if (resourceName) {
        configuration.resourceName = resourceName;
      }

      const httpMethod = this.firstExternalApiString(primaryEndpoint, ['httpMethod'], 'GET');
      if (httpMethod) {
        configuration.httpMethod = httpMethod;
      }

      const endpointUrl = this.firstExternalApiString(primaryEndpoint, ['endpointUrl']);
      if (endpointUrl) {
        configuration.endpointUrl = endpointUrl;
      }

      const resourceUsage = this.firstExternalApiString(primaryEndpoint, ['resourceUsage', 'usage']);
      if (resourceUsage) {
        configuration.resourceUsage = resourceUsage;
      }

      const syncMode = this.firstExternalApiString(primaryEndpoint, ['syncMode'], 'Auto sync');
      if (syncMode) {
        configuration.syncMode = syncMode;
      }

      const fieldMappings = this.legacyExternalApiMappingRows(primaryEndpoint.fieldMappings);
      const advancedOptions =
        primaryEndpoint.advancedOptions && typeof primaryEndpoint.advancedOptions === 'object'
          ? (primaryEndpoint.advancedOptions as Record<string, unknown>)
          : null;

      if (fieldMappings.length) {
        configuration.responseMappings = fieldMappings.map((mapping) => ({
          sourcePath: mapping.sourcePath,
          targetField: mapping.targetField,
          fieldType: mapping.fieldType,
          required: mapping.required,
        }));
      } else if (advancedOptions) {
        const responseMappings = this.legacyExternalApiResponseMappings(advancedOptions.responseMappings);
        if (responseMappings.length) {
          configuration.responseMappings = responseMappings;
        }
      }

      if (advancedOptions) {
        const requestMappings = this.legacyExternalApiRequestMappings(
          advancedOptions.requestHeaders,
          advancedOptions.queryParameters
        );
        if (requestMappings.length) {
          configuration.requestMappings = requestMappings;
        }

        const retryCount = this.firstExternalApiString(advancedOptions, ['retryCount']);
        if (retryCount) {
          configuration.retryCount = retryCount;
        }

        const timeout = this.firstExternalApiString(advancedOptions, ['timeout']);
        if (timeout) {
          configuration.timeout = timeout;
        }

        const fallbackMessage = this.firstExternalApiString(advancedOptions, ['fallbackMessage']);
        if (fallbackMessage) {
          configuration.fallbackMessage = fallbackMessage;
        }
      }
    }

    for (const [key, value] of Object.entries(raw)) {
      if (
        key === 'id' ||
        key === 'connectorId' ||
        key === 'name' ||
        key === 'category' ||
        key === 'logo' ||
        key === 'expanded' ||
        key === 'usedIn' ||
        key === 'auth' ||
        key === 'endpoints'
      ) {
        continue;
      }

      if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') {
        if (!this.hasMeaningfulExternalApiValue(configuration[key])) {
          configuration[key] = value;
        }
        continue;
      }

      if (Array.isArray(value) && !this.hasMeaningfulExternalApiValue(configuration[key])) {
        const mappings = this.legacyExternalApiMappingRows(value);
        if (mappings.length) {
          configuration[key] = mappings;
        }
      }
    }

    return configuration;
  }

}
