import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { Church } from 'app/model/Church';
import { User } from 'app/model/User';
import { environment } from 'environments/environment';

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
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.checkInitialAuthState();
  }

  private checkInitialAuthState(): void {
    if (this.isAuthenticated()) {
      const user = this.getUser();
      const permissions = this.getPermissions();
      this.isLoggedInSubject.next(true);
      this.userSubject.next(user);
      this.permissionsSubject.next(permissions);
    } else {
      this.isLoggedInSubject.next(false);
      this.userSubject.next(null);
      this.permissionsSubject.next([]);
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((response) => {
        if (response.status && response.token) {
          this.setValues(response.token, response.user, response.permissions);
          this.isLoggedInSubject.next(true);
          this.userSubject.next(response.user);
          this.permissionsSubject.next(response.permissions);

          // Redirecionar baseado nas permissões
          if (response.churches && response.churches.length > 0) {
            this.router.navigateByUrl('/select-church');
          } else {
            this.router.navigateByUrl('/church/dashboard');
          }
        }
      }),
    );
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
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

  private normalizeModuleName(moduleName: string): string {
    return moduleName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\s/]+/g, '_');
  }

  hasPermission(permission: string): boolean {
    const permissions = this.getPermissions();
    return permissions.includes(permission);
  }

  hasAnyPermission(permissionList: string[]): boolean {
    const permissions = this.getPermissions();
    return permissionList.some((p) => permissions.includes(p));
  }

  hasAllPermissions(permissionList: string[]): boolean {
    const permissions = this.getPermissions();
    return permissionList.every((p) => permissions.includes(p));
  }

  canRead(moduleName: string): boolean {
    const moduleKey = this.normalizeModuleName(moduleName);
    return this.hasPermission(`read_${moduleKey}`);
  }

  canWrite(moduleName: string): boolean {
    const moduleKey = this.normalizeModuleName(moduleName);
    return this.hasPermission(`write_${moduleKey}`);
  }

  canDelete(moduleName: string): boolean {
    const moduleKey = this.normalizeModuleName(moduleName);
    return this.hasPermission(`delete_${moduleKey}`);
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
            next: () => {
              this.clearAuth();
              this.router.navigateByUrl('/login').then(() => {
                window.location.reload();
                resolve();
              });
            },
            error: () => {
              this.clearAuth();
              this.router.navigateByUrl('/login').then(() => {
                window.location.reload();
                resolve();
              });
            },
          });
        } else {
          this.clearAuth();
          this.router.navigateByUrl('/login').then(() => {
            resolve();
          });
        }
      } else {
        resolve();
      }
    });
  }

  private setValues(token: string, user: User, permissions: string[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('permissions', JSON.stringify(permissions));
      this.userSubject.next(user);
      this.permissionsSubject.next(permissions);
    }
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
