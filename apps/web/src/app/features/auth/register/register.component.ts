import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service';

const STRONG_PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly connectivityError = signal<string | null>(null);
  readonly formError = signal<string | null>(null);

  readonly form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(STRONG_PASSWORD_PATTERN)]],
  });

  get nameControl() {
    return this.form.controls.name;
  }

  get emailControl() {
    return this.form.controls.email;
  }

  get passwordControl() {
    return this.form.controls.password;
  }

  get nameError(): string | null {
    if (this.nameControl.invalid && (this.nameControl.dirty || this.nameControl.touched)) {
      if (this.nameControl.hasError('required')) {
        return 'Nome é obrigatório.';
      }
    }
    return null;
  }

  get emailError(): string | null {
    if (this.emailControl.invalid && (this.emailControl.dirty || this.emailControl.touched)) {
      if (this.emailControl.hasError('required')) {
        return 'E-mail é obrigatório.';
      }
      if (this.emailControl.hasError('email')) {
        return 'E-mail inválido.';
      }
    }
    return null;
  }

  get passwordError(): string | null {
    if (this.passwordControl.invalid && (this.passwordControl.dirty || this.passwordControl.touched)) {
      if (this.passwordControl.hasError('required')) {
        return 'Senha é obrigatória.';
      }
      if (this.passwordControl.hasError('pattern')) {
        return 'A senha deve ter no mínimo 8 caracteres, com ao menos 1 letra maiúscula, 1 número e 1 caractere especial.';
      }
    }
    return null;
  }

  onSubmit(): void {
    this.connectivityError.set(null);
    this.formError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/login']);
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);

        const status =
          err instanceof HttpErrorResponse
            ? err.status
            : typeof err === 'object' && err !== null && 'status' in err
              ? (err as { status: number }).status
              : null;

        const errorBody =
          err instanceof HttpErrorResponse
            ? err.error
            : typeof err === 'object' && err !== null && 'error' in err
              ? (err as { error?: { message?: string } }).error
              : null;

        const apiMessage =
          typeof errorBody === 'object' && errorBody !== null && 'message' in errorBody
            ? (errorBody as { message: string }).message
            : null;

        if (
          status === 0 ||
          (err instanceof HttpErrorResponse && err.statusText === 'Unknown Error')
        ) {
          this.connectivityError.set(
            'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
          );
          return;
        }

        if (status === 409) {
          this.formError.set(apiMessage ?? 'E-mail já está em uso.');
          return;
        }

        if (status && status >= 400) {
          this.formError.set(
            apiMessage ?? 'Ocorreu um erro ao processar o cadastro. Tente novamente.',
          );
          return;
        }

        this.connectivityError.set(
          'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
        );
      },
    });
  }
}
