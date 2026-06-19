import { createWorkflowNodeConfig, WORKFLOW_NODE_REGISTRY, WORKFLOW_NODE_REGISTRY_BY_ID } from './workflow-node-registry.config';
import { WorkflowNodeCategory, WorkflowNodeDefinition, WorkflowPaletteGroup, WorkflowPaletteMode, WorkflowPaletteNode } from './workflow-node.types';
import { WORKFLOW_LANGUAGE } from '../../services/workflow-language';

const CATEGORY = WORKFLOW_LANGUAGE.nodeConfig.categories;

const FORM_ACTION_PALETTE_GROUPS: readonly { label: WorkflowNodeCategory; nodeIds: readonly string[] }[] = [
  { label: CATEGORY.core, nodeIds: ['end'] },
  { label: CATEGORY.formActions, nodeIds: ['validate_form_data'] },
  { label: CATEGORY.fieldActions, nodeIds: ['show_field', 'hide_field', 'enable_field', 'disable_field', 'set_field_value'] },
  { label: CATEGORY.notifications, nodeIds: ['send_email', 'send_sms', 'show_success_message', 'redirect_url'] },
  { label: CATEGORY.data, nodeIds: ['database_query'] },
  // { label: CATEGORY.logic, nodeIds: ['condition', 'wait_delay'] },
  { label: CATEGORY.integrations, nodeIds: ['http_request', 'webhook'] },
  // { label: CATEGORY.functions, nodeIds: ['execute_js', 'execute_python'] },
];

const EVENT_PALETTE_GROUPS: readonly { label: WorkflowNodeCategory; nodeIds: readonly string[] }[] = [
  { label: CATEGORY.core, nodeIds: ['end'] },
  { label: CATEGORY.eventProcessing, nodeIds: ['filter_event', 'route_event', 'transform_event_payload', 'deduplicate_event', 'wait_delay'] },
  { label: CATEGORY.notifications, nodeIds: ['send_email', 'send_sms', 'send_notification'] },
  { label: CATEGORY.database, nodeIds: ['database_query', 'create_audit_log'] },
  { label: CATEGORY.apiIntegrations, nodeIds: ['api_query', 'http_request'] },
  { label: CATEGORY.errorHandling, nodeIds: ['retry_action', 'escalate_failure'] },
];

const SCHEDULER_PALETTE_GROUPS: readonly { label: WorkflowNodeCategory; nodeIds: readonly string[] }[] = [
  { label: CATEGORY.core, nodeIds: ['end'] },
  { label: CATEGORY.notifications, nodeIds: ['schedule_notification'] },
  { label: CATEGORY.data, nodeIds: ['schedule_data_access'] },
  // { label: CATEGORY.functions, nodeIds: ['schedule_function'] },
];

function toPaletteNode(node: WorkflowNodeDefinition): WorkflowPaletteNode {
  return {
    ...node,
    config: createWorkflowNodeConfig(node),
  };
}

function buildPaletteGroupsFromNodes(nodes: readonly WorkflowNodeDefinition[]): WorkflowPaletteGroup[] {
  return nodes
    .filter((node) => node.paletteVisible)
    .reduce<WorkflowPaletteGroup[]>((groups, node) => {
      const existingGroup = groups.find((group) => group.label === node.category);
      const paletteNode = toPaletteNode(node);

      if (existingGroup) {
        existingGroup.nodes.push(paletteNode);
        return groups;
      }

      return [
        ...groups,
        {
          label: node.category,
          nodes: [paletteNode],
        },
      ];
    }, []);
}

function buildPaletteGroupsFromConfig(config: readonly { label: WorkflowNodeCategory; nodeIds: readonly string[] }[]): WorkflowPaletteGroup[] {
  return config
    .map((group) => ({
      label: group.label,
      nodes: group.nodeIds
        .map((nodeId) => WORKFLOW_NODE_REGISTRY_BY_ID[nodeId])
        .filter((node): node is WorkflowNodeDefinition => !!node && node.paletteVisible)
        .map(toPaletteNode),
    }))
    .filter((group) => group.nodes.length > 0);
}

export function buildWorkflowEditorPaletteGroups(mode: WorkflowPaletteMode = 'default'): WorkflowPaletteGroup[] {
  switch (mode) {
    case 'form-actions':
      return buildPaletteGroupsFromConfig(FORM_ACTION_PALETTE_GROUPS);
    case 'events':
      return buildPaletteGroupsFromConfig(EVENT_PALETTE_GROUPS);
    case 'scheduler':
      return buildPaletteGroupsFromConfig(SCHEDULER_PALETTE_GROUPS);
    case 'action-buttons':
    case 'functions':
    case 'default':
    default:
      return buildPaletteGroupsFromNodes(WORKFLOW_NODE_REGISTRY);
  }
}

export const WORKFLOW_EDITOR_PALETTE_GROUPS: WorkflowPaletteGroup[] = buildWorkflowEditorPaletteGroups();
