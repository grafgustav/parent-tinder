// src/services/api/notificationsService.ts
import apiClient from './apiClient';

export interface Notification {
  id: string;
  type: 'match' | 'message' | 'event';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedId?: string;
  image?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const notificationsService = {
  /**
   * Get all notifications for current user
   */
  getNotifications: async (page = 0, size = 20, read?: boolean): Promise<PageResponse<Notification>> => {
    const params: any = { page, size };
    if (read !== undefined) {
      params.read = read;
    }
    
    const response = await apiClient.get<PageResponse<Notification>>('/notifications', {
      params
    });
    return response.data;
  },
  
  /**
   * Mark notification as read
   */
  markNotificationAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.put(`/notifications/${notificationId}/read`);
  },
  
  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all');
  },
  
  /**
   * Delete a notification
   */
  deleteNotification: async (notificationId: string): Promise<void> => {
    await apiClient.delete(`/notifications/${notificationId}`);
  },
  
  /**
   * Clear all notifications
   */
  clearAllNotifications: async (): Promise<void> => {
    await apiClient.delete('/notifications');
  },
  
  /**
   * Get unread notification count
   */
  getUnreadNotificationCount: async (): Promise<number> => {
    const response = await apiClient.get<PageResponse<Notification>>('/notifications', {
      params: { page: 0, size: 1, read: false }
    });
    return response.data.totalElements;
  }
};