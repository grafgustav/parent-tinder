// src/services/eventsService.ts
import { getCurrentUser, getSampleParents } from './matchingService.ts';

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

// Generate a simple UUID for IDs
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Initialize sample events
export const initializeEvents = () => {
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
    {
      id: generateId(),
      title: "Arts & Crafts Workshop",
      description: "A beginner-friendly arts and crafts session for kids. All materials will be provided. Please RSVP so we know how many supplies to prepare.",
      location: "Community Center, Room 201",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).toISOString(),
      time: "10:00-12:00",
      ageRange: {
        min: 4,
        max: 10
      },
      createdBy: currentUser.email,
      attendees: [
        { userId: currentUser.email, status: 'going' },
        { userId: sampleParents[3].email, status: 'going' },
        { userId: sampleParents[4].email, status: 'invited' }
      ],
      maxAttendees: 12,
      category: 'workshop',
      isPrivate: false
    },
    {
      id: generateId(),
      title: "Swimming Lessons Meetup",
      description: "Our kids are taking swimming lessons together! Let's meet at the community pool.",
      location: "YMCA Pool",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).toISOString(),
      time: "09:30-11:00",
      ageRange: {
        min: 5,
        max: 8
      },
      createdBy: sampleParents[2].email,
      attendees: [
        { userId: sampleParents[2].email, status: 'going' },
        { userId: sampleParents[5].email, status: 'going' }
      ],
      category: 'class',
      isPrivate: true
    },
    {
      id: generateId(),
      title: "Weekend Picnic",
      description: "Family picnic at Sunset Park. We'll have games, food, and lots of fun. Bring a dish to share!",
      location: "Sunset Park, Picnic Area B",
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5).toISOString(),
      time: "12:00-15:00",
      ageRange: {
        min: 0,
        max: 12
      },
      createdBy: sampleParents[1].email,
      attendees: [
        { userId: sampleParents[1].email, status: 'going' },
        { userId: sampleParents[3].email, status: 'going' },
        { userId: sampleParents[0].email, status: 'maybe' },
        { userId: currentUser.email, status: 'invited' }
      ],
      category: 'playdate',
      isPrivate: false
    }
  ];
  
  localStorage.setItem('events', JSON.stringify(sampleEvents));
  localStorage.setItem('eventsInitialized', 'true');
};

// Get all events
export const getEvents = (): ParentEvent[] => {
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
export const getUserEvents = (): ParentEvent[] => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return [];
  }
  
  const allEvents = getEvents();
  
  return allEvents.filter(event => 
    event.attendees.some(
      attendee => attendee.userId === currentUser.email && 
      (attendee.status === 'going' || attendee.status === 'maybe')
    )
  );
};

// Get events created by the current user
export const getHostedEvents = (): ParentEvent[] => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return [];
  }
  
  const allEvents = getEvents();
  
  return allEvents.filter(event => event.createdBy === currentUser.email);
};

// Get an event by ID
export const getEvent = (eventId: string): ParentEvent | null => {
  const events = getEvents();
  return events.find(event => event.id === eventId) || null;
};

// Create a new event
export const createEvent = (eventData: Omit<ParentEvent, 'id' | 'attendees'>): ParentEvent | null => {
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
  const events = getEvents();
  
  // Update storage with all events (not just user-visible ones)
  const storedEvents = localStorage.getItem('events');
  const allEvents = storedEvents ? JSON.parse(storedEvents) : [];
  allEvents.push(newEvent);
  
  localStorage.setItem('events', JSON.stringify(allEvents));
  
  return newEvent;
};

// Update an event RSVP
export const updateEventRSVP = (eventId: string, status: 'going' | 'maybe' | 'not-going'): boolean => {
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