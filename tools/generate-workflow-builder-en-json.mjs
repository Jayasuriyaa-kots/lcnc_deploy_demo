import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';
import ts from 'typescript';
import { loadGlobalCommon, pruneSharedCommon } from './lib/i18n-common.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcPath = path.join(
  root,
  'apps/builder/src/app/features/workflow-builder/services/workflow-language.ts'
);
const jsonPath = path.join(root, 'apps/builder/src/assets/i18n/workflow-builder/en.json');
const { FLAT_COMMON_LANG: flatCommon, commonValues } = loadGlobalCommon(root);

const functionTemplates = {
  'tables.mappedCount': '{{mapped}} of {{total}} mapped',
  'tables.validationCount': '{{count}} validation(s)',
  'tables.matchPercent': '{{percent}}% match',
  'editor.savedAt': 'Saved {{time}}',
  'editor.runningNode': 'Running {{nodeLabel}}',
  'editor.deleteNodeMessage': 'Delete "{{nodeLabel}}"? This cannot be undone.',
  'editor.contextScheduleDateField': 'Based on {{fieldName}}',
  'editor.contextScheduleSpecific': 'On {{date}} at {{time}} · {{repeat}} · {{timezone}}',
  'editor.contextScheduleOffset': '{{count}} {{unit}} {{direction}}',
  'editor.pathLabel': 'Path {{index}}',
  'confirm.deleteSchedule.message': 'Delete "{{scheduleName}}" from the scheduler list?',
  'confirm.deleteEvent.message': 'Delete "{{eventName}}" from the workflow event list?',
  'confirm.deleteActionButton.message': 'Delete "{{actionName}}" from the action list?',
  'confirm.deleteFunction.message': 'Delete "{{functionName}}" from the function library?',
  'validation.required': '{{label}} is required.',
  'validation.tooShort': '{{label}} is too short.',
  'validation.invalid': '{{label}} is invalid.',
  'validation.nodeFieldRequired': '{{nodeLabel}}: {{fieldLabel}} is required.',
  'nodeConfig.mappingSources.nodeOutput': '{{nodeLabel}} output',
  'nodeConfig.mappingSources.nodeRecordId': '{{nodeLabel}} record ID',
  'fallbacks.facade.formWorkflowDescription':
    '{{formName}} workflow triggered on {{formEvent}} when a record is {{recordEvent}}.',
  'fallbacks.facade.eventWorkflowDescription': 'Workflow triggered by {{eventName}}.',
  'fallbacks.facade.schedulerWorkflowDescription': 'Workflow triggered from scheduler using {{modeLabel}}.',
  'fallbacks.facade.workflowName': '{{name}} Workflow',
  'fallbacks.scheduler.nextRun': 'Next run, {{time}} · {{timezone}}',
  'fallbacks.scheduler.followingRun': 'Following run, {{time}} · {{timezone}}',
  'fallbacks.scheduler.onceAt': 'Once at {{time}}',
  'fallbacks.scheduler.everyDayAt': 'Every day at {{time}}',
  'fallbacks.scheduler.everyWeekAt': 'Every week at {{time}}',
  'fallbacks.scheduler.everyMonthAt': 'Every month at {{time}}',
};

function serialize(value, trail = []) {
  if (typeof value === 'function') {
    const key = trail.join('.');
    const template = functionTemplates[key];
    if (!template) {
      throw new Error(`Missing JSON template for function key: ${key}`);
    }
    return template;
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => serialize(item, [...trail, String(index)]));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, serialize(item, [...trail, key])])
    );
  }

  return value;
}

const source = fs.readFileSync(srcPath, 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true,
  },
}).outputText;

const sandbox = {
  exports: {},
  module: { exports: {} },
  require(id) {
    if (id === '@qo/lang') {
      return {
        featureCommon: (featureOverrides) => ({ ...flatCommon, ...featureOverrides }),
      };
    }
    throw new Error(`Unexpected require: ${id}`);
  },
};

sandbox.exports = sandbox.module.exports;
vm.runInNewContext(transpiled, sandbox, { filename: srcPath });

const lang = sandbox.module.exports.WORKFLOW_LANGUAGE;
const json = pruneSharedCommon(serialize(lang), commonValues) ?? {};
fs.writeFileSync(jsonPath, `${JSON.stringify(json, null, 2)}\n`);
console.log('Wrote', jsonPath);
console.log('Top-level keys:', Object.keys(json).join(', '));
