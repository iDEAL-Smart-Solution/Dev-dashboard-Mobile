import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../config/axios';
import { AuthState, LoginRequest } from '../types/auth';

const isDevRole = (role?: string) => {
  const normalizedRole = role?.trim().toLowerCase();
  return normalizedRole === 'dev' || normalizedRole === 'developer';
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post('/Auth/login', credentials);
      const { success, data, message } = response.data;

      if (success && data) {
        const { token, user } = data;

        if (!isDevRole(user.role)) {
          set({
            error: 'Access denied. Only Developer accounts can access this dashboard.',
            isLoading: false,
          });
          return false;
        }

        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('SchoolId', user.schoolId || '');
        await AsyncStorage.setItem('auth-storage', JSON.stringify({ state: { user, token } }));

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return true;
      } else {
        set({
          error: message || 'Login failed',
          isLoading: false,
          isAuthenticated: false,
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      return false;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('SchoolId');
    await AsyncStorage.removeItem('auth-storage');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
