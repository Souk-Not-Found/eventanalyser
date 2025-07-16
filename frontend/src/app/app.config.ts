// src/app/app.config.ts
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NgChartsModule } from 'ng2-charts';

// Import Angular Material modules for Datepicker
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';

export const appConfig = {
  providers: [
    importProvidersFrom(
      HttpClientModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MatFormFieldModule,
      MatInputModule,
      NgChartsModule,
      RouterModule.forRoot(routes)   // <== add routing here

      
      
    
    ),
    provideAnimationsAsync(), provideAnimationsAsync()
  ]
};
