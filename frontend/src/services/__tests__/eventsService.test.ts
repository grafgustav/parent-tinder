// src/services/__tests__/eventsService.test.ts
import { 
    initializeEvents, 
    getEvents, 
    getUserEvents, 
    getHostedEvents, 
    getEvent, 
    createEvent, 
    updateEventRSVP, 
    formatEventDate,
    getEventCreator,
    ParentEvent
  } from '../eventsService';
  import { getCurrentUser, getSampleParents } from '../matchingService';
  
  // Mock the dependencies
  jest.mock('../matchingService', () => ({
    getCurrentUser: jest.fn(),
    getSampleParents: jest.fn()
  }));
  
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      clear: jest.fn(() => {
        store = {};
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      })
    };
  })();
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });
  
  describe('Events Service', () => {
    const mockCurrentUser = {
      id: 'current-user-id',
      email: 'current@example.com',
      name: 'Current User',
      children: []
    };
  
    const mockSampleParents = [
      { id: 'parent1', email: 'parent1@example.com', name: 'Parent One', children: [] },
      { id: 'parent2', email: 'parent2@example.com', name: 'Parent Two', children: [] },
      { id: 'parent3', email: 'parent3@example.com', name: 'Parent Three', children: [] }
    ];
  
    // Sample event for testing
    const sampleEvent: Omit<ParentEvent, 'id' | 'attendees'> = {
      title: "Test Event",
      description: "This is a test event",
      location: "Test Location",
      date: new Date().toISOString(),
      time: "10:00-11:00",
      ageRange: {
        min: 2,
        max: 5
      },
      createdBy: mockCurrentUser.email,
      category: 'playdate',
      isPrivate: false
    };
  
    beforeEach(() => {
      // Clear mocks and localStorage before each test
      jest.clearAllMocks();
      localStorageMock.clear();
      
      // Set up default mock implementations
      (getCurrentUser as jest.Mock).mockReturnValue(mockCurrentUser);
      (getSampleParents as jest.Mock).mockReturnValue(mockSampleParents);
    });
  
    describe('initializeEvents', () => {
      it('should initialize events when not already initialized', () => {
        initializeEvents();
        expect(localStorageMock.setItem).toHaveBeenCalledWith('eventsInitialized', 'true');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('events', expect.any(String));
        
        // Check that events were stored
        const storedEvents = JSON.parse(localStorageMock.setItem.mock.calls.find(
          call => call[0] === 'events'
        )[1]);
        
        expect(storedEvents.length).toBeGreaterThan(0);
      });
  
      it('should not initialize events when already initialized', () => {
        localStorageMock.getItem.mockReturnValueOnce('true'); // eventsInitialized flag
        
        initializeEvents();
        
        // Verify that setItem was not called for events
        expect(localStorageMock.setItem).not.toHaveBeenCalledWith('events', expect.any(String));
      });
  
      it('should not initialize events when current user is not available', () => {
        (getCurrentUser as jest.Mock).mockReturnValueOnce(null);
        
        initializeEvents();
        
        // Verify that setItem was not called
        expect(localStorageMock.setItem).not.toHaveBeenCalled();
      });
  
      it('should not initialize events when sample parents are not available', () => {
        (getSampleParents as jest.Mock).mockReturnValueOnce([]);
        
        initializeEvents();
        
        // Verify that setItem was not called for events
        expect(localStorageMock.setItem).not.toHaveBeenCalledWith('events', expect.any(String));
      });
    });
  
    describe('getEvents', () => {
      it('should return an empty array when current user is not available', () => {
        (getCurrentUser as jest.Mock).mockReturnValueOnce(null);
        
        const events = getEvents();
        
        expect(events).toEqual([]);
      });
  
      it('should return an empty array when no events in storage', () => {
        localStorageMock.getItem.mockReturnValueOnce(null); // No events in storage
        
        const events = getEvents();
        
        expect(events).toEqual([]);
      });
  
      it('should return all public events and user\'s private events', () => {
        const mockEvents = [
          {
            id: 'event1',
            title: 'Public Event',
            isPrivate: false,
            attendees: [],
            createdBy: 'other@example.com'
          },
          {
            id: 'event2',
            title: 'Private Event - User Created',
            isPrivate: true,
            attendees: [],
            createdBy: mockCurrentUser.email
          },
          {
            id: 'event3',
            title: 'Private Event - User Attending',
            isPrivate: true,
            attendees: [{ userId: mockCurrentUser.email, status: 'going' }],
            createdBy: 'other@example.com'
          },
          {
            id: 'event4',
            title: 'Private Event - Not Related to User',
            isPrivate: true,
            attendees: [],
            createdBy: 'other@example.com'
          }
        ];
        
        localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockEvents));
        
        const events = getEvents();
        
        // Should include events 1, 2, and 3 but not 4
        expect(events).toHaveLength(3);
        expect(events.map(e => e.id)).toEqual(['event1', 'event2', 'event3']);
      });
  
      it('should handle invalid JSON data', () => {
        localStorageMock.getItem.mockReturnValueOnce('invalid JSON');
        
        const events = getEvents();
        
        expect(events).toEqual([]);
      });
    });
  
    describe('getUserEvents', () => {
      it('should return events where user is attending or maybe attending', () => {
        const mockEvents = [
          {
            id: 'event1',
            title: 'User Going',
            attendees: [{ userId: mockCurrentUser.email, status: 'going' }]
          },
          {
            id: 'event2',
            title: 'User Maybe',
            attendees: [{ userId: mockCurrentUser.email, status: 'maybe' }]
          },
          {
            id: 'event3',
            title: 'User Invited',
            attendees: [{ userId: mockCurrentUser.email, status: 'invited' }]
          },
          {
            id: 'event4',
            title: 'User Not Attending',
            attendees: [{ userId: 'other@example.com', status: 'going' }]
          }
        ];
        
        // Mock getEvents to return our test data
        localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockEvents));
        
        const userEvents = getUserEvents();
        
        // Should include events 1 and 2 but not 3 or 4
        expect(userEvents).toHaveLength(2);
        expect(userEvents.map(e => e.id)).toEqual(['event1', 'event2']);
      });
    });
  
    describe('getHostedEvents', () => {
      it('should return events created by the user', () => {
        const mockEvents = [
          {
            id: 'event1',
            title: 'User Created',
            createdBy: mockCurrentUser.email
          },
          {
            id: 'event2',
            title: 'Other Created',
            createdBy: 'other@example.com'
          }
        ];
        
        // Mock getEvents to return our test data
        localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockEvents));
        
        const hostedEvents = getHostedEvents();
        
        // Should include only event 1
        expect(hostedEvents).toHaveLength(1);
        expect(hostedEvents[0].id).toBe('event1');
      });
    });
  
    describe('getEvent', () => {
      it('should return event by ID', () => {
        const mockEvents = [
          { id: 'event1', title: 'Event 1' },
          { id: 'event2', title: 'Event 2' }
        ];
        
        // Mock getEvents to return our test data
        localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockEvents));
        
        const event = getEvent('event2');
        
        expect(event).not.toBeNull();
        expect(event?.id).toBe('event2');
      });
  
      it('should return null if event ID not found', () => {
        const mockEvents = [
          { id: 'event1', title: 'Event 1' }
        ];
        
        // Mock getEvents to return our test data
        localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockEvents));
        
        const event = getEvent('non-existent');
        
        expect(event).toBeNull();
      });
    });
  
    describe('createEvent', () => {
      it('should create a new event and add current user as going', () => {
        // Mock existing events
        localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([]));
        
        const createdEvent = createEvent(sampleEvent);
        
        expect(createdEvent).not.toBeNull();
        expect(createdEvent?.title).toBe(sampleEvent.title);
        expect(createdEvent?.id).toBeTruthy();
        expect(createdEvent?.attendees).toHaveLength(1);
        expect(createdEvent?.attendees[0]).toEqual({
          userId: mockCurrentUser.email,
          status: 'going'
        });
        
        // Verify localStorage was updated
        expect(localStorageMock.setItem).toHaveBeenCalledWith('events', expect.any(String));
      });
  
      it('should return null if current user is not available', () => {
        (getCurrentUser as jest.Mock).mockReturnValueOnce(null);
        
        const createdEvent = createEvent(sampleEvent);
        
        expect(createdEvent).toBeNull();
        expect(localStorageMock.setItem).not.toHaveBeenCalled();
      });
    });
  
    describe('updateEventRSVP', () => {
      it('should update existing RSVP status', () => {
        const mockEvents = [
          {
            id: 'event1',
            title: 'Test Event',
            attendees: [
              { userId: mockCurrentUser.email, status: 'invited' }
            ]
          }
        ];
        
        localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockEvents));
        
        const result = updateEventRSVP('event1', 'going');
        
        expect(result).toBe(true);
        
        // Verify localStorage was updated
        expect(localStorageMock.setItem).toHaveBeenCalledWith('events', expect.any(String));
        
        // Check that the updated events have the correct RSVP status
        const updatedEvents = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
        expect(updatedEvents[0].attendees[0].status).toBe('going');
      });
  
      it('should add new RSVP if user not in attendees', () => {
        const mockEvents = [
          {
            id: 'event1',
            title: 'Test Event',
            attendees: []
          }
        ];
        
        localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockEvents));
        
        const result = updateEventRSVP('event1', 'maybe');
        
        expect(result).toBe(true);
        
        // Check that the user was added to attendees
        const updatedEvents = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
        expect(updatedEvents[0].attendees).toHaveLength(1);
        expect(updatedEvents[0].attendees[0]).toEqual({
          userId: mockCurrentUser.email,
          status: 'maybe'
        });
      });
  
      it('should remove user from attendees when status is not-going', () => {
        const mockEvents = [
          {
            id: 'event1',
            title: 'Test Event',
            attendees: [
              { userId: mockCurrentUser.email, status: 'going' }
            ]
          }
        ];
        
        localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockEvents));
        
        const result = updateEventRSVP('event1', 'not-going');
        
        expect(result).toBe(true);
        
        // Check that the user was removed from attendees
        const updatedEvents = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
        expect(updatedEvents[0].attendees).toHaveLength(0);
      });
  
      it('should return false if event is not found', () => {
        const mockEvents = [
          { id: 'event1', title: 'Test Event', attendees: [] }
        ];
        
        localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockEvents));
        
        const result = updateEventRSVP('non-existent', 'going');
        
        expect(result).toBe(false);
      });
  
      it('should return false if current user is not available', () => {
        (getCurrentUser as jest.Mock).mockReturnValueOnce(null);
        
        const result = updateEventRSVP('event1', 'going');
        
        expect(result).toBe(false);
      });
  
      it('should return false if events are not in storage', () => {
        localStorageMock.getItem.mockReturnValueOnce(null);
        
        const result = updateEventRSVP('event1', 'going');
        
        expect(result).toBe(false);
      });
  
      it('should handle JSON parsing errors', () => {
        localStorageMock.getItem.mockReturnValueOnce('invalid JSON');
        
        const result = updateEventRSVP('event1', 'going');
        
        expect(result).toBe(false);
      });
    });
  
    describe('formatEventDate', () => {
      it('should return "Today" for today\'s date', () => {
        const today = new Date();
        const result = formatEventDate(today.toISOString());
        
        expect(result).toBe('Today');
      });
  
      it('should return "Tomorrow" for tomorrow\'s date', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const result = formatEventDate(tomorrow.toISOString());
        
        expect(result).toBe('Tomorrow');
      });
  
      it('should format other dates correctly', () => {
        // Create a date that's not today or tomorrow (5 days from now)
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 5);
        
        const result = formatEventDate(futureDate.toISOString());
        
        // Should match pattern like "Wed, Apr 07"
        expect(result).toMatch(/^[A-Za-z]{3}, [A-Za-z]{3} \d{1,2}$/);
      });
    });
  
    describe('getEventCreator', () => {
      it('should return current user if email matches', () => {
        const creator = getEventCreator(mockCurrentUser.email);
        
        expect(creator).toEqual(mockCurrentUser);
      });
  
      it('should return parent from sample parents if email matches', () => {
        const creator = getEventCreator(mockSampleParents[1].email);
        
        expect(creator).toEqual(mockSampleParents[1]);
      });
  
      it('should return null if email is falsy', () => {
        const creator = getEventCreator('');
        
        expect(creator).toBeNull();
      });
  
      it('should return null if email not found', () => {
        const creator = getEventCreator('nonexistent@example.com');
        
        expect(creator).toBeNull();
      });
    });
  });