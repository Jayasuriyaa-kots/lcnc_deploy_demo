import { Injectable, computed, signal } from '@angular/core';
import {
  WorkflowDetail,
  WorkflowExecutionSummary,
  WorkflowFunctionSummary,
  WorkflowSummary,
} from '@qo/models';
import { WorkflowSectionId } from '../models/workflow-builder-nav.model';
import {
  WorkflowActionButtonListItem,
  WorkflowEventListItem,
  WorkflowFunctionCardItem,
  WorkflowScheduleListItem,
} from '../models/workflow-builder-ui.model';

@Injectable({ providedIn: 'root' })
export class WorkflowBuilderStateService {
  readonly appId = signal('app_hr_management');
  readonly activeSection = signal<WorkflowSectionId>('form-actions');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly workflows = signal<WorkflowSummary[]>([]);
  readonly workflowDetails = signal<Record<string, WorkflowDetail>>({});
  readonly selectedWorkflowId = signal<string | null>(null);
  readonly selectedWorkflow = signal<WorkflowDetail | null>(null);
  readonly selectedRunId = signal<string | null>(null);
  readonly executionRuns = signal<Record<string, WorkflowExecutionSummary[]>>({});
  readonly functions = signal<WorkflowFunctionSummary[]>([]);
  readonly eventWorkflows = signal<WorkflowEventListItem[]>([]);
  readonly scheduledWorkflows = signal<WorkflowScheduleListItem[]>([]);
  readonly buttonActions = signal<WorkflowActionButtonListItem[]>([]);
  readonly functionCards = signal<WorkflowFunctionCardItem[]>([]);
  readonly unsavedChanges = signal(false);
  readonly hasWorkflowSelection = computed(() => !!this.selectedWorkflowId());

  setActiveSection(section: WorkflowSectionId): void {
    this.activeSection.set(section);
  }

  setSelectedWorkflow(workflow: WorkflowDetail | null): void {
    this.selectedWorkflow.set(workflow);
    this.selectedWorkflowId.set(workflow?.id ?? null);

    if (workflow) {
      this.workflowDetails.update((current) => ({
        ...current,
        [workflow.id]: workflow,
      }));
    }
  }
}
