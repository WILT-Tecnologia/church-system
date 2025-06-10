import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const selectChurchGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const selectedChurch = localStorage.getItem('selectedChurch');

    if (selectedChurch) {
      router.navigate(['/church']).then((r) => r);
      return false;
    }
    return true;
  }

  return true;
};
