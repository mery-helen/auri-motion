import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStore } from '../session/token.store';

export const authGuard: CanActivateFn = () => {
  const tokenStore = inject(TokenStore);
  const router = inject(Router);

  if (tokenStore.getToken()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
