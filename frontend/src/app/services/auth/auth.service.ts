import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { Church } from 'app/model/Church';
import { User } from 'app/model/User';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

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
      this.isLoggedInSubject.next(true);
      this.userSubject.next(user);
    } else {
      this.isLoggedInSubject.next(false);
      this.userSubject.next(null);
    }
  }

  login(email: string, password: string): Observable<{ token: string; user: User; churches: Church[] }> {
    return this.http
      .post<{
        token: string;
        user: User;
        churches: Church[];
      }>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          this.setValues(response.token, response.user);
          this.isLoggedInSubject.next(true);
          this.userSubject.next(response.user);
          this.router.navigateByUrl('/dashboard');
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
        this.clearAuth();
        this.router.navigateByUrl('/login').then(() => {
          window.location.reload();
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private setValues(token: string, user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      this.userSubject.next(user);
    }
  }

  public clearAuth(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      this.isLoggedInSubject.next(false);
      this.userSubject.next(null);
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
