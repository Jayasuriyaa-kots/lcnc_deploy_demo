import { Injectable } from '@angular/core';
import { WorkflowPaletteNode } from '../models/workflow-editor-palette.config';
import { WorkflowFormDatasourceQuery } from './workflow-form-context.service';

@Injectable({ providedIn: 'root' })
export class WorkflowEditorNodeFactoryService {
  configForNewNode(
    paletteNode: WorkflowPaletteNode,
    datasourceQueries: readonly WorkflowFormDatasourceQuery[]
  ): Record<string, unknown> {
    const config = { ...paletteNode.config };

    if (paletteNode.id !== 'database_query') {
      return config;
    }

    const query = datasourceQueries[0];

    if (!query) {
      return config;
    }

    return {
      ...config,
      datasource: query.datasourceId,
      method: query.method,
      query: query.queryId,
      queryText: query.queryText ?? config['queryText'],
      queryQualifiedName: query.queryQualifiedName ?? config['queryQualifiedName'],
      values: this.valuesMappingForDatasourceQuery(query),
    };
  }

  private valuesMappingForDatasourceQuery(query: WorkflowFormDatasourceQuery): Record<string, string> {
    return query.expectedInput.reduce<Record<string, string>>((mapping, input) => {
      const formFieldName = query.fieldMappings[input.key] || input.key;
      mapping[input.key] = `{{start.form.${formFieldName}}}`;
      return mapping;
    }, {});
  }
}
