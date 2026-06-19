import { Injectable, WritableSignal, inject } from '@angular/core';
import { QoToastService } from '@qo/ui-components';
import { WorkflowDetail, WorkflowGraph } from '@qo/models';
import { WorkflowBuilderFacadeService } from './workflow-builder-facade.service';
import { WorkflowEditorGraphService } from './workflow-editor-graph.service';
import { WorkflowBuilderI18nService } from './workflow-builder-i18n.service';

export type PreviewNodeRunState = 'pending' | 'running' | 'success' | 'failed';

export interface WorkflowEditorRunContext {
  workflow: WorkflowDetail | null;
  graph: WorkflowGraph;
  running: WritableSignal<boolean>;
  nodeRunStates: WritableSignal<Record<string, PreviewNodeRunState>>;
  testRunMessage: WritableSignal<string | null>;
  workflowRunPreviewJson: WritableSignal<string | null>;
  setValidationState: (errors: string[]) => void;
}

@Injectable({ providedIn: 'root' })
export class WorkflowEditorRunService {
  private readonly editorGraph = inject(WorkflowEditorGraphService);
  private readonly facade = inject(WorkflowBuilderFacadeService);
  private readonly toast = inject(QoToastService);
  private readonly i18n = inject(WorkflowBuilderI18nService);

  async testRunWorkflow(context: WorkflowEditorRunContext): Promise<void> {
    const workflow = context.workflow;

    if (!workflow || context.running()) {
      return;
    }

    context.workflowRunPreviewJson.set(null);
    const errors = this.editorGraph.collectValidationErrors(workflow.triggerConfig, context.graph);
    context.setValidationState(errors);

    if (errors.length) {
      this.toast.error(this.i18n.scope('toast.testRunBlocked'), errors[0]);
      return;
    }

    try {
      context.running.set(true);
      context.testRunMessage.set(this.i18n.scope('editor.testRunStarted'));
      context.nodeRunStates.set(Object.fromEntries(context.graph.nodes.map((node) => [node.id, 'pending' as PreviewNodeRunState])));

      const runOrder = this.editorGraph.getRunOrder(context.graph.nodes, context.graph.edges);
      for (const [index, node] of runOrder.entries()) {
        context.nodeRunStates.update((states) => ({ ...states, [node.id]: 'running' }));
        context.testRunMessage.set(this.i18n.scope('editor.runningNode', { nodeLabel: node.label }));
        await this.wait(320);
        const shouldFail = false;
        context.nodeRunStates.update((states) => ({ ...states, [node.id]: shouldFail ? 'failed' : 'success' }));

        if (shouldFail) {
          throw new Error(`${node.label} failed`);
        }

        if (index === runOrder.length - 1) {
          context.testRunMessage.set(this.i18n.scope('editor.testRunCompleted'));
        }
      }

      this.facade.appendExecutionRun(workflow.id, {
        id: `${workflow.id}_run_${Date.now()}`,
        workflowId: workflow.id,
        celeryTaskId: `preview_${Date.now()}`,
        triggerType: workflow.triggerType,
        status: 'completed',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
      });
      context.workflowRunPreviewJson.set(this.editorGraph.buildWorkflowRunPreviewJson(workflow, context.graph));
      this.toast.success(
        this.i18n.scope('toast.testRunCompleted.title'),
        this.i18n.scope('toast.testRunCompleted.message')
      );
    } catch {
      context.testRunMessage.set(this.i18n.scope('editor.testRunFailed'));
      this.toast.error(
        this.i18n.scope('toast.editorTestRunFailed.title'),
        this.i18n.scope('toast.editorTestRunFailed.message')
      );
    } finally {
      context.running.set(false);
    }
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }
}
