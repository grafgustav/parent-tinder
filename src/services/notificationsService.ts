// src/services/notificationsService.ts
import { getCurrentUser } from './matchingService';

export interface Notification {
  id: string;
  type: 'match' | 'message' | 'event';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  relatedId?: string; // ID of related match, message, or event
  image?: string; // URL or data URL of an image to show
}

// Generate a simple UUID for IDs
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Request notification permissions
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notifications');
    return false;
  }
  
  let permission = Notification.permission;
  
  // If the user has not been asked yet
  if (permission !== 'granted' && permission !== 'denied') {
    permission = await Notification.requestPermission();
  }
  
  return permission === 'granted';
};

// Get all notifications for the current user
export const getNotifications = (): Notification[] => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return [];
  }
  
  const key = `notifications_${currentUser.email}`;
  const storedNotifications = localStorage.getItem(key);
  
  if (!storedNotifications) {
    return [];
  }
  
  try {
    return JSON.parse(storedNotifications);
  } catch (error) {
    console.error('Error parsing notifications:', error);
    return [];
  }
};

// Add a new notification
export const addNotification = (
  type: 'match' | 'message' | 'event',
  title: string,
  message: string,
  relatedId?: string,
  image?: string
): Notification => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    throw new Error('User not found');
  }
  
  const newNotification: Notification = {
    id: generateId(),
    type,
    title,
    message,
    timestamp: Date.now(),
    read: false,
    relatedId,
    image
  };
  
  // Get existing notifications
  const key = `notifications_${currentUser.email}`;
  const notifications = getNotifications();
  
  // Add new notification at the beginning
  const updatedNotifications = [newNotification, ...notifications];
  
  // Save back to localStorage
  localStorage.setItem(key, JSON.stringify(updatedNotifications));
  
  // Show browser notification if permission granted
  showBrowserNotification(newNotification);
  
  return newNotification;
};

// Show browser notification
const showBrowserNotification = (notification: Notification): void => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  
  const options: NotificationOptions = {
    body: notification.message,
    icon: notification.image || '/favicon.ico', // Fallback to favicon
    tag: notification.id,
    timestamp: notification.timestamp,
    requireInteraction: false
  };
  
  const browserNotification = new Notification(notification.title, options);
  
  // Handle click on notification
  browserNotification.onclick = () => {
    window.focus();
    
    // Dispatch custom event to handle navigation based on notification type
    const event = new CustomEvent('notificationClicked', {
      detail: {
        type: notification.type,
        id: notification.id,
        relatedId: notification.relatedId
      }
    });
    window.dispatchEvent(event);
    
    // Close the notification
    browserNotification.close();
  };
};

// Mark a notification as read
export const markNotificationAsRead = (notificationId: string): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return false;
  }
  
  const key = `notifications_${currentUser.email}`;
  const notifications = getNotifications();
  
  const updatedNotifications = notifications.map(notification => 
    notification.id === notificationId 
      ? { ...notification, read: true } 
      : notification
  );
  
  // Save back to localStorage
  localStorage.setItem(key, JSON.stringify(updatedNotifications));
  
  return true;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = (): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return false;
  }
  
  const key = `notifications_${currentUser.email}`;
  const notifications = getNotifications();
  
  const updatedNotifications = notifications.map(notification => ({
    ...notification,
    read: true
  }));
  
  // Save back to localStorage
  localStorage.setItem(key, JSON.stringify(updatedNotifications));
  
  return true;
};

// Remove a notification
export const removeNotification = (notificationId: string): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return false;
  }
  
  const key = `notifications_${currentUser.email}`;
  const notifications = getNotifications();
  
  const updatedNotifications = notifications.filter(
    notification => notification.id !== notificationId
  );
  
  // Save back to localStorage
  localStorage.setItem(key, JSON.stringify(updatedNotifications));
  
  return true;
};

// Clear all notifications
export const clearAllNotifications = (): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return false;
  }
  
  const key = `notifications_${currentUser.email}`;
  localStorage.setItem(key, JSON.stringify([]));
  
  return true;
};

// Get unread notification count
export const getUnreadNotificationCount = (): number => {
  const notifications = getNotifications();
  return notifications.filter(notification => !notification.read).length;
};

// Initialize with some sample notifications if needed
export const initializeNotifications = (): void => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return;
  }
  
  const key = `notifications_${currentUser.email}`;
  
  // Only initialize if no notifications exist
  if (localStorage.getItem(key)) {
    return;
  }
  
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  
  const sampleNotifications: Notification[] = [
    {
      id: generateId(),
      type: 'match',
      title: 'New Match!',
      message: 'You matched with Sarah J. based on your interests and children\'s ages.',
      timestamp: now - (2 * hour),
      read: false,
      relatedId: '1' // Matching the sample parent ID
    },
    {
      id: generateId(),
      type: 'message',
      title: 'New Message',
      message: 'David W. sent you a message about a potential playdate.',
      timestamp: now - (5 * hour),
      read: true,
      relatedId: '4' // Matching the sample parent ID
    },
    {
      id: generateId(),
      type: 'event',
      title: 'Event Invitation',
      message: 'You\'ve been invited to "Weekend Picnic" at Sunset Park this Saturday.',
      timestamp: now - (8 * hour),
      read: false,
      relatedId: generateId() // Random event ID
    }
  ];
  
  localStorage.setItem(key, JSON.stringify(sampleNotifications));
};

// Add a simulated new match notification
export const simulateNewMatchNotification = (): void => {
  const sampleParents = [
    { id: '1', name: 'Sarah Johnson' },
    { id: '2', name: 'Michael Chen' },
    { id: '3', name: 'Jessica Garcia' },
    { id: '4', name: 'David Wilson' },
    { id: '5', name: 'Emma Taylor' }
  ];
  
  const randomParent = sampleParents[Math.floor(Math.random() * sampleParents.length)];
  
  addNotification(
    'match',
    'New Match!',
    `You matched with ${randomParent.name} based on your common interests.`,
    randomParent.id
  );
};

// Add a simulated new message notification
export const simulateNewMessageNotification = (): void => {
  const sampleParents = [
    { id: '1', name: 'Sarah Johnson' },
    { id: '2', name: 'Michael Chen' },
    { id: '3', name: 'Jessica Garcia' },
    { id: '4', name: 'David Wilson' },
    { id: '5', name: 'Emma Taylor' }
  ];
  
  const randomParent = sampleParents[Math.floor(Math.random() * sampleParents.length)];
  
  addNotification(
    'message',
    'New Message',
    `${randomParent.name} sent you a message about arranging a playdate.`,
    randomParent.id
  );
};

// Add a simulated new event notification
export const simulateNewEventNotification = (): void => {
  const sampleEvents = [
    { id: generateId(), name: 'Park Playdate', location: 'Central Park' },
    { id: generateId(), name: 'Swimming Lesson', location: 'Community Pool' },
    { id: generateId(), name: 'Art Workshop', location: 'Children\'s Museum' },
    { id: generateId(), name: 'Story Time', location: 'Local Library' }
  ];
  
  const randomEvent = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
  
  addNotification(
    'event',
    'New Event Nearby',
    `"${randomEvent.name}" is happening near you at ${randomEvent.location}.`,
    randomEvent.id
  );
};