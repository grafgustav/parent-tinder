// src/services/api/userService.ts
import apiClient from './apiClient';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  location?: string;
  bio?: string;
  interests: string[];
  children: { id?: string; age: number }[];
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  location?: string;
  bio?: string;
  interests?: string[];
  children?: { age: number }[];
}

export const userService = {
  /**
   * Get current user's profile
   */
  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/users/me');
    return response.data;
  },
  
  /**
   * Update current user's profile
   */
  updateUserProfile: async (profileData: UserProfileUpdate): Promise<UserProfile> => {
    const response = await apiClient.put<UserProfile>('/users/me', profileData);
    return response.data;
  },
  
  /**
   * Upload profile image
   */
  uploadProfileImage: async (imageFile: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await apiClient.post<{ imageUrl: string }>('/users/me/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  /**
   * Delete profile image
   */
  deleteProfileImage: async (): Promise<void> => {
    await apiClient.delete('/users/me/image');
  }
};