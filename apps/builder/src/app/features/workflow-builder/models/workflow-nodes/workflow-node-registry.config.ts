import { WorkflowNode, WorkflowNodePosition } from '@qo/models';
import { CORE_NODES } from './core.nodes';
import { DATA_NODES } from './data.nodes';
import { EVENT_NODES } from './event.nodes';
import { FORM_ACTION_NODES } from './form-action.nodes';
import { FUNCTION_NODES } from './function.nodes';
import { INTEGRATION_NODES } from './integration.nodes';
import { LOGIC_NODES } from './logic.nodes';
import { NOTIFICATION_NODES } from './notification.nodes';
import { PAGE_BUILDER_NODES } from './page-builder.nodes';
import { SCHEDULER_NODES } from './scheduler.nodes';
import { WORKFLOW_NODE_DEFINITION_ID_CONFIG_KEY, WorkflowNodeDefinition } from './workflow-node.types';

export const WORKFLOW_NODE_REGISTRY: readonly WorkflowNodeDefinition[] = [
  ...CORE_NODES,
  ...SCHEDULER_NODES,
  ...DATA_NODES,
  ...NOTIFICATION_NODES,
  ...LOGIC_NODES,
  ...FORM_ACTION_NODES,
  ...EVENT_NODES,
  ...INTEGRATION_NODES,
  ...PAGE_BUILDER_NODES,
  ...FUNCTION_NODES,
];

export const WORKFLOW_NODE_REGISTRY_BY_ID = WORKFLOW_NODE_REGISTRY.reduce<
  Record<string, WorkflowNodeDefinition>
>((registry, node) => {
  registry[node.id] = node;
  return registry;
}, {});

export function getWorkflowNodeDefinition(nodeDefinitionId: string | undefined): WorkflowNodeDefinition | null {
  if (!nodeDefinitionId) {
    return null;
  }

  return WORKFLOW_NODE_REGISTRY_BY_ID[nodeDefinitionId] ?? null;
}

export function createWorkflowNodeConfig(
  definition: WorkflowNodeDefinition,
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    ...definition.defaultConfig,
    ...overrides,
    [WORKFLOW_NODE_DEFINITION_ID_CONFIG_KEY]: definition.id,
    systemNode: definition.systemNode === true,
  };
}

export function createWorkflowNodeFromDefinition(
  nodeDefinitionId: string,
  nodeId: string,
  position: WorkflowNodePosition,
  configOverrides: Record<string, unknown> = {}
): WorkflowNode {
  const definition = getWorkflowNodeDefinition(nodeDefinitionId);

  if (!definition) {
    throw new Error(`Unknown workflow node definition: ${nodeDefinitionId}`);
  }

  return {
    id: nodeId,
    type: definition.type,
    label: definition.label,
    position,
    config: createWorkflowNodeConfig(definition, configOverrides),
  };
}

