import { Injectable, inject } from '@angular/core';
import { WorkflowDetail, WorkflowEdge, WorkflowGraph, WorkflowNode, WorkflowTriggerConfig } from '@qo/models';
import {
  WORKFLOW_NODE_DEFINITION_ID_CONFIG_KEY,
  createWorkflowNodeConfig,
  getWorkflowNodeDefinition,
} from '../models/workflow-editor-palette.config';
import { WorkflowValidationService } from './workflow-validation.service';
import { WORKFLOW_LANGUAGE } from './workflow-language';

@Injectable({ providedIn: 'root' })
export class WorkflowEditorGraphService {
  private readonly validation = inject(WorkflowValidationService);
  private readonly lang = WORKFLOW_LANGUAGE;

  edgePath(edge: WorkflowEdge, nodes: readonly WorkflowNode[]): string {
    const source = this.findNode(nodes, edge.sourceNodeId);
    const target = this.findNode(nodes, edge.targetNodeId);

    if (!source || !target) {
      return '';
    }

    return this.curvedPath(source.position.x + 96, source.position.y + 92, target.position.x + 96, target.position.y);
  }

  connectionPreviewPath(draft: { sourceNodeId: string; pointerX: number; pointerY: number } | null, nodes: readonly WorkflowNode[]): string {
    if (!draft) {
      return '';
    }

    const source = this.findNode(nodes, draft.sourceNodeId);

    if (!source) {
      return '';
    }

    return this.curvedPath(source.position.x + 96, source.position.y + 92, draft.pointerX, draft.pointerY);
  }

  edgeLabel(edge: WorkflowEdge, nodes: readonly WorkflowNode[], edges: readonly WorkflowEdge[]): { label: string; x: number; y: number } | null {
    const source = this.findNode(nodes, edge.sourceNodeId);
    const target = this.findNode(nodes, edge.targetNodeId);

    if (!source || !target || source.type !== 'condition') {
      return null;
    }

    const outgoingEdges = edges.filter((item) => item.sourceNodeId === source.id);
    const edgeIndex = outgoingEdges.findIndex((item) => item.id === edge.id);
    const definitionId = source.config[WORKFLOW_NODE_DEFINITION_ID_CONFIG_KEY];
    const definition = getWorkflowNodeDefinition(typeof definitionId === 'string' ? definitionId : undefined);
    const label =
      definition?.ports.outputLabels?.[edgeIndex] ??
      (edgeIndex === 0
        ? this.lang.fallbacks.editor.truePath
        : edgeIndex === 1
          ? this.lang.fallbacks.editor.falsePath
          : this.lang.editor.pathLabel(edgeIndex));

    return {
      label,
      x: (source.position.x + target.position.x) / 2 + 96,
      y: (source.position.y + target.position.y) / 2 + 46,
    };
  }

  collectValidationErrors(triggerConfig: WorkflowTriggerConfig, graph: WorkflowGraph): string[] {
    return [
      ...this.validation.validateTriggerConfig(triggerConfig),
      ...this.validation.validateGraph(graph),
      ...this.validateEditorGraph(graph),
    ];
  }

  getRunOrder(nodes: readonly WorkflowNode[], edges: readonly WorkflowEdge[]): WorkflowNode[] {
    const startNode = nodes.find((node) => this.validation.isStartNode(node)) ?? nodes[0];

    if (!startNode) {
      return [];
    }

    const nodesById = new Map(nodes.map((node) => [node.id, node]));
    const visited = new Set<string>();
    const ordered: WorkflowNode[] = [];
    const stack = [startNode.id];

    while (stack.length) {
      const nodeId = stack.shift();

      if (!nodeId || visited.has(nodeId)) {
        continue;
      }

      const node = nodesById.get(nodeId);
      if (!node) {
        continue;
      }

      visited.add(nodeId);
      ordered.push(node);

      const nextNodeIds = edges
        .filter((edge) => edge.sourceNodeId === nodeId)
        .map((edge) => edge.targetNodeId)
        .filter((targetNodeId) => !visited.has(targetNodeId));
      stack.push(...nextNodeIds);
    }

    return [...ordered, ...nodes.filter((node) => !visited.has(node.id))];
  }

  buildWorkflowRunPreviewJson(workflow: WorkflowDetail, graph: WorkflowGraph): string {
    return JSON.stringify(
      {
        id: workflow.id,
        appId: workflow.appId,
        name: workflow.name,
        description: workflow.description,
        status: workflow.status,
        triggerType: workflow.triggerType,
        triggerConfig: workflow.triggerConfig,
        version: workflow.version,
        steps: graph,
        updatedAt: workflow.updatedAt,
        createdAt: workflow.createdAt,
      },
      null,
      2
    );
  }

  toVerticalEditorGraph(
    graph: WorkflowGraph,
    snapPosition: (position: WorkflowNode['position']) => WorkflowNode['position']
  ): WorkflowGraph {
    const orderedNodes = this.orderNodesForEditor(graph);
    const startDefinition = getWorkflowNodeDefinition('start');
    const endDefinition = getWorkflowNodeDefinition('end');

    return {
      nodes: orderedNodes.map((node, index) => {
        const isStart = index === 0;
        const isEnd = this.validation.isEndNode(node);
        const definition = isStart ? startDefinition : isEnd ? endDefinition : null;

        return {
          ...node,
          type: definition?.type ?? node.type,
          label: isStart ? this.lang.nodes.start.label : isEnd ? this.lang.nodes.end.label : node.label,
          config: definition ? createWorkflowNodeConfig(definition, node.config) : { ...node.config },
          position: snapPosition({
            x: 320,
            y: 48 + index * 150,
          }),
        };
      }),
      edges: graph.edges,
    };
  }

  private validateEditorGraph(graph: WorkflowGraph): string[] {
    const nodeIds = new Set(graph.nodes.map((node) => node.id));
    const danglingEdges = graph.edges.filter((edge) => !nodeIds.has(edge.sourceNodeId) || !nodeIds.has(edge.targetNodeId));

    if (danglingEdges.length) {
      return [this.lang.fallbacks.editor.danglingConnections];
    }

    return [];
  }

  private orderNodesForEditor(graph: WorkflowGraph): WorkflowNode[] {
    const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
    const firstNode = graph.nodes.find((node) => node.type === 'trigger') ?? graph.nodes[0];

    if (!firstNode) {
      return [];
    }

    const orderedNodes: WorkflowNode[] = [];
    const visitedNodeIds = new Set<string>();
    let currentNode: WorkflowNode | undefined = firstNode;

    while (currentNode && !visitedNodeIds.has(currentNode.id)) {
      orderedNodes.push(currentNode);
      visitedNodeIds.add(currentNode.id);

      const nextEdge = graph.edges.find((edge) => edge.sourceNodeId === currentNode?.id);
      currentNode = nextEdge ? nodesById.get(nextEdge.targetNodeId) : undefined;
    }

    return [...orderedNodes, ...graph.nodes.filter((node) => !visitedNodeIds.has(node.id))];
  }

  private findNode(nodes: readonly WorkflowNode[], nodeId: string): WorkflowNode | undefined {
    return nodes.find((node) => node.id === nodeId);
  }

  private curvedPath(startX: number, startY: number, endX: number, endY: number): string {
    const distance = Math.max(64, Math.abs(endY - startY) / 2);
    return `M ${startX} ${startY} C ${startX} ${startY + distance}, ${endX} ${endY - distance}, ${endX} ${endY}`;
  }
}
