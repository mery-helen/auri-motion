import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { authGuard } from './auth.guard';
import { TokenStore } from '../session/token.store';

describe('AuthGuard', () => {
  let router: Router;
  let tokenStore: TokenStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });

    router = TestBed.inject(Router);
    tokenStore = TestBed.inject(TokenStore);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  function runGuard(): boolean | UrlTree {
    let result: boolean | UrlTree = false;
    TestBed.runInInjectionContext(() => {
      result = authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as
        | boolean
        | UrlTree;
    });
    return result;
  }

  it('bloqueia rota sem token e redireciona para /login (CA9)', () => {
    const result = runGuard();

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });

  it('permite a navegação quando existe token na sessão', () => {
    tokenStore.saveToken('jwt-token');

    expect(runGuard()).toBe(true);
  });
});

describe('TokenStore', () => {
  let tokenStore: TokenStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    tokenStore = TestBed.inject(TokenStore);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('é o único dono da chave auri-motion.access-token e faz round-trip do token', () => {
    tokenStore.saveToken('jwt-token');

    expect(localStorage.getItem('auri-motion.access-token')).toBe('jwt-token');
    expect(tokenStore.getToken()).toBe('jwt-token');

    tokenStore.clearToken();

    expect(localStorage.getItem('auri-motion.access-token')).toBeNull();
    expect(tokenStore.getToken()).toBeNull();
  });
});
