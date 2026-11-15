import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenStore } from '../session/token.store';

const LOGIN_URL = '/auth/login';

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const tokenStore = inject(TokenStore);
  const router = inject(Router);
  const token = tokenStore.getToken();

  const outgoing = token
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      })
    : req;

  return next(outgoing).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !req.url.includes(LOGIN_URL)
      ) {
        tokenStore.clearToken();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
