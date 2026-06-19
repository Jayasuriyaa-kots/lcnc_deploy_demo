import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';
import { workflowEditorUnsavedGuard } from './guards/workflow-editor-unsaved.guard';

export const WORKFLOW_BUILDER_ROUTES: Routes = [
  {
    path: '',
    providers: [provideTranslocoScope('workflow-builder')],
    loadComponent: () =>
      import('./containers/workflow-builder-page').then((m) => m.WorkflowBuilderPageComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'form-actions' },
      {
        path: 'form-actions',
        loadComponent: () =>
          import('./containers/workflow-form-actions').then((m) => m.WorkflowFormActionsComponent),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./containers/workflow-events').then((m) => m.WorkflowEventsComponent),
      },
      {
        path: 'scheduler',
        loadComponent: () =>
          import('./containers/workflow-scheduler').then((m) => m.WorkflowSchedulerComponent),
      },
      {
        path: 'action-buttons',
        loadComponent: () =>
          import('./containers/workflow-action-buttons').then((m) => m.WorkflowActionButtonsComponent),
      },
      {
        path: 'functions',
        loadComponent: () =>
          import('./containers/workflow-functions').then((m) => m.WorkflowFunctionsComponent),
      },
      {
        path: ':workflowId/edit',
        canDeactivate: [workflowEditorUnsavedGuard],
        loadComponent: () =>
          import('./containers/workflow-editor').then((m) => m.WorkflowEditorComponent),
      },
    ],
  },
];
