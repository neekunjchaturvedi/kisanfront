export interface Order {
  id: string;
  product: string;
  orderId: string;
  date: string;
  customerName: string;
  status: 'delivered' | 'cancelled' | 'pending';
  amount: number;
}

export interface OrderFilterOptions {
  dateRange: {
    from: Date;
    to: Date;
  };
  status?: 'delivered' | 'cancelled' | 'pending';
}