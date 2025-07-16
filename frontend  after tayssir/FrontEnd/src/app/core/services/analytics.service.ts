// src/app/services/analytics.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private baseUrl = '/api/analytics'; // Thanks to proxy.conf.json

  constructor(private http: HttpClient) {}

  getAllAnalytics() {
    return this.http.get(this.baseUrl);
  }

  addAnalytics(data: any) {
    return this.http.post(this.baseUrl, data);
  }
}
