import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login').then(m => m.LoginPage), title: 'Login · Job Tracker' },
  { path: '', canActivate: [authGuard], loadComponent: () => import('./pages/dashboard').then(m => m.DashboardPage), title: 'Job Tracker' },
  { path: '**', redirectTo: '' },
];
