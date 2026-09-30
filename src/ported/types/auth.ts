export type UserRole = "guest" | "member" | "donor" | "volunteer" | "beneficiary" | "admin";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  country?: string;
  createdAt: string;
  isEmailVerified: boolean;
  lastLoginAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  phone?: string;
  country?: string;
  acceptTerms: boolean;
}

export interface ApplicationRecord {
  id: string;
  userId: string;
  type: "aid-request" | "volunteer" | "donation";
  title: string;
  status: "pending" | "in-review" | "approved" | "completed" | "rejected";
  submittedAt: string;
  updatedAt: string;
  summary: string;
  referenceCode: string;
}

export interface DonationRecord {
  id: string;
  userId: string;
  amount: number;
  frequency: "one-time" | "monthly";
  pillar: string;
  status: "completed" | "pending" | "failed";
  date: string;
  referenceCode: string;
}
