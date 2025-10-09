import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { ToastService } from 'app/components/toast/toast.service';

import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredPermissions = route.data['permissions'] as string[];
    const requireAll = (route.data['requireAll'] as boolean) ?? false;

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const hasPermission = requireAll
      ? this.authService.hasAllPermissions(requiredPermissions)
      : this.authService.hasAnyPermission(requiredPermissions);

    if (!hasPermission) {
      this.toast.openError('Você não tem permissão para acessar esta página');
      this.router.navigateByUrl('/');
      return false;
    }

    return true;
  }
}
