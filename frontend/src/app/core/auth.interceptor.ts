import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/** Adds the login to every API call and sends you back to login on 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const header = auth.authHeader();
  const isApi = req.url.startsWith('/api/');
  const isLoginCheck = req.url === '/api/auth/me';

  if (isApi && header && !req.headers.has('Authorization')) {
    req = req.clone({ setHeaders: { Authorization: header } });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && isApi && !isLoginCheck) {
        auth.logout();
      }
      return throwError(() => err);
    }),
  );
};
