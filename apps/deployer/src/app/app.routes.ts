import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export const routes: Routes = [
  // Login is temporarily disabled so the deployer app opens directly.
  // {
  //   path: 'login',
  //   loadComponent: () =>
  //     import('./pages/auth/containers/login-page/login.component').then(
  //       m => m.LoginComponent
  //     )
  // },
  {
    path: '',
    providers: [provideTranslocoScope('deployer')],
    loadComponent: () => import('./core/layout/app-shell/app-shell.component').then(m => m.AppShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/containers/dashboard-page/dashboard-page.component').then(
            m => m.DashboardPageComponent
          )
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/users/containers/users-page/users-page.component').then(
            m => m.UsersPageComponent
          )
      },
      {
        path: 'usage',
        loadComponent: () =>
          import('./pages/usage/containers/usage-page/usage-page.component').then(
            m => m.UsagePageComponent
          )
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/containers/settings-page/settings-page.component').then(
            m => m.SettingsPageComponent
          )
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('./pages/audit/containers/audit-page/audit-page.component').then(
            m => m.AuditPageComponent
          )
      },
    ]
  },
  { path: '**', redirectTo: '' }
];
