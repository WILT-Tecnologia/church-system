import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, Observable, take } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.isLoggedIn$.pipe(
      take(1),
      map((isAuthenticated) => {
        if (
          isAuthenticated &&
          this.authService.isAuthenticated() &&
          localStorage.getItem('selectedChurch')
        ) {
          return true;
        } else {
          this.authService.clearAuth();
          this.router.navigateByUrl('login');
          return false;
        }
      }),
    );
  }
}
