import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { MessageService, ConfirmationService } from 'primeng/api';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { STORAGE_SERVICE } from './services/storage.service';
import { IndexedDbStorageService } from './services/indexeddb-storage.service';
import { ProjectService } from './services/project.service';
import { definePreset } from '@primeuix/themes';

const CookPlannerPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{zinc.50}',
      100: '{zinc.100}',
      200: '{zinc.200}',
      300: '{zinc.300}',
      400: '{zinc.400}',
      500: '{zinc.500}',
      600: '{zinc.600}',
      700: '{zinc.700}',
      800: '{zinc.800}',
      900: '{zinc.900}',
      950: '{zinc.950}',
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: CookPlannerPreset,
        options: {
          darkModeSelector: '.dark-mode',
        },
      },
    }),
    MessageService,
    ConfirmationService,
    { provide: STORAGE_SERVICE, useClass: IndexedDbStorageService },
    provideAppInitializer(() => {
      const projectService = inject(ProjectService);
      return projectService.initialize();
    }),
  ],
};
