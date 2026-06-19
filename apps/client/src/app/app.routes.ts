import { Routes } from '@angular/router';
import { authGuard, scopeGuard } from '@qo/auth-lib';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    canActivate: [authGuard, scopeGuard('app')],
    loadComponent: () => import('./layout/client-shell.component').then(m => m.ClientShellComponent),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: ':pageSlug', loadComponent: () => import('./pages/page-view/page-view.component').then(m => m.PageViewComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];
