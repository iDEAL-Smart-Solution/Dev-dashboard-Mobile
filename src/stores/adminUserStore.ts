import { create } from 'zustand';
import axiosInstance from '../config/axios';
import {
  AdminUserState,
  GetAdminUserResponse,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
} from '../types/adminUser';

// Mirror the web's parseAdminUserName helper
const parseAdminUserName = (user: GetAdminUserResponse): GetAdminUserResponse => {
  const nameParts = user.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || nameParts[0] || '';
  return {
    ...user,
    firstName,
    lastName,
    role: 'Admin',
    // Do NOT default gender — preserve whatever the API returns (null/undefined/Male/Female)
    // Defaulting to 'Male' would make the Female stat always 0
  };
};

export const useAdminUserStore = create<AdminUserState>((set, get) => ({
  adminUsers: [],
  selectedAdminUser: null,
  isLoading: false,
  error: null,

  fetchAdminUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      // Web uses /AdminUser/get-all-admins
      const response = await axiosInstance.get('/AdminUser/get-all-admins');
      const users: GetAdminUserResponse[] = response.data;
      const parsedUsers = users.map(parseAdminUserName);
      set({ adminUsers: parsedUsers, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch admin users';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchAdminUserById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Web uses /AdminUser/get-admin/${id}
      const response = await axiosInstance.get(`/AdminUser/get-admin/${id}`);
      const singleUser = response.data;

      // Map to GetAdminUserResponse shape (same as web)
      const user: GetAdminUserResponse = {
        id: singleUser.id,
        name: `${singleUser.firstName} ${singleUser.lastName}`,
        schoolName: singleUser.schoolName,
        uin: singleUser.uin,
        phoneNumber: singleUser.phoneNumber,
        email: singleUser.email,
        password: singleUser.password || singleUser.passwordHash,
        firstName: singleUser.firstName,
        lastName: singleUser.lastName,
        gender: singleUser.gender,
        address: singleUser.address,
        schoolId: singleUser.schoolId,
        profilePictureUrl: singleUser.profilePictureUrl,
        role: 'Admin',
      };

      set({ selectedAdminUser: user, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch admin user details';
      set({ error: errorMessage, isLoading: false, selectedAdminUser: null });
    }
  },

  createAdminUser: async (userData: CreateAdminUserRequest) => {
    set({ isLoading: true, error: null });
    try {
      // Web uses FormData with multipart for file upload
      const formData = new FormData();
      formData.append('FirstName', userData.firstName);
      formData.append('LastName', userData.lastName);
      formData.append('Email', userData.email);
      formData.append('PhoneNumber', userData.phoneNumber);
      formData.append('Password', userData.password);
      formData.append('Gender', userData.gender);
      formData.append('Address', userData.address);
      formData.append('SchoolId', userData.schoolId);

      if (userData.profilePicture) {
        formData.append('ProfilePicture', userData.profilePicture as any);
      }

      await axiosInstance.post('/AdminUser/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Refresh list after creation (same as web)
      await get().fetchAdminUsers();
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create admin user';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateAdminUser: async (userData: UpdateAdminUserRequest) => {
    set({ isLoading: true, error: null });
    try {
      // Web calls the real API — not a mock
      await axiosInstance.put('/AdminUser/update', userData);

      // Refresh list and selected user (same as web)
      await get().fetchAdminUsers();

      if (get().selectedAdminUser?.id === userData.id) {
        await get().fetchAdminUserById(userData.id);
      }

      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update admin user';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
