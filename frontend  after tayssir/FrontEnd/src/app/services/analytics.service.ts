import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Existing Analytics interface with rating added
export interface Analytics {
  id?: number;
  event_id: number;
  views: number;
  bookings: number;
  date?: string | null;   // allow Date and null too
  organizer?: string;  
  rating?: number; // ← existing line
}

// Interface for average rating per organizer
export interface AverageRating {
  organizer: string;
  average_rating: string;  // Backend returns it as string
}

// NEW interface for events count grouped by month and organizer
export interface EventsByMonth {
  month: string;       // e.g. "2025-07" or "July"
  organizer: string;
  event_count: number;
}

// NEW interfaces for advanced search
export interface SearchParams {
  q?: string;
  start_date?: string;
  end_date?: string;
  organizer?: string;
  min_rating?: number;
  max_rating?: number;
  min_views?: number;
  max_views?: number;
  min_bookings?: number;
  max_bookings?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  data: Analytics[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FilterOptions {
  organizers: string[];
  date_range: {
    min: string | null;
    max: string | null;
  };
  rating_range: {
    min: number;
    max: number;
  };
  views_range: {
    min: number;
    max: number;
  };
  bookings_range: {
    min: number;
    max: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'http://localhost:5003/api/analytics/';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Analytics[]> {
    return this.http.get<Analytics[]>(this.apiUrl);
  }

  getById(id: number): Observable<Analytics> {
    return this.http.get<Analytics>(`${this.apiUrl}${id}`);
  }

  create(record: Analytics): Observable<Analytics> {
    return this.http.post<Analytics>(this.apiUrl, record);
  }

  update(id: number, record: Analytics): Observable<Analytics> {
    return this.http.put<Analytics>(`${this.apiUrl}${id}`, record);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}`);
  }

  // Fetch average ratings grouped by organizer
  getAverageRatings(): Observable<AverageRating[]> {
    return this.http.get<AverageRating[]>(`${this.apiUrl}/average-rating`);
  }

  // NEW method to fetch events count grouped by month and organizer
  getEventsByMonth(): Observable<EventsByMonth[]> {
    return this.http.get<EventsByMonth[]>(`${this.apiUrl}/monthly-count`);
  }

  // NEW methods for advanced search
  search(params: SearchParams): Observable<SearchResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.http.get<SearchResponse>(`${this.apiUrl}/search?${queryParams.toString()}`);
  }

  getFilterOptions(): Observable<FilterOptions> {
    return this.http.get<FilterOptions>(`${this.apiUrl}/filter-options`);
  }
}
