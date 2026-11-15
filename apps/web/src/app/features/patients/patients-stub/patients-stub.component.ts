import { Component } from '@angular/core';

// TODO #2: componente provisório — a tela de listagem de pacientes ainda não existe (Issue #2 — US02).
@Component({
  selector: 'app-patients-stub',
  template: `
    <main class="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-8">
      <div class="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 text-center">
        <h1 class="text-2xl font-bold text-[#0F2922]">Pacientes</h1>
        <p class="text-sm text-[#52605C] mt-2">Tela em construção.</p>
      </div>
    </main>
  `,
})
export class PatientsStubComponent {}
