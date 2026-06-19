import { ConnectorType } from '@qo/ui-components';

export type ExternalApiWorkspace = 'dashboard' | 'connectors' | 'setup';
export type ExternalApiCategory = 'CRM' | 'Communication' | 'Project Management' | 'Spreadsheets' | 'Custom / API';
export type ExternalApiStatus = 'Connected' | 'Expired Token' | 'Error' | 'Not Connected';
export type ExternalApiAuth = 'OAuth 2.0' | 'API Key' | 'Bearer Token' | 'Basic Auth' | 'No Auth';

export interface ExternalApiEndpointRow {
  resource: string;
  method: string;
  mappedFields: string;
  syncMode: string;
  usage: string;
}

export interface ExternalApiFieldMapping {
  externalField: string;
  internalField: string;
  fieldType: string;
  required: boolean;
}

export interface ExternalApiKeyValuePair {
  key: string;
  value: string;
}

export interface ExternalApiResponseMapping {
  responsePath: string;
  targetField: string;
}

export interface ExternalApiAdvancedOptions {
  requestHeaders: ExternalApiKeyValuePair[];
  queryParameters: ExternalApiKeyValuePair[];
  responseMappings: ExternalApiResponseMapping[];
  retryCount: string;
  timeout: string;
  fallbackMessage: string;
}

export interface ExternalApiResourceConfig {
  resourceName: string;
  httpMethod: string;
  endpointUrl: string;
  usage: string;
  syncMode: string;
  fieldMappings: ExternalApiFieldMapping[];
  advancedOptions: ExternalApiAdvancedOptions;
}

export interface ExternalApiIntegration {
  id: string;
  connectorId: string;
  active: boolean;
  name: string;
  category: ExternalApiCategory;
  status: ExternalApiStatus;
  auth: ExternalApiAuth;
  lastSync: string;
  usedIn: string;
  logo: string;
  expanded: boolean;
  clientIdOrApiKey: string;
  clientSecretOrToken: string;
  redirectUrl: string;
  workspaceTenantDomain: string;
  permissionsScopes: string;
  endpoints: ExternalApiResourceConfig[];
}

export interface ExternalApiConnector {
  id: string;
  name: string;
  authSummary: string;
  logo: string;
  category: ExternalApiCategory;
}

