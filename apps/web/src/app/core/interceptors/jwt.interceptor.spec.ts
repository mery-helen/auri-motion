import { TestBed } from '@angular/core/testing';
import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import { EMPTY, throwError } from 'rxjs';
import { jwtInterceptor } from './jwt.interceptor';
import { TokenStore } from '../session/token.store';

describe('JwtInterceptor', () => {
  let router: Router;
  let tokenStore: TokenStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });

    router = TestBed.inject(Router);
    tokenStore = TestBed.inject(TokenStore);
    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  function runInterceptor(request: HttpRequest<unknown>, error: unknown): unknown {
    const next: HttpHandlerFn = () => throwError(() => error);
    let caught: unknown;

    TestBed.runInInjectionContext(() => {
      jwtInterceptor(request, next).subscribe({
        error: (err: unknown) => {
          caught = err;
        },
      });
    });

    return caught;
  }

  function captureRequest(token: string | null): HttpRequest<unknown> {
    const request = new HttpRequest('GET', '/patients');
    let seen: HttpRequest<unknown> | undefined;

    if (token !== null) {
      tokenStore.saveToken(token);
    }

    const next: HttpHandlerFn = (req) => {
      seen = req;
      return EMPTY;
    };

    TestBed.runInInjectionContext(() => {
      jwtInterceptor(request, next).subscribe();
    });

    if (!seen) {
      throw new Error('next não recebeu a requisição');
    }

    return seen;
  }

  it('ao receber 401 limpa o token e redireciona para /login (CA7)', () => {
    tokenStore.saveToken('jwt-token');
    const unauthorized = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
      error: { message: 'Credenciais inválidas' },
    });

    const caught = runInterceptor(new HttpRequest('GET', '/patients'), unauthorized);

    expect(caught).toBe(unauthorized);
    expect(tokenStore.getToken()).toBeNull();
    expect(localStorage.getItem('auri-motion.access-token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('não sequestra o 401 do POST /auth/login', () => {
    tokenStore.saveToken('jwt-token');
    const unauthorized = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
      error: { message: 'Credenciais inválidas' },
    });

    const caught = runInterceptor(new HttpRequest('POST', '/auth/login', null), unauthorized);

    expect(caught).toBe(unauthorized);
    expect(tokenStore.getToken()).toBe('jwt-token');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('não desloga quando a falha é erro de rede (status 0)', () => {
    tokenStore.saveToken('jwt-token');
    const networkError = new HttpErrorResponse({
      status: 0,
      statusText: 'Unknown Error',
      error: new ProgressEvent('error'),
    });

    const caught = runInterceptor(new HttpRequest('GET', '/patients'), networkError);

    expect(caught).toBe(networkError);
    expect(tokenStore.getToken()).toBe('jwt-token');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('propaga a resposta de sucesso sem limpar o token', () => {
    tokenStore.saveToken('jwt-token');
    const next: HttpHandlerFn = () => EMPTY;
    let completed = false;

    TestBed.runInInjectionContext(() => {
      jwtInterceptor(new HttpRequest('GET', '/patients'), next).subscribe({
        complete: () => {
          completed = true;
        },
      });
    });

    expect(completed).toBe(true);
    expect(tokenStore.getToken()).toBe('jwt-token');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('anexa Authorization: Bearer <token> quando há token no TokenStore', () => {
    const seen = captureRequest('jwt-token');

    expect(seen.headers.has('Authorization')).toBe(true);
    expect(seen.headers.get('Authorization')).toBe('Bearer jwt-token');
    expect(seen.url).toBe('/patients');
  });

  it('não anexa Authorization quando não há token no TokenStore', () => {
    const seen = captureRequest(null);

    expect(seen.headers.has('Authorization')).toBe(false);
    expect(seen.headers.get('Authorization')).toBeNull();
  });
});
