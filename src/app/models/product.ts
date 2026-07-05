export interface Product {
  _id?: string;        // seller products use this (ObjectId)
  id?: number;         // seed products use this (numeric)
  productId?: string;  // what the cart returns after adding
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  sellerId?: string;
  stock?: number;
  quantity?: number;
}