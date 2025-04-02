// src/pages/events/Events.tsx
import React, { useState, useEffect } from 'react';
import {
  initializeEvents,
  getEvents,
  getUserEvents,
  getHostedEvents,
  updateEventRSVP,
  ParentEvent,
  formatEventDate,
  getEventCreator
} from '../../services/eventsService';
import { getCurrentUser } from '../../services/matchingService';
import './Events.css';

interface EventsProps {
  navigateTo?: (page: string) => void;
}

const Events: React.FC<EventsProps> = ({ navigateTo }) => {
  const [events, setEvents] = useState<ParentEvent[]>([]);
  const [userEvents, setUserEvents] = useState<ParentEvent[]>([]);
  const [hostedEvents, setHostedEvents] = useState<ParentEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'discover' | 'attending' | 'hosting'>('discover');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ParentEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    minAge: '0',
    maxAge: '12',
    category: 'playdate',
    isPrivate: false,
    maxAttendees: ''
  });
  
  const currentUser = getCurrentUser();
  
  useEffect(() => {
    // Initialize sample events if needed
    initializeEvents();
    
    // Load events
    loadEvents();
    
    setIsLoading(false);
  }, []);
  
  const loadEvents = () => {
    setEvents(getEvents());
    setUserEvents(getUserEvents());
    setHostedEvents(getHostedEvents());
  };
  
  const handleRSVP = (eventId: string, status: 'going' | 'maybe' | 'not-going') => {
    const success = updateEventRSVP(eventId, status);
    if (success) {
      loadEvents();
    }
  };
  
  const getCurrentUserStatus = (event: ParentEvent) => {
    if (!currentUser) return null;
    
    const attendee = event.attendees.find(a => a.userId === currentUser.email);
    return attendee ? attendee.status : null;
  };
  
  const closeEventDetail = () => {
    setSelectedEvent(null);
  };
  
  const openEventDetail = (event: ParentEvent) => {
    setSelectedEvent(event);
  };
  
  const toggleCreateEvent = () => {
    setIsCreatingEvent(!isCreatingEvent);
    
    // Reset form if closing
    if (isCreatingEvent) {
      setFormData({
        title: '',
        description: '',
        location: '',
        date: '',
        time: '',
        minAge: '0',
        maxAge: '12',
        category: 'playdate',
        isPrivate: false,
        maxAttendees: ''
      });
    } else {
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData({
        ...formData,
        date: tomorrow.toISOString().split('T')[0]
      });
    }
  };
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    // Simple validation
    if (!formData.title || !formData.location || !formData.date || !formData.time) {
      alert('Please fill out all required fields');
      return;
    }
    
    const newEvent = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      date: new Date(formData.date).toISOString(),
      time: formData.time,
      ageRange: {
        min: parseInt(formData.minAge) || 0,
        max: parseInt(formData.maxAge) || 12
      },
      createdBy: currentUser.email,
      category: formData.category as 'playdate' | 'workshop' | 'party' | 'class' | 'other',
      isPrivate: formData.isPrivate,
      maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined
    };
    
    // Simulate API call
    setTimeout(() => {
      // Add to localStorage
      const allEvents = JSON.parse(localStorage.getItem('events') || '[]');
      const newEventWithId = {
        ...newEvent,
        id: Math.random().toString(36).substring(2, 15),
        attendees: [{ userId: currentUser.email, status: 'going' as const }]
      };
      
      allEvents.push(newEventWithId);
      localStorage.setItem('events', JSON.stringify(allEvents));
      
      // Refresh events
      loadEvents();
      
      // Close form
      setIsCreatingEvent(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        date: '',
        time: '',
        minAge: '0',
        maxAge: '12',
        category: 'playdate',
        isPrivate: false,
        maxAttendees: ''
      });
    }, 300);
  };
  
  const getDisplayEvents = () => {
    switch (activeTab) {
      case 'attending':
        return userEvents;
      case 'hosting':
        return hostedEvents;
      case 'discover':
      default:
        // Sort by date (closest first)
        return [...events].sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'playdate':
        return '🏃‍♂️';
      case 'workshop':
        return '🎨';
      case 'party':
        return '🎉';
      case 'class':
        return '📚';
      case 'other':
      default:
        return '📅';
    }
  };
  
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'playdate':
        return 'Playdate';
      case 'workshop':
        return 'Workshop';
      case 'party':
        return 'Party';
      case 'class':
        return 'Class';
      case 'other':
      default:
        return 'Other';
    }
  };
  
  if (isLoading) {
    return <div className="loading-events">Loading events...</div>;
  }
  
  if (!currentUser) {
    return (
      <div className="no-profile-container">
        <h1>Events</h1>
        <div className="no-profile-card">
          <h2>No Profile Found</h2>
          <p>Please complete your profile to discover and create events.</p>
          <button 
            className="create-profile-btn"
            onClick={() => navigateTo && navigateTo('register')}
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="events-container">
      <div className="events-header">
        <h1>Parent Events</h1>
        <p className="events-intro">
          Discover local events to meet other parents and organize fun activities for your children.
        </p>
      </div>
      
      <div className="events-tabs">
        <button 
          className={activeTab === 'discover' ? 'active' : ''}
          onClick={() => setActiveTab('discover')}
        >
          Discover Events
        </button>
        <button 
          className={activeTab === 'attending' ? 'active' : ''}
          onClick={() => setActiveTab('attending')}
        >
          My Events {userEvents.length > 0 && <span className="count-badge">{userEvents.length}</span>}
        </button>
        <button 
          className={activeTab === 'hosting' ? 'active' : ''}
          onClick={() => setActiveTab('hosting')}
        >
          Hosting {hostedEvents.length > 0 && <span className="count-badge">{hostedEvents.length}</span>}
        </button>
      </div>
      
      <div className="events-actions">
        <button 
          className="create-event-btn"
          onClick={toggleCreateEvent}
        >
          {isCreatingEvent ? 'Cancel' : '+ Create Event'}
        </button>
      </div>
      
      {isCreatingEvent && (
        <div className="create-event-form-container">
          <form className="create-event-form" onSubmit={handleCreateEvent}>
            <h2>Create New Event</h2>
            
            <div className="form-group">
              <label htmlFor="title">Event Title*</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="E.g., Park Playdate"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="What should parents know about this event?"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Location*</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="Where will you meet?"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="playdate">Playdate</option>
                  <option value="workshop">Workshop</option>
                  <option value="party">Party</option>
                  <option value="class">Class</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date*</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="time">Time*</label>
                <input
                  type="text"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  placeholder="E.g., 15:00-17:00"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="minAge">Minimum Age</label>
                <input
                  type="number"
                  id="minAge"
                  name="minAge"
                  value={formData.minAge}
                  onChange={handleInputChange}
                  min="0"
                  max="18"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="maxAge">Maximum Age</label>
                <input
                  type="number"
                  id="maxAge"
                  name="maxAge"
                  value={formData.maxAge}
                  onChange={handleInputChange}
                  min="0"
                  max="18"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="maxAttendees">Max Attendees</label>
                <input
                  type="number"
                  id="maxAttendees"
                  name="maxAttendees"
                  value={formData.maxAttendees}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Optional"
                />
              </div>
            </div>
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="isPrivate"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="isPrivate">
                Make this a private event (only visible to invited parents)
              </label>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={toggleCreateEvent}>
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Create Event
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="events-list">
        {getDisplayEvents().length === 0 ? (
          <div className="no-events">
            <p>
              {activeTab === 'discover' && "No events found. Be the first to create one!"}
              {activeTab === 'attending' && "You're not attending any events yet. Discover events to join!"}
              {activeTab === 'hosting' && "You're not hosting any events yet. Create an event for other parents!"}
            </p>
          </div>
        ) : (
          getDisplayEvents().map(event => {
            const userStatus = getCurrentUserStatus(event);
            const isCreator = event.createdBy === currentUser.email;
            const creator = getEventCreator(event.createdBy);
            const attendeeCount = event.attendees.filter(a => a.status === 'going').length;
            const isFull = event.maxAttendees ? attendeeCount >= event.maxAttendees : false;
            
            return (
              <div className="event-card" key={event.id}>
                <div className="event-header">
                  <div className="event-category">
                    <span className="category-icon">{getCategoryIcon(event.category)}</span>
                    <span className="category-text">{getCategoryLabel(event.category)}</span>
                  </div>
                  
                  {event.isPrivate && (
                    <div className="private-badge">
                      Private
                    </div>
                  )}
                </div>
                
                <h3 className="event-title" onClick={() => openEventDetail(event)}>
                  {event.title}
                </h3>
                
                <div className="event-date-time">
                  <div className="event-date">
                    <span className="date-icon">📅</span>
                    {formatEventDate(event.date)}
                  </div>
                  <div className="event-time">
                    <span className="time-icon">⏰</span>
                    {event.time}
                  </div>
                </div>
                
                <div className="event-location">
                  <span className="location-icon">📍</span>
                  {event.location}
                </div>
                
                <div className="event-age-range">
                  <span className="age-icon">👶</span>
                  Ages {event.ageRange.min} - {event.ageRange.max}
                </div>
                
                <div className="event-attendance">
                  <div className="attendance-info">
                    <span className="attendance-count">{attendeeCount}</span>
                    {event.maxAttendees ? ` / ${event.maxAttendees}` : ''} attending
                  </div>
                  
                  {isFull && !userStatus && !isCreator && (
                    <div className="event-full-badge">Full</div>
                  )}
                </div>
                
                <div className="event-creator">
                  Created by: {isCreator ? 'You' : creator ? `${creator.firstName} ${creator.lastName.charAt(0)}.` : 'Unknown'}
                </div>
                
                <div className="event-actions">
                  {!isCreator && (
                    <>
                      {userStatus === 'going' ? (
                        <button 
                          className="going-btn active"
                          onClick={() => handleRSVP(event.id, 'not-going')}
                        >
                          Going ✓
                        </button>
                      ) : (
                        <button 
                          className="going-btn"
                          onClick={() => handleRSVP(event.id, 'going')}
                          disabled={isFull}
                        >
                          {isFull ? 'Full' : 'Going'}
                        </button>
                      )}
                      
                      {userStatus === 'maybe' ? (
                        <button 
                          className="maybe-btn active"
                          onClick={() => handleRSVP(event.id, 'not-going')}
                        >
                          Maybe ✓
                        </button>
                      ) : (
                        <button 
                          className="maybe-btn"
                          onClick={() => handleRSVP(event.id, 'maybe')}
                        >
                          Maybe
                        </button>
                      )}
                    </>
                  )}
                  
                  <button 
                    className="details-btn"
                    onClick={() => openEventDetail(event)}
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {selectedEvent && (
        <div className="event-detail-overlay">
          <div className="event-detail-modal">
            <button className="close-modal" onClick={closeEventDetail}>✕</button>
            
            <div className="event-detail-header">
              <div className="detail-category">
                <span className="category-icon">{getCategoryIcon(selectedEvent.category)}</span>
                <span className="category-text">{getCategoryLabel(selectedEvent.category)}</span>
                
                {selectedEvent.isPrivate && (
                  <span className="detail-private-badge">Private</span>
                )}
              </div>
              
              <h2>{selectedEvent.title}</h2>
              
              <div className="detail-creator">
                {(() => {
                  const isCreator = selectedEvent.createdBy === currentUser.email;
                  const creator = getEventCreator(selectedEvent.createdBy);
                  
                  return (
                    <span>Hosted by: {isCreator ? 'You' : creator ? `${creator.firstName} ${creator.lastName}` : 'Unknown'}</span>
                  );
                })()}
              </div>
            </div>
            
            <div className="event-detail-body">
              <div className="detail-section">
                <h3>When & Where</h3>
                <div className="detail-info-grid">
                  <div className="detail-info-item">
                  <div className="detail-info-content">
                      <div className="detail-info-label">Date</div>
                      <div className="detail-info-value">{new Date(selectedEvent.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                  </div>
                  
                  <div className="detail-info-item">
                    <div className="detail-info-icon">⏰</div>
                    <div className="detail-info-content">
                      <div className="detail-info-label">Time</div>
                      <div className="detail-info-value">{selectedEvent.time}</div>
                    </div>
                  </div>
                  
                  <div className="detail-info-item">
                    <div className="detail-info-icon">📍</div>
                    <div className="detail-info-content">
                      <div className="detail-info-label">Location</div>
                      <div className="detail-info-value">{selectedEvent.location}</div>
                    </div>
                  </div>
                  
                  <div className="detail-info-item">
                    <div className="detail-info-icon">👶</div>
                    <div className="detail-info-content">
                      <div className="detail-info-label">Age Range</div>
                      <div className="detail-info-value">Ages {selectedEvent.ageRange.min} - {selectedEvent.ageRange.max}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <h3>About This Event</h3>
                <p className="detail-description">
                  {selectedEvent.description || "No description provided."}
                </p>
              </div>
              
              <div className="detail-section">
                <h3>Attendees</h3>
                <div className="detail-attendance-info">
                  <div className="attendance-count">
                    {selectedEvent.attendees.filter(a => a.status === 'going').length}
                    {selectedEvent.maxAttendees ? ` of ${selectedEvent.maxAttendees}` : ''} parents going
                  </div>
                  
                  <div className="attendance-count maybe">
                    {selectedEvent.attendees.filter(a => a.status === 'maybe').length} parents maybe attending
                  </div>
                </div>
                
                <div className="attendees-list">
                  {selectedEvent.attendees
                    .filter(a => a.status === 'going' || a.status === 'maybe')
                    .map((attendee, index) => {
                      const parent = getEventCreator(attendee.userId);
                      const isCurrentUser = attendee.userId === currentUser.email;
                      
                      return (
                        <div className="attendee-item" key={index}>
                          <div className="attendee-photo">
                            {parent && parent.profileImage ? (
                              <img src={parent.profileImage} alt={parent.firstName} />
                            ) : (
                              <div className="attendee-initials">
                                {parent ? parent.firstName.charAt(0) : 'U'}
                              </div>
                            )}
                          </div>
                          <div className="attendee-info">
                            <div className="attendee-name">
                              {isCurrentUser ? 'You' : parent ? `${parent.firstName} ${parent.lastName.charAt(0)}.` : 'Unknown'}
                            </div>
                            <div className={`attendee-status ${attendee.status}`}>
                              {attendee.status === 'going' ? 'Going' : 'Maybe'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
            
            <div className="event-detail-actions">
              {selectedEvent.createdBy !== currentUser.email && (
                <div className="detail-rsvp-actions">
                  <button 
                    className={`detail-going-btn ${getCurrentUserStatus(selectedEvent) === 'going' ? 'active' : ''}`}
                    onClick={() => {
                      handleRSVP(selectedEvent.id, getCurrentUserStatus(selectedEvent) === 'going' ? 'not-going' : 'going');
                      closeEventDetail();
                    }}
                    disabled={selectedEvent.maxAttendees ? selectedEvent.attendees.filter(a => a.status === 'going').length >= selectedEvent.maxAttendees && getCurrentUserStatus(selectedEvent) !== 'going' : false}
                  >
                    {getCurrentUserStatus(selectedEvent) === 'going' ? 'Going ✓' : 'Going'}
                  </button>
                  
                  <button 
                    className={`detail-maybe-btn ${getCurrentUserStatus(selectedEvent) === 'maybe' ? 'active' : ''}`}
                    onClick={() => {
                      handleRSVP(selectedEvent.id, getCurrentUserStatus(selectedEvent) === 'maybe' ? 'not-going' : 'maybe');
                      closeEventDetail();
                    }}
                  >
                    {getCurrentUserStatus(selectedEvent) === 'maybe' ? 'Maybe ✓' : 'Maybe'}
                  </button>
                </div>
              )}
              
              <button className="close-detail-btn" onClick={closeEventDetail}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;