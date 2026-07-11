export interface User {
  _id: string;
  email: string;
  username: string;
  role: 'customer' | 'pendingSeller' | 'storeOwner' | 'admin';
  profileImage?: string | null;
  storeDetails?: {
    storeName?: string;
    storeDescription?: string;
    storeAddress?: string;
    storeContact?: string;
    storeEmail?: string;
    location?: { lat: number; lng: number };
  };
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}