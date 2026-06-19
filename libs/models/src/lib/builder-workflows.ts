export type WorkflowTriggerType =
  | 'form_submit'
  | 'form_load'
  | 'form_input'
  | 'event'
  | 'schedule'
  | 'button'
  | 'manual'
  | 'webhook';

export type WorkflowStatus = 'draft' | 'active' | 'inactive' | 'archived';

export type WorkflowNodeType =
  | 'trigger'
  | 'condition'
  | 'email'
  | 'api_call'
  | 'database_write'
  | 'delay'
  | 'loop'
  | 'custom_function'
  | 'notification'
  | 'sub_workflow';

export type WorkflowFunctionLanguage = 'javascript' | 'python';

export interface WorkflowSummary {
  id: string;
  appId: string;
  name: string;
  status: WorkflowStatus;
  triggerType: WorkflowTriggerType;
  triggerLabel: string;
  lastRunAt: string | null;
  runCount: number;
  updatedAt: string;
}

export interface WorkflowNodePosition {
  x: number;
  y: number;
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  position: WorkflowNodePosition;
  config: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  conditionLabel?: string;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface FormActionTriggerConfig {
  formId: string;
  formName: string;
  eventType: string;
  fieldId?: string;
  fieldName?: string;
}

export interface EventTriggerConfig {
  eventName: string;
  sourceType: string;
  sourceId: string;
  conditions: string[];
}

export interface ScheduleTriggerConfig {
  mode: string;
  runAt: string;
  cron: string;
  timezone: string;
  relativeField?: string;
}

export interface ActionButtonTriggerConfig {
  sourceType: string;
  sourceId: string;
  scope: string;
  buttonName: string;
}

export type WorkflowTriggerConfig =
  | FormActionTriggerConfig
  | EventTriggerConfig
  | ScheduleTriggerConfig
  | ActionButtonTriggerConfig
  | Record<string, unknown>;

export interface WorkflowDetail {
  id: string;
  appId: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  triggerType: WorkflowTriggerType;
  triggerConfig: WorkflowTriggerConfig;
  steps: WorkflowGraph;
  version: number;
  updatedAt: string;
  createdAt: string;
}

export interface CreateWorkflowRequest {
  name: string;
  description: string;
  triggerType: WorkflowTriggerType;
  triggerConfig: WorkflowTriggerConfig;
  steps: WorkflowGraph;
}

export interface UpdateWorkflowRequest {
  name: string;
  description: string;
  triggerConfig: WorkflowTriggerConfig;
  steps: WorkflowGraph;
  status: WorkflowStatus;
}

export interface WorkflowSearchFilters {
  query: string;
  triggerType?: WorkflowTriggerType;
  status?: WorkflowStatus;
}

export interface ScheduleEditorModel {
  workflowId: string;
  frequency: string;
  runOn: string;
  time: string;
  timezone: string;
}

export interface ActionButtonEditorModel {
  name: string;
  actionType: string;
  linkedWorkflowId: string;
  scope: string;
}

export interface WorkflowFunctionSummary {
  id: string;
  appId: string;
  name: string;
  language: WorkflowFunctionLanguage;
  description: string;
  updatedAt: string;
}

export interface WorkflowFunctionDetail {
  id: string;
  appId: string;
  name: string;
  language: WorkflowFunctionLanguage;
  description: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface FunctionEditorModel {
  name: string;
  language: WorkflowFunctionLanguage;
  code: string;
  description: string;
}
