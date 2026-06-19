import { FormField, WorkflowNode } from '@qo/models';
import {
  WorkflowMappingSource,
  WorkflowMappingSuggestion,
  WorkflowMappingTarget,
} from './workflow-auto-mapping.model';
import {
  WORKFLOW_NODE_DEFINITION_ID_CONFIG_KEY,
  WorkflowNodeConfigField,
  WorkflowNodeDefinition,
} from './workflow-editor-palette.config';
import { WORKFLOW_LANGUAGE } from '../services/workflow-language';

const MAPPING_LANG = WORKFLOW_LANGUAGE.nodeConfig.mappingSources;

export function buildWorkflowMappingSources(
  formFields: readonly FormField[],
  nodes: readonly WorkflowNode[],
  selectedNodeId: string | null
): WorkflowMappingSource[] {
  const formSources = formFields.map((field) => ({
    id: `form:${field.id}`,
    label: field.label,
    path: `start.form.${field.name}`,
    type: field.type,
    origin: 'form' as const,
  }));

  const nodeSources = nodes
    .filter((node) => node.id !== selectedNodeId)
    .flatMap((node) => sourcesForWorkflowNode(node));

  const systemSources: WorkflowMappingSource[] = [
    { id: 'system:recordId', label: MAPPING_LANG.recordId, path: 'start.record.id', type: 'text', origin: 'system' },
    { id: 'system:userId', label: MAPPING_LANG.currentUserId, path: 'user.id', type: 'text', origin: 'system' },
    { id: 'system:userEmail', label: MAPPING_LANG.currentUserEmail, path: 'user.email', type: 'email', origin: 'system' },
    { id: 'system:submittedAt', label: MAPPING_LANG.submittedAt, path: 'start.submittedAt', type: 'date', origin: 'system' },
  ];

  return [...formSources, ...nodeSources, ...systemSources];
}

export function buildWorkflowMappingTargets(
  field: WorkflowNodeConfigField,
  definition: WorkflowNodeDefinition,
  formFields: readonly FormField[]
): WorkflowMappingTarget[] {
  if (field.key === 'values' || definition.id === 'update_form_record') {
    return formFields.map((formField) => ({
      key: formField.name,
      label: formField.label,
      type: formField.type,
      required: formField.required,
    }));
  }

  if (field.key === 'inputMapping') {
    return definition.configSchema
      .filter((candidate) => candidate.tab === 'action' && candidate.required === true)
      .filter((candidate) => candidate.key !== field.key && candidate.type !== 'mapping')
      .map((candidate) => ({
        key: candidate.key,
        label: candidate.label,
        type: candidate.type,
        required: candidate.required,
      }));
  }

  return [
    {
      key: field.key,
      label: field.label,
      type: field.type,
      required: field.required,
    },
  ];
}

export function autoMapWorkflowTargets(
  targets: readonly WorkflowMappingTarget[],
  sources: readonly WorkflowMappingSource[]
): WorkflowMappingSuggestion[] {
  return targets
    .map((target) => bestSourceForTarget(target, sources))
    .filter((suggestion): suggestion is WorkflowMappingSuggestion => !!suggestion);
}

export function workflowSuggestionsToTemplateMapping(
  suggestions: readonly WorkflowMappingSuggestion[]
): Record<string, string> {
  return suggestions.reduce<Record<string, string>>((mapping, suggestion) => {
    mapping[suggestion.targetKey] = `{{${suggestion.sourcePath}}}`;
    return mapping;
  }, {});
}

export function normalizeWorkflowMapping(value: unknown): Record<string, string> {
  if (!value) {
    return {};
  }

  if (typeof value === 'string') {
    try {
      return normalizeWorkflowMapping(JSON.parse(value));
    } catch {
      return {};
    }
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>((mapping, [key, entry]) => {
    if (typeof entry === 'string') {
      mapping[key] = entry;
      return mapping;
    }

    if (entry && typeof entry === 'object' && 'source' in entry) {
      const source = (entry as { source?: unknown }).source;
      mapping[key] = typeof source === 'string' ? source : '';
      return mapping;
    }

    mapping[key] = entry == null ? '' : String(entry);
    return mapping;
  }, {});
}

function sourcesForWorkflowNode(node: WorkflowNode): WorkflowMappingSource[] {
  const definitionId = node.config[WORKFLOW_NODE_DEFINITION_ID_CONFIG_KEY];
  const outputKey = typeof node.config['outputKey'] === 'string' ? node.config['outputKey'] : 'result';
  const baseSource: WorkflowMappingSource = {
    id: `node:${node.id}:output`,
    label: MAPPING_LANG.nodeOutput(node.label),
    path: `${node.id}.${outputKey}`,
    origin: 'node',
  };

  if (definitionId === 'update_form_record' || node.type === 'database_write') {
    return [
      baseSource,
      {
        id: `node:${node.id}:recordId`,
        label: MAPPING_LANG.nodeRecordId(node.label),
        path: `${node.id}.record.id`,
        type: 'text',
        origin: 'node',
      },
    ];
  }

  return [baseSource];
}

function bestSourceForTarget(
  target: WorkflowMappingTarget,
  sources: readonly WorkflowMappingSource[]
): WorkflowMappingSuggestion | null {
  const normalizedTarget = normalizeName(target.key);
  const normalizedLabel = normalizeName(target.label);

  const ranked = sources
    .map((source) => ({
      source,
      confidence: scoreSource(target, normalizedTarget, normalizedLabel, source),
    }))
    .filter((item) => item.confidence >= 0.55)
    .sort((a, b) => b.confidence - a.confidence);

  const best = ranked[0];
  return best
    ? {
        targetKey: target.key,
        sourcePath: best.source.path,
        confidence: best.confidence,
      }
    : null;
}

function scoreSource(
  target: WorkflowMappingTarget,
  normalizedTarget: string,
  normalizedLabel: string,
  source: WorkflowMappingSource
): number {
  const sourcePathParts = source.path.split('.');
  const sourcePathName = sourcePathParts[sourcePathParts.length - 1] ?? source.path;
  const normalizedSource = normalizeName(sourcePathName);
  const normalizedSourceLabel = normalizeName(source.label);
  const typeBoost = target.type && source.type && target.type === source.type ? 0.12 : 0;

  if (normalizedSource === normalizedTarget || normalizedSource === normalizedLabel) {
    return 1;
  }

  if (normalizedSourceLabel === normalizedTarget || normalizedSourceLabel === normalizedLabel) {
    return 0.95 + typeBoost;
  }

  if (aliasesFor(normalizedTarget).some((alias) => alias === normalizedSource || alias === normalizedSourceLabel)) {
    return 0.88 + typeBoost;
  }

  if (
    normalizedSource.includes(normalizedTarget) ||
    normalizedTarget.includes(normalizedSource) ||
    normalizedSourceLabel.includes(normalizedLabel) ||
    normalizedLabel.includes(normalizedSourceLabel)
  ) {
    return 0.72 + typeBoost;
  }

  return typeBoost;
}

function normalizeName(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function aliasesFor(normalizedTarget: string): string[] {
  const aliases: Record<string, string[]> = {
    email: ['contactemail', 'workemail', 'useremail'],
    contactemail: ['email', 'workemail', 'useremail'],
    phone: ['mobile', 'mobilenumber', 'phonenumber', 'contactnumber'],
    mobile: ['phone', 'mobilenumber', 'phonenumber', 'contactnumber'],
    firstname: ['first', 'givenname'],
    lastname: ['last', 'surname', 'familyname'],
    department: ['team', 'division'],
    joiningdate: ['startdate', 'hiredate'],
    employeename: ['name', 'fullname'],
  };

  return aliases[normalizedTarget] ?? [];
}
