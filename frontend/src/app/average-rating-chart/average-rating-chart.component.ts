import { Component, OnInit } from '@angular/core';
import { AnalyticsService, AverageRating, EventsByMonth } from '../services/analytics.service';
import { ChartData } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';  // make sure imported
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-average-rating-chart',
  standalone: true,
  imports: [NgChartsModule, NgxChartsModule, MatCardModule, MatDividerModule, MatIconModule],
  templateUrl: './average-rating-chart.component.html',
  styleUrls: ['./average-rating-chart.component.scss']
})
export class AverageRatingChartComponent implements OnInit {

  // Pie chart data (average ratings)
  public pieChartData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [{ data: [] }]
  };
  public pieChartType: 'pie' = 'pie';

  // Stacked bar chart data for events by month
  stackedChartData: any[] = [];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadAverageRatings();
    this.loadEventsByMonth();
  }

  loadAverageRatings() {
    this.analyticsService.getAverageRatings().subscribe({
      next: (data: AverageRating[]) => {
        this.pieChartData = {
          labels: data.map(item => item.organizer),
          datasets: [{ data: data.map(item => Number(item.average_rating)) }]
        };
      },
      error: err => console.error('Error loading average ratings:', err)
    });
  }

  loadEventsByMonth() {
    this.analyticsService.getEventsByMonth().subscribe({
      next: (data: EventsByMonth[]) => {
        this.stackedChartData = this.transformEventsByMonthData(data);
      },
      error: err => console.error('Error loading events by month:', err)
    });
  }

  // Transform backend data to ngx-charts stacked bar format
  private transformEventsByMonthData(data: EventsByMonth[]): any[] {
    const months = [...new Set(data.map(d => d.month))];
    const organizers = [...new Set(data.map(d => d.organizer))];

    return months.map(month => ({
      name: month,
      series: organizers.map(org => {
        const found = data.find(d => d.month === month && d.organizer === org);
        return { name: org, value: found ? found.event_count : 0 };
      })
    }));
  }
}
