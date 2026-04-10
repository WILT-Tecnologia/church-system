import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '@app/services/auth/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): Observable<boolean> | boolean {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/church/dashboard-church']);
      return false;
    }

    return this.authService.isLoggedIn$.pipe(
      take(1),
      map((isAuthenticated) => {
        if (isAuthenticated) {
          this.router.navigate(['/church/dashboard-church']);
          return false;
        }
        return true;
      }),
    );
  }
}
