import { Component } from '@angular/core';
import { RecommendationService } from '../services/recommendation.service';
import { Event } from '../models/event';

@Component({
  selector: 'app-recommendation-list',
  templateUrl: './recommendation-list.component.html',
  styleUrls: ['./recommendation-list.component.css']
})
export class RecommendationListComponent {
  category = '';
  location = '';
  searchKeyword = '';
  events: Event[] = [];
  allEvents: Event[] = [];
  selectedEvent: Event | null = null;
  categoryFilteredEvents: Event[] = [];
  locationFilteredEvents: Event[] = [];
  categorySearch = '';
  locationSearch = '';

  newEvent: Event = {
    title: '',
    description: '',
    category: '',
    location: '',
    popularity_score: 0
  };

  constructor(private recommendationService: RecommendationService) {
    this.loadAllEvents();
  }

  loadAllEvents() {
    this.recommendationService.getAllEvents().subscribe(data => {
      this.allEvents = data;
      this.events = data;
    });
  }

  searchEvents() {
    if (this.searchKeyword) {
      this.recommendationService.searchByTitle(this.searchKeyword).subscribe(data => {
        this.events = data;
      });
    } else {
      this.loadAllEvents();
    }
  }

  showEventDetails(event: Event) {
    this.selectedEvent = event;
  }

  createEvent() {
    this.recommendationService.createEvent(this.newEvent).subscribe(() => {
      this.loadAllEvents();
      this.newEvent = {
        title: '',
        description: '',
        category: '',
        location: '',
        popularity_score: 0
      };
    });
  }

  updateEvent() {
    if (this.selectedEvent && this.selectedEvent.id) {
      this.recommendationService.updateEvent(this.selectedEvent.id, this.selectedEvent).subscribe(() => {
        this.loadAllEvents();
        this.selectedEvent = null;
      });
    }
  }

  deleteEvent(id: number) {
    if (confirm('Are you sure you want to delete this event?')) {
      this.recommendationService.deleteEvent(id).subscribe(() => {
        this.loadAllEvents();
        if (this.selectedEvent && this.selectedEvent.id === id) {
          this.selectedEvent = null;
        }
      });
    }
  }

  filterByCategory() {
    if (this.categorySearch) {
      this.recommendationService.filterByCategory(this.categorySearch).subscribe(data => {
        this.categoryFilteredEvents = data;
      });
    }
  }

  filterByLocation() {
    if (this.locationSearch) {
      this.recommendationService.filterByLocation(this.locationSearch).subscribe(data => {
        this.locationFilteredEvents = data;
      });
    }
  }
}