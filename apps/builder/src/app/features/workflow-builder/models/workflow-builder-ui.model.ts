import {
  ActionButtonEditorModel,
  FunctionEditorModel,
  ScheduleEditorModel,
  WorkflowDetail,
  WorkflowFunctionSummary,
  WorkflowSummary,
} from '@qo/models';
import { WorkflowSectionId } from './workflow-builder-nav.model';

export interface WorkflowBuilderViewModel {
  appId: string;
  activeSection: WorkflowSectionId;
  loading: boolean;
  error: string | null;
  workflows: WorkflowSummary[];
  selectedWorkflow: WorkflowDetail | null;
  functions: WorkflowFunctionSummary[];
}

export interface WorkflowBuilderModalState {
  buttonCreateOpen: boolean;
  functionEditorOpen: boolean;
}

export interface WorkflowBuilderEditorState {
  scheduleDraft: ScheduleEditorModel;
  actionButtonDraft: ActionButtonEditorModel;
  functionDraft: FunctionEditorModel;
}

export interface WorkflowEventListItem {
  id: string;
  event: string;
  trigger: string;
  source: string;
  lastRun: string;
  status: 'active' | 'paused' | 'draft' | 'failed';
}

export interface WorkflowScheduleListItem {
  id: string;
  workflowId?: string;
  workflowName: string;
  frequencyLabel: string;
  scopeLabel: string;
  nextRunAt: string;
  enabled: boolean;
  triggerMode?: 'specific' | 'dateField';
  formId?: string;
  dateFieldId?: string;
  time?: string;
  timezone?: string;
}

export interface WorkflowActionButtonListItem {
  id: string;
  actionName: string;
  linkedWorkflow: string;
  scope: 'Report' | 'Page' | 'Global';
  source: string;
  usedIn: string;
  status: 'active' | 'draft' | 'inactive';
}

export interface WorkflowFunctionCardItem {
  id: string;
  name: string;
  language: 'javascript' | 'python';
  description: string;
  code: string;
  updatedAt: string;
}
