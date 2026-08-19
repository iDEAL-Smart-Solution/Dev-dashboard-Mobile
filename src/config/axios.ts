import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = "https://portal-api.idealsmartsolutions.com/api";

const isDevRole = (role?: string) => {
  const normalizedRole = role?.trim().toLowerCase();
  return normalizedRole === 'dev' || normalizedRole === 'developer';
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

const SUCCESS_METHODS = new Set(['post', 'put', 'patch', 'delete']);

const getResponseMessage = (data: any): string | undefined => {
  if (!data) return undefined;
  if (typeof data === 'string') return data;
  return data.message || data.details || data.error;
};

const isAuthLoginRequest = (config?: any) => {
  const requestUrl = String(config?.url || '').toLowerCase();
  return requestUrl.includes('/auth/login');
};

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    const schoolId = await AsyncStorage.getItem('SchoolId');
    const authStorage = await AsyncStorage.getItem('auth-storage');

    if (token && authStorage) {
      try {
        const parsedAuthStorage = JSON.parse(authStorage);
        const role = parsedAuthStorage?.state?.user?.role;

        if (role && !isDevRole(role)) {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('SchoolId');
          await AsyncStorage.removeItem('auth-storage');
          return Promise.reject(new Error('Access denied. Only Developer accounts can access this dashboard.'));
        }
      } catch {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('SchoolId');
        await AsyncStorage.removeItem('auth-storage');
        return Promise.reject(new Error('Invalid session data. Please login again.'));
      }
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (schoolId) {
      config.headers['SchoolID'] = schoolId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
