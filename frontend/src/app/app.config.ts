import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';

import { NgxMaskConfig, provideEnvironmentNgxMask } from 'ngx-mask';

import { routes } from './app.routes';
import { getPtBrPaginatorIntl } from './components/crud/paginator-pt-br';
import { LoadingInterceptor } from './components/loading/loading.interceptor';
import { AuthInterceptor } from './services/auth/auth.interceptor';

const maskConfigFunction: () => Partial<NgxMaskConfig> = () => {
  return {
    validation: false,
    showMaskTyped: true,
    patterns: {
      '0': {
        pattern: new RegExp('[0-9]'),
      },
    },
  };
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideEnvironmentNgxMask(maskConfigFunction),
    provideHttpClient(withFetch()),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    { provide: MatPaginatorIntl, useValue: getPtBrPaginatorIntl() },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
};
