import { HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptorService {
  constructor(private router: Router) {}

  intercept = (
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> => {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.router.navigate(['login']);
          return of();
        }
        return throwError(() => error);
      }),
    );
  };
}
