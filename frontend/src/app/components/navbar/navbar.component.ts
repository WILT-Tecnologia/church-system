import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, OnInit, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { routes } from 'app/app.routes';
import { ChurchsService } from 'app/pages/private/administrative/churches/churches.service';
import { AuthService } from 'app/services/auth/auth.service';

import { LoadingService } from '../loading/loading.service';
import { USER } from './routes';
import { LogoComponent } from './shared/logo/logo.component';

type RouteProps = {
  path: string;
  icon: string;
  label: string;
  permission?: string;
  items?: RouteProps[];
};

type RouteSection = RouteProps;

type IconMapProps = {
  [key: string]: string;
};

// Mapeamento de rotas para permissões (AJUSTADO para o formato snake_case e sem acentos do DB)
const ROUTE_PERMISSIONS: { [key: string]: string } = {
  dashboard: 'read_dashboard',
  persons: 'read_pessoas',
  churches: 'read_igrejas',
  // Tipos de eventos
  'event-types': 'read_tipos_de_eventos',
  // Cargos ministeriais
  occupations: 'read_cargos_ministeriais',
  // Origem do membro
  'member-origins': 'read_origem_do_membro',
  // Usuários
  users: 'read_usuarios',
  // Perfis
  profiles: 'read_perfis',
  // Permissões
  permissions: 'read_permissoes',
  // Configurações
  settings: 'read_configuracoes',
  // Membros
  members: 'read_membros',
  // Convidados / Visitantes
  guests: 'read_convidados_e_visitantes',
  // Eventos
  events: 'read_eventos',
  // Tasks
  tasks: 'read_tasks',
  // Financeiro
  financial: 'read_financeiro',
};

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
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
    MatExpansionModule,
    MatListModule,
    RouterOutlet,
  ],
})
export class NavbarComponent implements OnInit {
  @ViewChild('desktopSidenav') desktopSidenav!: MatSidenav;
  @ViewChild('sidenav') sidenav!: MatSidenav;
  allRoutes: RouteSection[] = [];
  userRoutes = USER;
  userName: string | null = '';
  isLoggedIn: boolean = true;
  isMobile: boolean = false;
  isSidebarMinimized: boolean = false;
  isSidebarOpen: boolean = true;
  windowLength = 768;
  breadcrumb: string[] = [];
  step = signal(0);
  selectedChurchId: string | null = '';
  selectedChurchName: string = '';
  permissions: string[] = [];

  constructor(
    private router: Router,
    private loading: LoadingService,
    private authService: AuthService,
    private churchService: ChurchsService,
    private activatedRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit() {
    this.getData();
    this.loadPermissions();
    this.initializeRoutes();
    this.getChurch();
    this.getUsername();
    this.getRouteEvents();

    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= this.windowLength;
    }
  }

  private loadPermissions() {
    this.authService.permissions$.subscribe((permissions) => {
      this.permissions = permissions;
      this.initializeRoutes(); // Reinicializar rotas quando permissões mudarem
    });
  }

  private initializeRoutes() {
    const iconMap: IconMapProps = {
      dashboard: 'dashboard',
      administrative: 'settings',
      church: 'church',
      members: 'people',
      guests: 'people',
      events: 'event',
      tasks: 'task',
      financial: 'attach_money',
      settings: 'settings',
      persons: 'person',
      churches: 'church',
      'event-types': 'event',
      occupations: 'work',
      'member-origins': 'person_add',
      users: 'people',
      profiles: 'person',
      permissions: 'key_vertical',
    };

    const mainSections = ['church', 'administrative'];

    this.allRoutes = routes
      .filter((route) => mainSections.includes(route.path || ''))
      .map((route) => {
        const sectionLabel = typeof route.title === 'string' ? route.title.split(' - ')[0] : route.path || '';
        const sectionIcon = iconMap[route.path || ''] || 'settings';

        const items = (route.children || [])
          .filter((child) => {
            if (!child.path || !child.title) return false;

            // Verificar permissão
            const permission = ROUTE_PERMISSIONS[child.path];
            if (permission) {
              // Se a permissão for definida, verifica se o usuário a possui.
              return this.authService.hasPermission(permission);
            }

            // Se a permissão não for definida no ROUTE_PERMISSIONS, o item é exibido por padrão.
            return true;
          })
          .map((child) => ({
            path: child.path!,
            icon: child.path ? iconMap[child.path] || 'settings' : 'settings',
            label: typeof child.title === 'string' ? child.title.split(' - ')[0] : child.path!,
            permission: ROUTE_PERMISSIONS[child.path!],
          }));

        return {
          path: route.path!,
          icon: sectionIcon,
          label: sectionLabel,
          items,
        };
      })
      // O FILTRO AQUI JÁ ESTÁ CORRETO: Remove seções sem itens permitidos.
      .filter((section) => section.items.length > 0);
  }

  setStep(index: number) {
    this.step.set(index);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = event.target.innerWidth <= this.windowLength;
      if (this.isMobile && this.desktopSidenav) {
        this.isSidebarOpen = false;
      }
    }
  }

  private async getRouteEvents() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateBreadcrumbFromRoute();
    });
  }

  private async getUsername() {
    this.authService.user$.subscribe((user) => {
      this.userName = user ? user.name : null;
    });
  }

  private async getChurch() {
    this.churchService.getSelectedChurch().subscribe((church) => {
      if (church) {
        this.selectedChurchId = church.id;
        this.selectedChurchName = church.name;
      } else {
        this.selectedChurchId = null;
        this.selectedChurchName = '';
      }
    });
  }

  private async getData() {
    this.authService.isLoggedIn$.subscribe({
      next: () => {
        const user = this.authService.getUser();
        this.userName = user ? user.name : null;
        this.isLoggedIn = true;
      },
      error: () => {
        this.isLoggedIn = false;
      },
      complete: () => {
        this.hideLoading();
        if (this.isLoggedIn === false) this.router.navigateByUrl('login');
        if (this.isLoggedIn === true) {
          this.getChurch();
        }
      },
    });
  }

  isActiveRoute(path: string): boolean {
    return this.router.isActive(path, {
      paths: 'exact',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  isRouteInSection(section: string): boolean {
    const currentUrl = this.router.url;
    if (section === 'administrative' && currentUrl.startsWith('/administrative')) return true;
    if (section === 'church' && currentUrl.startsWith('/church')) return true;
    if (section === 'user' && currentUrl.includes('/profile')) return true;
    return false;
  }

  isChurchSelected(): boolean {
    return !!localStorage.getItem('selectedChurch');
  }

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  async navigateTo(pathname: string): Promise<boolean> {
    this.loading.show();
    try {
      return await this.router.navigateByUrl(pathname);
    } finally {
      this.loading.hide();
    }
  }

  async logout() {
    try {
      if (this.sidenav && this.sidenav.opened) {
        await this.sidenav.close();
      }
      this.showLoading();
      await this.authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      this.hideLoading();
    }
  }

  private showLoading() {
    this.loading.show();
  }

  private hideLoading() {
    this.loading.hide();
  }

  toggleSidebarDesktop() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  private updateBreadcrumbFromRoute() {
    const root = this.activatedRoute.root;
    const segments: string[] = [];

    let route = root;

    while (route.firstChild) {
      route = route.firstChild;

      const routeTitle = route.snapshot.data?.['title'];
      if (routeTitle) {
        segments.push(routeTitle.split(' - ')[0]);
      } else if (route.snapshot.routeConfig?.path) {
        const routeConfig = route.snapshot.routeConfig;
        let segment: string | undefined;
        if (routeConfig?.title && typeof routeConfig.title === 'string') {
          segment = routeConfig.title;
        } else if (routeConfig?.path && typeof routeConfig.path === 'string') {
          segment = routeConfig.path;
        }
        if (segment) {
          segments.push(segment);
        }
      }
    }

    this.breadcrumb = segments;
  }
}
