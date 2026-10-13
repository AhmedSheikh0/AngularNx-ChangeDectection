import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Zone.js ON (classic). Zone.js patches setInterval, click handlers, Promises, ...
    // and runs a change-detection pass after each of them. That is what makes the
    // timer demo interesting: Eager components re-render on every tick, OnPush ones don't.
    // (With `provideZonelessChangeDetection()` only signals / markForCheck would schedule a pass.)
    provideZoneChangeDetection(),
  ],
};
