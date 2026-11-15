import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    // TODO #2: rota provisória — a tela de listagem de pacientes ainda não existe (Issue #2 — US02).
    path: 'patients',
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
