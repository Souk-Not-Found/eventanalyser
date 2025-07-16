import { Component, OnInit } from '@angular/core';
import { RecommendationService } from '../services/recommendation.service';
import { Event } from '../models/event';

@Component({
  selector: 'app-ai-dashboard',
  templateUrl: './ai-dashboard.component.html',
  styleUrls: ['./ai-dashboard.component.css']
})
export class AiDashboardComponent implements OnInit {
  category = '';
  location = '';
  recommendations: Event[] = [];
  popularEvents: Event[] = [];
  selectedEvent: Event | null = null;
  similarEvents: Event[] = [];
  isLoading = false;
  error: string | null = null;
  showSimilarEvents = false;

  constructor(private recommendationService: RecommendationService) {}

  ngOnInit() {
    this.loadPopularEvents();
  }

  onSearch() {
    this.isLoading = true;
    this.error = null;
    this.recommendationService.getAIRecommendations(this.category, this.location)
      .subscribe({
        next: (data) => {
          this.recommendations = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to load recommendations. Please try again.';
          this.isLoading = false;
          console.error(err);
        }
      });
  }

  clearFilters() {
    this.category = '';
    this.location = '';
    this.recommendations = [];
    this.error = null;
    this.showSimilarEvents = false;
    this.similarEvents = [];
  }

  loadPopularEvents() {
    this.recommendationService.getAllEvents().subscribe(data => {
      this.popularEvents = [...data]
        .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0))
        .slice(0, 5);
    });
  }

  onEventSelect(event: Event) {
    this.selectedEvent = event;
    this.showSimilarEvents = true;
    this.isLoading = true;
    this.recommendationService.getSimilarEvents(event.id!).subscribe({
      next: (data) => {
        this.similarEvents = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load similar events.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }
}