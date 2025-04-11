// src/services/api/eventsService.ts
import apiClient from './apiClient';

export interface AgeRange {
  min: number;
  max: number;
}

export interface Attendee {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  status: 'going' | 'maybe' | 'invited';
  timestamp: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  location: string;
  date: string;
  time: string;
  ageRange: AgeRange;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  attendees: Attendee[];
  maxAttendees?: number;
  category: 'playdate' | 'workshop' | 'party' | 'class' | 'other';
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventRequest {
  title: string;
  description?: string;
  location: string;
  date: string;
  time: string;
  ageRange: AgeRange;
  maxAttendees?: number;
  category: 'playdate' | 'workshop' | 'party' | 'class' | 'other';
  isPrivate: boolean;
}

export interface RsvpRequest {
  status: 'going' | 'maybe' | 'not-going';
}

export interface RsvpResponse {
  eventId: string;
  status: 'going' | 'maybe' | 'not-going';
  timestamp: string;
  attendeeCount: number;
  isFull: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const eventsService = {
  /**
   * Get all public events
   */
  getEvents: async (page = 0, size = 10, sort = 'date', direction = 'asc'): Promise<PageResponse<Event>> => {
    const response = await apiClient.get<PageResponse<Event>>('/events', {
      params: { page, size, sort, direction }
    });
    return response.data;
  },
  
  /**
   * Get events created by current user
   */
  getMyEvents: async (page = 0, size = 10): Promise<PageResponse<Event>> => {
    const response = await apiClient.get<PageResponse<Event>>('/events/mine', {
      params: { page, size }
    });
    return response.data;
  },
  
  /**
   * Get events user is attending
   */
  getAttendingEvents: async (page = 0, size = 10, status = 'all'): Promise<PageResponse<Event>> => {
    const response = await apiClient.get<PageResponse<Event>>('/events/attending', {
      params: { page, size, status }
    });
    return response.data;
  },
  
  /**
   * Get specific event details
   */
  getEvent: async (eventId: string): Promise<Event> => {
    const response = await apiClient.get<Event>(`/events/${eventId}`);
    return response.data;
  },
  
  /**
   * Create a new event
   */
  createEvent: async (eventData: EventRequest): Promise<Event> => {
    const response = await apiClient.post<Event>('/events', eventData);
    return response.data;
  },
  
  /**
   * Update an event
   */
  updateEvent: async (eventId: string, eventData: EventRequest): Promise<Event> => {
    const response = await apiClient.put<Event>(`/events/${eventId}`, eventData);
    return response.data;
  },
  
  /**
   * Cancel/delete an event
   */
  deleteEvent: async (eventId: string): Promise<void> => {
    await apiClient.delete(`/events/${eventId}`);
  },
  
  /**
   * RSVP to an event
   */
  rsvpToEvent: async (eventId: string, rsvp: RsvpRequest): Promise<RsvpResponse> => {
    const response = await apiClient.post<RsvpResponse>(`/events/${eventId}/rsvp`, rsvp);
    return response.data;
  }
};