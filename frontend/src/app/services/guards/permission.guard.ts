import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { ToastService } from 'app/components/toast/toast.service';

import { AbilityService } from '../ability/ability.service';
import { RouteFallbackService } from './route-fallback.service';

export const permissionGuard: CanMatchFn = (route, segments) => {
  const ability = inject(AbilityService);
  const router = inject(Router);
  const toast = inject(ToastService);
  const fallback = inject(RouteFallbackService);

  const required = route.data?.['permissions'] as string[] | undefined;

  if (!required?.length) return true;

  const hasAccess = required.some((perm) => {
    const [action, ...subjectParts] = perm.split('_');
    const subject = subjectParts.join('_');
    return ability.can(action as any, subject as any);
  });

  if (!hasAccess) {
    toast.openError('Você não tem permissão para acessar esta página');
    return router.createUrlTree([fallback.getFirstAllowedRoute()]);
  }

  return true;
};
