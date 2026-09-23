import { IUser } from './user';

export type OrderStatus = 'pending' | 'completed' | 'refunded';
export type ProductType = 'digital' | 'website';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface IOrder {
  _id: string;
  orderId: string;
  buyerId: string | IUser;
  vendorId: string | IUser;
  productType: ProductType;
  productId: string;
  productTitle: string;
  price: number;
  commissionRate: number;
  commissionAmount: number;
  vendorAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  orderStatus: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommissionCalculation {
  totalPrice: number;
  commissionRate: number;
  commissionAmount: number;
  vendorAmount: number;
}