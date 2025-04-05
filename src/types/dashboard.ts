export interface OrderStats {
  title: string;
  value: number;
  percentageChange: number;
  comparedTo: string;
}

export interface BestSeller {
  id: string;
  name: string;
  sales: number;
  amount: number;
}

export interface RecentOrder {
  id: string;
  product: string;
  orderId: string;
  date: string;
  customerName: string;
  status: 'delivered' | 'cancelled' | 'pending';
  amount: number;
}

export type TimeRange = 'WEEKLY' | 'MONTHLY' | 'YEARLY';