import { create } from 'zustand';
import axiosInstance from '../config/axios';
import {
  SchoolState,
  GetSchoolResponse,
  CreateSchoolRequest,
  UpdateSchoolRequest,
  UpdateSubscriptionRequest,
} from '../types/school';

export const useSchoolStore = create<SchoolState>((set, get) => ({
  schools: [],
  selectedSchoolDetails: null,
  isLoading: false,
  error: null,

  fetchSchools: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get('/School/get-all');
      const schools: GetSchoolResponse[] = response.data;
      set({ schools, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch schools';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchSchoolById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Web uses /School/get-by-id?id= (not /School/get/${id})
      const response = await axiosInstance.get(`/School/get-by-id?id=${id}`);
      // Web handles both response.data.data and response.data shapes
      const schoolDetails = response.data.data || response.data;
      set({ selectedSchoolDetails: schoolDetails, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch school details';
      set({ error: errorMessage, isLoading: false, selectedSchoolDetails: null });
    }
  },

  createSchool: async (school: CreateSchoolRequest) => {
    set({ isLoading: true, error: null });
    try {
      // Web uses FormData with multipart for file upload
      const formData = new FormData();
      formData.append('SchoolName', school.schoolName);
      formData.append('UserId', school.userId);

      if (school.schoolLogoFilePath) {
        formData.append('SchoolLogoFilePath', school.schoolLogoFilePath as any);
      }
      if (school.colorCode) formData.append('ColorCode', school.colorCode);
      if (school.address) formData.append('Address', school.address);
      if (school.phoneNumber) formData.append('PhoneNumber', school.phoneNumber);
      if (school.email) formData.append('Email', school.email);
      if (school.domain) formData.append('Domain', school.domain);

      await axiosInstance.post('/School/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Refresh list after creation (same as web)
      await get().fetchSchools();
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create school';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateSchool: async (school: UpdateSchoolRequest) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.put('/School/update', school);
      // Refresh list after update (same as web)
      await get().fetchSchools();
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update school';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateSchoolSubscription: async (data: UpdateSubscriptionRequest) => {
    set({ isLoading: true, error: null });
    try {
      // Web uses /Subscription/update-subscription (not /SchoolSubscription/update)
      await axiosInstance.put('/Subscription/update-subscription', data);

      // Optimistic UI update then background refresh (same as web)
      const current = get().selectedSchoolDetails;
      if (current) {
        useSchoolStore.setState({
          selectedSchoolDetails: {
            ...current,
            schoolSubscription: {
              ...current.schoolSubscription,
              allowedStudentCount: data.allowedStudentCount,
              registeredStudentCount: data.registeredStudentCount,
              amountPaid: data.amountPaid,
            },
          },
        });

        // Background refresh
        get().fetchSchoolById(data.id).catch(() => {});
      }

      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update subscription';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
