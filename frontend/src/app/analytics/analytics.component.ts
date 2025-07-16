// src/app/analytics/analytics.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { AnalyticsService, Analytics, SearchParams, SearchResponse, FilterOptions } from '../services/analytics.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    MatSelectModule,
    MatSliderModule,
    MatChipsModule,
    MatPaginatorModule
  ],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  analyticsList: Analytics[] = [];
  currentRecord: Analytics = { event_id: 0, views: 0, bookings: 0, organizer: '', rating: 0 };
  isEditing = false;

  // Separated date/time for form
  currentDateOnly: string = '';
  currentTimeOnly: string = '';

  displayedColumns: string[] = ['event_id', 'views', 'bookings', 'date', 'organizer', 'rating', 'actions'];
  averageRatings: { organizer: string; average_rating: string }[] = [];
  eventsByMonth: { month: string; organizer: string; event_count: number }[] = [];

  // NEW: Search and filter properties
  searchParams: SearchParams = {};
  filterOptions: FilterOptions | null = null;
  pagination = {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  };
  isLoading = false;
  showFilters = false;

  constructor(private analyticsService: AnalyticsService, private router: Router) {}

  goToAverageRatingChart() {
    this.router.navigate(['/average-rating-chart']);
  }

  ngOnInit(): void {
    this.loadAll();
    this.loadAverageRatings();
    this.loadEventsByMonth();
    this.loadFilterOptions();
  }

  loadAll() {
    this.analyticsService.getAll().subscribe(data => {
      this.analyticsList = data;
    });
  }

  loadAverageRatings() {
    this.analyticsService.getAverageRatings().subscribe(data => {
      this.averageRatings = data;
    });
  }

  loadEventsByMonth() {
    this.analyticsService.getEventsByMonth().subscribe(data => {
      this.eventsByMonth = data;
    });
  }

  // NEW: Load filter options
  loadFilterOptions() {
    this.analyticsService.getFilterOptions().subscribe(data => {
      this.filterOptions = data;
    });
  }

  // NEW: Perform search
  performSearch() {
    this.isLoading = true;
    this.searchParams.page = this.pagination.page;
    this.searchParams.limit = this.pagination.limit;

    this.analyticsService.search(this.searchParams).subscribe({
      next: (response: SearchResponse) => {
        this.analyticsList = response.data;
        this.pagination = response.pagination;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.isLoading = false;
      }
    });
  }

  // NEW: Clear search
  clearSearch() {
    this.searchParams = {};
    this.pagination.page = 1;
    this.loadAll();
  }

  // NEW: Toggle filters panel
  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  // NEW: Handle pagination
  onPageChange(event: any) {
    this.pagination.page = event.pageIndex + 1;
    this.pagination.limit = event.pageSize;
    this.performSearch();
  }

  // NEW: Remove filter chip
  removeFilter(key: string) {
    delete this.searchParams[key as keyof SearchParams];
    this.pagination.page = 1;
    this.performSearch();
  }

  // NEW: Get active filters for display
  getActiveFilters(): { key: string; value: string }[] {
    const active: { key: string; value: string }[] = [];
    Object.entries(this.searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && key !== 'page' && key !== 'limit') {
        active.push({ key, value: value.toString() });
      }
    });
    return active;
  }

  edit(record: Analytics) {
    const dateObj = new Date(record.date ?? '');
    this.currentDateOnly = dateObj.toISOString().split('T')[0];
    this.currentTimeOnly = dateObj.toTimeString().substring(0, 5);
    this.currentRecord = { ...record };
    this.isEditing = true;
  }

  cancel() {
    this.currentRecord = { event_id: 0, views: 0, bookings: 0, organizer: '', rating: 0 };
    this.currentDateOnly = '';
    this.currentTimeOnly = '';
    this.isEditing = false;
  }

  save() {
    // Merge date and time
    if (this.currentDateOnly && this.currentTimeOnly) {
      const combined = new Date(`${this.currentDateOnly}T${this.currentTimeOnly}`);
      this.currentRecord.date = combined.toISOString();
    }

    if (this.isEditing && this.currentRecord.id) {
      this.analyticsService.update(this.currentRecord.id, this.currentRecord).subscribe(() => {
        this.loadAll();
        this.loadAverageRatings();
        this.loadEventsByMonth();
        this.cancel();
      });
    } else {
      this.analyticsService.create(this.currentRecord).subscribe(() => {
        this.loadAll();
        this.loadAverageRatings();
        this.loadEventsByMonth();
        this.cancel();
      });
    }
  }

  delete(id: number) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.analyticsService.delete(id).subscribe(() => {
        this.loadAll();
        this.loadAverageRatings();
        this.loadEventsByMonth();
      });
    }
  }
}
