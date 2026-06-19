import { FormControl, FormGroup } from '@angular/forms';
import { DatasourceFieldType } from './datasource-dashboard.model';

export type KeyValueGroup = FormGroup<{
  key: FormControl<string>;
  value: FormControl<string>;
}>;

export type HostGroup = FormGroup<{
  host: FormControl<string>;
  port: FormControl<string>;
}>;

export type DatasourceEditorForm = FormGroup<{
  datasourceId: FormControl<string>;
  queryTypeLabel: FormControl<string>;
  query: FormControl<string>;
}>;

export type DatasourceSaveQueryForm = FormGroup<{
  name: FormControl<string>;
  description: FormControl<string>;
}>;

export type SchemaFieldGroup = FormGroup<{
  id: FormControl<string>;
  name: FormControl<string>;
  key: FormControl<string>;
  dataType: FormControl<string>;
  required: FormControl<boolean>;
  unique: FormControl<boolean>;
  selected: FormControl<boolean>;
  suggestedFieldType: FormControl<DatasourceFieldType>;
}>;

export type ExternalApiMappingGroup = FormGroup<{
  sourcePath: FormControl<string>;
  targetField: FormControl<string>;
  fieldType: FormControl<string>;
  required: FormControl<boolean>;
}>;

export type ExternalApiDynamicForm = FormGroup;
