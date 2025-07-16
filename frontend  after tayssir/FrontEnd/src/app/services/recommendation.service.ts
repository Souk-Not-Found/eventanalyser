import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/event';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = 'http://localhost:5000'; // Base URL for Flask API

  constructor(private http: HttpClient) { }

  getAIRecommendations(category?: string, location?: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events/recommend`, {
      params: {
        category: category || '',
        location: location || ''
      }
    });
  }

  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events`);
  }

  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${id}`);
  }

  createEvent(event: Event): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/events`, event);
  }

  updateEvent(id: number, event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/events/${id}`, event);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${id}`);
  }

  getSimilarEvents(eventId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events/recommend/${eventId}`);
  }

  searchByTitle(keyword: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events/search/${keyword}`);
  }

  filterByCategory(category: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events/filter/category/${category}`);
  }

  filterByLocation(location: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events/filter/location/${location}`);
  }
}