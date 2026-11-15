import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service';

const GENERIC_CREDENTIALS_ERROR = 'Credenciais inválidas';
const GENERIC_REQUEST_ERROR = 'Não foi possível entrar. Tente novamente.';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly formError = signal<string | null>(null);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  get emailControl() {
    return this.form.controls.email;
  }

  get passwordControl() {
    return this.form.controls.password;
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
    }
    return null;
  }

  onSubmit(): void {
    this.formError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.authService.saveToken(response.accessToken);
        // TODO #2: rota provisória — a tela de listagem de pacientes ainda não existe (Issue #2 — US02).
        this.router.navigate(['/patients']);
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);

        if (this.isUnauthorized(err)) {
          this.formError.set(this.readApiMessage(err) ?? GENERIC_CREDENTIALS_ERROR);
          return;
        }

        this.formError.set(GENERIC_REQUEST_ERROR);
      },
    });
  }

  private isUnauthorized(err: unknown): boolean {
    if (err instanceof HttpErrorResponse) {
      return err.status === 401;
    }
    return (
      typeof err === 'object' &&
      err !== null &&
      'status' in err &&
      (err as { status: number }).status === 401
    );
  }

  private readApiMessage(err: unknown): string | null {
    const errorBody =
      err instanceof HttpErrorResponse
        ? err.error
        : typeof err === 'object' && err !== null && 'error' in err
          ? (err as { error?: unknown }).error
          : null;

    if (typeof errorBody === 'object' && errorBody !== null && 'message' in errorBody) {
      const message = (errorBody as { message?: unknown }).message;
      return typeof message === 'string' ? message : null;
    }

    return null;
  }
}
