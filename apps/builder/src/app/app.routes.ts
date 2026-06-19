import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';
import { FormBuilderPageComponent } from '@builder/features/form-builder/containers/form-builder-page.component';
import { FormPreviewPageComponent } from '@builder/features/form-builder/containers/form-preview-page.component';
import { ReportBuilderPageComponent } from '@builder/features/report-builder/containers/report-builder-page.component';
import { DatasourcesPageComponent } from '@builder/features/datasources/containers/datasources-page.component';

export const routes: Routes = [
  {
    path: 'page-builder/preview',
    loadComponent: () =>
      import('@builder/pages/page-builder/containers/page-builder-page.component').then(
        (m) => m.PageBuilderRoutePageComponent,
      ),
    providers: provideTranslocoScope('page-builder'),
    data: {
      standalonePreview: true,
    },
  },
  {
    path: 'page-builder/form-preview',
    loadComponent: () =>
      import('@builder/pages/page-builder/containers/page-builder-form-preview-page.component').then(
        (m) => m.PageBuilderFormPreviewRoutePageComponent,
      ),
    providers: provideTranslocoScope('page-builder'),
  },
  {
    path: 'page-builder/report-preview',
    loadComponent: () =>
      import('@builder/pages/page-builder/containers/page-builder-report-preview-page.component').then(
        (m) => m.PageBuilderReportPreviewRoutePageComponent,
      ),
    providers: provideTranslocoScope('page-builder'),
  },
  {
    path: 'form-builder/preview',
    component: FormPreviewPageComponent,
    providers: provideTranslocoScope('form-builder'),
  },
  {
    path: 'report-builder/preview',
    loadComponent: () =>
      import('@builder/features/report-builder/containers/report-preview-page.component').then(
        (m) => m.ReportPreviewPageComponent,
      ),
    providers: provideTranslocoScope('report-builder'),
  },
  {
    path: 'mobile-preview',
    loadComponent: () =>
      import('@builder/features/deployment/containers/mobile-preview-page.component').then(
        (m) => m.MobilePreviewPageComponent,
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('@builder/layout/shell/builder-shell.component').then((m) => m.BuilderShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'form-builder' },
      {
        path: 'home',
        loadComponent: () =>
          import('@builder/features/builder-home/builder-home.component').then((m) => m.BuilderHomeComponent),
      },
      {
        path: 'deployment',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'desktop' },
          {
            path: 'desktop',
            loadComponent: () =>
              import('@builder/features/deployment/containers/deployment-page.component').then(
                (m) => m.DeploymentPageComponent,
              ),
          },
          {
            path: 'mobile',
            loadComponent: () =>
              import('@builder/features/deployment/containers/mobile-web-page.component').then(
                (m) => m.MobileWebPageComponent,
              ),
          },
          {
            path: 'users',
            loadComponent: () =>
              import('@builder/features/deployment/containers/deployment-user-management-page.component').then(
                (m) => m.DeploymentUserManagementPageComponent,
              ),
          },
          {
            path: 'preferences',
            loadComponent: () =>
              import('@builder/features/deployment/containers/preferences-page.component').then(
                (m) => m.PreferencesPageComponent,
              ),
          },
        ],
      },
      { path: 'datasources', pathMatch: 'full', redirectTo: '/datasources/sources' },
      {
        path: 'datasources/:section',
        component: DatasourcesPageComponent,
        providers: provideTranslocoScope('datasources'),
      },
      {
        path: 'form-builder',
        component: FormBuilderPageComponent,
        providers: provideTranslocoScope('form-builder'),
      },
      {
        path: 'report-builder',
        component: ReportBuilderPageComponent,
        providers: provideTranslocoScope('report-builder'),
      },
      {
        path: 'page-builder',
        loadComponent: () =>
          import('@builder/pages/page-builder/containers/page-builder-page.component').then(
            (m) => m.PageBuilderRoutePageComponent,
          ),
        providers: provideTranslocoScope('page-builder'),
      },
      {
        path: 'page-builder/edit',
        loadComponent: () =>
          import('@builder/pages/page-builder/containers/page-builder-edit-page.component').then(
            (m) => m.PageBuilderEditRoutePageComponent,
          ),
        providers: provideTranslocoScope('page-builder'),
      },
      {
        path: 'workflow-builder',
        providers: [provideTranslocoScope('workflow-builder')],
        loadChildren: () =>
          import('./features/workflow-builder/workflow-builder.routes').then((m) => m.WORKFLOW_BUILDER_ROUTES),
      },
    ],
  },
];
