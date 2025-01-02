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
import { NavigationEnd, Router } from '@angular/router';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { LoadingService } from '../loading/loading.service';
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
  currentRoute: string | null = null;
  userName: string | null = null;
  isLoggedIn: boolean = true;
  isMobile: boolean = false;
  windowLength = 768;

  constructor(
    private router: Router,
    private loading: LoadingService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: any,
  ) {}

  ngOnInit(): void {
    this.getData();

    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= this.windowLength;
    }

    this.activeUrl();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = event.target.innerWidth <= this.windowLength;
    }
  }

  getData() {
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        const user = this.authService.getUser();
        this.userName = user ? user.name : null;
        this.isLoggedIn = true;
      }
    });
  }

  activeUrl = () => {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;
        if (url.includes('church')) {
          this.currentRoute = 'church';
        } else if (url.includes('administrative')) {
          this.currentRoute = 'administrative';
        } else {
          this.currentRoute = 'church';
        }
      });
  };

  navigateToChurch() {
    this.currentRoute = 'church';
    this.router.navigateByUrl('/church');
  }

  navigateToAdministrative() {
    this.currentRoute = 'administrative';
    this.router.navigateByUrl('/administrative');
  }

  navigateToProfile() {
    this.router.navigateByUrl('/profile');
  }

  navigateToLogin() {
    this.router.navigateByUrl('/login');
  }

  async logout() {
    try {
      this.showLoading();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      this.hideLoading();
    }
  }

  showLoading() {
    this.loading.show();
  }

  hideLoading() {
    this.loading.hide();
  }
}
