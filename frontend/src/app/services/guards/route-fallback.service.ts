import { Injectable } from '@angular/core';

export interface RouteInfo {
  fullPath: string;
  permissions?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class RouteFallbackService {
  private readonly orderedRoutes: RouteInfo[] = [
    {
      fullPath: '/administrative/dashboard-administrativo',
      permissions: ['read_administrative_dashboard_administrativo'],
    },
    { fullPath: '/administrative/persons', permissions: ['read_administrative_pessoas'] },
    { fullPath: '/administrative/churches', permissions: ['read_administrative_igrejas'] },
    { fullPath: '/administrative/event-types', permissions: ['read_administrative_tipos_de_eventos'] },
    { fullPath: '/administrative/occupations', permissions: ['read_administrative_cargos_ministeriais'] },
    { fullPath: '/administrative/member-origins', permissions: ['read_administrative_origem_do_membro'] },
    { fullPath: '/administrative/users', permissions: ['read_administrative_usuarios'] },
    { fullPath: '/administrative/profiles', permissions: ['read_administrative_perfis'] },
    { fullPath: '/administrative/modules', permissions: ['read_administrative_modulos'] },
    {
      fullPath: '/administrative/settings-administrative',
      permissions: ['read_administrative_configuracoes_administrativas'],
    },

    { fullPath: '/church/dashboard-church', permissions: ['read_church_dashboard_igreja'] },
    { fullPath: '/church/members', permissions: ['read_church_membros'] },
    { fullPath: '/church/guests', permissions: ['read_church_convidados_e_visitantes'] },
    { fullPath: '/church/events', permissions: ['read_church_eventos'] },
    { fullPath: '/church/tasks', permissions: ['read_church_tasks'] },
    { fullPath: '/church/financial', permissions: ['read_church_financeiro'] },
    { fullPath: '/church/settings-church', permissions: ['read_church_configuracoes_igreja'] },
  ];

  getFirstAllowedRoute(userPermissions: string[] = []): string {
    for (const route of this.orderedRoutes) {
      if (!route.permissions) return route.fullPath;
      if (route.permissions.some((p) => userPermissions.includes(p))) {
        return route.fullPath;
      }
    }
    return '/profile';
  }
}
