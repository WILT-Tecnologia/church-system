import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ToastService } from 'app/components/toast/toast.service';

import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('/auth/login')) {
      return next.handle(req).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.toast.openError('E-mail ou senha inválidos!');
            return of();
          }
          this.toast.openError('Algo deu errado, tente novamente!');
          return throwError(() => error);
        }),
      );
    }

    const token = this.authService.getToken();
    let cloned = req;
    if (token) {
      cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
    }

    return next.handle(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.clearAuth();
          this.router.navigateByUrl('/login');
          this.toast.openError('Sessão expirada. Faça login novamente.');
          return of();
        }

        return throwError(() => this.toast.openError(error.error.message || 'Algo deu errado, tente novamente!'));
      }),
    );
  }
}
