import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStore } from '../session/token.store';

export const guestGuard: CanActivateFn = () => {
  const tokenStore = inject(TokenStore);
  const router = inject(Router);

  if (tokenStore.getToken()) {
    return router.createUrlTree(['/patients']);
  }

  return true;
};
