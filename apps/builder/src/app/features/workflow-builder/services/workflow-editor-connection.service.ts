import { Injectable, WritableSignal, inject } from '@angular/core';
import { QoToastService } from '@qo/ui-components';
import { WorkflowConnectionDraft, WorkflowEditorCanvasInteractionService } from './workflow-editor-canvas-interaction.service';
import { WorkflowCanvasStateService } from './workflow-canvas-state.service';
import { WorkflowBuilderI18nService } from './workflow-builder-i18n.service';

export interface WorkflowEditorConnectionContext {
  connectingFromNodeId: WritableSignal<string | null>;
  connectionDraft: WritableSignal<WorkflowConnectionDraft | null>;
  connectionHint: WritableSignal<string | null>;
  markDirty: () => void;
  removePointerMoveListener: () => void;
}

@Injectable({ providedIn: 'root' })
export class WorkflowEditorConnectionService {
  private readonly canvas = inject(WorkflowCanvasStateService);
  private readonly canvasInteraction = inject(WorkflowEditorCanvasInteractionService);
  private readonly toast = inject(QoToastService);
  private readonly i18n = inject(WorkflowBuilderI18nService);

  startConnection(nodeId: string, point: { x: number; y: number }, context: WorkflowEditorConnectionContext): void {
    context.connectingFromNodeId.set(nodeId);
    context.connectionDraft.set({
      sourceNodeId: nodeId,
      pointerX: point.x,
      pointerY: point.y,
    });
  }

  updateDraft(point: { x: number; y: number }, context: WorkflowEditorConnectionContext): void {
    const draft = context.connectionDraft();

    if (!draft) {
      return;
    }

    context.connectionDraft.set({
      ...draft,
      pointerX: point.x,
      pointerY: point.y,
    });
  }

  targetNodeIdFromPointer(event: PointerEvent): string | null {
    return this.canvasInteraction.resolveConnectionTargetNodeId(event);
  }

  completeConnection(targetNodeId: string, context: WorkflowEditorConnectionContext): void {
    const sourceNodeId = context.connectingFromNodeId();

    if (!sourceNodeId) {
      return;
    }

    const sourceNode = this.canvas.nodes().find((node) => node.id === sourceNodeId);
    const targetNode = this.canvas.nodes().find((node) => node.id === targetNodeId);
    const blockedReason = this.canvasInteraction.getConnectionBlockReason(
      sourceNodeId,
      targetNodeId,
      sourceNode,
      targetNode,
      this.canvas.edges()
    );

    if (blockedReason) {
      this.blockConnection(blockedReason, context);
      return;
    }

    const connected = this.canvas.addEdge(sourceNodeId, targetNodeId);
    if (!connected) {
      this.blockConnection(this.i18n.scope('validation.duplicateConnectionsBlocked'), context);
      return;
    }

    context.markDirty();
    this.canvas.setValidationState([]);
    this.clearConnection(context);
  }

  cancelConnection(context: WorkflowEditorConnectionContext): void {
    this.clearConnection(context);
    context.removePointerMoveListener();
  }

  private blockConnection(reason: string, context: WorkflowEditorConnectionContext): void {
    context.connectionHint.set(reason);
    this.toast.error(this.i18n.scope('toast.connectionBlocked'), reason);
    context.connectingFromNodeId.set(null);
    context.connectionDraft.set(null);
    context.removePointerMoveListener();
    window.setTimeout(() => {
      if (context.connectionHint() === reason) {
        context.connectionHint.set(null);
      }
    }, 2400);
  }

  private clearConnection(context: WorkflowEditorConnectionContext): void {
    context.connectingFromNodeId.set(null);
    context.connectionDraft.set(null);
    context.connectionHint.set(null);
  }
}
