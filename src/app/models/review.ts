export interface Review {
  _id: string;
  product: string;
  user: {
    _id: string;
    username: string;
  };
  rating: number;
  comment: string;
  createdAt: Date;
}