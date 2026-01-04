import { apiClient, publicApiClient } from '@/core';
import { type LoginResponse, type User, type GoogleAuthResponse } from '@/types';

export const login = async (credentials: {
  username: string;
  password: string;
}): Promise<LoginResponse> => {
  const response = await publicApiClient.post('/api/v1/auth/login', credentials);
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await apiClient.get('/api/v1/users/me');
  return response.data;
};

export const register = async (payload: {
  name: string;
  phoneNumber: string;
  email: string;
  username: string;
  password: string;
}) => {
  const response = await publicApiClient.post('/api/v1/auth/register', payload);
  return response.data;
};

// Google OAuth functions
export const getGoogleLoginUrl = async (redirectUri?: string): Promise<{ url: string }> => {
  const params = redirectUri ? `?redirect_uri=${encodeURIComponent(redirectUri)}` : '';
  const response = await publicApiClient.get(`/api/v1/auth/google/login${params}`);
  return response.data;
};

export const googleLoginWithCode = async (code: string, redirectUri?: string): Promise<GoogleAuthResponse> => {
  const response = await publicApiClient.post('/api/v1/auth/google/callback', {
    code,
    redirect_uri: redirectUri,
  });
  return response.data;
};

export const googleLoginWithToken = async (idToken: string): Promise<GoogleAuthResponse> => {
  const response = await publicApiClient.post('/api/v1/auth/google/token', {
    id_token: idToken,
  });
  return response.data;
};
