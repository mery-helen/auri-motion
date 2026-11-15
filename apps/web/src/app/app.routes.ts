import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    // TODO #2: rota provisória — a tela de listagem de pacientes ainda não existe (Issue #2 — US02).
    path: 'patients',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/patients/patients-stub/patients-stub.component').then(
        (m) => m.PatientsStubComponent,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
];
