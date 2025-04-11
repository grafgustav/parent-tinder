// src/services/api/matchesService.ts
import apiClient from './apiClient';
import { UserProfile } from './userService';

export interface MatchScore {
  interestScore: number;
  ageCompatibilityScore: number;
  totalScore: number;
  commonInterests: string[];
}

export interface MatchResponse {
  id: string;
  matchedUser: UserProfile;
  matchScore: MatchScore;
  createdAt: string;
  isMutual: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const matchesService = {
  /**
   * Get potential matches for the user
   */
  getPotentialMatches: async (page = 0, size = 10): Promise<PageResponse<MatchResponse>> => {
    const response = await apiClient.get<PageResponse<MatchResponse>>('/matches', {
      params: { page, size }
    });
    return response.data;
  },
  
  /**
   * Get users who have matched with current user
   */
  getMyMatches: async (page = 0, size = 10): Promise<PageResponse<MatchResponse>> => {
    const response = await apiClient.get<PageResponse<MatchResponse>>('/matches/my-matches', {
      params: { page, size }
    });
    return response.data;
  },
  
  /**
   * Like/match with another user
   */
  createMatch: async (userId: string): Promise<MatchResponse> => {
    const response = await apiClient.post<MatchResponse>(`/matches/${userId}`);
    return response.data;
  },
  
  /**
   * Unlike/unmatch from another user
   */
  deleteMatch: async (userId: string): Promise<void> => {
    await apiClient.delete(`/matches/${userId}`);
  }
};