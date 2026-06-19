import { Injectable, WritableSignal, inject } from '@angular/core';
import { QoConfirmDialogConfig, QoToastService } from '@qo/ui-components';
import { WorkflowNode } from '@qo/models';
import { WorkflowNodeConfigChange } from '../components/config-panel/workflow-node-config-panel';
import { WorkflowCanvasStateService } from './workflow-canvas-state.service';
import { WorkflowValidationService } from './workflow-validation.service';
import { WorkflowBuilderI18nService } from './workflow-builder-i18n.service';

export interface WorkflowEditorNodeCommandContext {
  configPanelCollapsed: WritableSignal<boolean>;
  confirmConfig: WritableSignal<QoConfirmDialogConfig | null>;
  markDirty: () => void;
}

@Injectable({ providedIn: 'root' })
export class WorkflowEditorNodeCommandsService {
  private readonly canvas = inject(WorkflowCanvasStateService);
  private readonly validation = inject(WorkflowValidationService);
  private readonly toast = inject(QoToastService);
  private readonly i18n = inject(WorkflowBuilderI18nService);

  canDeleteNode(node: WorkflowNode | null): boolean {
    return !!node && !this.validation.isStartNode(node);
  }

  selectNode(nodeId: string, context: Pick<WorkflowEditorNodeCommandContext, 'configPanelCollapsed'>): void {
    this.canvas.selectedNodeId.set(nodeId);
    context.configPanelCollapsed.set(false);
  }

  clearSelection(context: Pick<WorkflowEditorNodeCommandContext, 'configPanelCollapsed'>): void {
    this.canvas.selectedNodeId.set(null);
    context.configPanelCollapsed.set(false);
  }

  updateNodeConfig(change: WorkflowNodeConfigChange, context: Pick<WorkflowEditorNodeCommandContext, 'markDirty'>): void {
    this.canvas.updateNodeConfig(change.nodeId, change.key, change.value);
    context.markDirty();
    this.canvas.setValidationState([]);
  }

  requestDeleteSelectedNode(selectedNode: WorkflowNode | null, context: WorkflowEditorNodeCommandContext): void {
    if (!selectedNode) {
      return;
    }

    if (this.validation.isStartNode(selectedNode)) {
      this.toast.error(
        this.i18n.scope('toast.startNodeProtected.title'),
        this.i18n.scope('toast.startNodeProtected.message')
      );
      return;
    }

    context.confirmConfig.set({
      title: this.i18n.scope('editor.deleteNode'),
      message: this.i18n.scope('editor.deleteNodeMessage', { nodeLabel: selectedNode.label }),
      confirmLabel: this.i18n.common('delete'),
      cancelLabel: this.i18n.common('cancel'),
      danger: true,
    });
  }

  confirmDeleteSelectedNode(selectedNode: WorkflowNode | null, context: WorkflowEditorNodeCommandContext): void {
    if (selectedNode && this.validation.isStartNode(selectedNode)) {
      context.confirmConfig.set(null);
      this.toast.error(
        this.i18n.scope('toast.startNodeProtected.title'),
        this.i18n.scope('toast.startNodeProtected.message')
      );
      return;
    }

    this.canvas.removeSelectedNode();
    context.markDirty();
    context.confirmConfig.set(null);
    this.toast.success(this.i18n.scope('toast.nodeDeleted.title'), this.i18n.scope('toast.nodeDeleted.message'));
  }

  cancelDeleteSelectedNode(context: Pick<WorkflowEditorNodeCommandContext, 'confirmConfig'>): void {
    context.confirmConfig.set(null);
  }
}
