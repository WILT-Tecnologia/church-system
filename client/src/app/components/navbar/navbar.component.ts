import {
  Component,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { LogoComponent } from './logo/logo.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    CommonModule,
    LogoComponent,
  ],
})
export class NavbarComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: any,
  ) {}
  userMenu: any;
  userName: string | null = null;
  isLoggedIn: boolean = true;
  isMobile: boolean = false;
  windowLength = 768;

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.userName = user ? user.name : this.userName;

    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= this.windowLength;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = event.target.innerWidth <= this.windowLength;
    }
  }

  navigateToChurch() {
    this.router.navigateByUrl('/church');
  }

  navigateToAdministrative() {
    this.router.navigateByUrl('/administrative');
  }

  navigateToProfile() {
    this.router.navigateByUrl('/profile');
  }

  navigateToLogin() {
    this.router.navigateByUrl('/login');
  }

  logout() {
    this.authService.logout();
  }
}
