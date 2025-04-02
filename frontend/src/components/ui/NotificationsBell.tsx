// src/components/ui/NotificationsBell.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  requestNotificationPermission,
  initializeNotifications,
  Notification
} from '../../services/notificationsService';
import './NotificationsBell.css';

interface NotificationsBellProps {
  navigateTo: (page: string) => void;
}

const NotificationsBell: React.FC<NotificationsBellProps> = ({ navigateTo }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Initialize sample notifications if needed
    initializeNotifications();
    
    // Request notification permissions
    requestNotificationPermission();
    
    // Load notifications
    loadNotifications();
    
    // Set up event listener for notification clicks
    const handleNotificationClick = (event: CustomEvent) => {
      const { type, relatedId } = event.detail;
      
      // Navigate based on notification type
      if (type === 'match' && relatedId) {
        navigateTo('matches');
      } else if (type === 'message' && relatedId) {
        navigateTo('messages');
      } else if (type === 'event' && relatedId) {
        navigateTo('events');
      }
    };
    
    window.addEventListener('notificationClicked', handleNotificationClick as EventListener);
    
    // Set up click outside listener to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    // Setup interval to refresh notifications (simulating real-time updates)
    const intervalId = setInterval(loadNotifications, 15000);
    
    return () => {
      window.removeEventListener('notificationClicked', handleNotificationClick as EventListener);
      document.removeEventListener('mousedown', handleClickOutside);
      clearInterval(intervalId);
    };
  }, [navigateTo]);
  
  const loadNotifications = () => {
    const userNotifications = getNotifications();
    setNotifications(userNotifications);
    setUnreadCount(getUnreadNotificationCount());
  };
  
  const toggleNotifications = () => {
    setIsOpen(!isOpen);
    
    // If opening notifications, update read status after a delay
    if (!isOpen) {
      setTimeout(() => {
        markAllNotificationsAsRead();
        loadNotifications();
      }, 2000);
    }
  };
  
  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === 'match' && notification.relatedId) {
      navigateTo('matches');
    } else if (notification.type === 'message' && notification.relatedId) {
      navigateTo('messages');
    } else if (notification.type === 'event' && notification.relatedId) {
      navigateTo('events');
    }
    
    setIsOpen(false);
    loadNotifications();
  };
  
  const clearNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearAllNotifications();
    loadNotifications();
  };
  
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffMins < 24 * 60) {
      const hours = Math.floor(diffMins / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffMins / (60 * 24));
      return `${days}d ago`;
    }
  };
  
  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'match':
        return '👥';
      case 'message':
        return '💬';
      case 'event':
        return '📅';
      default:
        return '🔔';
    }
  };
  
  return (
    <div className="notifications-bell-container" ref={dropdownRef}>
      <button 
        className="notifications-bell-button"
        onClick={toggleNotifications}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
      
      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button 
                className="clear-all-button"
                onClick={clearNotifications}
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                You have no notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatTime(notification.timestamp)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;