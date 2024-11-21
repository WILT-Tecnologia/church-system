import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    public jwtHelper: JwtHelperService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: Router
  ) {}

  private apiUrl =
    environment.production === true
      ? environment.apiUrl
      : 'http://localhost:3333';

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials);
  }

  storeUserData(token: string, user: any) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getUser(): any {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : 'Peixola';
    }
    return null;
  }

  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      return token ? !this.jwtHelper.isTokenExpired(token) : false;
    }
    return false;
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      this.route.navigate(['/login']);
    }
  }
}
