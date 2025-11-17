export type UserType = 'owner' | 'renter';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: UserType;
  avatar?: string;
  rating: number;
  reviewCount: number;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  ownerRating: number;
  make: string;
  model: string;
  year: number;
  images: string[];
  description: string;
  pricePerDay: number;
  location: string;
  latitude: number;
  longitude: number;
  available: boolean;
  category: string;
  transmission: string;
  fuelType: string;
  seats: number;
  features: string[];
  rating: number;
  reviewCount: number;
}

export interface Booking {
  id: string;
  vehicleId: string;
  renterId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  serviceFee: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Review {
  id: string;
  bookingId: string;
  vehicleId: string;
  renterId: string;
  renterName: string;
  renterAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  name: string;
  type: 'monthly' | 'annual';
  price: number;
  serviceFee: number;
  features: string[];
}
