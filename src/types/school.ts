export interface School {
  id: string;
  schoolName: string;
  schoolLogoFilePath: string | null;
  colorCode: string | null;
  address: string | null;
  phoneNumber: string | null;
  email: string | null;
  domain: string | null;
  isSubscrptionActive: boolean;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetSchoolResponse extends School {
  planType?: string;
}

export interface SchoolDetails extends GetSchoolResponse {
  schoolSubscription: SchoolSubscription;
  planType: string;
}

export interface SchoolSubscription {
  id: string;
  schoolId: string;
  allowedStudentCount: number;
  registeredStudentCount: number;
  amountPaid: number;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolFormData {
  schoolName: string;
  schoolLogoFilePath: string | File | null;
  colorCode: string;
  address: string;
  phoneNumber: string;
  email: string;
  domain: string;
  isSubscrptionActive?: boolean;
  userId?: string;
}

export interface CreateSchoolRequest extends SchoolFormData {
  userId: string;
}

export interface UpdateSchoolRequest {
  id: string;
  schoolName: string;
  schoolLogoFilePath?: string;
  colorCode: string;
  address: string;
  phoneNumber: string;
  email: string;
  domain: string;
  isSubscrptionActive: boolean;
  userId: string;
}

export interface UpdateSubscriptionRequest {
  id: string;
  allowedStudentCount: number;
  registeredStudentCount: number;
  amountPaid: number;
}

export interface SchoolState {
  schools: GetSchoolResponse[];
  selectedSchoolDetails: SchoolDetails | null;
  isLoading: boolean;
  error: string | null;
  fetchSchools: () => Promise<void>;
  fetchSchoolById: (id: string) => Promise<void>;
  createSchool: (school: CreateSchoolRequest) => Promise<void>;
  updateSchool: (school: UpdateSchoolRequest) => Promise<void>;
  updateSchoolSubscription: (data: UpdateSubscriptionRequest) => Promise<void>;
  clearError: () => void;
}
