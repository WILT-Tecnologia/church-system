import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { environment } from 'environments/environment';

import { Church } from 'app/model/Church';
import { User } from 'app/model/User';

import { RouteFallbackService } from '../guards/route-fallback.service';

interface LoginResponse {
  status: boolean;
  token: string;
  user: User;
  churches: Church[];
  roles: string[];
  permissions: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  private permissionsSubject = new BehaviorSubject<string[]>([]);
  permissions$ = this.permissionsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private routeFallback: RouteFallbackService,
    @Inject(PLATFORM_ID) private platformId: object,
    private zone: NgZone,
  ) {
    this.restoreSession();
  }

  private restoreSession() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;
      const permissionsJson = localStorage.getItem('permissions');
      const permissions = permissionsJson ? JSON.parse(permissionsJson) : [];

      if (token && user) {
        this.isLoggedInSubject.next(true);
        this.userSubject.next(user);
        this.permissionsSubject.next(permissions);
      }
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((response) => {
        if (response.status && response.token) {
          this.storeAuthData(response.token, response.user, response.permissions);

          if (response.churches?.length > 0) {
            localStorage.setItem('churches', JSON.stringify(response.churches));
          }

          if (response.churches?.length > 1) {
            this.router.navigate(['/select-church']);
          } else if (response.churches?.length === 1) {
            localStorage.setItem('selectedChurch', response.churches[0].id);
            this.router.navigateByUrl(this.routeFallback.getFirstAllowedRoute(response.permissions));
          } else {
            this.router.navigateByUrl(this.routeFallback.getFirstAllowedRoute(response.permissions));
          }
        }
      }),
    );
  }

  private storeAuthData(token: string, user: User, permissions: string[]) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('permissions', JSON.stringify(permissions));

      this.isLoggedInSubject.next(true);
      this.userSubject.next(user);
      this.permissionsSubject.next(permissions);
    }
  }

  getToken(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
  }

  getUser(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  getPermissions(): string[] {
    if (isPlatformBrowser(this.platformId)) {
      const permissions = localStorage.getItem('permissions');
      return permissions ? JSON.parse(permissions) : [];
    }
    return [];
  }

  hasPermission(permission: string): boolean {
    return this.getPermissions().includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    const userPerms = this.getPermissions();
    return permissions.some((p) => userPerms.includes(p));
  }

  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      return !!token;
    }
    return false;
  }

  logout(): Promise<void> {
    return new Promise((resolve) => {
      if (isPlatformBrowser(this.platformId)) {
        const user = this.getUser();
        if (user) {
          this.http.post(`${this.apiUrl}/auth/logout/${user.id}`, {}).subscribe({
            next: () => this.clearAndRedirect(resolve),
            error: () => this.clearAndRedirect(resolve),
          });
        } else {
          this.clearAndRedirect(resolve);
        }
      } else {
        resolve();
      }
    });
  }

  private clearAndRedirect(resolve: () => void) {
    localStorage.clear();
    this.isLoggedInSubject.next(false);
    this.userSubject.next(null);
    this.permissionsSubject.next([]);

    this.zone.run(() => {
      const currentUrl = this.router.url || window.location.pathname;
      if (!currentUrl.includes('/login')) {
        this.router.navigate(['/login'], { replaceUrl: true }).catch(() => {
          window.location.href = '/login';
        });
      }
    });
  }

  public clearAuth(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      this.isLoggedInSubject.next(false);
      this.userSubject.next(null);
      this.permissionsSubject.next([]);
    }
  }

  updateUser(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(user));
      this.userSubject.next(user);
    }
  }

  get isLoggedIn() {
    return this.isLoggedIn$;
  }
}
