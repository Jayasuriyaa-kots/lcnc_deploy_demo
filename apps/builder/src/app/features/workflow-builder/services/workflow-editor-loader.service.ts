import { Injectable, WritableSignal, inject } from '@angular/core';
import { FormField, WorkflowGraph } from '@qo/models';
import { WorkflowBuilderFacadeService } from './workflow-builder-facade.service';
import { WorkflowCanvasStateService } from './workflow-canvas-state.service';
import { WorkflowEditorGraphService } from './workflow-editor-graph.service';
import { WorkflowFormContextService, WorkflowFormDatasourceQuery } from './workflow-form-context.service';
import { WORKFLOW_LANGUAGE } from './workflow-language';

export interface WorkflowEditorLoaderContext {
  workflowId: string | null;
  loading: WritableSignal<boolean>;
  editorError: WritableSignal<string | null>;
  dirty: WritableSignal<boolean>;
  lastSavedAt: WritableSignal<string | null>;
  formFields: WritableSignal<readonly FormField[]>;
  formDatasourceQueries: WritableSignal<readonly WorkflowFormDatasourceQuery[]>;
}

@Injectable({ providedIn: 'root' })
export class WorkflowEditorLoaderService {
  private readonly lang = WORKFLOW_LANGUAGE;
  private readonly facade = inject(WorkflowBuilderFacadeService);
  private readonly canvas = inject(WorkflowCanvasStateService);
  private readonly editorGraph = inject(WorkflowEditorGraphService);
  private readonly formContext = inject(WorkflowFormContextService);

  async loadWorkflow(context: WorkflowEditorLoaderContext): Promise<void> {
    if (!context.workflowId) {
      context.editorError.set(this.lang.editor.workflowIdMissing);
      context.loading.set(false);
      return;
    }

    try {
      context.loading.set(true);
      await this.facade.initialize();
      await this.facade.selectWorkflow(context.workflowId);
      const workflow = this.facade.selectedWorkflow();

      if (!workflow) {
        context.editorError.set(this.lang.editor.workflowNotFound);
        return;
      }

      const formContext = await this.formContext.loadContext(workflow);
      const editorGraph = this.toEditorGraph(workflow.steps);

      context.formFields.set(formContext.fields);
      context.formDatasourceQueries.set(formContext.datasourceQueries);
      this.canvas.setGraph(editorGraph.nodes, editorGraph.edges);
      this.canvas.selectedNodeId.set(null);
      context.dirty.set(false);
      context.lastSavedAt.set(null);
    } catch {
      context.editorError.set(this.lang.editor.openEditorFailed);
    } finally {
      context.loading.set(false);
    }
  }

  private toEditorGraph(graph: WorkflowGraph): WorkflowGraph {
    return this.editorGraph.toVerticalEditorGraph(graph, (position) => this.canvas.snapPosition(position));
  }
}
