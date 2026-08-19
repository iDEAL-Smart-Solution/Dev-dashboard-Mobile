export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string | null;
  gender: 'Male' | 'Female' | null;
  role: string;
  uin: string;
  password?: string;
  profilePictureUrl: string | null;
  schoolId: string | null;
  schoolName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetAdminUserResponse extends AdminUser {}

export interface AdminUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  gender: 'Male' | 'Female' | null;
  password?: string;
  profilePicture?: string | File | null;
  profilePictureUrl?: string | null;
  schoolId: string;
}

export interface CreateAdminUserRequest extends AdminUserFormData {
  password: string;
  schoolId: string;
}

export interface UpdateAdminUserRequest extends AdminUserFormData {
  id: string;
  schoolId: string;
}

export interface AdminUserState {
  adminUsers: GetAdminUserResponse[];
  selectedAdminUser: GetAdminUserResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchAdminUsers: () => Promise<void>;
  fetchAdminUserById: (id: string) => Promise<void>;
  createAdminUser: (user: CreateAdminUserRequest) => Promise<void>;
  updateAdminUser: (user: UpdateAdminUserRequest) => Promise<void>;
  clearError: () => void;
}
