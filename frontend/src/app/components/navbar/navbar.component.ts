import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListItem, MatNavList } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { LoadingService } from '../loading/loading.service';
import { LogoComponent } from './logo/logo.component';
import { GLOBAL, USER } from './routes';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
    imports: [
        MatToolbarModule,
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        CommonModule,
        MatDividerModule,
        LogoComponent,
        MatSidenavContainer,
        MatSidenavContent,
        MatSidenav,
        MatNavList,
        MatListItem,
        RouterOutlet,
    ]
})
export class NavbarComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  routesGlobal = GLOBAL;
  routesUser = USER;
  userName: string | null = '';
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

  isActiveRoute(path: string): boolean {
    return this.router.url.includes(path) && !this.isMobile;
  }

  isChurchSelected(): boolean {
    return !!localStorage.getItem('selectedChurch');
  }

  navigateTo(pathname: string): Promise<boolean> {
    if (this.sidenav && this.sidenav.opened) {
      this.sidenav.close();
    }

    return this.router.navigateByUrl(pathname);
  }

  async logout() {
    try {
      if (this.sidenav && this.sidenav.opened) {
        await this.sidenav.close();
      }
      this.showLoading();
      await new Promise((resolve) => setTimeout(resolve, 500));
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
