import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
} from '@angular/common/http';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  JWT_OPTIONS,
  JwtHelperService,
  JwtModuleOptions,
} from '@auth0/angular-jwt';
import { routes } from './app.routes';

import { getPtBrPaginatorIntl } from './components/crud/paginator-pt-br';
import { LoadingInterceptor } from './components/loading/loading.interceptor';

export function tokenGetter() {
  return localStorage.getItem('token');
}

const jwtModuleOptions: JwtModuleOptions = {
  config: {
    tokenGetter: tokenGetter,
    allowedDomains: ['*'],
    disallowedRoutes: [],
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    JwtHelperService,
    { provide: JWT_OPTIONS, useValue: jwtModuleOptions },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    { provide: MatPaginatorIntl, useValue: getPtBrPaginatorIntl() },
  ],
};
