import { BuilderAssetItem } from '@builder/core/models/builder-shell.model';
import { BuilderAction, BuilderField } from '@builder/features/form-builder/models/form-builder.models';
import { BuilderDatasourceExpectedInput } from '@builder/features/form-builder/config/form-builder.config';

export interface FormBuilderAsset extends BuilderAssetItem {
  description: string;
  datasourceId: string;
  datasourceLabel: string;
  queryId: string;
  queryLabel: string;
  queryText: string;
  queryQualifiedName?: string;
  expectedDatasourceInput: BuilderDatasourceExpectedInput[];
  fieldMappings: Array<{
    columnId: string;
    queryParam: string;
    fieldType: string;
  }>;
  userId: string;
  jwtToken: string;
  createdAt: string;
  modifiedAt: string;
  fields: BuilderField[];
  settings: {
    formLayout: 'Single Column' | 'Two Column' | 'Multi Section';
    labelPlacement: 'Top' | 'Left' | 'Placeholder Only';
    showSectionBorders: boolean;
    submitBehavior: 'Show Message' | 'Redirect';
    redirectUrl?: string;
    duplicateDetection: 'None' | 'Warn' | 'Block';
  };
  actions: BuilderAction[];
}
