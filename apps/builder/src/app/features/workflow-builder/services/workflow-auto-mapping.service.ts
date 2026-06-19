import { Injectable } from '@angular/core';
import { FormField, WorkflowNode } from '@qo/models';
import {
  WorkflowMappingSource,
  WorkflowMappingSuggestion,
  WorkflowMappingTarget,
} from '../models/workflow-auto-mapping.model';
import {
  WorkflowNodeConfigField,
  WorkflowNodeDefinition,
} from '../models/workflow-editor-palette.config';
import {
  autoMapWorkflowTargets,
  buildWorkflowMappingSources,
  buildWorkflowMappingTargets,
  normalizeWorkflowMapping,
  workflowSuggestionsToTemplateMapping,
} from '../models/workflow-auto-mapping.utils';

@Injectable({ providedIn: 'root' })
export class WorkflowAutoMappingService {
  buildSources(formFields: readonly FormField[], nodes: readonly WorkflowNode[], selectedNodeId: string | null): WorkflowMappingSource[] {
    return buildWorkflowMappingSources(formFields, nodes, selectedNodeId);
  }

  buildTargets(
    field: WorkflowNodeConfigField,
    definition: WorkflowNodeDefinition,
    formFields: readonly FormField[]
  ): WorkflowMappingTarget[] {
    return buildWorkflowMappingTargets(field, definition, formFields);
  }

  autoMap(targets: readonly WorkflowMappingTarget[], sources: readonly WorkflowMappingSource[]): WorkflowMappingSuggestion[] {
    return autoMapWorkflowTargets(targets, sources);
  }

  toTemplateMapping(suggestions: readonly WorkflowMappingSuggestion[]): Record<string, string> {
    return workflowSuggestionsToTemplateMapping(suggestions);
  }

  normalizeMapping(value: unknown): Record<string, string> {
    return normalizeWorkflowMapping(value);
  }
}
