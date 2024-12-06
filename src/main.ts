import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts'; // Import the routes configuration

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    provideHttpClient(), // Enable HTTP client
    provideClientHydration(), // For server-side rendering if needed
    provideRouter(routes), provideAnimationsAsync(), provideCharts(withDefaultRegisterables()), // Register routing
  ],
})
  .catch((err) => console.error(err));
