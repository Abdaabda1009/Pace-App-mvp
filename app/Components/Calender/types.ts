// Subscription interface definition
export interface Subscription {
  id: string;
  name: string;
  icon: string;
  price: number;
  renewalDate: string;
  category: string;
  color: string;
}

// Date object interface for calendar grid
export interface DateObject {
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  dateString: string; // YYYY-MM-DD format
}
