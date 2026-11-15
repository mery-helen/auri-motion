import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { RegisterComponent } from './register.component';
import { AuthService } from '../auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: Router;
  let authServiceMock: {
    register: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authServiceMock = {
      register: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve instanciar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('submit com dados válidos chama AuthService.register() e, em sucesso, navega para /login (CA1)', async () => {
    authServiceMock.register.mockReturnValue(
      of({
        id: 'user-1',
        name: 'Dra. Ana Silva',
        email: 'ana@exemplo.com',
        createdAt: new Date().toISOString(),
      }),
    );

    component.form.setValue({
      name: 'Dra. Ana Silva',
      email: 'ana@exemplo.com',
      password: 'StrongPassword@123',
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(authServiceMock.register).toHaveBeenCalledWith({
      name: 'Dra. Ana Silva',
      email: 'ana@exemplo.com',
      password: 'StrongPassword@123',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('submit com senha fraca exibe mensagem de validação no campo e não chama AuthService.register() (CA6)', () => {
    component.form.setValue({
      name: 'Dra. Ana Silva',
      email: 'ana@exemplo.com',
      password: 'fraca',
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(authServiceMock.register).not.toHaveBeenCalled();
    const compiled = fixture.nativeElement as HTMLElement;
    const passwordError = compiled.querySelector('[data-testid="password-error"]');
    expect(passwordError).toBeTruthy();
    expect(passwordError?.textContent).toContain(
      'A senha deve ter no mínimo 8 caracteres, com ao menos 1 letra maiúscula, 1 número e 1 caractere especial.',
    );
  });

  it('submit com e-mail inválido exibe mensagem de validação no campo (CA6)', () => {
    component.form.setValue({
      name: 'Dra. Ana Silva',
      email: 'emailinvalido',
      password: 'StrongPassword@123',
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(authServiceMock.register).not.toHaveBeenCalled();
    const compiled = fixture.nativeElement as HTMLElement;
    const emailError = compiled.querySelector('[data-testid="email-error"]');
    expect(emailError).toBeTruthy();
    expect(emailError?.textContent).toContain('E-mail inválido.');
  });

  it('submit com campos em branco exibe mensagens de campos obrigatórios (CA5)', () => {
    component.form.setValue({
      name: '',
      email: '',
      password: '',
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(authServiceMock.register).not.toHaveBeenCalled();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="name-error"]')?.textContent).toContain(
      'Nome é obrigatório.',
    );
    expect(compiled.querySelector('[data-testid="email-error"]')?.textContent).toContain(
      'E-mail é obrigatório.',
    );
    expect(compiled.querySelector('[data-testid="password-error"]')?.textContent).toContain(
      'Senha é obrigatória.',
    );
  });

  it('quando AuthService.register() rejeita com erro de rede, mensagem de conectividade aparece e os campos permanecem preenchidos (CA10)', () => {
    const networkError = new HttpErrorResponse({
      status: 0,
      statusText: 'Unknown Error',
      error: new ProgressEvent('error'),
    });
    authServiceMock.register.mockReturnValue(throwError(() => networkError));

    component.form.setValue({
      name: 'Dra. Ana Silva',
      email: 'ana@exemplo.com',
      password: 'StrongPassword@123',
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(authServiceMock.register).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();

    const compiled = fixture.nativeElement as HTMLElement;
    const alertMessage = compiled.querySelector('[data-testid="connectivity-error"]');
    expect(alertMessage).toBeTruthy();
    expect(alertMessage?.textContent).toContain('Não foi possível conectar ao servidor.');

    // Verifica que os campos permanecem preenchidos para nova tentativa
    expect(component.form.value.name).toBe('Dra. Ana Silva');
    expect(component.form.value.email).toBe('ana@exemplo.com');
    expect(component.form.value.password).toBe('StrongPassword@123');
  });

  it('quando AuthService.register() rejeita com conflito de e-mail já em uso, exibe mensagem de erro e mantém campos preenchidos', () => {
    const conflictError = new HttpErrorResponse({
      status: 409,
      statusText: 'Conflict',
      error: { message: 'E-mail já está em uso.' },
    });
    authServiceMock.register.mockReturnValue(throwError(() => conflictError));

    component.form.setValue({
      name: 'Dra. Ana Silva',
      email: 'ana@exemplo.com',
      password: 'StrongPassword@123',
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(authServiceMock.register).toHaveBeenCalled();
    const compiled = fixture.nativeElement as HTMLElement;
    const errorMessage = compiled.querySelector('[data-testid="form-error"]');
    expect(errorMessage).toBeTruthy();
    expect(errorMessage?.textContent).toContain('E-mail já está em uso.');
    expect(component.form.value.email).toBe('ana@exemplo.com');
  });
});
