import { Injectable, inject } from '@angular/core';
import { WorkflowEdge, WorkflowNode } from '@qo/models';
import { WorkflowPaletteNode } from '../models/workflow-editor-palette.config';
import { WorkflowValidationService } from './workflow-validation.service';
import { WorkflowBuilderI18nService } from './workflow-builder-i18n.service';

export interface WorkflowNodeDragState {
  nodeId: string;
  startPointerX: number;
  startPointerY: number;
  startNodeX: number;
  startNodeY: number;
}

export interface WorkflowConnectionDraft {
  sourceNodeId: string;
  pointerX: number;
  pointerY: number;
}

@Injectable({ providedIn: 'root' })
export class WorkflowEditorCanvasInteractionService {
  private readonly validation = inject(WorkflowValidationService);
  private readonly i18n = inject(WorkflowBuilderI18nService);

  preparePaletteDrag(event: DragEvent, node: WorkflowPaletteNode): void {
    event.dataTransfer?.setData('application/x-workflow-node', node.id);
    event.dataTransfer?.setData('text/plain', node.label);

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  shouldClearDragOver(event: DragEvent): boolean {
    const currentTarget = event.currentTarget as HTMLElement;
    const relatedTarget = event.relatedTarget as Node | null;

    return !relatedTarget || !currentTarget.contains(relatedTarget);
  }

  paletteNodeIdFromDrop(event: DragEvent): string | undefined {
    return event.dataTransfer?.getData('application/x-workflow-node');
  }

  pointerToCanvasPosition(
    event: DragEvent,
    zoom: number,
    snapPosition: (position: WorkflowNode['position']) => WorkflowNode['position']
  ): WorkflowNode['position'] {
    const canvasElement = event.currentTarget as HTMLElement;
    const rect = canvasElement.getBoundingClientRect();

    return {
      x: snapPosition({ x: (event.clientX - rect.left) / zoom - 96, y: 0 }).x,
      y: snapPosition({ x: 0, y: (event.clientY - rect.top) / zoom - 42 }).y,
    };
  }

  pointerToCanvasPoint(event: PointerEvent, canvasElement: HTMLElement | undefined, zoom: number): { x: number; y: number } {
    const rect = canvasElement?.getBoundingClientRect();

    if (!rect) {
      return { x: 0, y: 0 };
    }

    return {
      x: (event.clientX - rect.left) / zoom,
      y: (event.clientY - rect.top) / zoom,
    };
  }

  dragDelta(event: PointerEvent, drag: WorkflowNodeDragState, zoom: number): { x: number; y: number } {
    return {
      x: drag.startNodeX + (event.clientX - drag.startPointerX) / zoom,
      y: drag.startNodeY + (event.clientY - drag.startPointerY) / zoom,
    };
  }

  resolveConnectionTargetNodeId(event: PointerEvent): string | null {
    const target = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;

    if (!target) {
      return null;
    }

    const inputHandle = target.closest<HTMLElement>('.workflow-editor__handle--input');
    const targetNode = inputHandle ?? target.closest<HTMLElement>('.workflow-editor__node');

    return targetNode?.dataset['nodeId'] ?? null;
  }

  getConnectionBlockReason(
    sourceNodeId: string,
    targetNodeId: string,
    sourceNode: WorkflowNode | undefined,
    targetNode: WorkflowNode | undefined,
    edges: readonly WorkflowEdge[]
  ): string | null {
    if (sourceNodeId === targetNodeId) {
      return this.i18n.scope('validation.selfConnectionsBlocked');
    }

    if (!sourceNode || !targetNode) {
      return this.i18n.scope('validation.nodesMustExist');
    }

    if (this.validation.isEndNode(sourceNode)) {
      return this.i18n.scope('validation.endOutgoingBlocked');
    }

    if (this.validation.isStartNode(targetNode)) {
      return this.i18n.scope('validation.startIncomingBlocked');
    }

    const edgeExists = edges.some((edge) => edge.sourceNodeId === sourceNodeId && edge.targetNodeId === targetNodeId);

    if (edgeExists) {
      return this.i18n.scope('validation.duplicateConnectionsBlocked');
    }

    return null;
  }
}
