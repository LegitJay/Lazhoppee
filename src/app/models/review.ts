export interface Review {
  _id: string;
  product: { _id: string; name: string } | string;  // ✅ populated or plain ID
  user: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  rating: number;
  comment: string;
  createdAt: Date;
}