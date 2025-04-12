// Subscription interface definition
export interface Subscription {
  id: string;
  name: string;
  price: number;
  category: string;
  icon: string;
  color: string;
  renewalDate: string;
  billingCycle?: string;
  paymentMethod?: {
    type: string;
    lastFour?: string;
    expiryDate?: string;
  };
  notes?: string;
  logo?: string | null;
}

// Date object interface for calendar grid
export interface DateObject {
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  dateString: string; // YYYY-MM-DD format
}
