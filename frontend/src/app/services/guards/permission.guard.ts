import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { ToastService } from 'app/components/toast/toast.service';

import { AuthService } from '../auth/auth.service';
import { RouteFallbackService } from './route-fallback.service';

export const permissionGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  const fallbackService = inject(RouteFallbackService);

  const requiredPermissions = route.data?.['permissions'] as string[] | undefined;

  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  const userPermissions = authService.getPermissions();
  const hasPermission = requiredPermissions.some((p) => userPermissions.includes(p));

  if (!hasPermission) {
    toast.openError('Você não tem permissão para acessar esta página');
    const fallbackUrl = fallbackService.getFirstAllowedRoute(userPermissions);
    return router.createUrlTree([fallbackUrl]);
  }

  return true;
};
