export interface Address {
  _id?: string;
  fullName: string;
  phoneNumber: string;
  region: string;
  city: string;
  barangay: string;
  streetAddress: string;
  postalCode: string;
  isDefault?: boolean;
}