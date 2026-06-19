import {
  ACTION_CONFIG_TABS,
  ALL_BUILDERS,
  TRIGGER_CONFIG_TABS,
  fieldActionCriteriaFields,
  generalFields,
  standardMappingFields,
  targetFieldField,
} from './workflow-node-fields.config';
import { WorkflowNodeDefinition } from './workflow-node.types';
import { WORKFLOW_LANGUAGE } from '../../services/workflow-language';

const NODE = WORKFLOW_LANGUAGE.nodes;
const CONFIG = WORKFLOW_LANGUAGE.nodeConfig;

export const CORE_NODES: readonly WorkflowNodeDefinition[] = [
{
    id: 'start',
    label: NODE.start.label,
    category: CONFIG.categories.core,
    icon: 'play',
    type: 'trigger',
    description: NODE.start.description,
    allowedBuilders: ALL_BUILDERS,
    defaultConfig: {
      label: NODE.start.label,
      enabled: true,
      triggerType: 'manual',
      builderContext: 'workflow-builder',
    },
    configTabs: TRIGGER_CONFIG_TABS,
    configSchema: [
      ...generalFields(NODE.start.label),
      {
        key: 'builderContext',
        label: CONFIG.fields.builderContext,
        type: 'select',
        tab: 'general',
        required: true,
        options: CONFIG.options.builders,
      },
      {
        key: 'triggerType',
        label: CONFIG.fields.triggerType,
        type: 'select',
        tab: 'trigger',
        required: true,
        options: CONFIG.options.triggerType,
      },
      {
        key: 'payloadSchema',
        label: CONFIG.fields.payloadSchema,
        type: 'schema',
        tab: 'trigger',
      },
      ...standardMappingFields,
    ],
    validationRules: [
      CONFIG.validationRules.nodeStartRequired,
      CONFIG.validationRules.nodeStartCannotDelete,
      CONFIG.validationRules.startTriggerTypeRequired,
    ],
    ports: { inputs: 0, outputs: 1 },
    paletteVisible: false,
    systemNode: true,
  },
{
    id: 'end',
    label: NODE.end.label,
    category: CONFIG.categories.core,
    icon: 'check-circle',
    type: 'delay',
    description: NODE.end.description,
    allowedBuilders: ALL_BUILDERS,
    defaultConfig: {
      label: NODE.end.label,
      enabled: true,
      completionStatus: 'success',
      stopExecution: true,
    },
    configTabs: ACTION_CONFIG_TABS,
    configSchema: [
      ...generalFields(NODE.end.label),
      {
        key: 'completionStatus',
        label: CONFIG.fields.completionStatus,
        type: 'select',
        tab: 'action',
        required: true,
        options: CONFIG.options.completionStatus,
      },
      {
        key: 'completionMessage',
        label: CONFIG.fields.completionMessage,
        type: 'textarea',
        tab: 'action',
      },
      {
        key: 'stopExecution',
        label: CONFIG.fields.stopExecution,
        type: 'toggle',
        tab: 'action',
        required: true,
      },
      {
        key: 'returnPayload',
        label: CONFIG.fields.returnPayload,
        type: 'json',
        tab: 'outputMapping',
      },
      ...standardMappingFields,
    ],
    validationRules: [CONFIG.validationRules.completionStatusRequired, CONFIG.validationRules.endIncomingEdgeRequired],
    ports: { inputs: 1, outputs: 0 },
    paletteVisible: true,
    systemNode: true,
  }
];
