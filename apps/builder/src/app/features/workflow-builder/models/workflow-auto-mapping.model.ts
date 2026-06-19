import { WorkflowNodeConfigField } from './workflow-editor-palette.config';

export interface WorkflowMappingSource {
  id: string;
  label: string;
  path: string;
  type?: string;
  origin: 'form' | 'node' | 'system';
}

export interface WorkflowMappingTarget {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
}

export interface WorkflowMappingSuggestion {
  targetKey: string;
  sourcePath: string;
  confidence: number;
}

export interface WorkflowMappingContext {
  field: WorkflowNodeConfigField;
  targets: readonly WorkflowMappingTarget[];
  sources: readonly WorkflowMappingSource[];
}
