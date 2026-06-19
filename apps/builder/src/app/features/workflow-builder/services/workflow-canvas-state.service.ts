import { Injectable, signal } from '@angular/core';
import { WorkflowEdge, WorkflowNode } from '@qo/models';

@Injectable({ providedIn: 'root' })
export class WorkflowCanvasStateService {
  private readonly gridSize = 8;
  readonly nodes = signal<WorkflowNode[]>([]);
  readonly edges = signal<WorkflowEdge[]>([]);
  readonly selectedNodeId = signal<string | null>(null);
  readonly validationState = signal<string[]>([]);
  readonly zoom = signal(1);

  setGraph(nodes: WorkflowNode[], edges: WorkflowEdge[]): void {
    this.nodes.set(nodes.map((node) => ({ ...node, position: { ...node.position }, config: { ...node.config } })));
    this.edges.set(edges.map((edge) => ({ ...edge })));
    this.validationState.set([]);
    this.zoom.set(1);
  }

  addNode(node: WorkflowNode): void {
    this.nodes.update((nodes) => [...nodes, node]);
    this.selectedNodeId.set(node.id);
  }

  updateNodePosition(nodeId: string, x: number, y: number): void {
    this.nodes.update((nodes) =>
      nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              position: {
                x: this.snapToGrid(x),
                y: this.snapToGrid(y),
              },
            }
          : node
      )
    );
  }

  updateNodeConfig(nodeId: string, key: string, value: unknown): void {
    this.nodes.update((nodes) =>
      nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              label: key === 'label' && typeof value === 'string' ? value : node.label,
              config: {
                ...node.config,
                [key]: value,
              },
            }
          : node
      )
    );
  }

  removeSelectedNode(): void {
    const selectedNodeId = this.selectedNodeId();

    if (!selectedNodeId) {
      return;
    }

    this.nodes.update((nodes) => nodes.filter((node) => node.id !== selectedNodeId));
    this.edges.update((edges) =>
      edges.filter((edge) => edge.sourceNodeId !== selectedNodeId && edge.targetNodeId !== selectedNodeId)
    );
    this.selectedNodeId.set(null);
  }

  addEdge(sourceNodeId: string, targetNodeId: string): boolean {
    if (sourceNodeId === targetNodeId) {
      return false;
    }

    const edgeExists = this.edges().some(
      (edge) => edge.sourceNodeId === sourceNodeId && edge.targetNodeId === targetNodeId
    );

    if (edgeExists) {
      return false;
    }

    this.edges.update((edges) => [
      ...edges,
      {
        id: `edge_${sourceNodeId}_${targetNodeId}_${Date.now()}`,
        sourceNodeId,
        targetNodeId,
      },
    ]);
    return true;
  }

  setValidationState(errors: string[]): void {
    this.validationState.set(errors);
  }

  zoomIn(): void {
    this.zoom.update((zoom) => Math.min(1.6, Number((zoom + 0.1).toFixed(2))));
  }

  zoomOut(): void {
    this.zoom.update((zoom) => Math.max(0.5, Number((zoom - 0.1).toFixed(2))));
  }

  resetZoom(): void {
    this.zoom.set(1);
  }

  snapPosition(position: WorkflowNode['position']): WorkflowNode['position'] {
    return {
      x: this.snapToGrid(position.x),
      y: this.snapToGrid(position.y),
    };
  }

  private snapToGrid(value: number): number {
    return Math.max(0, Math.round(value / this.gridSize) * this.gridSize);
  }
}
