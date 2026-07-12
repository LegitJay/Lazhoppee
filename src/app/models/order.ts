import { Product } from './product';
import { User } from './user';
import { Address } from './address';

export interface Order {
  _id?: string;
  buyer?: string | User;
  items: {
    product: Product | string | null;
    seller: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  shipping: Address;
  status?: string;
  courierId?: string;
  trackingHistory?: { status: string; note: string; updatedAt: string }[];
  createdAt?: string;
  updatedAt?: string;
}