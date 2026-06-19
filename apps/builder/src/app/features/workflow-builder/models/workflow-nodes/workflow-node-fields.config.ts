import { WorkflowBuilderContext, WorkflowNodeConfigField, WorkflowNodeConfigTab } from './workflow-node.types';
import { WORKFLOW_LANGUAGE } from '../../services/workflow-language';

const LANG = WORKFLOW_LANGUAGE.nodeConfig;

export const COMMON_CONFIG_TABS: readonly WorkflowNodeConfigTab[] = [
  { id: 'general', label: LANG.tabs.general },
  { id: 'inputMapping', label: LANG.tabs.inputMapping },
  { id: 'outputMapping', label: LANG.tabs.outputMapping },
  { id: 'validation', label: LANG.tabs.validation },
  { id: 'errorHandling', label: LANG.tabs.errorHandling },
  { id: 'permissions', label: LANG.tabs.permissions },
  { id: 'advanced', label: LANG.tabs.advanced },
];

export const ACTION_CONFIG_TABS: readonly WorkflowNodeConfigTab[] = [
  { id: 'general', label: LANG.tabs.general },
  { id: 'action', label: LANG.tabs.action },
  ...COMMON_CONFIG_TABS.slice(1),
];

export const TRIGGER_CONFIG_TABS: readonly WorkflowNodeConfigTab[] = [
  { id: 'general', label: LANG.tabs.general },
  { id: 'trigger', label: LANG.tabs.trigger },
  ...COMMON_CONFIG_TABS.slice(1),
];

export const ALL_BUILDERS: readonly WorkflowBuilderContext[] = [
  'form-builder',
  'page-builder',
  'report-builder',
  'workflow-builder',
];

export const generalFields = (labelPlaceholder: string): readonly WorkflowNodeConfigField[] => [
  {
    key: 'label',
    label: LANG.fields.nodeLabel,
    type: 'text',
    tab: 'general',
    required: true,
    placeholder: labelPlaceholder,
  },
  {
    key: 'description',
    label: LANG.fields.description,
    type: 'textarea',
    tab: 'general',
    placeholder: LANG.placeholders.internalNotes,
  },
  {
    key: 'enabled',
    label: LANG.fields.enabled,
    type: 'toggle',
    tab: 'general',
    required: true,
  },
];

export const standardMappingFields: readonly WorkflowNodeConfigField[] = [
  {
    key: 'inputMapping',
    label: LANG.fields.inputMapping,
    type: 'mapping',
    tab: 'inputMapping',
    hint: LANG.hints.inputMapping,
  },
  {
    key: 'outputKey',
    label: LANG.fields.outputKey,
    type: 'text',
    tab: 'outputMapping',
    placeholder: LANG.placeholders.outputKey,
  },
  {
    key: 'onFailure',
    label: LANG.fields.onFailure,
    type: 'select',
    tab: 'errorHandling',
    options: LANG.options.onFailure,
  },
  {
    key: 'allowedRoles',
    label: LANG.fields.allowedRoles,
    type: 'multiSelect',
    tab: 'permissions',
  },
  {
    key: 'metadata',
    label: LANG.fields.metadata,
    type: 'json',
    tab: 'advanced',
  },
];

export const fieldActionCriteriaFields: readonly WorkflowNodeConfigField[] = [
  {
    key: 'conditionType',
    label: LANG.fields.conditionType,
    type: 'select',
    tab: 'action',
    required: true,
    options: LANG.options.conditionType,
  },
  {
    key: 'criteria',
    label: LANG.fields.criteria,
    type: 'ruleBuilder',
    tab: 'action',
    hint: LANG.hints.conditionCriteria,
  },
];

export const targetFieldField = (label = LANG.fields.targetField): WorkflowNodeConfigField => ({
  key: 'targetField',
  label,
  type: 'select',
  tab: 'action',
  required: true,
});

