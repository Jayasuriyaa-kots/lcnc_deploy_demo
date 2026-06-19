import { WorkflowNodeType } from '@qo/models';

export type WorkflowBuilderContext =
  | 'form-builder'
  | 'page-builder'
  | 'report-builder'
  | 'workflow-builder';

export type WorkflowNodeCategory =
  | 'Core'
  | 'Notifications'
  | 'Database'
  | 'Data'
  | 'API'
  | 'API Integrations'
  | 'Integrations'
  | 'Messaging'
  | 'Logic'
  | 'Form Actions'
  | 'Field Actions'
  | 'Functions'
  | 'Event Processing'
  | 'Error Handling'
  | 'Page Builder'
  | 'UI Feedback'
  | 'Data Transform'
  | 'Storage';

export type WorkflowPaletteMode =
  | 'form-actions'
  | 'events'
  | 'scheduler'
  | 'action-buttons'
  | 'functions'
  | 'default';

export type WorkflowNodeConfigTabId =
  | 'general'
  | 'trigger'
  | 'action'
  | 'inputMapping'
  | 'outputMapping'
  | 'validation'
  | 'errorHandling'
  | 'permissions'
  | 'advanced';

export type WorkflowNodeConfigFieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'multiSelect'
  | 'toggle'
  | 'number'
  | 'duration'
  | 'emailList'
  | 'keyValue'
  | 'json'
  | 'schema'
  | 'mapping'
  | 'ruleBuilder'
  | 'code'
  | 'fileMapping';

export interface WorkflowNodeConfigTab {
  id: WorkflowNodeConfigTabId;
  label: string;
}

export interface WorkflowNodeConfigField {
  key: string;
  label: string;
  type: WorkflowNodeConfigFieldType;
  tab: WorkflowNodeConfigTabId;
  required?: boolean;
  options?: readonly string[];
  placeholder?: string;
  hint?: string;
}

export interface WorkflowNodePortDefinition {
  inputs: number;
  outputs: number;
  outputLabels?: readonly string[];
}

export interface WorkflowNodeDefinition {
  id: string;
  label: string;
  category: WorkflowNodeCategory;
  icon: string;
  type: WorkflowNodeType;
  description: string;
  allowedBuilders: readonly WorkflowBuilderContext[];
  defaultConfig: Record<string, unknown>;
  configTabs: readonly WorkflowNodeConfigTab[];
  configSchema: readonly WorkflowNodeConfigField[];
  validationRules: readonly string[];
  ports: WorkflowNodePortDefinition;
  paletteVisible: boolean;
  systemNode?: boolean;
}

export interface WorkflowPaletteNode extends WorkflowNodeDefinition {
  config: Record<string, unknown>;
}

export interface WorkflowPaletteGroup {
  label: string;
  nodes: WorkflowPaletteNode[];
}

export const WORKFLOW_NODE_DEFINITION_ID_CONFIG_KEY = 'nodeDefinitionId';

