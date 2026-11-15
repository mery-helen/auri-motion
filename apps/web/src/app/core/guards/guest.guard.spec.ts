import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { guestGuard } from './guest.guard';
import { TokenStore } from '../session/token.store';

describe('GuestGuard', () => {
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
      result = guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as
        | boolean
        | UrlTree;
    });
    return result;
  }

  it('bloqueia /login com token válido e redireciona para /patients (CA8)', () => {
    tokenStore.saveToken('jwt-token');

    const result = runGuard();

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/patients');
  });

  it('permite a navegação quando não existe token na sessão', () => {
    expect(runGuard()).toBe(true);
  });
});
