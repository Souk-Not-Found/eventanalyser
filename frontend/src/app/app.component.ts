import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AnalyticsComponent } from './analytics/analytics.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, AnalyticsComponent,RouterModule], // Must include HttpClientModule
  template: `<router-outlet></router-outlet>`

})
export class AppComponent {
  title = 'frontend'; // Required for tests
  response: any;

  constructor(private http: HttpClient) {}

  testApi() {
    this.http.get('/api/analytics').subscribe({
      next: (res) => this.response = res,
      error: (err) => this.response = { error: err.message }
    });
  }
}