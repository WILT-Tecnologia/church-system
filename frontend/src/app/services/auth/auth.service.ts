import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Church } from 'app/model/Church';
import { User } from 'app/model/User';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private route = Inject(Router);

  private isLoggedInSubject = new BehaviorSubject<boolean>(
    this.isAuthenticated(),
  );
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any,
  ) {
    if (this.isAuthenticated()) {
      this.isLoggedInSubject.next(true);
    } else {
      this.isLoggedInSubject.next(false);
    }
  }

  initializeAuthState(): Promise<boolean> {
    return new Promise((resolve) => {
      const isLoggedIn = this.isAuthenticated();
      this.isLoggedInSubject.next(isLoggedIn);
      resolve(isLoggedIn);
    });
  }

  login(
    email: string,
    password: string,
  ): Observable<{ token: string; user: User; churches: Church[] }> {
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
        }),
      );
  }

  private setValues(token: string, user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      return !!token;
    }
    return false;
  }

  get isLoggedIn() {
    return this.isLoggedIn$;
  }

  logout(): Promise<void> {
    return new Promise((resolve) => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.clear();
        this.isLoggedInSubject.next(false);
        this.route.navigate(['login']);
      }
      resolve();
    });
  }
}
