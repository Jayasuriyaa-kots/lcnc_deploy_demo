export type DatasourceSection = 'sources' | 'apis' | 'logs' | 'compliance';
export type DatasourceWorkspace = 'dashboard' | 'picker' | 'config' | 'editor';
export type DatasourceHealth = 'healthy' | 'warning';
export type DatasourceQueryMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'QUERY'
  | 'MUTATION'
  | 'SELECT'
  | 'INSERT'
  | 'UPDATE'
  | 'SCAN'
  | 'FIND';
export type DatasourceConnectorId =
  | 'postgresql'
  | 'mongodb'
  | 'mysql'
  | 'google_sheets'
  | 'rest_api'
  | 'graphql_api'
  | 'authenticated_api'
  | 'authenticated_graphql'
  | 'elasticsearch'
  | 'dynamodb'
  | 'redis'
  | 'mssql'
  | 'firestore'
  | 'snowflake'
  | 'arangodb'
  | 'oracle'
  | 'databricks';
export type DatasourceConnectorKind = 'database' | 'api';
export type DatasourceConnectorIcon = 'postgres' | 'mysql' | 'rest' | 'graphql' | 'stripe' | 'default';
export type DatasourceAuthMode =
  | 'None'
  | 'Basic'
  | 'Basic Auth'
  | 'OAuth'
  | 'OAuth 2.0'
  | 'API Key'
  | 'Bearer Token'
  | 'Firebase Service Account'
  | 'SCRAM-SHA-1'
  | 'SCRAM-SHA-256'
  | 'MONGODB-CR'
  | 'X.509'
  | 'Key Pair';
export type DatasourceQueryResultTab = 'Results' | 'Response' | 'Logs' | 'Metadata';
export type DatasourceConfigRuntimeTab = 'Response' | 'Headers' | 'Logs' | 'Linter' | 'State';
export type DatasourceFieldType =
  | 'Text'
  | 'Name'
  | 'Email'
  | 'Number'
  | 'Date'
  | 'Drop Down'
  | 'Checkbox'
  | 'Phone'
  | 'Currency';

export interface DatasourceConnectorOption {
  id: DatasourceConnectorId;
  label: string;
  kind: DatasourceConnectorKind;
  icon: DatasourceConnectorIcon;
  description: string;
  capabilitySummary: string;
  capabilityChips: string[];
  defaultPort?: string;
}

export interface DatasourceMetricSnapshot {
  availability: string;
  p95: string;
  rpm: string;
  errors: string;
  auth: string;
  jobs: string;
  eps: string;
}

export interface DatasourceQueryRecord {
  id: string;
  name: string;
  method: DatasourceQueryMethod;
  query: string;
  active: boolean;
  calls: string;
  p50: string;
  p95: string;
  errorRate: string;
  retries: string;
  authHealthy: boolean;
  accessCount: string;
}

export interface DatasourceFieldMapping {
  id: string;
  name: string;
  key: string;
  dataType: string;
  required: boolean;
  unique: boolean;
  selected: boolean;
  suggestedFieldType: DatasourceFieldType;
}

export interface DatasourceSourceRecord {
  id: string;
  type?: DatasourceConnectorId;
  connectorId: DatasourceConnectorId;
  status: DatasourceHealth;
  name: string;
  datasourceName?: string;
  subtitle: string;
  desc?: string;
  connectionMethod?: string;
  connectionMode?: string;
  hostAddress?: string;
  baseUrl?: string;
  port?: string;
  databaseName?: string;
  username?: string;
  password?: string;
  sslMode?: string;
  authType?: string;
  headers?: string | DatasourceKeyValueEntry[];
  active: boolean;
  metrics: DatasourceMetricSnapshot;
  configSnapshot: DatasourceConfigFormValue;
  queries: DatasourceQueryRecord[];
  fieldMappings: DatasourceFieldMapping[];
  expanded: boolean;
}

export interface DatasourceEditorTab {
  id: string;
  datasourceId: string;
  name: string;
  queryTypeLabel: string;
  query: string;
  existingQueryId: string | null;
}

export interface DatasourceResultRow {
  [key: string]: string | number | boolean | null;
}

export interface DatasourceHostEntry {
  host: string;
  port: string;
}

export interface DatasourceKeyValueEntry {
  key: string;
  value: string;
}

export interface DatasourceConfigFormValue {
  name: string;
  connectionMethod: string;
  accessMode: string;
  useMongoUri: string;
  mongoUri: string;
  mongoConnectionType: string;
  host: string;
  hostUrl: string;
  port: string;
  databaseName: string;
  serviceName: string;
  baseUrl: string;
  endpointUrl: string;
  timeout: string;
  headers: string;
  httpMethod: string;
  bodyType: string;
  requestBody: string;
  paginationMode: string;
  paginationFieldOne: string;
  paginationFieldTwo: string;
  paginationFieldThree: string;
  paginationFieldFour: string;
  paginationFieldFive: string;
  paginationFieldSix: string;
  authentication: DatasourceAuthMode;
  authenticationType: DatasourceAuthMode;
  authDatabaseName: string;
  username: string;
  secret: string;
  apiKeyLocation: string;
  apiKeyName: string;
  bearerToken: string;
  oauthClientId: string;
  oauthClientSecret: string;
  oauthTokenUrl: string;
  oauthScope: string;
  authorizationHeader: string;
  sslMode: string;
  sslEnabled: boolean;
  useCaCertificate: string;
  caCertificateFileName: string;
  caCertificateBase64: string;
  sendSignatureHeader: boolean;
  useSelfSignedCertificate: boolean;
  sshHost: string;
  sshPort: string;
  sshUsername: string;
  sshKeyName: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  databaseNumber: string;
  databaseUrl: string;
  projectId: string;
  serviceAccountCredentials: string;
  accountName: string;
  warehouse: string;
  role: string;
  authType: string;
  privateKeyName: string;
  privateKeyPassphrase: string;
  configurationMethod: string;
  httpPath: string;
  defaultCatalog: string;
  defaultSchema: string;
  personalAccessToken: string;
  serverTimezoneOverride: string;
  graphqlQuery: string;
  graphqlVariables: string;
  hostEntries: DatasourceHostEntry[];
  sshHostEntries: DatasourceHostEntry[];
  headerEntries: DatasourceKeyValueEntry[];
  queryParamEntries: DatasourceKeyValueEntry[];
}
