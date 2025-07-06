
export interface Service {
  id: number;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: 'haircut' | 'color' | 'styling' | 'treatment';
  isActive: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
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
  status: string;
  cost: string;
  commission: string;
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
