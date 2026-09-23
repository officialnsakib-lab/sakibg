import { IUser } from './user';

export type ProductStatus = 'pending' | 'approved' | 'rejected';
export type ProductCategory = 
  | 'template' 
  | 'software' 
  | 'ebook' 
  | 'graphics' 
  | 'music' 
  | 'course' 
  | 'other';

export interface IProduct {
  _id: string;
  vendorId: string | IUser;
  title: string;
  description: string;
  category: ProductCategory;
  price: number;
  fileUrl: string;
  fileId: string;
  thumbnailUrl?: string;
  thumbnailId?: string;
  fileSize?: string;
  downloadCount: number;
  sales: number;
  status: ProductStatus;
  rejectionReason?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFormData {
  title: string;
  description: string;
  category: ProductCategory;
  price: number;
  tags: string[];
  file?: File;
  thumbnail?: File;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}