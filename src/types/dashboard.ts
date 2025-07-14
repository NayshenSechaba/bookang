
export interface Service {
  id: number;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: 'haircut' | 'color' | 'styling' | 'treatment';
  isActive: boolean;
  cancellationFee?: number; // Optional cancellation fee
  cancellationPolicy?: string; // Cancellation policy text
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  costPrice: number;
  weight: number; // in grams
  stock: number;
  category: 'shampoo' | 'conditioner' | 'styling' | 'treatment' | 'tools';
  isActive: boolean;
}

export interface PortfolioImage {
  id: number;
  url: string;
  title: string;
  description: string;
  category: 'haircut' | 'color' | 'styling' | 'treatment';
  dateAdded: string;
}

export interface Appointment {
  id: number;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'no-show' | 'completed';
  cost: string;
  commission: string;
  cancellationFeeCharged?: number;
  customerRating?: number; // 1-5 stars
  customerNotes?: string;
  noShowCount?: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalVisits: number;
  noShowCount: number;
  rating: number; // Average rating from hairdresser
  notes: string;
  flagged: boolean; // For problem customers
  lastVisit: string;
}

export interface CustomerReview {
  id: number;
  customerName: string;
  service: string;
  rating: number;
  comment: string;
  date: string;
}

export interface FinancialData {
  totalEarnings: string;
  monthlyCommission: string;
  pendingPayments: string;
  commissionRate: string;
  totalAppointments: number;
  averageRating: number;
}
