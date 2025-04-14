export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  renewal_date: string;
  logo?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}
