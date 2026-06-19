import { WorkflowTriggerType } from './builder-workflows';

export type WorkflowExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface WorkflowExecutionSummary {
  id: string;
  workflowId: string;
  celeryTaskId: string;
  triggerType: WorkflowTriggerType;
  status: WorkflowExecutionStatus;
  startedAt: string;
  finishedAt: string | null;
}

export interface WorkflowExecutionDetail {
  id: string;
  workflowId: string;
  celeryTaskId: string;
  triggerType: WorkflowTriggerType;
  status: WorkflowExecutionStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  errorMessage: string | null;
  stepsLog: string[];
  startedAt: string;
  finishedAt: string | null;
}

export interface WorkflowTriggerRequest {
  workflowId: string;
  triggerType: WorkflowTriggerType;
  payload?: Record<string, unknown>;
}
