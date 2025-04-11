// src/services/api/conversationsService.ts
import apiClient from './apiClient';

export interface ParticipantInfo {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: ParticipantInfo[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRequest {
  content: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const conversationsService = {
  /**
   * Get all conversations for current user
   */
  getConversations: async (): Promise<Conversation[]> => {
    const response = await apiClient.get<Conversation[]>('/conversations');
    return response.data;
  },
  
  /**
   * Get a specific conversation
   */
  getConversation: async (conversationId: string): Promise<Conversation> => {
    const response = await apiClient.get<Conversation>(`/conversations/${conversationId}`);
    return response.data;
  },
  
  /**
   * Start a new conversation with a user
   */
  startConversation: async (userId: string, message: MessageRequest): Promise<Conversation> => {
    const response = await apiClient.post<Conversation>(`/conversations/${userId}`, message);
    return response.data;
  },
  
  /**
   * Get messages in a conversation
   */
  getMessages: async (conversationId: string, page = 0, size = 20): Promise<PageResponse<Message>> => {
    const response = await apiClient.get<PageResponse<Message>>(`/conversations/${conversationId}/messages`, {
      params: { page, size }
    });
    return response.data;
  },
  
  /**
   * Send a message in a conversation
   */
  sendMessage: async (conversationId: string, message: MessageRequest): Promise<Message> => {
    const response = await apiClient.post<Message>(`/conversations/${conversationId}/messages`, message);
    return response.data;
  },
  
  /**
   * Mark conversation as read
   */
  markConversationAsRead: async (conversationId: string): Promise<void> => {
    await apiClient.put(`/conversations/${conversationId}/read`);
  }
};