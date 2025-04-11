// src/services/eventsService.ts
import { getCurrentUser, getSampleParents } from './matchingService';
import { eventsService as apiEventsService, 
  Event as ApiEvent, 
  EventRequest, 
  RsvpRequest,
  Attendee as ApiAttendee } from './api/eventsService';

export interface EventAttendee {
  userId: string;
  status: 'going' | 'maybe' | 'invited';
}

export interface ParentEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string; // ISO date string
  time: string;
  ageRange: {
    min: number;
    max: number;
  };
  createdBy: string; // User ID / email
  attendees: EventAttendee[];
  maxAttendees?: number;
  category: 'playdate' | 'workshop' | 'party' | 'class' | 'other';
  isPrivate: boolean;
}

// Flag to determine if we should use the API or local storage
// This could be set based on environment, configuration, or feature flags
let useApi = true;

// Set API usage mode
export const setApiMode = (enabled: boolean) => {
  useApi = enabled;
};

// Generate a simple UUID for IDs when using local storage
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Initialize sample events (only used in local storage mode)
export const initializeEvents = () => {
  if (useApi) {
    // No need to initialize in API mode
    return;
  }

  // Check if we've already initialized
  if (localStorage.getItem('eventsInitialized')) {
    return;
  }
  
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return;
  }
  
  const sampleParents = getSampleParents();
  if (!sampleParents || sampleParents.length === 0) {
    return;
  }
  
  // Current date for reference
  const now = new Date();
  
  // Sample events - mixture of user's events and others' events
  const sampleEvents: ParentEvent[] = [
    {
      id: generateId(),
      title: "Park Playdate",
      description: "Join us for a fun afternoon at Central Park! We'll meet by the main playground. Bring snacks and water.",
      location: "Central Park, Main Playground",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3).toISOString(),
      time: "15:00-17:00",
      ageRange: {
        min: 3,
        max: 7
      },
      createdBy: sampleParents[0].email,
      attendees: [
        { userId: sampleParents[0].email, status: 'going' },
        { userId: sampleParents[1].email, status: 'going' },
        { userId: sampleParents[2].email, status: 'maybe' }
      ],
      maxAttendees: 8,
      category: 'playdate',
      isPrivate: false
    },
    // ... other sample events ...
  ];
  
  localStorage.setItem('events', JSON.stringify(sampleEvents));
  localStorage.setItem('eventsInitialized', 'true');
};

// Convert API event to local format
const convertApiEventToLocal = (apiEvent: ApiEvent): ParentEvent => {
  return {
    id: apiEvent.id,
    title: apiEvent.title,
    description: apiEvent.description || '',
    location: apiEvent.location,
    date: apiEvent.date,
    time: apiEvent.time,
    ageRange: apiEvent.ageRange,
    createdBy: apiEvent.createdBy.id,
    attendees: apiEvent.attendees.map(att => ({
      userId: att.user.id,
      status: att.status
    })),
    maxAttendees: apiEvent.maxAttendees,
    category: apiEvent.category,
    isPrivate: apiEvent.isPrivate
  };
};

// Convert local event to API request format
const convertLocalToApiRequest = (event: Omit<ParentEvent, 'id' | 'attendees'>): EventRequest => {
  return {
    title: event.title,
    description: event.description,
    location: event.location,
    date: event.date,
    time: event.time,
    ageRange: event.ageRange,
    maxAttendees: event.maxAttendees,
    category: event.category,
    isPrivate: event.isPrivate
  };
};

// Get all events
export const getEvents = async (): Promise<ParentEvent[]> => {
  if (useApi) {
    try {
      const response = await apiEventsService.getEvents();
      return response.content.map(convertApiEventToLocal);
    } catch (error) {
      console.error('API error getting events:', error);
      // Fallback to local storage if API fails
      return getLocalEvents();
    }
  } else {
    return getLocalEvents();
  }
};

// Local implementation of getEvents
const getLocalEvents = (): ParentEvent[] => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return [];
  }
  
  const storedEvents = localStorage.getItem('events');
  if (!storedEvents) {
    return [];
  }
  
  try {
    const events: ParentEvent[] = JSON.parse(storedEvents);
    
    // Filter out private events that the user isn't part of
    return events.filter(event => {
      if (!event.isPrivate) {
        return true; // Show all public events
      }
      
      // For private events, only show if the user is involved
      return event.createdBy === currentUser.email || 
        event.attendees.some(attendee => attendee.userId === currentUser.email);
    });
  } catch (error) {
    console.error('Error parsing events:', error);
    return [];
  }
};

// Get events the current user is attending
export const getUserEvents = async (): Promise<ParentEvent[]> => {
  if (useApi) {
    try {
      const response = await apiEventsService.getAttendingEvents();
      return response.content.map(convertApiEventToLocal);
    } catch (error) {
      console.error('API error getting user events:', error);
      // Fallback to local storage if API fails
      return getLocalUserEvents();
    }
  } else {
    return getLocalUserEvents();
  }
};

// Local implementation of getUserEvents
const getLocalUserEvents = (): ParentEvent[] => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return [];
  }
  
  const allEvents = getLocalEvents();
  
  return allEvents.filter(event => 
    event.attendees.some(
      attendee => attendee.userId === currentUser.email && 
      (attendee.status === 'going' || attendee.status === 'maybe')
    )
  );
};

// Get events created by the current user
export const getHostedEvents = async (): Promise<ParentEvent[]> => {
  if (useApi) {
    try {
      const response = await apiEventsService.getMyEvents();
      return response.content.map(convertApiEventToLocal);
    } catch (error) {
      console.error('API error getting hosted events:', error);
      // Fallback to local storage if API fails
      return getLocalHostedEvents();
    }
  } else {
    return getLocalHostedEvents();
  }
};

// Local implementation of getHostedEvents
const getLocalHostedEvents = (): ParentEvent[] => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return [];
  }
  
  const allEvents = getLocalEvents();
  
  return allEvents.filter(event => event.createdBy === currentUser.email);
};

// Get an event by ID
export const getEvent = async (eventId: string): Promise<ParentEvent | null> => {
  if (useApi) {
    try {
      const apiEvent = await apiEventsService.getEvent(eventId);
      return convertApiEventToLocal(apiEvent);
    } catch (error) {
      console.error('API error getting event by ID:', error);
      // Fallback to local storage if API fails
      return getLocalEvent(eventId);
    }
  } else {
    return getLocalEvent(eventId);
  }
};

// Local implementation of getEvent
const getLocalEvent = (eventId: string): ParentEvent | null => {
  const events = getLocalEvents();
  return events.find(event => event.id === eventId) || null;
};

// Create a new event
export const createEvent = async (eventData: Omit<ParentEvent, 'id' | 'attendees'>): Promise<ParentEvent | null> => {
  if (useApi) {
    try {
      const apiRequest = convertLocalToApiRequest(eventData);
      const createdEvent = await apiEventsService.createEvent(apiRequest);
      return convertApiEventToLocal(createdEvent);
    } catch (error) {
      console.error('API error creating event:', error);
      // Fallback to local storage if API fails
      return createLocalEvent(eventData);
    }
  } else {
    return createLocalEvent(eventData);
  }
};

// Local implementation of createEvent
const createLocalEvent = (eventData: Omit<ParentEvent, 'id' | 'attendees'>): ParentEvent | null => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return null;
  }
  
  const newEvent: ParentEvent = {
    ...eventData,
    id: generateId(),
    attendees: [
      { userId: currentUser.email, status: 'going' }
    ]
  };
  
  // Get existing events and add new one
  const storedEvents = localStorage.getItem('events');
  const allEvents = storedEvents ? JSON.parse(storedEvents) : [];
  allEvents.push(newEvent);
  
  localStorage.setItem('events', JSON.stringify(allEvents));
  
  return newEvent;
};

// Update an event
export const updateEvent = async (eventId: string, eventData: Omit<ParentEvent, 'id' | 'attendees'>): Promise<ParentEvent | null> => {
  if (useApi) {
    try {
      const apiRequest = convertLocalToApiRequest(eventData);
      const updatedEvent = await apiEventsService.updateEvent(eventId, apiRequest);
      return convertApiEventToLocal(updatedEvent);
    } catch (error) {
      console.error('API error updating event:', error);
      // No local fallback for update as it would be complex to implement
      return null;
    }
  } else {
    // Local update not implemented in original code
    console.warn('Event update not supported in local storage mode');
    return null;
  }
};

// Delete/cancel an event
export const deleteEvent = async (eventId: string): Promise<boolean> => {
  if (useApi) {
    try {
      await apiEventsService.deleteEvent(eventId);
      return true;
    } catch (error) {
      console.error('API error deleting event:', error);
      // No local fallback for delete
      return false;
    }
  } else {
    // Local delete not implemented in original code
    console.warn('Event deletion not supported in local storage mode');
    return false;
  }
};

// Update an event RSVP
export const updateEventRSVP = async (eventId: string, status: 'going' | 'maybe' | 'not-going'): Promise<boolean> => {
  if (useApi) {
    try {
      const rsvpRequest: RsvpRequest = { status };
      await apiEventsService.rsvpToEvent(eventId, rsvpRequest);
      return true;
    } catch (error) {
      console.error('API error updating RSVP:', error);
      // Fallback to local storage if API fails
      return updateLocalEventRSVP(eventId, status);
    }
  } else {
    return updateLocalEventRSVP(eventId, status);
  }
};

// Local implementation of updateEventRSVP
const updateLocalEventRSVP = (eventId: string, status: 'going' | 'maybe' | 'not-going'): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return false;
  }
  
  const storedEvents = localStorage.getItem('events');
  if (!storedEvents) {
    return false;
  }
  
  try {
    const events: ParentEvent[] = JSON.parse(storedEvents);
    const eventIndex = events.findIndex(event => event.id === eventId);
    
    if (eventIndex === -1) {
      return false;
    }
    
    const event = events[eventIndex];
    
    // Find if user is already in attendees
    const attendeeIndex = event.attendees.findIndex(attendee => 
      attendee.userId === currentUser.email
    );
    
    if (status === 'not-going') {
      // Remove the user from attendees if they're not going
      if (attendeeIndex !== -1) {
        event.attendees.splice(attendeeIndex, 1);
      }
    } else {
      // Update or add the user's RSVP status
      if (attendeeIndex !== -1) {
        event.attendees[attendeeIndex].status = status;
      } else {
        event.attendees.push({ userId: currentUser.email, status });
      }
    }
    
    // Update the events array
    events[eventIndex] = event;
    
    // Save back to storage
    localStorage.setItem('events', JSON.stringify(events));
    return true;
  } catch (error) {
    console.error('Error updating event RSVP:', error);
    return false;
  }
};

// Format date for display
export const formatEventDate = (dateString: string): string => {
  const eventDate = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Check if event is today or tomorrow
  if (eventDate.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (eventDate.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  
  // Otherwise format the date
  return eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

// Get creator info based on email
export const getEventCreator = (email: string) => {
  if (!email) return null;
  
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.email === email) {
    return currentUser;
  }
  
  const sampleParents = getSampleParents();
  return sampleParents.find(parent => parent.email === email) || null;
};