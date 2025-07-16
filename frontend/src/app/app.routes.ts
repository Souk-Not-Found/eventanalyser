import { Routes } from '@angular/router';
import { AnalyticsComponent } from './analytics/analytics.component';
import { AverageRatingChartComponent } from './average-rating-chart/average-rating-chart.component';

export const routes: Routes = [
  { path: '', redirectTo: '/analytics', pathMatch: 'full' },  // default redirect
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'average-rating-chart', component: AverageRatingChartComponent },
];
