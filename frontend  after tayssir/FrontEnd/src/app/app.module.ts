import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PaiementComponent } from './paiement/paiement.component';
import { FormsModule } from '@angular/forms';
import { SupprimerInvoiceComponent } from './supprimer-invoice/supprimer-invoice.component';
import { RecommendationListComponent } from './recommendation-list/recommendation-list.component';
import { AiDashboardComponent } from './ai-dashboard/ai-dashboard.component';
import { TruncatePipe } from './shared/pipes/truncate.pipe';
import { NotificationComponent } from './notification/notification.component';
import { NotificationTest } from './notification-test/notification-test';
  import { AnalyticsComponent } from './analytics/analytics.component';
  import { AnalyticsChartComponent } from './analytics-chart/analytics-chart.component';
  import { AverageRatingChartComponent } from './average-rating-chart/average-rating-chart.component';
  import { MatCardModule } from '@angular/material/card';
  import { MatButtonModule } from '@angular/material/button';
  import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
  // ...other Material modules
  // ...add other components as needed

@NgModule({
  declarations: [
    AppComponent,
    PaiementComponent,
    SupprimerInvoiceComponent,
    RecommendationListComponent,
    AiDashboardComponent,
    TruncatePipe,
    NotificationComponent,
    NotificationTest
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,  
    AnalyticsComponent,
    AnalyticsChartComponent,
    AverageRatingChartComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
