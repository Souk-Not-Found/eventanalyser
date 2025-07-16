// src/app/models/event.ts
export interface Event {
  id?: number;
  title: string;
  description: string;
  category: string;
  location: string;
  popularity_score?: number;
}