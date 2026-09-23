export * from './user';
export * from './product';
export * from './website';
export * from './order';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Upload Response
export interface UploadResponse {
  url: string;
  publicId: string;
  size?: number;
}