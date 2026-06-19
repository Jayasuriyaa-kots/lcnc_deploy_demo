import { Provider } from '@angular/core';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { WorkflowBuilderI18nService } from '../services/workflow-builder-i18n.service';

const WORKFLOW_BUILDER_TEST_TRANSLATIONS = {
  actions: {
    back: 'Back',
    cancel: 'Cancel',
    clear: 'Clear',
    delete: 'Delete',
    done: 'Done',
    duplicate: 'Duplicate',
    edit: 'Edit',
    save: 'Save',
    validate: 'Validate',
  },
  fields: {
    selectOption: 'Select option',
  },
  layout: {
    form: 'Form',
  },
  workflowBuilder: {},
};

const WORKFLOW_BUILDER_TEST_SCOPED_KEYS: Record<string, string> = {
  'confirm.leaveWorkflow.title': 'Leave Workflow?',
  'confirm.leaveWorkflow.confirmLabel': 'Leave',
  'confirm.leaveWorkflow.cancelLabel': 'Stay',
  'editor.unsavedLeaveConfirm': 'You have unsaved workflow changes. Leave without saving?',
  'validation.scheduleRequiredFields': 'Complete the required schedule fields before continuing.',
};

function translateWorkflowBuilderTestKey(key: string, params?: Record<string, unknown>): string {
  if (key === 'validation.required') {
    return `${params?.['label']} is required.`;
  }

  if (key === 'validation.tooShort') {
    return `${params?.['label']} is too short.`;
  }

  if (key === 'validation.invalid') {
    return `${params?.['label']} is invalid.`;
  }

  return WORKFLOW_BUILDER_TEST_SCOPED_KEYS[key] ?? key;
}

export const WORKFLOW_BUILDER_TRANSLOCO_TESTING_IMPORT = TranslocoTestingModule.forRoot({
  langs: {
    en: WORKFLOW_BUILDER_TEST_TRANSLATIONS,
  },
  translocoConfig: {
    availableLangs: ['en'],
    defaultLang: 'en',
    fallbackLang: 'en',
    reRenderOnLangChange: false,
    prodMode: true,
  },
});

export const WORKFLOW_BUILDER_I18N_TESTING_PROVIDER: Provider = {
  provide: WorkflowBuilderI18nService,
  useValue: {
    scope: translateWorkflowBuilderTestKey,
    global: translateWorkflowBuilderTestKey,
    common: translateWorkflowBuilderTestKey,
  },
};
