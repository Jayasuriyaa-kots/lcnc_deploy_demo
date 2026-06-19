import { Injectable, WritableSignal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BuilderWorkflowsService } from '@qo/api-client';
import { QoToastService } from '@qo/ui-components';
import { WorkflowDetail, WorkflowGraph } from '@qo/models';
import { WorkflowBuilderFacadeService } from './workflow-builder-facade.service';
import { WorkflowEditorGraphService } from './workflow-editor-graph.service';
import { WorkflowBuilderI18nService } from './workflow-builder-i18n.service';

export interface WorkflowEditorPersistenceContext {
  workflow: WorkflowDetail | null;
  graph: WorkflowGraph;
  saving: WritableSignal<boolean>;
  dirty: WritableSignal<boolean>;
  lastSavedAt: WritableSignal<string | null>;
  setValidationState: (errors: string[]) => void;
}

@Injectable({ providedIn: 'root' })
export class WorkflowEditorPersistenceService {
  private readonly workflowsService = inject(BuilderWorkflowsService);
  private readonly facade = inject(WorkflowBuilderFacadeService);
  private readonly editorGraph = inject(WorkflowEditorGraphService);
  private readonly toast = inject(QoToastService);
  private readonly i18n = inject(WorkflowBuilderI18nService);

  validateWorkflow(context: Pick<WorkflowEditorPersistenceContext, 'workflow' | 'graph' | 'setValidationState'>): void {
    const workflow = context.workflow;

    if (!workflow) {
      return;
    }

    const errors = this.editorGraph.collectValidationErrors(workflow.triggerConfig, context.graph);
    context.setValidationState(errors);

    if (errors.length) {
      this.toast.error(this.i18n.scope('toast.workflowNeedsAttention'), errors[0]);
      return;
    }

    this.toast.success(
      this.i18n.scope('toast.workflowValidated.title'),
      this.i18n.scope('toast.workflowValidated.message')
    );
  }

  async saveWorkflow(context: WorkflowEditorPersistenceContext): Promise<void> {
    const workflow = context.workflow;

    if (!workflow) {
      return;
    }

    const errors = this.editorGraph.collectValidationErrors(workflow.triggerConfig, context.graph);
    context.setValidationState(errors);

    if (errors.length) {
      this.toast.error(this.i18n.scope('toast.workflowNeedsAttention'), errors[0]);
      return;
    }

    try {
      context.saving.set(true);
      await firstValueFrom(
        this.workflowsService.update(workflow.id, {
          name: workflow.name,
          description: workflow.description,
          triggerConfig: workflow.triggerConfig,
          steps: context.graph,
          status: workflow.status,
        })
      );
      this.facade.replaceWorkflowDetail({
        ...workflow,
        steps: context.graph,
        version: workflow.version + 1,
        updatedAt: new Date().toISOString(),
      });
      context.dirty.set(false);
      context.lastSavedAt.set(this.i18n.scope('editor.justNow'));
      this.toast.success(this.i18n.scope('toast.workflowSaved.title'), this.i18n.scope('toast.workflowSaved.message'));
    } catch {
      this.toast.error(
        this.i18n.scope('toast.workflowSaveFailed.title'),
        this.i18n.scope('toast.workflowSaveFailed.message')
      );
    } finally {
      context.saving.set(false);
    }
  }
}
