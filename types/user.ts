export type UserRole = 'admin' | 'vendor' | 'customer';
export type VendorType = 'digital_products' | 'website_demo' | 'both';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  vendorType?: VendorType;
  isApprovedVendor: boolean;
  commissionRate: number;
  totalSales: number;
  totalEarnings: number;
  phone?: string;
  address?: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  vendorType?: VendorType;
  isApprovedVendor: boolean;
  commissionRate: number;
  totalSales: number;
  totalEarnings: number;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  vendorType?: VendorType;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}