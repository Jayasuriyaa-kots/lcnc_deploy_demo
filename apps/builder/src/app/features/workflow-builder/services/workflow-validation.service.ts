import { Injectable, inject } from '@angular/core';
import { WorkflowEdge, WorkflowGraph, WorkflowNode, WorkflowTriggerConfig } from '@qo/models';
import {
  WORKFLOW_NODE_DEFINITION_ID_CONFIG_KEY,
  getWorkflowNodeDefinition,
} from '../models/workflow-editor-palette.config';
import { WorkflowBuilderI18nService } from './workflow-builder-i18n.service';

@Injectable({ providedIn: 'root' })
export class WorkflowValidationService {
  private readonly i18n = inject(WorkflowBuilderI18nService);

  validateTriggerConfig(config: WorkflowTriggerConfig): string[] {
    return Object.keys(config).length ? [] : [this.i18n.scope('validation.triggerConfigRequired')];
  }

  validateGraph(graph: WorkflowGraph): string[] {
    if (!graph.nodes.length) {
      return [this.i18n.scope('validation.workflowNodeRequired')];
    }

    return [
      ...this.validateStartAndEndRules(graph),
      ...this.validateEdges(graph),
      ...this.validateReachability(graph),
      ...this.validateNodeConfig(graph.nodes),
    ];
  }

  isStartNode(node: WorkflowNode): boolean {
    return (
      node.config[WORKFLOW_NODE_DEFINITION_ID_CONFIG_KEY] === 'start' ||
      node.id === 'node_start' ||
      (node.type === 'trigger' && node.label.trim().toLowerCase() === 'start')
    );
  }

  isEndNode(node: WorkflowNode): boolean {
    const label = node.label.trim().toLowerCase();

    return (
      node.config[WORKFLOW_NODE_DEFINITION_ID_CONFIG_KEY] === 'end' ||
      node.id.toLowerCase().includes('node_end') ||
      label === 'end' ||
      label === 'done'
    );
  }

  private validateStartAndEndRules(graph: WorkflowGraph): string[] {
    const errors: string[] = [];
    const startNodes = graph.nodes.filter((node) => this.isStartNode(node));
    const endNodes = graph.nodes.filter((node) => this.isEndNode(node));

    if (!startNodes.length) {
      errors.push(this.i18n.scope('validation.workflowMustHaveStart'));
    }

    if (startNodes.length > 1) {
      errors.push(this.i18n.scope('validation.workflowSingleStart'));
    }

    if (!endNodes.length) {
      errors.push(this.i18n.scope('validation.endNodeRequired'));
    }

    const incomingByNodeId = this.groupEdgesByTarget(graph.edges);
    const outgoingByNodeId = this.groupEdgesBySource(graph.edges);

    if (startNodes.some((node) => (incomingByNodeId.get(node.id) ?? []).length > 0)) {
      errors.push(this.i18n.scope('validation.startIncomingBlocked'));
    }

    if (endNodes.some((node) => (outgoingByNodeId.get(node.id) ?? []).length > 0)) {
      errors.push(this.i18n.scope('validation.endOutgoingBlocked'));
    }

    return errors;
  }

  private validateEdges(graph: WorkflowGraph): string[] {
    const errors: string[] = [];
    const nodeIds = new Set(graph.nodes.map((node) => node.id));
    const seenEdges = new Set<string>();

    for (const edge of graph.edges) {
      if (edge.sourceNodeId === edge.targetNodeId) {
        errors.push(this.i18n.scope('validation.selfConnectionsBlocked'));
      }

      if (!nodeIds.has(edge.sourceNodeId) || !nodeIds.has(edge.targetNodeId)) {
        errors.push(this.i18n.scope('validation.danglingConnectionsBlocked'));
      }

      const edgeKey = `${edge.sourceNodeId}:${edge.targetNodeId}`;
      if (seenEdges.has(edgeKey)) {
        errors.push(this.i18n.scope('validation.duplicateConnectionsBlocked'));
      }
      seenEdges.add(edgeKey);
    }

    return [...new Set(errors)];
  }

  private validateReachability(graph: WorkflowGraph): string[] {
    const startNode = graph.nodes.find((node) => this.isStartNode(node));

    if (!startNode) {
      return [];
    }

    const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
    const outgoingByNodeId = this.groupEdgesBySource(graph.edges);
    const reachableNodeIds = new Set<string>();
    const stack = [startNode.id];

    while (stack.length) {
      const nodeId = stack.pop();

      if (!nodeId || reachableNodeIds.has(nodeId)) {
        continue;
      }

      reachableNodeIds.add(nodeId);

      for (const edge of outgoingByNodeId.get(nodeId) ?? []) {
        stack.push(edge.targetNodeId);
      }
    }

    const errors: string[] = [];
    const unreachableNodes = graph.nodes.filter((node) => !reachableNodeIds.has(node.id));

    if (unreachableNodes.length) {
      errors.push(this.i18n.scope('validation.unreachableNodesBlocked'));
    }

    const reachableEndExists = [...reachableNodeIds]
      .map((nodeId) => nodesById.get(nodeId))
      .some((node): node is WorkflowNode => !!node && this.isEndNode(node));

    if (!reachableEndExists) {
      errors.push(this.i18n.scope('validation.connectToEndNode'));
    }

    const terminalNodes = [...reachableNodeIds]
      .map((nodeId) => nodesById.get(nodeId))
      .filter((node): node is WorkflowNode => !!node)
      .filter((node) => (outgoingByNodeId.get(node.id) ?? []).length === 0);

    if (terminalNodes.some((node) => !this.isEndNode(node))) {
      errors.push(this.i18n.scope('validation.terminalPathMustEnd'));
    }

    return errors;
  }

  private validateNodeConfig(nodes: WorkflowNode[]): string[] {
    const errors: string[] = [];

    for (const node of nodes) {
      const definitionId = node.config[WORKFLOW_NODE_DEFINITION_ID_CONFIG_KEY];
      const definition = getWorkflowNodeDefinition(typeof definitionId === 'string' ? definitionId : undefined);

      if (!definition) {
        continue;
      }

      for (const field of definition.configSchema) {
        if (!field.required) {
          continue;
        }

        const value = node.config[field.key];

        if (this.isEmptyConfigValue(value)) {
          errors.push(
            this.i18n.scope('validation.nodeFieldRequired', {
              nodeLabel: node.label,
              fieldLabel: field.label,
            })
          );
        }
      }
    }

    return errors;
  }

  private groupEdgesBySource(edges: WorkflowEdge[]): Map<string, WorkflowEdge[]> {
    return this.groupEdges(edges, 'sourceNodeId');
  }

  private isEmptyConfigValue(value: unknown): boolean {
    if (value === undefined || value === null || value === '') {
      return true;
    }

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    if (typeof value === 'object') {
      if ('items' in value && Array.isArray((value as { items: unknown[] }).items)) {
        return (value as { items: unknown[] }).items.length === 0;
      }

      return Object.keys(value).length === 0;
    }

    return false;
  }

  private groupEdgesByTarget(edges: WorkflowEdge[]): Map<string, WorkflowEdge[]> {
    return this.groupEdges(edges, 'targetNodeId');
  }

  private groupEdges(edges: WorkflowEdge[], key: 'sourceNodeId' | 'targetNodeId'): Map<string, WorkflowEdge[]> {
    return edges.reduce<Map<string, WorkflowEdge[]>>((groups, edge) => {
      groups.set(edge[key], [...(groups.get(edge[key]) ?? []), edge]);
      return groups;
    }, new Map());
  }
}
