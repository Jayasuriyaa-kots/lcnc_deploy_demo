export type ExternalApiFieldType =
  | 'text'
  | 'password'
  | 'textarea'
  | 'url'
  | 'number'
  | 'email'
  | 'select'
  | 'checkbox'
  | 'toggle'
  | 'mappingList';

export interface ExternalApiFieldOption {
  label: string;
  value: string | boolean | number;
}

export interface ExternalApiFieldSchema {
  key: string;
  label: string;
  type: ExternalApiFieldType;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string | boolean | number;
  rows?: number;
  options?: ExternalApiFieldOption[];
  mappingDefaults?: ExternalApiMappingValue[];
  sourceLabel?: string;
  targetLabel?: string;
  sourcePlaceholder?: string;
  targetPlaceholder?: string;
}

export interface ExternalApiMappingValue {
  sourcePath: string;
  targetField: string;
  fieldType: string;
  required: boolean;
}

export interface ExternalApiSchemaSection {
  title: string;
  fields: ExternalApiFieldSchema[];
}

export interface ExternalApiSchema {
  connectorKey: string;
  displayName: string;
  authenticationType: string;
  sections: ExternalApiSchemaSection[];
}

export interface ExternalApiConnectorSchema {
  key: string;
  name: string;
  category: string;
  authSummary: string;
  defaultAuth: string;
  logo: string;
  schema: ExternalApiSchema;
  seed?: Record<string, unknown>;
}

export interface ExternalApiSchemaDocument {
  connectors: ExternalApiConnectorSchema[];
}

export type ExternalApiConfigurationValue = Record<string, string | boolean | number | ExternalApiMappingValue[]>;

export const externalMappingFieldTypeOptions = ['Text', 'Number', 'Email', 'Phone', 'Boolean', 'Date', 'Enum'].map((value) => ({
  label: value,
  value,
}));
