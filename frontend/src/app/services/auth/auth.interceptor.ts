import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private router = inject(Router);

  intercept = (
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> => {
    try {
      const token = this.authService.getToken();

      let clonedRequest = req;
      if (token) {
        clonedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });
      }

      return next.handle(clonedRequest).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            return from(this.authService.logout()).pipe(
              switchMap(() => from(this.router.navigate(['/login']))),
              switchMap(() => throwError(() => error)),
            );
          }
          return throwError(() => error);
        }),
      );
    } catch (error) {
      console.error('Erro no login:', error);
      return next.handle(req);
    }
  };
}
