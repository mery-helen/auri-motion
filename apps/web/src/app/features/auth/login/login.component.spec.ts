import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginComponent } from './login.component';
import { AuthService } from '../auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;
  let authServiceMock: {
    login: ReturnType<typeof vi.fn>;
    saveToken: ReturnType<typeof vi.fn>;
    getToken: ReturnType<typeof vi.fn>;
    clearToken: ReturnType<typeof vi.fn>;
  };

  const fieldSpecificPhrases = [
    'e-mail não encontrado',
    'e-mail não existe',
    'senha incorreta',
    'senha inválida',
    'usuário não encontrado',
  ];

  beforeEach(async () => {
    authServiceMock = {
      login: vi.fn(),
      saveToken: vi.fn(),
      getToken: vi.fn(),
      clearToken: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve instanciar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('submit com credenciais válidas chama AuthService.login(), armazena o token e navega para /patients (CA2)', () => {
    authServiceMock.login.mockReturnValue(of({ accessToken: 'jwt-token', expiresIn: 3600 }));

    component.form.setValue({
      email: 'ana@exemplo.com',
      password: 'StrongPassword@123',
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'ana@exemplo.com',
      password: 'StrongPassword@123',
    });
    expect(authServiceMock.saveToken).toHaveBeenCalledWith('jwt-token');
    expect(router.navigate).toHaveBeenCalledWith(['/patients']);
  });

  it('quando AuthService.login() rejeita com credenciais inválidas, exibe a mensagem genérica sem especificar o campo (CA3)', () => {
    const unauthorizedError = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
      error: { message: 'Credenciais inválidas' },
    });
    authServiceMock.login.mockReturnValue(throwError(() => unauthorizedError));

    component.form.setValue({
      email: 'ana@exemplo.com',
      password: 'senha-errada',
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(authServiceMock.login).toHaveBeenCalled();
    expect(authServiceMock.saveToken).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();

    const compiled = fixture.nativeElement as HTMLElement;
    const errorElement = compiled.querySelector('[data-testid="form-error"]');
    expect(errorElement).toBeTruthy();

    const errorText = (errorElement?.textContent ?? '').toLowerCase();
    const wholeText = (compiled.textContent ?? '').toLowerCase();

    expect(errorText).toContain('credenciais inválidas');
    for (const phrase of fieldSpecificPhrases) {
      expect(errorText).not.toContain(phrase);
      expect(wholeText).not.toContain(phrase);
    }
  });

  it('submit com campos obrigatórios em branco exibe mensagens de campo e não chama AuthService.login()', () => {
    component.form.setValue({
      email: '',
      password: '',
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(authServiceMock.login).not.toHaveBeenCalled();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="email-error"]')?.textContent).toContain(
      'E-mail é obrigatório.',
    );
    expect(compiled.querySelector('[data-testid="password-error"]')?.textContent).toContain(
      'Senha é obrigatória.',
    );
  });
});
