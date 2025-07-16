import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaiementComponent } from './paiement/paiement.component';
import { SupprimerInvoiceComponent } from './supprimer-invoice/supprimer-invoice.component';
import { RecommendationListComponent } from './recommendation-list/recommendation-list.component';
import { AiDashboardComponent } from './ai-dashboard/ai-dashboard.component';
import { NotificationComponent } from './notification/notification.component';
import { AnalyticsComponent } from './analytics/analytics.component';
  import { AnalyticsChartComponent } from './analytics-chart/analytics-chart.component';
  import { AverageRatingChartComponent } from './average-rating-chart/average-rating-chart.component';

const routes: Routes = [
  { path: '', component: PaiementComponent },
  { path: 'supprimer-facture', component: SupprimerInvoiceComponent },
  { path: 'RecommendationListComponent', component: RecommendationListComponent },
  { path: 'ai-dashboard', component: AiDashboardComponent },
  { path: 'notification', component: NotificationComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'analytics-chart', component: AnalyticsChartComponent },
  { path: 'average-rating-chart', component: AverageRatingChartComponent }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
