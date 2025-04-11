// src/services/api/index.ts
export { default as apiClient } from './apiClient';
export { authService } from './authService';
export { userService } from './userService';
export { matchesService } from './matchesService';
export { conversationsService } from './conversationsService';
export { eventsService } from './eventsService';
export { notificationsService } from './notificationsService';

// Also export type interfaces
export type { UserProfile, UserProfileUpdate } from './userService';
export type { MatchResponse, MatchScore } from './matchesService';
export type { 
  Conversation, 
  Message, 
  ParticipantInfo,
  MessageRequest 
} from './conversationsService';
export type { 
  Event, 
  EventRequest, 
  RsvpRequest, 
  RsvpResponse,
  AgeRange,
  Attendee 
} from './eventsService';
export type { Notification } from './notificationsService';
export type { PageResponse } from './matchesService';