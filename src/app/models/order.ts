import { Product } from './product';
import { User } from './user';
import { Address } from './address';

export interface Order {
  _id?: string;
  buyer?: string | User;
  items: {
    product: Product | string;
    seller: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  shipping: Address;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}