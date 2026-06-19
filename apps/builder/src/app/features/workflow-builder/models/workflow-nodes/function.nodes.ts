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

export const FUNCTION_NODES: readonly WorkflowNodeDefinition[] = [
{
    id: 'execute_js',
    label: NODE.executeJs.label,
    category: CONFIG.categories.functions,
    icon: 'code',
    type: 'custom_function',
    description: NODE.executeJs.description,
    allowedBuilders: ALL_BUILDERS,
    defaultConfig: {
      label: NODE.executeJs.label,
      enabled: true,
      runtime: 'javascript',
      code: 'return input;',
    },
    configTabs: ACTION_CONFIG_TABS,
    configSchema: [
      ...generalFields(NODE.executeJs.label),
      {
        key: 'inputMapping',
        label: CONFIG.fields.inputMapping,
        type: 'mapping',
        tab: 'action',
      },
      {
        key: 'code',
        label: CONFIG.fields.javaScript,
        type: 'code',
        tab: 'action',
        required: true,
      },
      ...standardMappingFields.filter((field) => field.key !== 'inputMapping'),
    ],
    validationRules: [CONFIG.validationRules.javaScriptRequired],
    ports: { inputs: 1, outputs: 1 },
    paletteVisible: true,
  },
{
    id: 'execute_python',
    label: NODE.executePython.label,
    category: CONFIG.categories.functions,
    icon: 'code',
    type: 'custom_function',
    description: NODE.executePython.description,
    allowedBuilders: ALL_BUILDERS,
    defaultConfig: {
      label: NODE.executePython.label,
      enabled: true,
      runtime: 'python',
      code: 'return input',
    },
    configTabs: ACTION_CONFIG_TABS,
    configSchema: [
      ...generalFields(NODE.executePython.label),
      {
        key: 'inputMapping',
        label: CONFIG.fields.inputMapping,
        type: 'mapping',
        tab: 'action',
      },
      {
        key: 'code',
        label: CONFIG.fields.python,
        type: 'code',
        tab: 'action',
        required: true,
      },
      ...standardMappingFields.filter((field) => field.key !== 'inputMapping'),
    ],
    validationRules: [CONFIG.validationRules.pythonRequired],
    ports: { inputs: 1, outputs: 1 },
    paletteVisible: true,
  }
];
