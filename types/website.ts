import { IUser } from './user';

export type WebsiteStatus = 'pending' | 'approved' | 'rejected';
export type WebsiteCategory = 
  | 'ecommerce' 
  | 'blog' 
  | 'portfolio' 
  | 'business' 
  | 'education' 
  | 'restaurant' 
  | 'realestate' 
  | 'other';

export interface IWebsiteDemo {
  _id: string;
  vendorId: string | IUser;
  websiteName: string;
  description: string;
  category: WebsiteCategory;
  demoUrl: string;
  price: number;
  thumbnailUrl?: string;
  thumbnailId?: string;
  technologies: string[];
  features: string[];
  sales: number;
  status: WebsiteStatus;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebsiteFormData {
  websiteName: string;
  description: string;
  category: WebsiteCategory;
  demoUrl: string;
  price: number;
  technologies: string[];
  features: string[];
  thumbnail?: File;
}